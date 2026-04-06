#!/usr/bin/env node
/**
 * detect-project-context.js
 * 检测项目类型（新/老/演进中/混合），提取代码风格、命名约定、测试框架、架构模式等信息。
 * 输出 .claude/project-context.md 并缓存结果。
 *
 * 缓存策略: 结果缓存在 .claude/.project-context-cache.json，TTL 30 分钟。
 */

const fs = require('fs');
const path = require('path');

const PLUGIN_ROOT = path.resolve(__dirname, '..');
const CLAUDE_DIR = path.join(process.cwd(), '.claude');
const CACHE_FILE = path.join(CLAUDE_DIR, '.project-context-cache.json');
const OUTPUT_FILE = path.join(CLAUDE_DIR, 'project-context.md');
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

// Source file extensions by language
const LANG_EXTENSIONS = {
  typescript: ['.ts', '.tsx'],
  javascript: ['.js', '.jsx', '.mjs', '.cjs'],
  python: ['.py', '.pyi'],
  go: ['.go'],
  rust: ['.rs'],
  java: ['.java'],
  ruby: ['.rb'],
  php: ['.php'],
  csharp: ['.cs'],
};

const IGNORE_DIRS = ['node_modules', '.git', '.claude', 'target', '.next', 'dist', 'build', 'coverage', '__pycache__', '.venv'];

// --- Cache ---

function loadCache() {
  try {
    const raw = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    if (Date.now() - raw.timestamp < CACHE_TTL_MS) {
      return raw.context;
    }
  } catch {
    // no-op
  }
  return null;
}

function saveCache(context) {
  try {
    if (!fs.existsSync(CLAUDE_DIR)) {
      fs.mkdirSync(CLAUDE_DIR, { recursive: true });
    }
    fs.writeFileSync(CACHE_FILE, JSON.stringify({ timestamp: Date.now(), context }, null, 2));
  } catch {
    // no-op
  }
}

// --- Project root detection ---

function getProjectRoot(dir = process.cwd()) {
  const indicators = ['package.json', 'go.mod', 'Cargo.toml', 'pom.xml', 'build.gradle', 'build.gradle.kts', 'pyproject.toml', 'requirements.txt', 'Gemfile', 'composer.json'];
  let current = dir;
  for (let i = 0; i < 10; i++) {
    for (const ind of indicators) {
      if (fs.existsSync(path.join(current, ind))) return current;
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return dir;
}

// --- Source file scanning ---

function scanSourceFiles(root) {
  const files = [];
  const exts = new Set();
  for (const [lang, extList] of Object.entries(LANG_EXTENSIONS)) {
    extList.forEach(e => exts.add(e));
  }

  walkDir(root, (abs, rel) => {
    const ext = path.extname(abs).toLowerCase();
    if (exts.has(ext)) {
      files.push({ abs, rel, ext, lang: extToLang(ext) });
    }
  });

  return files;
}

function walkDir(dir, callback) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (IGNORE_DIRS.includes(e.name)) continue;
    const abs = path.join(dir, e.name);
    const rel = path.relative(process.cwd(), abs);
    if (e.isDirectory()) {
      walkDir(abs, callback);
    } else {
      callback(abs, rel);
    }
  }
}

function extToLang(ext) {
  for (const [lang, exts] of Object.entries(LANG_EXTENSIONS)) {
    if (exts.includes(ext)) return lang;
  }
  return 'unknown';
}

// --- Build config mapping ---

const BUILD_CONFIGS = {
  'package.json': { name: 'npm/yarn/pnpm', buildFile: 'package.json' },
  'tsconfig.json': { name: 'TypeScript', buildFile: 'tsconfig.json' },
  'go.mod': { name: 'Go Modules', buildFile: 'go.mod' },
  'Cargo.toml': { name: 'Cargo/Rust', buildFile: 'Cargo.toml' },
  'requirements.txt': { name: 'pip', buildFile: 'requirements.txt' },
  'pyproject.toml': { name: 'pyproject', buildFile: 'pyproject.toml' },
  'pom.xml': { name: 'Maven', buildFile: 'pom.xml' },
  'build.gradle': { name: 'Gradle', buildFile: 'build.gradle' },
  'build.gradle.kts': { name: 'Gradle (Kotlin)', buildFile: 'build.gradle.kts' },
  'Gemfile': { name: 'Bundler/Ruby', buildFile: 'Gemfile' },
  'vite.config.ts': { name: 'Vite', buildFile: 'vite.config.ts' },
  'webpack.config.js': { name: 'Webpack', buildFile: 'webpack.config.js' },
  'next.config.js': { name: 'Next.js', buildFile: 'next.config.js' },
  'next.config.mjs': { name: 'Next.js', buildFile: 'next.config.mjs' },
  'nuxt.config.ts': { name: 'Nuxt', buildFile: 'nuxt.config.ts' },
  'jest.config.js': { name: 'Jest', buildFile: 'jest.config.js' },
  'jest.config.ts': { name: 'Jest', buildFile: 'jest.config.ts' },
  'vitest.config.ts': { name: 'Vitest', buildFile: 'vitest.config.ts' },
  'pytest.ini': { name: 'pytest', buildFile: 'pytest.ini' },
};

