---
name: clarify
description: 启动多阶段需求澄清会话，通过发散→收敛流程确保需求完整性和可行性。
---

# /ai-dev-create:clarify - 多阶段需求澄清

启动一个完整的多阶段澄清会话，确保需求在编码前得到充分探索和验证。

## 核心理念

**发散→收敛**：先探索各种可能性，再收敛到高质量需求。

**核心假设**：用户可能说不清、说不全、隐瞒、撒谎。系统需要主动发现问题并引导澄清。

---

## 使用方式

```bash
/ai-dev-create:clarify "功能描述"                      # 完整澄清流程
/ai-dev-create:clarify "功能描述" --phase diverge      # 仅执行发散阶段
/ai-dev-create:clarify "功能描述" --phase converge     # 仅执行收敛阶段
/ai-dev-create:clarify --resume session_id            # 恢复中断的会话
/ai-dev-create:clarify --from .claude/clarifications/xxx.md   # 从已有文档继续
```

## 参数说明

| 参数 | 说明 |
|------|------|
| `"功能描述"` | 要澄清的需求描述 |
| `--phase` | 执行特定阶段：`all`(默认)、`diverge`、`converge` |
| `--resume` | 恢复之前中断的澄清会话 |
| `--from` | 从现有文档继续澄清 |

---

## 完整流程

### 流程图

```
┌─────────────────────────────────────────────────────────────────────┐
│ 发散阶段 (Divergent Phase)                                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  用户输入                                                            │
│      │                                                              │
│      ▼                                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │ Preprocessor │ │   Diverger  │ │ Decomposer  │ │  Challenger │   │
│  │  预处理专家   │ │   畅想专家   │ │   拆解专家   │ │   挑刺专家   │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │
│      │                 │                │                │         │
│      ▼                 ▼                ▼                ▼         │
│  预处理报告        发散报告          需求树           挑战报告       │
│                                                                     │
│                                              【用户确认点】          │
│                                                     │               │
└─────────────────────────────────────────────────────┼───────────────┘
                                                      │
                              用户确认通过 ────────────┤
                                                      │
┌─────────────────────────────────────────────────────┼───────────────┐
│ 收敛阶段 (Convergent Phase)                         │               │
├─────────────────────────────────────────────────────┼───────────────┤
│                                                     │               │
│                          ┌─────────────┐           │               │
│                          │  Completer  │◀──────────┘               │
│                          │   补全专家   │                           │
│                          └─────────────┘                           │
│                                 │                                   │
│                                 ▼                                   │
│                          ┌─────────────┐                           │
│                          │  Explorer   │                           │
│                          │   探测专家   │                           │
│                          └─────────────┘                           │
│                                 │                                   │
│                                 ▼                                   │
│                     ┌─────────────────────┐                        │
│                     │    红蓝对抗           │                        │
│                     ├─────────────────────┤                        │
│                     │ ┌─────────┐ ┌────────┐│                      │
│                     │ │Red-Team │ │Blue-Team││                      │
│                     │ │ 红方攻击 │ │ 蓝方防御 ││                      │
│                     │ └─────────┘ └────────┘│                      │
│                     └─────────────────────┘                        │
│                                 │                                   │
│                                 ▼                                   │
│                          【最终评审】                                │
│                                 │                                   │
└─────────────────────────────────┼───────────────────────────────────┘
                                  │
                                  ▼
                          最终需求文档
```

---

## 发散阶段详解

### Phase 1: Preprocessor（预处理）

**职责**：质疑用户输入，假设用户可能说不清、说不全、隐瞒、撒谎

**核心任务**：
1. 完整性检查（功能/用户/场景/数据/约束）
2. 一致性检查（逻辑/时序/资源/价值矛盾）
3. 可行性质疑（技术/业务/法律）
4. 生成澄清问题

**输出**：预处理报告 + 可信度评分

**通过条件**：可信度评分 ≥ 6

---

### Phase 2: Diverger（畅想）

