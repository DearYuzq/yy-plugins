# AI Dev Create v2.4 — 约束求解开发插件

专业级 Claude Code 开发插件，实现 **分散发散（Clarify） → 收敛验证 → 约束提取 → SPEC → PLAN → TDD 闭环 → 独立审查 → 验证循环** 的约束求解管道。

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

根据需求复杂度选择，从简单到复杂：

| 命令 | 管道阶段 | 适用场景 |
|------|----------|----------|
| `/tdd-quick` | Critique(quick) + 3 问确认 → 内联约束 → TEST → IMPL(3 维自检) → VERIFY | Bug 修复、简单功能、小型重构 |
| `/sdd-standard` | Critique(raw) → Diverger → 用户确认 → Completer → Security(light) → 约束提取 → SPEC → PLAN → TEST → IMPL → 独立 REVIEW → VERIFY | 中等复杂度新功能 |
| `/sdd-full` | 完整 Clarify(A-H, 含 POC + 红蓝对抗) → 约束提取 → SPEC → PLAN → TEST → IMPL → 独立 REVIEW → VERIFY | 跨系统功能、安全敏感功能 |

**/sdd-standard 的 Completer 阶段**：自动运行端到端用户旅程检查，补全缺失需求。**/sdd-full 独有**：Decomposer 构建需求树、Critique(structured) 做 SMART 验证、Explorer 生成 POC、最终需求汇总。

### 独立命令（可组合使用）

每个命令可独立运行，也可作为管道中间步骤手动调用：

| 命令 | 用途 | 说明 |
|------|------|------|
| `/clarify "需求"` | 独立需求澄清 | 运行完整 8 阶段 Clarify 流程，产出 01-08 系列报告 |
| `/extract` | 提取约束树 | 从已有 Clarify 报告生成 `constraint-tree.yaml` |
| `/spec` | 生成规范 | 将收敛摘要转换为结构化功能规范 |
| `/plan` | 生成计划 | 根据规范制定文件级实现计划 |
| `/test` | 编写测试 | TDD 驱动，基于计划 + 约束树生成测试用例 |
| `/impl` | 实现代码 | 按计划编写生产代码，自动追踪进度 |
| `/impl --tdd` | TDD 实现 | 先调用 tester 写测试 (RED)，再实现代码 (GREEN) |
| `/impl --resume` | 恢复实现 | 从上次中断处继续 |
| `/impl --file path` | 修改指定文件 | 精确控制变更范围 |
| `/review` | 代码审查 | 独立交叉审查已完成的代码 |
| `/review --full` | 深度审查 | + 架构优雅性、设计模式、扩展性 |
| `/review --security` | 安全审查 | + OWASP Top 10 + 四向量攻击面 + 数据流追溯 |
| `/verify` | 验证循环 | BUILD → TYPE → LINT → TEST → SECURITY → DIFF → CONSTRAINT-MAP → CONSTRAINT-BEHAVIOR |
| `/verify --quick` | 快速验证 | 跳过测试步骤 |
| `/status` | 查看进度 | 显示当前管道阶段、进度和下一步 |

### 常用组合场景

```bash
# 1. 先澄清需求，再决定开发
/clarify "实现 JWT 认证中间件"
→ 产出 01-08 系列报告后，可再跑 /extract → /spec → ...

# 2. 只跑验证循环
/verify                    # 完整 8 步验证
/verify --quick            # 跳过测试

# 3. TDD 快速修复
/tdd-quick "修复分页 off-by-one 错误"

# 4. 独立代码审查
/review --full

# 5. 中途恢复
/impl --resume             # 继续上次中断的实现
```

## 管道详解

### 完整管道流程图（/sdd-full）

