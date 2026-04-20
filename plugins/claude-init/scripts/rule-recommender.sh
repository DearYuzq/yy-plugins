#!/bin/bash
# Rule Recommender - 根据场景推荐规则
# 用法：./rule-recommender.sh [场景关键词]

RULES_DIR="${CLAUDE_PLUGIN_ROOT}/templates/rules"

# 定义场景到规则的映射
declare -A SCENE_RULES=(
    ["planning"]="planning-first.md"
    ["task-start"]="planning-first.md"
    ["new-session"]="planning-first.md"
    ["complex-task"]="planning-first.md subagent-strategy.md"
    ["research"]="subagent-strategy.md"
    ["code-review"]="quality-standards.md principles.md"
    ["before-commit"]="quality-standards.md"
    ["task-complete"]="quality-standards.md"
    ["testing"]="quality-standards.md"
    ["bug-fix"]="self-improve.md"
    ["user-correction"]="self-improve.md"
    ["ci-failure"]="self-improve.md"
    ["new-task"]="prompt-tips.md"
    ["unclear-requirement"]="prompt-tips.md"
    ["need-research"]="prompt-tips.md subagent-strategy.md"
    ["decision-making"]="prompt-tips.md"
    ["file-edit"]="automation.md"
    ["build-error"]="automation.md"
    ["backend-debug"]="service-mgmt.md"
    ["microservice"]="service-mgmt.md"
    ["log-analysis"]="service-mgmt.md"
    ["always"]="principles.md"
    ["refactoring"]="principles.md quality-standards.md"
)

# 检测项目特征
detect_project_features() {
    local scenes=""

    # 检测是否有 PM2 配置
    if [ -f "pm2.config.js" ] || [ -f "ecosystem.config.js" ] || grep -q "pm2" package.json 2>/dev/null; then
        scenes="$scenes backend-debug microservice"
    fi

    # 检测是否有 CI/CD 配置
    if [ -d ".github/workflows" ] || [ -f ".gitlab-ci.yml" ] || [ -f "Jenkinsfile" ]; then
        scenes="$scenes ci-failure"
    fi

    # 检测是否有测试配置
    if grep -q "\"test\"" package.json 2>/dev/null || [ -d "tests" ] || [ -d "__tests__" ]; then
        scenes="$scenes testing"
    fi

    echo "$scenes"
}

# 获取推荐规则
get_recommended_rules() {
    local input_scenes="$1"
    local detected_scenes=$(detect_project_features)
    local all_scenes="$input_scenes $detected_scenes"

    declare -A recommended
    declare -A priority_rules

    # 始终加载的规则
    priority_rules["principles.md"]="required"
    priority_rules["planning-first.md"]="required"

    for scene in $all_scenes; do
        local rules="${SCENE_RULES[$scene]}"
        for rule in $rules; do
            recommended["$rule"]=1
        done
    done

    # 输出推荐规则
    local rules_list=""
    for rule in "${!recommended[@]}"; do
        rules_list="$rules_list $rule"
    done

    # 添加优先级标记
    for rule in "${!priority_rules[@]}"; do
        echo "$rule:${priority_rules[$rule]}"
    done

    for rule in $rules_list; do
        if [ -z "${priority_rules[$rule]}" ]; then
            echo "$rule:recommended"
        fi
    done
}

# 检查规则是否已安装
check_installed() {
    local rule_file="$1"
    if [ -f ".claude/rules/$rule_file" ]; then
        echo "installed"
    else
        echo "not-installed"
    fi
}

# 主函数
main() {
    local scenes="$*"

    if [ -z "$scenes" ]; then
        # 无参数时检测当前会话上下文
        scenes="new-session"
    fi

    echo "=== 规则推荐系统 ==="
    echo "检测场景：$scenes"
    echo ""

    # 获取推荐规则
    local rules=$(get_recommended_rules "$scenes")

    local required_rules=""
    local recommended_rules=""

    while IFS= read -r line; do
        local rule_file=$(echo "$line" | cut -d: -f1)
        local priority=$(echo "$line" | cut -d: -f2)
        local status=$(check_installed "$rule_file")

        if [ "$priority" == "required" ]; then
            required_rules="$required_rules $rule_file($status)"
        else
            recommended_rules="$recommended_rules $rule_file($status)"
        fi
    done <<< "$rules"

    echo "【必须加载】"
    for rule in $required_rules; do
        local name=$(echo "$rule" | cut -d\( -f1)
        local status=$(echo "$rule" | cut -d\( -f2 | tr -d ")")
        if [ "$status" == "installed" ]; then
            echo "  ✓ $name"
        else
            echo "  ⚠ $name (未安装，运行：/cc-add-rule ${name%.md})"
        fi
    done

    echo ""
    echo "【推荐加载】"
    for rule in $recommended_rules; do
        local name=$(echo "$rule" | cut -d\( -f1)
        local status=$(echo "$rule" | cut -d\( -f2 | tr -d ")")
        if [ "$status" == "installed" ]; then
            echo "  ✓ $name"
        else
            echo "  ○ $name (可选)"
        fi
    done
}

main "$@"