import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';

/**
 * Safe Zone Component - 安全区容器
 *
 * 确保所有内容都在可视区域内，不会被裁剪。
 * Remotion 最佳实践：距边缘至少 10%。
 *
 * 对于 1920x1080:
 * - 水平边距: 192px (10%)
 * - 垂直边距: 108px (10%)
 */

interface SafeZoneProps {
  children: React.ReactNode;
  horizontalMargin?: number;  // 百分比，默认 10% = 0.1
  verticalMargin?: number;    // 百分比，默认 10% = 0.1
  background?: string;        // 可选背景色
  style?: React.CSSProperties; // 额外样式
}

export const SafeZone: React.FC<SafeZoneProps> = ({
  children,
  horizontalMargin = 0.1,
  verticalMargin = 0.1,
  background,
  style,
}) => {
  const {width, height} = useVideoConfig();

  // 计算实际像素边距
  const hPadding = Math.round(horizontalMargin * width);
  const vPadding = Math.round(verticalMargin * height);

  return (
    <AbsoluteFill
      style={{
        padding: `${vPadding}px ${hPadding}px`,
        boxSizing: 'border-box',
        background,
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/**
 * Safe Zone for Mobile/Vertical Video (9:16)
 *
 * 对于 1080x1920（竖屏视频）:
 * - 顶部安全区: 150px（避开状态栏、搜索栏）
 * - 底部安全区: 170px（避开导航按钮、swipe-up UI）
 * - 侧边安全区: 60px
 */
interface MobileSafeZoneProps {
  children: React.ReactNode;
  topMargin?: number;   // 默认 150px
  bottomMargin?: number; // 默认 170px
  sideMargin?: number;   // 默认 60px
  background?: string;
  style?: React.CSSProperties;
}

export const MobileSafeZone: React.FC<MobileSafeZoneProps> = ({
  children,
  topMargin = 150,
  bottomMargin = 170,
  sideMargin = 60,
  background,
  style,
}) => {
  return (
    <AbsoluteFill
      style={{
        padding: `${topMargin}px ${sideMargin}px ${bottomMargin}px`,
        boxSizing: 'border-box',
        background,
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/**
 * 计算安全区尺寸
 */
export const getSafeZoneDimensions = (
  width: number,
  height: number,
  horizontalMargin: number = 0.1,
  verticalMargin: number = 0.1
) => {
  return {
    contentWidth: width - (2 * horizontalMargin * width),
    contentHeight: height - (2 * verticalMargin * height),
    horizontalPadding: Math.round(horizontalMargin * width),
    verticalPadding: Math.round(verticalMargin * height),
  };
};

export default SafeZone;