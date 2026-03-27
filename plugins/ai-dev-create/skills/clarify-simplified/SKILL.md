---
name: clarify-simplified
description: 简化的需求澄清流程。适用于需求相对清晰但需要验证的场景，跳过部分 agent。
disable-model-invocation: true
argument-hint: [功能描述]
---

# Clarify Simplified - 简化澄清流程

当需求基本清晰但需要验证时，可以使用简化版本。

## 与完整 CLARIFY 的区别

| 环节 | 完整流程 | 简化流程 |
|------|----------|----------|
| Preprocessor | ✅ | ✅ |
| Diverger | ✅ | ✅ |
| Decomposer | ✅ | ❌ 跳过 |
| Challenger | ✅ | ❌ 跳过 |
| 用户确认点 | ✅ | ⚠️ 可选 |
| Completer | ✅ | ❌ 跳过 |
| Explorer | ✅ | ⚠️ 可选 |
| Red-Teamer | ✅ | ❌ 跳过 |
| Blue-Teamer | ✅ | ❌ 跳过 |

## 适用条件

简化流程适用于：
- 需求描述已经比较详细
- 不涉及安全敏感功能
- 单模块、技术栈明确
- 团队对业务领域熟悉

## 执行流程

### Step 1: Preprocessor

使用 preprocessor agent 进行基础验证：

```
使用 preprocessor agent 分析需求，重点关注：
- 完整性评分
- 明显的矛盾和缺失

输出：可信度评分
如果评分 ≥ 7，继续简化流程
如果评分 < 7，建议使用完整流程
```

### Step 2: Diverger

使用 diverger agent 快速探索：

```
使用 diverger agent 进行快速发散：
- 核心需求确认
- 主要边界情况识别
- 技术方案参考

输出：需求可能性空间概览
```

### Step 3: 用户确认

与用户确认：
- 核心需求是否正确理解
- 是否有遗漏的重要场景
- 技术方案是否可行

### Step 4: 直接进入 SPEC

如果确认通过，直接进入 SPEC 阶段。

## 使用示例

```bash
# 需求已经写好，需要快速验证
/clarify-simplified 实现用户登录功能，使用 JWT，支持记住我选项

# 老功能增强，业务逻辑熟悉
/clarify-simplified 为订单模块添加批量导出功能
```

## 何时切换到完整流程

如果在简化流程中发现以下情况，应切换到完整流程：

1. 可信度评分 < 7
2. 发现需求存在矛盾
3. 涉及安全或支付等敏感功能
4. 技术方案存在不确定性
5. 跨系统、多团队协作

切换方法：
```bash
/sdd-full {功能描述}
```
