---
name: status
description: 查看当前 SDD 流程状态，显示当前阶段、相关文件和下一步建议。
disable-model-invocation: true
argument-hint: [--reset] [--reset:docs] [--reset:session]
---

# /ai-dev-create:status - 查看流程状态

显示当前 SDD/TDD 开发流程的状态信息。

## 当前会话状态

!`cat .claude/session.json 2>/dev/null || echo '{"status": "无活动会话"}'`

## 澄清文件

!`find .claude/clarifications -name "*.md" 2>/dev/null | head -5 || echo "无澄清文件"`

## 规范文件

!`find .claude/specs -name "*.md" 2>/dev/null | head -5 || echo "无规范文件"`

## 计划文件

!`find .claude/plans -name "*.md" 2>/dev/null | head -5 || echo "无计划文件"`

## 测试文件

!`find . -name "*.test.*" -o -name "*.spec.*" 2>/dev/null | grep -v node_modules | head -10 || echo "无测试文件"`

## 最近审查

!`find .claude/reviews -name "*.md" 2>/dev/null | head -3 || echo "无审查报告"`

## 使用方式

```bash
/ai-dev-create:status              # 查看当前状态
/ai-dev-create:status --reset      # 重置状态并删除所有生成文档
/ai-dev-create:status --reset:docs # 仅删除生成的文档
/ai-dev-create:status --reset:session # 仅删除会话状态
/ai-dev-create:status --phase PLAN # 设置当前阶段
```

## --reset 参数说明

`--reset` 命令用于清理 SDD 流程生成的文件，支持以下选项：

| 参数 | 说明 | 删除内容 |
|------|------|----------|
| `--reset` | 完全重置 | 文档 + 会话状态 |
| `--reset:docs` | 仅删除文档 | clarifications/, specs/, plans/, tests/, reviews/ |
| `--reset:session` | 仅删除状态 | ~/.claude/sessions/.../latest.json, .claude/session.json |

**删除的文件类型**：

| 目录 | 文件模式 |
|------|----------|
| clarifications/ | *.md |
| specs/ | *.md |
| plans/ | *.md |
| tests/ | *.test.*, *.spec.* |
| reviews/ | *.md |

**执行方式**：直接删除，无需确认。

## 输出内容

```markdown
# 开发流程状态

## 当前项目
- 项目名称：{project_name}
- 工作目录：{working_dir}

## SDD 流程状态

### 当前阶段
**{phase}** - {phase_description}

### 流程进度
[✅] CLARIFY - 已完成
[✅] SPEC - 已完成
[✅] PLAN - 已完成
[🔄] TEST - 进行中
[⬜] IMPL - 待开始
[⬜] REVIEW - 待开始
[⬜] VERIFY - 待开始

### 相关文件
- 澄清文件：{clarification_file}
- 规范文件：{spec_file}
- 计划文件：{plan_file}
- 测试文件：{test_files}
- 实现文件：{impl_files}
- 审查报告：{review_file}

## 下一步建议
{next_step}

## 最近活动
- {last_activity}
```

## SDD 阶段说明

| 阶段 | 状态标记 | 说明 |
|------|----------|------|
| CLARIFY | ✅/🔄/⬜ | 澄清模糊需求 |
| SPEC | ✅/🔄/⬜ | 创建功能规范 |
| PLAN | ✅/🔄/⬜ | 生成实现计划 |
| TEST | ✅/🔄/⬜ | 编写测试用例 |
| IMPL | ✅/🔄/⬜ | 实现代码 |
| REVIEW | ✅/🔄/⬜ | 代码审查 |
| VERIFY | ✅/🔄/⬜ | 运行验证循环 |

## 状态标记
- ✅ 已完成
- 🔄 进行中
- ⬜ 待开始

## 自动更新

状态会自动更新：
- 运行 `/ai-dev-create:clarify` 后进入 CLARIFY 阶段
- 运行 `/ai-dev-create:spec` 后进入 SPEC 阶段
- 运行 `/ai-dev-create:plan` 后进入 PLAN 阶段
- 运行 `/ai-dev-create:test` 后进入 TEST 阶段
- 运行 `/ai-dev-create:impl` 后进入 IMPL 阶段
- 运行 `/ai-dev-create:review` 后进入 REVIEW 阶段
- 运行 `/ai-dev-create:verify` 后进入 VERIFY 阶段
- 验证通过后标记为完成
