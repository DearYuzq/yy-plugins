---
name: mcp-integration
description: MCP 服务器集成配置，支持 GitHub、Context7 等服务。当需要配置外部工具集成时激活。
version: 1.0.0
---

# MCP Integration

MCP (Model Context Protocol) 服务器集成配置，扩展 Claude Code 的能力。

## 激活时机

- 配置外部服务集成
- 需要访问 GitHub API
- 需要查找最新文档
- 设置项目管理工具

## 推荐 MCP 服务器

### GitHub MCP

提供 GitHub API 访问能力。

```json
{
  "mcpServers": {
    "github": {
      "command": "gh",
      "args": ["mcp", "start"]
    }
  }
}
```

**功能**：
- 创建/更新/关闭 Issue
- 创建/更新 Pull Request
- 代码审查
- 分支管理
- Workflow 触发

### Context7 MCP

提供最新文档查询能力。

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@context7/mcp-server"]
    }
  }
}
```

**功能**：
- 查询库/框架最新文档
- 获取 API 使用示例
- 版本特定文档

### Tavily MCP

提供网络搜索能力。

```json
{
  "mcpServers": {
    "tavily": {
      "command": "npx",
      "args": ["-y", "@anthropic/tavily-mcp-server"],
      "env": {
        "TAVILY_API_KEY": "your-api-key"
      }
    }
  }
}
```

**功能**：
- 网络搜索
- 信息提取
- 研究/调研

## 配置方式

### 全局配置

编辑 `~/.claude.json`：

```json
{
  "mcpServers": {
    "github": {
      "command": "gh",
      "args": ["mcp", "start"]
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@context7/mcp-server"]
    }
  }
}
```

### 项目配置

在项目 `.claude/settings.json` 中：

```json
{
  "mcpServers": {
    "project-specific": {
      "command": "...",
      "args": [...]
    }
  }
}
```

### 禁用 MCP

在项目配置中禁用全局 MCP：

```json
{
  "disabledMcpServers": ["tavily"]
}
```

## 使用示例

### GitHub 操作

```
# 创建 Issue
创建一个 issue 来跟踪登录功能的实现

# 查看 PR
查看 PR #123 的详情

# 创建分支
创建 feature/login 分支
```

### 文档查询

```
# 查询 React 文档
React useEffect 的清理函数怎么用？

# 查询 FastAPI 文档
FastAPI 如何配置 CORS？
```

## 上下文管理

### 重要提示

配置过多的 MCP 服务器会占用大量上下文：

- **推荐**：配置 20-30 个 MCP
- **每个项目**：启用 < 10 个
- **活动工具**：< 80 个

### 优化策略

1. **按需启用**：只启用当前项目需要的 MCP
2. **使用 `disabledMcpServers`**：禁用不常用的
3. **分组管理**：不同项目类型使用不同的 MCP 配置

## 常见问题

### MCP 连接失败

```bash
# 检查 MCP 状态
/mcp

# 重新连接
/mcp reconnect github
```

### 权限问题

```bash
# GitHub MCP 需要 GitHub CLI 登录
gh auth login

# 验证登录状态
gh auth status
```

### 环境变量

```bash
# 设置 API Key
export TAVILY_API_KEY=your-key

# 或在配置中使用
{
  "env": {
    "TAVILY_API_KEY": "your-key"
  }
}
```

## 安全注意事项

1. **API Keys**：不要在代码中硬编码 API 密钥
2. **环境变量**：使用环境变量存储敏感信息
3. **权限范围**：只授予必要的权限
4. **审计日志**：定期检查 MCP 操作日志