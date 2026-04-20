#!/bin/bash
# Session Start Hook - 智能规则推荐

echo ""
echo "╔════════════════════════════════════════╗"
echo "║       claude-init 规则推荐系统          ║"
echo "╚════════════════════════════════════════╝"

# 检测项目类型和场景
detect_context() {
    local contexts=""

    # 新会话检测
    if [ ! -f ".claude/dev/active/"*"/"*"-plan.md" ]; then
        contexts="$contexts new-session"
    fi

    # 检测是否有进行中的任务
    local active_tasks=$(find .claude/dev/active -name "*-tasks.md" 2>/dev/null | wc -l)
    if [ "$active_tasks" -gt 0 ]; then
        contexts="$contexts task-in-progress"
    fi

    # 检测项目特征
    if [ -f "package.json" ]; then
        if grep -q "\"test\"" package.json 2>/dev/null; then
            contexts="$contexts testing"
        fi
        if grep -q "pm2" package.json 2>/dev/null; then
            contexts="$contexts backend-debug"
        fi
    fi

    # 检测 CI/CD
    if [ -d ".github/workflows" ]; then
        contexts="$contexts ci-failure"
    fi

    echo "$contexts"
}

# 检查规则安装状态
check_rule() {
    local rule="$1"
    if [ -f ".claude/rules/$rule" ]; then
        echo "✓"
    else
        echo "○"
    fi
}

# 主逻辑
CONTEXTS=$(detect_context)

echo ""
echo "当前上下文：$CONTEXTS"
echo ""

# 规则检查列表
echo "规则加载状态："
echo "─────────────────────────────────────"

# 核心规则（必须）
echo "【核心规则 - 必须加载】"
printf "  %s planning-first.md    - 规划为王\n" "$(check_rule planning-first.md)"
printf "  %s subagent-strategy.md - 子智能体策略\n" "$(check_rule subagent-strategy.md)"
printf "  %s quality-standards.md - 质量标准\n" "$(check_rule quality-standards.md)"
printf "  %s self-improve.md      - 持续改进\n" "$(check_rule self-improve.md)"
printf "  %s principles.md        - 核心原则\n" "$(check_rule principles.md)"

echo ""
echo "【实用规则 - 推荐加载】"
printf "  %s prompt-tips.md       - Prompt 技巧\n" "$(check_rule prompt-tips.md)"
printf "  %s automation.md        - 自动化工作流\n" "$(check_rule automation.md)"
printf "  %s service-mgmt.md      - 后端服务调试\n" "$(check_rule service-mgmt.md)"

# 检查缺失的核心规则
missing_rules=""
for rule in planning-first.md subagent-strategy.md quality-standards.md self-improve.md principles.md; do
    if [ ! -f ".claude/rules/$rule" ]; then
        missing_rules="$missing_rules ${rule%.md}"
    fi
done

echo ""
if [ -n "$missing_rules" ]; then
    echo "⚠  检测到未安装的核心规则：$missing_rules"
    echo "💡 建议运行：/cc-add-rule$missing_rules"
    echo ""
    # 输出到环境变量供 Claude 读取
    export CLAUDE_INIT_MISSING_RULES="$missing_rules"
    exit 1
else
    echo "✓ 所有核心规则已安装"
    echo ""
    exit 0
fi