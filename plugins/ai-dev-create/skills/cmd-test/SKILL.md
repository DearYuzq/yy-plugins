---
name: test
description: 编写测试用例，TDD 驱动，测试优先。覆盖单元、集成和 E2E 测试。
disable-model-invocation: true
argument-hint: [--plan path] [--constraints path]
context: fork
agent: tester
allowed-tools: Read, Write, Grep, Glob, Bash
---

# /ai-dev-create:test - 编写测试用例

基于实现计划和约束树，编写全面的测试用例。覆盖单元测试、集成测试和 E2E 测试。

## 使用方式

```bash
/ai-dev-create:test                              # 基于当前计划和约束生成
/ai-dev-create:test --plan .claude/plans/xxx.md  # 基于指定计划
/ai-dev-create:test --coverage 90                # 设置覆盖率目标（默认 80）
```

## 输出

编写测试文件，包括：
- 单元测试（AAA 模式、Given-When-Then 模式）
- 集成测试（组件交互、数据库交互）
- E2E 测试（用户旅程验证）

## 测试原则

1. **TDD 驱动**：先写测试后写实现（RED → GREEN → REFACTOR）
2. **约束覆盖**：约束树中每个 `functions[].tests` 都有对应测试
3. **覆盖目标**：行/分支/函数覆盖率 ≥ 80%
4. **边界条件**：空输入、最大值、异常、并发
5. **可读性**：测试描述清晰，遵循"should ... when ..."模式

## 技术栈示例

### TypeScript/Jest

```typescript
describe('UserService', () => {
  it('should create a user when email is unique', async () => {
    const repo = createMockRepo();
    const service = new UserService(repo);
    const user = await service.create(validUserData);
    expect(user.id).toBeDefined();
    expect(repo.create).toHaveBeenCalledTimes(1);
  });

  it('should throw DuplicateError when email exists', async () => {
    // ...
  });
});
```

### Python/pytest

```python
@pytest.mark.asyncio
async def test_create_user():
    repo = create_mock_repo()
    service = UserService(repo)
    user = await service.create(valid_user_data)
    assert user.id is not None
    repo.create.assert_awaited_once()
```

## 下一步

测试完成后：
- RED 状态 → `/impl` — 实现代码使测试通过
- 覆盖率不足 → 补充边界条件测试

---

## Agent 调用

本命令需要调用以下 Agent：

### 调用的 Agent

| Agent | 调用时机 | 输入 | 输出 |
|-------|----------|------|------|
| tester | 命令启动时 | 实现计划 + 约束树 | 测试文件 + RED 状态 |

### 调用方式

```
Agent 工具参数：
- subagent_type: "ai-dev-create:tester"
- description: "编写测试用例覆盖计划中的功能和约束树"
- prompt: "基于以下计划和约束树编写测试用例：{计划内容}"
```

### 上下文传递

**接收的上下文**：
- 计划文档：`.claude/plans/{feature}.md`
- 约束树：`.claude/constraints/{feature}/constraint-tree.yaml`
- 规范文档：`.claude/specs/{feature}.md`

**输出的上下文**：
- 测试文件列表
- 覆盖率预估
- 测试运行结果（应全部失败 — RED 状态）

### 执行流程

1. 读取实现计划和约束树
2. 使用 Agent 工具调用 tester agent
3. 等待 agent 返回测试
4. 运行测试确认全部失败（RED）
5. 显示测试报告摘要
