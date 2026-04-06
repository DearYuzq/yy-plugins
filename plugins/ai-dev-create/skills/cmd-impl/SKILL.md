---
name: impl
description: 执行实现，编写生产代码。自动追踪实现进度并更新计划文档。
disable-model-invocation: true
argument-hint: [--tdd] [--file path] [--resume]
context: fork
agent: implementer
allowed-tools: Read, Write, Edit, Grep, Glob, Bash, Agent
---

# /ai-dev-create:impl - 执行实现

根据规范和计划编写生产代码，自动追踪实现进度。

## 使用方式

```bash
/ai-dev-create:impl                    # 按计划执行实现
/ai-dev-create:impl --tdd              # 使用 TDD 模式
/ai-dev-create:impl --file path/to/file # 实现指定文件
/ai-dev-create:impl --resume           # 从上次中断处恢复
```

---

## 进度追踪

`/ai-dev-create:impl` 命令会自动追踪实现进度：

1. **读取计划**：开始时读取 `.claude/plans/{feature}.md`
2. **检查进度**：从 🔄 进行中 或下一个 ⏳ 待开始 步骤继续
3. **更新状态**：每完成一步更新计划文档
4. **记录偏差**：实际实现与计划不同时记录

### 进度状态标记

| 标记 | 含义 |
|------|------|
| ✅ | 已完成 |
| 🔄 | 进行中 |
| ⏳ | 待开始 |
| ❌ | 已跳过 |
| ⚠️ | 需调整 |

### 查看当前进度

```bash
# 查看计划文档中的进度概览
cat .claude/plans/{feature}.md | grep -A 10 "进度概览"

# 或直接打开计划文档
# 查看 "📊 进度概览" 部分
```

### 恢复中断的实现

如果会话中断，重新运行 `/ai-dev-create:impl` 会：
1. 读取计划文档
2. 检查进度概览
3. 从 🔄 进行中 或下一个 ⏳ 待开始 步骤继续

---

## 实现流程

### 标准模式

```
1. 阅读规范和计划
2. 检查进度概览，确定当前步骤
3. 按阶段实现代码
4. 每个步骤完成后：
   - 更新计划文档状态
   - 记录实际变更（如有偏差）
   - 更新进度概览
5. 处理反馈和调整
```

### TDD 模式

```
1. 确保测试已编写
2. 运行测试（RED）
3. 编写最小实现
4. 运行测试（GREEN）
5. 更新计划文档状态
6. 重构代码
7. 重复直到完成
```

---

## 实现原则

### 不可变性优先

```typescript
// 错误：原地修改
function addItem(list, item) {
  list.push(item);
  return list;
}

// 正确：返回新对象
function addItem(list, item) {
  return [...list, item];
}
```

### 小函数原则

- 每个函数 < 50 行
- 单一职责
- 清晰命名

### 错误处理

- 始终处理可能的错误
- 提供有意义的错误信息
- 不要吞没异常

---

## 提交前检查

- [ ] 代码可读且命名清晰
- [ ] 函数小于 50 行
- [ ] 无深层嵌套（>4 层）
- [ ] 错误处理完整
- [ ] 无硬编码值
- [ ] 计划文档进度已更新

---

## 下一步

实现完成后（自动执行自检 REVIEW），运行：
- `ai-dev-create:verify` - 运行验证循环

---

## Agent 调用

本命令需要调用以下 Agent：

### 调用的 Agent

> Agent 工具调用由 Orchestrator 统一发起（见 orchestrator.md TEST → IMPL 闭环）。
> 本 Skill 仅在通过 --tdd 标志独立运行时，自行调用 tester subagent。

| Agent | 调用时机 | 说明 |
|-------|----------|------|
| tester | 仅 --tdd 模式下 | 编写测试用例 |
| 自身 (implementer) | 实现代码时 | 本 Skill 的 host Agent 即为 implementer |

### 调用方式

#### TDD 模式下调用 tester agent

```
Agent 工具参数：
- subagent_type: "ai-dev-create:tester"
- description: "编写测试用例"
- prompt: "基于以下计划编写测试：{计划文档路径}"
```

#### 调用 implementer agent

```
Agent 工具参数：
- subagent_type: "ai-dev-create:implementer"
- description: "实现生产代码"
- prompt: "根据以下内容实现代码：
  计划：{计划文档路径}
  测试文件：{测试文件路径列表}
  当前状态：RED/GREEN"
```

### 上下文传递

**接收上一阶段的上下文**：
- 计划文档路径：`.claude/plans/{feature}.md`
- 规范文档路径：`.claude/specs/{feature}.md`

**传递给下一阶段的上下文**：
- 变更的文件列表
- 测试运行结果（GREEN 状态）
- 实现说明

### 执行流程

#### TDD 模式

1. 读取计划文档
2. 使用 Agent 工具调用 tester agent 编写测试
3. 运行测试，确认 RED 状态
4. 使用 Agent 工具调用 implementer agent 实现代码
5. 运行测试，确认 GREEN 状态
6. 更新计划文档进度

#### 标准模式

1. 读取计划文档
2. 检查进度概览
3. 使用 Agent 工具调用 implementer agent
4. 更新计划文档状态