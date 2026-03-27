# AI Dev Create

一个专业的 Claude Code 开发插件，专注于 SDD（规范驱动开发）和 TDD（测试驱动开发）流程，支持多 Agent 协作和三档流程选择。

## ✨ 核心特性

- **三档流程入口**：根据需求复杂度选择 `/tdd-quick`、`/sdd-standard` 或 `/sdd-full`
- **多阶段需求澄清**：发散→收敛流程，8 个专业 Agent 协作
- **SDD + TDD 集成流程**：CLARIFY → SPEC → PLAN → TEST → IMPL → REVIEW → VERIFY
- **编排者模式**：主 agent 协调子 agent 协作
- **按需加载**：根据文件类型动态加载技能
- **会话持久化**：自动保存/恢复会话状态和流程进度
- **失败恢复机制**：根据失败类型精确回退到对应阶段
- **安全红蓝对抗**：Red-Teamer / Blue-Teamer 双视角验证
- **MCP 集成**：GitHub + Context7 文档查找

## 🚀 快速开始

### 选择你的开发流程

```
                    ┌─────────────────────────────────────┐
                    │      你的需求是什么？               │
                    └─────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
            ┌───────────────┐               ┌───────────────┐
            │ 需求已非常明确 │               │ 需求需要澄清  │
            │ 简单功能/Bug修复│               │ 新功能开发    │
            └───────┬───────┘               └───────┬───────┘
                    │                               │
                    ▼                               ▼
            ┌───────────────┐               ┌───────────────┐
            │  /tdd-quick   │               │ 需求有多复杂？│
            │  快速TDD流程  │               └───────┬───────┘
            └───────────────┘                       │
                                          ┌────────┴────────┐
                                          │                 │
                                          ▼                 ▼
                                  ┌───────────────┐ ┌───────────────┐
                                  │ 中等复杂度    │ │ 高复杂度      │
                                  │ 单模块        │ │ 跨系统        │
                                  │ 标准功能      │ │ 安全敏感      │
                                  └───────┬───────┘ └───────┬───────┘
                                          │                 │
                                          ▼                 ▼
                                  ┌───────────────┐ ┌───────────────┐
                                  │ /sdd-standard │ │ /sdd-full     │
                                  │ 标准SDD流程   │ │ 完整CLARIFY   │
                                  └───────────────┘ └───────────────┘
```

### 流程对比

| 特性 | /tdd-quick | /sdd-standard | /sdd-full |
|------|------------|---------------|-----------|
| 需求澄清 | ❌ 跳过 | ✅ 简单澄清 | ✅ 完整发散-收敛 |
| 规范文档 | 可选 | ✅ 必须 | ✅ 必须 |
| 实现计划 | ❌ 跳过 | ✅ 必须 | ✅ 必须 |
| 安全验证 | ❌ 跳过 | ⚠️ 基础 | ✅ 红蓝对抗 |
| 适用场景 | Bug修复、简单功能 | 新功能开发 | 复杂系统、安全敏感 |
| 预计耗时 | 30分钟-2小时 | 2-8小时 | 1-3天 |

---

## 📦 安装

### 方式 1: 从市场安装

```bash
claude plugin install ai-dev-create@yuzq-plugins
```

### 方式 2: 开发模式（推荐开发调试）

```bash
# 克隆仓库
git clone https://github.com/yuzq/ai-dev-create.git
cd ai-dev-create

# 开发模式启动
claude --plugin-dir .
```

### 方式 3: 用户级安装

```bash
cd ai-dev-create
claude plugin install . --scope user
```

### 验证安装

```bash
# 重启 Claude Code 后运行
/quick-start  # 查看快速开始指南
/status       # 查看当前状态
```

---

## 🎯 流程入口详解

### `/tdd-quick` - 快速 TDD 流程

适用于：Bug 修复、简单功能、代码重构

```bash
/tdd-quick 修复 UserService 中邮箱验证的 bug
/tdd-quick 添加 User 实体的 fullName 计算属性
/tdd-quick 重构 OrderService 的支付逻辑为策略模式
```

**执行流程**：
```
理解需求 → 编写测试(RED) → 实现代码(GREEN) → 验证通过
```

---

### `/sdd-standard` - 标准 SDD 流程

适用于：新功能开发、中等复杂度功能

```bash
/sdd-standard 实现用户认证模块，支持注册、登录和 JWT token 管理
/sdd-standard 创建订单管理 API，支持 CRUD 操作和状态流转
```

