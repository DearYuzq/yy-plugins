# AI Dev Create v2.3 — 约束求解开发插件

专业级 Claude Code 开发插件，实现 **分散发散 → 收敛验证 → 约束提取 → TDD闭环 → 自我进化** 的约束求解管道。

## 核心理念

**函数支撑模块，模块支撑功能，功能支撑需求。**

原始需求经过分散发散和收敛验证后，被转换为结构化约束树（Requirement → Feature → Module → Function）。编码阶段每个函数必须满足对应约束，不满足则回退重新开始约束求解。

## 三档入口

根据需求复杂度选择入口：

| 入口 | 阶段 | 适用 | 管道 |
|------|------|------|------|
| `/tdd-quick` | Critique(quick)→TEST→IMPL→REVIEW→VERIFY | Bug修复、简单功能 | 最短路径 |
| `/sdd-standard` | Critique(raw)→Diverger→约束提取→SPEC→PLAN→TEST→IMPL→REVIEW→VERIFY | 中等复杂度新功能 | 标准路径 |
| `/sdd-full` | 全部分散+收敛+红蓝对抗+约束提取+SPEC→PLAN→TEST→IMPL→REVIEW→VERIFY | 跨系统、安全敏感 | 完整路径 |

```
复杂系统开发     新功能开发      Bug修复
/sdd-full  →    /sdd-standard →  /tdd-quick
   ↑                ↑                 ↑
   └── 分散发散 ────┘                 │
   └── 收敛验证 ────┘                 │
   └── 约束提取 ────  ──  ──  ──  ──  │
   └── 编码 ─ ─ ─  ──  ──  ──  ── ─ ─┘
   └── 验证 ─ ─ ─  ──  ──  ──  ── ─ ─┘
```

## 管道阶段详解

### 分散发散（需求探索）

| Agent | 职责 |
|-------|------|
| **Critique (raw)** | 需求即假设 + 需求非真理 — 质疑一切 |
| **Diverger** | MECE分解、类比启发、What-If 分析，补全盲区 |
| **Decomposer** *(full)* | 构建需求树、MoSCoW 优先级、依赖图 |
| **Critique (structured)** *(full)* | SMART 验证、正交过滤、剔除不合理需求 |

**用户确认点** → 进入收敛

### 收敛验证（需求精炼）

| Agent | 职责 |
|-------|------|
| **Completer** *(full)* | 端到端用户旅程检查，需求链补全 |
| **Explorer** *(full)* | POC 生成 → Bash 执行 → 不可行方案丢弃 |
| **Security Teamer** *(full)* | 安全攻击与防御设计，边界问题识别 |

**最终评审** → 进入约束提取

### 约束提取（亮点）

**Constraint Extractor** 将需求转换为结构化约束树：

```yaml
constraint_tree:
  requirements: [{id, description, constraints: [{id, type, description}]}]
  features: [{id, name, supports: [REQ-xxx],
              modules: [{id, name, path,
                functions: [{signature, constraint_ids: [C-001], tests: [...}]}]}]
```

- 每条约束映射到具体函数签名
- 测试用例直接来自约束树
- 需求追踪完全可追溯

### 编码 → 验证（TDD 闭环）

```
Constraint Tree → SPEC → PLAN → TEST (RED) → IMPL (GREEN) → REVIEW → VERIFY
                                                                        │
                                                      ┌─────────────────┘
                                                      ▼
                                              BUILD → TYPE → LINT →
                                              TEST → SECURITY → DIFF
                                                      │
                                              失败？ → 回退 Critique (raw)
```

## 独立命令

| 命令 | 用途 |
|------|------|
| `/cmd-extract` | 从已有需求生成约束树 |
| `/cmd-clarify` | 独立需求澄清 |
| `/cmd-plan` | 生成/更新实现计划 |
| `/cmd-impl` | 恢复/继续实现 |
| `/cmd-review` | 代码审查 |
| `/cmd-verify` | BUILD→TYPE→LINT→TEST→SECURITY→DIFF |
| `/cmd-status` | 查看管道状态 |

## 自我进化

- **Lessons Learned**：每次修复 Bug 后，将规律追加到 `tasks/lessons.md`
- **会话恢复**：每次启动自动加载 lessons.md，提取关键规则应用于本次会话
- **持续迭代**：经验积累直到错误率下降

## 安装

```bash
# 市场安装
claude plugin install ai-dev-create@yuzq-plugins

# 开发模式
git clone https://github.com/yuzq/ai-dev-create.git
cd ai-dev-create
claude --plugin-dir .
```

## Agent 总览

| Agent | 阶段 | 说明 |
|-------|------|------|
| orchestrator | 全管道 | 主编排，管道唯一定义源 |
| critique (raw) | 分散发散 | 需求即假设 + 需求非真理 |
| diverger | 分散发散 | MECE 分解，探索可能性空间 |
| decomposer | 分散发散 | 构建需求树 |
| critique (structured) | 分散发散 | SMART/正交过滤/ROI/YAGNI |
| completer | 收敛 | 端到端补全 |
| explorer | 收敛 | POC 验证 |
| security-teamer | 收敛 | 红蓝对抗（攻击+防御合一） |
| constraint-extractor | 桥梁 | 约束树提取 |
| planner | SPEC/PLAN | 规范与计划 |
| tester | TEST | 测试生成 |
| implementer | IMPL + REVIEW | 代码实现 + 自检 REVIEW |

## 架构变更 (v2.2 → v2.3)

- 新增 Constraint Extractor Agent 和 cmd-extract Skill
- 新增自我进化系统（tasks/lessons.md + session-start 自动加载）
- 统一管道定义到 orchestrator.md，消除多处重复定义（原 3 个入口各自定义管道，现在统一引用）
- 删除 12 个冗余 Skill 和 1 个重复 Agent。将 Python/TypeScript/Spring Boot 模式合并到 Implementer Agent
- 删除 simplifyClarify 配置选项（三档入口已覆盖复杂度分级需求）

## License

MIT
