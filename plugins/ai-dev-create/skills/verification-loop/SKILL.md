---
name: verification-loop
description: 验证循环系统，确保代码质量和测试通过。在实现完成后自动激活进行全面验证。
version: 1.0.0
---

# Verification Loop

一个全面的验证系统，确保每次变更都满足质量标准。

## 激活时机

- 功能实现完成后
- 代码审查前
- PR 创建前
- 部署前验证

## 验证流程

```
┌─────────────────────────────────────────────────────┐
│                  验证流程                            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────┐                                       │
│  │ BUILD    │ 项目构建检查                          │
│  └────┬─────┘                                       │
│       │ Pass                                        │
│       ▼                                             │
│  ┌──────────┐                                       │
│  │ TYPE     │ 类型检查                              │
│  └────┬─────┘                                       │
│       │ Pass                                        │
│       ▼                                             │
│  ┌──────────┐                                       │
│  │ LINT     │ 代码风格检查                          │
│  └────┬─────┘                                       │
│       │ Pass                                        │
│       ▼                                             │
│  ┌──────────┐                                       │
│  │ TEST     │ 测试套件                              │
│  └────┬─────┘                                       │
│       │ Pass                                        │
│       ▼                                             │
│  ┌──────────┐                                       │
│  │ SECURITY │ 安全扫描                              │
│  └────┬─────┘                                       │
│       │ Pass                                        │
│       ▼                                             │
│  ┌──────────┐                                       │
│  │ DIFF     │ 变更审查                              │
│  └────┬─────┘                                       │
│       │                                             │
│       ▼                                             │
│    ✅ 通过                                          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Phase 1: BUILD 验证

### TypeScript/JavaScript

```bash
# 构建检查
npm run build

# 或
pnpm build
```

### Python

```bash
# 无需构建，检查依赖
pip install -r requirements.txt
```

### Java/Spring Boot

```bash
# Maven
mvn clean compile

# Gradle
./gradlew build -x test
```

**失败处理**：修复构建错误后继续

## Phase 2: TYPE 检查

### TypeScript

```bash
npx tsc --noEmit
```

### Python

```bash
pyright .
# 或
mypy src/
```

### Java

```bash
# 编译时自动检查
mvn compile
```

**失败处理**：修复类型错误

## Phase 3: LINT 检查

### TypeScript/JavaScript

```bash
# ESLint
npm run lint

# Biome
biome check .
```

### Python

```bash
# Ruff
ruff check .

# Black (格式)
black --check .
```

### Java

```bash
# Spotless
mvn spotless:check
```

**失败处理**：
- 格式问题：自动修复
- 逻辑问题：手动修复

## Phase 4: TEST 套件

### 运行测试

```bash
# TypeScript
npm test -- --coverage

# Python
pytest --cov=src tests/

# Java
mvn test
```

### 验证报告

```
测试报告
========
总测试数: 50
通过: 48
失败: 2
跳过: 0

覆盖率报告
==========
行覆盖率: 85%
分支覆盖率: 82%
函数覆盖率: 88%
```

**失败处理**：
- 分析失败原因
- 修复代码或测试
- 重新运行

## Phase 5: SECURITY 扫描

### 检查项

```bash
# 敏感信息检查
grep -rn "sk-" --include="*.ts" --include="*.js" . 2>/dev/null
grep -rn "api_key" --include="*.ts" --include="*.js" . 2>/dev/null
grep -rn "password" --include="*.ts" --include="*.js" . 2>/dev/null

# 调试代码检查
grep -rn "console.log" --include="*.ts" --include="*.tsx" src/ 2>/dev/null
grep -rn "debugger" --include="*.ts" --include="*.js" . 2>/dev/null
```

### 安全检查清单

- [ ] 无硬编码密钥
- [ ] 无敏感信息日志
- [ ] 无调试代码残留
- [ ] 无不安全的依赖

**失败处理**：
- CRITICAL：立即修复
- HIGH：本次迭代修复

## Phase 6: DIFF 审查

### 查看变更

```bash
# 变更统计
git diff --stat

# 变更文件
git diff --name-only

# 详细变更
git diff
```

### 审查要点

- [ ] 变更符合预期
- [ ] 无意外修改
- [ ] 文档同步更新
- [ ] 测试覆盖新代码

## 验证报告格式

```markdown
# 验证报告

## 概览
| 阶段 | 状态 | 详情 |
|------|------|------|
| Build | ✅ PASS | 无错误 |
| Type | ✅ PASS | 无类型错误 |
| Lint | ⚠️ WARN | 3 个警告 |
| Test | ✅ PASS | 50/50 通过，覆盖率 85% |
| Security | ✅ PASS | 无问题 |
| Diff | ✅ PASS | 5 个文件变更 |

## 详情

### Lint 警告
1. [文件:行] 未使用的变量
2. [文件:行] 缺少类型注解

### 测试覆盖率
- 行覆盖率: 85% (目标: 80%) ✅
- 分支覆盖率: 82% (目标: 80%) ✅
- 函数覆盖率: 88% (目标: 80%) ✅

### 变更文件
1. src/services/user.service.ts (+25, -5)
2. src/controllers/user.controller.ts (+15, -2)
3. tests/user.test.ts (+40, -0)

## 结论
✅ 验证通过，可以提交 PR

## 建议改进
1. 添加缺失的类型注解
2. 考虑提取重复代码
```

## 持续验证

### 定时检查

在长会话中，每 15 分钟或主要变更后运行验证：

```
/checkpoint → 运行验证循环
```

### 自动化 Hook

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{
        "type": "command",
        "command": "npm run lint -- --fix"
      }]
    }]
  }
}
```

## 快速命令

| 命令 | 说明 |
|------|------|
| `/verify` | 运行完整验证循环 |
| `/verify --quick` | 跳过测试，快速验证 |
| `/verify --fix` | 自动修复可修复的问题 |