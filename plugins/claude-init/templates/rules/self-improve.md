---
scenes:
  - bug-fix
  - user-correction
  - ci-failure
  - session-end
priority: required
---

# 持续改进

## 自主修复 Bug

- 收到 Bug 报告后直接修复
- 利用日志、报错信息、失败用例定位问题
- 无需用户额外补充上下文
- 自动修复 CI 测试失败问题

## 自我进化闭环

- 收到用户修正后，将规律记录到 .claude/lessons.md
- 给自己制定规则，避免重复犯错
- 持续迭代优化这些经验，直到错误率下降
- 每次会话开始前，回顾过往经验

## 加载时机

**必须场景**：
- 用户指出错误或修正时
- CI/CD 测试失败时
- 发现 Bug 需要修复时
- 会话结束时总结