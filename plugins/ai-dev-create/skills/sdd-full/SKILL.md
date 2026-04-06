---
name: sdd-full
description: 完整 SDD 流程入口。包含分散发散、收敛验证、安全对抗。适用于跨系统、安全敏感的复杂功能。
argument-hint: [功能描述]
context: fork
agent: orchestrator
---

# SDD Full — 完整开发流程

## 适用场景
- 复杂功能（跨系统、多模块、多集成）
- 安全敏感（认证、权限、支付、合规）
- 需要深度需求分析的新功能

## 使用方法

```bash
/sdd-full 开发支付系统，支持微信支付、支付宝、退款和对账
```

## 管道说明

本 skill 设置参数后委托给 orchestrator。完整管道定义见 `agents/orchestrator.md`。

**运行阶段**：
- 分散发散：Critique (raw) → Diverger → Decomposer → Critique (structured)
- 用户确认点
- 收敛验证：Completer → Explorer → Security Teamer（红蓝对抗）
- 最终评审
- 约束提取 → SPEC → PLAN → TEST → IMPL（含自检 REVIEW）→ VERIFY

## 成功标准
- 全部澄清报告已生成
- 约束树已输出
- 所有测试通过
- REVIEW 无 CRITICAL/HIGH
- VERIFY 全部通过
