# AI Dev Create v2.3 — 约束求解开发插件

专业级 Claude Code 开发插件，实现 **分散发散 → 收敛验证 → 约束提取 → TDD闭环 → 自我进化** 的约束求解管道。

## 快速上手

### 安装

```bash
# 从插件市场安装
claude plugin install ai-dev-create@yuzq-plugins

# 开发模式加载
claude --plugin-dir /path/to/yy-plugins/plugins/ai-dev-create
```

### 一行命令开始

```bash
/sdd-standard "用 Python Flask 实现用户注册登录功能"
```

## 使用方式

### 三档管道入口（推荐）

根据需求复杂度选择：

| 命令 | 管道 | 适用场景 |
|------|------|----------|
| `/tdd-quick` | Critique(quick) → TEST → IMPL → REVIEW → VERIFY | Bug修复、简单功能 |
| `/sdd-standard` | Critique → Diverger → 约束提取 → SPEC → PLAN → TEST → IMPL → REVIEW → VERIFY | 中等复杂度新功能 |
| `/sdd-full` | 澄清(A-H) → 约束提取 → SPEC → PLAN → TEST → IMPL → REVIEW → VERIFY | 跨系统、安全敏感 |

### 独立命令（可组合使用）

每个命令可独立运行，也可在管道中间步骤手动干预：

| 命令 | 用途 | 说明 |
|------|------|------|
| `/clarify "需求"` | 独立需求澄清 | 运行完整 8 阶段澄清流程，产出 08-final-requirements.md |
| `/extract` | 提取约束树 | 从已有需求/报告生成 constraint-tree.yaml |
| `/spec` | 生成规范 | 将需求转换为结构化功能规范 |
| `/plan` | 生成计划 | 根据规范制定文件级实现计划 |
| `/test` | 编写测试 | TDD 驱动，基于计划和约束树生成测试 |
| `/impl` [--tdd] | 实现代码 | 按计划编写生产代码，支持 --tdd 模式 |
| `/impl --resume` | 恢复实现 | 从上次中断处继续 |
| `/review` [--full] | 代码审查 | 独立交叉审查已完成代码 |
| `/verify` | 验证循环 | BUILD → TYPE → LINT → TEST → SECURITY → DIFF → CONSTRAINT-MAP |
| `/status` | 查看进度 | 显示当前管道阶段、进度和下一步 |

### 常用组合场景

```bash
# 1. 先澄清需求，再决定开发
/clarify "实现 JWT 认证中间件"
→ 用户确认后自动进入约束提取 → SPEC → PLAN → ...

# 2. 只跑验证循环
/verify                    # 完整验证
/verify --quick            # 跳过测试

# 3. TDD 快速修复
/tdd-quick "修复分页 off-by-one 错误"

# 4. 中途恢复
/impl --resume             # 继续上次中断的实现
```

## 管道详解

### 完整管道流程图

```
用户需求
  │
  ├── [A] Critique (raw)      质疑需求，评分可信度
  │
  ├── [B] Diverger            MECE 发散，补全盲区
  │
  ├── [C] Decomposer          构建需求树 + 优先级
  │
  ├── [D] Critique (structured) SMART 验证，剔除不合理需求
  │                    ║
  │              【用户确认点】
  │                    ║
  ├── [E] Completer           端到端用户旅程检查
  │
  ├── [F] Explorer            POC 生成 → Bash 执行验证
  │
  ├── [G] Security Teamer     红蓝对抗 + 收敛摘要 + 最终需求文档
  │
  ├── [H] 最终需求汇总         整合全部产出为一
  │                    ║
  │              【用户确认点】
  │                    ║
  ├── 约束提取 → constraint-tree.yaml
  │                    ║
  ├── SPEC (规范) → .claude/specs/{feature}.md
  │
  ├── PLAN (计划) → .claude/plans/{feature}.md
  │
  ├── TEST (RED)  测试用例
  │
  ├── IMPL (GREEN) 生产代码 + 自检 REVIEW
  │
  ├── REVIEW (独立审查) → .claude/reviews/{feature}.md
  │
  ├── VERIFY  BUILD → TYPE → LINT → TEST → SECURITY → DIFF → CONSTRAINT-MAP
  │
  └── ✅ 完成
```

### 三档入口阶段对照

