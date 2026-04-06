#!/usr/bin/env node
/**
 * 重置脚本
 * 删除生成的文档和会话状态
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

// ADC result 根目录
const ADC_BASE = path.join(process.cwd(), '.claude', 'adc-result', 'request');

/**
 * Recursively delete files matching pattern under dir
 */
function deleteFilesRecursive(dir, pattern) {
  const deleted = [];
  const errors = [];
  if (!fs.existsSync(dir)) return { deleted, errors };

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.')) {
          const subResult = deleteFilesRecursive(fullPath, pattern);
          deleted.push(...subResult.deleted);
          errors.push(...subResult.errors);
          // Remove empty directory
          try {
            if (fs.readdirSync(fullPath).length === 0) {
              fs.rmdirSync(fullPath);
            }
          } catch { /* ignore */ }
        }
      } else if (pattern.test(entry.name)) {
        fs.unlinkSync(fullPath);
        deleted.push(fullPath);
      }
    }
    // Remove empty directory
    try {
      if (fs.readdirSync(dir).length === 0) {
        fs.rmdirSync(dir);
      }
    } catch { /* ignore */ }
  } catch (err) {
    errors.push({ file: dir, error: err.message });
  }

  return { deleted, errors };
}

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
 * 删除所有生成的文档
 */
function resetDocs() {
  const results = { deleted: [], errors: [] };

  if (!fs.existsSync(ADC_BASE)) {
    console.log('[ResetDocs] 未找到 adc-result 目录，跳过');
    return results;
  }

  console.log('[ResetDocs] 开始删除 .claude/adc-result/request/ 下生成的文档...');

  const dirConfigs = [
    { subdir: 'clarifications', pattern: /\.md$/ },
    { subdir: 'spec.md', pattern: /^spec\.md$/ },
    { subdir: 'plan.md', pattern: /^plan\.md$/ },
    { subdir: 'constraint-tree.yaml', pattern: /\.yaml$/ },
    { subdir: 'review.md', pattern: /^review\.md$/ },
    { subdir: 'summaries', pattern: /\.md$/ },
    { subdir: 'reports', pattern: /\.(md|json)$/ }
  ];

  // Scan all request subdirectories
  try {
    const requestDirs = fs.readdirSync(ADC_BASE, { withFileTypes: true })
      .filter(e => e.isDirectory() && !e.name.startsWith('.'))
      .map(e => path.join(ADC_BASE, e.name, e.name));

    for (const config of dirConfigs) {
      for (const reqDir of requestDirs) {
        const targetPath = path.join(reqDir, config.subdir);
        const { deleted, errors } = deleteFilesRecursive(targetPath, config.pattern);
        results.deleted.push(...deleted);
        results.errors.push(...errors);
      }
    }
  } catch (err) {
    results.errors.push({ file: ADC_BASE, error: err.message });
  }

  return results;
}

/**
 * 删除会话状态文件
 */
function resetSession() {
  const results = { deleted: [], errors: [] };

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