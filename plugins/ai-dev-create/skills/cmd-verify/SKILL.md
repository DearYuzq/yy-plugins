---
name: verify
description: 运行验证循环，确保代码质量。
disable-model-invocation: true
argument-hint: [--quick] [--fix]
context: fork
agent: general-purpose
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
BUILD → TYPE → LINT → TEST → SECURITY → DIFF
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

运行测试套件。

```bash
# TypeScript
npm test -- --coverage

# Python
pytest --cov=src tests/

# Java
mvn test
```

### Phase 5: SECURITY

安全扫描。

- 无硬编码密钥
- 无敏感信息日志
- 无调试代码残留

### Phase 6: DIFF

变更审查。

```bash
git diff --stat
git diff --name-only
```

## 输出格式

```markdown
# 验证报告

## 概览
| 阶段 | 状态 | 详情 |
|------|------|------|
| Build | ✅ PASS | 无错误 |
| Type | ✅ PASS | 无类型错误 |
| Lint | ⚠️ WARN | 3 个警告 |
| Test | ✅ PASS | 50/50 通过 |
| Security | ✅ PASS | 无问题 |
| Diff | ✅ PASS | 5 个文件变更 |

## 结论
✅ 验证通过，可以提交 PR
```

## 验证失败处理

1. **Build 失败**：修复构建错误后继续
2. **Type 失败**：修复类型错误
3. **Lint 失败**：自动修复或手动修复
4. **Test 失败**：分析失败原因，修复代码或测试
5. **Security 失败**：CRITICAL 立即修复

## 下一步

验证通过后：
- `ai-dev-create:review` - 代码审查
- 创建 PR

---

## Agent 调用

本命令需要调用以下 Agent：

### 调用的 Agent

| Agent | 调用时机 | 输入 | 输出 |
|-------|----------|------|------|
| reviewer | SECURITY 或 DIFF 阶段 | 代码变更 | 审查报告 |

### 调用方式

```
Agent 工具参数：
- subagent_type: "ai-dev-create:reviewer"
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
4. 运行 TEST 检查
5. 运行 SECURITY 检查（使用 Agent 工具调用 reviewer agent）
6. 运行 DIFF 审查
7. 生成验证报告