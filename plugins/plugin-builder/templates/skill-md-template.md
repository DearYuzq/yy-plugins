# SKILL.md 模板参考

## 目录位置

- 用户级：`~/.claude/skills/{skill-name}/SKILL.md`
- 项目级：`.claude/skills/{skill-name}/SKILL.md`
- 插件级：`{plugin}/skills/{skill-name}/SKILL.md`

## Frontmatter 字段

| 字段 | 必需 | 类型 | 说明 |
|------|------|------|------|
| name | 否 | string | Skill 名称（kebab-case，最多 64 字符）|
| description | 推荐 | string | 功能描述，Claude 用于决定何时使用 |
| argument-hint | 否 | string | 参数提示，显示在 `/` 菜单中 |
| disable-model-invocation | 否 | boolean | true 则 Claude 不会自动加载 |
| user-invocable | 否 | boolean | false 则从 `/` 菜单隐藏 |
| allowed-tools | 否 | string[] | 无需权限批准的工具列表 |
| model | 否 | string | 使用的模型（sonnet/opus/haiku）|
| context | 否 | string | `fork` 则在分叉 subagent 中运行 |
| agent | 否 | string | `context: fork` 时使用的 subagent |
| hooks | 否 | object | 限定于此 skill 的 hooks |

## 示例模板

### 简单 Skill

```markdown
---
name: my-skill
description: Skill 功能描述
---

Skill instructions here...

## 使用方式

```bash
/my-skill [参数]
```
```

### 完整 Skill

```markdown
---
name: my-skill
description: 详细描述何时使用此 skill
argument-hint: [--option] [参数]
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Bash
context: fork
agent: my-agent
---

# Skill 标题

## 功能说明

详细说明 skill 的功能和用途。

## 使用方式

```bash
/my-skill              # 基本用法
/my-skill --option     # 带选项
```

## 参数说明

| 参数 | 说明 |
|------|------|
| --option | 选项描述 |

## 执行流程

1. 步骤一
2. 步骤二
3. 步骤三

## 注意事项

- 注意点一
- 注意点二
```

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

## 变量替换

在 hook 命令中可用：

| 变量 | 描述 |
|------|------|
| `$ARGUMENTS` | 所有参数 |
| `$ARGUMENTS[N]` | 第 N 个参数（0 基索引）|
| `$N` | `$ARGUMENTS[N]` 的简写 |
| `${CLAUDE_SESSION_ID}` | 当前会话 ID |
| `${CLAUDE_SKILL_DIR}` | 包含 SKILL.md 的目录 |