```
用户需求
  │
  ├── [A] Critique (raw)           质疑需求，12 项清单评分可信度
  ├── [B] Diverger                 MECE 发散，What-If 分析，补全盲区
  ├── [C] Decomposer               构建需求树，MoSCoW 优先级，依赖图
  ├── [D] Critique (structured)    SMART 验证，正交过滤，ROI 分析
  │                          ║
  │                    【质量门：自动检查报告质量，不满足则重做】
  │                    【用户确认点：AskUserQuestion 确认关键决策】
  │                          ║
  ├── [E] Completer              端到端用户旅程检查，补全缺失需求
  ├── [F] Explorer               生成 POC → Bash 执行 → 技术风险验证
  ├── [G] Security Teamer        红蓝对抗：8 类攻击向量 × 4 种手法
  ├── [H] 最终需求汇总            整合全部产出为单一文档
  │                          ║
  │                    【用户确认点：确认最终需求】
  │                          ║
  ├── 约束提取 → constraint-tree.yaml
  │                          ║
  ├── SPEC (规范) → .claude/specs/{feature}.md     【用户确认点】
  ├── PLAN (计划) → .claude/plans/{feature}.md     【用户确认点】
  ├── TEST (RED)  → 测试用例
  ├── IMPL (GREEN) → 生产代码 + 3 维自检（质量/安全/约束覆盖）
  ├── REVIEW (独立审查) → .claude/reviews/{feature}.md   [reviewer Agent, 7 维度, 2-pass]
  ├── VERIFY  → BUILD → TYPE → LINT → TEST → SECURITY → DIFF → CONSTRAINT-MAP → CONSTRAINT-BEHAVIOR
  │                           ║
  │                     【覆盖率门控：Lines>=80%, Branches>=75%, Functions>=80%】
  │                     【约束行为门控：每个约束对应测试必须 PASS】
  │                          ║
  └── ✅ 完成
       └── 自动追加 Lessons Learned 到 tasks/lessons.md
```

### 三档入口阶段对照

| 阶段 | /tdd-quick | /sdd-standard | /sdd-full |
|------|:----------:|:-------------:|:---------:|
| A. Critique (raw) | ✅ quick + 清单 | ✅ | ✅ full |
| Mini-Clarify Gate | ✅ (≥ 3 问) | N/A | N/A |
| B. Diverger | ❌ | ✅ | ✅ |
| C. Decomposer | ❌ | ❌ | ✅ |
| D. Critique (structured) | ❌ | ❌ | ✅ |
| **用户确认点** | ❌ | ✅ | ✅ |
| E. Completer | ❌ | ✅ | ✅ |
| F. Explorer (POC) | ❌ | ❌ | ✅ |
| G. Security Teamer | ❌ | ⚡ light | ✅ full |
| H. 最终需求汇总 | ❌ | ❌ | ✅ |
| Constraint Extract | inline | ✅ | ✅ |
| SPEC + PLAN | ❌ | ✅ | ✅ |
| TEST + IMPL | ✅ | ✅ | ✅ |
| **独立 REVIEW** | ❌ | ✅ (reviewer Agent, 7 维) | ✅ (reviewer Agent, 7 维) |
| VERIFY | ✅ + AST 约束验证 | ✅ + AST 约束验证 | ✅ + AST + 运维就绪 |

### 质量门控与重试管理

- **质量门**：Phase D 完成后自动检查报告质量（≥ 3 个具体问题、≥ 3 个 What-If 场景、依赖图非空），不满足则通知对应 Agent 重做（最多 1 次）。
- **重试管理**：同一失败类型最多自动重试 **3 次**。超过 3 次后生成诊断文件并通过 AskUserQuestion 请求用户决策。不同阶段有不同重试上限（见 `scripts/session-save.js` 中的 `RETRY_LIMITS`）。
- **失败回退**：根据失败现象自动回退到对应阶段，例如覆盖率不足 → 回退 TEST、需求理解偏差 → 回退 Critique(A)、REVIEW 发现 CRITICAL → 回退 IMPL。详见 `agents/orchestrator.md` 失败恢复表（13 条）。

### 约束树

管道的核心亮点 — 将需求映射到代码，确保每条需求都有函数实现和测试覆盖：

