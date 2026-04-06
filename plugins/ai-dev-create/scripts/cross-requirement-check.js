#!/usr/bin/env node
/**
 * cross-requirement-check.js
 * 扫描所有需求目录，检测跨需求冲突
 *
 * 检测类别：
 * 1. 命名冲突：同一函数/类名在多个需求中定义
 * 2. 路径冲突：同一文件被多个需求计划修改
 * 3. 约束冲突：同一端点或组件在不同需求中有矛盾的约束
 * 4. 依赖冲突：一个需求依赖的接口被另一个需求删除/修改
 *
 * 用法:
 *   node cross-requirement-check.js                    # 全局扫描
 *   node cross-requirement-check.js --json             # 输出 JSON
 *   node cross-requirement-check.js --gate pre-spec    # 仅命名+路径+约束检查
 *   node cross-requirement-check.js --gate post-plan   # 仅依赖循环检查
 *   node cross-requirement-check.js --gate pre-test    # 仅跨需求引用验证
 *   node cross-requirement-check.js --all              # 全部检查
 *
 * 输出:
 *   - 控制台: 人类可读摘要
 *   - 文件: .claude/adc-result/reports/cross-requirement-conflicts.md
 */

const fs = require('fs');
const path = require('path');

const cwd = process.cwd();
const requestsDir = path.join(cwd, '.claude', 'adc-result', 'request');
const reportsDir = path.join(cwd, '.claude', 'adc-result', 'reports');

// ============================================================
// 解析参数
// ============================================================
const args = process.argv.slice(2);
const outputJson = args.includes('--json');
const gate = args.find(a => a.startsWith('--gate='))?.split('=')[1]
  || args.find((a, i) => a === '--gate' && args[i + 1])?.let?.((_, i) => args[args.indexOf('--gate') + 1]);
const allChecks = args.includes('--all');

// 解析 --gate 参数中 --gate 后面跟值的方式（无等号）
let gateMode = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--gate' && args[i + 1]) { gateMode = args[i + 1]; break; }
  if (args[i].startsWith('--gate=')) { gateMode = args[i].split('=')[1]; break; }
}

// ============================================================
// 扫描所有需求目录
// ============================================================
function scanRequests() {
  if (!fs.existsSync(requestsDir)) return [];
  return fs.readdirSync(requestsDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('.'))
    .map(d => {
      const reqDir = path.join(requestsDir, d.name);
      const constraintTree = path.join(reqDir, 'constraint-tree.yaml');
      const planFile = path.join(reqDir, 'plan.md');
      const specFile = path.join(reqDir, 'spec.md');
      const convergentSummary = path.join(reqDir, 'summaries', 'convergent-summary.md');
      return {
        name: d.name,
        dir: reqDir,
        hasConstraintTree: fs.existsSync(constraintTree),
        hasPlan: fs.existsSync(planFile),
        hasSpec: fs.existsSync(specFile),
        hasConvergentSummary: fs.existsSync(convergentSummary),
        constraintTree: fs.existsSync(constraintTree) ? fs.readFileSync(constraintTree, 'utf8') : null,
        plan: fs.existsSync(planFile) ? fs.readFileSync(planFile, 'utf8') : null,
        spec: fs.existsSync(specFile) ? fs.readFileSync(specFile, 'utf8') : null,
        convergentSummary: fs.existsSync(convergentSummary) ? fs.readFileSync(convergentSummary, 'utf8') : null
      };
    });
}

// ============================================================
// 从约束树提取函数名
// ============================================================
function extractFunctions(req) {
  if (!req.constraintTree) return [];
  const functions = [];
  // 匹配 YAML 中的 function 节点:
  //   function: create_user_service
  //   sig: "createUserService(req: Request): Promise<Response>"
  const funcPattern = /function:\s*(.+)/g;
  let match;
  while ((match = funcPattern.exec(req.constraintTree)) !== null) {
    const name = match[1].trim();
    functions.push({ name, req: req.name });
  }
  return functions;
}

