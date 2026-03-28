---
name: sdd-standard
description: 标准 SDD 流程入口。适用于中等复杂度功能开发，包含规范、计划、测试、实现、审查、验证完整流程。
disable-model-invocation: true
argument-hint: [功能描述]
context: fork
agent: orchestrator
allowed-tools: Read, Write, Edit, Grep, Glob, Bash, Agent
---

# SDD Standard - 标准开发流程

适用于以下场景：
- 中等复杂度功能（多模块、需要设计）
- 新功能开发
- 需要文档记录的功能

## 流程概览

```
$ARGUMENTS
    ↓
CLARIFY (简单澄清，如需要)
    ↓
SPEC (功能规范)
    ↓
PLAN (实现计划)
    ↓
TEST (测试用例)
    ↓
IMPL (代码实现)
    ↓
REVIEW (代码审查)
    ↓
VERIFY (最终验证)
```

## 执行步骤

### Step 1: 简单澄清

如果需求描述不够清晰，调用 Agent 工具进行澄清：

**调用方式**：
```
Agent 工具参数：
- subagent_type: "ai-dev-create:clarifier"
- description: "需求澄清"
- prompt: "对以下需求进行澄清，检查清晰度（实体/动作/约束是否明确）：$ARGUMENTS"
```

如果清晰度 < 0.8，等待澄清结果；否则直接进入下一步。

### Step 2: 规范阶段

调用 Agent 工具创建功能规范：

**调用方式**：
```
Agent 工具参数：
- subagent_type: "ai-dev-create:planner"
- description: "创建功能规范"
- prompt: |
  使用 SPEC 模式创建功能规范：
  - 输入：$ARGUMENTS
  - 输出：.claude/specs/{feature}.md

  规范必须包含：
  - 用户故事
  - 功能需求
  - 非功能需求
  - 验收标准（Given-When-Then 格式）
```

用户确认规范后进入下一阶段。

### Step 3: 计划阶段

调用 Agent 工具创建实现计划：

**调用方式**：
```
Agent 工具参数：
- subagent_type: "ai-dev-create:planner"
- description: "创建实现计划"
- prompt: |
  使用 PLAN 模式创建实现计划：
  - 输入：规范文档 .claude/specs/{feature}.md
  - 输出：.claude/plans/{feature}.md

  计划必须包含：
  - 架构变更
  - 实现步骤（带进度标记）
  - 测试策略
  - 风险评估
```

### Step 4: 测试阶段

调用 Agent 工具编写测试：

**调用方式**：
```
Agent 工具参数：
- subagent_type: "ai-dev-create:tester"
- description: "编写测试用例"
- prompt: |
  根据计划编写测试用例：
  - 输入：计划文档 .claude/plans/{feature}.md
  - 输出：测试文件

  确保测试处于 RED 状态（测试应该失败）。
  目标覆盖率：≥ 80%
```

### Step 5: 实现阶段

调用 Agent 工具实现代码：

**调用方式**：
```
Agent 工具参数：
- subagent_type: "ai-dev-create:implementer"
- description: "实现功能代码"
- prompt: |
  根据测试用例实现功能代码：
  - 输入：测试文件 + 计划文档
  - 输出：生产代码

  目标：使所有测试通过（GREEN 状态）。
  每完成一个步骤，更新计划文档的进度标记。
```

### Step 6: 审查阶段

调用 Agent 工具审查代码：

**调用方式**：
```
Agent 工具参数：
- subagent_type: "ai-dev-create:reviewer"
- description: "代码审查"
- prompt: |
  审查代码质量：
  - 检查代码质量
  - 检查安全性
  - 检查可维护性

  确保无 CRITICAL/HIGH 问题。
```

### Step 7: 验证阶段

运行完整验证：

```
BUILD → TYPE → LINT → TEST → SECURITY → DIFF
```

## 成功标准

- [ ] 规范文档已创建并确认
- [ ] 计划文档已创建
- [ ] 所有测试通过
- [ ] 覆盖率 ≥ 80%
- [ ] 无 CRITICAL/HIGH 问题
- [ ] 所有验证通过

## 使用示例

```bash
# 中等复杂度功能
/sdd-standard 实现用户认证模块，包含注册、登录、JWT token 管理

# 新 API 开发
/sdd-standard 创建订单管理 API，支持 CRUD 操作和状态流转

# 功能增强
/sdd-standard 为产品模块添加批量导入功能，支持 CSV 和 Excel
```
