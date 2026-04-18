# Plugin Builder — 交互式插件构建器 v1.0.0

通过结构化问答流程，帮助用户快速创建符合规范的 Claude Code 插件。

## 快速上手

### 安装

```bash
# 从本地安装
claude plugin install /path/to/plugin-builder --scope user

# 启用插件
claude plugin enable plugin-builder
```

### 开发模式加载

```bash
claude --plugin-dir /path/to/plugin-builder
```

### 一行命令开始

```bash
/plugin-builder:create-plugin
```

## 使用方式

### 主要命令

| 命令 | 用途 |
|------|------|
| `/plugin-builder:create-plugin` | 交互式创建新插件 |

### 使用示例

```bash
# 完整问答流程
/plugin-builder:create-plugin

# 提供插件名称
/plugin-builder:create-plugin my-awesome-plugin

# 指定输出路径
/plugin-builder:create-plugin /path/to/my-plugin
```

## 问答流程

### Phase 1: 基本信息

- 插件名称（kebab-case 格式）
- 插件描述
- 版本号（默认 1.0.0）
- 作者信息

### Phase 2: 组件选择

可选组件：
- **Skills** — 定义 `/command` 快捷方式
- **Agents** — 定义专门处理特定任务的 subagent
- **Hooks** — 自动响应事件
- **MCP Servers** — 连接外部工具和服务
- **Templates** — 提供模板文件
- **Scripts** — Hook 脚本或其他辅助脚本

### Phase 3: 组件详情

根据选择的组件，逐个收集详细信息。

### Phase 4: 输出确认

- 确认输出路径
- 确认是否立即验证

## Agent 总览

| Agent | Model | 职责 |
|-------|-------|------|
| plugin-generator | sonnet | 生成所有插件文件 |
| plugin-validator | sonnet | 验证插件格式 |

## 生成的插件结构

```
{plugin-name}/
├── .claude-plugin/
│   └── plugin.json          # 插件清单（必需）
├── skills/                  # Skills 目录
│   └── {skill-name}/
│       └── SKILL.md
├── agents/                  # Agents 目录
│   └── {agent-name}.md
├── hooks/
│   └── hooks.json
├── scripts/
│   └── {script}.sh
├── templates/
│   └── {template}.md
├── .mcp.json
└── README.md
```

## 验证功能

插件生成完成后，可以选择立即验证：

```bash
# 使用内置验证脚本
./scripts/validate-plugin.sh /path/to/plugin

# 或直接使用 Claude CLI
claude plugin validate /path/to/plugin
```

## 模板参考

本插件包含以下模板文件供参考：

- `templates/plugin-json-template.md` — plugin.json 格式说明
- `templates/skill-md-template.md` — SKILL.md 格式说明
- `templates/agent-md-template.md` — Agent MD 格式说明
- `templates/hooks-json-template.md` — hooks.json 配置说明
- `templates/mcp-json-template.md` — .mcp.json 配置说明

## License

MIT