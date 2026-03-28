---
name: sdd-full
description: 完整 SDD 流程入口。适用于复杂项目，包含完整的 CLARIFY 发散-收敛流程、安全红蓝对抗验证。
disable-model-invocation: true
argument-hint: [功能描述]
context: fork
agent: orchestrator
allowed-tools: Read, Write, Edit, Grep, Glob, Bash, Agent, WebSearch
---

# SDD Full - 完整开发流程

适用于以下场景：
- 复杂功能（跨系统、多团队协作）
- 高风险功能（涉及安全、支付、合规）
- 需要深度需求分析的项目

## 流程概览

```
$ARGUMENTS
    ↓
┌─────────────────────────────────────────┐
│ CLARIFY 阶段                            │
├─────────────────────────────────────────┤
│ 发散阶段：                               │
│   Preprocessor → Diverger →             │
│   Decomposer → Challenger               │
│        ↓                                │
│   【用户确认点】                          │
│        ↓                                │
│ 收敛阶段：                               │
│   Completer → Explorer →                │
│   Red-Teamer → Blue-Teamer              │
└─────────────────────────────────────────┘
    ↓
SPEC → PLAN → TEST → IMPL → REVIEW → VERIFY
```

## 执行步骤

### Phase 0: CLARIFY 阶段

#### 发散阶段

**Step 0.1: Preprocessor**

使用 preprocessor agent 预处理需求：

```
使用 preprocessor agent 分析需求：
- 完整性检查（功能、用户、场景、数据、约束）
- 一致性检查（逻辑、时序、资源、价值矛盾）
- 可行性质疑
- 计算可信度评分

输出：.claude/clarifications/{feature}/01-preprocessor-report.md
```

**Step 0.2: Diverger**

使用 diverger agent 发散探索：

```
使用 diverger agent 发散探索：
- MECE 分解（功能、用户、场景、时间维度）
- 类比参考（WebSearch 搜索类似产品）
- What-If 场景生成
- 反向思考

输出：.claude/clarifications/{feature}/02-diverger-report.md
```

**Step 0.3: Decomposer**

使用 decomposer agent 拆解需求：

```
使用 decomposer agent 构建需求树：
- 将发散结果结构化
- 建立需求依赖关系
- 识别冲突需求

输出：.claude/clarifications/{feature}/03-decomposer-report.md
```

**Step 0.4: Challenger**

使用 challenger agent 挑战需求：

```
使用 challenger agent 质疑需求：
- 正交过滤，剔除不合理需求
- 判定方法论冲突
- 生成挑战报告

输出：.claude/clarifications/{feature}/04-challenger-report.md
```

**【用户确认点】**

等待用户确认发散阶段结果，确认后进入收敛阶段。

#### 收敛阶段

**Step 0.5: Completer**

使用 completer agent 补全需求：

```
使用 completer agent 端到端检查：
- 需求链条完整性
- 用户旅程覆盖
- 边界情况补全

输出：.claude/clarifications/{feature}/05-completer-report.md
```

**Step 0.6: Explorer**

使用 explorer agent 技术验证：

```
使用 explorer agent POC 验证：
- 生成验证代码
- 执行技术可行性验证
- 丢弃不可行方案

输出：.claude/clarifications/{feature}/06-explorer-report.md
```

**Step 0.7: Red-Teamer**

使用 red-teamer agent 安全攻击：

```
使用 red-teamer agent 攻击测试：
- 边界问题攻击
- 安全漏洞发现
- 生成攻击报告

输出：.claude/clarifications/{feature}/07-red-teamer-report.md
```

**Step 0.8: Blue-Teamer**

使用 blue-teamer agent 防御方案：

```
使用 blue-teamer agent 防御设计：
- 评估红方攻击可防御性
- 提供安全解决方案
- 生成防御报告

输出：.claude/clarifications/{feature}/08-blue-teamer-report.md
```

**【最终评审】**

用户确认最终需求文档，进入 SPEC 阶段。

### Phase 1: SPEC 阶段

使用 planner agent 创建功能规范。

### Phase 2: PLAN 阶段

使用 planner agent 创建实现计划。

### Phase 3: TEST 阶段

使用 tester agent 编写测试。

### Phase 4: IMPL 阶段

使用 implementer agent 实现代码。

### Phase 5: REVIEW 阶段

使用 reviewer agent 审查代码。

### Phase 6: VERIFY 阶段

运行完整验证循环。

## 成功标准

- [ ] CLARIFY 所有报告已生成
- [ ] 用户确认点已通过
- [ ] 最终需求文档已确认
- [ ] 规范文档已创建
- [ ] 计划文档已创建
- [ ] 所有测试通过
- [ ] 覆盖率 ≥ 80%
- [ ] 无 CRITICAL/HIGH 问题
- [ ] 安全验证通过
- [ ] 所有验证通过

## 使用示例

```bash
# 复杂系统开发
/sdd-full 开发支付系统，支持多种支付方式、退款、对账功能

# 安全敏感功能
/sdd-full 实现用户权限管理系统，支持 RBAC、数据权限、审计日志

# 跨系统集成
/sdd-full 开发订单履约系统，对接 WMS、ERP、第三方物流
```
