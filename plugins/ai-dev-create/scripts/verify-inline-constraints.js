/**
 * verify-inline-constraints.js
 *
 * Lightweight constraint verification for /tdd-quick inline constraints.
 * Parses tasks/constraints-inline.md and verifies each referenced function exists in codebase.
 *
 * Usage: node verify-inline-constraints.js [constraints-inline.md]
 *
 * Format:
 *   - [ ] C1: constraint description → 实现：functionName
 *   - [x] C2: constraint description → 实现：anotherFunc
 *
 * No dependencies — uses Node.js built-ins + grep.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const constraintsPath = process.argv[2] || path.resolve('tasks/constraints-inline.md');

if (!fs.existsSync(constraintsPath)) {
  console.error(`错误: 找不到内联约束文件 ${constraintsPath}`);
  process.exit(1);
}

const content = fs.readFileSync(constraintsPath, 'utf8');

// Parse inline constraints
// Matches: - [ ] C1: ... → 实现：`funcName()` or - [x] C2: ...
const constraintPattern = /^-\s+\[[ xX]\]\s+\S+\s*(.*?)(?:→|→)\s*实现[：:]\s*(.+)$/gm;
const rows = [];
let match;

while ((match = constraintPattern.exec(content)) !== null) {
  const description = match[1].trim();
  const implRef = match[2].trim().replace(/[`"']/g, '');

  // Extract function name from implementation reference
  const funcNameMatch = implRef.match(/([a-zA-Z_$][a-zA-Z0-9_$]*)/);
  const funcName = funcNameMatch ? funcNameMatch[1] : implRef;

  const checked = match[0].includes('[x]') || match[0].includes('[X]');

  rows.push({
    constraint_raw: match[0],
    description,
    function_name: funcName,
    impl_ref: implRef,
    checked,
    exists: false,
    matched_file: ''
  });
}

if (rows.length === 0) {
  console.log('警告: 内联约束文件中没有找到任何约束。');
  console.log('格式应为: - [ ] C1: 约束描述 → 实现：functionName');
  process.exit(0);
}

// Verify each function exists in codebase
const allExtensions = '*.ts,*.js,*.py,*.java,*.tsx,*.jsx,*.go,*.rs,*.rb';

for (const row of rows) {
  try {
    const result = execSync(
      `grep -rl "${escapeShell(row.function_name)}" --include="*.ts" --include="*.js" --include="*.py" --include="*.java" --include="*.tsx" --include="*.jsx" --include="*.go" --include="*.rs" --include="*.rb" . 2>/dev/null | head -1`,
      { encoding: 'utf8', timeout: 5000 }
    ).trim();
    row.exists = result.length > 0;
    row.matched_file = result;
  } catch {
    row.exists = false;
  }
}

// Generate report
const total = rows.length;
const pass = rows.filter(r => r.exists).length;
const fail = total - pass;
const checkedCount = rows.filter(r => r.checked).length;

let md = `# 内联约束覆盖验证\n\n`;
md += `## 概览\n\n`;
md += `- 总计: ${total}\n`;
md += `- 已实现: ${pass}\n`;
md += `- 缺失: ${fail}\n`;
md += `- 标记完成: ${checkedCount}\n`;

if (fail > 0) {
  md += `\n- ❌ 有 ${fail} 条约束尚未找到对应函数实现\n`;
}

md += `\n`;
md += `| 约束 | 描述 | 函数 | 存在 | 状态 |\n`;
md += `|------|------|------|------|------|\n`;

for (const row of rows) {
  md += `| ${extractConstraintId(row.constraint_raw)} | ${row.description} | \`${row.function_name}\` | ${row.exists ? '✅' : '❌'} | ${row.exists ? 'PASS' : 'FAIL'} |\n`;
}

const reportDir = path.join(findProjectRoot(constraintsPath), '.claude/reports');
fs.mkdirSync(reportDir, { recursive: true });
const reportPath = path.join(reportDir, 'inline-constraint-coverage.md');
fs.writeFileSync(reportPath, md, 'utf8');

console.log(md);
console.log(`\n报告已写入: ${reportPath}`);

if (fail > 0) {
  process.exit(1);
}

// ---------- 工具函数 ----------

function extractConstraintId(raw) {
  const m = raw.match(/\]\s+(\S+)/);
  return m ? m[1] : '-';
}

function escapeShell(str) {
  return str.replace(/["`$\\]/g, '\\$&');
}

function findProjectRoot(fromFile) {
  let dir = path.resolve(path.dirname(fromFile));
  while (dir !== path.parse(dir).root) {
    if (fs.existsSync(path.join(dir, 'package.json')) ||
        fs.existsSync(path.join(dir, 'pyproject.toml')) ||
        fs.existsSync(path.join(dir, '.git')) ||
        fs.existsSync(path.join(dir, 'tasks'))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return process.cwd();
}
