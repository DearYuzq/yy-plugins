# Claude Code 扩展系统综合总结

> 本文档总结了 Claude Code 的五大扩展组件：Plugins、Skills、Subagents、Hooks 的完整技术规范和使用指南。
>
> **原始文档来源**：
> - [Plugins 参考](https://code.claude.com/docs/zh-CN/plugins-reference)
> - [Hooks 参考](https://code.claude.com/docs/zh-CN/hooks)
> - [Subagents](https://code.claude.com/docs/zh-CN/sub-agents)
> - [Hooks Guide](https://code.claude.com/docs/zh-CN/hooks-guide)
> - [Skills](https://code.claude.com/docs/zh-CN/skills)

---

## 目录

1. [系统概览](#系统概览)
2. [Plugins 插件系统](#plugins-插件系统)
3. [Skills 技能系统](#skills-技能系统)
4. [Subagents 子代理系统](#subagents-子代理系统)
5. [Hooks 钩子系统](#hooks-钩子系统)
6. [组件协作关系](#组件协作关系)

---

## 系统概览

Claude Code 提供了一套完整的扩展系统，允许用户自定义和增强 Claude 的能力：

| 组件 | 作用 | 核心文件 |
|------|------|----------|
| **Plugins** | 自包含的功能包，打包分发多种组件 | `plugin.json` |
| **Skills** | 可调用的指令集，创建 `/name` 快捷方式 | `SKILL.md` |
| **Subagents** | 专门的 AI 助手，独立处理特定任务 | `agent.md` |
| **Hooks** | 事件处理器，自动响应 Claude Code 事件 | `hooks.json` |
| **MCP Servers** | 连接外部工具和服务 | `.mcp.json` |
| **LSP Servers** | 提供实时代码智能 | `.lsp.json` |

### 安装范围层级

| 范围 | 设置文件 | 用例 |
|------|----------|------|
| `user` | `~/.claude/settings.json` | 所有项目可用的个人配置（默认） |
| `project` | `.claude/settings.json` | 通过版本控制共享的团队配置 |
| `local` | `.claude/settings.local.json` | 项目特定配置，gitignored |
| `managed` | 托管策略设置 | 组织范围配置（只读） |

---

## Plugins 插件系统

### Plugin 组件类型

Plugin 是一个自包含的组件目录，包含以下可选组件：

| 组件 | 目录位置 | 描述 |
|------|----------|------|
| Skills | `skills/` | 可调用的指令集 |
| Commands | `commands/` | 简单 markdown 文件（旧格式） |
| Agents | `agents/` | Subagent 定义文件 |
| Hooks | `hooks/hooks.json` | 事件处理器配置 |
| MCP Servers | `.mcp.json` | 外部工具连接配置 |
| LSP Servers | `.lsp.json` | 语言服务器配置 |

### Plugin 清单架构 (plugin.json)

```json
{
  "name": "plugin-name",
  "version": "1.2.0",
  "description": "插件简要描述",
  "author": {
    "name": "作者名",
    "email": "email@example.com"
  },
  "homepage": "https://docs.example.com/plugin",
  "repository": "https://github.com/author/plugin",
  "license": "MIT",
  "keywords": ["keyword1", "keyword2"],
  "commands": ["./custom/commands/special.md"],
  "agents": "./custom/agents/",
  "skills": "./custom/skills/",
  "hooks": "./config/hooks.json",
  "mcpServers": "./mcp-config.json",
  "lspServers": "./.lsp.json"
}
```

**必需字段**：`name`（唯一）

**元数据字段**：`version`、`description`、`author`、`homepage`、`repository`、`license`、`keywords`

**组件路径字段**：`commands`、`agents`、`skills`、`hooks`、`mcpServers`、`lspServers`

### 标准 Plugin 目录结构

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json          # 清单文件（可选）
├── commands/                 # 默认命令位置
│   ├── status.md
│   └── logs.md
├── agents/                   # 默认 agent 位置
│   ├── security-reviewer.md
│   └── performance-tester.md
├── skills/                   # Skills 目录
│   ├── code-reviewer/
│   │   └── SKILL.md
│   └── pdf-processor/
│       ├── SKILL.md
│       └── scripts/
├── hooks/
│   └── hooks.json           # Hook 配置
├── .mcp.json                 # MCP server 定义
├── .lsp.json                 # LSP server 配置
├── scripts/                  # 辅助脚本
└── settings.json             # 默认设置
```

### CLI 命令参考

```bash
# 安装 plugin
claude plugin install <plugin> [--scope user|project|local]

# 卸载 plugin
claude plugin uninstall <plugin> [--scope user|project|local]

# 启用 plugin
claude plugin enable <plugin>

# 禁用 plugin
claude plugin disable <plugin>

# 更新 plugin
claude plugin update <plugin>
```

### 环境变量

- **`${CLAUDE_PLUGIN_ROOT}`**：Plugin 目录的绝对路径，用于 hooks、MCP servers 和脚本中。

---

## Skills 技能系统

### 概念

Skills 扩展 Claude 能做的事情。创建 `SKILL.md` 文件，Claude 会将其添加到工具包中。可通过 `/skill-name` 直接调用或让 Claude 自动加载。

### 捆绑 Skills（内置）

| Skill | 功能 |
|-------|------|
| `/simplify` | 审查最近更改的文件，查找代码重用、质量和效率问题并修复 |
| `/batch <instruction>` | 在整个代码库中并行编排大规模更改 |
| `/debug [description]` | 排查当前 Claude Code 会话 |
| `/loop [interval] <prompt>` | 按间隔重复运行提示 |
| `/claude-api` | 加载 Claude API 参考资料 |

### Skills 存储位置

| 位置 | 路径 | 适用范围 |
|------|------|----------|
| 企业 | 托管设置 | 组织内所有用户 |
| 个人 | `~/.claude/skills/<name>/SKILL.md` | 所有项目 |
| 项目 | `.claude/skills/<name>/SKILL.md` | 仅此项目 |
| 插件 | `<plugin>/skills/<name>/SKILL.md` | 启用插件的位置 |

### SKILL.md 结构

```markdown
---
name: my-skill
description: Skill 功能及何时使用
argument-hint: [参数提示]
disable-model-invocation: true
user-invocable: false
allowed-tools: Read, Grep
model: sonnet
context: fork
agent: Explore
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/check.sh"
---

Skill 指令内容...
```

### Frontmatter 字段参考

| 字段 | 必需 | 描述 |
|------|------|------|
| `name` | 否 | 显示名称（kebab-case，最多64字符） |
| `description` | 推荐 | 功能描述，Claude 用于决定何时使用 |
| `argument-hint` | 否 | 自动完成时的参数提示 |
| `disable-model-invocation` | 否 | `true` 防止 Claude 自动加载 |
| `user-invocable` | 否 | `false` 从 `/` 菜单隐藏 |
| `allowed-tools` | 否 | 无需权限批准的工具列表 |
| `model` | 否 | 使用的模型 |
| `context` | 否 | `fork` 在分叉 subagent 中运行 |
| `agent` | 否 | `context: fork` 时使用的 subagent 类型 |
| `hooks` | 否 | 限定于此 skill 的 hooks |

### 字符串替换

| 变量 | 描述 |
|------|------|
| `$ARGUMENTS` | 调用时传递的所有参数 |
| `$ARGUMENTS[N]` 或 `$N` | 按索引访问特定参数 |
| `${CLAUDE_SESSION_ID}` | 当前会话 ID |
| `${CLAUDE_SKILL_DIR}` | SKILL.md 所在目录 |

### 高级模式

#### 动态上下文注入

使用 `!`command`` 语法在 Claude 看到内容前运行 shell 命令：

```markdown
---
name: pr-summary
description: 总结 PR 变化
context: fork
agent: Explore
---

## PR 上下文
- PR diff: !`gh pr diff`
- PR comments: !`gh pr view --comments`
```

#### 在 Subagent 中运行

添加 `context: fork` 让 skill 在隔离的 subagent 中运行：

```markdown
---
name: deep-research
description: 深入研究主题
context: fork
agent: Explore
---

研究 $ARGUMENTS...
```

---

## Subagents 子代理系统

### 概念

Subagents 是处理特定任务的专门 AI 助手，在独立的 context window 中运行，具有自定义系统提示和特定工具访问权限。

### 内置 Subagents

| Agent | 模型 | 工具 | 用途 |
|-------|------|------|------|
| **Explore** | Haiku | 只读 | 文件发现、代码搜索、代码库探索 |
| **Plan** | 继承 | 只读 | Plan mode 期间的研究代理 |
| **general-purpose** | 继承 | 全部 | 复杂多步骤任务 |
| **Bash** | 继承 | - | 在单独上下文中运行终端命令 |
| **statusline-setup** | Sonnet | - | 配置状态行 |
| **Claude Code Guide** | Haiku | - | 回答 Claude Code 功能问题 |

### Subagent 存储位置与优先级

| 位置 | 优先级 | 创建方式 |
|------|--------|----------|
| `--agents` CLI 标志 | 1（最高） | 启动时传递 JSON |
| `.claude/agents/` | 2 | 项目级 |
| `~/.claude/agents/` | 3 | 用户级 |
| 插件 `agents/` 目录 | 4（最低） | 与插件一起安装 |

### Subagent 文件结构

```markdown
---
name: code-reviewer
description: 审查代码质量和最佳实践。写完代码后主动使用。
tools: Read, Glob, Grep, Bash
disallowedTools: Write, Edit
model: sonnet
permissionMode: default
maxTurns: 10
skills:
  - api-conventions
  - error-handling-patterns
memory: user
background: false
isolation: worktree
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate.sh"
---

你是一名资深代码审查者...
```

### Frontmatter 字段

| 字段 | 必需 | 描述 |
|------|------|------|
| `name` | 是 | 唯一标识符（kebab-case） |
| `description` | 是 | Claude 何时应委托给此 subagent |
| `tools` | 否 | 可用工具列表 |
| `disallowedTools` | 否 | 要拒绝的工具 |
| `model` | 否 | `sonnet`、`opus`、`haiku`、`inherit` |
| `permissionMode` | 否 | `default`、`acceptEdits`、`dontAsk`、`bypassPermissions`、`plan` |
| `maxTurns` | 否 | 最大代理轮数 |
| `skills` | 否 | 启动时加载的 skills |
| `mcpServers` | 否 | 可用的 MCP servers |
| `hooks` | 否 | 生命周期 hooks |
| `memory` | 否 | 持久内存范围：`user`、`project`、`local` |
| `background` | 否 | `true` 始终后台运行 |
| `isolation` | 否 | `worktree` 在隔离 git worktree 中运行 |

### 权限模式

| 模式 | 行为 |
|------|------|
| `default` | 标准权限检查，带提示 |
| `acceptEdits` | 自动接受文件编辑 |
| `dontAsk` | 自动拒绝权限提示 |
| `bypassPermissions` | 跳过所有权限检查 |
| `plan` | Plan mode（只读探索） |

### 使用模式

#### 自动委托

Claude 根据 description 字段自动委托任务。建议在 description 中包含 "use proactively" 之类的短语。

#### 前台/后台运行

- **前台**：阻塞主对话直到完成，权限提示传递给用户
- **后台**：并发运行，预先批准权限，自动拒绝未批准内容

#### 并行研究

```
使用三个独立的 subagents 并行研究认证、数据库和 API 模块
```

#### 链接 Subagents

```
先使用 code-reviewer subagent 查找性能问题，然后使用 optimizer subagent 修复它们
```

---

## Hooks 钩子系统

### Hook 生命周期图

```
SessionStart → UserPromptSubmit → [PreToolUse → PermissionRequest → Tool执行 → PostToolUse]循环
→ SubagentStart/Stop → TaskCompleted → Stop → SessionEnd

独立事件：Notification、ConfigChange、CwdChanged、FileChanged、WorktreeCreate/Remove
         PreCompact、PostCompact、Elicitation、InstructionsLoaded
```

### 可用事件

| 事件 | 触发时机 | 匹配器内容 |
|------|----------|------------|
| `SessionStart` | 会话开始或恢复 | `startup`、`resume`、`clear`、`compact` |
| `UserPromptSubmit` | 用户提交提示 | 不支持匹配器 |
| `PreToolUse` | 工具执行前（可阻止） | 工具名称（如 `Bash`、`Edit|Write`、`mcp__.*`） |
| `PermissionRequest` | 权限对话框出现时 | 工具名称 |
| `PostToolUse` | 工具成功执行后 | 工具名称 |
| `PostToolUseFailure` | 工具执行失败后 | 工具名称 |
| `Notification` | 发送通知时 | `permission_prompt`、`idle_prompt`、`auth_success` |
| `SubagentStart` | Subagent 启动时 | Agent 类型名称 |
| `SubagentStop` | Subagent 完成时 | Agent 类型名称 |
| `Stop` | Claude 完成响应时（可阻止） | 不支持匹配器 |
| `StopFailure` | API 错误导致结束时 | 错误类型 |
| `TeammateIdle` | Agent 团队队友即将空闲 | 不支持匹配器 |
| `TaskCompleted` | 任务标记为完成时（可阻止） | 不支持匹配器 |
| `ConfigChange` | 配置文件更改时 | 配置源 |
| `CwdChanged` | 工作目录更改时 | 不支持匹配器 |
| `FileChanged` | 监视文件更改时 | 文件名 |
| `WorktreeCreate` | Worktree 创建时 | 不支持匹配器 |
| `WorktreeRemove` | Worktree 移除时 | 不支持匹配器 |
| `PreCompact` | 上下文压缩前 | `manual`、`auto` |
| `PostCompact` | 上下文压缩后 | `manual`、`auto` |
| `InstructionsLoaded` | CLAUDE.md 加载时 | 加载原因 |
| `Elicitation` | MCP 请求用户输入时 | MCP 服务器名称 |
| `ElicitationResult` | 用户响应 MCP elicitation 后 | MCP 服务器名称 |
| `SessionEnd` | 会话终止时 | 结束原因 |

### Hook 类型

| 类型 | 描述 | 关键字段 |
|------|------|----------|
| `command` | 执行 shell 命令 | `command`、`async`、`timeout` |
| `http` | 发送 HTTP POST 请求 | `url`、`headers`、`allowedEnvVars` |
| `prompt` | 用 LLM 评估提示 | `prompt`、`model` |
| `agent` | 运行具有工具的代理验证器 | `prompt`、`model`、`timeout` |

### Hook 配置位置

| 位置 | 范围 |
|------|------|
| `~/.claude/settings.json` | 用户级 |
| `.claude/settings.json` | 项目级（可提交） |
| `.claude/settings.local.json` | 项目级（gitignored） |
| Plugin `hooks/hooks.json` | 启用插件时 |
| Skill/Agent frontmatter | 组件活跃时 |

### 配置示例

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write",
            "timeout": 30
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/validate.sh"
          }
        ]
      }
    ],
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "notify-send 'Claude Code' 'Claude Code needs your attention'"
          }
        ]
      }
    ]
  }
}
```

### 通用 Hook 输入字段

| 字段 | 描述 |
|------|------|
| `session_id` | 会话标识符 |
| `transcript_path` | 对话 JSON 路径 |
| `cwd` | 当前工作目录 |
| `permission_mode` | 当前权限模式 |
| `hook_event_name` | 触发的事件名称 |
| `agent_id` | Subagent 唯一标识符（仅 subagent 内） |
| `agent_type` | Agent 名称（如 `Explore`） |

### PreToolUse 输入示例

```json
{
  "session_id": "abc123",
  "cwd": "/home/user/my-project",
  "hook_event_name": "PreToolUse",
  "tool_name": "Bash",
  "tool_input": {
    "command": "npm test"
  }
}
```

### 退出代码行为

| 退出代码 | 行为 |
|----------|------|
| `0` | 成功，允许继续 |
| `2` | 阻止操作（用于 PreToolUse、PermissionRequest、UserPromptSubmit 等） |
| 其他 | 显示 stderr 作为反馈 |

**可阻止的事件**：`PreToolUse`、`PermissionRequest`、`UserPromptSubmit`、`Stop`、`SubagentStop`、`TeammateIdle`、`TaskCompleted`、`ConfigChange`、`Elicitation`、`ElicitationResult`、`WorktreeCreate`

### JSON 输出控制

```json
// 阻止并显示原因
{
  "decision": "block",
  "reason": "Test suite must pass before proceeding"
}

// PreToolUse 拒绝权限
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Database writes are not allowed"
  }
}

// SessionStart 添加上下文
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "Reminder: use Bun, not npm"
  }
}
```

### 实用示例

#### 阻止破坏性命令

```bash
#!/bin/bash
# .claude/hooks/block-rm.sh
COMMAND=$(jq -r '.tool_input.command')

if echo "$COMMAND" | grep -q 'rm -rf'; then
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "Destructive command blocked"
    }
  }'
else
  exit 0
fi
```

#### 保护敏感文件

```bash
#!/bin/bash
# .claude/hooks/protect-files.sh
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

PROTECTED_PATTERNS=(".env" "package-lock.json" ".git/")

for pattern in "${PROTECTED_PATTERNS[@]}"; do
  if [[ "$FILE_PATH" == *"$pattern"* ]]; then
    echo "Blocked: $FILE_PATH matches protected pattern '$pattern'" >&2
    exit 2
  fi
done

exit 0
```

#### 持久化环境变量

```bash
#!/bin/bash
if [ -n "$CLAUDE_ENV_FILE" ]; then
  echo 'export NODE_ENV=production' >> "$CLAUDE_ENV_FILE"
  echo 'export PATH="$PATH:./node_modules/.bin"' >> "$CLAUDE_ENV_FILE"
fi
exit 0
```

---

## 组件协作关系

### 层级关系

```
Plugin (分发容器)
├── Skills (指令集)
│   ├── 可以定义 hooks
│   └── 可以在 subagent 中运行 (context: fork)
├── Agents (Subagents)
│   ├── 可以定义 hooks
│   └── 可以预加载 skills
├── Hooks (事件处理器)
│   ├── 可以触发 skills
│   └── 可以验证 agent 操作
├── MCP Servers
└── LSP Servers
```

### Skills vs Subagents 选择

| 场景 | 选择 |
|------|------|
| 可重用指令，在主对话上下文运行 | **Skills** |
| 需要隔离上下文的专门任务 | **Subagents** |
| 快速问题（无需工具） | `/btw` |
| 并行研究 | 多个 Subagents |
| 有副作用的操作（部署、发送消息） | Skill + `disable-model-invocation: true` |

### Hooks 集成点

| 组件 | Hook 配置位置 | 何时生效 |
|------|---------------|----------|
| Plugin | `hooks/hooks.json` | Plugin 启用时 |
| Skill | SKILL.md frontmatter | Skill 被调用时 |
| Agent | Agent.md frontmatter | Agent 运行时 |
| 项目/用户 | settings.json | 所有会话 |

### 常见协作模式

1. **Plugin 打包分发**：将 skills、agents、hooks 打包成 plugin，通过市场安装
2. **Skill 调用 Agent**：使用 `context: fork` + `agent: Explore` 在指定 subagent 中运行 skill
3. **Agent 预加载 Skills**：使用 `skills` 字段注入领域知识
4. **Hook 保护操作**：PreToolUse hook 验证 skill/agent 的工具使用
5. **Hook 触发 Skill**：SessionStart hook 加载初始化 skill

---

## 快速参考卡

### 创建 Skill

```bash
mkdir -p ~/.claude/skills/my-skill
echo '---
name: my-skill
description: What this skill does
---

Instructions here...' > ~/.claude/skills/my-skill/SKILL.md
```

### 创建 Agent

```bash
mkdir -p ~/.claude/agents
echo '---
name: my-agent
description: When to use this agent
tools: Read, Grep, Glob
model: haiku
---

System prompt...' > ~/.claude/agents/my-agent.md
```

### 创建 Hook

```json
// ~/.claude/settings.json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{
        "type": "command",
        "command": "npx prettier --write"
      }]
    }]
  }
}
```

### 安装 Plugin

```bash
claude plugin install <plugin-name> --scope project
```

---

## 另见

- [CLI 参考](https://code.claude.com/docs/zh-CN/cli-reference)
- [交互模式](https://code.claude.com/docs/zh-CN/interactive-mode)
- [权限系统](https://code.claude.com/docs/zh-CN/permissions)
- [MCP 配置](https://code.claude.com/docs/zh-CN/mcp)
- [Settings 配置](https://code.claude.com/docs/zh-CN/settings)