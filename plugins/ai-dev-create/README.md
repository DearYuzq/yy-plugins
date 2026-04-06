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
# 标准流程 — 中等复杂度功能
/sdd-standard "用 Python Flask 实现用户注册登录功能"

# 完整流程 — 复杂/安全敏感功能
/sdd-full "开发支付系统，支持微信支付、支付宝、退款和对账"

# 快速流程 — Bug 修复/小型重构
/tdd-quick "修复 UserService 邮箱验证的 bug"
```

## 使用方式

### 三档管道入口（推荐）

根据需求复杂度选择，从简单到复杂：

| 命令 | 管道阶段 | 适用场景 |
|------|----------|----------|
| `/tdd-quick` | Critique(quick) + 内联约束 → TEST → IMPL(3 维自检) → VERIFY | Bug 修复、简单功能、小型重构 |
| `/sdd-standard` | Critique(raw) → Diverger → Completer → Security(light) → 约束提取 → SPEC → PLAN → TEST → IMPL → 独立 REVIEW → VERIFY | 中等复杂度新功能 |
| `/sdd-full` | 完整 Clarify(A-H, 含 POC + 红蓝对抗) → 约束提取 → SPEC → PLAN → TEST → IMPL → 独立 REVIEW → VERIFY | 跨系统功能、安全敏感功能 |

**三档差异**：
- `/sdd-standard` 自动运行 **Completer** 阶段（端到端用户旅程检查），比 `/tdd-quick` 多一层需求完整性保障
- `/sdd-full` 独有：Decomposer 构建需求树、Critique(structured) 做 SMART 验证、Explorer 生成 POC、最终需求汇总

**各档质量门**：
- 所有管道：VERIFY 8 步全量通过（BUILD → TYPE → LINT → TEST → SECURITY → DIFF → CONSTRAINT-MAP → CONSTRAINT-BEHAVIOR）
- `/sdd-full`：Phase D 后自动质量门（报告内容检测）+ Phase E/G 硬性质量门
- `/sdd-standard`：Completer/Security 硬性质量门

### 独立命令（可组合使用）

每个命令可独立运行，也可作为管道中间步骤手动调用：

| 命令 | 用途 | 说明 |
|------|------|------|
| `/ai-dev-create:clarify "需求"` | 独立需求澄清 | 运行完整 Clarify 流程（批判→发散→分解→结构化质疑→收敛） |
| `/ai-dev-create:clarify "需求" --phase diverge` | 仅分散发散 | 运行 Phase 1A-1D |
| `/ai-dev-create:clarify "需求" --phase converge` | 仅收敛 | 运行 Phase 2A-2C |
| `/ai-dev-create:clarify --resume session_id` | 恢复澄清 | 恢复中断的 Clarify 会话 |
| `/cmd-extract` | 提取约束树 | 从已有 Clarify 报告生成 `constraint-tree.yaml` |
| `/ai-dev-create:spec` | 生成规范 | 将收敛摘要转换为结构化功能规范 |
| `/ai-dev-create:plan` | 生成计划 | 根据规范制定文件级实现计划 |
| `/ai-dev-create:test` | 编写测试 | TDD 驱动，基于计划 + 约束树生成测试用例 |
| `/ai-dev-create:impl` | 实现代码 | 按计划编写生产代码，自动追踪进度 |
| `/ai-dev-create:impl --tdd` | TDD 实现 | 先调用 tester 写测试 (RED)，再实现代码 (GREEN) |
| `/ai-dev-create:impl --resume` | 恢复实现 | 从上次中断处继续 |
| `/ai-dev-create:review` | 代码审查 | 独立交叉审查（7 维度，双 Pass 全部执行） |
| `/ai-dev-create:review --full` | 深度审查 | + 架构优雅性、设计模式、扩展性 |
| `/ai-dev-create:review --security` | 安全审查 | + OWASP Top 10 + 四向量攻击面 + 数据流追溯 |
| `/ai-dev-create:verify` | 验证循环 | BUILD → TYPE → LINT → TEST → SECURITY → DIFF → CONSTRAINT-MAP → CONSTRAINT-BEHAVIOR |
| `/ai-dev-create:verify --quick` | 快速验证 | 跳过测试步骤 |
| `/ai-dev-create:verify --fix` | 自动修复 | 自动修复可修复的问题 |
| `/ai-dev-create:status` | 查看进度 | 显示当前管道阶段、进度和下一步 |
| `/ai-dev-create:status --reset` | 完全重置 | 重置所有生成文档 + 会话状态 |
| `/ai-dev-create:status --reset:docs` | 重置文档 | 仅删除生成的文档 |
| `/ai-dev-create:status --reset:session` | 重置会话 | 仅删除会话状态 |

### 常用组合场景

```bash
# 1. 先澄清需求，再决定开发
/ai-dev-create:clarify "实现 JWT 认证中间件"
→ 产出 01-07 系列报告后，可再跑 /cmd-extract → /ai-dev-create:spec → ...

