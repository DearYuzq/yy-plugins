# claude-init

初始化和管理 CLAUDE.md 配置的 Claude Code 插件。

## 功能

- **初始化 CLAUDE.md** — 分析项目结构并生成合适配置
- **管理规则目录** — 添加、列出、删除 `.claude/rules/` 规则文件
- **增量更新** — 基于 git 记录动态更新内容
- **首次扫描文档** — 在 docs 目录生成架构、依赖、工作流文档
- **智能规则推荐** — Hook 自动检测场景并提醒加载适合规则
- **内置规则模板** — 带场景标签的核心规则 + 实用技巧

## 安装

```bash
claude plugin install plugins/claude-init --scope user
```

## 使用方式

### 初始化

```bash
# 标准初始化
/cc-init

# 强制覆盖已存在的 CLAUDE.md
/cc-init --force
```

### 增量更新

```bash
# 基于最近提交更新
/cc-update

# 从指定提交开始
/cc-update --since HEAD~5
```

### 规则管理

```bash
# 添加规则
/cc-add-rule planning-first

# 列出所有规则
/cc-list-rules

# 删除规则
/cc-remove-rule planning-first
```

## 规则模板分类

### 核心开发规范（必用）

| 规则 | 内容 |
|------|------|
| `planning-first` | **最重要** — 规划为王 + 三文档系统 |
| `subagent-strategy` | 子智能体策略 + Agent 设计规范 |
| `quality-standards` | 验证标准 + 优雅原则 |
| `self-improve` | 自主修复 + 自我进化 |

### 实用技巧（按需）

| 规则 | 内容 |
|------|------|
| `prompt-tips` | Prompt 技巧，具体/调研/分析 |
| `automation` | Hook 自动化 + 避坑指南 |
| `service-mgmt` | PM2 多服务调试 |

### 核心原则

| 规则 | 内容 |
|------|------|
| `principles` | 简洁优先、绝不敷衍 |

## 推荐用法

首次使用：

```bash
/cc-init
# 自动安装核心规则到 .claude/rules/
```

`/cc-init` 会自动将以下核心规则安装到 `.claude/rules/`，确保每次会话自动加载：
- planning-first
- subagent-strategy
- quality-standards
- self-improve
- principles

可选添加其他规则：

```bash
/cc-add-rule prompt-tips automation service-mgmt
```

## 智能规则推荐系统

插件通过 Hook 在关键时机自动推荐规则：

| Hook 时机 | 推荐内容 |
|-----------|----------|
| SessionStart | 检查核心规则是否安装 |
| PreToolUse | 根据操作类型推荐相关规则 |
| PostToolUse | 提醒同步更新和记录经验 |
| Stop | 总结并推荐下次加载的规则 |

详见：`templates/rules/_SCENE-RECOMMENDATION.md`

## 目录结构

```
claude-init/
├── .claude-plugin/plugin.json
├── skills/
│   ├── cc-init/SKILL.md
│   ├── cc-update/SKILL.md
│   ├── cc-add-rule/SKILL.md
│   ├── cc-list-rules/SKILL.md
│   └── cc-remove-rule/SKILL.md
├── agents/
│   ├── project-analyzer.md
│   └── claude-md-generator.md
├── hooks/hooks.json
├── scripts/
│   ├── git-analyzer.sh
│   ├── session-check.sh
│   ├── rule-recommender.sh
│   └── scene-detector.sh
└── templates/
    ├── claude.md
    ├── rules/
    │   ├── planning-first.md      # 场景: planning, task-start
    │   ├── subagent-strategy.md   # 场景: complex-task, research
    │   ├── quality-standards.md   # 场景: code-review, testing
    │   ├── self-improve.md        # 场景: bug-fix, ci-failure
    │   ├── prompt-tips.md         # 场景: new-task, unclear-req
    │   ├── automation.md          # 场景: file-edit, build-error
    │   ├── service-mgmt.md        # 场景: backend-debug
    │   ├── principles.md          # 场景: always
    │   ├── _HOW-TO-LOAD.md
    │   └── _SCENE-RECOMMENDATION.md
    ├── principles.md
    └── task-mgmt.md
```

## 许可证

MIT