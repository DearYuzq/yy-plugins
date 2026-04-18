#!/bin/bash
# ensure-executable.sh - 确保所有脚本有可执行权限

PLUGIN_PATH="${1:-.}"

echo "确保脚本可执行权限..."

if [ -d "$PLUGIN_PATH/scripts" ]; then
    find "$PLUGIN_PATH/scripts" -name "*.sh" -exec chmod +x {} \;
    find "$PLUGIN_PATH/scripts" -name "*.js" -exec chmod +x {} \; 2>/dev/null || true
    echo "✔ 权限已更新"
else
    echo "未找到 scripts 目录"
fi