```yaml
# 示例约束树片段
requirement:
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

约束树不是一次性产物。SPEC/PLAN/TEST 阶段发现新约束或变更时，使用 YAML diff 增量更新。VERIFY 阶段的 CONSTRAINT-MAP 和 CONSTRAINT-BEHAVIOR 两步最终逐条验证每条约束都有对应函数实现且测试 PASS。

### TDD 闭环

TEST → IMPL 最多 2 轮迭代：

```
第一轮: TEST 编写测试 (RED) → IMPL 最小实现 (GREEN) → REFACTOR
第二轮: TEST 补充边界用例 → IMPL 修复 → 3 维自检 → 进入 REVIEW
```

第二轮后若仍有 RED 但非阻塞性缺陷，由独立 REVIEW 的 reviewer Agent 判断是否可进入 VERIFY。

## 核心原则

### AskUserQuestion 协调

所有子 Agent 调用 AskUserQuestion 遵循统一协调规则：去重（上游已确认的不重复问）、降级（用户跳过则自主判断）、聚合（Orchestrator 合并问题为一问）、优先级门控（安全类 CRITICAL 可直接提问，其他由 Orchestrator 统一处理）。

### 上下文压缩

Clarify 阶段产生的 01-07 中间报告在 SPEC/PLAN 阶段**不直接读取**。Orchestrator 在 Phase D 后生成 `divergent-summary.md`（≤ 500 行），在 Phase G 后生成 `convergent-summary.md`（≤ 800 行）。SPEC/PLAN 只读取这两个摘要，确保上下文可控。

## Agent 总览

| Agent | 阶段 | 职责 |
|-------|------|------|
| orchestrator | 全管道 | 主编排，管道唯一定义源，AskUserQuestion 协调，摘要生成 |
| critique | A / D | 需求即假设 (raw, 12 项清单评分) / SMART 验证 (structured) |
| diverger | B | MECE 分解，类比启发，What-If 分析，反向思考 |
| decomposer | C | 构建需求树，MoSCoW 优先级，YAML 依赖图 |
| completer | E | 端到端用户旅程检查，MISS-xxx 补全缺失需求 |
| explorer | F | POC 生成 → Bash 执行验证，multi-profile 技术可行性 |
| security-teamer | G | 红蓝对抗：8 类攻击 × 4 种手法，量化优先级 (P0-P3) |
| constraint-extractor | 桥梁 | 约束树提取，YAML diff 增量更新 |
| planner | SPEC/PLAN | 功能规范 + 文件级实现计划，风险评估矩阵 |
| tester | TEST | 测试生成（约束树驱动），覆盖率强制门控 |
| implementer | IMPL | 代码实现 + 3 维自检（质量/安全/约束覆盖） |
| reviewer | REVIEW | 独立交叉审查（7 维, 2-pass, 未参与代码编写） |

## 模板体系

插件提供 21 个模板文件，供各阶段 Agent 参考输出格式：

| 模板 | 使用阶段 |
|------|----------|
| `templates/spec-template.md` | SPEC 输出格式 |
| `templates/plan-template.md` | PLAN 输出格式 |
| `templates/test-template.md` | TEST 输出格式 |
| `templates/review-output-template.md` | REVIEW 输出格式 |
| `templates/verify-report-template.md` | VERIFY 报告格式 |
| `templates/constraint-tree-template.yaml` | 约束树 YAML 格式 |
| `templates/decomposer-output-template.md` | Decomposer 输出格式 |
| `templates/diverger-output-template.md` | Diverger 输出格式 |
| `templates/clarification-template.md` | 澄清文档格式 |
| `templates/edge-case-checklist.md` | TEST 边界情况参考 |
| `templates/inline-constraints-template.md` | /tdd-quick 内联约束格式 |
| `templates/todo-template.md` | 会话任务清单格式 |
| `templates/lessons-template.md` | 经验教训格式 |
| `templates/final-requirements-template.md` | 最终需求汇总格式 |
| `templates/security-standards.md` | 安全审查参考 |
| `templates/poc-{javascript,python,java,go,rust}.md` | POC 代码模板 |
| `templates/poc-profiles.yaml` | POC Profile 配置 |

## 产品输出

管道运行后会在项目 `.claude/` 目录下生成结构化产物：

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
│   ├── 08-final-requirements.md   （仅 /sdd-full）
│   ├── clarification.md             （可选，含详细澄清决策）
│   └── poc/
│       └── poc-*.md               （POC 代码，后被归档）
├── constraints/{feature}/
│   └── constraint-tree.yaml       （需求到代码的映射，唯一来源）
├── specs/{feature}.md             （功能规范）
├── plans/{feature}.md             （实现计划）
├── summaries/
│   ├── divergent-summary.md       （A-D 摘要，SPEC/PLAN 读取）
│   └── convergent-summary.md      （E-G 摘要，SPEC/PLAN 读取）
├── reviews/{feature}.md           （独立审查报告）
├── reports/
│   └── constraint-coverage.md     （约束覆盖验证报告）
└── session.json                   （会话进度状态）
```

## 自我进化

- **Lessons Learned**：VERIFY 通过后，自动将本次会话的修复模式追加到 `tasks/lessons.md`
- **会话自动恢复**：启动时自动加载 lessons.md 规则 + `.claude/session.json` 进度
- **预澄清产物复用**：若 `.claude/clarifications/` 已存在 ≥ 3 个报告，自动跳过 Clarify 阶段直接进入约束提取

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
