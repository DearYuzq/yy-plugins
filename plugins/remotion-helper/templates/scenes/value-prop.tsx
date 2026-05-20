import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, Easing} from 'remotion';
import {SafeZone} from '../components/SafeZone';

/**
 * Value Prop Scene - 价值主张场景
 *
 * 展示项目的核心价值主张（一句话）
 * 使用淡入 + 滑入组合动画
 * 已应用 Safe Zone 和最小字号规范
 */

interface ValuePropProps {
  headline: string;        // 主标题（价值主张）
  description?: string;    // 描述文字
  style?: 'tech' | 'saas' | 'open-source' | 'minimal' | 'neon' | 'corporate' | 'brutalist' | 'editorial' | 'ethereal';
  fadeInDuration?: number;
}

const styleConfigs = {
  tech: {
    background: '#0f0f23',
    text: '#ffffff',
    textMuted: '#a1a1aa',
  },
  saas: {
    background: '#f8fafc',
    text: '#1e293b',
    textMuted: '#64748b',
  },
  'open-source': {
    background: '#0d1117',
    text: '#c9d1d9',
    textMuted: '#8b949e',
  },
  minimal: {
    background: '#ffffff',
    text: '#000000',
    textMuted: '#999999',
  },
  neon: {
    background: '#000000',
    text: '#ffffff',
    textMuted: '#808080',
  },
  corporate: {
    background: '#eef2f7',
    text: '#172b4d',
    textMuted: '#5e6c84',
  },
  brutalist: {
    background: '#0A0A0A',
    text: '#EAEAEA',
    textMuted: '#666666',
  },
  editorial: {
    background: '#FFFFFF',
    text: '#111111',
    textMuted: '#666666',
  },
  ethereal: {
    background: '#050505',
    text: '#EAEAEA',
    textMuted: '#888888',
  },
};

export const ValueProp: React.FC<ValuePropProps> = ({
  headline,
  description,
  style = 'tech',
  fadeInDuration = 30,
}) => {
  const frame = useCurrentFrame();
  const config = styleConfigs[style];

  // 标题淡入 + 从下方滑入
  const headlineProgress = interpolate(frame, [0, fadeInDuration], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const headlineY = interpolate(headlineProgress, [0, 1], [50, 0]);
  const headlineOpacity = headlineProgress;

  // 描述淡入（延迟）
  const descriptionProgress = interpolate(
    frame - 15,
    [0, fadeInDuration],
    [0, 1],
    {
      extrapolateRight: 'clamp',
      extrapolateLeft: 'clamp',
    }
  );

  return (
    <SafeZone background={config.background}>
      {/* Headline */}
      <h1
        style={{
          fontFamily: style === 'tech' || style === 'neon' ? 'monospace' : 'system-ui, sans-serif',
          fontSize: style === 'neon' ? 48 : 44,
          color: config.text,
          fontWeight: style === 'minimal' ? '300' : style === 'neon' ? '900' : 'bold',
          textAlign: 'center',
          lineHeight: 1.2,
          transform: `translateY(${headlineY}px)`,
          opacity: headlineOpacity,
          letterSpacing: style === 'neon' ? '0.08em' : 'normal',
          textShadow: style === 'neon' ? '0 0 20px #ffffff80' : 'none',
        }}
      >
        {headline}
      </h1>

      {/* Description */}
      {description && (
        <p
          style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: 24,  // 提升最小字号（原 22px）
            color: config.textMuted,
            textAlign: 'center',
            marginTop: 24,
            opacity: descriptionProgress,
            maxWidth: '80%',
            lineHeight: 1.5,
            fontWeight: style === 'minimal' ? '400' : 'normal',
          }}
        >
          {description}
        </p>
      )}
    </SafeZone>
  );
};

export default ValueProp;