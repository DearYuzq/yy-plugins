---
name: cc-list-rules
description: 列出 .claude/rules/ 目录下所有已启用的规则
argument-hint: [--verbose]
allowed-tools: Glob, Read, Bash
---

# /claude-init:cc-list-rules - 列出规则

## 使用方式

```bash
# 列出规则文件名
/cc-list-rules

# 显示规则内容摘要
/cc-list-rules --verbose
```

## 功能说明

1. **扫描规则目录** - 查找 `.claude/rules/**/*.md`
2. **显示规则状态** - 文件名和简要描述
3. **详细模式** - 显示每条规则的前 5 行内容

## 输出格式

```
已启用的规则：

1. planning-mode.md - 默认使用规划模式
2. subagent-strategy.md - 子智能体策略
3. verification.md - 完成前必须验证
...
```
