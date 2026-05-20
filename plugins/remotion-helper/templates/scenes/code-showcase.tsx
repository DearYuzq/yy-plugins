import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, Easing} from 'remotion';
import {SafeZone} from '../components/SafeZone';

/**
 * Code Showcase Scene - 代码展示场景
 *
 * 展示项目的代码片段
 * 适合技术产品、开发者工具
 * 已应用 Safe Zone 和最小字号规范
 */

interface CodeShowcaseProps {
  code: string;            // 代码字符串
  title?: string;          // 标题
  language?: string;       // 语言标识（用于高亮）
  style?: 'tech' | 'open-source';
}

const styleConfigs = {
  tech: {
    background: '#0f0f23',
    codeBg: '#0d0d1a',
    text: '#ffffff',
    textMuted: '#a1a1aa',
    primary: '#6366f1',
    accent: '#a855f7',
    border: '#2e2e5a',
  },
  'open-source': {
    background: '#0d1117',
    codeBg: '#161b22',
    text: '#c9d1d9',
    textMuted: '#8b949e',
    primary: '#58a6ff',
    accent: '#3fb950',
    border: '#30363d',
  },
};

// 简单的代码高亮函数
function highlightCode(code: string, style: string): React.ReactNode {
  const config = styleConfigs[style as keyof typeof styleConfigs];

  const keywords = ['import', 'export', 'from', 'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'interface', 'type', 'async', 'await'];
  const strings = /(["'`])(?:(?!\1)[^\\]|\\.)*?\1/g;

  const lines = code.split('\n');

  return lines.map((line, i) => {
    const highlightedLine = line.split(/\s+/).map((word, j) => {
      // 关键字高亮
      if (keywords.includes(word)) {
        return <span key={j} style={{color: config.primary}}>{word} </span>;
      }
      // 字符串高亮
      if (word.match(/^["'`]/)) {
        return <span key={j} style={{color: config.accent}}>{word} </span>;
      }
      // 注释高亮
      if (word.startsWith('//')) {
        return <span key={j} style={{color: config.textMuted}}>{line.slice(j)} </span>;
      }
      return word + ' ';
    });

    return (
      <div key={i} style={{minHeight: '1.5em'}}>
        {highlightedLine}
      </div>
    );
  });
}

export const CodeShowcase: React.FC<CodeShowcaseProps> = ({
  code,
  title,
  language = 'typescript',
  style = 'tech',
}) => {
  const frame = useCurrentFrame();
  const config = styleConfigs[style];

  // 容器淡入
  const containerProgress = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const containerOpacity = containerProgress;
  const containerY = interpolate(containerProgress, [0, 1], [30, 0]);

  return (
    <SafeZone background={config.background}>
      <div
        style={{
          width: '85%',
          transform: `translateY(${containerY}px)`,
          opacity: containerOpacity,
        }}
      >
        {/* Title */}
        {title && (
          <h2
            style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: 24,
              color: config.text,
              fontWeight: '600',
              marginBottom: 16,
            }}
          >
            {title}
          </h2>
        )}

        {/* Code Block */}
        <div
          style={{
            background: config.codeBg,
            borderRadius: 12,
            border: `1px solid ${config.border}`,
            padding: 24,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 18,  // 提升最小字号（原 16px）
            color: config.text,
            overflow: 'auto',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 8,
              marginBottom: 16,
            }}
          >
            <div style={{width: 12, height: 12, borderRadius: 6, background: '#ff5f56'}} />
            <div style={{width: 12, height: 12, borderRadius: 6, background: '#ffbd2e'}} />
            <div style={{width: 12, height: 12, borderRadius: 6, background: '#27c93f'}} />
          </div>

          <pre style={{margin: 0, overflow: 'auto'}}>
            <code>
              {highlightCode(code, style)}
            </code>
          </pre>
        </div>

        {/* Language Badge */}
        <div
          style={{
            marginTop: 12,
            padding: '4px 12px',
            backgroundColor: `${config.primary}20`,
            borderRadius: 6,
            display: 'inline-block',
          }}
        >
          <span
            style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: 14,  // badge 字号可以稍小
              color: config.primary,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {language}
          </span>
        </div>
      </div>
    </SafeZone>
  );
};

export default CodeShowcase;