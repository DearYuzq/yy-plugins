# 安全标准 — 单一事实来源

> 本文档定义了 ai-dev-create 管道的统一安全标准。
> Security Teamer、Reviewer、Implementer 自检和 VERIFY 阶段均应引用此标准。

---

## 通用安全检查清单（所有语言适用）

以下 12 项检查在所有阶段（Security Teamer 评估、Reviewer 审查、Implementer 自检、VERIFY 扫描）中共享同一标准。

| # | 检查项 | 通过条件 | FAIL 条件 |
|---|--------|----------|-----------|
| 1 | 输入验证 | 所有外部输入在进入系统边界前验证类型/长度/范围 | 未经验证直接处理 |
| 2 | SQL 注入防护 | 使用参数化查询/ORM，不字符串拼接 SQL | 任何字符串拼接 SQL |
| 3 | XSS 防护 | 输出到前端前编码/转义，CSP 头设置 | 未转义的 `innerHTML`/`dangerouslySetInnerHTML` |
| 4 | 认证/授权 | 敏感操作有权限验证，RBAC/ABAC 到位 | 未检查权限直接执行敏感操作 |
| 5 | 硬编码凭据 | 无密钥/密码/Token 硬编码 | 存在 API Key、密码、私钥硬编码 |
| 6 | 敏感数据加密 | 传输 HTTPS、存储 AES-256+、密码 bcrypt/argon2 | 明文传输/存储密码 |
| 7 | 日志安全 | 日志中无密码/Token/PII | 请求/响应/错误日志记录敏感数据 |
| 8 | CSRF 防护 | 所有状态变更操作使用 CSRF Token | `GET` 请求修改状态 |
| 9 | SSRF 防护 | 外部 URL 请求白名单/验证 | 未验证用户提供的外部 URL |
| 10 | 依赖安全 | 已知依赖无 CRITICAL/HIGH CVE | `npm audit`/`pip-audit`/`dependency-check` 报高危 |
| 11 | 反序列化安全 | 不反序列化未信任数据，不使用不安全的序列化库 | 任意对象反序列化 |
| 12 | 资源保护 | 速率限制、超时设置、连接池限制 | 无防御 DoS 的措施 |

---

## 语言特定检查

### TypeScript/React

- [ ] 无 `any` 类型滥用（用户输入必须验证，不信任 `any`）
- [ ] Props 和 State 有类型定义
- [ ] `useEffect` 依赖数组完整
- [ ] 无 `eval()`、`new Function()` 执行用户提供的字符串
- [ ] `dangerouslySetInnerHTML` 有 DOMPurify 或等效清理
- [ ] unhandled Promise rejections 有 catch

### Python

- [ ] 类型注解完整（参数 + 返回值）
- [ ] 异常类继承自基类
- [ ] 无裸露的 `except: pass`
- [ ] 不使用 `pickle.loads()` 反序列化未信任数据
- [ ] 不使用 `exec()`/`eval()` 执行用户输入
- [ ] 遵循 PEP 8 风格

### Spring Boot/Java

- [ ] `@Transactional` 注解在正确层级（service 层）
- [ ] Bean 注入通过构造器（非 `@Autowired` field）
- [ ] DTO/Entity 分离
- [ ] 全局异常处理器存在（`@ControllerAdvice`）
- [ ] 不使用 `ObjectInputStream` 反序列化未信任数据
- [ ] SQL 使用 `@Query` 参数化

### Go

- [ ] 不使用 `unsafe` 包（除非有明确且文档化的理由）
- [ ] `defer` 在资源获取之后（如 `file, err := os.Open(...); defer file.Close()`）
- [ ] 错误包裹检查使用 `errors.Is()` / `errors.As()` 而非字符串比较
- [ ] 并发安全：共享数据使用 `sync.Mutex` 或 `sync.RWMutex`
- [ ] 不使用 `init()` 隐藏副作用
- [ ] 不使用 `panic()` 处理可重试错误
- [ ] context 传递正确（`context.Context` 作为第一个参数）

### Rust

- [ ] 不使用 `unsafe` 块（除非有明确且文档化的理由）
- [ ] 不使用 `.unwrap()` / `.expect()` 处理可能失败的操作 — 使用 `?` 传播错误
- [ ] 并发安全：共享状态使用 `Arc<Mutex<T>>` 或 `Arc<RwLock<T>>`
- [ ] 生命周期标注正确（编译器无法自动推断时）
- [ ] 不使用 `std::process::exit()` 在库代码中
- [ ] `Result` 和 `Option` 必须被处理（不可忽略返回值）

---

## 问题分级定义（所有阶段共享）

| 级别 | 定义 | 处理 |
|------|------|------|
| CRITICAL | 可直接导致数据泄露、权限绕过、远程代码执行的安全漏洞 | 必须立即修复，否则阻塞 VERIFY |
| HIGH | 可导致权限提升、SQL 注入、XSS 的安全问题 | 必须修复，否则阻塞 VERIFY |
| MEDIUM | 可增加攻击面的问题（CORS 配置不当、敏感 Header 暴露） | 建议修复，可记录待办 |
| LOW | 风格或最佳实践偏离（缺少注释、非最优异常处理） | 记录，不阻断 |

## 攻击向量清单（用于 Security Teamer 红队评估）

### 1. 边界攻击
- 空输入、null、undefined
- 最大值/最小值
- 负数/零
- 超长字符串（缓冲区溢出测试）
- 特殊字符注入（`; ' " \`）

### 2. 异常攻击
- 类型不匹配（字符串传数字字段）
- JSON 结构不匹配
- 并发请求竞态条件
- 资源耗尽力（内存、连接、磁盘）

### 3. 安全攻击
- SQL 注入（`' OR 1=1 --`）
- XSS（`<script>alert(1)</script>`）
- 命令注入（`; rm -rf /`）
- 认证绕过（JWT 伪造、Session 固定）
- 越权（IDOR 水平/垂直越权）

### 4. 业务逻辑攻击
- 流程跳过（跳过支付直接进入成功页）
- 重放攻击（重复提交同一请求）
- 竞态条件（并发创建同一资源）
- 数量绕过（负数、零价格）

---

## 通过/失败标准

各阶段统一使用此标准判断安全状态：

| 阶段 | 通过条件 |
|------|----------|
| Security Teamer | 所有 CRITICAL 攻击向量已设计防御方案 |
| Reviewer | 通用 12 项 + 语言特定项 全部 PASS |
| Implementer 自检 | 通用 12 项中 1-5 项 PASS（安全基础） |
| VERIFY | 依赖漏洞扫描无 CRITICAL/HIGH，代码无硬编码凭据 |
