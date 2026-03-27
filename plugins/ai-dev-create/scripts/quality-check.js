#!/usr/bin/env node
/**
 * 轻量质量检查脚本
 * 检查常见问题
 */

const fs = require('fs');

function checkConsoleLog(filePath) {
  if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return null;

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('console.log') && !line.trim().startsWith('//')) {
      return {
        file: filePath,
        line: i + 1,
        message: '发现 console.log，提交前请移除'
      };
    }
  }

  return null;
}

function checkHardcodedSecrets(filePath) {
  if (!filePath.match(/\.(ts|tsx|js|jsx|py|java)$/)) return null;

  const content = fs.readFileSync(filePath, 'utf8');
  const patterns = [
    /sk-[a-zA-Z0-9]{20,}/,  // OpenAI keys
    /api_key\s*=\s*['"][^'"]+['"]/,
    /password\s*=\s*['"][^'"]+['"]/
  ];

  for (const pattern of patterns) {
    if (pattern.test(content)) {
      return {
        file: filePath,
        message: '可能存在硬编码的敏感信息'
      };
    }
  }

  return null;
}

function main() {
  // 从环境变量获取文件路径
  const filePath = process.env.file_path || process.argv[2];

  if (!filePath || !fs.existsSync(filePath)) {
    process.exit(0);
  }

  const issues = [];

  const consoleIssue = checkConsoleLog(filePath);
  if (consoleIssue) issues.push(consoleIssue);

  const secretIssue = checkHardcodedSecrets(filePath);
  if (secretIssue) issues.push(secretIssue);

  if (issues.length > 0) {
    console.log('[QualityCheck] 发现问题:');
    issues.forEach(issue => {
      if (issue.line) {
        console.log(`  - ${issue.file}:${issue.line}: ${issue.message}`);
      } else {
        console.log(`  - ${issue.file}: ${issue.message}`);
      }
    });
  }

  // 输出原始输入（保持管道通畅）
  let input = '';
  process.stdin.on('data', chunk => input += chunk);
  process.stdin.on('end', () => {
    process.stdout.write(input);
  });
}

main();