**职责**：探索需求的可能性空间，补全用户盲区

**核心任务**：
1. MECE 分解（功能/用户/场景/时间维度）
2. 类比启发（搜索类似产品）
3. What-If 分析
4. 反向思考

**输出**：发散报告 + 需求可能性空间

**通过条件**：发散评分 ≥ 6

---

### Phase 3: Decomposer（拆解）

**职责**：构建结构化需求树，明确依赖关系

**核心任务**：
1. 需求分类（功能/非功能/约束）
2. 建立依赖关系（requires/conflicts/enhances）
3. MoSCoW 优先级排序
4. 识别冲突需求

**输出**：需求树 + 依赖图 + 冲突列表

**通过条件**：需求树结构清晰

---

### Phase 4: Challenger（挑刺）

**职责**：质疑和反对需求，正交过滤

**核心任务**：
1. SMART 验证
2. 正交过滤（冗余/重叠检测）
3. ROI 分析（价值/成本）
4. 方法论判定（SOLID/DRY/KISS/YAGNI）

**输出**：挑战报告 + 过滤后需求

**通过条件**：无 CRITICAL 问题

---

### 【用户确认点】

在发散阶段完成后，系统会暂停并请求用户确认：

```markdown
## 发散阶段完成

### 摘要
- 原始需求：{count} 个
- 发散后需求：{count} 个
- 过滤后需求：{count} 个
- 删除需求：{count} 个

### 待决策冲突
| 冲突ID | 描述 | 需求A | 需求B |
|--------|------|-------|-------|
| C-001 | {描述} | FR-002 | FR-003 |

### 是否进入收敛阶段？

选项：
A) 确认，进入收敛阶段
B) 需要修改发散结果
C) 查看详细报告
```

---

## 收敛阶段详解

### Phase 5: Completer（补全）

**职责**：端到端完整性检查，补全缺失需求

**核心任务**：
1. 用户旅程识别
2. 端到端追踪
3. 依赖链检查
4. 缺失需求识别（数据/异常/权限/审计/校验）

**输出**：补全报告 + 补全后需求树

---

### Phase 6: Explorer（探测）

**职责**：技术验证，生成 POC 代码

**核心任务**：
1. 技术风险识别
2. POC 设计
3. 验证代码生成
4. POC 执行（自动执行）

**输出**：探测报告 + POC 代码 + 验证结果

**POC 执行**：使用 Bash 工具自动执行验证代码

---

### Phase 7: Red-Teamer（红方攻击）

**职责**：从攻击者视角发现安全漏洞

**核心任务**：
1. 攻击面分析
2. 攻击场景设计（边界/异常/安全/业务逻辑）
3. 模拟攻击执行
4. 漏洞等级评估

**输出**：攻击报告 + 漏洞列表 + 安全需求

---

### Phase 8: Blue-Teamer（蓝方防御）

**职责**：评估漏洞可防御性，设计解决方案

**核心任务**：
1. 攻击评估（可防御/可缓解/需权衡/不可行）
2. 解决方案设计
3. 成本效益分析
4. 最终安全评估

**输出**：防御报告 + 安全方案 + 修复后需求

---

### 【最终评审】

```markdown
## 收敛阶段完成

### 最终需求汇总
- 功能需求：{count} 个
- 非功能需求：{count} 个
- 安全需求：{count} 个
- 约束需求：{count} 个
- 总计：{count} 个

### 质量评分
| 维度 | 评分 |
|------|------|
| 完整性 | {score}/10 |
| 可行性 | {score}/10 |
| 安全性 | {score}/10 |

### 是否通过最终评审？

选项：
A) 通过，生成最终需求文档
B) 需要修改
C) 查看详细报告
```

---

## 输出产物

### 目录结构