// ============================================================
// 从计划中提取目标文件路径
// ============================================================
function extractTargetFiles(req) {
  if (!req.plan) return [];
  const files = [];
  // 匹配 markdown 中的代码块路径: ```path/to/file.ext
  const blockPattern = /```[a-z]*\s*([\w./\-]+\.\w+)/g;
  let match;
  while ((match = blockPattern.exec(req.plan)) !== null) {
    files.push({ path: match[1], req: req.name });
  }
  // 匹配 "文件:" 或 "Files to Modify:" 后面的路径列表
  const fileListPattern = /\|\s*([\w./\-]+\.\w+)\s*\|(?:\s*\w+\s*){0,2}\|/g;
  while ((match = fileListPattern.exec(req.plan)) !== null) {
    files.push({ path: match[1], req: req.name });
  }
  // 去重
  const seen = new Set();
  return files.filter(f => { if (seen.has(f.path + f.req)) return false; seen.add(f.path + f.req); return true; });
}

// ============================================================
// 提取数值约束
// ============================================================
function extractConstraints(req) {
  if (!req.constraintTree && !req.convergentSummary) return [];
  const sources = [req.constraintTree || '', req.convergentSummary || ''];
  const constraints = [];

  // 匹配数值约束: < 200ms, max 1000, > 50, <= 80%, 等
  const patterns = [
    /([<>=!]+)\s*(\d+)(ms|m?s|%|items?|req(uest)?s?)/gi,
    /max(?:imum)?\s*(\d+)\s*(\w+)/gi,
    /min(?:imum)?\s*(\d+)\s*(\w+)/gi,
    /(?:response\s*time|timeout|limit|max|threshold)[\s:]*[<>=]*\s*(\d+)?\s*(ms|m?s|%|items?)?/gi,
    /(?:行[覆盖率]*)\s*>=\s*(\d+)%/gi,
    /(?:分支[覆盖率]*)\s*>=\s*(\d+)%/gi
  ];

  for (const source of sources) {
    for (const p of patterns) {
      p.lastIndex = 0;
      let m;
      while ((m = p.exec(source)) !== null) {
        constraints.push({
          raw: m[0],
          req: req.name,
          context: source.substring(Math.max(0, m.index - 30), m.index + m[0].length + 30)
        });
      }
    }
  }

  return constraints;
}

// ============================================================
// 提取依赖图信息
// ============================================================
function extractDependencies(req) {
  if (!req.constraintTree && !req.plan) return [];
  const sources = [req.constraintTree || '', req.plan || ''];
  const deps = [];

  // 匹配 depends_on / depends / 依赖 / 依赖于 等模式
  const depPattern = /(?:depends[_\s]*on|depends|依赖[于]?|需要|调用|使用)\s*([a-zA-Z_][\w.]*(?:\([^)]*\))?)/g;

  for (const source of sources) {
    depPattern.lastIndex = 0;
    let m;
    while ((m = depPattern.exec(source)) !== null) {
      deps.push({
        target: m[1].trim().replace(/\(.*\)/, ''),
        req: req.name,
        context: source.substring(Math.max(0, m.index - 30), m.index + m[0].length)
      });
    }
  }
  return deps;
}

// ============================================================
// 1. 命名冲突检测
// ============================================================
function checkNamingConflicts(requests) {
  const nameMap = new Map();

  for (const req of requests) {
    const funcs = extractFunctions(req);
    for (const f of funcs) {
      if (!nameMap.has(f.name)) nameMap.set(f.name, []);
      nameMap.get(f.name).push(f.req);
    }
  }

  const conflicts = [];
  for (const [name, reqs] of nameMap.entries()) {
    const uniqueReqs = [...new Set(reqs)];
    if (uniqueReqs.length >= 2) {
      conflicts.push({
        type: 'naming',
        name,
        requests: uniqueReqs,
        severity: 'HIGH',
        resolution: '建议为各需求的函数添加需求前缀，如 ' +
          uniqueReqs.map(r => `${name}_${r.replace(/-/g, '_')}`).join(', ')
      });
    }
  }
  return conflicts;
}

// ============================================================
// 2. 路径冲突检测
// ============================================================
function checkPathConflicts(requests) {
  const pathMap = new Map();

  for (const req of requests) {
    const files = extractTargetFiles(req);
    for (const f of files) {
      if (!pathMap.has(f.path)) pathMap.set(f.path, []);
      pathMap.get(f.path).push(f.req);
    }
  }

  const conflicts = [];
  for (const [p, reqs] of pathMap.entries()) {
    const uniqueReqs = [...new Set(reqs)];
    if (uniqueReqs.length >= 2) {
      conflicts.push({
        type: 'path',
        path: p,
        requests: uniqueReqs,
        severity: 'MEDIUM',
        resolution: '多个需求计划修改同一文件。建议协调编辑顺序，或使用 section marker 分隔修改区域'
      });
    }
  }
  return conflicts;
}

// ============================================================
// 3. 约束冲突检测
// ============================================================
function checkConstraintConflicts(requests) {
  const allConstraints = [];
  for (const req of requests) {
    allConstraints.push(...extractConstraints(req));
  }

  // 提取可比较的数值约束
  const numericConstraints = new Map(); // key: normalized context, value: [{value, req, raw}]
  const numPattern = /[<>=!]+\s*(\d+)/;

  for (const c of allConstraints) {
    const numMatch = c.raw.match(numPattern);
    if (numMatch) {
      // 归一化：取 context 中约束类型的核心描述作为 key
      const key = c.context.replace(/[<>=!0-9]+/g, '').trim().substring(0, 50);
      if (!numericConstraints.has(key)) numericConstraints.set(key, []);
      numericConstraints.get(key).push({
        value: parseInt(numMatch[1]),
        req: c.req,
        raw: c.raw
      });
    }
  }

  const conflicts = [];
  for (const [, entries] of numericConstraints) {
    if (entries.length < 2) continue;
    const uniqueValues = [...new Set(entries.map(e => e.value))];
    if (uniqueValues.length >= 2) {
      // 取不同需求的值进行对比
      const reqValues = [...new Map(entries.map(e => [e.req, e.value]))];
      if (reqValues.length >= 2) {
        const minVal = Math.min(...uniqueValues);
        const maxVal = Math.max(...uniqueValues);
        conflicts.push({
          type: 'constraint',
          description: '不同需求对同一约束有不同阈值',
          details: reqValues.map(([r, v]) => `${r}: ${v}`).join(' vs '),
          requests: reqValues.map(([r]) => r),
          severity: 'HIGH',
          resolution: `建议采用更严格的值: ${minVal}（安全优先）或根据需求优先级确认正确值`
        });
      }
    }
  }
  return conflicts;
}

// ============================================================
// 4. 依赖冲突检测
// ============================================================
function checkDependencyConflicts(requests) {
  const allDeps = [];
  for (const req of requests) {
    allDeps.push(...extractDependencies(req));
  }

  // 检查：需求 A 依赖的接口是否被需求 B 修改/删除
  // 简化：检查依赖目标是否存在于另一个需求的目标文件中
  const conflicts = [];
  const depByReq = new Map();
  for (const d of allDeps) {
    if (!depByReq.has(d.req)) depByReq.set(d.req, []);
    depByReq.get(d.req).push(d);
  }

  for (const [reqA, depsA] of depByReq) {
    for (const [reqB, depsB] of depByReq) {
      if (reqA === reqB) continue;
      // 检查是否有相同的目标依赖
      for (const depA of depsA) {
        for (const depB of depsB) {
          if (depA.target === depB.target && depA.target.length > 2) {
            // 相同依赖目标但不同需求
            conflicts.push({
              type: 'dependency',
              target: depA.target,
              requests: [reqA, reqB],
              severity: 'LOW',
              resolution: `${reqA} 和 ${reqB} 均依赖 ${depA.target}，建议提取为共享接口`
            });
          }
        }
      }
    }
  }

  // 去重
  const seen = new Set();
  return conflicts.filter(c => {
    const key = c.target + c.requests.sort().join(',');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ============================================================
// 汇总报告
// ============================================================
function generateReport(requests, allConflicts) {
  const naming = allConflicts.filter(c => c.type === 'naming');
  const pathing = allConflicts.filter(c => c.type === 'path');
  const constraints = allConflicts.filter(c => c.type === 'constraint');
  const deps = allConflicts.filter(c => c.type === 'dependency');

  if (outputJson) {
    console.log(JSON.stringify({
      requestsScanned: requests.map(r => r.name),
      totalConflicts: allConflicts.length,
      naming: naming,
      path: pathing,
      constraint: constraints,
      dependency: deps
    }, null, 2));
    return;
  }

  // 生成 Markdown 报告
  let report = `# 跨需求冲突检查报告\n\n`;
  report += `> 生成时间: ${new Date().toISOString()}\n\n`;
  report += `## 概览\n\n`;
  report += `- 扫描需求数: ${requests.length}\n`;
  report += `- 总冲突数: ${allConflicts.length}\n`;
  report += `  - 命名冲突: ${naming.length}\n`;
  report += `  - 路径冲突: ${pathing.length}\n`;
  report += `  - 约束冲突: ${constraints.length}\n`;
  report += `  - 依赖冲突: ${deps.length}\n\n`;

  if (allConflicts.length === 0) {
    report += `## 结果\n\n未发现跨需求冲突。\n`;
  } else {
    report += `## 详细结果\n\n`;

    for (const c of allConflicts) {
      report += `### ${c.severity} [${c.type}] ${getConflictTitle(c)}\n\n`;
      report += `- 涉及需求: ${c.requests.join(', ')}\n`;
      if (c.path) report += `- 文件: ${c.path}\n`;
      if (c.name) report += `- 冲突名: ${c.name}\n`;
      if (c.details) report += `- 详情: ${c.details}\n`;
      if (c.target) report += `- 目标: ${c.target}\n`;
      report += `- 建议: ${c.resolution}\n\n`;
    }
  }

  // 写入报告文件
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  const reportFile = path.join(reportsDir, 'cross-requirement-conflicts.md');
  fs.writeFileSync(reportFile, report, 'utf8');

  // 控制台摘要输出
  console.log(`[CrossReqCheck] 扫描了 ${requests.length} 个需求`);
  if (allConflicts.length > 0) {
    console.log(`[CrossReqCheck] 发现 ${allConflicts.length} 个冲突:`);
    for (const c of allConflicts) {
      console.log(`  - [${c.severity}] ${c.type}: ${getConflictTitle(c)} (${c.requests.join(', ')}) → ${c.resolution}`);
    }
    console.log(`[CrossReqCheck] 报告已写入: ${path.relative(cwd, reportFile)}`);
  } else {
    console.log(`[CrossReqCheck] 未发现跨需求冲突`);
  }

  // 退出码：有 HIGH/CRITICAL 冲突时返回非零
  const critical = allConflicts.filter(c => c.severity === 'HIGH' || c.severity === 'CRITICAL');
  process.exitCode = critical.length > 0 ? 1 : 0;
}

