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

function main() {
  const session = loadSession();

  if (session) {
    console.log('[SessionStart] 已加载上次会话状态');
    console.log('[SessionStart] 项目:', session.projectName || '未知');
    console.log('[SessionStart] 上次活动:', session.lastActivity || '未知');
  } else {
    console.log('[SessionStart] 未找到上次会话，开始新会话');
  }

  // 输出原始输入（保持管道通畅）
  let input = '';
  process.stdin.on('data', chunk => input += chunk);
  process.stdin.on('end', () => {
    process.stdout.write(input);
  });
}

main();