```
.claude/clarifications/{feature}-{session_id}/
├── 01-preprocessor-report.md      # 预处理报告
├── 02-diverger-report.md          # 发散报告
├── 03-requirement-tree.md         # 需求树
├── 04-challenger-report.md        # 挑战报告
├── 05-completer-report.md         # 补全报告
├── 06-explorer-report.md          # 探测报告
├── 07-red-team-report.md          # 红方攻击报告
├── 08-blue-team-report.md         # 蓝方防御报告
├── 09-final-requirements.md       # 最终需求文档
├── poc/                           # POC 代码目录
│   ├── poc-001.js
│   └── poc-002.js
└── session.json                   # 会话状态
```

### 最终需求文档格式

```markdown
# 最终需求文档：{功能名称}

> Session ID: {session_id}
> 创建时间：{timestamp}
> 状态：CLARIFIED

---

## 执行摘要

本需求经过完整的多阶段澄清流程：
1. 预处理：可信度评分 {score}/10
2. 发散：发现 {count} 个潜在需求点
3. 拆解：构建 {count} 个需求节点
4. 挑战：剔除 {count} 个不合理需求
5. 补全：新增 {count} 个缺失需求
6. 探测：验证 {count} 个技术风险
7. 红蓝对抗：解决 {count} 个安全问题

---

## 需求树 (最终版本)

```tree
ROOT: {功能名称}
├── [MUST] FR-001: {需求描述}
├── [MUST] FR-002: {需求描述}
├── [SHOULD] FR-003: {需求描述}
├── [MUST] NFR-001: {非功能需求}
└── [MUST] SEC-001: {安全需求}
```

---

## 需求详情

### 功能需求

| ID | 描述 | 优先级 | 依赖 | 验收标准 |
|----|------|--------|------|----------|
| FR-001 | {描述} | Must | - | {AC} |

### 非功能需求

| ID | 类型 | 描述 | 指标 |
|----|------|------|------|
| NFR-001 | 性能 | 响应时间 | < 200ms |

### 安全需求

| ID | 描述 | 针对风险 |
|----|------|----------|
| SEC-001 | 参数化查询 | SQL注入 |

---

## 约束树

```tree
CONSTRAINTS
├── 技术约束
│   ├── 框架版本: {version}
│   └── 浏览器支持: {browsers}
├── 资源约束
│   ├── 开发人力: {hours}人时
│   └── 上线时间: {date}
└── 业务约束
    ├── 合规要求: {requirements}
    └── 用户群体: {users}
```

---

## 决策记录

| 决策ID | 决策内容 | 原因 | 影响需求 |
|--------|----------|------|----------|
| D-001 | 选择方案A而非B | 成本更低 | FR-003 |

---

## 下一步

运行 `/spec` 基于此文档创建功能规范。
```

---

## 阶段转换条件

| 阶段 | 进入条件 | 退出条件 |
|------|----------|----------|
| Preprocessor | 接收用户输入 | 可信度评分 ≥ 6 |
| Diverger | 预处理完成 | 发散评分 ≥ 6 |
| Decomposer | 发散完成 | 需求树已构建 |
| Challenger | 需求树已构建 | 无 CRITICAL 问题 |
| 用户确认 | 发散阶段完成 | 用户确认通过 |
| Completer | 用户确认通过 | 需求链完整 |
| Explorer | 补全完成 | 技术风险已验证 |
| Red-Teamer | 探测完成 | 漏洞已识别 |
| Blue-Teamer | 红方完成 | 方案已设计 |
| 最终评审 | 蓝方完成 | 评审通过 |

---

## 失败恢复

| 失败类型 | 恢复策略 |
|----------|----------|
| 预处理可信度过低 | 解决阻塞性问题后重新预处理 |
| 发散评分过低 | 增加参考产品，重新发散 |
| 用户拒绝确认 | 返回修改发散结果 |
| POC 验证失败 | 修改需求或新增需求 |
| 存在 CRITICAL 漏洞 | 修复后继续 |
| 最终评审不通过 | 返回对应阶段修改 |

---

## 示例会话

