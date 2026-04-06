---
name: review
description: 代码审查，检查质量、安全性和可维护性。独立于 IMPL 阶段自检，提供交叉审查视角。
disable-model-invocation: true
argument-hint: [path] [--full] [--security]
context: fork
agent: implementer
allowed-tools: Read, Grep, Glob, Bash
---

# /ai-dev-create:review - 代码审查

执行**独立**代码审查，检查质量、安全性、性能和可维护性。

> **⚠️ 独立审查**：与 IMPL 阶段的自检不同，本命令提供交叉审查视角——审查者未参与代码编写，必须以外部审计标准执行。

## 使用方式

```bash
/ai-dev-create:review                    # 审查最近的变更（默认焦点）
/ai-dev-create:review path/to/file       # 审查指定文件
/ai-dev-create:review --full             # 全面审查（所有维度 + 优雅性）
/ai-dev-create:review --security         # 安全焦点审查（深度安全分析）
```

## 审查模式

### 默认模式（默认）
标准维度的交叉审查：质量、安全、性能、可维护性。

### 全面审查模式（--full）
默认模式 + 深度优雅性检查（架构合理性、抽象层次、模式适用性）。

### 安全焦点模式（--security）
深度安全分析：OWASP Top 10 + 业务逻辑攻击 + 数据流追踪。

## 审查维度

### 1. 代码质量 (Quality)

- [ ] 函数长度 < 50 行
- [ ] 文件长度 < 800 行
- [ ] 嵌套深度 < 4 层
- [ ] 无重复代码
- [ ] 命名清晰
- [ ] 注释适当

### 2. 安全性 (Security)

- [ ] 无硬编码密钥
- [ ] 输入验证完整
- [ ] SQL 注入防护
- [ ] XSS 防护
- [ ] 认证/授权验证

### 3. 性能 (Performance)

- [ ] 无 N+1 查询
- [ ] 适当的缓存
- [ ] 异步操作正确
- [ ] 资源释放正确

### 4. 可维护性 (Maintainability)

- [ ] 遵循项目约定
- [ ] 依赖注入使用正确
- [ ] 错误处理一致

## 输出格式

```markdown
# 代码审查报告

## 概述
- 审查文件：[文件列表]
- 审查模式：[默认/全面/安全焦点]
- 严重程度：CRITICAL/HIGH/MEDIUM/LOW

## 发现问题

### CRITICAL
| 问题 | 文件 | 行号 | 建议 |
|------|------|------|------|
| [描述] | [文件] | [行] | [修复建议] |

### HIGH
...

---

## Agent 调用

### 流程

1. 确定审查范围和模式（指定文件/最近变更，标志模式）
2. 直接分析目标代码（不调用子 agent）
3. 按审查模式生成报告

### 审查模式切换

根据是否提供 `--full` 或 `--security` 标志：
- 无标志：默认模式，关注 4 个基本维度
- `--full`：默认 + 深度优雅性检查
- `--security`：安全焦点，生成完整攻击面报告