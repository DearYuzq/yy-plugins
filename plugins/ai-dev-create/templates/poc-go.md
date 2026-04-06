# Go POC 模板

```go
package main

import (
    "fmt"
    "os"
)

// POC: {poc-id}
// 目标: {目标}
// 创建时间: {timestamp}

func verify_{poc_id}() error {
    fmt.Printf("[POC-%s] 开始验证...\n", "{poc_id}")

    // 1. 准备测试数据
    // 2. 执行验证
    // 3. 结果判定
    passed := true
    if passed {
        fmt.Printf("[POC-%s] ✓ 通过\n", "{poc_id}")
        return nil
    }
    return fmt.Errorf("验证失败: {原因}")
}

func main() {
    if err := verify_{poc_id}(); err != nil {
        fmt.Fprintf(os.Stderr, "[POC-%s] ✗ %v\n", "{poc_id}", err)
        os.Exit(1)
    }
}
```
