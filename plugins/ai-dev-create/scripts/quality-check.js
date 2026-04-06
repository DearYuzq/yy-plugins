#!/usr/bin/env node
/**
 * 轻量质量检查脚本
 * 自动检测项目语言并执行对应检查
 *
 * 缓存策略: 语言检测结果缓存在项目根目录的
 * .claude/.lang-cache.json 中, 避免每次 Edit/Write 递归扫描整个项目。
 */

const fs = require('fs');
const path = require('path');

const CACHE_FILE = '.claude/.lang-cache.json';

// --- Project Language Detection with Caching ---

function loadCache(projectRoot) {
  const cachePath = path.join(projectRoot, CACHE_FILE);
  try {
    const raw = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    // 缓存超过5分钟过期
    if (Date.now() - raw.timestamp < 5 * 60 * 1000) {
      return raw.languages;
    }
  } catch {
    // 无缓存或损坏
  }
  return null;
}

function saveCache(projectRoot, languages) {
  try {
    const cachePath = path.join(projectRoot, CACHE_FILE);
    const cacheDir = path.dirname(cachePath);
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    fs.writeFileSync(cachePath, JSON.stringify({ timestamp: Date.now(), languages }, null, 2));
  } catch {
    // 写入失败不影响主流程
  }
}

function detectProjectLanguages(projectRoot) {
  // 先尝试缓存
  const cached = loadCache(projectRoot);
  if (cached) return cached;

  const languages = new Set();
  const indicators = {
    'package.json': ['javascript', 'typescript'],
    'tsconfig.json': ['typescript'],
    'go.mod': ['go'],
    'Cargo.toml': ['rust'],
    'requirements.txt': ['python'],
    'pyproject.toml': ['python'],
    'pom.xml': ['java'],
    'build.gradle': ['java'],
    'build.gradle.kts': ['java'],
    'Gemfile': ['ruby'],
    'composer.json': ['php'],
    '.csproj': ['csharp'],
    'CMakeLists.txt': ['cpp'],
    'Makefile': ['c', 'cpp'],
  };

  // 仅扫描一层深度(项目根目录), 不递归扫描
  try {
    const entries = fs.readdirSync(projectRoot, { withFileTypes: true });
    for (const entry of entries) {
      if (indicators[entry.name]) {
        indicators[entry.name].forEach(lang => languages.add(lang));
      }
    }
    // 如果一层没找到, 递归扫描子目录(最多3层)
    if (languages.size === 0) {
      scanSubdirs(projectRoot, languages, indicators, 0, 3);
    }
  } catch {
    // ignore
  }

  const result = [...languages];
  saveCache(projectRoot, result);
  return result;
}

function scanSubdirs(dir, languages, indicators, depth, maxDepth) {
  if (depth >= maxDepth) return;
  try {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'target' || entry.name === '.claude') continue;
      if (indicators[entry.name]) {
        indicators[entry.name].forEach(lang => languages.add(lang));
      }
      if (entry.isDirectory()) {
        scanSubdirs(path.join(dir, entry.name), languages, indicators, depth + 1, maxDepth);
      }
    }
  } catch {
    // ignore
  }
}

