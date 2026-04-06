---
name: clarify
description: 启动多阶段需求澄清会话，通过批判→发散→分解→结构化质疑→收敛流程确保需求完整性和可行性。
agent: orchestrator
---

# /ai-dev-create:clarify - 多阶段需求澄清

启动一个完整的多阶段澄清会话，确保需求在编码前得到充分探索和验证。

## 核心理念

**批判→发散→收敛**。用户可能说不清、说不全、隐瞒、撒谎。系统需要主动发现问题并引导澄清。

## 使用方式

```bash
/ai-dev-create:clarify "功能描述"                      # 完整流程
/ai-dev-create:clarify "功能描述" --phase diverge      # 仅发散阶段
/ai-dev-create:clarify "功能描述" --phase converge     # 仅收敛阶段
/ai-dev-create:clarify --resume session_id             # 恢复中断的会话
```

---

## 完整流程

```
[分散发散 — Critique(raw) → Diverger → Decomposer → Critique(structured)]
    │
    └──▶ 【用户确认点】
            │
[收敛 — Completer → Explorer → Security Teamer]
    │
    └──▶ 【最终评审】
            │
       最终需求文档
```

> 注：本流程以 `agents/orchestrator.md` 中的管道定义为权威来源。

### 阶段详解

#### Phase 1A: Critique (raw) — 批判
**职责**：质疑用户原始输入，假设一切都是假设
- 完整性/一致性/可行性质疑
- 提问用户（AskUserQuestion）澄清
- 评分：12 项清单式评分（功能/需求 4 项、场景/边界 4 项、技术/约束 2 项、决策/验证 2 项，每项约 8.3 分）
- **通过条件**：可信度评分 ≥ 6
- **输出**：`01-critique-raw.md`

#### Phase 1B: Diverger — 畅想
**职责**：探索可能性空间（MECE、类比、What-If、反向思考）
- **输出**：`02-diverger-report.md`

#### Phase 1C: Decomposer — 拆解
**职责**：构建需求树、MoSCoW 优先级、依赖图
- **输出**：`03-requirement-tree.md`

#### Phase 1D: Critique (structured) — 结构性质疑
**职责**：SMART 验证、正交过滤、ROI 分析、SOLID/DRY/KISS/YAGNI
- **通过条件**：无 CRITICAL 问题
- 对**建议删除的需求**使用 AskUserQuestion 确认
- **输出**：`04-critique-structured.md`

> **【用户确认点】**发散阶段完成后暂停，AskUserQuestion 确认是否继续

#### Phase 2A: Completer — 补全
**职责**：端到端完整性，检测缺失数据流/异常/权限/审计
- **输出**：`05-completer-report.md`

#### Phase 2B: Explorer — 探测
**职责**：生成 POC、Bash 执行验证、识别技术风险
- **输出**：`06-explorer-report.md`

#### Phase 2C: Security Teamer — 安全对抗
**职责**：红方攻击（注入/XSS/越权/业务逻辑）+ 蓝方防御（预防/检测/响应）
- 轻量模式（/sdd-standard）：只做明显 OWASP 检查
- 完整模式（/sdd-full）：完整四向量攻击 + 防御方案
- **输出**：`07-security-report.md`

---

## 输出产物

```
.claude/clarifications/{feature}-{session_id}/
├── 01-critique-raw.md
├── 02-diverger-report.md
├── 03-requirement-tree.md
├── 04-critique-structured.md
├── 05-completer-report.md
├── 06-explorer-report.md
├── 07-security-report.md
├── 08-final-requirements.md（仅 /sdd-full）
├── poc/
└── session.json
```

## 阶段转换条件

| 阶段 | 进入条件 | 退出条件 |
|------|----------|----------|
| Critique (raw) | 接收用户输入 | 可信度评分 ≥ 6 |
| Diverger | Critique (raw) 通过 | 发散评分 ≥ 6 |
| Decomposer | Diverger 完成 | 需求树已构建 |
| Critique (structured) | 需求树已构建 | 无 CRITICAL 问题 |
| 用户确认 | 分散发散阶段完成 | 用户确认通过 |
| Completer | 用户确认通过 | 需求链完整 |
| Explorer | 补全完成 | 技术风险已验证 |
| Security Teamer | 探测完成 | 漏洞已识别 + 方案已完成 |
| 最终评审 | Security Teamer 完成 | 评审通过 |

---

## Agent 调用

本命令需要按顺序调用以下 Agent：

### 分散发散阶段

| 序号 | Agent | 调用时机 | 输入 | 输出 |
|------|-------|----------|------|------|
| 1A | `ai-dev-create:critique` (mode=raw) | 接收用户需求 | 用户需求描述 | 批判报告 + 可信度评分 |
| 1B | `ai-dev-create:diverger` | Critique (raw) 完成 | 批判报告 | 发散报告 |
| 1C | `ai-dev-create:decomposer` | Diverger 完成 | 发散报告 | 需求树 |
| 1D | `ai-dev-create:critique` (mode=structured) | 需求树构建 | 需求树 | 批判报告 |

### 用户确认点 → 收敛阶段

| 序号 | Agent | 调用时机 | 输入 | 输出 |
|------|-------|----------|------|------|
| 2A | `ai-dev-create:completer` | 用户确认通过 | 需求树 + 用户决策 | 补全报告 |
| 2B | `ai-dev-create:explorer` | 补全完成 | 补全后需求 | 探测报告 + POC |
| 2C | `ai-dev-create:security-teamer` | 探测完成 | 验证后需求 | 安全报告 |

### 调用方式示例

```
# Phase 1A: Critique (raw)
Agent(
  subagent_type: "ai-dev-create:critique",
  description: "需求批判（raw 模式）",
  prompt: "对以下需求进行批判性分析：{用户输入}"
)

# Phase 2C: Security Teamer
Agent(
  subagent_type: "ai-dev-create:security-teamer",
  description: "安全对抗分析",
  prompt: "基于验证后需求进行红蓝对抗分析"
)
```
