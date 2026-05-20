#!/bin/bash

# Project Analyzer - 项目信息提取脚本
# 用于自动提取项目信息以生成宣传视频

set -e

PROJECT_DIR="${1:-.}"

echo "🔍 分析项目: $PROJECT_DIR"

# 输出 JSON 结构
output_json() {
  echo "{"
  echo "  \"name\": \"$PROJECT_NAME\","
  echo "  \"description\": \"$PROJECT_DESC\","
  echo "  \"features\": [$FEATURES],"
  echo "  \"techStack\": [$TECH_STACK],"
  echo "  \"logo\": \"$LOGO\","
  echo "  \"screenshots\": [$SCREENSHOTS],"
  echo "  \"website\": \"$WEBSITE\","
  echo "  \"repository\": \"$REPOSITORY\""
  echo "}"
}

# 1. 提取项目名称
extract_name() {
  if [ -f "$PROJECT_DIR/package.json" ]; then
    PROJECT_NAME=$(grep -o '"name"[^,]*' "$PROJECT_DIR/package.json" | sed 's/"name"[[:space:]]*:[[:space:]]*"/' | sed 's/"$//' | head -1)
  elif [ -f "$PROJECT_DIR/pyproject.toml" ]; then
    PROJECT_NAME=$(grep '^name = ' "$PROJECT_DIR/pyproject.toml" | sed 's/name = "//' | sed 's/"$//' | head -1)
  elif [ -f "$PROJECT_DIR/README.md" ]; then
    PROJECT_NAME=$(head -1 "$PROJECT_DIR/README.md" | sed 's/^# //' | sed 's/  */ /' | head -1)
  else
    PROJECT_NAME=$(basename "$PROJECT_DIR")
  fi

  # 如果名称为空，使用目录名
  if [ -z "$PROJECT_NAME" ]; then
    PROJECT_NAME=$(basename "$PROJECT_DIR")
  fi

  echo "  ✅ 项目名称: $PROJECT_NAME"
}

# 2. 提取项目描述
extract_description() {
  if [ -f "$PROJECT_DIR/package.json" ]; then
    PROJECT_DESC=$(grep -o '"description"[^,]*' "$PROJECT_DIR/package.json" | sed 's/"description"[[:space:]]*:[[:space:]]*"/' | sed 's/"$//' | head -1)
  elif [ -f "$PROJECT_DIR/README.md" ]; then
    # 获取 README 第一个非标题段落
    PROJECT_DESC=$(sed -n '/^# /,/^#/p' "$PROJECT_DIR/README.md" | grep -v '^#' | grep -v '^$' | head -1 | sed 's/^[[:space:]]*//')
  fi

  if [ -z "$PROJECT_DESC" ]; then
    PROJECT_DESC="A powerful project"
  fi

  echo "  ✅ 项目描述: ${PROJECT_DESC:0:50}..."
}

# 3. 提取功能列表
extract_features() {
  FEATURES=""

  if [ -f "$PROJECT_DIR/README.md" ]; then
    # 尝试从 README 提取功能列表（列表项）
    feature_items=$(grep -E '^[-*] ' "$PROJECT_DIR/README.md" | head -5 | sed 's/^[-*] //' | sed 's/"//g')

    if [ -n "$feature_items" ]; then
      # 转换为 JSON 数组格式
      features_json=""
      while IFS= read -r item; do
        if [ -n "$item" ]; then
          features_json="$features_json\"$item\","
        fi
      done <<< "$feature_items"
      FEATURES="${features_json%,}"
    fi
  fi

  if [ -z "$FEATURES" ]; then
    FEATURES='"Feature 1", "Feature 2", "Feature 3"'
  fi

  echo "  ✅ 功能列表已提取"
}