# 2. 只跑验证循环
/ai-dev-create:verify                    # 完整 8 步验证

# 3. TDD 快速修复
/tdd-quick "修复分页 off-by-one 错误"

# 4. 独立代码审查
/ai-dev-create:review --full

# 5. 中途恢复
/ai-dev-create:impl --resume             # 继续上次中断的实现
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
  ├── SPEC (规范) → spec.md       【用户确认点】
  ├── PLAN (计划) → plan.md       【用户确认点】
  ├── TEST (RED)  → 测试用例
  ├── IMPL (GREEN) → 生产代码 + 3 维自检（质量/安全/约束覆盖）
  ├── REVIEW (独立审查) → review.md   [reviewer Agent, 7 维度, 双 Pass 全部执行]
  ├── VERIFY  → BUILD → TYPE → LINT → TEST → SECURITY → DIFF → CONSTRAINT-MAP → CONSTRAINT-BEHAVIOR
  │                           ║
  │                     【覆盖率门控：Lines>=80%, Branches>=75%, Functions>=80%】
  │                     【约束行为门控：每个约束对应测试必须 PASS】
  │                          ║
  └── ✅ 完成
       └── 自动追加 Lessons Learned 到 .claude/adc-result/experience/lessons.md
```

### 质量门体系

| 质量门 | 位置 | 检查项 | 失败处理 |
|--------|------|--------|----------|
| **Phase D 质量门** | 分散发散完成后 | ≥3 具体问题、≥3 What-If 场景、依赖图非空、交叉一致性 | 对应 Agent 重做 1 次 |
| **Completer 门** | E 阶段后 | 端到端用户旅程 ≥80%、Must 级依赖链无断点、完整性 ≥ 6/10 | Completer 重做 1 次 |
| **Security 门** | G 阶段后 | P0 漏洞已有缓解方案、安全评分 ≥ 5/10 | Security Teamer 重做 1 次 |
| **TDD 门控** | TEST-IMPL 循环 | 第 2 轮后测试全部 GREEN（非阻塞缺陷除外） | REVIEW 判断 |
| **VERIFY 门控** | 最终环节 | 8 步全部通过 + 覆盖率达标 + 约束行为验证 | 回退至故障阶段 |

### 三档入口阶段对照

| 阶段 | /tdd-quick | /sdd-standard | /sdd-full |
|------|:----------:|:-------------:|:---------:|
| A. Critique (raw) | ✅ quick + 清单 | ✅ | ✅ full |
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
| **独立 REVIEW** | ❌ | ✅ (双 Pass, 7 维) | ✅ (双 Pass, 7 维) |
| VERIFY | ✅ + AST 验证 | ✅ + AST 验证 | ✅ + AST + 行为验证 |

> ⚡ `/sdd-standard` 的 Security Teamer 使用轻量模式——只检查 OWASP Top 5（SQL 注入、XSS、认证绕过、越权、硬编码凭据）。

### 失败恢复与重试管理

- **重试上限**：同一失败类型最多自动重试 **3 次**（不同阶段有独立上限，见 `scripts/session-save.js`）。超过后生成诊断文件并通过 AskUserQuestion 请求用户决策。
- **失败回退**：根据失败现象自动回退至对应阶段——覆盖率不足 → TEST、需求理解偏差 → Critique、REVIEW 发现 CRITICAL → IMPL。完整 13 条见 `agents/orchestrator.md` 失败恢复表。
- **会话自动恢复**：启动时自动检测阶段并恢复（支持 CLARIFY/SPEC/PLAN/TEST/IMPL/REVIEW/VERIFY 全阶段）。

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

### 收敛摘要（Context Compression）

Clarify 阶段产生的 01-07 中间报告在 SPEC/PLAN 阶段**不直接读取**。Orchestrator 自动生成分层摘要：

| 摘要 | 触发时机 | 输出路径 | 行数上限 |
|------|----------|----------|----------|
| `divergent-summary.md` | Phase 1D 完成后 | `summaries/` 目录 | ≤ 500 行 |
| `convergent-summary.md` | Phase 2G 完成后 | `summaries/` 目录 | ≤ 800 行 |

**convergent-summary 必含内容**：功能需求清单、非功能需求（附量化指标）、安全需求（P0/P1 漏洞及防御方案）、已验证/否决技术方案（含理由）、全部架构决策（含被拒替代方案）、约束汇总（附约束 ID）、风险清单。**完整性优先行数限制**——宁可超限也不遗漏约束。

SPEC/PLAN 只读取摘要文件，Constraint Extractor 读取原始报告，确保上下文可控且完整。

### AskUserQuestion 协调

所有子 Agent 调用 AskUserQuestion 遵循统一协调规则：去重（上游已确认的不重复问）、降级（用户跳过则自主判断）、聚合（Orchestrator 合并问题为一问）、优先级门控（安全类 CRITICAL 可直接提问，其他由 Orchestrator 统一处理）。

### Reviewer 双 Pass 执行

独立审查分为两层，**均会执行**（不因 Pass 1 阻断而停止 Pass 2）：

- **Pass 1（阻断性）**：功能正确性、安全性、约束覆盖 — 发现 CRITICAL/HIGH 标记为 BLOCKING
- **Pass 2（优化性）**：代码质量、性能、架构合理性、优雅性

一次性收集完整审查结果，修复后无需重新审查架构/性能维度，仅需复查变更部分。

### 渐进式项目上下文更新

IMPL 阶段完成后，若项目类型为 NEW_PROJECT，自动重新运行 `detect-project-context.js`，检测类型是否变为 NEW_PROJECT_EVOLVED，并自动更新风格基准文件。后续 feature 开发自动继承此风格。

## Agent 总览

| Agent | Model | 阶段 | 职责 |
|-------|-------|------|------|
| **orchestrator** | opus | 全管道 | 主编排、管道定义源、摘要生成、失败恢复调度 |
| **critique** | opus | A / D | 需求批判（raw 12 项清单 / structured SMART+ROI）|
| **diverger** | sonnet | B | MECE 分解、类比启发、What-If、反向思考 |
| **decomposer** | sonnet | C | 构建需求树、MoSCoW 优先级、YAML 依赖图 |
| **completer** | opus | E | 端到端用户旅程检查，MISS-xxx 补全需求 |
| **explorer** | sonnet | F | POC 生成→Bash 执行、multi-profile 技术验证 |
| **security-teamer** | opus | G | 红蓝对抗：攻击向量、量化优先级（P0-P3）|
| **constraint-extractor** | sonnet | 桥梁 | 约束树提取、YAML diff 增量更新 |
| **planner** | sonnet | SPEC/PLAN | 功能规范 + 文件级实现计划 |
| **tester** | sonnet | TEST | 测试生成（约束树驱动）、覆盖率门控 |
| **implementer** | sonnet | IMPL | 代码实现 + 3 维自检、lessons 参考 |
| **reviewer** | opus | REVIEW | 独立双 Pass 审查、expectation vs reality 方法 |

> `opus` 用于需深度推理的任务（批判、安全性审查、完整性检查、编排、独立审查）；`sonnet` 用于平衡代码生成和速度的任务。

## 模板体系

插件提供 21 个模板文件，供各阶段 Agent 参考输出格式：

| 模板 | 使用场景 |
|------|----------|
| `templates/constraint-tree-template.yaml` | 约束树 YAML 格式 |
| `templates/decomposer-output-template.md` | Decomposer 输出格式 |
| `templates/diverger-output-template.md` | Diverger 输出格式 |
| `templates/clarification-template.md` | 澄清文档格式 |
| `templates/final-requirements-template.md` | 最终需求汇总格式 |
| `templates/security-standards.md` | 安全审查参考 |
| `templates/spec-template.md` | SPEC 输出格式 |
| `templates/plan-template.md` | PLAN 输出格式 |
| `templates/test-template.md` | TEST 输出格式 |
| `templates/review-output-template.md` | REVIEW 报告格式 |
| `templates/verify-report-template.md` | VERIFY 报告格式 |
| `templates/edge-case-checklist.md` | TEST 边界情况参考 |
| `templates/inline-constraints-template.md` | /tdd-quick 内联约束格式 |
| `templates/todo-template.md` | 会话任务清单格式 |
| `templates/lessons-template.md` | 经验教训格式 |
| `templates/poc-{js,py,java,go,rust}.md` | POC 代码模板 |
| `templates/poc-profiles.yaml` | POC Profile 配置 |

## 产物输出

管道运行后会在项目 `.claude/adc-result/` 目录下生成结构化产物：

```
.claude/adc-result/
├── context/
│   └── project-context.md           （项目类型、语言、风格、架构自动探测）
├── experience/
│   └── lessons.md                   （跨会话经验教训，持续累积）
├── request/{request-name}/
│   ├── clarifications/
│   │   ├── 01-critique-raw.md
│   │   ├── 02-diverger-report.md
│   │   ├── 03-requirement-tree.md     （仅 /sdd-full）
│   │   ├── 04-critique-structured.md  （仅 /sdd-full）
│   │   ├── 05-completer-report.md
│   │   ├── 06-explorer-report.md      （仅 /sdd-full）
│   │   ├── 07-security-report.md
│   │   ├── 08-final-requirements.md   （仅 /sdd-full）
│   │   └── poc/                       （POC 代码，后被归档到 .poc-archive/）
│   ├── summaries/
│   │   ├── divergent-summary.md       （A-D 摘要）
│   │   └── convergent-summary.md      （E-G 摘要，SPEC/PLAN 读取）
│   ├── constraint-tree.yaml           （需求→代码映射，唯一来源）
│   ├── spec.md                        （功能规范）
│   ├── plan.md                        （实现计划）
│   └── review.md                      （独立审查报告）
└── session.json                       （当前会话进度，支持自动恢复）
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
