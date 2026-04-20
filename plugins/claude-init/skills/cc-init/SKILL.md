---
name: cc-init
description: 初始化项目 CLAUDE.md 配置，首次扫描生成 docs 文档
argument-hint: [--force]
context: fork
agent: project-analyzer
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Agent
---

# /claude-init:cc-init - 初始化 CLAUDE.md

## 使用方式

```bash
# 标准初始化
/cc-init

# 强制覆盖已存在的 CLAUDE.md
/cc-init --force
```

## 功能说明

1. **分析项目结构** - 委托给 project-analyzer agent
2. **生成 CLAUDE.md** - 基于项目类型和结构
3. **创建 docs 文档** - 首次扫描时生成：
   - `docs/ARCHITECTURE.md` - 项目架构概览
   - `docs/DEPENDENCIES.md` - 依赖说明
   - `docs/WORKFLOW.md` - 开发工作流指南

## 执行流程

1. 检查是否已存在 CLAUDE.md
2. 如存在且无 `--force`，提示用户确认
3. 调用 project-analyzer 分析项目
4. 根据分析结果生成配置文件
5. 输出创建的文件列表

## 输出

- `CLAUDE.md` 或 `.claude/CLAUDE.md`
- `.claude/rules/` 目录（核心规则自动加载）
- `.claude/dev/active/` 目录（任务文档存放位置）
- `docs/` 目录（架构文档）

## 规则加载机制

`.claude/rules/` 目录下的规则会在每次 Claude Code 会话开始时自动加载，确保规则始终生效。