function detectBuildConfigs(root) {
  const configs = [];
  try {
    const entries = fs.readdirSync(root);
    for (const [file, info] of Object.entries(BUILD_CONFIGS)) {
      if (entries.includes(file)) {
        configs.push(info);
      }
    }
  } catch {
    // no-op
  }

  // Deep scan for framework-specific configs at any depth
  const frameworkFiles = [
    'vite.config.ts', 'vite.config.js', 'vite.config.mjs',
    'webpack.config.js', 'webpack.config.ts',
    'next.config.js', 'next.config.ts', 'next.config.mjs',
    'nuxt.config.ts', 'nuxt.config.js',
    'vue.config.js',
    'jest.config.js', 'jest.config.ts', 'jest.config.mjs',
    'vitest.config.ts', 'vitest.config.js',
    'tailwind.config.js', 'tailwind.config.ts',
    'pytest.ini', 'setup.cfg', '.pytest_cache', 'conftest.py',
  ];
  walkDir(root, (abs, rel) => {
    if (frameworkFiles.some(f => path.basename(abs) === f)) {
      if (!configs.find(c => c.buildFile === path.basename(abs))) {
        configs.push({ name: path.basename(abs), buildFile: rel });
      }
    }
  });

  return configs;
}

// --- New vs Old ---

function determineProjectType(sourceFiles, buildConfigs) {
  const hasSource = sourceFiles.length > 0;
  const hasConfig = buildConfigs.length > 0;

  if (!hasSource && !hasConfig) {
    return { type: 'NEW_PROJECT', confidence: 'HIGH' };
  }

  if (!hasSource && hasConfig) {
    // Config files but no source code (e.g., just initialized project)
    return { type: 'NEW_PROJECT', confidence: 'MEDIUM' };
  }

  // Has source code
  if (sourceFiles.length < 5) {
    return { type: 'NEW_PROJECT_EVOLVED', confidence: 'HIGH' };
  }

  return { type: 'OLD_PROJECT', confidence: 'HIGH' };
}

// --- Language detection (reuse from quality-check.js) ---

function detectLanguages(root) {
  // Reimplement the same logic inline to avoid require issues
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
  };

  try {
    const entries = fs.readdirSync(root, { withFileTypes: true });
    for (const entry of entries) {
      if (indicators[entry.name]) {
        indicators[entry.name].forEach(l => languages.add(l));
      }
    }
  } catch {
    // no-op
  }

  // Also detect from actual source files
  const sourceFiles = scanSourceFiles(root);
  for (const f of sourceFiles) {
    if (f.lang && f.lang !== 'unknown') {
      languages.add(f.lang);
    }
  }

  return [...languages];
}

// --- Architecture pattern detection ---