**执行流程**：
```
简单澄清 → SPEC → PLAN → TEST → IMPL → REVIEW → VERIFY
```

---

### `/sdd-full` - 完整开发流程

适用于：复杂系统、安全敏感功能、跨系统集成

```bash
/sdd-full 开发支付系统，支持微信支付、支付宝支付、退款和对账功能
/sdd-full 实现用户权限管理系统，支持 RBAC、数据权限、审计日志
```

**执行流程**：
```
CLARIFY 阶段
├── 发散阶段
│   ├── Preprocessor (预处理-质疑用户输入)
│   ├── Diverger (发散-探索可能性空间)
│   ├── Decomposer (拆解-构建需求树)
│   └── Challenger (挑战-正交过滤)
│
├── 【用户确认点】
│
└── 收敛阶段
    ├── Completer (补全-端到端完整性)
    ├── Explorer (探测-POC验证)
    ├── Red-Teamer (红方-安全攻击)
    └── Blue-Teamer (蓝方-防御方案)

【最终评审】

SPEC → PLAN → TEST → IMPL → REVIEW → VERIFY
```

---

### `/clarify-simplified` - 简化澄清流程

适用于：需求相对清晰但需要验证的场景

```bash
/clarify-simplified 实现用户登录功能，使用 JWT，支持记住我选项
```

**与完整 CLARIFY 的区别**：

| 环节 | 完整流程 | 简化流程 |
|------|----------|----------|
| Preprocessor | ✅ | ✅ |
| Diverger | ✅ | ✅ |
| Decomposer | ✅ | ❌ |
| Challenger | ✅ | ❌ |
| 用户确认点 | ✅ | ⚠️ 可选 |
| Completer | ✅ | ❌ |
| Explorer | ✅ | ⚠️ 可选 |
| Red-Teamer | ✅ | ❌ |
| Blue-Teamer | ✅ | ❌ |

---

## 📖 单独命令详解

### `/clarify` - 多阶段需求澄清

启动完整的发散→收敛流程。

```bash
/clarify "功能描述"              # 完整澄清流程
/clarify "功能描述" --phase diverge  # 仅执行发散阶段
/clarify "功能描述" --phase converge  # 仅执行收敛阶段
/clarify --resume session_id     # 恢复中断的会话
```

**调用的 Agent（按顺序）**：

| 阶段 | Agent | 职责 | 模型 |
|------|-------|------|------|
| 发散 | preprocessor | 预处理，质疑用户输入 | haiku |
| 发散 | diverger | 畅想，探索可能性空间 | opus |
| 发散 | decomposer | 拆解，构建需求树 | sonnet |
| 发散 | challenger | 挑刺，正交过滤 | opus |
| 收敛 | completer | 补全，端到端完整性 | sonnet |
| 收敛 | explorer | 探测，技术验证 POC | sonnet |
| 收敛 | red-teamer | 红方攻击，发现漏洞 | opus |
| 收敛 | blue-teamer | 蓝方防御，设计方案 | opus |

---

### `/spec` - 创建功能规范

```bash
/spec "功能描述"
/spec "添加用户认证功能"
/spec --template user-story
/spec --skip-clarify  # 跳过澄清阶段
```

**调用的 Agent**：
- `clarifier`（条件触发）：当清晰度 < 0.7 时自动调用
- `planner`：生成规范文档

**输出**：`.claude/specs/{feature}.md`

---

### `/plan` - 生成实现计划

```bash
/plan                    # 基于当前规范生成计划
/plan "功能描述"         # 直接规划功能
/plan --spec .claude/specs/xxx.md  # 基于指定规范
```

**调用的 Agent**：
- `planner`：分析规范，生成实现计划

**输出**：`.claude/plans/{feature}.md`

---

### `/impl` - 执行实现

```bash
/impl                    # 标准模式
/impl --tdd              # TDD 模式（推荐）
/impl --file path/to/file  # 实现指定文件
/impl --resume           # 从上次中断处恢复
```

**调用的 Agent**：
- `tester`（TDD 模式）：先编写测试
- `implementer`：编写生产代码

---

### `/review` - 代码审查

```bash
/review                  # 审查最近的变更
/review path/to/file     # 审查指定文件
/review --full           # 完整项目审查
/review --security       # 安全审查焦点
```

**调用的 Agent**：
- `reviewer`：执行代码审查

---

### `/verify` - 验证循环

```bash
/verify                  # 完整验证
/verify --quick          # 快速验证（跳过测试）
/verify --fix            # 自动修复可修复的问题
```

