---
scenes:
  - new-task
  - unclear-requirement
  - need-research
  - decision-making
priority: recommended
---

# Prompt 技巧

## 三条核心原则

1. **尽量具体** — 别说"帮我加个功能"，说清楚要什么、在哪里、怎么交互
2. **不确定就让 Claude 调研** — 让它给出多个方案你来选
3. **别用引导性提问** — 不要问"这样好不好"，而是让它分析优劣

## 反面示例

- ❌ "帮我加个登录功能"
- ❌ "这样写好不好？"
- ❌ "你觉得应该用 A 还是 B？"

## 正面示例

- ✅ "在 src/auth/ 下添加 JWT 登录接口，使用 bcrypt 加密，返回 token 过期时间 24h"
- ✅ "调研三种缓存方案（Redis、Memcached、本地缓存），对比性能和适用场景"
- ✅ "分析方案 A 和方案 B 的优劣，给出推荐和理由"

## 进阶技巧

- 要求 Claude 先列出它理解的要点再开始工作
- 让 Claude 说明每个修改的原因
- 复杂任务让 Claude 先给出方案再执行

## 加载时机

**推荐场景**：
- 需求描述模糊时
- 需要 Claude 做调研分析时
- 做技术决策时
- 新用户学习使用 Claude 时