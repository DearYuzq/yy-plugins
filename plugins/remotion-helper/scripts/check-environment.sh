#!/bin/bash

# Environment Checker - 环境检测脚本
# 检测 Node.js 和 Remotion 是否满足运行要求

set -e

echo "🔍 检测运行环境..."

# 1. 检测 Node.js
NODE_VERSION=$(node --version 2>/dev/null | sed 's/v//')

if [ -z "$NODE_VERSION" ]; then
  echo "❌ Node.js 未安装"
  echo "   请安装 Node.js 18+ : https://nodejs.org/"
  exit 1
fi

# 提取主版本号
MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)

if [ "$MAJOR" -lt 18 ]; then
  echo "❌ Node.js 版本过低: v$NODE_VERSION (需要 18+)"
  echo "   请升级 Node.js: https://nodejs.org/"
  exit 1
fi

echo "✅ Node.js v$NODE_VERSION"

# 2. 检测 npm
NPM_VERSION=$(npm --version 2>/dev/null)

if [ -z "$NPM_VERSION" ]; then
  echo "❌ npm 未安装"
  echo "   Node.js 应自带 npm，请检查安装"
  exit 1
fi

echo "✅ npm $NPM_VERSION"

# 3. 检测 Remotion CLI
REMOTION_CHECK=$(npx remotion --version 2>/dev/null || echo "")

if [ -n "$REMOTION_CHECK" ]; then
  echo "✅ Remotion CLI 可用"
else
  echo "⚠️  Remotion CLI 未安装"
  echo "   将在创建视频项目时自动安装..."
  echo ""
  echo "💡 提示: Remotion 无需预先全局安装"
  echo "   创建项目时会自动执行: npx create-video@latest --blank {project-dir}"
fi

# 4. 检测 FFmpeg（可选，用于渲染）
FFmpeg_CHECK=$(ffmpeg -version 2>/dev/null | head -1 || echo "")

if [ -n "$FFmpeg_CHECK" ]; then
  echo "✅ FFmpeg 已安装（渲染推荐）"
else
  echo "⚠️  FFmpeg 未安装（可选）"
  echo "   Remotion 可通过 npx remotion ffmpeg 使用内置 FFmpeg"
fi

echo ""
echo "✨ 环境检测完成！"

# 返回状态码
# 0 = 环境满足要求
# 1 = 环境不满足要求
exit 0