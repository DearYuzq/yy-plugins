---
scenes:
  - file-edit
  - build-error
  - code-commit
  - hook-design
priority: optional
paths:
  - ".claude/hooks/**"
---

# 自动化工作流

## Skills 自动激活

写了 Skills 后 Claude 不会主动用，需要用 Hook 自动触发。

## Hook 流水线设计

1. 记录编辑的文件和仓库
2. 自动跑构建，捕获错误
3. 少于 5 个错误直接展示修复，多于 5 个启动错误修复 Agent
4. 检测高风险代码，温和提醒

## 避坑指南

- **不要在 Hook 中加 Prettier 自动格式化** — 文件修改会触发提醒，消耗大量 token（有人 3 轮对话烧了 160k）
- 自动格式化改为手动跑：在关键节点前手动执行格式化命令
- 控制 Hook 触发频率，避免过度响应

## 加载时机

**可选场景**：
- 设计或修改 Hook 时
- 配置自动化工作流时
- 处理构建错误时