# 验证报告

> 功能：{feature_name}
> 生成时间：{timestamp}
> 验证模式：{full/quick}

## 概览

| 阶段 | 状态 | 详情 |
|------|------|------|
| Build | {PASS/FAIL} |  |
| Type | {PASS/FAIL} |  |
| Lint | {PASS/FAIL/WARN} |  |
| Test | {PASS/FAIL} | Lines: {n}% / Branches: {n}% / Functions: {n}% |
| Security | {PASS/FAIL} |  |
| Diff | {PASS/WARN} | {n} 个文件变更 |
| Constraint-Map | {PASS/FAIL} | {covered}/{total} 约束已覆盖 |
| Constraint-Behavior | {PASS/FAIL} | {pass}/{total} 测试 PASS |

## 覆盖率详情

| 指标 | 目标阈值 | 实际值 | 状态 |
|------|----------|--------|------|
| 行覆盖率 | >= 80% | {n}% | {PASS/FAIL} |
| 分支覆盖率 | >= 75% | {n}% | {PASS/FAIL} |
| 函数覆盖率 | >= 80% | {n}% | {PASS/FAIL} |

## 约束覆盖详情

| 约束 ID | 约束描述 | 函数名 | 测试用例 | 状态 |
|---------|----------|--------|----------|------|

## 问题清单

| 严重度 | 阶段 | 描述 |
|--------|------|------|

## 结论

{PASS/FAIL} — {通过/未通过}验证
{如未通过，列出回退建议}
