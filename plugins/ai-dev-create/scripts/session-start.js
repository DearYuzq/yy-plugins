#!/usr/bin/env node
/**
 * 会话开始脚本
 * 加载上次会话状态和项目上下文
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

function getSessionDir() {
  const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const projectHash = require('crypto')
    .createHash('md5')
    .update(projectDir)
    .digest('hex')
    .substring(0, 12);

  return path.join(os.homedir(), '.claude', 'sessions', projectHash);
}

function loadSession() {
  const sessionDir = getSessionDir();
  const sessionFile = path.join(sessionDir, 'latest.json');

  if (!fs.existsSync(sessionFile)) {
    return null;
  }

  try {
    const content = fs.readFileSync(sessionFile, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error('[SessionStart] 无法加载会话:', err.message);
    return null;
  }
}

function loadLessons() {
  const cwd = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const lessonsFile = path.join(cwd, '.claude', 'adc-result', 'experience', 'lessons.md');

  if (!fs.existsSync(lessonsFile)) {
    return null;
  }

  try {
    const content = fs.readFileSync(lessonsFile, 'utf8');

    // 提取 "Rules to Always Follow" 部分
    const rulesMatch = content.match(/## Rules to Always Follow\n([\s\S]*?)(?=##|$)/);
    const rules = rulesMatch
      ? rulesMatch[1]
          .split('\n')
          .filter(line => line.trim().startsWith('-') || /^\d+\. /.test(line.trim()))
          .slice(0, 10)
      : [];

    // 提取过去犯过的错误数量
    const mistakesMatch = content.match(/\|\s*\d{4}-/g);
    const mistakeCount = mistakesMatch ? mistakesMatch.length : 0;

    return { rules, mistakeCount, file: lessonsFile };
  } catch (err) {
    return null;
  }
}

function main() {
  const session = loadSession();
  const lessons = loadLessons();

  if (session) {
    console.log('[SessionStart] 已加载上次会话状态');
    console.log('[SessionStart] 项目:', session.projectName || '未知');
    console.log('[SessionStart] 上次活动:', session.lastActivity || '未知');
    console.log('[SessionStart] 上次阶段:', session.sddState?.currentPhase || '未知');
  } else {
    console.log('[SessionStart] 未找到上次会话，开始新会话');
  }

  if (lessons) {
    console.log(`\n[Lessons] 发现 ${lessons.mistakeCount} 条过往教训`);
    if (lessons.rules.length > 0) {
      console.log('[Lessons] 关键规则：');
      lessons.rules.forEach(rule => console.log(`  ${rule.trim()}`));
    }
  } else {
    console.log('[Lessons] 未找到 lessons.md，首次会话');
  }

  // 输出原始输入（保持管道通畅）
  let input = '';
  process.stdin.on('data', chunk => input += chunk);
  process.stdin.on('end', () => {
    process.stdout.write(input);
  });
}

main();
