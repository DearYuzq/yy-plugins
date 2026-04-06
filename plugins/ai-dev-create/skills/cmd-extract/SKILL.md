---
name: cmd-extract
description: 从已有需求中提取约束树。将收敛后的需求拆解为 Requirement → Feature → Module → Function 的结构化映射。
agent: constraint-extractor
context: fork
---

# /cmd-extract — 约束提取

从已有需求中提取约束树，实现需求到函数的结构化映射。

## 使用方法

```bash
/cmd-extract                              # 基于当前已有需求提取
/cmd-extract --feature "feature-name"     # 指定特征名称
```

## 执行流程

1. 读取 `.claude/adc-result/request/{request-name}/clarifications/` 下的澄清报告
2. 如果存在 `constraint-tree.yaml`，读取并对比
3. 调用 `constraint-extractor` agent 执行约束提取
4. 输出到 `.claude/adc-result/request/{request-name}/constraint-tree.yaml`

## 输出产物

- `.claude/adc-result/request/{request-name}/constraint-tree.yaml` — 完整约束树

## 下游引用

- SPEC → 读取 `requirements` 和 `constraints`
- PLAN → 读取 `features[].modules`
- TEST → 读取 `modules[].functions[].tests`
- IMPL → 读取 `modules[].functions[].signature`