| 阶段 | /tdd-quick | /sdd-standard | /sdd-full |
|------|:----------:|:-------------:|:---------:|
| A. Critique (raw) | ✅ quick | ✅ | ✅ full |
| B. Diverger | ❌ | ✅ | ✅ |
| C. Decomposer | ❌ | ❌ | ✅ |
| D. Critique (structured) | ❌ | ❌ | ✅ |
| E. Completer | ❌ | ❌ | ✅ |
| F. Explorer (POC) | ❌ | ❌ | ✅ |
| G. Security Teamer | ❌ | ⚡ light | ✅ full |
| H. 最终需求汇总 | ❌ | ❌ | ✅ |
| 约束提取 | inline | ✅ | ✅ |
| SPEC → PLAN → TEST → IMPL → REVIEW → VERIFY | ✅ | ✅ | ✅ |

### 约束树

约束求解管道的核心亮点 — 将需求映射到代码：

```
Requirement → Constraint → Feature → Module → Function → Test Case
```

```yaml
# 示例约束树片段
requirements:
  - id: REQ-001
    description: "用户可通过邮箱注册"
    constraints:
      - id: C-001
        type: functional
        description: "邮箱格式必须通过验证"
features:
  - id: FEAT-001
    name: "用户注册"
    modules:
      - id: MOD-001
        name: "AuthService"
        functions:
          - signature: "register(email: string, password: string): Promise<UserResult>"
            constraint_ids: ["C-001"]
            tests:
              - "should reject invalid email format"
```

### 失败回退

| 失败现象 | 回退到 |
|----------|--------|
| 功能不符合验收标准 | SPEC |
| 测试覆盖率不足 | TEST |
| CRITICAL 安全漏洞 | IMPL |
| 需求理解偏差 | Critique (A) 重新分散发散 |
| 多个阶段同时失败 | 完整诊断 + AskUserQuestion |

同一失败类型最多自动重试 3 次。

## Agent 总览

| Agent | 阶段 | 职责 |
|-------|------|------|
| orchestrator | 全管道 | 主编排，管道唯一定义源 |
| critique | A / D | 需求即假设 (raw) / SMART 验证 (structured) |
| diverger | B | MECE 分解，探索可能性空间，生成收敛摘要 |
| decomposer | C | 构建需求树，MoSCoW 优先级 |
| completer | E | 端到端用户旅程检查 |
| explorer | F | POC 验证，不可行方案丢弃 |
| security-teamer | G / H | 红蓝对抗，生成收敛摘要和最终需求文档 |
| constraint-extractor | 桥梁 | 约束树提取 |
| planner | SPEC/PLAN | 规范与计划 |
| tester | TEST | 测试生成（基于约束树） |
| implementer | IMPL / REVIEW | 代码实现 + 自检 REVIEW + 独立审查 |

## 自我进化

- **Lessons Learned**：每次修复 Bug 后，规律追加到 `tasks/lessons.md`
- **会话自动恢复**：启动自动加载 lessons.md 规则 + `.claude/session.json` 进度
- **会话自动保存**：由 `session-save` hook 在 Stop 事件时触发

## 产品输出

管道运行后会在项目 `.claude/` 目录下生成：

```
.claude/
├── clarifications/{feature}-{session_id}/
│   ├── 01-critique-raw.md
│   ├── 02-diverger-report.md
│   ├── 03-requirement-tree.md
│   ├── 04-critique-structured.md
│   ├── 05-completer-report.md
│   ├── 06-explorer-report.md
│   ├── 07-security-report.md
│   ├── 08-final-requirements.md（仅 /sdd-full）
│   └── poc/
├── constraints/{feature}/constraint-tree.yaml
├── specs/{feature}.md
├── plans/{feature}.md
├── summaries/
│   ├── divergent-summary.md
│   └── convergent-summary.md
├── reviews/{feature}.md
└── reports/
    └── constraint-coverage.md
```

## 配置

插件支持以下用户配置：

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `defaultFlow` | string | `standard` | 默认管道：quick / standard / full |
| `autoSaveSession` | boolean | `true` | 是否自动保存会话进度 |

## 清理工具

```bash
# 重置所有生成的文档（保留代码）
node plugins/ai-dev-create/scripts/reset-docs.js --docs

# 重置会话状态
node plugins/ai-dev-create/scripts/reset-docs.js --session

# 预览将删除哪些文件
node plugins/ai-dev-create/scripts/reset-docs.js --docs --dry-run
```

## License

MIT
