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
  REVIEW: 2,
  VERIFY: 2
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

function getProjectDirs(requestName) {
  const cwd = process.cwd();
  const requestBase = path.join(cwd, '.claude', 'adc-result', 'request');
  const targetDir = requestName ? path.join(requestBase, requestName) : requestBase;
  const isScoped = !!requestName;
  return {
    adcResult: targetDir,
    clarifications: isScoped ? path.join(targetDir, 'clarifications') : targetDir,
    specs: targetDir,
    plans: targetDir,
    tests: cwd,
    reviews: isScoped ? path.join(targetDir, 'reviews') : targetDir
  };
}

/**
 * Recursively find files matching pattern in directory and all subdirectories
 * Skips hidden directories (starting with .)
 * When relPath is provided internally, matches relative paths against pattern
 */
function findFilesRecursive(dir, pattern, relPath) {
  if (!fs.existsSync(dir)) return [];
  let results = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const entryRel = relPath ? path.join(relPath, entry.name) : entry.name;
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.')) { // Skip hidden dirs
          results = results.concat(findFilesRecursive(fullPath, pattern, entryRel));
        }
      } else if (pattern.test(entryRel)) {
        results.push(fullPath);
      }
    }
  } catch {
    // ignore permission errors
  }
  return results;
}

function findLatestFile(baseDir, subdir, pattern) {
  const dir = path.join(baseDir, subdir);
  if (!fs.existsSync(dir)) return null;
  return findFilesRecursive(dir, pattern).sort().pop() || null;
}

function findFiles(dir, pattern) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => pattern.test(f))
    .map(f => path.join(dir, f));
}

function detectCurrentPhase() {
  // 优先策略: 读取 session.json 中持久化的 phase 字段，并提取 requestName
  const projectSessionFile = path.join(process.cwd(), '.claude', 'session.json');
  let requestName = null;
  if (fs.existsSync(projectSessionFile)) {
    try {
      const existing = JSON.parse(fs.readFileSync(projectSessionFile, 'utf8'));
      // 始终提取 requestName 供回退策略使用
      requestName = existing.sddState?.requestName || null;
      if (existing.sddState && existing.sddState.currentPhase) {
        const phase = existing.sddState.currentPhase;
        if (SDD_PHASES.includes(phase)) {
          return phase;
        }
      }
    } catch {
      // session.json 损坏, 退回到文件启发式检测
    }
  }

  // 回退策略: 基于文件存在的启发式检测（按需求作用域递归扫描）
  const dirs = getProjectDirs(requestName);

  // scoped 模式下目录已是 clarifications/，正则不需要前缀
  const clarPattern = requestName ? /.*\.md$/ : /clarifications\/.*\.md$/;
  const clarificationFiles = findFilesRecursive(dirs.clarifications, clarPattern);
  const specFiles = findFilesRecursive(dirs.specs, /spec\.md$/);
  const planFiles = findFilesRecursive(dirs.plans, /plan\.md$/);
  const reviewFiles = findFilesRecursive(dirs.reviews, /review\.md$/);

  const hasClarification = clarificationFiles.length > 0;
  const hasSpec = specFiles.length > 0;
  const hasPlan = planFiles.length > 0;
  const hasReview = reviewFiles.length > 0;

  // 检查是否有测试文件但未通过测试（TEST 阶段）
  const testFiles = findFilesRecursive(process.cwd(), /(__tests__\/|\.test\.(ts|js|tsx|mjs)|\.spec\.(ts|js|tsx|mjs)|test_.*\.py|.*_test\.go|.*\.test\.java)$/);
  const hasTestFiles = testFiles.length > 0;

  // 推断当前阶段（按照流程顺序判断）
  if (!hasClarification) return 'CLARIFY';
  if (!hasSpec) return 'SPEC';
  if (!hasPlan) return 'PLAN';
  // TEST 阶段：计划已存在、未审查、测试文件不存在或需要编写新测试
  if (!hasReview && !hasTestFiles) return 'TEST';
  if (!hasReview) return 'IMPL';

  // review 已存在，检查是否有验证报告
  const reportsDir = requestName
    ? path.join(process.cwd(), '.claude', 'adc-result', 'request', requestName)
    : path.join(process.cwd(), '.claude', 'adc-result', 'request');
  const hasVerifyReport = findFilesRecursive(reportsDir, /constraint-coverage\.md$/).length > 0;
  if (hasVerifyReport) return 'VERIFY';

  return 'REVIEW';
}

function generateNextStep(phase) {
  const steps = {
    'CLARIFY': '运行 /ai-dev-create:clarify 澄清需求',
    'SPEC': '运行 /ai-dev-create:spec 创建功能规范',
    'PLAN': '运行 /ai-dev-create:plan 生成实现计划',
    'TEST': '运行测试命令编写测试用例',
    'IMPL': '运行 /ai-dev-create:impl 实现代码',
    'REVIEW': '运行 /ai-dev-create:review 进行代码审查',
    'VERIFY': '运行 /ai-dev-create:verify 验证实现'
  };
  return steps[phase] || '运行 /ai-dev-create:status 查看状态';
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

  // 尝试从已有 session.json 提取 requestName
  let requestName = null;
  const projectSessionFile = path.join(process.cwd(), '.claude', 'session.json');
  if (fs.existsSync(projectSessionFile)) {
    try {
      const existing = JSON.parse(fs.readFileSync(projectSessionFile, 'utf8'));
      requestName = existing.sddState?.requestName || null;
    } catch {
      // 忽略
    }
  }

  const dirs = getProjectDirs(requestName);
  const currentPhase = detectCurrentPhase();

  // 加载之前的重试计数
  const previousRetryCounts = loadRetryCounts(sessionFile);

  // 收集文件信息（使用递归扫描新目录结构）
  const clarPattern = requestName ? /.*\.md$/ : /clarifications\/.*\.md$/;
  const clarificationFiles = findFilesRecursive(dirs.clarifications, clarPattern);
  const specFiles = findFilesRecursive(dirs.specs, /spec\.md$/);
  const planFiles = findFilesRecursive(dirs.plans, /plan\.md$/);
  const reviewFiles = findFilesRecursive(dirs.reviews, /review\.md$/);

  const session = {
    // 基本信息
    projectName: path.basename(process.cwd()),
    lastActivity: new Date().toISOString(),
    projectDir: process.cwd(),

    // SDD 流程状态
    sddState: {
      requestName: requestName || 'unknown',
      currentPhase: currentPhase,
      phaseStatus: {
        CLARIFY: clarificationFiles.length > 0 ? 'completed' : 'pending',
        SPEC: specFiles.length > 0 ? 'completed' : 'pending',
        PLAN: planFiles.length > 0 ? 'completed' : 'pending',
        TEST: 'pending',
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
      clarificationFiles: clarificationFiles,
      specFile: specFiles[0] || null,
      planFile: planFiles[0] || null,
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