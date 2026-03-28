#!/usr/bin/env node
/**
 * 会话保存脚本
 * 保存当前会话状态和 SDD 流程进度
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

// SDD 阶段定义（更新为 7 阶段）
const SDD_PHASES = ['CLARIFY', 'SPEC', 'PLAN', 'TEST', 'IMPL', 'REVIEW', 'VERIFY'];

// 重试限制配置
const RETRY_LIMITS = {
  CLARIFY: 3,
  SPEC: 2,
  PLAN: 2,
  TEST: 3,
  IMPL: 5,
  REVIEW: 2
};

function getSessionDir() {
  const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const projectHash = crypto
    .createHash('md5')
    .update(projectDir)
    .digest('hex')
    .substring(0, 12);

  return path.join(os.homedir(), '.claude', 'sessions', projectHash);
}

function getProjectDirs() {
  const cwd = process.cwd();
  const claudeDir = path.join(cwd, '.claude');
  return {
    clarifications: path.join(claudeDir, 'clarifications'),
    specs: path.join(claudeDir, 'specs'),
    plans: path.join(claudeDir, 'plans'),
    tests: path.join(claudeDir, 'tests'),
    reviews: path.join(claudeDir, 'reviews')
  };
}

function findFiles(dir, pattern) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => pattern.test(f))
    .map(f => path.join(dir, f));
}

function detectCurrentPhase() {
  const dirs = getProjectDirs();

  // 检查各阶段文件是否存在
  const hasClarification = fs.existsSync(dirs.clarifications) && findFiles(dirs.clarifications, /\.md$/).length > 0;
  const hasSpec = fs.existsSync(dirs.specs) && findFiles(dirs.specs, /\.md$/).length > 0;
  const hasPlan = fs.existsSync(dirs.plans) && findFiles(dirs.plans, /\.md$/).length > 0;
  const hasTests = fs.existsSync(dirs.tests) && findFiles(dirs.tests, /\.(test|spec)\.(ts|js|py|java)$/).length > 0;
  const hasReview = fs.existsSync(dirs.reviews) && findFiles(dirs.reviews, /\.md$/).length > 0;

  // 推断当前阶段（按照流程顺序判断）
  // 如果所有产出物都存在，说明可能在进行 IMPL 或需要运行 VERIFY
  if (!hasClarification) return 'CLARIFY';
  if (!hasSpec) return 'SPEC';
  if (!hasPlan) return 'PLAN';
  if (!hasTests) return 'TEST';
  if (!hasReview) return 'REVIEW';

  // 如果所有文档都存在，可能在进行 IMPL 或准备 VERIFY
  return 'IMPL';
}

function generateNextStep(phase) {
  const steps = {
    'CLARIFY': '运行 /clarify 澄清需求',
    'SPEC': '运行 /spec 创建功能规范',
    'PLAN': '运行 /plan 生成实现计划',
    'TEST': '运行测试命令编写测试用例',
    'IMPL': '运行 /impl 实现代码',
    'REVIEW': '运行 /review 进行代码审查',
    'VERIFY': '运行 /verify 验证实现'
  };
  return steps[phase] || '运行 /status 查看状态';
}

function loadRetryCounts(sessionFile) {
  try {
    if (fs.existsSync(sessionFile)) {
      const content = fs.readFileSync(sessionFile, 'utf8');
      const session = JSON.parse(content);
      return session.retryCounts || {};
    }
  } catch (err) {
    // 忽略错误，返回空对象
  }
  return {};
}

function saveSession() {
  const sessionDir = getSessionDir();
  const sessionFile = path.join(sessionDir, 'latest.json');

  // 确保目录存在
  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
  }

  const dirs = getProjectDirs();
  const currentPhase = detectCurrentPhase();

  // 加载之前的重试计数
  const previousRetryCounts = loadRetryCounts(sessionFile);

  // 收集文件信息
  const clarificationFiles = findFiles(dirs.clarifications, /\.md$/);
  const specFiles = findFiles(dirs.specs, /\.md$/);
  const planFiles = findFiles(dirs.plans, /\.md$/);
  const testFiles = findFiles(dirs.tests, /\.(test|spec)\.(ts|js|py|java)$/);
  const reviewFiles = findFiles(dirs.reviews, /\.md$/);

  const session = {
    // 基本信息
    projectName: path.basename(process.cwd()),
    lastActivity: new Date().toISOString(),
    projectDir: process.cwd(),

    // SDD 流程状态
    sddState: {
      currentPhase: currentPhase,
      phaseStatus: {
        CLARIFY: clarificationFiles.length > 0 ? 'completed' : 'pending',
        SPEC: specFiles.length > 0 ? 'completed' : 'pending',
        PLAN: planFiles.length > 0 ? 'completed' : 'pending',
        TEST: testFiles.length > 0 ? 'completed' : 'pending',
        IMPL: 'pending',
        REVIEW: reviewFiles.length > 0 ? 'completed' : 'pending',
        VERIFY: 'pending'
      }
    },

    // 重试计数（持久化）
    retryCounts: previousRetryCounts,
    retryLimits: RETRY_LIMITS,

    // 文件信息
    files: {
      clarificationFile: clarificationFiles[0] || null,
      specFile: specFiles[0] || null,
      planFile: planFiles[0] || null,
      testFiles: testFiles,
      reviewFile: reviewFiles[0] || null,
      implFiles: []
    },

    // 下一步建议
    nextStep: generateNextStep(currentPhase)
  };

  try {
    fs.writeFileSync(sessionFile, JSON.stringify(session, null, 2));

    // 同时保存到项目目录
    const projectSessionFile = path.join(process.cwd(), '.claude', 'session.json');
    const projectClaudeDir = path.dirname(projectSessionFile);
    if (!fs.existsSync(projectClaudeDir)) {
      fs.mkdirSync(projectClaudeDir, { recursive: true });
    }
    fs.writeFileSync(projectSessionFile, JSON.stringify(session, null, 2));

    console.log('[SessionSave] 会话已保存');
    console.log(`[SessionSave] 当前阶段: ${currentPhase}`);
    console.log(`[SessionSave] 下一步: ${session.nextStep}`);
  } catch (err) {
    console.error('[SessionSave] 保存失败:', err.message);
  }

  // 输出原始输入（保持管道通畅）
  let input = '';
  process.stdin.on('data', chunk => input += chunk);
  process.stdin.on('end', () => {
    process.stdout.write(input);
  });
}

saveSession();