function detectArchitecture(root, sourceFiles) {
  const topDirs = getTopLevelDirectories(root);
  const dirNames = topDirs.map(d => d.toLowerCase());

  // MVC signals
  if (dirNames.includes('controllers') || dirNames.includes('views') || dirNames.includes('models')) {
    return { pattern: 'MVC', detail: 'controllers/views/models 结构' };
  }

  // Feature-based signals
  const hasSrc = topDirs.some(d => d === 'src');
  if (hasSrc) {
    try {
      const srcEntries = fs.readdirSync(path.join(root, 'src'), { withFileTypes: true });
      const srcDirs = srcEntries.filter(e => e.isDirectory()).map(e => e.name).filter(n => !IGNORE_DIRS.includes(n));
      // Each dir under src/ has __init__.py or index.ts or has sub-dir with same pattern
      const featureLike = srcDirs.filter(d => {
        const dirPath = path.join(root, 'src', d);
        try {
          const sub = fs.readdirSync(dirPath, { withFileTypes: true });
          return sub.some(s => s.isDirectory()) || sub.some(s => ['index.ts', 'index.tsx', '__init__.py', 'mod.rs'].includes(s.name));
        } catch {
          return false;
        }
      });
      if (featureLike.length >= 2) {
        return { pattern: 'feature-based', detail: `src/ 下按功能模块分: ${featureLike.slice(0, 5).join(', ')}` };
      }
    } catch {
      // no-op
    }
  }

  // Monorepo signals
  if (dirNames.includes('packages') || dirNames.includes('apps')) {
    const subRoot = dirNames.includes('packages') ? 'packages' : 'apps';
    try {
      const subDirs = fs.readdirSync(path.join(root, subRoot), { withFileTypes: true })
        .filter(e => e.isDirectory() && !IGNORE_DIRS.includes(e.name))
        .map(e => `${subRoot}/${e.name}/`);
      return { pattern: 'monorepo', detail: `monorepo 根目录，子项目: ${subDirs.join(', ')}`, subprojects: subDirs };
    } catch {
      return { pattern: 'monorepo', detail: '检测到 packages/ 或 apps/ 目录' };
    }
  }

  // Library / flat structure
  if (topDirs.some(d => d === 'lib')) {
    return { pattern: 'library', detail: 'lib/ 入口结构' };
  }

  // Check for layered structure (common in Java/Spring)
  if (dirNames.includes('controller') || dirNames.includes('service') || dirNames.includes('repository') || dirNames.includes('dao')) {
    return { pattern: 'layered', detail: '分层架构 (controller/service/repository)' };
  }

  return { pattern: 'flat', detail: '扁平或未识别的结构' };
}

function getTopLevelDirectories(root) {
  try {
    return fs.readdirSync(root, { withFileTypes: true })
      .filter(e => e.isDirectory() && !IGNORE_DIRS.includes(e.name))
      .map(e => e.name);
  } catch {
    return [];
  }
}

// --- Naming convention detection ---

function detectNamingConventions(root, sourceFiles) {
  // Filename-based analysis
  const filenames = sourceFiles.slice(0, 100).map(f => path.basename(f.rel, path.extname(f.rel)));
  const namingResults = {
    files: detectFileNamingCase(filenames),
    functions: analyzeFunctionNames(sourceFiles, root),
  };
  return namingResults;
}

function detectFileNamingCase(names) {
  const patterns = { kebab: 0, snake: 0, camel: 0, pascal: 0 };
  for (const name of names) {
    if (!name) continue;
    if (/^[a-z](?:[a-z0-9]*-[a-z0-9]*)+$/.test(name)) patterns.kebab++;
    else if (/^[a-z](?:[a-z0-9]*_[a-z0-9]*)+$/.test(name)) patterns.snake++;
    else if (/^[a-z][A-Z]/.test(name)) patterns.camel++;
    else if (/^[A-Z][a-z]/.test(name)) patterns.pascal++;
  }
  const max = Object.entries(patterns).reduce((a, b) => a[1] > b[1] ? a : b);
  const conventions = {
    kebab: 'kebab-case (如 my-service)',
    snake: 'snake_case (如 my_service)',
    camel: 'camelCase (如 myService)',
    pascal: 'PascalCase (如 MyService)',
  };
  return { style: max[0], examples: conventions[max[0]] || 'unknown', scores: patterns };
}

function analyzeFunctionNames(sourceFiles, root) {
  // Sample a few representative files and extract function/class names
  const samples = sourceFiles.slice(0, 10);
  const names = [];

  const funcPatterns = [
    /^\s*(?:export\s+)?(?:async\s+)?function\s+(\w+)/,
    /^\s*(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>|[a-zA-Z_$]\w*\s*=>)/,
    /^\s*(?:public\s+|private\s+|protected\s+)?(?:static\s+)?(?:async\s+)?(?:def\s+|fn\s+)?(\w+)\s*\(/,
    /^\s*func\s+(?:\([^)]*\)\s+)?(\w+)/,
    /^\s*class\s+(\w+)/,
  ];

  for (const file of samples) {
    try {
      const content = fs.readFileSync(file.abs, 'utf8');
      const lines = content.slice(0, 300).split('\n');
      for (const line of lines) {
        for (const pattern of funcPatterns) {
          const match = line.match(pattern);
          if (match && match[1] && !match[1].startsWith('_') && match[1].length > 2) {
            names.push(match[1]);
          }
        }
      }
    } catch {
      // no-op
    }
  }

  // Analyze case distribution
  let camel = 0, snake = 0, pascal = 0;
  for (const name of names.slice(0, 20)) {
    if (/^[a-z][a-z0-9]*([A-Z_]|_[a-z])/.test(name)) camel++;
    if (name.startsWith('_') || name.toLowerCase() === name) snake++;
    if (/^[A-Z]/.test(name)) pascal++;
  }

  const dominant = camel >= pascal && camel >= snake ? 'camelCase' : pascal >= camel && pascal >= snake ? 'PascalCase' : snake >= camel ? 'snake_case' : 'camelCase';
  return { style: dominant, sample: names.slice(0, 8) };
}

