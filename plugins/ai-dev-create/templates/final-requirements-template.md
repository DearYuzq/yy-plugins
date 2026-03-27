# 最终需求文档：{功能名称}

> Session ID: {session_id}
> 创建时间：{timestamp}
> 状态：CLARIFIED

---

## 执行摘要

本需求经过完整的多阶段澄清流程：

| 阶段 | Agent | 结果 |
|------|-------|------|
| 预处理 | preprocessor | 可信度评分 {score}/10 |
| 发散 | diverger | 发现 {count} 个潜在需求点 |
| 拆解 | decomposer | 构建 {count} 个需求节点 |
| 挑战 | challenger | 剔除 {count} 个不合理需求 |
| 补全 | completer | 新增 {count} 个缺失需求 |
| 探测 | explorer | 验证 {count} 个技术风险 |
| 红蓝对抗 | red-teamer + blue-teamer | 解决 {count} 个安全问题 |

---

## 需求树 (最终版本)

```tree
ROOT: {功能名称}
├── [MUST] FR-001: {需求描述}
│   ├── FR-001.1: {子需求}
│   └── FR-001.2: {子需求}
├── [MUST] FR-002: {需求描述}
├── [SHOULD] FR-003: {需求描述}
├── [MUST] NFR-001: {非功能需求}
└── [MUST] SEC-001: {安全需求}
```

---

## 需求详情

### 功能需求

| ID | 描述 | 优先级 | 依赖 | 验收标准 |
|----|------|--------|------|----------|
| FR-001 | {描述} | Must | - | {AC} |
| FR-001.1 | {描述} | Must | FR-002 | {AC} |
| FR-002 | {描述} | Must | - | {AC} |
| FR-003 | {描述} | Should | FR-001 | {AC} |

### 非功能需求

| ID | 类型 | 描述 | 指标 | 验证方法 |
|----|------|------|------|----------|
| NFR-001 | 性能 | 响应时间 | < 200ms | 压测 |
| NFR-002 | 安全 | 数据加密 | AES-256 | 审计 |
| NFR-003 | 可用性 | 可用率 | 99.9% | 监控 |

### 安全需求

| ID | 描述 | 针对风险 | 优先级 |
|----|------|----------|--------|
| SEC-001 | 参数化查询 | SQL注入 | Must |
| SEC-002 | 数据归属检查 | 越权访问 | Must |
| SEC-003 | 输出编码 | XSS | Must |

### 约束需求

| ID | 类型 | 描述 | 强制性 |
|----|------|------|--------|
| CON-001 | 技术 | 框架版本 | 是 |
| CON-002 | 时间 | 上线时间 | 是 |
| CON-003 | 资源 | 开发人力 | 是 |

---

## 依赖关系图

```
FR-001 ──requires──▶ FR-002
  │
  └──enhances──▶ FR-003

FR-004 ──requires──▶ SEC-001
```

---

## 约束树

```tree
CONSTRAINTS
├── 技术约束
│   ├── 框架版本: {version}
│   ├── 语言版本: {version}
│   └── 浏览器支持: {browsers}
├── 资源约束
│   ├── 开发人力: {hours}人时
│   ├── 服务器资源: {resources}
│   └── 上线时间: {date}
└── 业务约束
    ├── 合规要求: {requirements}
    ├── 用户群体: {users}
    └── 业务规则: {rules}
```

---

## 决策记录

| 决策ID | 决策内容 | 原因 | 影响需求 |
|--------|----------|------|----------|
| D-001 | 选择方案A而非B | 成本更低，效果相当 | FR-003 |
| D-002 | 新增安全需求SEC-001 | 红蓝对抗发现SQL注入风险 | SEC-001 |

---

## 术语表

| 术语 | 定义 | 使用场景 |
|------|------|----------|
| {term} | {definition} | {context} |

---

## 风险清单

| 风险ID | 类型 | 描述 | 影响 | 缓解措施 |
|--------|------|------|------|----------|
| R-001 | 技术 | {描述} | {影响} | {措施} |

---

## 审批清单

- [ ] 产品确认
- [ ] 技术确认
- [ ] 安全确认
- [ ] 测试确认

---

## 相关文档

- 预处理报告：`.claude/clarifications/{session_id}/01-preprocessor-report.md`
- 发散报告：`.claude/clarifications/{session_id}/02-diverger-report.md`
- 需求树：`.claude/clarifications/{session_id}/03-requirement-tree.md`
- 挑战报告：`.claude/clarifications/{session_id}/04-challenger-report.md`
- 补全报告：`.claude/clarifications/{session_id}/05-completer-report.md`
- 探测报告：`.claude/clarifications/{session_id}/06-explorer-report.md`
- 攻击报告：`.claude/clarifications/{session_id}/07-red-team-report.md`
- 防御报告：`.claude/clarifications/{session_id}/08-blue-team-report.md`
- POC 代码：`.claude/clarifications/{session_id}/poc/`

---

## 下一步

运行 `/ai-dev-create:spec` 基于此文档创建功能规范。