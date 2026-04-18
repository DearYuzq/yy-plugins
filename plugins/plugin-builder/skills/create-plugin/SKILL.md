---
name: create-plugin
description: 交互式创建 Claude Code 插件。通过问答流程收集需求，自动生成标准结构和文件。use proactively when user wants to create a new plugin.
argument-hint: [插件名称或路径]
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Grep, Glob, Bash, AskUserQuestion, Agent
---

# /plugin-builder:create-plugin - 交互式插件构建器

通过结构化问答流程，帮助用户快速创建符合规范的 Claude Code 插件。

## 使用方式

```bash
# 无参数启动，进入完整问答流程
/plugin-builder:create-plugin

# 提供插件名称，跳过基本信息收集
/plugin-builder:create-plugin my-awesome-plugin

# 提供完整路径，直接在该位置创建
/plugin-builder:create-plugin /path/to/my-plugin
```

## 问答流程

### Phase 1: 基本信息收集

| 问题 | 必填 | 格式要求 | 默认值 |
|------|------|----------|--------|
| 插件名称 | 是 | kebab-case | 无 |
| 插件描述 | 是 | 自由文本 | 无 |
| 版本号 | 否 | semver | 1.0.0 |
| 作者信息 | 否 | name + email | 空 |

### Phase 2: 组件选择

可选组件列表：

| 组件 | 目录 | 用途 |
|------|------|------|
| Skills | skills/ | 定义 `/command` 快捷方式 |
| Agents | agents/ | 定义专门处理特定任务的 subagent |
| Hooks | hooks/hooks.json | 自动响应事件 |
| MCP Servers | .mcp.json | 连接外部工具和服务 |
| Templates | templates/ | 提供模板文件供 skills/agents 参考 |
| Scripts | scripts/ | Hook 脚本或其他辅助脚本 |

### Phase 3: 组件详情（动态展开）

根据 Phase 2 的选择，逐个收集组件详情。

### Phase 4: 输出确认

确认输出目录和是否立即验证。

## 执行流程

1. 收集需求信息（AskUserQuestion）
2. 创建目录结构
3. 生成 plugin.json（必需文件）
4. 根据选择生成各组件文件
5. 生成 README.md（插件文档）
6. 运行验证（如用户选择）

## 输出结构

生成的插件遵循标准结构：

```
{plugin-name}/
├── .claude-plugin/
│   └── plugin.json          # 插件清单（必需）
├── skills/                  # Skills 目录
│   └── {skill-name}/
│       └── SKILL.md         # Skill 定义
├── agents/                  # Agents 目录
│   └── {agent-name}.md      # Agent 定义
├── hooks/
│   └── hooks.json           # Hook 配置
├── scripts/                 # Hook 脚本
├── templates/               # 模板文件
├── .mcp.json                # MCP Server 定义
└── README.md                # 插件文档
```

## 验证

如果选择立即验证，运行：

```bash
claude plugin validate {output-path}
```

验证通过会显示：
```
✔ Validation passed
```

验证失败会列出具体错误，并提供修复建议。

## Agent 调用

本 Skill 可能调用以下 Agent：

| Agent | 用途 | 触发条件 |
|-------|------|----------|
| plugin-generator | 生成所有文件 | 始终调用 |
| plugin-validator | 执行验证 | 用户选择立即验证 |

## 完成后操作

插件创建完成后，用户可以：

```bash
# 安装插件（用户级）
claude plugin install {output-path} --scope user

# 或项目级
claude plugin install {output-path} --scope project

# 启用插件
claude plugin enable {plugin-name}
```

## 执行逻辑

```markdown
# 执行步骤

## 1. 解析参数
- 如果提供了插件名称作为参数，跳过名称收集
- 如果提供了路径，使用该路径作为输出目录

## 2. Phase 1: 基本信息
使用 AskUserQuestion 收集：
- 插件名称（kebab-case 格式验证）
- 插件描述
- 版本号（默认 1.0.0）
- 作者名称和邮箱

## 3. Phase 2: 组件选择
使用 AskUserQuestion（multiSelect）让用户选择：
- Skills
- Agents
- Hooks
- MCP
- Templates
- Scripts

## 4. Phase 3: 组件详情（根据选择动态展开）

### 如果选择 Skills：
询问需要几个 Skill，然后对每个 Skill 询问：
- 名称（kebab-case）
- 描述
- 是否 disable-model-invocation
- 是否 context: fork（如是，需要 agent 名称）
- argument-hint
- allowed-tools

### 如果选择 Agents：
询问需要几个 Agent，然后对每个 Agent 询问：
- 名称（kebab-case）
- 描述
- 可用工具列表
- 模型选择（sonnet/opus/haiku）
- 是否需要 background
- 是否需要 isolation（worktree）

### 如果选择 Hooks：
询问需要监听哪些事件：
- SessionStart
- PreToolUse / PostToolUse
- Stop
- 其他

然后对每个 Hook 询问：
- matcher（如 "Bash", "Edit|Write"）
- hook 类型（command/http/prompt/agent）
- 命令内容

### 如果选择 MCP：
询问需要几个 MCP Server，然后对每个询问：
- 名称
- 命令（npx/node/python 等）
- 参数
- 描述

## 5. Phase 4: 输出确认
- 确认输出路径
- 确认是否立即验证

## 6. 生成阶段
调用 plugin-generator agent 生成所有文件：
a) 创建目录结构
b) 生成 plugin.json
c) 生成各组件文件
d) 生成 README.md
e) 设置脚本权限

## 7. 验证阶段（如用户选择）
调用 plugin-validator agent：
- 运行 claude plugin validate
- 报告结果
- 如有错误，提供修复方案

## 8. 完成提示
- 显示创建的文件列表
- 提示下一步操作
```