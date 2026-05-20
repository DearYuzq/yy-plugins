import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, spring} from 'remotion';
import {SafeZone} from '../components/SafeZone';
import {getAnimationConfig} from '../utils/animation';

/**
 * Feature Card Scene - 功能卡片场景
 *
 * 展示项目的核心功能
 * 支持多个卡片依次入场（stagger）
 * 已应用 Safe Zone 和最小字号规范
 */

interface Feature {
  icon?: string;           // 图标路径或 emoji
  title: string;           // 功能名称
  description: string;     // 功能描述
}

interface FeatureCardsProps {
  features: Feature[];
  style?: 'tech' | 'saas' | 'open-source' | 'minimal' | 'neon' | 'corporate';
  staggerDelay?: number;   // 卡片之间延迟帧数
}

const styleConfigs = {
  tech: {
    background: '#0f0f23',
    cardBg: '#1e1e3f',
    text: '#ffffff',
    textMuted: '#a1a1aa',
    primary: '#6366f1',
    border: '#2e2e5a',
  },
  saas: {
    background: '#f8fafc',
    cardBg: '#ffffff',
    text: '#1e293b',
    textMuted: '#64748b',
    primary: '#0ea5e9',
    border: '#e2e8f0',
    shadow: '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
  },
  'open-source': {
    background: '#0d1117',
    cardBg: '#161b22',
    text: '#c9d1d9',
    textMuted: '#8b949e',
    primary: '#58a6ff',
    border: '#30363d',
  },
  minimal: {
    background: '#ffffff',
    cardBg: '#fafafa',
    text: '#000000',
    textMuted: '#999999',
    primary: '#000000',
    border: '#e5e5e5',
  },
  neon: {
    background: '#000000',
    cardBg: 'transparent',
    text: '#ffffff',
    textMuted: '#808080',
    primary: '#ff00ff',
    border: '#ff00ff',
    glow: '0 0 20px #ff00ff',
  },
  corporate: {
    background: '#eef2f7',
    cardBg: '#ffffff',
    text: '#172b4d',
    textMuted: '#5e6c84',
    primary: '#0052cc',
    border: '#dfe1e6',
    shadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  },
};

export const FeatureCards: React.FC<FeatureCardsProps> = ({
  features,
  style = 'tech',
  staggerDelay = 8,
}) => {
  const frame = useCurrentFrame();
  const config = styleConfigs[style];

  // 计算布局（2-3 列）
  const columns = features.length >= 3 ? 3 : features.length;
  const cardWidth = 280;
  const gap = 32;

  return (
    <SafeZone background={config.background}>
      <div
        style={{
          display: 'flex',
          gap,
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            feature={feature}
            style={style}
            delay={index * staggerDelay}
            frame={frame}
          />
        ))}
      </div>
    </SafeZone>
  );
};

interface FeatureCardProps {
  feature: Feature;
  style: string;
  delay: number;
  frame: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  feature,
  style,
  delay,
  frame,
}) => {
  const config = styleConfigs[style as keyof typeof styleConfigs];

  // 卡片入场动画（使用统一动画配置 + stagger）
  const cardProgress = spring({
    frame: frame - delay,
    fps: 30,
    config: getAnimationConfig(style),
  });

  const cardY = interpolate(cardProgress, [0, 1], [60, 0]);
  const cardOpacity = interpolate(cardProgress, [0, 1], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const cardScale = interpolate(cardProgress, [0, 1], [0.9, 1]);

  return (
    <div
      style={{
        width: 280,
        padding: 24,
        background: config.cardBg,
        borderRadius: style === 'minimal' ? 4 : 16,
        border: style === 'neon' ? `2px solid ${config.primary}` : `1px solid ${config.border}`,
        boxShadow: (config as any).shadow || 'none',
        transform: `translateY(${cardY}px) scale(${cardScale})`,
        opacity: cardOpacity,
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: style === 'neon' ? 24 : 12,
          backgroundColor: `${config.primary}20`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: 24,
          boxShadow: style === 'neon' ? config.glow : 'none',
        }}
      >
        {feature.icon || '✨'}
      </div>

      {/* Title */}
      <h3
        style={{
          fontFamily: style === 'tech' || style === 'neon' ? 'monospace' : 'system-ui, sans-serif',
          fontSize: 24,  // 提升最小字号（原 18px）
          color: config.text,
          fontWeight: style === 'minimal' ? '500' : '600',
          marginTop: 16,
          textTransform: style === 'neon' ? 'uppercase' : 'none',
          letterSpacing: style === 'neon' ? '0.1em' : 'normal',
        }}
      >
        {feature.title}
      </h3>

      {/* Description */}
      <p
        style={{
          fontFamily: 'system-ui, sans-serif',
          fontSize: 24,  // 提升最小字号（原 14px）
          color: config.textMuted,
          marginTop: 8,
          lineHeight: 1.5,
        }}
      >
        {feature.description}
      </p>
    </div>
  );
};

export default FeatureCards;