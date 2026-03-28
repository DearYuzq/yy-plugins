---
name: tdd-quick
description: 快速 TDD 流程入口。适用于简单功能、bug 修复、小型重构。跳过完整需求澄清，直接进入测试驱动开发循环。
disable-model-invocation: true
argument-hint: [功能描述或文件路径]
context: fork
agent: general-purpose
allowed-tools: Read, Write, Edit, Grep, Glob, Bash, Agent
---

# TDD Quick - 快速开发流程

适用于以下场景：
- 简单功能实现（单模块、少量文件变更）
- Bug 修复
- 代码重构
- 需求已经非常明确

## 流程概览

```
$ARGUMENTS
    ↓
SPEC (轻量规范，可选)
    ↓
TEST (编写失败测试)
    ↓
IMPL (最小实现)
    ↓
VERIFY (验证通过)
```

## 执行步骤

### Step 1: 理解需求

分析输入参数 `$ARGUMENTS`：
- 如果是文件路径，读取并分析
- 如果是功能描述，理解核心需求

### Step 2: 轻量规范（可选）

对于简单功能，可以直接跳过。如需规范，创建 `.claude/specs/quick-{timestamp}.md`：

```markdown
# 快速规范

## 功能
$ARGUMENTS

## 验收标准
- [ ] AC-1: {验收条件}

## 技术方案
- 涉及文件：{文件列表}
- 测试文件：{测试文件}
```

### Step 3: TDD 循环

#### RED 阶段

使用 tester agent 编写失败的测试：

```
使用 tester agent 为以下功能编写测试：
- 功能：$ARGUMENTS
- 测试框架：根据项目自动检测
- 覆盖率目标：80%
```

运行测试确认失败。

#### GREEN 阶段

使用 implementer agent 实现最小代码使测试通过：

```
使用 implementer agent 实现功能，使测试通过。
遵循最小实现原则。
```

#### REFACTOR 阶段

使用 reviewer agent 检查代码质量：

```
使用 reviewer agent 审查最近变更的代码。
```

### Step 4: 验证

运行完整验证循环：
- BUILD: 构建通过
- TEST: 测试通过，覆盖率 ≥ 80%
- LINT: 代码风格通过

## 成功标准

- [ ] 所有测试通过
- [ ] 覆盖率 ≥ 80%
- [ ] 无 CRITICAL 问题
- [ ] 构建成功

## 使用示例

```bash
# 修复 bug
/tdd-quick 修复 UserService 中邮箱验证的 bug

# 简单功能
/tdd-quick 添加 User 实体的 fullName 计算属性

# 重构
/tdd-quick 重构 OrderService 的支付逻辑为策略模式
```