// --- Test framework detection ---

function detectTestFramework(root, sourceFiles) {
  const testFiles = sourceFiles.filter(f => /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(f.rel) || /_test\.py$/.test(f.rel) || /_test\.go$/.test(f.rel));

  // Also detect via build configs
  const buildConfigs = detectBuildConfigs(root);
  const hasJest = buildConfigs.some(c => c.name.includes('Jest'));
  const hasVitest = buildConfigs.some(c => c.name.includes('Vitest'));
  const hasPytest = buildConfigs.some(c => c.name.includes('pytest'));

  if (testFiles.length === 0 && !hasJest && !hasVitest && !hasPytest) {
    return null;
  }

  // Analyze test file patterns
  const frameworkSignals = {
    jest: 0,
    vitest: 0,
    pytest: 0,
    junit: 0,
    go_test: 0,
    cargo_test: 0,
  };

  for (const file of testFiles.slice(0, 10)) {
    try {
      const content = fs.readFileSync(file.abs, 'utf8').slice(0, 500);
      if (/jest\./.test(content)) frameworkSignals.jest++;
      if (/vi\.mock|vi\.fn|import.*vitest/.test(content)) frameworkSignals.vitest++;
      if (/@pytest|pytest\.|import pytest/.test(content)) frameworkSignals.pytest++;
      if (/@Test|@ExtendWith|class.*Test/.test(content)) frameworkSignals.junit++;
      if (/func Test/.test(content)) frameworkSignals.go_test++;
      if (/#\[test\]|mod tests/.test(content)) frameworkSignals.cargo_test++;
    } catch {
      // no-op
    }
  }

  // Config-based detection
  if (hasJest && frameworkSignals.jest === 0) frameworkSignals.jest = 1;
  if (hasVitest && frameworkSignals.vitest === 0) frameworkSignals.vitest = 1;
  if (hasPytest && frameworkSignals.pytest === 0) frameworkSignals.pytest = 1;

  const max = Object.entries(frameworkSignals).reduce((a, b) => a[1] > b[1] ? a : b);
  if (max[1] === 0) {
    // Default based on language
    const languages = detectLanguages(root);
    if (languages.includes('javascript') || languages.includes('typescript')) {
      return { framework: 'Jest (默认)', location: '检测失败，请手动指定', pattern: 'describe/it', mockStyle: 'jest.mock()' };
    }
    if (languages.includes('python')) {
      return { framework: 'pytest (默认)', location: '检测失败，请手动指定', pattern: 'test_ 函数', mockStyle: 'unittest.mock' };
    }
    return null;
  }

  const frameworkNames = {
    jest: 'Jest',
    vitest: 'Vitest',
    pytest: 'pytest',
    junit: 'JUnit',
    go_test: 'go test',
    cargo_test: 'cargo test',
  };
  const patterns = {
    jest: 'describe/it (BDD)',
    vitest: 'describe/it (BDD)',
    pytest: 'test_ 函数 (断言式)',
    junit: '@Test 方法',
    go_test: 'func TestXxx',
    cargo_test: '#[test] fn test_xxx',
  };
  const mocks = {
    jest: 'jest.mock() at module top',
    vitest: 'vi.mock() at module top',
    pytest: 'unittest.mock / pytest.fixture',
    junit: '@MockBean / Mockito',
    go_test: 'table-driven tests + mock interfaces',
    cargo_test: 'mockall crate / manual mocks',
  };
  const locations = {
    jest: testFiles.length > 0 ? inferTestLocation(testFiles) : 'tests/ 或同目录 *.test.*',
    vitest: testFiles.length > 0 ? inferTestLocation(testFiles) : 'tests/ 或同目录 *.test.*',
    pytest: testFiles.length > 0 ? inferTestLocation(testFiles) : 'tests/ 目录',
    junit: testFiles.length > 0 ? 'src/test/java/' : 'src/test/',
    go_test: '同目录 *_test.go 文件',
    cargo_test: '源文件内 #[cfg(test)] mod tests',
  };

  return {
    framework: frameworkNames[max[0]],
    location: locations[max[0]],
    pattern: patterns[max[0]],
    mockStyle: mocks[max[0]],
    sampleFiles: testFiles.slice(0, 5).map(f => f.rel),
  };
}

function inferTestLocation(testFiles) {
  const coLocated = testFiles.filter(f => f.rel.includes('/src/'));
  if (coLocated.length > testFiles.length / 2) {
    return 'co-located with source (*.test.* 同目录)';
  }
  return 'tests/ 目录';
}

// --- Error handling detection ---

function detectErrorHandling(sourceFiles) {
  const signals = {
    tryCatch: 0,
    resultPattern: 0,
    raiseException: 0,
    returnError: 0,
    promiseCatch: 0,
    panicThrow: 0,
  };

  for (const file of sourceFiles.slice(0, 10)) {
    try {
      const content = fs.readFileSync(file.abs, 'utf8');
      if (/try\s*{/.test(content)) signals.tryCatch++;
      if (/Result<[^>]+,\s*[^>]+>/.test(content) || /Result::</.test(content)) signals.resultPattern++;
      if (/raise\s+\w+Error|raise Exception/.test(content)) signals.raiseException++;
      if (/return\s+err\b|return\s+fmt\.Errorf/.test(content)) signals.returnError++;
      if (/\.catch\(/.test(content)) signals.promiseCatch++;
      if (/panic!\s*\(|throw\s+/.test(content)) signals.panicThrow++;
    } catch {
      // no-op
    }
  }

  const styles = [];
  if (signals.tryCatch > 0) styles.push('try-catch (结构化异常处理)');
  if (signals.resultPattern > 0) styles.push('Result<T, E> (Rust 错误枚举)');
  if (signals.raiseException > 0) styles.push('raise Exception (Python 异常)');
  if (signals.returnError > 0) styles.push('return error (Go 错误返回)');
  if (signals.promiseCatch > 0) styles.push('.catch() (Promise 链式处理)');
  if (signals.panicThrow > 0) styles.push('panic/throw (终止性错误)');

  return styles.length > 0 ? styles : ['未检测到明确的错误处理模式'];
}

// --- Code style detection ---

function detectCodeStyle(sourceFiles) {
  // Check for config files first
  const style = {
    indentation: null,
    semicolons: null,
    quotes: null,
    importStyle: null,
    lineLength: null,
  };

  // ESLint / Prettier
  for (const file of sourceFiles.slice(0, 1)) {
    const rootDir = path.dirname(file.abs);
    // Try to find config files
    const parent = findParentDir(rootDir);
    const configPaths = [
      '.eslintrc', '.eslintrc.js', '.eslintrc.json', '.eslintrc.yml',
      '.prettierrc', '.prettierrc.js', '.prettierrc.json',
      '.editorconfig',
    ];
    for (const cp of configPaths) {
      const fullPath = path.join(parent, cp);
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (cp.includes('prettierrc') || cp === '.eslintrc.json' || cp === '.eslintrc') {
          const parsed = safeParseJSON(content);
          if (parsed) {
            if (parsed.semi !== undefined) style.semicolons = parsed.semi ? '是' : '否';
            if (parsed.singleQuote !== undefined) style.quotes = parsed.singleQuote ? '单引号' : '双引号';
            if (parsed.tabWidth) style.indentation = `${parsed.tabWidth} spaces`;
            if (parsed.useTabs) style.indentation = 'tabs';
            if (parsed.printWidth) style.lineLength = parsed.printWidth;
          }
        }
        if (cp.includes('editorconfig')) {
          const indentSize = content.match(/indent_size\s*=\s*(\d+)/);
          const indentStyle = content.match(/indent_style\s*=\s*(\w+)/);
          if (indentSize) style.indentation = `${indentSize[1]} spaces`;
          if (indentStyle && indentStyle[1] === 'tab') style.indentation = 'tabs';
          const quote = content.match(/quote_type\s*=\s*(\w+)/);
          if (quote) style.quotes = quote[1] === 'single' ? '单引号' : '双引号';
        }
      } catch {
        // no-op
      }
    }
  }

  // If no configs found, sample files
  if (!style.indentation || !style.semicolons) {
    const sampleFiles = sourceFiles.filter(f => /\.(ts|tsx|js|jsx|py)$/.test(f.rel)).slice(0, 3);
    for (const file of sampleFiles) {
      try {
        const content = fs.readFileSync(file.abs, 'utf8');
        const first10Lines = content.split('\n').slice(0, 10).filter(l => l.trim());

        // Indentation
        if (!style.indentation) {
          const lineIndent = first10Lines.map(l => l.length - l.trimStart().length).filter(n => n > 0);
          if (lineIndent.length > 0) {
            const avg = Math.round(lineIndent.reduce((a, b) => a + b, 0) / lineIndent.length);
            style.indentation = avg >= 4 ? '4 spaces' : '2 spaces';
          }
        }

        // Semicolons (JS/TS only)
        if (!style.semicolons && /\.(ts|tsx|js|jsx)$/.test(file.rel)) {
          const linesEndings = first10Lines.filter(l => l.trim() && !l.trim().endsWith('{') && !l.trim().endsWith('}') && !l.trim().startsWith('//') && !l.trim().startsWith('import'));
          const semiCount = linesEndings.filter(l => l.trim().endsWith(';')).length;
          style.semicolons = semiCount / Math.max(linesEndings.length, 1) > 0.5 ? '是' : '否';
        }

        // Quotes
        if (!style.quotes) {
          const singleQuotes = (content.match(/'/g) || []).length;
          const doubleQuotes = (content.match(/"/g) || []).length;
          style.quotes = singleQuotes > doubleQuotes ? '单引号' : '双引号';
        }

        // Import style
        if (!style.importStyle) {
          if (/^import\s+\{/.test(content) || /^import\s+\w+\s+from/.test(content)) {
            style.importStyle = 'ES modules (import/export)';
          } else if (/require\(/.test(content)) {
            style.importStyle = 'CommonJS (require/module.exports)';
          }
        }
      } catch {
        // no-op
      }
    }
  }

  style.indentation = style.indentation || '2 spaces (默认)';
  style.semicolons = style.semicolons || 'N/A';
  style.quotes = style.quotes || 'N/A';
  style.importStyle = style.importStyle || 'N/A';

  return style;
}

function findParentDir(filePath) {
  let dir = path.dirname(filePath);
  for (let i = 0; i < 10; i++) {
    if (fs.existsSync(path.join(dir, 'package.json')) || fs.existsSync(path.join(dir, 'go.mod'))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) return dir;
    dir = parent;
  }
  return path.dirname(filePath);
}

function safeParseJSON(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

// --- Migration signal detection ---

function detectMigrationSignals(sourceFiles) {
  const extensionMap = {};
  for (const f of sourceFiles) {
    const base = path.basename(f.rel).replace(/\.(ts|tsx|js|jsx|py|pyi)$/, '');
    if (!extensionMap[base]) extensionMap[base] = [];
    extensionMap[base].push(f.ext);
  }

  const migrationPairs = [
    ['.js', '.ts'], ['.js', '.tsx'], ['.jsx', '.ts'], ['.jsx', '.tsx'],
    ['.py', '.pyi'],
  ];

  const migrating = [];
  for (const [ext1, ext2] of migrationPairs) {
    for (const [base, exts] of Object.entries(extensionMap)) {
      if (exts.includes(ext1) && exts.includes(ext2)) {
        migrating.push(`${base}${ext1} <-> ${base}${ext2}`);
      }
    }
  }

  return migrating;
}

// --- Monorepo subproject detection ---

function detectMonorepoSubprojects(root, sourceFiles) {
  const subprojectDirs = [];
  for (const dirName of ['packages', 'apps', 'services', 'modules']) {
    const fullPath = path.join(root, dirName);
    if (fs.existsSync(fullPath)) {
      try {
        const subs = fs.readdirSync(fullPath, { withFileTypes: true })
          .filter(e => e.isDirectory() && !IGNORE_DIRS.includes(e.name))
          .map(e => `${dirName}/${e.name}/`);
        subprojectDirs.push(...subs);
      } catch {
        // no-op
      }
    }
  }

  if (subprojectDirs.length === 0) return null;

  const subprojects = [];
  for (const subDir of subprojectDirs) {
    const subRoot = path.join(root, subDir);
    const subFiles = sourceFiles.filter(f => f.rel.startsWith(subDir));
    if (subFiles.length === 0) continue;

    const subLangs = [...new Set(subFiles.map(f => f.lang).filter(Boolean))];
    subprojects.push({
      path: subDir,
      sourceFileCount: subFiles.length,
      languages: subLangs,
    });
  }

  return subprojects.length > 0 ? subprojects : null;
}

// --- Output generation ---

function generateMarkdown(context) {
  const lines = [];

  // Header
  lines.push('# Project Context');
  lines.push('');
  lines.push(`> Generated: ${new Date().toISOString()}`);
  lines.push(`> Detection confidence: ${context.confidence}`);
  lines.push(`> Sources: ${context.source || 'auto-detected'}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Project Type
  lines.push('## Project Type');
  lines.push('');
  lines.push(`- **Type**: ${context.projectType}`);
  lines.push(`- **Migration status**: ${context.migrationStatus || 'stable'}`);
  if (context.languages && context.languages.length > 0) {
    lines.push(`- **Primary languages**: ${context.languages.join(', ')}`);
  }
  if (context.buildSystem) {
    lines.push(`- **Build system**: ${context.buildSystem}`);
  }
  if (context.packageManager) {
    lines.push(`- **Package manager**: ${context.packageManager}`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  if (context.projectType === 'NEW_PROJECT') {
    lines.push('## Default Conventions (no existing codebase detected)');
    lines.push('');
    lines.push('- **Language**: 等待用户或 Planner 决定');
    lines.push('- **Architecture**: TBD (Planner 在 PLAN 阶段决定)');
    lines.push('- **Naming**: camelCase 用于函数，PascalCase 用于类/组件');
    lines.push('- **Tests**: 使用与所选语言匹配的框架');
    lines.push('- **Error handling**: 语言特定最佳实践');
    lines.push('');
    lines.push('> 这是新项目。Planner 应决定架构模式，Implementer/Tester/Reviewer 应遵循 PLAN 文档中的约定。');
  } else {
    // Architecture
    if (context.architecture) {
      lines.push('## Architecture');
      lines.push('');
      lines.push(`- **Pattern**: ${context.architecture.pattern}`);
      lines.push(`- **Detail**: ${context.architecture.detail}`);
      if (context.architecture.subprojects) {
        context.architecture.subprojects.forEach(sp => {
          lines.push(`- **${sp}**: 子项目目录`);
        });
      }
      lines.push('');
      lines.push('---');
      lines.push('');
    }

    // Naming Conventions
    if (context.naming) {
      lines.push('## Naming Conventions');
      lines.push('');
      lines.push('| 对象 | 约定 | 示例 |');
      lines.push('|------|------|------|');
      if (context.naming.files) {
        lines.push(`| 文件名 | ${context.naming.files.style} | ${getExampleFilename(context.naming.files.style)} |`);
      }
      if (context.naming.functions) {
        lines.push(`| 函数/变量 | ${context.naming.functions.style} | 参考 Files to Reference |`);
      }
      lines.push('');
      lines.push('---');
      lines.push('');
    }

    // Test Framework
    if (context.testFramework) {
      lines.push('## Test Framework');
      lines.push('');
      lines.push(`- **Framework**: ${context.testFramework.framework}`);
      lines.push(`- **Location**: ${context.testFramework.location}`);
      lines.push(`- **Pattern**: ${context.testFramework.pattern}`);
      lines.push(`- **Mock style**: ${context.testFramework.mockStyle}`);
      lines.push('');
      lines.push('---');
      lines.push('');
    }

    // Error Handling
    if (context.errorHandling && context.errorHandling.length > 0) {
      lines.push('## Error Handling');
      lines.push('');
      context.errorHandling.forEach((eh, i) => {
        lines.push(i === 0 ? `- **Style**: ${eh}` : `- ${eh}`);
      });
      lines.push('');
      lines.push('---');
      lines.push('');
    }

    // Code Style
    if (context.codeStyle) {
      lines.push('## Code Style');
      lines.push('');
      lines.push(`- **Indentation**: ${context.codeStyle.indentation}`);
      lines.push(`- **Semicolons**: ${context.codeStyle.semicolons}`);
      lines.push(`- **Quote style**: ${context.codeStyle.quotes}`);
      lines.push(`- **Import style**: ${context.codeStyle.importStyle}`);
      if (context.codeStyle.lineLength) {
        lines.push(`- **Max line length**: ${context.codeStyle.lineLength}`);
      }
      lines.push('');
      lines.push('---');
      lines.push('');
    }

    // Files Reference
    if (context.refFiles && context.refFiles.length > 0) {
      lines.push('## Files to Reference for Style');
      lines.push('');
      context.refFiles.forEach(f => lines.push(`- ${f}`));
      lines.push('');
    }
  }

  // Important patterns placeholder for manual addition
  lines.push('---');
  lines.push('');
  lines.push('## Important Patterns to Follow');
  lines.push('');
  lines.push('> 由 Planner 和 Implementer 识别后更新此部分。');
  lines.push('');

  return lines.join('\n');
}

function getExampleFilename(style) {
  const examples = {
    kebab: 'user-service.ts',
    snake: 'user_service.py',
    camel: 'userService.js',
    pascal: 'UserService.ts',
  };
  return examples[style] || 'unknown';
}

// --- Main ---

function main() {
  projectRoot = getProjectRoot();

  // Load cache
  const cached = loadCache();
  if (cached) {
    fs.writeFileSync(OUTPUT_FILE, cached.markdown, 'utf8');
    console.log(`[detect-project-context] 缓存命中 (${cached.projectType})`);
    console.log(`[detect-project-context] 输出: ${OUTPUT_FILE}`);
    process.exit(0);
  }

  // Scan source files
  const sourceFiles = scanSourceFiles(projectRoot);

  // Detect build configs
  const buildConfigs = detectBuildConfigs(projectRoot);

  // Determine project type
  const { type, confidence } = determineProjectType(sourceFiles, buildConfigs);

  // Detect languages
  const languages = detectLanguages(projectRoot);

  // Detect architecture
  const architecture = type === 'NEW_PROJECT' ? null : detectArchitecture(projectRoot, sourceFiles);

  // Detect naming conventions
  const naming = type === 'NEW_PROJECT' ? null : detectNamingConventions(projectRoot, sourceFiles);

  // Detect test framework
  const testFramework = type === 'NEW_PROJECT' ? null : detectTestFramework(projectRoot, sourceFiles);

  // Detect error handling
  const errorHandling = type === 'NEW_PROJECT' ? [] : detectErrorHandling(sourceFiles);

  // Detect code style
  const codeStyle = type === 'NEW_PROJECT' ? null : detectCodeStyle(sourceFiles);

  // Detect migration signals
  const migratingFiles = type === 'NEW_PROJECT' ? [] : detectMigrationSignals(sourceFiles);

  // Detect monorepo subprojects
  const subprojects = type === 'NEW_PROJECT' ? null : detectMonorepoSubprojects(projectRoot, sourceFiles);

  // Build context object
  const context = {
    projectType: type,
    confidence,
    languages,
    migrationStatus: migratingFiles.length > 0 ? `migrating (${migratingFiles.join(', ')})` : 'stable',
    buildSystem: buildConfigs.length > 0 ? buildConfigs.map(c => c.name).join(', ') : null,
    packageManager: buildConfigs.find(c => c.buildFile === 'package.json') ? detectPackageManager(buildConfigs) : null,
    architecture,
    naming,
    testFramework,
    errorHandling,
    codeStyle,
    refFiles: getRefFiles(sourceFiles),
    subprojects,
    source: 'auto-detected',
  };

  // Generate markdown
  const markdown = generateMarkdown(context);

  // Write output
  if (!fs.existsSync(CLAUDE_DIR)) {
    fs.mkdirSync(CLAUDE_DIR, { recursive: true });
  }
  fs.writeFileSync(OUTPUT_FILE, markdown, 'utf8');

  // Cache
  saveCache({ markdown, projectType: type });

  // Report
  console.log(`[detect-project-context] 类型: ${type}`);
  console.log(`[detect-project-context] 语言: ${languages.join(', ') || '未检测到'}`);
  console.log(`[detect-project-context] 架构: ${architecture ? architecture.pattern : 'N/A'}`);
  console.log(`[detect-project-context] 测试: ${testFramework ? testFramework.framework : '未检测到'}`);
  console.log(`[detect-project-context] 置信度: ${confidence}`);
  console.log(`[detect-project-context] 输出: ${OUTPUT_FILE}`);
}

function detectPackageManager(buildConfigs) {
  // Check for lockfile
  const lockfiles = { 'package-lock.json': 'npm', 'yarn.lock': 'yarn', 'pnpm-lock.yaml': 'pnpm' };
  const root = getProjectRoot();
  for (const [file, mgr] of Object.entries(lockfiles)) {
    if (fs.existsSync(path.join(root, file))) return mgr;
  }
  // Check npx config
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
    if (pkg.packageManager) {
      const match = pkg.packageManager.match(/^(\w+)@/);
      if (match) return match[1];
    }
  } catch {
    // no-op
  }
  return 'unknown';
}

function getRefFiles(sourceFiles) {
  // Select representative files from each detected language
  const byLang = {};
  for (const f of sourceFiles) {
    if (!byLang[f.lang]) byLang[f.lang] = [];
    // Prefer files in src/ directory, skip test files
    if (f.rel.includes('/src/') && !/\.(test|spec)\./.test(f.rel)) {
      byLang[f.lang].push(f.rel);
    }
  }
  // If no src/ files, just pick any
  for (const f of sourceFiles) {
    if (!byLang[f.lang] && !/\.(test|spec)\./.test(f.rel)) {
      byLang[f.lang] = [f.rel];
    }
  }

  const result = [];
  for (const [, files] of Object.entries(byLang)) {
    result.push(...files.slice(0, 3));
  }
  return result.slice(0, 10);
}

let projectRoot;
main();
