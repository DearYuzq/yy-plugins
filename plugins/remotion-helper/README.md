# Remotion Helper

为项目自动生成美观的宣传视频。支持 9 种风格、3 种时长，自动提取项目信息或接收用户提供的素材。

## 功能

### `/project-promo` - 项目宣传视频生成器

一键为项目生成专业宣传视频。

```bash
/project-promo ./my-project                    # 交互式选择
/project-promo ./my-project --style tech       # 科技风格
/project-promo ./my-project --duration 30      # 30秒视频
/project-promo ./my-project --style ethereal --duration 60  # 空灵风格60秒
```

## 视频风格

| 风格 | 特点 | 适用 |
|------|------|------|
| **Tech** | 深色渐变、等宽字体、快速动画 | 技术产品、开发者工具 |
| **SaaS** | 明亮专业、圆角卡片、平滑动画 | 商业产品、订阅服务 |
| **Open Source** | GitHub 风格、简洁设计 | 开源项目、社区 |
| **Minimal** | 大量留白、优雅缓动 | 高端产品、设计 |
| **Neon** | 霓虹发光、粗体字 | 游戏、潮流产品 |
| **Corporate** | 浅灰蓝、商务字体 | 企业级、B2B |
| **Brutalist** | 深黑+强红、无圆角、CRT扫描线 | 数据密集、仪表盘 |
| **Editorial** | 温暖奶油、编辑衬线、极端比例 | 内容产品、知识库 |
| **Ethereal** | 深黑+毛玻璃、柔和发光、空灵缓动 | AI工具、高端科技 |

## 视频时长

- **15秒** - 快速展示，适合社交媒体
- **30秒** - 标准展示，适合落地页
- **60秒** - 完整展示，适合产品介绍

## 视频结构

**30秒标准结构**：
```
0-4s:   Logo 弹跳入场 + 名称
4-10s:  核心价值主张（滑入+淡入）
10-20s: 产品截图/演示（缩放+平移）
20-25s: 功能列表（依次入场）
25-30s: CTA + 结尾（脉冲效果）
```

## 项目信息提取

自动扫描：
- README.md → 名称、描述、功能
- package.json → 技术栈、版本
- 图片目录 → logo、截图

**使用分析脚本**（输出 JSON）：
```bash
bash plugins/remotion-helper/scripts/analyze-project.sh ./my-project
```

用户可补充：
- 说明手册/文档
- 自定义图片素材
- 自定义文案

## 使用示例

```bash
# 为基本用法（交互式）
/project-promo .

# 指定风格和时长
/project-promo ./my-saas --style saas --duration 30

# 生成霓虹风格短视频
/project-promo ./my-game --style neon --duration 15
```

## 安装

```bash
claude plugin install plugins/remotion-helper --scope user
claude plugin enable remotion-helper
```

## 环境要求

- **Node.js**: 18+ (推荐 v20+)
- **npm**: 随 Node.js 自带
- **Remotion**: 无需预先安装（创建项目时自动安装）
- **FFmpeg**: 可选（Remotion 提供内置 FFmpeg）

### 检测环境

脚本会自动检测运行环境：

```bash
# 从插件目录运行
bash plugins/remotion-helper/scripts/check-environment.sh

# 或使用 npx（推荐）
npx -y @remotion/cli --version
```

检测内容：
- Node.js 版本（需要 18+）
- npm 可用性
- Remotion CLI（可选）
- FFmpeg（可选）

## 目录结构

```
plugins/remotion-helper/
├── skills/
│   └── project-promo/
│       └── SKILL.md              # 主 Skill
├── agents/
│   ├── promo-director.md         # 主编排 Agent
│   ├── visual-designer.md        # 视觉设计 Agent
│   └── animation-choreographer.md # 动画编排 Agent
├── templates/
│   ├── styles/                   # 9 种风格配置
│   │   ├── tech.tsx
│   │   ├── saas.tsx
│   │   ├── open-source.tsx
│   │   ├── minimal.tsx
│   │   ├── neon.tsx
│   │   ├── corporate.tsx
│   │   ├── brutalist.tsx
│   │   ├── editorial.tsx
│   │   └── ethereal.tsx
│   ├── scenes/                   # 6 种场景模板
│   │   ├── logo-intro.tsx
│   │   ├── value-prop.tsx
│   │   ├── feature-card.tsx
│   │   ├── code-showcase.tsx
│   │   ├── screenshot.tsx
│   │   └── cta-outro.tsx
│   └── transitions/              # 2 种转场模板
│       ├── fade-slide.ts
│       └── zoom-pan.ts
└── scripts/
    ├── check-environment.sh      # 环境检测脚本
    └── analyze-project.sh        # 项目信息提取脚本
```

## 技术说明

- 基于 Remotion 4.x + React + TypeScript
- 默认分辨率：1920x1080 @ 30fps
- 输出格式：MP4 (H.264)
- 使用 spring() 和 interpolate() 动画原语

## 相关链接

- [Remotion 官方文档](https://www.remotion.dev/docs)
- [Remotion Spring 动画](https://www.remotion.dev/docs/spring)
- [Remotion Interpolate](https://www.remotion.dev/docs/interpolate)

## License

MIT