# 4. 提取技术栈
extract_tech_stack() {
  TECH_STACK=""

  if [ -f "$PROJECT_DIR/package.json" ]; then
    # 从 package.json 提取主要依赖
    deps=$(grep -A 100 '"dependencies"' "$PROJECT_DIR/package.json" | grep -o '"[^"]*"' | grep -v 'dependencies' | grep -v 'version' | head -10 | sed 's/"//g')

    stack_json=""
    for dep in $deps; do
      stack_json="$stack_json\"$dep\","
    done
    TECH_STACK="${stack_json%,}"
  elif [ -f "$PROJECT_DIR/pyproject.toml" ]; then
    # 从 pyproject.toml 提取依赖
    deps=$(grep '^dependencies = ' "$PROJECT_DIR/pyproject.toml" | head -1 || echo "")

    if [ -n "$deps" ]; then
      TECH_STACK='"Python"'
    fi
  fi

  if [ -z "$TECH_STACK" ]; then
    TECH_STACK='"JavaScript"'
  fi

  echo "  ✅ 技术栈: ${TECH_STACK:0:50}..."
}

# 5. 查找 Logo
find_logo() {
  LOGO=""

  # 常见 logo 文件名
  logo_names="logo icon brand favicon"

  for name in $logo_names; do
    for ext in png svg jpg jpeg webp; do
      if [ -f "$PROJECT_DIR/$name.$ext" ]; then
        LOGO="$PROJECT_DIR/$name.$ext"
        break
      fi
      if [ -f "$PROJECT_DIR/public/$name.$ext" ]; then
        LOGO="$PROJECT_DIR/public/$name.$ext"
        break
      fi
      if [ -f "$PROJECT_DIR/assets/$name.$ext" ]; then
        LOGO="$PROJECT_DIR/assets/$name.$ext"
        break
      fi
      if [ -f "$PROJECT_DIR/img/$name.$ext" ]; then
        LOGO="$PROJECT_DIR/img/$name.$ext"
        break
      fi
    done
  done

  if [ -n "$LOGO" ]; then
    echo "  ✅ Logo: $LOGO"
  else
    echo "  ⚠️  Logo 未找到"
  fi
}

# 6. 查找截图
find_screenshots() {
  SCREENSHOTS=""

  # 搜索截图目录
  for dir in screenshots img assets public images; do
    if [ -d "$PROJECT_DIR/$dir" ]; then
      files=$(find "$PROJECT_DIR/$dir" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" \) 2>/dev/null | head -5)

      if [ -n "$files" ]; then
        screenshots_json=""
        while IFS= read -r file; do
          if [ -n "$file" ]; then
            screenshots_json="$screenshots_json\"$file\","
          fi
        done <<< "$files"
        SCREENSHOTS="${screenshots_json%,}"
        if [ -n "$SCREENSHOTS" ]; then
          break
        fi
      fi
    fi
  done

  if [ -n "$SCREENSHOTS" ]; then
    echo "  ✅ 截图已找到"
  else
    echo "  ⚠️  截图未找到"
  fi
}

# 7. 提取链接
extract_links() {
  WEBSITE=""
  REPOSITORY=""

  if [ -f "$PROJECT_DIR/package.json" ]; then
    WEBSITE=$(grep -o '"homepage"[^,]*' "$PROJECT_DIR/package.json" | sed 's/"homepage"[[:space:]]*:[[:space:]]*"/' | sed 's/"$//' | head -1)
    REPOSITORY=$(grep -o '"repository"[^,]*' "$PROJECT_DIR/package.json" | sed 's/"repository"[[:space:]]*:[[:space:]]*{//' | sed 's/}//' | grep -o '"url"[^}]*' | sed 's/"url"[[:space:]]*:[[:space:]]*"/' | sed 's/"$//' | head -1)
  fi

  if [ -f "$PROJECT_DIR/README.md" ]; then
    if [ -z "$REPOSITORY" ]; then
      REPOSITORY=$(grep -o 'https://github.com/[^)]*' "$PROJECT_DIR/README.md" | head -1)
    fi
  fi

  echo "  ✅ 链接已提取"
}

# 执行所有提取
extract_name
extract_description
extract_features
extract_tech_stack
find_logo
find_screenshots
extract_links

echo ""
echo "✨ 项目分析完成！"