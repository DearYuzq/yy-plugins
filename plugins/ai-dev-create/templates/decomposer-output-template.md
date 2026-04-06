# Decomposer 输出模板

## 文件路径
`.claude/adc-result/request/{request-name}/clarifications/03-requirement-tree.md`

## 模板内容

### 需求树文档

文件路径：`.claude/adc-result/request/{request-name}/clarifications/03-requirement-tree.md`

```markdown
# 需求树：{功能名称}

> Session ID: {session_id}
> 创建时间：{timestamp}
> 状态：{completed}
> 来源：02-diverger-report.md

---

## 1. 元信息

| 属性 | 值 |
|------|-----|
| 来源文档 | 02-diverger-report.md |
| 需求总数 | {count} |
| 功能需求 | {count} |
| 非功能需求 | {count} |
| 约束需求 | {count} |
| Must | {count} |
| Should | {count} |
| Could | {count} |
| Won't | {count} |

---

## 2. 需求树结构

```tree
ROOT: {功能名称}
│
├── FR-001 [Must] {需求描述}
│   ├── FR-001.1 [Must] {子需求}
│   │   └── requires: FR-002
│   └── FR-001.2 [Should] {子需求}
│
├── FR-002 [Must] {需求描述}
│   └── conflicts: FR-003
│
├── FR-003 [Should] {需求描述}
│   └── enhances: FR-001
│
├── NFR-001 [Must] 性能需求
│   └── 响应时间 < 200ms
│
├── NFR-002 [Must] 安全需求
│   └── 数据加密存储
│
└── CON-001 [Must] 技术约束
    └── 使用 MySQL 8.0
```

---

## 3. 需求详情表

### 3.1 功能需求

| ID | 描述 | 优先级 | 父节点 | 依赖 | 冲突 | 验收标准 |
|----|------|--------|--------|------|------|----------|
| FR-001 | {描述} | Must | - | - | - | {AC} |
| FR-001.1 | {描述} | Must | FR-001 | FR-002 | - | {AC} |
| FR-001.2 | {描述} | Should | FR-001 | - | - | {AC} |
| FR-002 | {描述} | Must | - | - | FR-003 | {AC} |
| FR-003 | {描述} | Should | - | - | FR-002 | {AC} |

### 3.2 非功能需求

| ID | 类型 | 描述 | 指标 | 验证方法 |
|----|------|------|------|----------|
| NFR-001 | 性能 | 响应时间 | < 200ms | 压测 |
| NFR-002 | 安全 | 数据加密 | AES-256 | 审计 |
| NFR-003 | 可用性 | 可用率 | 99.9% | 监控 |

### 3.3 约束需求

| ID | 类型 | 描述 | 强制性 | 验证方法 |
|----|------|------|--------|----------|
| CON-001 | 技术 | MySQL 8.0 | 是 | 代码审查 |
| CON-002 | 时间 | 2周内上线 | 是 | 项目管理 |

---

## 4. 依赖关系

### 4.1 依赖关系表

| 需求A | 关系 | 需求B | 说明 |
|-------|------|-------|------|
| FR-001.1 | requires | FR-002 | {说明} |
| FR-003 | enhances | FR-001 | {说明} |

### 4.2 冲突关系表

| 需求A | 冲突需求B | 冲突原因 | 解决状态 |
|-------|-----------|----------|----------|
| FR-002 | FR-003 | {原因} | 待决策 |

### 4.3 依赖图

```
FR-001
  ├── requires ──▶ FR-002
  └── enhanced by ─▶ FR-003
                       │
                       └── conflicts ──▶ FR-002 【待决策】
```

---

## 5. 优先级分布

### 5.1 Must Have（必须有）

| ID | 描述 | 理由 |
|----|------|------|
| FR-001 | {描述} | 核心功能 |
| FR-002 | {描述} | 核心功能 |
| NFR-001 | {描述} | 性能要求 |
| NFR-002 | {描述} | 安全要求 |

### 5.2 Should Have（应该有）

| ID | 描述 | 理由 |
|----|------|------|
| FR-003 | {描述} | 体验提升 |

### 5.3 Could Have（可以有）

| ID | 描述 | 理由 |
|----|------|------|
| FR-004 | {描述} | 锦上添花 |

### 5.4 Won't Have（本次不做）

| ID | 描述 | 原因 | 未来计划 |
|----|------|------|----------|
| FR-005 | {描述} | 时间限制 | v2.0 |

---

## 6. 待决策项

### 决策 D-001

**问题**：FR-002 与 FR-003 冲突

**涉及需求**：
- FR-002: {描述}
- FR-003: {描述}

**冲突原因**：{原因}

**可选方案**：

| 方案 | 选择 | 放弃 | 影响 | 建议 |
|------|------|------|------|------|
| A | FR-002 | FR-003 | {影响} | |
| B | FR-003 | FR-002 | {影响} | |
| C | 折中 | - | {影响} | ✓ |

**用户决策**：{待填写}

---

## 7. 验收标准模板

每个需求应包含以下验收标准格式：

```gherkin
Feature: {需求ID} - {需求名称}

Scenario: {场景名称}
  Given {前置条件}
  When {触发动作}
  Then {预期结果}
```

### 示例

```gherkin
Feature: FR-001 - 用户登录

Scenario: 正常登录
  Given 用户已注册
  When 用户输入正确的用户名和密码
  Then 用户成功登录
  And 跳转到首页

Scenario: 密码错误
  Given 用户已注册
  When 用户输入错误的密码
  Then 显示错误提示"密码错误"
  And 登录失败次数+1
```

---

## 8. 拆解质量评估

| 维度 | 评分 | 说明 |
|------|------|------|
| 完整性 | {score}/10 | 所有需求点是否都已纳入 |
| 结构清晰度 | {score}/10 | 层级是否合理 |
| 依赖准确性 | {score}/10 | 依赖关系是否正确识别 |
| 优先级合理性 | {score}/10 | 优先级分配是否合理 |

**综合拆解评分**：{score}/10

---

## 9. 传递给下一阶段

传递给 Critique (structured) Agent 的上下文：

```yaml
decomposer_output:
  requirement_tree: {tree_structure}
  functional_requirements: [{list}]
  non_functional_requirements: [{list}]
  constraints: [{list}]
  dependencies: [{list}]
  conflicts: [{list}]
  priority_distribution:
    must: {count}
    should: {count}
    could: {count}
    wont: {count}
  pending_decisions: [{list}]
  decomposition_score: {score}
```
```

---

