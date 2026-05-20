---
name: project-promo
description: 为项目自动生成美观的宣传视频，支持多种风格和时长，自动提取项目信息或接收用户提供的素材
argument-hint: <项目路径> [--style tech|saas|open-source|minimal|neon|corporate] [--duration 15|30|60] [--output filename]
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
```

## 交互流程

### Step 0: 环境检测（前置步骤）

在开始视频生成之前，自动检测运行环境：

**检测内容**：
- Node.js 版本（需要 18+）
- npm 可用性
- Remotion CLI 可用性（可选）

**检测方式**：
```bash
node --version       # 检测 Node.js（需要 >= 18）
npm --version        # 检测 npm
npx remotion --version  # 检测 Remotion（可选）
```

**处理逻辑**：
- 如果 Node.js 版本过低 → 提示用户升级，停止执行
- 如果 Remotion 未安装 → 在创建视频项目时自动安装

> 💡 **提示**：Remotion 无需预先全局安装。创建视频项目时会自动执行 `npx create-video@latest --blank {output-dir}` 安装所有依赖。

### Step 1: 收集项目信息

自动从项目中提取：
- **README.md** → 项目名称、描述、功能列表
- **package.json / pyproject.toml** → 技术栈、版本
- **图片资源** → logo、截图（搜索 public/、assets/、img/、screenshots/）

同时询问用户：
- 是否有额外的说明手册或文档？
- 是否有额外的图片/截图素材？
- 想要重点展示哪些功能？

### Step 2: 选择视频参数

使用 AskUserQuestion 让用户选择：

**风格选择**（9 种）：

| 风格 | 背景 | 动画节奏 | 配色 | 适用 |
|------|------|----------|------|------|
| Tech | 深色渐变 | 快速利落 | 蓝紫系（饱和度降低） | 技术产品 |
| SaaS | 明亮专业 | 平滑柔和 | 蓝绿系（单强调色） | 商业产品 |
| Open Source | GitHub深色 | 简洁 | 黑白+绿 | 开源项目 |
| Minimal | 温暖留白 | 优雅缓动 | 温暖单色调+粉彩 | 高端产品 |
| Neon | 纯黑+霓虹 | 快速闪烁 | 粉紫青（饱和度降低） | 游戏/潮流 |
| Corporate | 浅灰蓝 | 规整 | 蓝系 | 企业级 |
| Brutalist | 深黑+强红 | 快速利落 | 黑白+强红 | 数据/仪表盘 |
| Editorial | 温暖奶油 | 优雅 | 白+编辑红衬线 | 内容/知识库 |
| Ethereal | 深黑+毛玻璃 | 空灵缓动 | 冷蓝光+柔和发光 | AI/高端科技 |

**时长选择**：
- 15 秒 — 快速展示，适合社交媒体
- 30 秒 — 标准展示，适合落地页
- 60 秒 — 完整展示，适合产品介绍

### Step 3: 生成视频

调用 promo-director agent 执行：

1. 分析项目信息，生成视频脚本
2. 创建 Remotion 项目结构
3. 根据风格选择对应的样式模板
4. 根据时长生成 Sequence 时间线
5. 生成各场景组件代码

### Step 4: 渲染输出

- 创建 Remotion 项目目录
- 安装依赖
- 本地渲染为 MP4

## 视频结构

### 15 秒（快速）
```
0-3s:   Logo/品牌名入场
3-8s:   核心价值主张
8-13s:  1-2个核心功能
13-15s: CTA结尾
```

### 30 秒（标准）
```
0-4s:   Logo弹跳入场 + 名称
4-10s:  核心价值主张（滑入+淡入）
10-20s: 产品截图/演示（缩放+平移）
20-25s: 功能列表（依次入场）
25-30s: CTA + 结尾
```

### 60 秒（完整）
```
0-5s:   品牌开场动画
5-15s:  问题陈述（痛点）
15-35s: 解决方案演示
35-50s: 功能详解
50-60s: CTA + 联系方式
```

## 项目信息提取

自动扫描以下内容：

| 来源 | 提取内容 |
|------|----------|
| README.md | 项目名、描述、功能、链接 |
| package.json | 依赖、技术栈、版本号 |
| img/assets/screenshots/ | Logo、截图文件 |
| CLAUDE.md | 项目架构概览 |

用户提供补充：
- 说明手册内容
- 自定义图片素材
- 自定义文案（标题、功能描述、CTA文字）
- 配色偏好

## 示例

为当前仓库生成宣传视频：

```bash
/project-promo .
```

为远程项目生成：

```bash
/project-promo ./my-saas-app --style saas --duration 30
```

生成霓虹风格的15秒短视频：

```bash
/project-promo ./my-game --style neon --duration 15 --output teaser.mp4
```

## 注意事项

- 需要安装 Node.js 18+ 和 npm
- 生成过程会创建一个临时 Remotion 项目
- 默认渲染分辨率 1920x1080 @ 30fps
- 输出格式为 MP4 (H.264)
- 生成后可在 Remotion Studio 中预览和调整

## 常见问题

### Chrome Headless Shell 下载超时

首次渲染时需要下载 Chrome Headless Shell（约 150MB），可能因网络问题超时。

**解决方案**：
```bash
# 方案 1: 预先下载浏览器
npx remotion browser ensure

# 方案 2: 使用代理
export HTTPS_PROXY=http://your-proxy:port
npx remotion render ...

# 方案 3: 手动下载后放到缓存目录
# 下载地址: https://www.remotion.dev/chrome-headless-shell
# 放到: ~/.cache/remotion-browser/
```

### remotion.config.ts 配置 API

Remotion v4 配置 API 有变更，注意使用正确的方法：

```typescript
import { Config } from '@remotion/cli/config';

// ✅ 正确（v4.0.424+）
Config.overrideFps(30);

// ❌ 错误（已废弃）
Config.setDefaultFP(30);      // 不存在
Config.setDefaultFPS(30);     // 不存在
```

### 依赖安装慢

Remotion 依赖较多（约 180 个包），安装可能需要几分钟。

```bash
# 使用国内镜像加速
npm install --registry=https://registry.npmmirror.com
```