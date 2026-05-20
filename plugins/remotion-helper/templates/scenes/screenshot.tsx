import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, spring} from 'remotion';
import {SafeZone} from '../components/SafeZone';
import {getAnimationConfig} from '../utils/animation';

/**
 * Screenshot Scene - 截图展示场景
 *
 * 展示产品截图或界面
 * 使用缩放 + 平移动画
 * 已应用 Safe Zone 和最小字号规范
 */

interface ScreenshotProps {
  src: string;             // 截图路径
  caption?: string;        // 说明文字
  style?: 'tech' | 'saas' | 'open-source' | 'minimal' | 'neon' | 'corporate';
  zoomIn?: boolean;        // 是否缩放展示
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
    shadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
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
    glow: '0 0 30px #00ffff80',
  },
  corporate: {
    background: '#eef2f7',
    text: '#172b4d',
    textMuted: '#5e6c84',
    shadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
  },
};

export const Screenshot: React.FC<ScreenshotProps> = ({
  src,
  caption,
  style = 'tech',
  zoomIn = true,
}) => {
  const frame = useCurrentFrame();
  const config = styleConfigs[style];

  // 截图入场动画（使用统一动画配置）
  const screenshotProgress = spring({
    frame,
    fps: 30,
    config: getAnimationConfig(style),
  });

  const screenshotScale = interpolate(screenshotProgress, [0, 1], [0.8, 1]);
  const screenshotOpacity = interpolate(screenshotProgress, [0, 1], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // 标题淡入
  const captionProgress = interpolate(frame - 20, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  return (
    <SafeZone background={config.background}>
      <div
        style={{
          transform: `scale(${screenshotScale})`,
          opacity: screenshotOpacity,
        }}
      >
        {/* Screenshot Container */}
        <div
          style={{
            background: style === 'saas' || style === 'corporate' ? '#fff' : 'transparent',
            borderRadius: style === 'neon' ? 16 : 24,
            padding: style === 'neon' ? 12 : 20,
            border: style === 'neon' ? `2px solid #00ffff` : 'none',
            boxShadow: style === 'neon' ? config.glow : (config as any).shadow || '0 8px 32px rgba(0, 0, 0, 0.2)',
          }}
        >
          <img
            src={src}
            alt="Screenshot"
            style={{
              width: 800,
              height: 'auto',
              borderRadius: style === 'neon' ? 8 : 12,
              display: 'block',
            }}
          />
        </div>

        {/* Caption */}
        {caption && (
          <p
            style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: 18,  // 最小字号边界
              color: config.textMuted,
              textAlign: 'center',
              marginTop: 24,
              opacity: captionProgress,
            }}
          >
            {caption}
          </p>
        )}
      </div>
    </SafeZone>
  );
};

export default Screenshot;