```
> /ai-dev-create:clarify "用户登录功能"

## Phase 1: Preprocessor

可信度评分: 6/10

发现问题:
- 阻塞性: 未说明认证方式
- 重要性: 未明确密码复杂度要求

## 问题 1/2

**您希望使用哪种认证方式？**

A) 用户名+密码
B) 手机号+验证码
C) 第三方登录
D) 以上都要

您的选择: D

---

## Phase 2: Diverger

发散分析中...

发现潜在需求:
- 密码重置
- 账号绑定
- 多端登录管理

---

## Phase 3: Decomposer

构建需求树...

需求节点: 15个
依赖关系: 8条

---

## Phase 4: Challenger

质疑分析中...

建议删除: FR-009 (过度设计)
建议修改: FR-007 (技术不可行)

---

## 【用户确认点】

发散阶段完成。

需求总数: 13个

是否进入收敛阶段？[Y/n]: Y

---

## Phase 5: Completer

补全分析中...

新增需求: 5个
- 密码重试次数限制
- 认证失败锁定机制
- 登录日志记录
...

---

## Phase 6: Explorer

技术探测中...

POC-001: 性能验证 ✓ 通过 (180ms)
POC-002: 并发验证 ✗ 失败 -> 新增需求 FR-018

---

## Phase 7: Red-Teamer (红方攻击)

攻击分析中...

发现漏洞:
- CRITICAL: SQL注入风险
- HIGH: 水平越权风险
- MEDIUM: 重放攻击风险

---

## Phase 8: Blue-Teamer (蓝方防御)

防御分析中...

解决方案:
- SEC-001: 参数化查询 (解决SQL注入)
- SEC-002: 数据归属检查 (解决越权)
- SEC-003: Token过期机制 (解决重放)

---

## 【最终评审】

收敛阶段完成。

最终需求: 18个
安全需求: 3个
总开发成本: 35人时

是否通过评审？[Y/n]: Y

---

## 澄清完成！

输出目录: .claude/clarifications/user-login-abc123/

最终需求文档: 09-final-requirements.md

下一步: /spec
```

---

## 与其他命令的关系

```
/ai-dev-create:clarify "功能描述"
    │
    │ 最终需求文档
    ▼
/spec "功能描述" ← 使用最终需求文档
    │
    │ 功能规范
    ▼
/plan
    │
    │ 实现计划
    ▼
/impl --tdd
    │
    │ 代码实现
    ▼
/verify --fix
    │
    │ 验证通过
    ▼
完成
```

---

## 注意事项

1. **发散阶段必须完整**：不建议跳过任何发散阶段
2. **用户确认是关键**：发散→收敛的确认点不可跳过
3. **POC 自动执行**：探测阶段的验证代码会自动执行
4. **红蓝顺序执行**：先红方攻击，后蓝方防御
5. **闭环机制**：遇到问题可返回早期阶段修改

---

## Agent 调用

本命令需要按顺序调用以下 Agent：

### 发散阶段 Agent

| 序号 | Agent | 调用时机 | 输入 | 输出 |
|------|-------|----------|------|------|
| 1 | preprocessor | 接收用户需求 | 用户需求描述 | 预处理报告 + 可信度评分 |
| 2 | diverger | 预处理完成 | 预处理报告 | 发散报告 |
| 3 | decomposer | 发散完成 | 发散报告 | 需求树 |
| 4 | challenger | 需求树构建完成 | 需求树 | 挑战报告 |

### 用户确认点
使用 AskUserQuestion 工具请求用户确认

### 收敛阶段 Agent

| 序号 | Agent | 调用时机 | 输入 | 输出 |
|------|-------|----------|------|------|
| 5 | completer | 用户确认通过 | 确认后需求树 | 补全报告 |
| 6 | explorer | 补全完成 | 补全后需求 | 探测报告 + POC 结果 |
| 7 | red-teamer | 探测完成 | 验证后需求 | 攻击报告 + 漏洞列表 |
| 8 | blue-teamer | 红方完成 | 攻击报告 | 防御报告 + 安全需求 |

