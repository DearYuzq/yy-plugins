---
name: sdd-full
description: 完整 SDD 流程入口。适用于复杂项目，包含完整的 CLARIFY 发散-收敛流程、安全红蓝对抗验证。
disable-model-invocation: true
argument-hint: [功能描述]
context: fork
agent: orchestrator
allowed-tools: Read, Write, Edit, Grep, Glob, Bash, Agent, WebSearch
---

# SDD Full - 完整开发流程

适用于以下场景：
- 复杂功能（跨系统、多团队协作）
- 高风险功能（涉及安全、支付、合规）
- 需要深度需求分析的项目

## 流程概览

```
$ARGUMENTS
    ↓
┌─────────────────────────────────────────┐
│ CLARIFY 阶段                            │
├─────────────────────────────────────────┤
│ 发散阶段：                               │
│   Preprocessor → Diverger →             │
│   Decomposer → Challenger               │
│        ↓                                │
│   【用户确认点】                          │
│        ↓                                │
│ 收敛阶段：                               │
│   Completer → Explorer →                │
│   Red-Teamer → Blue-Teamer              │
└─────────────────────────────────────────┘
    ↓
SPEC → PLAN → TEST → IMPL → REVIEW → VERIFY
```

## 执行步骤

### Phase 0: CLARIFY 阶段

#### 发散阶段

**Step 0.1: Preprocessor**

调用 Agent 工具预处理需求：

**调用方式**：
```
Agent 工具参数：
- subagent_type: "ai-dev-create:preprocessor"
- description: "需求预处理"
- prompt: |
  分析需求，进行完整性、一致性、可行性检查：
  - 完整性检查（功能、用户、场景、数据、约束）
  - 一致性检查（逻辑、时序、资源、价值矛盾）
  - 可行性质疑
  - 计算可信度评分

  输出到：.claude/clarifications/{feature}/01-preprocessor-report.md
```

**Step 0.2: Diverger**

调用 Agent 工具发散探索：

**调用方式**：
```
Agent 工具参数：
- subagent_type: "ai-dev-create:diverger"
- description: "需求发散探索"
- prompt: |
  基于预处理报告进行发散探索：
  - MECE 分解（功能、用户、场景、时间维度）
  - 类比参考（使用 WebSearch 搜索类似产品）
  - What-If 场景生成
  - 反向思考

  输出到：.claude/clarifications/{feature}/02-diverger-report.md
```

**Step 0.3: Decomposer**

调用 Agent 工具拆解需求：

**调用方式**：
```
Agent 工具参数：
- subagent_type: "ai-dev-create:decomposer"
- description: "需求拆解"
- prompt: |
  构建需求树：
  - 将发散结果结构化
  - 建立需求依赖关系
  - 识别冲突需求

  输出到：.claude/clarifications/{feature}/03-decomposer-report.md
```

**Step 0.4: Challenger**

调用 Agent 工具挑战需求：

**调用方式**：
```
Agent 工具参数：
- subagent_type: "ai-dev-create:challenger"
- description: "需求挑战"
- prompt: |
  质疑需求，进行正交过滤：
  - 正交过滤，剔除不合理需求
  - 判定方法论冲突
  - 生成挑战报告

  输出到：.claude/clarifications/{feature}/04-challenger-report.md
```

**【用户确认点】**

使用 AskUserQuestion 工具请求用户确认发散阶段结果，确认后进入收敛阶段。

#### 收敛阶段

**Step 0.5: Completer**

调用 Agent 工具补全需求：

**调用方式**：
```
Agent 工具参数：
- subagent_type: "ai-dev-create:completer"
- description: "需求补全"
- prompt: |
  端到端检查需求完整性：
  - 需求链条完整性
  - 用户旅程覆盖
  - 边界情况补全

  输出到：.claude/clarifications/{feature}/05-completer-report.md
```

**Step 0.6: Explorer**

