# 规则加载说明

## 自动加载机制

`.claude/rules/` 目录下的所有 `.md` 文件会在每次 Claude Code 会话开始时自动加载。

## 路径特定规则（可选）

如果某些规则只需要在特定文件操作时加载，可以使用 YAML frontmatter：

```markdown
---
paths:
  - "src/**/*.ts"
  - "lib/**/*.ts"
---

# TypeScript 特定规则

- 使用严格类型检查
- 优先使用 interface 而非 type
```

## 推荐配置

| 规则 | 加载方式 | 说明 |
|------|----------|------|
| planning-first | 无条件加载 | 全局规划原则 |
| subagent-strategy | 无条件加载 | 全局 Agent 策略 |
| quality-standards | 无条件加载 | 全局质量标准 |
| self-improve | 无条件加载 | 持续改进原则 |
| principles | 无条件加载 | 核心原则 |
| prompt-tips | 无条件加载 | 提示技巧 |
| automation | 无条件加载 | 自动化配置 |
| service-mgmt | path 限定 | 仅后端代码时加载 |

## 规则加载优先级

1. 用户级规则 (`~/.claude/rules/`)
2. 项目级规则 (`.claude/rules/`)
3. 路径特定规则（按需加载）

项目级规则优先级高于用户级，可以覆盖个人偏好。