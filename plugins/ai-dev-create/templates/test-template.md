# 测试用例：{功能名称}

> 规范文件：{spec_file}
> 计划文件：{plan_file}
> 创建日期：{日期}

## 测试范围

{描述本次测试覆盖的功能范围}

---

## 单元测试

### {模块名称}

```typescript
describe('{模块名称}', () => {
  describe('{函数/方法}', () => {
    it('should {期望行为}', () => {
      // Arrange
      const input = { /* ... */ };
      const expected = { /* ... */ };

      // Act
      const result = functionUnderTest(input);

      // Assert
      expect(result).toEqual(expected);
    });

    it('should handle {边界条件}', () => {
      // Arrange
      const input = { /* 边界值 */ };

      // Act & Assert
      expect(() => functionUnderTest(input))
        .toThrow(ExpectedError);
    });
  });
});
```

### 测试用例清单

| ID | 描述 | 输入 | 期望输出 | 状态 |
|----|------|------|----------|------|
| UT-001 | {描述} | {输入} | {输出} | ⬜ |
| UT-002 | {描述} | {输入} | {输出} | ⬜ |

---

## 集成测试

### {接口/服务名称}

```typescript
describe('{接口名称} Integration', () => {
  beforeAll(async () => {
    // 设置测试环境
  });

  afterAll(async () => {
    // 清理测试数据
  });

  it('should {期望行为}', async () => {
    // Arrange
    const request = { /* ... */ };

    // Act
    const response = await api.call(request);

    // Assert
    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(expectedData);
  });
});
```

### 测试用例清单

| ID | 描述 | API | 请求 | 响应 | 状态 |
|----|------|-----|------|------|------|
| IT-001 | {描述} | POST /api/xxx | {请求} | {响应} | ⬜ |

---

## E2E 测试

### 用户旅程：{旅程名称}

```typescript
test('{旅程描述}', async ({ page }) => {
  // 前置条件
  await page.goto('/');

  // 步骤 1
  await page.click('button');
  await expect(page.locator('.result')).toBeVisible();

  // 步骤 2
  await page.fill('input', 'value');
  await page.click('submit');

  // 验证结果
  await expect(page).toHaveURL('/success');
});
```

### 测试场景清单

| ID | 场景 | 步骤 | 断言 | 状态 |
|----|------|------|------|------|
| E2E-001 | {场景} | {步骤数} | {断言数} | ⬜ |

---

## 测试数据

### 有效数据

```json
{
  "field1": "valid_value",
  "field2": 100
}
```

### 无效数据

```json
{
  "field1": "",
  "field2": -1
}
```

### 边界数据

```json
{
  "field1": "max_length_string...",
  "field2": 2147483647
}
```

---

## Mock 配置

```typescript
// Mock 外部服务
jest.mock('../services/external', () => ({
  fetchData: jest.fn().mockResolvedValue({ data: 'mocked' })
}));
```

---

## 覆盖率目标

| 类型 | 目标 | 当前 |
|------|------|------|
| 行覆盖率 | 80% | - |
| 分支覆盖率 | 80% | - |
| 函数覆盖率 | 80% | - |

---

## 变更记录

| 日期 | 变更内容 |
|------|----------|
| {日期} | 初始测试用例 |