---
name: verify
description: 运行验证循环，确保代码质量。
disable-model-invocation: true
argument-hint: [--quick] [--fix]
context: fork
agent: orchestrator
allowed-tools: Read, Write, Edit, Grep, Glob, Bash, Agent
---

# /ai-dev-create:verify - 运行验证循环

执行完整的验证流程，确保代码满足质量标准。

## 使用方式

```bash
/ai-dev-create:verify              # 完整验证
/ai-dev-create:verify --quick      # 快速验证（跳过测试）
/ai-dev-create:verify --fix        # 自动修复可修复的问题
```

## 验证流程

```
BUILD → TYPE → LINT → TEST → SECURITY → DIFF → CONSTRAINT-MAP → CONSTRAINT-BEHAVIOR
```

### Phase 1: BUILD

检查项目是否能够成功构建。

```bash
# TypeScript
npm run build

# Python
pip install -r requirements.txt

# Java
mvn clean compile
```

### Phase 2: TYPE

类型检查。

```bash
# TypeScript
npx tsc --noEmit

# Python
pyright .
```

### Phase 3: LINT

代码风格检查。

```bash
# TypeScript
npm run lint

# Python
ruff check .
```

### Phase 4: TEST

运行测试套件并**验证覆盖率阈值**。

```bash
# TypeScript (Jest)
npm test -- --coverage
# 检查覆盖率输出或读取 coverage/coverage-summary.json
# 要求: lines >= 80%, branches >= 75%, functions >= 80%

# Python (pytest)
pytest --cov=src --cov-report=json tests/
# 读取 coverage.json 检查 thresholds

# Java (Maven Surefire + JaCoCo)
mvn test jacoco:report
# 读取 target/site/jacoco/index.html 或 XML 报告
```

**覆盖率阈值强制检查**：

运行测试后，必须从覆盖率报告中提取实际数字并验证：

| 指标 | 最低阈值 | 检查方式 |
|------|----------|----------|
| 行覆盖率 (Lines) | >= 80% | 解析 coverage-summary.json / coverage.json / jacoco.xml |
| 分支覆盖率 (Branches) | >= 75% | 同上 |
| 函数覆盖率 (Functions) | >= 80% | 同上 |

如果任何指标低于阈值：
1. 在验证报告中标记为 ❌ FAIL
2. 列出具体差距（如 "行覆盖率 72%，差 8 个百分点"）
3. 回退到 TEST 阶段补充测试
4. 更新重试计数，若超过 3 次则请求用户决策

> 覆盖率检查已包含在 Phase 4: TEST 阶段中，不再单独作为 Phase。

### Phase 5: SECURITY

安全扫描。

- 无硬编码密钥
- 无敏感信息日志
- 无调试代码残留
- **依赖漏洞扫描**（如果项目支持）:
  - Node.js: `npm audit` 或 `yarn audit`
  - Python: `pip-audit` 或 `safety check`
  - Java: `mvn org.owasp:dependency-check-maven:check`
- 如有 CRITICAL/HIGH 依赖漏洞，标记为 FAIL

### Phase 6: DIFF

变更审查。

```bash
git diff --stat
git diff --name-only
```

### Phase 7: CONSTRAINT-MAP

约束-代码追溯验证。

```bash
# 由 orchestrator 动态构造路径，使用 ${CLAUDE_PLUGIN_ROOT} 环境变量
# 如未设置，使用插件根目录自动推断
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/../.." && pwd)}"
node "${PLUGIN_ROOT}/scripts/verify-constraints.js" .claude/constraints/{feature}/constraint-tree.yaml
```

检查项目：
- 每条约束（constraint_ids）是否有对应函数实现
- 函数签名与约束树中的定义一致
- 无孤立函数（定义了但约束树中没有的函数）
- 生成覆盖报告到 `.claude/reports/constraint-coverage.md`

### Phase 8: CONSTRAINT-BEHAVIOR

约束行为验证——确保"函数存在"≠"约束满足"。

1. 从 `constraint-tree.yaml` 的 `tests` 字段提取测试用例名/描述
2. 在测试文件中 grep 验证每个测试用例实际存在
3. 运行测试，从测试报告提取 PASS/FAIL 状态
4. 如果测试 FAIL，标记该约束为"行为未覆盖"

## 输出格式

```markdown
# 验证报告

## 概览
| 阶段 | 状态 | 详情 |
|------|------|------|
| Build | ✅ PASS | 无错误 |
| Type | ✅ PASS | 无类型错误 |
| Lint | ⚠️ WARN | 3 个警告 |
| Test | ✅ PASS | 50/50 通过，Lines: 85% / Branches: 78% / Functions: 82% |
| Security | ✅ PASS | 无问题 |
| Diff | ✅ PASS | 5 个文件变更 |
| Constraint-Map | ✅ PASS | 12/12 约束已覆盖 |

## 结论
✅ 验证通过，可以提交 PR
```

## 验证失败处理

1. **Build 失败**：修复构建错误后继续
2. **Type 失败**：修复类型错误
3. **Lint 失败**：自动修复或手动修复
4. **Test 失败**：分析失败原因，修复代码或测试
5. **Security 失败**：CRITICAL 立即修复

## 前置条件

> 注意：独立 REVIEW 阶段应在 VERIFY 之前完成（见 orchestrator.md 步骤 5）。
> 如尚未执行 REVIEW，请先运行 `ai-dev-create:review`。

## 下一步

验证通过后：
- 创建 PR
- 如 VERIFY 失败，根据失败类型回退到对应阶段（见 orchestrator.md 失败恢复表）

---

## Agent 调用

本命令需要调用以下 Agent：

### 调用的 Agent

| Agent | 调用时机 | 输入 | 输出 |
|-------|----------|------|------|
| (implementer 自检) | SECURITY 或 DIFF 失败时 | 代码变更 | 修复报告 |

### 调用方式

```
Agent 工具参数：
- subagent_type: "ai-dev-create:implementer"
- description: "代码审查"
- prompt: "审查以下代码变更的质量和安全性：
  变更文件：{文件列表}
  检查维度：质量、安全、性能、可维护性"
```

### 上下文传递

**接收的上下文**：
- 变更文件列表
- 测试覆盖率报告
- 构建结果

**输出的上下文**：
- 验证报告
- 问题分类（如有）
- 回退建议（如失败）

### 执行流程

1. 运行 BUILD 检查
2. 运行 TYPE 检查
3. 运行 LINT 检查
4. 运行 TEST 检查（含覆盖率阈值验证: lines >= 80%, branches >= 75%, functions >= 80%）
5. 运行 SECURITY 检查（含依赖漏洞扫描）
6. 运行 DIFF 审查
7. 生成验证报告