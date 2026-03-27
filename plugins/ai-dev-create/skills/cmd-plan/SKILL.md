---
name: plan
description: 生成实现计划，将规范分解为可执行的步骤。
---

# /ai-dev-create:plan - 生成实现计划

基于功能规范，生成详细的实现计划，包括文件变更、步骤分解和测试策略。

## 使用方式

```bash
/ai-dev-create:plan                    # 基于当前规范生成计划
/ai-dev-create:plan "功能描述"          # 直接规划功能
/ai-dev-create:plan --spec .claude/specs/xxx.md # 基于指定规范
```

## 输出

生成实现计划，包含：
- 架构变更清单
- 分阶段实现步骤
- 测试策略
- 风险评估

## 计划模板

```markdown
# 实现计划：[功能名称]

## 架构变更
- 新增文件：[列表]
- 修改文件：[列表]

## 实现步骤

### Phase 1: [阶段名]
1. **[步骤]** (File: path/to/file)
   - Action: [具体操作]
   - Why: [原因]
   - Dependencies: [依赖]
   - Risk: Low/Medium/High

### Phase 2: [阶段名]
...

## 测试策略
- 单元测试：[范围]
- 集成测试：[范围]
- E2E 测试：[用户旅程]

## 风险评估
| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| [风险] | [影响] | [措施] |
```

## 规划原则

1. **增量交付**：每个阶段独立可验证
2. **最小化变更**：优先扩展现有代码
3. **保持模式一致**：遵循项目约定
4. **支持测试**：设计可测试的结构

## 下一步

计划完成后，运行：
- `/test` - 编写测试用例
- `ai-dev-create:impl` - 开始实现
- `ai-dev-create:verify` - 验证实现

---

## Agent 调用

本命令需要调用以下 Agent：

### 调用的 Agent

| Agent | 调用时机 | 输入 | 输出 |
|-------|----------|------|------|
| planner | 命令启动时 | 规范文档或功能描述 | 实现计划 |

### 调用方式

使用 Agent 工具调用 planner agent：

```
Agent 工具参数：
- subagent_type: "planner"
- description: "生成实现计划"
- prompt: "基于以下规范生成实现计划：{规范内容或文件路径}"
```

### 上下文传递

**接收上一阶段的上下文**：
- 规范文档路径：`.claude/specs/{feature}.md`
- 澄清文档路径（如有）：`.claude/clarifications/{feature}/`

**传递给下一阶段的上下文**：
- 计划文档路径：`.claude/plans/{feature}.md`
- 文件变更清单
- 测试策略
- 风险评估结果

### 执行流程

1. 读取规范文档或接收功能描述
2. 使用 Agent 工具调用 planner agent
3. 等待 agent 返回计划
4. 保存计划到 `.claude/plans/{feature}.md`
5. 显示计划摘要，请求用户确认