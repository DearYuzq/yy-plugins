#!/bin/bash
# Git Analyzer - 分析 git 历史并输出 JSON

SINCE_COMMIT="${1:-HEAD~10}"

echo "[claude-init] 分析 git 提交历史 (since $SINCE_COMMIT)..."

# 获取最近的提交信息
COMMITS=$(git log "$SINCE_COMMIT"..HEAD --pretty=format:'%H|%s|%an|%ad' --date=short 2>/dev/null)

if [ -z "$COMMITS" ]; then
    echo '{"commits": [], "summary": "无新提交"}'
    exit 0
fi

# 分析变更文件
CHANGED_FILES=$(git diff --name-only "$SINCE_COMMIT"..HEAD 2>/dev/null | sort | uniq -c | sort -rn | head -20)

# 分析提交类型
FEATURE_COMMITS=$(echo "$COMMITS" | grep -E '(feat|feature):' | wc -l)
FIX_COMMITS=$(echo "$COMMITS" | grep -E '(fix|bug):' | wc -l)
REFACTOR_COMMITS=$(echo "$COMMITS" | grep -E '(refactor|perf):' | wc -l)
DOCS_COMMITS=$(echo "$COMMITS" | grep -E '(doc|docs|readme):' | wc -l)

# 生成 JSON 输出
cat <<EOF
{
  "since": "$SINCE_COMMIT",
  "analysisDate": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "summary": {
    "totalCommits": $(echo "$COMMITS" | wc -l),
    "featureCommits": $FEATURE_COMMITS,
    "fixCommits": $FIX_COMMITS,
    "refactorCommits": $REFACTOR_COMMITS,
    "docsCommits": $DOCS_COMMITS
  },
  "topChangedFiles": [
$(echo "$CHANGED_FILES" | sed 's/^ *//g' | awk '{print "    {\"changes\": \""$1"\", \"file\": \""$2"\"}"}' | sed 's/$/,/' | sed '$s/,$//')
  ],
  "recentCommits": [
$(echo "$COMMITS" | head -10 | awk -F'|' '{print "    {\"hash\": \""substr($1,1,8)"\", \"message\": \""$2"\", \"author\": \""$3"\", \"date\": \""$4"\"}"}' | sed 's/$/,/' | sed '$s/,$//')
  ],
  "suggestions": [
    "$(test $DOCS_COMMITS -gt 5 && echo "检测到较多文档更新，建议检查 CLAUDE.md 中的文档引用" || echo "")",
    "$(test $FEATURE_COMMITS -gt 3 && echo "检测到较多功能提交，建议更新架构文档" || echo "")",
    "$(test $REFACTOR_COMMITS -gt 3 && echo "检测到较多重构，建议更新开发规范" || echo "")
  ]
}
EOF
