---
name: cc-remove-rule
description: 从 .claude/rules/ 目录删除指定规则文件
argument-hint: <rule-name>
allowed-tools: Read, Bash
---

# /claude-init:cc-remove-rule - 删除规则

## 使用方式

```bash
# 删除单条规则
/cc-remove-rule planning-mode

# 删除多条规则
/cc-remove-rule elegance bug-fix
```

## 功能说明

1. **验证规则存在** - 确认规则文件存在
2. **安全删除** - 删除前提示确认
3. **保留备份** - 可选保留删除文件的备份

## 执行流程

1. 检查规则文件是否存在
2. 提示用户确认删除
3. 删除规则文件
4. 输出确认信息

## 注意事项

- 删除后需要重新运行 `/cc-init` 或手动更新 CLAUDE.md 中的引用
- 建议使用 `git status` 确认删除操作
