---
name: iterative-retrieval
description: 迭代检索模式，解决子 agent 上下文问题。当需要为子 agent 收集上下文时激活。
version: 1.0.0
---

# Iterative Retrieval

解决多 agent 工作流中的上下文问题，通过迭代方式逐步精化检索内容。

## 问题背景

子 agent 在启动时上下文有限，无法预知：
- 哪些文件包含相关代码
- 项目使用什么模式
- 代码库使用什么术语

### 传统方法的失败

- **发送所有内容**：超出上下文限制
- **不发送任何内容**：agent 缺少关键信息
- **猜测需要什么**：经常猜错

## 解决方案：迭代检索

```
┌─────────────────────────────────────────────┐
│                                             │
│   ┌──────────┐      ┌──────────┐            │
│   │ DISPATCH │─────▶│ EVALUATE │            │
│   └──────────┘      └──────────┘            │
│        ▲                  │                 │
│        │                  ▼                 │
│   ┌──────────┐      ┌──────────┐            │
│   │   LOOP   │◀─────│  REFINE  │            │
│   └──────────┘      └──────────┘            │
│                                             │
│        最多 3 轮，然后继续                    │
└─────────────────────────────────────────────┘
```

## 四阶段流程

### Phase 1: DISPATCH（分发）

初始广泛查询，收集候选文件。

```javascript
const initialQuery = {
  patterns: ['src/**/*.ts', 'lib/**/*.ts'],
  keywords: ['authentication', 'user', 'session'],
  excludes: ['*.test.ts', '*.spec.ts']
};

const candidates = await retrieveFiles(initialQuery);
```

**输出**：候选文件列表

### Phase 2: EVALUATE（评估）

评估检索内容的相关性。

```javascript
function evaluateRelevance(files, task) {
  return files.map(file => ({
    path: file.path,
    relevance: scoreRelevance(file.content, task),
    reason: explainRelevance(file.content, task),
    missingContext: identifyGaps(file.content, task)
  }));
}
```

**相关性评分**：
- **高 (0.8-1.0)**：直接实现目标功能
- **中 (0.5-0.7)**：包含相关模式或类型
- **低 (0.2-0.4)**：边缘相关
- **无 (0-0.2)**：不相关，排除

### Phase 3: REFINE（精化）

基于评估更新搜索条件。

```javascript
function refineQuery(evaluation, previousQuery) {
  return {
    // 添加高相关文件中发现的模式
    patterns: [...previousQuery.patterns, ...extractPatterns(evaluation)],

    // 添加代码库术语
    keywords: [...previousQuery.keywords, ...extractKeywords(evaluation)],

    // 排除确认不相关的路径
    excludes: [...previousQuery.excludes, ...evaluation
      .filter(e => e.relevance < 0.2)
      .map(e => e.path)
    ],

    // 关注缺失的上下文
    focusAreas: evaluation
      .flatMap(e => e.missingContext)
      .filter(unique)
  };
}
```

### Phase 4: LOOP（循环）

使用精化的条件重复（最多 3 轮）。

```javascript
async function iterativeRetrieve(task, maxCycles = 3) {
  let query = createInitialQuery(task);
  let bestContext = [];

  for (let cycle = 0; cycle < maxCycles; cycle++) {
    const candidates = await retrieveFiles(query);
    const evaluation = evaluateRelevance(candidates, task);

    // 检查是否有足够的上下文
    const highRelevance = evaluation.filter(e => e.relevance >= 0.7);
    if (highRelevance.length >= 3 && !hasCriticalGaps(evaluation)) {
      return highRelevance;
    }

    // 精化并继续
    query = refineQuery(evaluation, query);
    bestContext = mergeContext(bestContext, highRelevance);
  }

  return bestContext;
}
```

## 实践示例

### 示例 1：Bug 修复上下文

```
任务：修复认证 token 过期 bug

第 1 轮：
  DISPATCH: 搜索 "token", "auth", "expiry" 在 src/**
  EVALUATE: 发现 auth.ts (0.9), tokens.ts (0.8), user.ts (0.3)
  REFINE: 添加 "refresh", "jwt" 关键词；排除 user.ts

第 2 轮：
  DISPATCH: 使用精化后的搜索
  EVALUATE: 发现 session-manager.ts (0.95), jwt-utils.ts (0.85)
  REFINE: 上下文充足（2 个高相关文件）

结果: auth.ts, tokens.ts, session-manager.ts, jwt-utils.ts
```

### 示例 2：功能实现上下文

```
任务：为 API 端点添加速率限制

第 1 轮：
  DISPATCH: 搜索 "rate", "limit", "api" 在 routes/**
  EVALUATE: 无匹配 - 代码库使用 "throttle" 术语
  REFINE: 添加 "throttle", "middleware" 关键词

第 2 轮：
  DISPATCH: 使用精化后的搜索
  EVALUATE: 发现 throttle.ts (0.9), middleware/index.ts (0.7)
  REFINE: 需要 router 模式

第 3 轮：
  DISPATCH: 搜索 "router", "express" 模式
  EVALUATE: 发现 router-setup.ts (0.8)
  REFINE: 上下文充足

结果: throttle.ts, middleware/index.ts, router-setup.ts
```

## Agent 集成

在 agent 提示中使用：

```markdown
当为此任务检索上下文时：
1. 从广泛的关键词搜索开始
2. 评估每个文件的相关性（0-1 分）
3. 识别仍缺失的上下文
4. 精化搜索条件并重复（最多 3 轮）
5. 返回相关性 >= 0.7 的文件
```

## 最佳实践

1. **先广后窄**：初始查询不要过于具体
2. **学习术语**：第一轮常揭示命名约定
3. **跟踪缺失**：显式的缺口识别驱动精化
4. **适可而止**：3 个高相关文件胜过 10 个平庸文件
5. **果断排除**：低相关文件不会变相关

## 相关技能

- `sdd-workflow` - SDD 流程中使用此模式
- `tdd-workflow` - TDD 流程中的上下文收集
- `verification-loop` - 验证时的上下文分析