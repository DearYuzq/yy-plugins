# 边界情况检查清单：{功能名称}

使用此清单确保所有边界情况都已考虑和处理。

> 创建日期：{date}
> 功能：{feature_name}
> 规范来源：{spec_file}

---

## 1. 输入验证边界情况

### 1.1 空值处理

- [ ] 空字符串输入
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

- [ ] null/undefined 输入
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

- [ ] 空数组/空对象输入
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

### 1.2 边界值处理

- [ ] 最小值边界
  - 边界值：{min_value}
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

- [ ] 最大值边界
  - 边界值：{max_value}
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

- [ ] 边界值 + 1（超出范围）
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

### 1.3 格式验证

- [ ] 无效格式输入
  - 示例：{example}
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

- [ ] 特殊字符输入
  - 示例：`<script>`, `'`, `"`, `\n`, `\t`
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

- [ ] Unicode/非 ASCII 字符
  - 示例：中文、Emoji、特殊符号
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

---

## 2. 数据状态边界情况

### 2.1 数据存在性

- [ ] 数据不存在（404）
  - 场景：{scenario}
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

- [ ] 数据已存在（冲突）
  - 场景：{scenario}
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

### 2.2 数据量边界

- [ ] 单条记录
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

- [ ] 大量数据（分页）
  - 数据量：{amount}
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

- [ ] 数据量超过限制
  - 限制：{limit}
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

### 2.3 数据状态

- [ ] 脏数据/不一致状态
  - 场景：{scenario}
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

- [ ] 部分数据缺失
  - 缺失字段：{fields}
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

---

## 3. 用户交互边界情况

### 3.1 用户状态

- [ ] 未登录用户
  - 场景：访问需要认证的功能
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

- [ ] 无权限用户
  - 场景：访问需要特定权限的功能
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

- [ ] 首次使用用户
  - 场景：无历史数据/设置
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

### 3.2 会话状态

- [ ] 会话过期
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

- [ ] 并发登录
  - 场景：同一用户多设备登录
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

### 3.3 用户输入

- [ ] 快速重复提交
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

- [ ] 中途取消操作
  - 场景：{scenario}
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

---

## 4. 系统状态边界情况

### 4.1 资源限制

- [ ] 内存不足
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

- [ ] 磁盘空间不足
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

- [ ] CPU 高负载
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

### 4.2 外部依赖

- [ ] 数据库连接失败
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

- [ ] 外部 API 不可用
  - API：{api_name}
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

- [ ] 外部 API 响应超时
  - 超时时间：{timeout}
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

- [ ] 外部 API 返回错误
  - 错误码：{error_code}
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

### 4.3 网络问题

- [ ] 网络断开
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

- [ ] 网络延迟高
  - 延迟：{latency}
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

- [ ] 网络不稳定（间歇性断开）
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

---

## 5. 时间边界情况

### 5.1 日期边界

- [ ] 年初（1月1日）
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

- [ ] 年末（12月31日）
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

- [ ] 闰年 2月29日
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

### 5.2 时间边界

- [ ] 午夜 00:00:00
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

- [ ] 时区边界
  - 场景：跨时区用户
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

- [ ] 夏令时切换
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

---

## 6. 并发边界情况

### 6.1 数据竞争

- [ ] 同时读取同一数据
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

- [ ] 同时更新同一数据
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

- [ ] 读取时正在更新
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

### 6.2 事务边界

- [ ] 事务中途失败
  - 场景：{scenario}
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

- [ ] 死锁
  - 场景：{scenario}
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

---

## 7. 安全边界情况

### 7.1 输入攻击

- [ ] SQL 注入
  - 测试输入：`' OR '1'='1`
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

- [ ] XSS 攻击
  - 测试输入：`<script>alert(1)</script>`
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

- [ ] 路径遍历
  - 测试输入：`../../../etc/passwd`
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

### 7.2 认证绕过

- [ ] 过期 Token
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

- [ ] 无效 Token
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

- [ ] 权限提升尝试
  - 场景：普通用户尝试访问管理员功能
  - 预期行为：{behavior}
  - 测试用例：TC-{n}

---

## 8. 总结

### 覆盖情况

| 类别 | 总项数 | 已处理 | 待处理 | 覆盖率 |
|------|--------|--------|--------|--------|
| 输入验证 | {total} | {done} | {pending} | {rate}% |
| 数据状态 | {total} | {done} | {pending} | {rate}% |
| 用户交互 | {total} | {done} | {pending} | {rate}% |
| 系统状态 | {total} | {done} | {pending} | {rate}% |
| 时间边界 | {total} | {done} | {pending} | {rate}% |
| 并发情况 | {total} | {done} | {pending} | {rate}% |
| 安全边界 | {total} | {done} | {pending} | {rate}% |

### 风险评估

| 边界情况 | 风险级别 | 处理优先级 |
|----------|----------|------------|
| {case} | High/Medium/Low | P1/P2/P3 |

### 待办事项

- [ ] {action_item_1}
- [ ] {action_item_2}
- [ ] {action_item_3}

---

## 变更记录

| 日期 | 变更内容 | 作者 |
|------|----------|------|
| {date} | 初始版本 | {author} |