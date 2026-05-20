import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {SafeZone} from '../components/SafeZone';

/**
 * CTA Outro Scene - CTA 结尾场景
 *
 * 展示行动号召（CTA）
 * 使用脉冲效果吸引注意
 * 已应用 Safe Zone 和最小字号规范
 */

interface CTAOutroProps {
  text: string;            // CTA 主文案
  buttonText?: string;     // 按钮文字
  link?: string;           // 链接/网址
  style?: 'tech' | 'saas' | 'open-source' | 'minimal' | 'neon' | 'corporate';
}

const styleConfigs = {
  tech: {
    background: '#0f0f23',
    text: '#ffffff',
    textMuted: '#a1a1aa',
    primary: '#6366f1',
  },
  saas: {
    background: '#f8fafc',
    text: '#1e293b',
    textMuted: '#64748b',
    primary: '#0ea5e9',
    accent: '#10b981',
  },
  'open-source': {
    background: '#0d1117',
    text: '#c9d1d9',
    textMuted: '#8b949e',
    primary: '#58a6ff',
    accent: '#3fb950',
  },
  minimal: {
    background: '#ffffff',
    text: '#000000',
    textMuted: '#999999',
    primary: '#000000',
  },
  neon: {
    background: '#000000',
    text: '#ffffff',
    textMuted: '#808080',
    primary: '#ff00ff',
    accent: '#ffff00',
    glow: '0 0 20px #ff00ff',
  },
  corporate: {
    background: '#eef2f7',
    text: '#172b4d',
    textMuted: '#5e6c84',
    primary: '#0052cc',
  },
};

export const CTAOutro: React.FC<CTAOutroProps> = ({
  text,
  buttonText,
  link,
  style = 'tech',
}) => {
  const frame = useCurrentFrame();
  const config = styleConfigs[style];

  // 主文案淡入
  const textProgress = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // 按钮脉冲效果（修复频率：原 0.15 约 5Hz 太快，改为 0.05 约 1.5Hz）
  const pulse = Math.sin(frame * 0.05) * 0.05 + 1;  // 0.95-1.05 范围

  // 按钮淡入（延迟）
  const buttonProgress = interpolate(frame - 15, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  // 链接淡入（更延迟）
  const linkProgress = interpolate(frame - 30, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  return (
    <SafeZone background={config.background}>
      {/* Main Text */}
      <h1
        style={{
          fontFamily: style === 'tech' || style === 'neon' ? 'monospace' : 'system-ui, sans-serif',
          fontSize: style === 'neon' ? 56 : 48,
          color: config.text,
          fontWeight: style === 'minimal' ? '300' : style === 'neon' ? '900' : 'bold',
          textAlign: 'center',
          opacity: textProgress,
          textTransform: style === 'neon' ? 'uppercase' : 'none',
          letterSpacing: style === 'neon' ? '0.1em' : 'normal',
          textShadow: style === 'neon' ? config.glow : 'none',
        }}
      >
        {text}
      </h1>

      {/* Button */}
      {buttonText && (
        <button
          style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: 20,
            fontWeight: '600',
            padding: '16px 48px',
            borderRadius: style === 'minimal' ? 4 : 12,
            border: 'none',
            cursor: 'pointer',
            backgroundColor: style === 'neon' ? 'transparent' : (config as any).accent || config.primary,
            color: style === 'neon' ? config.primary : (style === 'saas' || style === 'corporate' ? '#fff' : '#fff'),
            marginTop: 32,
            opacity: buttonProgress,
            transform: `scale(${pulse})`,
            boxShadow: style === 'neon' ? config.glow : 'none',
            border: style === 'neon' ? `3px solid ${config.primary}` : 'none',
            textTransform: style === 'neon' ? 'uppercase' : 'none',
            letterSpacing: style === 'neon' ? '0.1em' : 'normal',
          }}
        >
          {buttonText}
        </button>
      )}

      {/* Link */}
      {link && (
        <p
          style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: 18,  // 提升最小字号（原 16px）
            color: style === 'neon' ? config.primary : config.primary,
            marginTop: 24,
            opacity: linkProgress,
            textDecoration: 'underline',
            textUnderlineOffset: '4px',
          }}
        >
          {link}
        </p>
      )}
    </SafeZone>
  );
};

export default CTAOutro;