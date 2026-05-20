---
name: project-promo
description: 为项目自动生成美观的宣传视频，支持多种风格和时长，自动提取项目信息或接收用户提供的素材
argument-hint: <项目路径> [--style tech|saas|open-source|minimal|neon|corporate|brutalist|editorial|ethereal] [--duration 15|30|60] [--output filename]
allowed-tools: Read, Write, Edit, Bash, Glob, AskUserQuestion, Agent
---

# Project Promo Video - 项目宣传视频生成器

为你的项目自动生成美观、专业的宣传视频。

## 使用方式

```bash
/project-promo ./my-project                    # 交互式选择风格和时长
/project-promo ./my-project --style tech       # 科技风格
/project-promo ./my-project --duration 30      # 30秒视频
/project-promo ./my-project --style neon --duration 15  # 霓虹风格15秒
/project-promo ./my-project --style ethereal --duration 60 --output demo.mp4
```

## 交互流程

本 Skill 只负责用户交互和参数收集，所有执行逻辑由 promo-director Agent 完成。

### Step 1: 参数解析

解析用户输入的参数：
- `<项目路径>` — 项目目录（必选）
- `--style` — 视频风格（可选，未提供时进入交互选择）
- `--duration` — 视频时长（可选，默认 30 秒）
- `--output` — 输出文件名（可选）

### Step 2: 用户确认

如果参数未完整提供，使用 AskUserQuestion 补充选择：

**风格选择**（9 种）：

| 风格 | 背景 | 动画节奏 | 适用场景 |
|------|------|----------|----------|
| Tech | 深色渐变 | 快速利落 | 技术产品 |
| SaaS | 明亮专业 | 平滑柔和 | 商业产品 |
| Open Source | GitHub深色 | 简洁 | 开源项目 |
| Minimal | 温暖留白 | 优雅缓动 | 高端产品 |
| Neon | 纯黑+霓虹 | 快速闪烁 | 游戏/潮流 |
| Corporate | 浅灰蓝 | 规整 | 企业级 |
| Brutalist | 深黑+强红 | 快速利落 | 数据/仪表盘 |
| Editorial | 温暖奶油 | 优雅 | 内容/知识库 |
| Ethereal | 深黑+毛玻璃 | 空灵缓动 | AI/高端科技 |

**时长选择**：
- 15 秒 — 快速展示，适合社交媒体
- 30 秒 — 标准展示，适合落地页（默认）
- 60 秒 — 完整展示，适合产品介绍

### Step 3: 调用 Agent 执行

将收集到的参数传递给 promo-director Agent：
```typescript
{
  projectPath: string,
  style: string,
  duration: number,
  outputFilename: string
}
```

Agent 将自动完成：
1. 环境检测 → 项目信息收集 → 视频脚本生成
2. Remotion 项目创建 → 场景组件生成 → Composition 组装
3. 渲染输出为 MP4

> 所有执行细节详见 `agents/promo-director.md`

### Step 4: 返回结果

向用户展示：
1. 生成的 Remotion 项目路径
2. 渲染输出文件路径
3. Remotion Studio 预览命令（`npx remotion studio`）
4. 后续调整建议

## 注意事项

- 需要安装 Node.js 18+ 和 npm
- 生成过程会创建一个临时 Remotion 项目
- 默认渲染分辨率 1920x1080 @ 30fps
- 输出格式为 MP4 (H.264)，CRF=18 高质量
- 生成后可在 Remotion Studio 中预览和调整