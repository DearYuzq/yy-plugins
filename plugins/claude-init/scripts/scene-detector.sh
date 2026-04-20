#!/bin/bash
# Scene Detector - 检测当前操作场景并推荐规则

TOOL_NAME="$1"
TOOL_INPUT="$2"

detect_scene() {
    local tool="$1"
    local input="$2"
    local scenes=""

    case "$tool" in
        "Edit"|"Write")
            # 代码修改场景
            if echo "$input" | grep -qi "test\|spec"; then
                scenes="$scenes testing"
            fi
            scenes="$scenes code-review before-commit"
            ;;
        "Bash")
            # 检测命令类型
            if echo "$input" | grep -qi "git.*commit"; then
                scenes="$scenes before-commit"
            elif echo "$input" | grep -qi "npm.*test\|pnpm.*test\|yarn.*test"; then
                scenes="$scenes testing"
            elif echo "$input" | grep -qi "pm2\|docker.*restart"; then
                scenes="$scenes backend-debug service-restart"
            elif echo "$input" | grep -qi "build"; then
                scenes="$scenes build-error"
            fi
            ;;
        "Agent")
            # 使用子智能体
            scenes="$scenes complex-task subagent-strategy"
            ;;
        "TaskCreate"|"TaskUpdate")
            # 任务管理
            scenes="$scenes planning task-start"
            ;;
    esac

    echo "$scenes"
}

# 获取检测到的场景
SCENES=$(detect_scene "$TOOL_NAME" "$TOOL_INPUT")

if [ -n "$SCENES" ]; then
    # 输出场景提示（通过 stdout，Claude 可以看到）
    echo "[场景检测] 检测到场景：$SCENES"

    # 检查相关规则是否加载
    case "$SCENES" in
        *"testing"*)
            if [ ! -f ".claude/rules/quality-standards.md" ]; then
                echo "[规则提醒] 测试场景建议加载 quality-standards 规则：/cc-add-rule quality-standards"
            fi
            ;;
        *"before-commit"*)
            if [ ! -f ".claude/rules/quality-standards.md" ]; then
                echo "[规则提醒] 提交前建议加载 quality-standards 规则：/cc-add-rule quality-standards"
            fi
            ;;
        *"planning"*)
            if [ ! -f ".claude/rules/planning-first.md" ]; then
                echo "[规则提醒] 任务规划场景建议加载 planning-first 规则：/cc-add-rule planning-first"
            fi
            ;;
        *"backend-debug"*)
            if [ ! -f ".claude/rules/service-mgmt.md" ]; then
                echo "[规则提醒] 后端调试场景建议加载 service-mgmt 规则：/cc-add-rule service-mgmt"
            fi
            ;;
    esac
fi