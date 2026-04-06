/**
 * verify-constraints.js
 *
 * 读取约束树 YAML，验证每条约束在实现代码中有对应函数。
 *
 * 用法：node verify-constraints.js {constraint-tree.yaml 路径}
 *
 * 流程：
 *   1. 解析 constraint-tree.yaml
 *   2. 对每个 functions[].signature，在代码库中验证存在
 *   3. 生成 .claude/reports/constraint-coverage.md 覆盖报告
 *
 * 无需任何依赖 — 使用 Node.js 内置模块 + 子进程调用 grep。
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ---------- 改进的 YAML 解析器 ----------

// 只支持 constraint-tree.yaml 模板需要的 YAML 子集。
// 关键规则:
//   - 列表项 "- key: val" 的后续 sibling key 出现在更深缩进且无 "- "
//   - 对象 key: 的后续嵌套块出现在更深缩进
// 不支持: 锚点/别名, 流式集合, 制表符, 复杂多行标量

function simpleYamlParse(text) {
  // 预处理
  text = text.replace(/[ \t]+$/gm, '').replace(/\\\n/g, ' ');
  // 过滤掉空行和注释行, 但保留缩进信息
  const entries = [];
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const indent = line.length - line.trimStart().length;
    const content = line.trimStart();
    entries.push({ indent, content, isList: content.startsWith('- ') || content === '-' });
  }

  function tryParseScalar(str) {
    str = str.trim();
    if (!str || str === 'null' || str === '~') return null;
    if (str === 'true') return true;
    if (str === 'false') return false;
    if (/^-?\d+$/.test(str)) return parseInt(str, 10);
    if (/^-?\d+\.\d+$/.test(str)) return parseFloat(str);
    if (str.startsWith('"') && str.endsWith('"')) {
      try { return JSON.parse(str); } catch { return str.slice(1, -1); }
    }
    if (str.startsWith("'") && str.endsWith("'")) {
      return str.slice(1, -1).replace(/''/g, "'");
    }
    if (str.startsWith('[') && str.endsWith(']')) {
      // 简单内联数组
      return str.slice(1, -1).split(',').map(s => tryParseScalar(s.trim()));
    }
    return str;
  }

  // 解析从 pos 开始的、属于某个缩进块的所有行
  // 返回 { value, nextPos }
  // 判断是数组还是对象: 看第一条是不是 "- "
  function parseBlock(pos, expectedIndent) {
    if (pos >= entries.length || entries[pos].indent < expectedIndent) {
      return { value: null, nextPos: pos };
    }

    const isList = entries[pos].isList;

    if (isList) {
      const arr = [];
      while (pos < entries.length && entries[pos].indent >= expectedIndent && entries[pos].isList) {
        if (entries[pos].indent > expectedIndent) {
          // 缩进不对, 说明这不属于当前层级
          break;
        }
        const content = entries[pos].content;
        const itemStr = content === '-' ? '' : content.slice(2);
        pos++;

        if (!itemStr) {
          // "- " 后无内容, 下一行缩进更深, 是该条目的值
          if (pos < entries.length && entries[pos].indent > expectedIndent) {
            const child = parseBlock(pos, entries[pos].indent);
            arr.push(child.value);
            pos = child.nextPos;
          } else {
            arr.push(null);
          }
        } else {
          // "- key: value" 或 "- value"
          const kvMatch = itemStr.match(/^([^:]+?):\s*(.*)$/);
          if (kvMatch) {
            const obj = {};
            const key = kvMatch[1].trim();
            const val = kvMatch[2].trim();

            if (!val) {
              // 嵌套: 收集更深的子行
              if (pos < entries.length && entries[pos].indent > expectedIndent) {
                const child = parseBlock(pos, entries[pos].indent);
                obj[key] = child.value;
                pos = child.nextPos;
              } else {
                obj[key] = null;
              }
            } else {
              obj[key] = tryParseScalar(val);
            }

            // 收集该对象的其他 sibling key
            // sibling key 的缩进应该 > expectedIndent 且不是 list item
            while (pos < entries.length && !entries[pos].isList && entries[pos].indent > expectedIndent) {
              const siblingIndent = entries[pos].indent;
              const sibling = parseBlock(pos, siblingIndent);
              // sibling.value 应该是单个 key-value 对象
              if (sibling.value && typeof sibling.value === 'object' && !Array.isArray(sibling.value)) {
                Object.assign(obj, sibling.value);
              }
              pos = sibling.nextPos;
            }

            arr.push(obj);
          } else {
            // 纯值项
            arr.push(tryParseScalar(itemStr));
          }
        }
      }
      return { value: arr, nextPos: pos };
    } else {
      // 对象节点
      const obj = {};
      while (pos < entries.length && !entries[pos].isList && entries[pos].indent >= expectedIndent) {
        if (entries[pos].indent > expectedIndent) {
          break; // 缩进跳级, 说明已经不属于本层
        }
        const content = entries[pos].content;
        const kvMatch = content.match(/^([^:]+?):\s*(.*)$/);
        if (!kvMatch) { pos++; continue; } // 跳过不匹配的行

        const key = kvMatch[1].trim();
        const val = kvMatch[2].trim();
        pos++;

        if (!val) {
          // 嵌套块
          if (pos < entries.length && entries[pos].indent > expectedIndent) {
            const child = parseBlock(pos, entries[pos].indent);
            obj[key] = child.value;
            pos = child.nextPos;
          } else {
            obj[key] = null;
          }
        } else {
          obj[key] = tryParseScalar(val);
        }
      }
      return { value: obj, nextPos: pos };
    }
  }

  if (entries.length === 0) return {};
  const result = parseBlock(0, entries[0].indent);
  return result.value || {};
}


// ---------- 主逻辑 ----------

const yamlPath = process.argv[2];
if (!yamlPath) {
  console.error('用法: node verify-constraints.js {constraint-tree.yaml 路径}');
  process.exit(1);
}

if (!fs.existsSync(yamlPath)) {
  console.error(`错误: 找不到文件 ${yamlPath}`);
  process.exit(1);
}

const yamlText = fs.readFileSync(yamlPath, 'utf8');
const parsed = simpleYamlParse(yamlText);
const tree = parsed.constraint_tree || parsed;

// 递归收集所有 feature -> module -> function 条目
function collectFunctions(node, path, results) {
  if (!node || typeof node !== 'object') return;

  if (Array.isArray(node)) {
    node.forEach((item, idx) => collectFunctions(item, path, results));
    return;
  }

  // Detect function entries (have signature or constraint_ids)
  if (node.signature) {
    results.push({
      signature: node.signature,
      constraint_ids: Array.isArray(node.constraint_ids) ? node.constraint_ids : (node.constraint_id ? [node.constraint_id] : []),
      tests: Array.isArray(node.tests) ? node.tests : [],
      module: findModuleName(tree) || '',
      testsCount: Array.isArray(node.tests) ? node.tests.length : 0
    });
    return;
  }

  // Recurse into children
  for (const key of Object.keys(node)) {
    const child = node[key];
    if (Array.isArray(child)) {
      child.forEach(item => collectFunctions(item, [...path, key], results));
    } else if (child && typeof child === 'object') {
      collectFunctions(child, [...path, key], results);
    }
  }
}

// Helper to find module name for a function by traversing up
function findModuleName(node, target) {
  if (!node || typeof node !== 'object') return '';
  if (Array.isArray(node)) {
    for (const item of node) {
      const result = findModuleName(item, target);
      if (result) return result;
    }
  }
  if (node._isModule && node === target) return node.name || '';
  for (const key of Object.keys(node)) {
    if (key === 'name' && typeof node[key] === 'string') return node[key];
  }
  return '';
}

const functions = [];
collectFunctions(tree, [], functions);

if (functions.length === 0) {
  console.log('警告: 约束树中没有找到任何函数定义，跳过验证。');
  process.exit(0);
}

// 确定项目根目录
const projectRoot = findProjectRoot(yamlPath);
const reportDir = path.join(projectRoot, '.claude/reports');
fs.mkdirSync(reportDir, { recursive: true });

const rows = [];
for (const fn of functions) {
  // 从签名中提取函数名
  const funcNamePattern = /(?:function\s+|const\s+|let\s+|var\s+|def\s+|public\s+\w+\s+|private\s+\w+\s+|protected\s+\w+\s+)*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[(:{=]/;
  const match = fn.signature.match(funcNamePattern);
  const funcName = match ? match[1] : fn.signature;

  let exists = false;
  let matchedFile = '';

  try {
    const result = execSync(
      `grep -rl "${escapeShell(funcName)}" --include="*.ts" --include="*.js" --include="*.py" --include="*.java" --include="*.tsx" --include="*.jsx" . 2>/dev/null | head -1`,
      { encoding: 'utf8', timeout: 10000 }
    ).trim();
    exists = result.length > 0;
    matchedFile = result;
  } catch {
    exists = false;
  }

  // 签名片段匹配（更严格的验证）
  let signatureMatch = false;
  let signatureChecked = false;

  if (exists) {
    // 从签名中提取 2-3 个标识性片段进行二次验证
    const fragments = extractSignatureFragments(fn.signature);
    if (fragments.length >= 2) {
      signatureChecked = true;
      try {
        // 检查第一个文件是否包含多个签名片段
        let allFound = true;
        for (const frag of fragments) {
          try {
            execSync(`grep -l "${escapeShell(frag)}" "${matchedFile}" 2>/dev/null`, { encoding: 'utf8', timeout: 5000 });
          } catch {
            allFound = false;
            break;
          }
        }
        signatureMatch = allFound;
      } catch {
        signatureMatch = false;
      }
    }
  }

  rows.push({
    constraint_ids: fn.constraint_ids.join(', ') || '-',
    signature: fn.signature,
    module: fn.module,
    func_name: funcName,
    exists,
    signature_checked: signatureChecked,
    signature_match: signatureMatch,
    tests_count: fn.testsCount,
    file: matchedFile
  });
}

// 生成报告
const totalRows = rows.length;
const passRows = rows.filter(r => r.exists).length;
const signaturePassRows = rows.filter(r => r.exists && r.signature_match).length;
const failRows = totalRows - passRows;
const checkedRows = rows.filter(r => r.signature_checked).length;

let md = `# 约束覆盖验证报告\n\n`;
md += `## 概览\n\n`;
md += `- 总计: ${totalRows}\n`;
md += `- 函数名存在: ${passRows}\n`;
md += `- 签名片段匹配: ${signaturePassRows} (验证 ${checkedRows} 个)\n`;
md += `- 未找到: ${failRows}\n\n`;

md += `| 约束 ID | 函数签名 | 模块 | 函数名 | 存在 | 签名匹配 | 状态 |\n`;
md += `|---------|----------|------|--------|------|----------|------|\n`;

for (const row of rows) {
  const sigMatch = row.signature_checked ? (row.signature_match ? '✅' : '❌') : '-';
  md += `| ${row.constraint_ids} | \`${row.signature}\` | ${row.module} | ${row.func_name} | ${row.exists ? '✅' : '❌'} | ${sigMatch} | ${row.exists ? 'PASS' : 'FAIL'} |\n`;
}

if (checkedRows > 0) {
  md += `\n> 签名片段匹配率: ${Math.round((signaturePassRows / checkedRows) * 100)}%\n`;
}

const reportPath = path.join(reportDir, 'constraint-coverage.md');
fs.writeFileSync(reportPath, md, 'utf8');

console.log(md);
console.log(`\n报告已写入: ${reportPath}`);

if (failRows > 0) {
  process.exit(1);
}

// ---------- 工具函数 ----------

function findProjectRoot(filePath) {
  let dir = path.resolve(path.dirname(filePath));
  while (dir !== path.parse(dir).root) {
    if (fs.existsSync(path.join(dir, 'package.json')) ||
        fs.existsSync(path.join(dir, 'pom.xml')) ||
        fs.existsSync(path.join(dir, 'pyproject.toml')) ||
        fs.existsSync(path.join(dir, 'requirements.txt')) ||
        fs.existsSync(path.join(dir, '.git'))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return process.cwd();
}

function escapeShell(str) {
  return str.replace(/["`$\\]/g, '\\$&');
}

function extractSignatureFragments(signature) {
  // 从函数签名中提取 2-3 个可用于 grep 的标识性片段
  const cleaned = signature.trim();

  // 提取函数名
  const nameMatch = cleaned.match(/([a-zA-Z_$][a-zA-Z0-9_$]{2,})\s*[(:{=]/);
  const name = nameMatch ? nameMatch[1] : '';

  // 提取参数类型的关键词 — 只使用较长、较具体的标识符
  // 避免匹配 User, Order, List, Map 等过于通用的名称
  const commonTypes = new Set(['User', 'Order', 'List', 'Map', 'Set', 'None', 'int', 'str', 'float', 'bool', 'void', 'any', 'Object', 'String', 'Number', 'Array', 'Promise']);
  const paramTypes = cleaned.match(/:\s*([A-Za-z_$][A-Za-z0-9_$]*)/g) || [];
  const specificTypes = paramTypes
    .map(p => p.replace(/:\s*/, ''))
    .filter(t => t.length >= 3 && !commonTypes.has(t));

  // 构建片段
  const fragments = [];
  if (name) fragments.push(name);
  for (const st of specificTypes.slice(0, 2)) {
    fragments.push(st);
  }

  // 去重并返回前 3 个
  return [...new Set(fragments)].slice(0, 3);
}