function getProjectRoot(filePath) {
  let dir = path.dirname(filePath);
  const maxDepth = 10;
  for (let i = 0; i < maxDepth; i++) {
    if (fs.existsSync(path.join(dir, 'package.json')) ||
        fs.existsSync(path.join(dir, 'go.mod')) ||
        fs.existsSync(path.join(dir, 'Cargo.toml')) ||
        fs.existsSync(path.join(dir, 'pom.xml')) ||
        fs.existsSync(path.join(dir, 'pyproject.toml')) ||
        fs.existsSync(path.join(dir, 'requirements.txt'))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.dirname(filePath);
}

// --- Language-specific checks ---

const consoleLogExtensions = /\.(ts|tsx|js|jsx|go|rs|py|rb|java)$/;
const secretExtensions = /\.(ts|tsx|js|jsx|py|java|go|rs|rb)$/;

function checkConsoleLog(filePath, languages) {
  if (!consoleLogExtensions.test(filePath)) return null;

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const issues = [];

  const patterns = detectLanguagePatterns(languages);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*') || trimmed.startsWith('*')) continue;

    for (const pat of patterns) {
      if (pat.test(trimmed)) {
        issues.push({
          file: filePath,
          line: i + 1,
          message: `发现 ${pat.name}，提交前请移除`
        });
      }
    }
  }

  return issues.length > 0 ? issues : null;
}

function detectLanguagePatterns(languages) {
  const base = [
    { name: 'console.log', re: /console\.log\(/ },
  ];

  if (languages.includes('python')) {
    base.push({ name: 'print()', re: /print\s*\(/ });
  }
  if (languages.includes('go')) {
    base.push({ name: 'fmt.Println', re: /fmt\.Print/ });
  }
  if (languages.includes('rust')) {
    base.push({ name: 'println!', re: /println!\s*\(/ });
  }
  if (languages.includes('ruby')) {
    base.push({ name: 'puts', re: /^puts\s/ });
  }
  if (languages.includes('java')) {
    base.push({ name: 'System.out.println', re: /System\.out\.print/ });
  }

  return base;
}

function checkHardcodedSecrets(filePath) {
  if (!secretExtensions.test(filePath)) return null;

  const content = fs.readFileSync(filePath, 'utf8');
  const patterns = [
    { re: /sk-[a-zA-Z0-9]{20,}/, msg: '可能存在 OpenAI API key' },
    { re: /api_key\s*=\s*['"][^'"]+['"]/, msg: '可能存在硬编码的 API key' },
    { re: /password\s*=\s*['"][^'"]{4,}['"]/, msg: '可能存在硬编码的密码' },
    { re: /secret\s*=\s*['"][^'"]{4,}['"]/, msg: '可能存在硬编码的 secret' },
    { re: /AKIA[0-9A-Z]{16}/, msg: '可能存在 AWS Access Key' },
  ];

  const issues = [];
  for (const { re, msg } of patterns) {
    if (re.test(content)) {
      issues.push({ file: filePath, message: msg });
    }
  }

  return issues.length > 0 ? issues : null;
}

function checkTodoComments(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const issues = [];

  // TODO/FIXME/HACK/XXX 注释检查
  const re = /\b(TODO|FIXME|HACK|XXX)\b\s*:?\s*/i;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(re);
    if (match) {
      const rest = line.substring(match.index + match[0].length).trim();
      if (rest) {
        issues.push({
          file: filePath,
          line: i + 1,
          message: `${match[1].toUpperCase()}: ${rest}`
        });
      }
    }
  }

  return issues.length > 0 ? issues : null;
}

function main() {
  const filePath = process.env.file_path || process.argv[2];

  if (!filePath || !fs.existsSync(filePath)) {
    pipeStdin();
    return;
  }

  const projectRoot = getProjectRoot(filePath);
  const languages = detectProjectLanguages(projectRoot);

  const issues = [];

  const consoleIssues = checkConsoleLog(filePath, languages);
  if (consoleIssues) issues.push(...consoleIssues);

  const secretIssues = checkHardcodedSecrets(filePath);
  if (secretIssues) issues.push(...secretIssues);

  const todoIssues = checkTodoComments(filePath);
  if (todoIssues) issues.push(...todoIssues);

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

  // 代码复杂度检查（仅对源文件）
  if (/\.(ts|tsx|js|jsx|py)$/i.test(filePath)) {
    const complexityIssues = checkCodeComplexity(filePath);
    if (complexityIssues) {
      // 复杂度问题在发现问题时才输出，不重复触发
    }
  }

  pipeStdin();
}

// --- Code Complexity Checks (zero-dependency, regex-based) ---

function checkCodeComplexity(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const issues = [];

  // 1. 函数长度检查：统计函数起止行
  const pyMethodRe = /^\s*(?:async\s+)?def\s+(\w+)\s*\(/;
  const goMethodRe = /^func\s+(?:\(\s*\w+\s+[\w*]+\s*\)\s+)?(\w+)\s*\(/;
  const jsFuncRe = /^(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(/;
  const jsArrowRe = /^(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>)/;
  const jsConstFnRe = /^(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(\w+)\s*=>/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith('//') || line.trim().startsWith('#') || line.trim().startsWith('/*') || line.trim().startsWith('*')) continue;

    let funcName = null;
    if (filePath.endsWith('.py')) {
      const m = line.match(pyMethodRe);
      if (m) funcName = m[1];
    } else if (filePath.endsWith('.go')) {
      const m = line.match(goMethodRe);
      if (m) funcName = m[1];
    } else {
      const m = line.match(jsFuncRe) || line.match(jsArrowRe);
      if (m) funcName = m[1];
    }

    if (funcName) {
      // Find function end: count braces (JS/TS/Go) or dedent (Python)
      let endLine = findFunctionEnd(lines, i, filePath);
      const funcLength = endLine - i;
      if (funcLength > 50) {
        issues.push({
          file: filePath,
          line: i + 1,
          message: `函数 ${funcName} 过长 (${funcLength} 行, 建议 < 50 行)`
        });
      }
    }
  }

  // 2. 嵌套深度检查
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith('//') || line.trim().startsWith('#') || line.trim().startsWith('/*') || line.trim().startsWith('*')) continue;
    const depth = estimateNestingDepth(line, filePath);
    if (depth > 4) {
      issues.push({
        file: filePath,
        line: i + 1,
        message: `嵌套深度过深 (${depth} 层, 建议 < 4 层)`
      });
    }
  }

  // 3. 单文件参数数量检查（函数定义行）
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith('//') || line.trim().startsWith('#') || line.trim().startsWith('/*')) continue;
    const paramCount = countParameters(line, filePath);
    if (paramCount !== null && paramCount > 4) {
      issues.push({
        file: filePath,
        line: i + 1,
        message: `函数参数过多 (${paramCount} 个, 建议 < 5 个)，考虑使用对象/结构体封装`
      });
    }
  }

  // 4. 分支复杂度估计
  let branchCount = 0;
  const branchKeywords = /\b(if|else if|elif|else|case|catch|&&|\|\|)\b/g;
  for (const line of lines) {
    const matches = line.match(branchKeywords);
    if (matches) branchCount += matches.length;
  }
  if (branchCount > 20) {
    issues.push({
      file: filePath,
      line: 1,
      message: `文件分支复杂度较高 (约 ${branchCount} 个分支点)，建议拆分为更小模块`
    });
  }

  if (issues.length > 0) {
    console.log(`[QualityCheck] 代码复杂度提醒:`);
    issues.forEach(issue => {
      console.log(`  - ${issue.file}:${issue.line}: ${issue.message}`);
    });
  }

  return issues.length > 0 ? issues : null;
}

function findFunctionEnd(lines, startIdx, filePath) {
  if (filePath.endsWith('.py')) {
    // Python: function ends when dedent to same or lesser level as def line
    const defLine = lines[startIdx];
    const defIndent = defLine.length - defLine.trimStart().length;
    for (let i = startIdx + 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim() === '') continue; // skip blank lines
      const indent = line.length - line.trimStart().length;
      if (indent <= defIndent && line.trim()) return i;
    }
    return lines.length - 1;
  } else {
    // Braced languages: count { }
    let braceCount = 0;
    let started = false;
    for (let i = startIdx; i < lines.length; i++) {
      const line = lines[i];
      for (const ch of line) {
        if (ch === '{') { braceCount++; started = true; }
        if (ch === '}') braceCount--;
      }
      if (started && braceCount <= 0) return i;
    }
    return lines.length - 1;
  }
}

function estimateNestingDepth(line, filePath) {
  if (filePath.endsWith('.py')) {
    const indent = line.length - line.trimStart().length;
    const spacesPerLevel = 4;
    // Subtract 1 for the function definition level
    return Math.floor(indent / spacesPerLevel) - 1;
  } else {
    // Braced languages: approximate nesting by counting leading indentation
    // Most formatters use 2-space or 4-space indentation per nesting level
    const indent = line.length - line.trimStart().length;
    if (indent === 0) return -1; // not indented
    // Assume 2 spaces per nesting level (common for JS/TS)
    return Math.floor(indent / 2);
  }
}

function countParameters(line, filePath) {
  // Only match function definitions, not function calls
  // Must have a keyword before the function name (function/const/let/var/def/async etc.)
  const trimmed = line.trim();
  let paramMatch = null;

  if (filePath.endsWith('.py')) {
    // Python: def func_name(params):
    if (!/^\s*(?:async\s+)?def\s+\w+/.test(line)) return null;
    paramMatch = line.match(/def\s+\w+\s*\(([^)]*)\)/);
  } else if (filePath.endsWith('.go')) {
    // Go: func funcName(params) or func (r Receiver) funcName(params)
    if (!/^\s*func\s/.test(line)) return null;
    paramMatch = line.match(/func\s+(?:\([^)]*\)\s+)?\w+\s*\(([^)]*)\)/);
  } else if (filePath.endsWith('.java')) {
    // Java: access_modifier ReturnType funcName(params)
    if (!/^\s*(?:public|private|protected)?\s*(?:static\s+)?/.test(trimmed)) return null;
    if (/\b(?:if|for|while|switch|catch|return|class|new)\s/.test(trimmed)) return null;
    paramMatch = trimmed.match(/\w+\s+\w+\s*\(([^)]*)\)/);
  } else {
    // JS/TS: function / const foo = / let foo = / var foo = / async function
    if (!/\b(?:function|const|let|var|async)\s/.test(line)) return null;
    // Skip lines that are clearly function calls (no keyword before them)
    if (/^\s*\w+\s*\([^)]*\)\s*[;.,)}\]]/.test(line)) return null;

    // Try: function name(params)
    paramMatch = line.match(/function\s+\w+\s*\(([^)]*)\)/);
    // Try: const name = function(params) or const name = (params) =>
    if (!paramMatch) {
      paramMatch = line.match(/(?:const|let|var)\s+\w+\s*=\s*(?:function\s*|\([^)]*\)\s*=>|\w+\s*=>)/);
      if (paramMatch) {
        const parenMatch = line.match(/\(([^)]+)\)\s*(?:=>|{)/);
        if (parenMatch) paramMatch = parenMatch;
        else paramMatch = null;
      }
    }
  }

  if (paramMatch && paramMatch[1] !== undefined && paramMatch[1].trim()) {
    const params = paramMatch[1].split(',').map(p => p.trim()).filter(p => p && p !== 'self' && p !== 'this');
    return params.length;
  }
  return null;
}

function pipeStdin() {
  let input = '';
  process.stdin.on('data', chunk => input += chunk);
  process.stdin.on('end', () => {
    process.stdout.write(input);
  });
}

main();
