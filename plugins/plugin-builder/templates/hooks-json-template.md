# hooks.json 模板参考

## 目录位置

- 项目级：`.claude/settings.json`（hooks 字段）
- 插件级：`{plugin}/hooks/hooks.json`

## 可用事件

| 事件 | 触发时机 | matcher 内容 | 可阻止 |
|------|----------|--------------|--------|
| SessionStart | 会话开始 | startup/resume/clear/compact | 否 |
| UserPromptSubmit | 用户提交提示 | 不支持 | 是 |
| PreToolUse | 工具执行前 | 工具名称（如 Bash, Edit\|Write）| 是 |
| PermissionRequest | 权限对话框出现 | 工具名称 | 是 |
| PostToolUse | 工具成功执行后 | 工具名称 | 否 |
| PostToolUseFailure | 工具执行失败后 | 工具名称 | 否 |
| Notification | 发送通知时 | permission_prompt/idle_prompt 等 | 否 |
| SubagentStart | Subagent 启动时 | Agent 类型名称 | 否 |
| SubagentStop | Subagent 完成时 | Agent 类型名称 | 是 |
| Stop | Claude 完成响应时 | 不支持 | 是 |
| StopFailure | API 错误导致结束 | 错误类型 | 否 |
| TaskCompleted | 任务标记完成时 | 不支持 | 是 |
| ConfigChange | 配置文件更改时 | 配置源 | 是 |
| CwdChanged | 工作目录更改时 | 不支持 | 否 |
| FileChanged | 监视文件更改时 | 文件名 | 否 |
| WorktreeCreate | Worktree 创建时 | 不支持 | 是 |
| WorktreeRemove | Worktree 移除时 | 不支持 | 是 |
| PreCompact | 上下文压缩前 | manual/auto | 否 |
| PostCompact | 上下文压缩后 | manual/auto | 否 |
| InstructionsLoaded | CLAUDE.md 加载时 | 加载原因 | 否 |
| Elicitation | MCP 请求用户输入 | MCP server 名称 | 是 |
| ElicitationResult | 用户响应 MCP | MCP server 名称 | 否 |
| SessionEnd | 会话终止时 | 结束原因 | 否 |

## Hook 类型

| 类型 | 关键字段 | 说明 |
|------|----------|------|
| command | command, async, timeout | 执行 shell 命令 |
| http | url, headers, allowedEnvVars | 发送 HTTP POST |
| prompt | prompt, model | 用 LLM 评估 |
| agent | prompt, model, timeout | 运行代理验证器 |

## 示例模板

### 基础配置

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'File modified'"
          }
        ]
      }
    ]
  }
}
```

### 完整配置

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Session started'"
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
            "command": "validate-command.sh",
            "timeout": 30
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write",
            "timeout": 60
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "save-session.sh",
            "async": true
          }
        ]
      }
    ]
  }
}
```

## 退出代码行为

| 退出代码 | 行为 |
|----------|------|
| 0 | 成功，允许继续 |
| 2 | 阻止操作（用于 PreToolUse 等）|
| 其他 | 显示 stderr 作为反馈 |

## 脚本可执行权限

Hook 脚本必须确保可执行：

```bash
chmod +x scripts/my-hook.sh
```

## 环境变量

| 变量 | 描述 |
|------|------|
| `${CLAUDE_PLUGIN_ROOT}` | 插件目录绝对路径 |
| `${CLAUDE_SESSION_ID}` | 当前会话 ID |
| `${user_config.KEY}` | 用户配置值 |