调用 Agent 工具技术验证：

**调用方式**：
```
Agent 工具参数：
- subagent_type: "ai-dev-create:explorer"
- description: "技术验证"
- prompt: |
  POC 验证技术可行性：
  - 生成验证代码
  - 执行技术可行性验证
  - 丢弃不可行方案

  输出到：.claude/clarifications/{feature}/06-explorer-report.md
```

**Step 0.7: Red-Teamer**

调用 Agent 工具安全攻击：

**调用方式**：
```
Agent 工具参数：
- subagent_type: "ai-dev-create:red-teamer"
- description: "安全攻击测试"
- prompt: |
  从攻击者视角发现安全漏洞：
  - 边界问题攻击
  - 安全漏洞发现
  - 生成攻击报告

  输出到：.claude/clarifications/{feature}/07-red-teamer-report.md
```

**Step 0.8: Blue-Teamer**

调用 Agent 工具防御方案：

**调用方式**：
```
Agent 工具参数：
- subagent_type: "ai-dev-create:blue-teamer"
- description: "安全防御设计"
- prompt: |
  评估红方攻击可防御性：
  - 评估红方攻击可防御性
  - 提供安全解决方案
  - 生成防御报告

  输出到：.claude/clarifications/{feature}/08-blue-teamer-report.md
```

**【最终评审】**

使用 AskUserQuestion 工具请求用户确认最终需求文档，进入 SPEC 阶段。

### Phase 1: SPEC 阶段

调用 Agent 工具创建功能规范：

**调用方式**：
```
Agent 工具参数：
- subagent_type: "ai-dev-create:planner"
- description: "创建功能规范"
- prompt: "使用 SPEC 模式创建功能规范，输入：最终需求文档"
```

### Phase 2: PLAN 阶段

调用 Agent 工具创建实现计划：

**调用方式**：
```
Agent 工具参数：
- subagent_type: "ai-dev-create:planner"
- description: "创建实现计划"
- prompt: "使用 PLAN 模式创建实现计划，输入：规范文档"
```

### Phase 3: TEST 阶段

调用 Agent 工具编写测试：

**调用方式**：
```
Agent 工具参数：
- subagent_type: "ai-dev-create:tester"
- description: "编写测试用例"
- prompt: "根据计划编写测试用例，确保测试处于 RED 状态"
```

### Phase 4: IMPL 阶段

调用 Agent 工具实现代码：

**调用方式**：
```
Agent 工具参数：
- subagent_type: "ai-dev-create:implementer"
- description: "实现功能代码"
- prompt: "根据测试用例实现功能代码，使测试通过（GREEN 状态）"
```

### Phase 5: REVIEW 阶段

调用 Agent 工具审查代码：

**调用方式**：
```
Agent 工具参数：
- subagent_type: "ai-dev-create:reviewer"
- description: "代码审查"
- prompt: "审查代码质量、安全性、可维护性，确保无 CRITICAL/HIGH 问题"
```

### Phase 6: VERIFY 阶段

运行完整验证循环：

```
BUILD → TYPE → LINT → TEST → SECURITY → DIFF
```

## 成功标准

- [ ] CLARIFY 所有报告已生成
- [ ] 用户确认点已通过
- [ ] 最终需求文档已确认
- [ ] 规范文档已创建
- [ ] 计划文档已创建
- [ ] 所有测试通过
- [ ] 覆盖率 ≥ 80%
- [ ] 无 CRITICAL/HIGH 问题
- [ ] 安全验证通过
- [ ] 所有验证通过

## 使用示例

```bash
# 复杂系统开发
/sdd-full 开发支付系统，支持多种支付方式、退款、对账功能

# 安全敏感功能
/sdd-full 实现用户权限管理系统，支持 RBAC、数据权限、审计日志

# 跨系统集成
/sdd-full 开发订单履约系统，对接 WMS、ERP、第三方物流
```
