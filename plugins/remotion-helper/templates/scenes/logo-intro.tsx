import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate} from 'remotion';
import {SafeZone} from '../components/SafeZone';
import {getAnimationConfig} from '../utils/animation';

/**
 * Logo Intro Scene - Logo 开场场景
 *
 * 使用 spring 弹跳动画展示 Logo 和项目名称
 * 适用于所有风格模板
 * 已应用 Safe Zone 和最小字号规范
 */

interface LogoIntroProps {
  logo?: string;           // Logo 图片路径
  title: string;           // 项目名称
  subtitle?: string;       // 副标题/描述
  style: 'tech' | 'saas' | 'open-source' | 'minimal' | 'neon' | 'corporate' | 'brutalist' | 'editorial' | 'ethereal';
  durationInFrames?: number;
}

// 各风格的配色和样式配置
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
  },
  'open-source': {
    background: '#0d1117',
    text: '#c9d1d9',
    textMuted: '#8b949e',
    primary: '#58a6ff',
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
  },
  corporate: {
    background: '#eef2f7',
    text: '#172b4d',
    textMuted: '#5e6c84',
    primary: '#0052cc',
  },
  brutalist: {
    background: '#0A0A0A',
    text: '#EAEAEA',
    textMuted: '#666666',
    primary: '#E61919',
  },
  editorial: {
    background: '#FFFFFF',
    text: '#111111',
    textMuted: '#666666',
    primary: '#E61919',
  },
  ethereal: {
    background: '#050505',
    text: '#EAEAEA',
    textMuted: '#888888',
    primary: '#00D9FF',
  },
};

export const LogoIntro: React.FC<LogoIntroProps> = ({
  logo,
  title,
  subtitle,
  style = 'tech',
  durationInFrames = 90,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const config = styleConfigs[style];

  // Logo 弹跳入场（使用统一动画配置）
  const logoProgress = spring({
    frame,
    fps,
    config: getAnimationConfig(style),
  });

  const logoScale = interpolate(logoProgress, [0, 1], [0.3, 1]);
  const logoOpacity = interpolate(logoProgress, [0, 1], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // 标题滑入
  const titleProgress = interpolate(frame - 10, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const titleY = interpolate(titleProgress, [0, 1], [30, 0]);
  const titleOpacity = titleProgress;

  // 副标题淡入
  const subtitleProgress = interpolate(frame - 25, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <SafeZone background={config.background}>
      {/* Logo */}
      {logo ? (
        <img
          src={logo}
          alt="Logo"
          style={{
            width: 140,
            height: 140,
            transform: `scale(${logoScale})`,
            opacity: logoOpacity,
          }}
        />
      ) : (
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: 28,
            backgroundColor: config.primary,
            opacity: logoOpacity,
            transform: `scale(${logoScale})`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: 56,
            color: config.background,
            fontWeight: 'bold',
          }}
        >
          {title.charAt(0).toUpperCase()}
        </div>
      )}

      {/* Title */}
      <h1
        style={{
          fontFamily: style === 'tech' ? 'monospace' : 'system-ui, sans-serif',
          fontSize: 56,
          color: config.text,
          fontWeight: style === 'minimal' ? '300' : 'bold',
          marginTop: 32,
          transform: `translateY(${titleY}px)`,
          opacity: titleOpacity,
          textAlign: 'center',
          letterSpacing: style === 'neon' ? '0.1em' : 'normal',
        }}
      >
        {title}
      </h1>

      {/* Subtitle */}
      {subtitle && (
        <p
          style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: 24,  // 提升最小字号（原 22px）
            color: config.textMuted,
            marginTop: 16,
            opacity: subtitleProgress,
            textAlign: 'center',
          }}
        >
          {subtitle}
        </p>
      )}
    </SafeZone>
  );
};

export default LogoIntro;