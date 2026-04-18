# plugin.json 模板参考

## 必需字段

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| name | string | 是 | 插件名称，kebab-case 格式，唯一标识 |

## 可选元数据字段

| 字段 | 类型 | 说明 |
|------|------|------|
| version | string | 版本号，建议 semver 格式（如 1.0.0）|
| description | string | 插件简要描述 |
| author | object | 作者信息：`{ name, email, url }` |
| homepage | string | 文档或项目主页 URL |
| repository | string | 代码仓库 URL |
| license | string | 许可证（如 MIT, Apache-2.0）|
| keywords | string[] | 关键词列表 |

## 组件路径字段

| 字段 | 类型 | 说明 |
|------|------|------|
| skills | string | Skills 目录路径，如 `"./skills/"` |
| agents | string | Agents 目录路径，如 `"./agents/"` |
| hooks | string | hooks.json 文件路径，如 `"./hooks/hooks.json"` |
| mcpServers | string | MCP 配置文件路径，如 `"./.mcp.json"` |
| lspServers | string | LSP 配置文件路径 |
| commands | string[] | Commands 文件路径列表（旧格式）|
| userConfig | object | 用户可配置的选项 |

## userConfig 配置项结构

```json
{
  "userConfig": {
    "configKey": {
      "type": "string|boolean|number",
      "title": "配置项标题",
      "description": "详细描述",
      "default": "默认值",
      "sensitive": false
    }
  }
}
```

## 示例

### 最小配置

```json
{
  "name": "my-plugin"
}
```

### 完整配置

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "一个功能强大的插件",
  "author": {
    "name": "作者名",
    "email": "email@example.com",
    "url": "https://github.com/author"
  },
  "homepage": "https://docs.example.com",
  "repository": "https://github.com/user/plugin",
  "license": "MIT",
  "keywords": ["keyword1", "keyword2"],
  "skills": "./skills/",
  "agents": "./agents/",
  "hooks": "./hooks/hooks.json",
  "mcpServers": "./.mcp.json",
  "userConfig": {
    "defaultMode": {
      "type": "string",
      "title": "默认模式",
      "description": "选择默认工作模式",
      "default": "standard",
      "sensitive": false
    }
  }
}
```

## 路径规则

- 所有路径必须**相对**于插件根目录
- 所有路径必须以 `./` 开头
- 可以使用数组指定多个路径