---
name: cc-update
description: 基于 git 记录增量更新 CLAUDE.md 内容
argument-hint: [--since <commit>]
context: fork
agent: claude-md-generator
allowed-tools: Read, Write, Edit, Grep, Bash
---

# /claude-init:cc-update - 增量更新 CLAUDE.md

## 使用方式

```bash
# 基于最近的 git 提交更新
/cc-update

# 从指定提交开始分析
/cc-update --since HEAD~5

# 从特定分支点后更新
/cc-update --since main
```

## 功能说明

1. **分析 git 历史** - 使用 git-analyzer.sh 脚本
2. **识别变更模式** - 检测新增功能、重构、修复等
3. **增量更新** - 只更新变化的部分，保留原有配置

## 执行流程

1. 检查 CLAUDE.md 是否存在
2. 分析 git log 获取变更
3. 识别需要更新的配置项
4. 增量更新 CLAUDE.md
5. 输出更新摘要

## 输出

- 更新后的 `CLAUDE.md`
- 更新摘要报告
