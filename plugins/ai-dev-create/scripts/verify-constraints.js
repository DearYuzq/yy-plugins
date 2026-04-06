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
//   - 支持块标量 | (保留换行) 和 > (折叠换行)
// 不支持: 锚点/别名, 流式集合

function simpleYamlParse(text) {
  // ---- Step 0: Tab detection ----
  const tabLineMatch = text.match(/^[\t ]*\t/m);
  if (tabLineMatch) {
    // Find exact line number
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (/^\t/.test(lines[i])) {
        throw new Error(`YAML parse error at line ${i + 1}: Tab character detected. ` +
          `YAML requires spaces for indentation. Please replace tabs with spaces.`);
      }
    }
  }

  // Remove trailing whitespace on each line, but remember original line numbers
  const rawLines = text.split('\n');

  // Pre-process: resolve block scalars (| and >) inline so the normal parser
  // treats the multi-line content as a single string value.
  const processedLines = resolveBlockScalars(rawLines);

  // ---- Step 1: Filter out blank/comment lines from processed lines, preserve indent info ----
  const entries = [];
  for (const line of processedLines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const indent = line.length - line.trimStart().length;
    const content = line.trimStart();
    entries.push({ indent, content, isList: content.startsWith('- ') || content === '-' });
  }

  // Build a reverse lookup: find original line number of a string in the raw text
  // Used for error messages
  function findLineNum(content) {
    for (let i = 0; i < rawLines.length; i++) {
      if (rawLines[i].includes(content.substring(0, 30))) {
        return i + 1;
      }
    }
    return '?';
  }

  function tryParseScalar(str) {
    str = str.trim();
    if (!str || str === 'null' || str === '~') return null;
    if (str === 'true') return true;
    if (str === 'false') return false;
    if (/^-?\d+$/.test(str)) { const n = parseInt(str, 10); return Number.isNaN(n) ? str : n; }
    if (/^-?\d+\.\d+$/.test(str)) return parseFloat(str);
    if (str.startsWith('"') && str.endsWith('"')) {
      try { return JSON.parse(str); } catch { return str.slice(1, -1); }
    }
    if (str.startsWith("'") && str.endsWith("'")) {
      return str.slice(1, -1).replace(/''/g, "'");
    }
    if (str.startsWith('[') && str.endsWith(']')) {
      // 简单内联数组
      const inner = str.slice(1, -1).trim();
      if (!inner) return [];
      return inner.split(',').map(s => tryParseScalar(s.trim()));
    }
    return str;
  }

  // 解析从 pos 开始的、属于某个缩进块的所有行
  // 返回 { value, nextPos }
  function parseBlock(pos, expectedIndent) {
    if (pos >= entries.length || entries[pos].indent < expectedIndent) {
      return { value: null, nextPos: pos };
    }

    const isList = entries[pos].isList;

    if (isList) {
      const arr = [];
      while (pos < entries.length && entries[pos].indent >= expectedIndent && entries[pos].isList) {
        if (entries[pos].indent > expectedIndent) {
          break;
        }
        const content = entries[pos].content;
        const itemStr = content === '-' ? '' : content.slice(2);
        pos++;

        if (!itemStr) {
          if (pos < entries.length && entries[pos].indent > expectedIndent) {
            const child = parseBlock(pos, entries[pos].indent);
            arr.push(child.value);
            pos = child.nextPos;
          } else {
            arr.push(null);
          }
        } else {
          const kvMatch = itemStr.match(/^([^:]+):\s*(.*)$/); // note: no ? after + to handle signature: with colons
          if (kvMatch) {
            const obj = {};
            const key = kvMatch[1].trim();
            // signature 字段包含冒号（如 TypeScript 类型签名），需要取剩余全部内容
            const val = key === 'signature' ? itemStr.slice(key.length + 1).trimStart() : kvMatch[2].trim();
            // For other keys that might contain colons in values, use full remainder
            // But only if val is empty after the first key:value split

            if (!val) {
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
            while (pos < entries.length && !entries[pos].isList && entries[pos].indent > expectedIndent) {
              const siblingIndent = entries[pos].indent;
              const sibling = parseBlock(pos, siblingIndent);
              if (sibling.value && typeof sibling.value === 'object' && !Array.isArray(sibling.value)) {
                Object.assign(obj, sibling.value);
              }
              pos = sibling.nextPos;
            }

            arr.push(obj);
          } else {
            // Possibly a line that looks like it has a key but doesn't match
            // (e.g., continuation of a multi-line value that wasn't captured)
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
          break;
        }
        const content = entries[pos].content;
        const kvMatch = content.match(/^([^:]+):\s*(.*)$/);
        if (!kvMatch) {
          // Parse error - show line info
          const lineNum = findApproxLineNum(content);
          console.error(`WARNING: YAML parse: line ${lineNum} does not look like valid "key: value" pair: "${content.substring(0, 60)}"`);
          pos++;
          continue;
        }

        const key = kvMatch[1].trim();
        const val = key === 'signature'
          ? content.slice(key.length + 1).trimStart()
          : kvMatch[2].trim();
        pos++;

        if (!val) {
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

/**
 * Pre-process raw lines to resolve YAML block scalars (| and >).
 * When a line has `key: |` or `key: >`, the following indented lines
 * form a multi-line string value. This function collapses them into
 * a single line: `key: <resolved-string>`.
 *
 * Returns a new array of lines with block scalars resolved inline.
 */
function resolveBlockScalars(rawLines) {
  const result = [];
  let i = 0;
  while (i < rawLines.length) {
    const line = rawLines[i];
    // Match "key: |" or "key: >" or "key: |2" etc. (with optional chomping/indent indicator)
    const blockMatch = line.match(/^(\s*)([^:]+):\s*(\|{1,3}|>{1,3})\s*$/);

    if (blockMatch) {
      const indent = blockMatch[1];
      const key = blockMatch[2];
      const indicator = blockMatch[3][0]; // '|' or '>'
      const baseIndent = indent.length;

      // Determine the content indentation: typically baseIndent + 2 or look at next non-empty line
      let j = i + 1;
      // Skip empty lines at the start
      while (j < rawLines.length && rawLines[j].trim() === '') {
        j++;
      }

      if (j >= rawLines.length) {
        // No content found, treat as empty
        result.push(`${key}: ""`);
        i = i + 1;
        continue;
      }

      // Detect content indent from first non-empty line
      const contentIndent = rawLines[j].length - rawLines[j].trimStart().length;

      // Collect all lines at >= contentIndent
      // Stop at: empty line followed by a line at <= baseIndent, or a line at <= baseIndent
      const scalarLines = [];
      j = i + 1;
      let hitBlank = false;

      while (j < rawLines.length) {
        const currLine = rawLines[j];
        const currIndent = currLine.length - currLine.trimStart().length;

        if (currLine.trim() === '') {
          hitBlank = true;
          // Check if next non-empty line is still at content indent or deeper
          let peek = j + 1;
          while (peek < rawLines.length && rawLines[peek].trim() === '') {
            peek++;
          }
          if (peek < rawLines.length) {
            const peekIndent = rawLines[peek].length - rawLines[peek].trimStart().length;
            if (peekIndent <= baseIndent) {
              break; // End of block scalar
            }
          } else {
            break; // End of file
          }
          scalarLines.push('');
          j++;
          continue;
        }

        if (currIndent <= baseIndent) {
          break; // Content at or above the key's indent = end of block
        }

        // Remove the content-level indentation but preserve relative indentation
        scalarLines.push(currLine.slice(contentIndent));
        hitBlank = false;
        j++;
      }

      // Remove trailing blank lines
      while (scalarLines.length > 0 && scalarLines[scalarLines.length - 1] === '') {
        scalarLines.pop();
      }

      let resolvedValue;
      if (indicator === '|') {
        // Literal block: preserve newlines
        resolvedValue = scalarLines.join('\n');
      } else {
        // Folded: replace single newlines with spaces, double newlines preserved
        // Simplified: just join with spaces
        resolvedValue = scalarLines.join(' ').replace(/\n/g, ' ');
      }

      // Escape the value so it stays on ONE line for line-by-line parsing:
      // Replace real newlines with literal \n (two chars), then wrap in quotes
      const escapedValue = resolvedValue
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
      // IMPORTANT: preserve original indentation so the parser places this
      // key at the correct nesting level
      result.push(`${indent}${key}: "${escapedValue}"`);
      i = j; // Continue from where the block ended
    } else {
      result.push(line);
      i++;
    }
  }
  return result;
}

/**
 * Find approximate line number in the original YAML text where a content string appears.
 * Used for error messages.
 */
function findApproxLineNum(content) {
  // This is approximate since we process through resolveBlockScalars first.
  // For better accuracy, we'd track line numbers through the pipeline.
  return '~?';
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
      `grep -rl "${escapeShell(funcName)}" --include="*.ts" --include="*.js" --include="*.py" --include="*.java" --include="*.tsx" --include="*.jsx" --include="*.go" --include="*.rs" --include="*.rb" . 2>/dev/null | head -1`,
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

  // 函数参数验证
  let paramCheck = null;

  if (exists) {
    const fragments = extractSignatureFragments(fn.signature);
    if (fragments.length >= 2) {
      signatureChecked = true;
      try {
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

    // 函数参数数量和类型验证
    // 根据文件扩展名推断语言，而非使用 YAML 文件路径
    const ext = path.extname(matchedFile);
    const langMap = {
      '.py': 'python', '.go': 'go', '.rs': 'rust',
      '.rb': 'ruby', '.java': 'java'
    };
    const detectedLang = langMap[ext] || 'javascript';
    paramCheck = verifyFunctionParameters(matchedFile, fn.signature, detectedLang);
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
    file: matchedFile,
    param_check: paramCheck
  });
}

// 生成报告
const totalRows = rows.length;
const passRows = rows.filter(r => r.exists).length;
const signaturePassRows = rows.filter(r => r.exists && r.signature_match).length;
const failRows = totalRows - passRows;
const checkedRows = rows.filter(r => r.signature_checked).length;

// 导出函数完整性检查
const exportedCheck = checkExportedFunctions(projectRoot, functions);

let md = `# 约束覆盖验证报告\n\n`;
md += `## 概览\n\n`;
md += `- 总计: ${totalRows}\n`;
md += `- 函数名存在: ${passRows}\n`;
md += `- 签名片段匹配: ${signaturePassRows} (验证 ${checkedRows} 个)\n`;
md += `- 未找到: ${failRows}\n`;

if (exportedCheck) {
  md += `**导出函数检查**:\n`;
  md += `- 约束树定义: ${exportedCheck.defined} 个\n`;
  md += `- 代码已导出: ${exportedCheck.exported} 个\n`;
  md += `- 缺失导出: ${exportedCheck.missing.length} 个\n`;
  md += `- 多余导出: ${exportedCheck.extra.length} 个\n`;
  if (exportedCheck.missing.length > 0) {
    md += `> ⚠️ 缺失导出: ${exportedCheck.missing.join(', ')}\n`;
  }
}

md += `\n`;

// 参数验证详情
const paramIssues = rows.filter(r => r.param_check && r.param_check.issues.length > 0);
if (paramIssues.length > 0) {
  md += `## 函数签名验证警告\n\n`;
  for (const r of paramIssues) {
    md += `- **${r.func_name}**: ${r.param_check.issues.join('; ')}\n`;
  }
  md += `\n`;
}

md += `| 约束 ID | 函数签名 | 模块 | 函数名 | 存在 | 签名匹配 | 参数 | 状态 |\n`;
md += `|---------|----------|------|--------|------|----------|------|------|\n`;

for (const row of rows) {
  const sigMatch = row.signature_checked ? (row.signature_match ? '✅' : '❌') : '-';
  const paramStatus = row.param_check
    ? (row.param_check.issues.length > 0 ? `⚠️ ${row.param_check.issues.length}个问题` : '✅')
    : '-';
  md += `| ${row.constraint_ids} | \`${row.signature}\` | ${row.module} | ${row.func_name} | ${row.exists ? '✅' : '❌'} | ${sigMatch} | ${paramStatus} | ${row.exists ? 'PASS' : 'FAIL'} |\n`;
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
  // 支持: JS/TS, Python, Java, Go, Rust, Ruby

  const fragments = [];

  // Extract function name (supports multiple languages)
  const funcPatterns = [
    /(?:function\s+|def\s+|async def\s+|const\s+|let\s+|var\s+|\w+\s+|func\s+)([a-zA-Z_$][a-zA-Z0-9_$]*)/,  // JS/TS/Python/Java
    /func\s+\([^)]*\)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/,  // Go method: func (r *R) Method
    /fn\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[<(]/,  // Rust: fn method
    /\bdef\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/,  // Ruby: def method
  ];
  for (const pattern of funcPatterns) {
    const m = signature.match(pattern);
    if (m) { fragments.push(m[1]); break; }
  }
  if (fragments.length === 0) return fragments;

  // 提取参数类型的关键词 — 只使用较长、较具体的标识符
  const commonTypes = new Set(['User', 'Order', 'List', 'Map', 'Set', 'None', 'int', 'str', 'float', 'bool', 'void', 'any', 'Object', 'String', 'Number', 'Array', 'Promise', 'string', 'int', 'bool', 'error', 'Result', 'Option', 'Arc', 'Rc', 'Box', 'String', 'Vec']);
  const paramTypes = signature.match(/:\s*([A-Za-z_$][A-Za-z0-9_$<>*&[\]]*)/g) || [];
  const specificTypes = paramTypes
    .map(p => p.replace(/:\s*/, ''))
    .filter(t => t.length >= 3 && !commonTypes.has(t.split(/<|[\*|&]/)[0]));

  for (const st of specificTypes.slice(0, 2)) {
    fragments.push(st);
  }

  // Go/Rust/Ruby: also extract type names from Go/Rust/Ruby style signatures
  // Go: type names like *User or []string
  const goTypeMatch = signature.match(/\*\s*([A-Z][A-Za-z0-9]*)/);
  if (goTypeMatch && !fragments.includes(goTypeMatch[1]) && goTypeMatch[1].length >= 3) {
    fragments.push(goTypeMatch[1]);
  }
  // Rust: type names like Result<User, Error>
  const rustTypeMatch = signature.match(/->\s*([A-Z][A-Za-z0-9]*)/);
  if (rustTypeMatch && !fragments.includes(rustTypeMatch[1]) && rustTypeMatch[1].length >= 3) {
    fragments.push(rustTypeMatch[1]);
  }

  // 去重并返回前 3 个
  return [...new Set(fragments)].slice(0, 3);
}

/**
 * Verify function parameters in the matched file match the expected signature.
 * Zero-dependency: regex-based extraction.
 *
 * Returns: { expected: N, actual: M|null, issues: string[] }
 */
function verifyFunctionParameters(filePath, expectedSignature, lang) {
  const issues = [];

  // Extract expected parameter count from signature
  const expectedParams = extractParameterCount(expectedSignature, lang);

  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Extract function name from signature
    const funcPattern = /(?:function\s+|def\s+|async def\s+|const\s+|let\s+|var\s+|\w+\s+|func\s+)([a-zA-Z_$][a-zA-Z0-9_$]*)/;
    const funcMatch = expectedSignature.match(funcPattern);
    if (!funcMatch) return { expected: expectedParams, actual: null, issues: ['无法从签名提取函数名'] };

    const funcName = funcMatch[1];

    // Find the function definition in the file — language-specific patterns
    const patterns = [];

    // Common: function name followed by params
    patterns.push(new RegExp(`${escapeRegex(funcName)}\\s*\\(([^)]*)\\)`, 'g'));

    // Go: func (r *R) MethodName(params)
    patterns.push(new RegExp(`func\\s+\\([^)]+\\)\\s+${escapeRegex(funcName)}\\s*\\(([^)]+)\\)`, 'g'));

    // Rust: fn method_name<'a>(params)
    patterns.push(new RegExp(`fn\\s+${escapeRegex(funcName)}[^(]*\\(([^)]+)`, 'g'));

    let foundDefinition = false;
    let actualParams = null;

    for (const pattern of patterns) {
      let m;
      while ((m = pattern.exec(content)) !== null) {
        foundDefinition = true;
        const fullMatch = m[0];
        const paramMatch = fullMatch.match(/\(([^)]*)\)/);
        if (paramMatch) {
          actualParams = countParams(paramMatch[1], lang);
          if (expectedParams > 0 && actualParams !== expectedParams && actualParams > 0) {
            issues.push(`约束树定义 ${expectedParams} 个参数，实际 ${actualParams} 个`);
          }
        }
        break;
      }
      if (foundDefinition) break;
    }

    if (!foundDefinition) {
      // Function might be defined differently (e.g., method in class)
    }
  } catch {
    issues.push('无法读取文件进行参数验证');
  }

  return { expected: expectedParams, actual: actualParams, issues };
}

function extractParameterCount(signature, lang) {
  // Try to find the parameter list
  const paramMatch = signature.match(/\(([^)]{0,500})\)/);
  if (!paramMatch) return 0;
  return countParams(paramMatch[1], lang);
}

function countParams(paramStr, lang) {
  // Simple parameter counting, handling destructuring, defaults, etc.
  const trimmed = paramStr.trim();
  if (!trimmed || trimmed === 'self' || trimmed === 'cls') return 0;

  // For Python, don't count 'self' as a parameter
  const skipParams = lang === 'python' ? ['self', 'cls'] : ['this'];

  // Count commas at depth 0 (handles nested types like Map<K,V>)
  let depth = 0;
  let count = 1;

  // Check if all params should be skipped (e.g., just 'self')
  const rawParams = trimmed.split(',').map(s => s.trim()).filter(s => s);
  if (rawParams.every(p => skipParams.includes(p))) return 0;

  for (const ch of trimmed) {
    if (ch === '<' || ch === '(' || ch === '[' || ch === '{') depth++;
    if (ch === '>' || ch === ')' || ch === ']' || ch === '}') depth--;
    if (ch === ',' && depth === 0) count++;
  }

  // Adjust: if first param is self/this/cls, don't count it
  const firstParam = rawParams[0];
  if (skipParams.includes(firstParam)) count--;

  return Math.max(count, 0);
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Check exported functions in the project match the constraint tree.
 * Finds all exported functions and compares against constraint definitions.
 */
function checkExportedFunctions(projectRoot, constraintFunctions) {
  const expectedFuncNames = new Set();
  for (const fn of constraintFunctions) {
    const funcPattern = /(?:function\s+|def\s+|async def\s+|const\s+|let\s+|var\s+|\w+\s+|func\s+)([a-zA-Z_$][a-zA-Z0-9_$]*)/;
    const funcMatch = fn.signature.match(funcPattern);
    if (funcMatch) expectedFuncNames.add(funcMatch[1]);
  }

  // Find exported functions in source files
  const exportPatterns = [
    { re: /export\s+\{([^}]+)\}/g, extract: (m) => m.split(',').map(s => s.trim().split(/\s+as\s+/)[0].trim()) },
    { re: /export\s+(?:default\s+)?(?:function|const|class|async function)\s+(\w+)/g, extract: (m) => [m] },
    { re: /export\s+function\s+(\w+)/g, extract: (m) => [m] },
  ];

  const foundExports = new Set();
  // JS/TS/Java style exports
  const extensions = ['*.ts', '*.tsx', '*.js', '*.jsx'];

  try {
    for (const ext of extensions) {
      try {
        const result = execSync(
          `grep -rh "^export " --include="${ext}" . 2>/dev/null | head -100`,
          { encoding: 'utf8', timeout: 10000, cwd: projectRoot }
        );
        for (const line of result.split('\n')) {
          if (line.includes('function') || line.includes('const')) {
            const nameMatch = line.match(/(?:function|const)\s+(\w+)/);
            if (nameMatch) foundExports.add(nameMatch[1]);
          }
          if (line.startsWith('export {')) {
            const contentMatch = line.match(/export\s+\{([^}]+)\}/);
            if (contentMatch) {
              contentMatch[1].split(',').forEach(s => {
                const name = s.trim().split(/\s+as\s+/)[0].trim();
                if (name) foundExports.add(name);
              });
            }
          }
        }
      } catch { /* extension not found */ }
    }

    // Python style exports: def or class with __all__
    try {
      const pyResult = execSync(
        `grep -rh "^def \\|^class \\|^__all__" --include="*.py" . 2>/dev/null | head -100`,
        { encoding: 'utf8', timeout: 10000, cwd: projectRoot }
      );
      for (const line of pyResult.split('\n')) {
        const nameMatch = line.match(/(?:def|class)\s+(\w+)/);
        if (nameMatch) foundExports.add(nameMatch[1]);
      }
    } catch { /* no Python */ }

    // Go style exports: func/method definitions at exported visibility (uppercase first letter)
    try {
      const goResult = execSync(
        `grep -rh "^func \\|^func (" --include="*.go" . 2>/dev/null | head -100`,
        { encoding: 'utf8', timeout: 10000, cwd: projectRoot }
      );
      for (const line of goResult.split('\n')) {
        const nameMatch = line.match(/func\s+(?:\([^)]*\)\s+)?([A-Z]\w+)/);
        if (nameMatch) foundExports.add(nameMatch[1]);
      }
    } catch { /* no Go */ }

    // Rust style exports: pub fn
    try {
      const rsResult = execSync(
        `grep -rh "^pub fn \\|^pub async fn " --include="*.rs" . 2>/dev/null | head -100`,
        { encoding: 'utf8', timeout: 10000, cwd: projectRoot }
      );
      for (const line of rsResult.split('\n')) {
        const nameMatch = line.match(/pub\s+(?:async\s+)?fn\s+(\w+)/);
        if (nameMatch) foundExports.add(nameMatch[1]);
      }
    } catch { /* no Rust */ }

    // Ruby style exports: public def
    try {
      const rbResult = execSync(
        `grep -rh "^def " --include="*.rb" . 2>/dev/null | head -100`,
        { encoding: 'utf8', timeout: 10000, cwd: projectRoot }
      );
      for (const line of rbResult.split('\n')) {
        const nameMatch = line.match(/def\s+(\w+)/);
        if (nameMatch) foundExports.add(nameMatch[1]);
      }
    } catch { /* no Ruby */ }
  } catch { /* ignore */ }

  const missing = [];
  const extra = [];

  for (const name of expectedFuncNames) {
    if (!foundExports.has(name)) {
      missing.push(name);
    }
  }

  return {
    defined: expectedFuncNames.size,
    exported: foundExports.size,
    missing,
    extra
  };
}

/**
 * Compare two constraint tree YAML files and return the diff.
 * Outputs: { added: [...], removed: [...], modified: [...] }
 * Used for incremental constraint tree updates when requirements change.
 */
function diffConstraintTrees(oldPath, newPath) {
  const oldText = fs.readFileSync(oldPath, 'utf8');
  const newText = fs.readFileSync(newPath, 'utf8');

  const oldTree = simpleYamlParse(oldText);
  const newTree = simpleYamlParse(newText);

  const oldFuncs = [];
  const newFuncs = [];
  collectFunctions(oldTree, [], oldFuncs);
  collectFunctions(newTree, [], newFuncs);

  const oldMap = new Map();
  const newMap = new Map();

  for (const fn of oldFuncs) {
    const name = extractFunctionNameFromSig(fn.signature);
    if (name) oldMap.set(name, fn);
  }
  for (const fn of newFuncs) {
    const name = extractFunctionNameFromSig(fn.signature);
    if (name) newMap.set(name, fn);
  }

  const added = [];
  const removed = [];
  const modified = [];

  for (const [name, fn] of newMap) {
    if (!oldMap.has(name)) {
      added.push({ name, signature: fn.signature });
    } else {
      const old = oldMap.get(name);
      if (old.signature !== fn.signature) {
        modified.push({
          name,
          old_signature: old.signature,
          new_signature: fn.signature
        });
      }
    }
  }

  for (const [name, fn] of oldMap) {
    if (!newMap.has(name)) {
      removed.push({ name, signature: fn.signature });
    }
  }

  return { added, removed, modified };
}

function extractFunctionNameFromSig(signature) {
  const funcPatterns = [
    /(?:function\s+|def\s+|async def\s+|const\s+|let\s+|var\s+|\w+\s+|func\s+)([a-zA-Z_$][a-zA-Z0-9_$]*)/,
    /func\s+\([^)]*\)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/,
    /fn\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[<(]/,
  ];
  for (const pattern of funcPatterns) {
    const m = signature.match(pattern);
    if (m) return m[1];
  }
  return null;
}