function getConflictTitle(c) {
  if (c.name) return `\`${c.name}\` 命名冲突`;
  if (c.path) return `\`${c.path}\` 路径冲突`;
  if (c.details) return c.details;
  if (c.target) return `\`${c.target}\` 依赖冲突`;
  return '未知冲突';
}

// ============================================================
// Gate 过滤：根据阶段只运行相关检查
// ============================================================
function runChecks(requests) {
  const checks = {
    'pre-spec': () => [...checkNamingConflicts(requests), ...checkPathConflicts(requests), ...checkConstraintConflicts(requests)],
    'post-plan': () => checkDependencyConflicts(requests),
    'pre-test': () => [], // 跨需求引用验证需从约束树读取，轻量实现留作 TODO
    'all': () => [
      ...checkNamingConflicts(requests),
      ...checkPathConflicts(requests),
      ...checkConstraintConflicts(requests),
      ...checkDependencyConflicts(requests)
    ]
  };

  if (gateMode && checks[gateMode]) return checks[gateMode]();
  if (allChecks || !gateMode) return checks['all']();

  return [];
}

// ============================================================
// 主入口
// ============================================================
function main() {
  const requests = scanRequests();
  if (requests.length < 2) {
    // 不足 2 个需求，无需检查
    if (outputJson) {
      console.log(JSON.stringify({ requestsScanned: requests.length, totalConflicts: 0, message: '需求数不足 2，跳过检查' }, null, 2));
    } else {
      console.log(`[CrossReqCheck] 仅找到 ${requests.length} 个需求，无需跨需求检查`);
    }
    return;
  }

  // Gate 过滤运行
  const conflicts = runChecks(requests);

  // 生成报告
  generateReport(requests, conflicts);
}

main();
