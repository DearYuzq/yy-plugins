---
name: cc-add-rule
description: 从模板添加规则到 .claude/rules/ 目录
argument-hint: <rule-name>
allowed-tools: Read, Write, Glob, Bash
---

# /claude-init:cc-add-rule - 添加规则

## 使用方式

```bash
# 添加单条规则
/cc-add-rule planning-mode

# 添加多条规则
/cc-add-rule planning-mode subagent-strategy verification
```

## 可用规则列表

### 核心规则（必须）

| 规则 | 适用场景 | 优先级 |
|------|----------|--------|
| `planning-first` | planning, task-start, new-session | ⭐⭐⭐ required |
| `subagent-strategy` | complex-task, research, agent-design | ⭐⭐⭐ required |
| `quality-standards` | code-review, testing, before-commit | ⭐⭐⭐ required |
| `self-improve` | bug-fix, ci-failure, session-end | ⭐⭐⭐ required |
| `principles` | always | ⭐⭐⭐ required |

### 推荐规则（场景特定）

| 规则 | 适用场景 | 优先级 |
|------|----------|--------|
| `prompt-tips` | new-task, unclear-requirement, decision-making | ⭐⭐ recommended |
| `automation` | file-edit, build-error, hook-design | ⭐⭐ recommended |
| `service-mgmt` | backend-debug, microservice, log-analysis | ⭐⭐ recommended |

### 场景快速选择

**新任务**：`planning-first` + `prompt-tips`

**代码审查**：`quality-standards` + `principles`

**调试后端**：`service-mgmt` + `self-improve`

**设计 Agent**：`subagent-strategy` + `automation`

**Bug 修复**：`self-improve` + `quality-standards`

## 执行流程

1. 验证规则名称是否有效
2. 从 templates/rules/ 复制模板
3. 输出添加的规则文件路径
