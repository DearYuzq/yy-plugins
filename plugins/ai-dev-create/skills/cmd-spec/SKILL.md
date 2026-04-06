---
name: spec
description: 生成功能规范，将最终需求文档转换为结构化的功能规范。
disable-model-invocation: true
argument-hint: [--from path]
context: fork
agent: planner
allowed-tools: Read, Write, Grep, Glob
---

# /ai-dev-create:spec - 生成功能规范

基于最终需求文档或澄清结果，生成结构化的功能规范，包括功能定义、非功能需求和约束。

## 使用方式

```bash
/ai-dev-create:spec                              # 基于收敛摘要生成
/ai-dev-create:spec "功能描述"                    # 直接指定功能规范
/ai-dev-create:spec --from .claude/summaries/convergent-summary.md # 基于现有文档
```

## 输出

生成功能规范，包含：
- 功能定义概述
- 非功能需求（性能、可用性、安全性指标）
- 约束条件
- 验收标准

## 规范模板

```markdown
# 功能规范：[功能名称]

## 功能概述
[2-3 句描述核心价值和使用场景]

## 功能详情
### [功能模块 1]
- [具体行为描述]
- 输入：[...]
- 输出：[...]
- 前置条件：[...]

## 非功能需求
| 需求 | 指标 | 验收方式 |
|------|------|----------|
| 性能 | P99 < 200ms | 负载测试 |

## 约束条件
- [技术约束、合规约束]

## 验收标准
- [ ] [可验证的验收条件 1]
- [ ] [可验证的验收条件 2]
```

## 规划原则

1. **基于需求**：规范内容源自澄清结果，不添加未验证的假设
2. **可验证**：每条规范都有对应的验收标准
3. **完整**：覆盖功能、非功能、约束三个维度
4. **精确**：使用量化指标，避免模糊描述

## 下一步

规范生成后：
- 确认后 → `/plan` — 生成实现计划
- 确认前 → 请求用户核实后修改

---

## Agent 调用

本命令需要调用以下 Agent：

### 调用的 Agent

| Agent | 调用时机 | 输入 | 输出 |
|-------|----------|------|------|
| planner (mode=spec) | 命令启动时 | 收敛摘要或需求描述 | 功能规范 |

### 调用方式

```
Agent 工具参数：
- subagent_type: "ai-dev-create:planner"
- description: "生成功能规范"
- prompt: "基于以下需求生成功能规范：{需求内容或文件路径}"
```

### 上下文传递

**接收上一阶段的上下文**：
- 收敛摘要路径：`.claude/summaries/convergent-summary.md`
- 澄清文档路径（如有）：`.claude/clarifications/{feature}/`

**传递给下一阶段的上下文**：
- 规范文档路径：`.claude/specs/{feature}.md`
- 功能列表、验收清单

### 执行流程

1. 读取收敛摘要或澄清结果
2. 使用 Agent 工具调用 planner agent (mode=spec)
3. 等待 agent 返回规范
4. 保存规范到 `.claude/specs/{feature}.md`
5. 显示规范摘要，请求用户确认