### 调用方式

#### Phase 1: preprocessor
```
Agent 工具参数：
- subagent_type: "preprocessor"
- description: "需求预处理"
- prompt: "对以下需求进行预处理，检查完整性、一致性、可行性：
  用户需求：{用户输入}
  输出预处理报告到：.claude/clarifications/{feature}/01-preprocessor-report.md"
```

#### Phase 2: diverger
```
Agent 工具参数：
- subagent_type: "diverger"
- description: "需求发散"
- prompt: "基于预处理报告进行发散分析：
  预处理报告：.claude/clarifications/{feature}/01-preprocessor-report.md
  输出发散报告到：.claude/clarifications/{feature}/02-diverger-report.md"
```

#### Phase 3: decomposer
```
Agent 工具参数：
- subagent_type: "decomposer"
- description: "需求拆解"
- prompt: "将发散结果拆解为需求树：
  发散报告：.claude/clarifications/{feature}/02-diverger-report.md
  输出需求树到：.claude/clarifications/{feature}/03-requirement-tree.md"
```

#### Phase 4: challenger
```
Agent 工具参数：
- subagent_type: "challenger"
- description: "需求挑战"
- prompt: "对需求树进行正交过滤和质疑：
  需求树：.claude/clarifications/{feature}/03-requirement-tree.md
  输出挑战报告到：.claude/clarifications/{feature}/04-challenger-report.md"
```

#### 用户确认点
```
AskUserQuestion 工具：
- questions: [{
    question: "发散阶段完成，是否进入收敛阶段？",
    options: [
      {label: "确认，进入收敛阶段"},
      {label: "需要修改发散结果"},
      {label: "查看详细报告"}
    ]
  }]
```

#### Phase 5: completer
```
Agent 工具参数：
- subagent_type: "completer"
- description: "需求补全"
- prompt: "补全需求的端到端完整性：
  需求树：.claude/clarifications/{feature}/03-requirement-tree.md
  用户决策：{用户决策记录}
  输出补全报告到：.claude/clarifications/{feature}/05-completer-report.md"
```

#### Phase 6: explorer
```
Agent 工具参数：
- subagent_type: "explorer"
- description: "技术探测"
- prompt: "进行技术可行性验证：
  补全后需求：.claude/clarifications/{feature}/05-completer-report.md
  生成 POC 代码到：.claude/clarifications/{feature}/poc/
  输出探测报告到：.claude/clarifications/{feature}/06-explorer-report.md"
```

#### Phase 7: red-teamer
```
Agent 工具参数：
- subagent_type: "red-teamer"
- description: "红方攻击"
- prompt: "从攻击者视角发现安全漏洞：
  验证后需求：.claude/clarifications/{feature}/06-explorer-report.md
  输出攻击报告到：.claude/clarifications/{feature}/07-red-team-report.md"
```

#### Phase 8: blue-teamer
```
Agent 工具参数：
- subagent_type: "blue-teamer"
- description: "蓝方防御"
- prompt: "评估漏洞可防御性并设计解决方案：
  攻击报告：.claude/clarifications/{feature}/07-red-team-report.md
  输出防御报告到：.claude/clarifications/{feature}/08-blue-team-report.md"
```

### 上下文传递

**每个 Agent 接收的上下文**：
- 上一阶段的输出文件路径
- 会话 ID
- 用户决策记录（如适用）

**每个 Agent 传递的上下文**：
- 当前阶段的输出文件路径
- 状态（通过/失败）
- 需要传递给下一阶段的关键数据

### 阶段转换条件

每个阶段完成后，检查退出条件：
- 可信度评分 ≥ 6 → 进入下一阶段
- 发散评分 ≥ 6 → 进入下一阶段
- 无 CRITICAL 问题 → 进入下一阶段
- 用户确认通过 → 进入收敛阶段