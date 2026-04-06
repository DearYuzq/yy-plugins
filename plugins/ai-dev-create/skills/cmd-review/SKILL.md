---
name: review
description: 独立代码审查，检查质量、安全、性能和可维护性。审查者未参与代码编写，以外部视角提供交叉审查。
disable-model-invocation: true
argument-hint: [path] [--full] [--security]
context: fork
agent: reviewer
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
---

# /ai-dev-create:review - 代码审查

执行**独立**代码审查，检查质量、安全性、性能和可维护性。

> **独立审查**：与 IMPL 阶段的自检不同（IMPL 自检仅覆盖质量基础、安全基础和约束覆盖），本命令由未参与编写的 reviewer agent 执行完整的 expectation vs. reality 差距分析。

## 使用方式

```bash
/ai-dev-create:review                    # 审查最近的变更（标准 7 维审查）
/ai-dev-create:review path/to/file       # 审查指定文件
/ai-dev-create:review --full             # 全面审查（7 维 + 深度优雅性检查）
/ai-dev-create:review --security         # 安全焦点审查（OWASP Top 10 + 数据流追踪）
```

## 审查模式

### 标准模式（默认）
完整的 7 维审查：功能正确性、代码质量、安全性、性能、架构合理性、优雅性、约束覆盖。

### 全面审查模式（--full）
标准模式 + 加强版优雅性检查（架构合理性深度分析、抽象层次评估、模式适用性验证）。

### 安全焦点模式（--security）
深度安全分析：OWASP Top 10 + 四向量攻击面 + 业务逻辑攻击 + 数据流追踪。

## 审查维度

完整 7 个审查维度定义见 `templates/security-standards.md`（安全标准）以及 `agents/reviewer.md`（完整方法论）。

### 1. 功能正确性 (Functional Correctness) — 最高优先级

- [ ] 每个约束树中的函数都有对应实现
- [ ] 函数签名与约束树定义一致
- [ ] 边界条件已处理
- [ ] 错误不会静默吞掉

### 2. 代码质量 (Code Quality)

- [ ] 函数 < 50 行，文件 < 800 行
- [ ] 嵌套 < 4 层，参数 < 5 个
- [ ] 无 > 3 行的重复逻辑
- [ ] 命名清晰无歧义

### 3. 安全性 (Security)

- [ ] 输入验证完整（见 `templates/security-standards.md`）
- [ ] 无 SQL 注入/XSS/CSRF
- [ ] 无硬编码凭据
- [ ] 敏感操作有权限验证

### 4. 性能 (Performance)

- [ ] 无 N+1 查询
- [ ] 算法复杂度合理
- [ ] 无内存泄漏

### 5. 架构合理性 (Architecture)

- [ ] 分层清晰，无层级跨越
- [ ] 依赖方向正确
- [ ] 模块边界清晰

### 6. 优雅性 (Elegance)

- [ ] 无过度设计
- [ ] 资深工程师标准认可
- [ ] 无提前抽象

### 7. 约束覆盖 (Constraint Coverage)

- [ ] 逐条对比约束树，确认每条 constraint_id 有对应实现
- [ ] 约束树中的非功能需求有代码体现

## 技术栈特定检查

- **TypeScript/React**：无 any 滥用，Props/State 有类型定义，useEffect 依赖完整
- **Python**：类型注解完整，无裸露 `except: pass`
- **Spring Boot**：@Transactional 在正确层级，构造器注入
- **Go**：error 不可忽略，goroutine 泄漏检查，Context 传递完整
- **Rust**：unsafe 使用最小化，Result/Option 正确处理，无 unwrap() 滥用

## 问题分级

| 级别 | 定义 | 处理 |
|------|------|------|
| CRITICAL | 安全漏洞、数据丢失、功能错误 | 必须修复 |
| HIGH | 严重性能问题、架构违规 | 必须修复 |
| MEDIUM | 代码质量问题 | 建议修复 |
| LOW | 风格问题 | 记录不阻断 |

## 输出格式

```markdown
# 代码审查报告：{feature}

## 概述
- CRITICAL: {n} / HIGH: {n} / MEDIUM: {n} / LOW: {n}
- 变更文件：{count} 个，+{add} -{del} 行
- 审查结论：{✅ 通过 / ❌ 需修复 / ⚠️ 有条件通过}

## 预期 vs. 实际差距

| # | 预期 | 实际 | 差距 | 严重级 |
|---|------|------|------|--------|

## 各维度审查

### 功能正确性: {PASS/FAIL}
### 代码质量: {PASS/FAIL}
### 安全性: {PASS/FAIL}
### 性能: {PASS/FAIL}
### 架构合理性: {PASS/FAIL}
### 优雅性: {PASS/FAIL/跳过}
### 约束覆盖: {PASS/FAIL}
```

## Agent 调用

### 流程

1. 读取 SPEC/PLAN/约束树，确定预期行为
2. 读取实际代码 diff，发现实际实现
3. 对比差距，生成审查报告
4. 输出 `.claude/adc-result/request/{request-name}/review.md`

### 审查模式切换

- 无标志：标准 7 维审查
- `--full`：标准 + 深度优雅性检查
- `--security`：安全焦点（OWASP Top 10 + 四向量攻击 + 数据流追踪）

CRITICAL/HIGH 问题发现时，通知 orchestrator 退回 IMPL 修复。
