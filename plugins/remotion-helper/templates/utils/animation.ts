/**
 * Animation Utilities - 动画参数工具函数
 *
 * 统一管理各风格的动画参数，避免硬编码。
 * 支持 9 种风格：tech, saas, open-source, minimal, neon, corporate, brutalist, editorial, ethereal
 *
 * 设计参数体系（继承 taste-skill）：
 * - DESIGN_VARIANCE: 8 (1=对称, 10=艺术混沌)
 * - MOTION_INTENSITY: 6 (1=静态, 10=电影级)
 * - VISUAL_DENSITY: 4 (1=画廊, 10=驾驶舱)
 */

import {SpringConfig} from 'remotion';

/**
 * 各风格的动画参数配置
 */
export const animationConfigs: Record<string, SpringConfig> = {
  tech: {
    stiffness: 200,
    damping: 15,
    mass: 1,
  },
  saas: {
    stiffness: 100,
    damping: 20,
    mass: 1,
  },
  'open-source': {
    stiffness: 150,
    damping: 15,
    mass: 1,
  },
  minimal: {
    stiffness: 80,
    damping: 20,
    mass: 1.5,
  },
  neon: {
    stiffness: 300,
    damping: 10,
    mass: 0.5,
  },
  corporate: {
    stiffness: 100,
    damping: 18,
    mass: 1,
  },
  // 新增 3 种高端风格
  brutalist: {
    stiffness: 220,
    damping: 12,
    mass: 0.9,
  },
  editorial: {
    stiffness: 80,
    damping: 22,
    mass: 1.2,
  },
  ethereal: {
    stiffness: 60,
    damping: 25,
    mass: 1.5,
  },
};

/**
 * 获取风格对应的动画配置
 */
export const getAnimationConfig = (style: string): SpringConfig => {
  return animationConfigs[style] || animationConfigs.tech;
};

/**
 * 入场动画参数（更快速）
 */
export const entryAnimation: Record<string, SpringConfig> = {
  tech: {stiffness: 250, damping: 12, mass: 0.8},
  saas: {stiffness: 120, damping: 18, mass: 0.8},
  'open-source': {stiffness: 180, damping: 12, mass: 0.8},
  minimal: {stiffness: 100, damping: 22, mass: 1.2},
  neon: {stiffness: 350, damping: 8, mass: 0.4},
  corporate: {stiffness: 120, damping: 16, mass: 0.8},
  brutalist: {stiffness: 260, damping: 10, mass: 0.8},
  editorial: {stiffness: 100, damping: 24, mass: 1.0},
  ethereal: {stiffness: 80, damping: 26, mass: 1.2},
};

/**
 * 出场动画参数（更柔和）
 */
export const exitAnimation: Record<string, SpringConfig> = {
  tech: {stiffness: 150, damping: 20, mass: 1.2},
  saas: {stiffness: 80, damping: 25, mass: 1.2},
  'open-source': {stiffness: 120, damping: 18, mass: 1.2},
  minimal: {stiffness: 60, damping: 25, mass: 2},
  neon: {stiffness: 200, damping: 15, mass: 0.8},
  corporate: {stiffness: 80, damping: 22, mass: 1.2},
  brutalist: {stiffness: 180, damping: 14, mass: 1.0},
  editorial: {stiffness: 60, damping: 26, mass: 1.5},
  ethereal: {stiffness: 50, damping: 28, mass: 1.8},
};

/**
 * 脉冲动画参数
 *
 * @param frame 当前帧
 * @param frequency 频率（推荐 0.05-0.08，约 1.5-2.5Hz）
 * @param amplitude 振幅（推荐 0.05-0.1）
 */
export const getPulseValue = (
  frame: number,
  frequency: number = 0.05,
  amplitude: number = 0.05
): number => {
  return Math.sin(frame * frequency) * amplitude + 1;
};

/**
 * 缓慢脉冲（适合 CTA 按钮）
 */
export const slowPulse = (frame: number): number => {
  return getPulseValue(frame, 0.05, 0.05); // 约 1.5Hz
};

/**
 * 快速脉冲（适合霓虹效果）
 */
export const fastPulse = (frame: number): number => {
  return getPulseValue(frame, 0.08, 0.08); // 约 2.5Hz
};

/**
 * 霓虹发光效果参数
 */
export const neonGlowIntensity = (frame: number): number => {
  // 使用脉冲来动态调整发光强度
  return Math.sin(frame * 0.1) * 10 + 20; // 10-30px 范围
};

/**
 * 渐变动画角度
 *
 * @param frame 当前帧
 * @param startAngle 起始角度（度）
 * @param endAngle 结束角度（度）
 * @param durationInFrames 动画时长
 */
export const getGradientAngle = (
  frame: number,
  startAngle: number = 135,
  endAngle: number = 225,
  durationInFrames: number = 900
): number => {
  const progress = Math.min(frame / durationInFrames, 1);
  return startAngle + (endAngle - startAngle) * progress;
};

/**
 * 模糊入场效果
 *
 * @param frame 当前帧
 * @param durationInFrames 模糊消失时长
 * @param maxBlur 最大模糊值（px）
 */
export const getBlurValue = (
  frame: number,
  durationInFrames: number = 30,
  maxBlur: number = 10
): number => {
  const progress = Math.min(frame / durationInFrames, 1);
  return maxBlur * (1 - progress);
};

export default animationConfigs;