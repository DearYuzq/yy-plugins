---
name: sdd-standard
description: 标准 SDD 流程入口。适用于中等复杂度功能开发。包含澄清 → 约束提取 → SPEC → PLAN → TEST → IMPL（含自检 REVIEW）→ VERIFY。
argument-hint: [功能描述]
context: fork
agent: orchestrator
---

# SDD Standard — 标准开发流程

## 适用场景
- 中等复杂度功能（多模块、需要设计）
- 新功能开发
- 需要文档记录的功能

## 使用方法

```bash
/sdd-standard 实现用户认证模块，支持注册、登录和 JWT token 管理
```

## 管道说明

本 skill 设置参数后委托给 orchestrator。完整管道定义见 `agents/orchestrator.md`。

**运行阶段**：
- 分散发散：Critique (raw) → Diverger
- 轻量安全检查：Security Teamer (mode=light)
- 用户确认点
- 约束提取 → SPEC → PLAN → TEST → IMPL（含自检 REVIEW）→ VERIFY

## 成功标准
- 需求澄清完成
- 约束树已输出
- 所有测试通过
- REVIEW 无 CRITICAL/HIGH
- VERIFY 全部通过
