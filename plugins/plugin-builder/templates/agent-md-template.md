# Agent MD 模板参考

## 目录位置

- 用户级：`~/.claude/agents/{agent-name}.md`
- 项目级：`.claude/agents/{agent-name}.md`
- 插件级：`{plugin}/agents/{agent-name}.md`

## Frontmatter 字段

| 字段 | 必需 | 类型 | 说明 |
|------|------|------|------|
| name | 是 | string | Agent 名称（kebab-case）|
| description | 是 | string | Claude 何时应委托给此 agent |
| tools | 否 | string[] | 可用工具列表 |
| disallowedTools | 否 | string[] | 要拒绝的工具 |
| model | 否 | string | 模型（sonnet/opus/haiku/inherit）|
| permissionMode | 否 | string | 权限模式 |
| maxTurns | 否 | number | 最大代理轮数 |
| skills | 否 | string[] | 启动时加载的 skills |
| mcpServers | 否 | string | 可用的 MCP servers |
| hooks | 否 | object | 生命周期 hooks |
| memory | 否 | string | 持久内存范围 |
| background | 否 | boolean | true 则始终后台运行 |
| isolation | 否 | string | `worktree` 则在隔离 git worktree 中运行 |
| effort | 否 | string | high/medium/low |

## 可用工具列表

| 工具 | 说明 |
|------|------|
| Read | 读取文件 |
| Write | 写入文件 |
| Edit | 编辑文件 |
| Grep | 内容搜索 |
| Glob | 文件搜索 |
| Bash | 执行命令 |
| Agent | 调用子 agent |
| TaskCreate/TaskUpdate | 任务管理 |
| WebSearch/WebFetch | 网络搜索/获取 |

## 示例模板

### 基础 Agent

```markdown
---
name: my-agent
description: 处理特定任务的 agent。use proactively for X.
tools: Read, Grep, Glob
model: haiku
---

你是一个专门处理 {任务类型} 的 assistant。

## 职责

- 职责一
- 职责二

## 工作流程

1. 接收任务
2. 分析需求
3. 执行操作
4. 返回结果
```

### 完整 Agent

```markdown
---
name: my-agent
description: 何时使用此 agent 的详细说明
tools: Read, Write, Edit, Grep, Glob, Bash, Agent
disallowedTools: 
model: sonnet
permissionMode: default
maxTurns: 10
skills:
  - skill-1
  - skill-2
memory: project
background: false
isolation: worktree
effort: high
---

# Agent 系统提示

你是一个专门处理 {领域} 的 expert agent。

## 核心理念

详细描述核心理念...

## 工作原则

- 原则一
- 原则二

## 执行流程

详细的工作流程描述...

## 输出格式

规定输出内容的格式...
```

## 安全限制

Plugin 提供的 agents 不支持：
- `hooks`
- `mcpServers`
- `permissionMode`