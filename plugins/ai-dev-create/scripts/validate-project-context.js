#!/usr/bin/env node
/**
 * validate-project-context.js
 * 验证 .claude/project-context.md 的完整性和一致性。
 * 在 VERIFY 阶段调用，确保项目上下文文档有效可用。
 */

const fs = require('fs');
const path = require('path');

const CONTEXT_FILE = path.join(process.cwd(), '.claude', 'project-context.md');

function main() {
  const issues = [];

  // 1. File existence
  if (!fs.existsSync(CONTEXT_FILE)) {
    console.log('[validate-project-context] FAIL: project-context.md 不存在');
    console.log('[validate-project-context] 请确保 session_init() 已运行 detect-project-context.js');
    process.exit(1);
  }

  const content = fs.readFileSync(CONTEXT_FILE, 'utf8');

  // 2. Structural checks
  const requiredSections = [
    '# Project Context',
    '## Project Type',
  ];
  for (const section of requiredSections) {
    if (!content.includes(section)) {
      issues.push(`缺少必需章节: ${section}`);
    }
  }

  // 3. Confidence check
  const confidenceMatch = content.match(/Detection confidence:\s*(HIGH|MEDIUM|LOW)/);
  if (!confidenceMatch) {
    issues.push('缺少置信度标注 (Detection confidence)');
  }

  // 4. Project type check
  const typeMatch = content.match(/\*\*Type\*\*:\s*(\w+)/);
  if (!typeMatch) {
    issues.push('缺少项目类型定义 (type)');
  } else {
    const type = typeMatch[1];
    const validTypes = ['OLD_PROJECT', 'NEW_PROJECT', 'NEW_PROJECT_EVOLVED', 'MIXED', 'MIXED_STATUS'];
    if (!validTypes.includes(type)) {
      issues.push(`无效的项目类型: ${type} (有效值: ${validTypes.join(', ')})`);
    }
  }

  // 5. Consistency checks for OLD_PROJECT
  if (typeMatch && typeMatch[1] !== 'NEW_PROJECT') {
    const optionalSections = ['## Naming Conventions', '## Test Framework', '## Error Handling', '## Code Style'];
    for (const section of optionalSections) {
      if (!content.includes(section)) {
        issues.push(`老项目应包含 ${section} 但未找到`);
      }
    }
  }

  // 6. Self-contradiction check
  // NEW_PROJECT 不应有检测到的架构/命名信息
  if (typeMatch && typeMatch[1] === 'NEW_PROJECT') {
    if (content.includes('Pattern') && content.includes('Architecture')) {
      // Check if it's in the default conventions section (acceptable) or a real Architecture section
      const archSection = content.match(/^## Architecture\s*$/m);
      if (archSection) {
        const afterArch = content.slice(archSection.index + archSection[0].length);
        if (afterArch.includes('MVC') || afterArch.includes('feature-based') || afterArch.includes('monorepo')) {
          issues.push('NEW_PROJECT 不应有具体架构模式');
        }
      }
    }
  }

  if (issues.length > 0) {
    console.log('[validate-project-context] WARNINGS:');
    issues.forEach(issue => {
      console.log(`  - ${issue}`);
    });
    // Non-blocking: output warnings but don't fail the pipeline
    console.log(`\n[validate-project-context] 共 ${issues.length} 个警告，继续执行`);
  } else {
    console.log('[validate-project-context] PASS: project-context.md 结构完整且一致');
  }
}

main();
