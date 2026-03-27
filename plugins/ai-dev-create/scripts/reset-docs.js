#!/usr/bin/env node
/**
 * 重置脚本
 * 删除生成的文档和会话状态
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

// 生成的文档目录
const DOC_DIRS = ['clarifications', 'specs', 'plans', 'tests', 'reviews'];

// 文件匹配模式
const FILE_PATTERNS = {
  clarifications: /\.md$/,
  specs: /\.md$/,
  plans: /\.md$/,
  tests: /\.(test|spec)\.(ts|js|py|java|go|rs)$/,
  reviews: /\.md$/
};

/**
 * 获取会话目录
 */
function getSessionDir() {
  const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const projectHash = crypto
    .createHash('md5')
    .update(projectDir)
    .digest('hex')
    .substring(0, 12);

  return path.join(os.homedir(), '.claude', 'sessions', projectHash);
}

/**
 * 删除目录中的匹配文件
 */
function deleteFilesInDir(dir, pattern) {
  const deleted = [];
  const errors = [];

  if (!fs.existsSync(dir)) {
    return { deleted, errors };
  }

  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      try {
        const stat = fs.statSync(filePath);
        if (stat.isFile() && pattern.test(file)) {
          fs.unlinkSync(filePath);
          deleted.push(filePath);
        }
      } catch (err) {
        errors.push({ file: filePath, error: err.message });
      }
    }
    // 如果目录为空，删除目录
    const remaining = fs.readdirSync(dir);
    if (remaining.length === 0) {
      fs.rmdirSync(dir);
    }
  } catch (err) {
    errors.push({ file: dir, error: err.message });
  }

  return { deleted, errors };
}

/**
 * 删除所有生成的文档
 */
function resetDocs() {
  const results = {
    deleted: [],
    errors: []
  };

  console.log('[ResetDocs] 开始删除生成的文档...');

  for (const dirName of DOC_DIRS) {
    const dir = path.join(process.cwd(), dirName);
    const pattern = FILE_PATTERNS[dirName];
    const { deleted, errors } = deleteFilesInDir(dir, pattern);

    results.deleted.push(...deleted);
    results.errors.push(...errors);
  }

  return results;
}

/**
 * 删除会话状态文件
 */
function resetSession() {
  const results = {
    deleted: [],
    errors: []
  };

  console.log('[ResetSession] 开始删除会话状态...');

  // 删除用户级会话文件
  const sessionDir = getSessionDir();
  const userSessionFile = path.join(sessionDir, 'latest.json');
  if (fs.existsSync(userSessionFile)) {
    try {
      fs.unlinkSync(userSessionFile);
      results.deleted.push(userSessionFile);
    } catch (err) {
      results.errors.push({ file: userSessionFile, error: err.message });
    }
  }

  // 删除项目级会话文件
  const projectSessionFile = path.join(process.cwd(), '.claude', 'session.json');
  if (fs.existsSync(projectSessionFile)) {
    try {
      fs.unlinkSync(projectSessionFile);
      results.deleted.push(projectSessionFile);
    } catch (err) {
      results.errors.push({ file: projectSessionFile, error: err.message });
    }
  }

  return results;
}

/**
 * 输出结果
 */
function outputResults(results, type) {
  if (results.deleted.length > 0) {
    console.log(`\n[Reset ${type}] 已删除 ${results.deleted.length} 个文件:`);
    results.deleted.forEach(f => console.log(`  - ${f}`));
  }

  if (results.errors.length > 0) {
    console.log(`\n[Reset ${type}] 删除失败 ${results.errors.length} 个文件:`);
    results.errors.forEach(e => console.log(`  - ${e.file}: ${e.error}`));
  }

  if (results.deleted.length === 0 && results.errors.length === 0) {
    console.log(`[Reset ${type}] 没有找到需要删除的文件`);
  }
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);

  const resetAll = args.includes('--all') || args.includes('-a') || args.length === 0;
  const resetDocsOnly = args.includes('--docs') || args.includes('-d');
  const resetSessionOnly = args.includes('--session') || args.includes('-s');

  console.log('='.repeat(50));
  console.log('AI Dev Create - 重置工具');
  console.log('='.repeat(50));

  let totalDeleted = 0;
  let totalErrors = 0;

  if (resetAll || resetDocsOnly) {
    const results = resetDocs();
    outputResults(results, 'Docs');
    totalDeleted += results.deleted.length;
    totalErrors += results.errors.length;
  }

  if (resetAll || resetSessionOnly) {
    const results = resetSession();
    outputResults(results, 'Session');
    totalDeleted += results.deleted.length;
    totalErrors += results.errors.length;
  }

  console.log('\n' + '='.repeat(50));
  console.log(`重置完成: 删除 ${totalDeleted} 个文件, 失败 ${totalErrors} 个`);
  console.log('='.repeat(50));

  // 输出原始输入（保持管道通畅）
  let input = '';
  process.stdin.on('data', chunk => input += chunk);
  process.stdin.on('end', () => {
    if (input) {
      process.stdout.write(input);
    }
  });
}

main();