**验证流程**：
```
BUILD → TYPE → LINT → TEST → SECURITY → DIFF
```

---

### `/status` - 查看流程状态

```bash
/status                  # 查看当前状态
/status --reset          # 重置状态
```

---

## 🔄 开发流程详解

### SDD 完整流程（复杂功能）

```
┌─────────────────────────────────────────────────────────────────────┐
│ CLARIFY 阶段（多阶段澄清）                                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ 用户输入                                                            │
│     │                                                               │
│     ▼                                                               │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│ │ Preprocessor │ │ Diverger    │ │ Decomposer  │ │ Challenger  │   │
│ │ 预处理专家   │ │ 畅想专家    │ │ 拆解专家    │ │ 挑刺专家    │   │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │
│                                                                     │
│ 【用户确认点】                                                       │
│                                                                     │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│ │ Completer   │ │ Explorer    │ │ Red-Teamer  │ │ Blue-Teamer │   │
│ │ 补全专家    │ │ 探测专家    │ │ 红方攻击    │ │ 蓝方防御    │   │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │
│                                                                     │
│ 【最终评审】                                                        │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│ SPEC → PLAN → TEST → IMPL → REVIEW → VERIFY                         │
└─────────────────────────────────────────────────────────────────────┘
```

### TDD 快速循环（简单功能）

```
RED → GREEN → REFACTOR

1. 编写失败的测试（RED）
2. 编写最小实现（GREEN）
3. 重构代码（REFACTOR）
```

### 失败恢复机制

| 失败类型 | 回退目标 | 重试限制 |
|----------|----------|----------|
| 需求理解偏差 | CLARIFY | 3 次 |
| 规范问题 | SPEC | 2 次 |
| 设计问题 | PLAN | 2 次 |
| 测试问题 | TEST | 3 次 |
| 实现问题 | IMPL | 5 次 |
| 审查问题 | REVIEW | 2 次 |

---

## 📁 项目结构

```
ai-dev-create/
├── .claude-plugin/
│   └── plugin.json          # 插件配置
├── agents/                   # 15 个专业 Agent
│   ├── orchestrator.md       # 主编排
│   ├── preprocessor.md       # 预处理
│   ├── diverger.md           # 发散
│   ├── decomposer.md         # 拆解
│   ├── challenger.md         # 挑战
│   ├── completer.md          # 补全
│   ├── explorer.md           # 探测
│   ├── red-teamer.md         # 红方攻击
│   ├── blue-teamer.md        # 蓝方防御
│   ├── planner.md            # 规划
│   ├── tester.md             # 测试
│   ├── implementer.md        # 实现
│   ├── reviewer.md           # 审查
│   ├── clarifier.md          # 澄清
│   └── decomposer.md         # 拆解
├── skills/                   # 20+ 技能
│   ├── tdd-quick/           # 快速 TDD 流程
│   ├── sdd-standard/        # 标准 SDD 流程
│   ├── sdd-full/            # 完整开发流程
│   ├── quick-start/         # 快速开始指南
│   ├── clarify-simplified/  # 简化澄清流程
│   ├── tdd-workflow/        # TDD 工作流
│   ├── sdd-workflow/        # SDD 工作流
│   ├── verification-loop/   # 验证循环
│   ├── python-patterns/     # Python 模式
│   ├── ts-patterns/         # TypeScript 模式
│   └── springboot-patterns/ # Spring Boot 模式
├── commands/                 # 单独命令
├── hooks/                    # 自动化钩子
├── templates/                # 模板文件
└── scripts/                  # 工具脚本
```

---

## 🛠️ 支持的技术栈

| 语言 | 框架 | 特性 |
|------|------|------|
| TypeScript/JavaScript | React, Node.js | 组件模式、Hooks、API 设计 |
| Python | FastAPI, Django | 服务层、Repository、Pydantic |
| Java | Spring Boot | REST API、JPA、缓存、异步 |

---

## 📊 版本历史

### v2.1.0
- 新增三档流程入口：`/tdd-quick`、`/sdd-standard`、`/sdd-full`
- 新增快速开始指南 `/quick-start`
- 新增简化澄清流程 `/clarify-simplified`
- 整合 commands 到 skills
- 修复 hooks.json 格式问题
- 补充所有 Agent 的完整配置

### v2.0.0
- 多阶段需求澄清（发散→收敛）
- 安全红蓝对抗验证
- 失败恢复机制

---

## 📄 许可证

MIT
