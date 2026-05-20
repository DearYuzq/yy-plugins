import {interpolate, Easing} from 'remotion';

/**
 * Fade + Slide Transition
 *
 * 淡入 + 横向滑入的组合转场效果
 * 适用于场景之间的切换
 */

interface FadeSlideConfig {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;       // 滑动距离（像素）
  durationInFrames: number;
}

/**
 * 计算淡入滑入的样式值
 */
export function fadeSlide(
  frame: number,
  config: FadeSlideConfig = {
    direction: 'left',
    distance: 200,
    durationInFrames: 30,
  }
): {opacity: number; transform: string} {
  const progress = interpolate(frame, [0, config.durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const opacity = progress;

  const offset = interpolate(progress, [0, 1], [config.distance, 0]);

  const transforms: Record<string, string> = {
    left: `translateX(${offset}px)`,
    right: `translateX(${-offset}px)`,
    up: `translateY(${offset}px)`,
    down: `translateY(${-offset}px)`,
  };

  return {
    opacity,
    transform: transforms[config.direction],
  };
}

/**
 * 计算淡出滑出的样式值
 */
export function fadeSlideOut(
  frame: number,
  totalDuration: number,
  config: FadeSlideConfig = {
    direction: 'right',
    distance: 200,
    durationInFrames: 30,
  }
): {opacity: number; transform: string} {
  const progress = interpolate(
    frame,
    [totalDuration - config.durationInFrames, totalDuration],
    [1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.in(Easing.cubic),
    }
  );

  const opacity = progress;

  const offset = interpolate(progress, [0, 1], [config.distance, 0]);

  const transforms: Record<string, string> = {
    left: `translateX(${-offset}px)`,
    right: `translateX(${offset}px)`,
    up: `translateY(${-offset}px)`,
    down: `translateY(${offset}px)`,
  };

  return {
    opacity,
    transform: transforms[config.direction],
  };
}

/**
 * 预设配置
 */
export const fadeSlidePresets = {
  slideInLeft: {direction: 'left', distance: 200, durationInFrames: 30},
  slideInRight: {direction: 'right', distance: 200, durationInFrames: 30},
  slideInUp: {direction: 'up', distance: 100, durationInFrames: 30},
  slideInDown: {direction: 'down', distance: 100, durationInFrames: 30},
  slowSlide: {direction: 'left', distance: 300, durationInFrames: 60},
  quickSlide: {direction: 'left', distance: 100, durationInFrames: 15},
};

export default fadeSlide;