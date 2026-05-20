/**
 * Spacing System - 统一间距系统
 *
 * 用于保持视觉一致性的间距规范。
 * 基于 8px 基准单位。
 */

export const spacing = {
  xs: 8,     // 极小间距（图标内部）
  sm: 16,    // 小间距（元素之间）
  md: 24,    // 中间距（组件内部）
  lg: 32,    // 大间距（组件之间）
  xl: 48,    // 超大间距（区块之间）
  xxl: 64,   // 巨大间距（章节之间）
};

/**
 * 安全区边距（10% 标准）
 */
export const safeZone = {
  horizontal: 192,  // 1920x1080 下的 10%
  vertical: 108,    // 1920x1080 下的 10%
};

/**
 * 视频尺寸标准
 */
export const videoSizes = {
  hd: {width: 1920, height: 1080},   // Full HD
  uhd: {width: 3840, height: 2160},  // 4K
  mobile: {width: 1080, height: 1920}, // 竖屏 9:16
};

/**
 * 最小字号规范
 *
 * Remotion 最佳实践：
 * - 标题 ≥ 56px
 * - 正文 ≥ 24px
 * - 小字 ≥ 18px（绝对最小）
 */
export const minFontSize = {
  headline: 56,
  body: 24,
  small: 18,
  code: 18,  // 代码字体可以稍小
};

/**
 * 计算响应式间距（基于视频宽度）
 */
export const getResponsiveSpacing = (
  baseSpacing: number,
  videoWidth: number,
  baseWidth: number = 1920
) => {
  return Math.round(baseSpacing * (videoWidth / baseWidth));
};

/**
 * 计算响应式字号（基于视频宽度）
 */
export const getResponsiveFontSize = (
  baseFontSize: number,
  videoWidth: number,
  baseWidth: number = 1920
) => {
  const scaled = Math.round(baseFontSize * (videoWidth / baseWidth));
  // 确保不低于最小字号
  if (baseFontSize >= minFontSize.headline) {
    return Math.max(scaled, minFontSize.headline);
  }
  if (baseFontSize >= minFontSize.body) {
    return Math.max(scaled, minFontSize.body);
  }
  return Math.max(scaled, minFontSize.small);
};

export default spacing;