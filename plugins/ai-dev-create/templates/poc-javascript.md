# JavaScript/TypeScript POC 模板

```javascript
/**
 * POC: {poc-id}
 * 目标: {目标}
 * 创建时间: {timestamp}
 */

const testData = { /* ... */ };

async function verify_{poc_id}() {
  console.log(`[POC-${poc_id}] 开始验证...`);
  try {
    // 1. 准备环境
    // ...

    // 2. 执行测试
    const startTime = Date.now();
    // ... 测试逻辑
    const endTime = Date.now();

    // 3. 验证结果
    const result = { /* ... */ };

    if (result.success) {
      console.log(`[POC-${poc_id}] ✓ 通过`);
      console.log(`  耗时: ${endTime - startTime}ms`);
      return { status: 'PASS', data: result };
    } else {
      console.log(`[POC-${poc_id}] ✗ 失败`);
      console.log(`  原因: ${result.reason}`);
      return { status: 'FAIL', reason: result.reason };
    }
  } catch (error) {
    console.error(`[POC-${poc_id}] ✗ 错误`);
    console.error(`  错误: ${error.message}`);
    return { status: 'ERROR', error: error.message };
  }
}

verify_{poc_id}();
```
