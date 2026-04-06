---
name: tdd-quick
description: 快速 TDD 流程入口。适用于简单功能、bug 修复、小型重构。快速预处理后直接进入测试驱动开发循环。
argument-hint: [功能描述或文件路径]
context: fork
agent: orchestrator
---

# TDD Quick — 快速开发流程

## 适用场景
- 简单功能实现（单模块、少量文件变更）
- Bug 修复
- 代码重构
- 需求已经非常明确

## 使用方法

```bash
/tdd-quick 修复 UserService 中邮箱验证的 bug
/tdd-quick 添加 User 实体的 fullName 计算属性
/tdd-quick 重构 OrderService 的支付逻辑为策略模式
```

## 管道说明

本 skill 设置参数后委托给 orchestrator。完整管道定义见 `agents/orchestrator.md`。

**运行阶段**：
- Critique (quick mode) — 快速语义解析 + 阻塞性检查
- Mini-Clarify Gate — 发现歧义或缺关键信息时使用 AskUserQuestion 确认
- 内联约束追踪 → 创建 `tasks/constraints-inline.md`
- 直接进入 → TEST → IMPL（含自检 REVIEW）→ VERIFY

## 预处理澄清门控

即使快速流程也需进行最小限度需求澄清。Critique (quick mode) 检查以下阻塞项：

- **歧义检测**：同一表述是否存在多种理解
- **关键信息缺失**：是否缺少数据源、接口定义、边界条件
- **潜在冲突**：需求是否与现有代码逻辑冲突

若发现任何**阻塞性问题**（非信息性疑问），必须使用 AskUserQuestion 确认后再继续：
> "需求中提到'优化性能'，当前系统没有性能基线。请选择：A) 设定具体指标 B) 先分析瓶颈 C) 跳过此步骤"

若无阻塞性问题，直接进入 TEST 阶段。

## 成功标准
- 所有测试通过
- 覆盖率 ≥ 80%
- 无 CRITICAL 问题
- 构建/lint 通过
