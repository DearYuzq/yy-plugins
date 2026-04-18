#!/bin/bash
# validate-plugin.sh - 验证插件格式

PLUGIN_PATH="${1:-.}"

echo "=========================================="
echo "  Plugin Builder - 插件验证"
echo "=========================================="
echo ""
echo "验证插件路径：$PLUGIN_PATH"
echo ""

# 运行 Claude Code 验证命令
claude plugin validate "$PLUGIN_PATH" 2>&1
EXIT_CODE=$?

echo ""
echo "=========================================="

if [ $EXIT_CODE -eq 0 ]; then
    echo "  ✔ 验证通过！"
    echo "=========================================="
    echo ""
    echo "下一步操作："
    echo ""
    echo "  # 安装插件（用户级）"
    echo "  claude plugin install $PLUGIN_PATH --scope user"
    echo ""
    echo "  # 启用插件"
    echo "  claude plugin enable $(basename "$PLUGIN_PATH")"
    echo ""
else
    echo "  ✘ 验证失败"
    echo "=========================================="
    echo ""
    echo "请根据上面的错误信息修复问题后重新验证。"
    echo ""
fi

exit $EXIT_CODE