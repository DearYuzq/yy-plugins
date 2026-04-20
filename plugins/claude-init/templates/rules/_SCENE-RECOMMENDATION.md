# 场景化规则推荐系统

## 工作原理

本插件提供智能的规则推荐系统，在关键时机提醒加载适合的规则。

## 推荐时机

### 1. 会话开始 (SessionStart)

每次 Claude Code 启动时自动检查：
- ✅ 显示所有规则加载状态
- ⚠️ 提醒未安装的核心规则
- 💡 推荐安装命令

### 2. 工具使用前 (PreToolUse)

| 操作 | 触发规则推荐 |
|------|-------------|
| **Edit/Write** (代码编辑) | quality-standards (质量标准) |
| **git commit** (提交) | quality-standards (验证) |
| **test** (测试) | quality-standards (分析失败) |
| **pm2/docker** (服务调试) | service-mgmt (后端调试) |
| **Agent** (子智能体) | subagent-strategy (策略规范) |
| **TaskCreate** (任务创建) | planning-first (三文档系统) |

### 3. 工具使用后 (PostToolUse)

| 操作 | 后续提醒 |
|------|---------|
| **git** 操作 | 建议 /cc-update 同步 |
| **Edit/Write** | 建议记录 lessons |

### 4. 会话结束 (Stop)

- 运行规则推荐脚本
- 根据会话内容推荐下次加载的规则

## 规则优先级

```
required (必须) > recommended (推荐) > optional (可选)
```

### 必须规则（核心 5 条）

| 规则 | 场景 | 原因 |
|------|------|------|
| planning-first | 所有任务 | 规划是质量基础 |
| subagent-strategy | 复杂任务 | 防止 Agent 滥用 |
| quality-standards | 代码操作 | 确保输出质量 |
| self-improve | 持续过程 | 积累经验教训 |
| principles | 所有场景 | 核心原则指导 |

### 推荐规则（场景特定）

| 规则 | 场景 |
|------|------|
| prompt-tips | 需求模糊时 |
| automation | 设计 Hook 时 |
| service-mgmt | 后端调试时 |

## 规则 Frontmatter

每条规则包含场景标签：

```yaml
---
scenes:
  - planning
  - task-start
  - complex-task
priority: required  # required | recommended | optional
paths:              # 可选：路径特定加载
  - "src/**/*.ts"
---
```

## 手动触发推荐

```bash
# 查看当前场景推荐
bash .claude/scripts/rule-recommender.sh

# 指定场景推荐
bash .claude/scripts/rule-recommender.sh planning complex-task
```

## 禁用自动推荐

在 `.claude/settings.local.json` 中：

```json
{
  "claudeInit": {
    "autoRecommend": false
  }
}
```