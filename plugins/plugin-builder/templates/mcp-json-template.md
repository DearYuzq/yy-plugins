# .mcp.json 模板参考

## 目录位置

- 项目级：`.mcp.json`
- 插件级：`{plugin}/.mcp.json`

## 配置结构

```json
{
  "mcpServers": {
    "server-name": {
      "command": "执行命令",
      "args": ["参数列表"],
      "description": "功能描述",
      "env": {
        "ENV_VAR": "value"
      }
    }
  }
}
```

## 常见 MCP Server 示例

### NPX 包

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/dir"],
      "description": "文件系统访问"
    }
  }
}
```

### Python 包

```json
{
  "mcpServers": {
    "github": {
      "command": "python",
      "args": ["-m", "mcp_server_github"],
      "description": "GitHub API 集成",
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

### Node.js 脚本

```json
{
  "mcpServers": {
    "custom-server": {
      "command": "node",
      "args": ["${CLAUDE_PLUGIN_ROOT}/scripts/mcp-server.js"],
      "description": "自定义 MCP server"
    }
  }
}
```

### HTTP 服务器

```json
{
  "mcpServers": {
    "remote-server": {
      "transport": "http",
      "url": "https://example.com/mcp",
      "description": "远程 HTTP MCP server"
    }
  }
}
```

## 环境变量

可用环境变量：

- `${CLAUDE_PLUGIN_ROOT}` — 插件目录绝对路径
- `${HOME}` — 用户主目录
- `${PROJECT_ROOT}` — 项目根目录
- `${user_config.KEY}` — 用户配置值

## 传输类型

| 类型 | 说明 |
|------|------|
| stdio | 作为本地进程运行（默认）|
| http | 远程 HTTP 服务器 |
| sse | 远程 SSE 服务器（已弃用）|

## 完整示例

```json
{
  "mcpServers": {
    "github": {
      "command": "gh",
      "args": ["mcp", "start"],
      "description": "GitHub API 集成，支持 PR、Issue、代码审查等"
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."],
      "description": "当前目录文件访问"
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"],
      "description": "最新文档查询，支持各种库和框架"
    }
  },
  "disabledMcpServers": []
}
```