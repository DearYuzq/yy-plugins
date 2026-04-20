---
scenes:
  - planning
  - task-start
  - new-session
  - complex-task
priority: required
---

# 规划为王

动手之前一定要先规划。这是提升开发质量最关键的一条。

## 触发条件

- 非简单任务（3 步以上或涉及架构决策）
- 出错时立即停止并重新规划，不要强行继续
- 规划不仅用于开发，也要用于验证环节

## 三文档系统

每个任务在 `.claude/dev/active/{任务名}/` 下创建三个 markdown：

- `{任务名}-plan.md` — 做什么、怎么做
- `{任务名}-context.md` — 关键文件、决策记录
- `{任务名}-tasks.md` — 可勾选的 checklist

## 流程

1. 进 Planning 模式，让 Claude 研究代码库并输出完整计划
2. 认真审查计划，发现需求理解偏差
3. 确认后生成三文档
4. 先规划：写下可勾选的执行计划
5. 验计划：执行前确认方案可行
6. 追进度：完成一项勾选一项，每步给出概要说明
7. 收经验：修正后更新 .claude/lessons.md

## 会话衔接

- 每完成一步立刻更新任务清单
- 上下文快用完时，先让 Claude 把进度和下一步写入文档，再开新会话
- 新会话只需说"继续"，Claude 读完文档就能无缝衔接

## 规则加载时机

这些规则必须通过 `.claude/rules/` 目录加载，确保每次会话都生效：

1. 运行 `/cc-init` 初始化时，规则自动复制到 `.claude/rules/`
2. 或用 `/cc-add-rule planning-first` 手动添加
3. 规则文件在 `.claude/rules/` 下会被 Claude Code 自动加载到每个会话