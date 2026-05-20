import {interpolate, Easing, InterpolateOptions} from 'remotion';

/**
 * Interpolate 淡入淡出代码片段集合
 *
 * interpolate() 用于在值之间进行插值，常用于：
 * - 淡入淡出（opacity）
 * - 位移（translateX/Y）
 * - 缩放（scale）
 * - 旋转（rotate）
 */

// ============ 基础淡入淡出 ============

/**
 * 简单淡入
 * @param frame 当前帧
 * @param duration 淡入时长（帧数）
 */
export function fadeIn(frame: number, duration: number = 30): number {
  return interpolate(frame, [0, duration], [0, 1], {
    extrapolateRight: 'clamp'
  });
}

/**
 * 简单淡出
 * @param frame 当前帧
 * @param durationInFrames 总时长
 * @param fadeDuration 淡出时长
 */
export function fadeOut(
  frame: number,
  durationInFrames: number,
  fadeDuration: number = 30
): number {
  return interpolate(
    frame,
    [durationInFrames - fadeDuration, durationInFrames],
    [1, 0],
    {extrapolateLeft: 'clamp'}
  );
}

/**
 * 淡入 + 淡出组合
 * @param frame 当前帧
 * @param durationInFrames 总时长
 * @param fadeDuration 淡入淡出时长
 */
export function fadeInOut(
  frame: number,
  durationInFrames: number,
  fadeDuration: number = 20
): number {
  return interpolate(
    frame,
    [0, fadeDuration, durationInFrames - fadeDuration, durationInFrames],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    }
  );
}

// ============ 带 Easing 的淡入淡出 ============

/**
 * 缓出淡入（开始快，结束慢）
 */
export function easeOutFadeIn(frame: number, duration: number = 30): number {
  return interpolate(frame, [0, duration], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic)
  });
}

/**
 * 缓入淡入（开始慢，结束快）
 */
export function easeInFadeIn(frame: number, duration: number = 30): number {
  return interpolate(frame, [0, duration], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic)
  });
}

/**
 * 缓入缓出淡入
 */
export function easeInOutFadeIn(frame: number, duration: number = 30): number {
  return interpolate(frame, [0, duration], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic)
  });
}

/**
 * 贝塞尔曲线淡入
 */
export function bezierFadeIn(frame: number, duration: number = 30): number {
  return interpolate(frame, [0, duration], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.25, 0.1, 0.25, 1)  // ease-in-out 曲线
  });
}

// ============ 位移动画 ============

/**
 * 从左侧滑入
 */
export function slideInFromLeft(frame: number, distance: number = 200): number {
  return interpolate(frame, [0, 30], [-distance, 0], {
    extrapolateRight: 'clamp'
  });
}

/**
 * 从右侧滑入
 */
export function slideInFromRight(frame: number, distance: number = 200): number {
  return interpolate(frame, [0, 30], [distance, 0], {
    extrapolateRight: 'clamp'
  });
}

/**
 * 从下方滑入
 */
export function slideInFromBottom(frame: number, distance: number = 100): number {
  return interpolate(frame, [0, 30], [distance, 0], {
    extrapolateRight: 'clamp'
  });
}

// ============ 缩放动画 ============

/**
 * 从小到大缩放
 */
export function scaleIn(frame: number, fromScale: number = 0.5): number {
  return interpolate(frame, [0, 30], [fromScale, 1], {
    extrapolateRight: 'clamp'
  });
}

/**
 * 脉冲缩放（放大后缩小）
 */
export function pulseScale(
  frame: number,
  durationInFrames: number,
  maxScale: number = 1.2
): number {
  const midPoint = durationInFrames / 2;
  return interpolate(
    frame,
    [0, midPoint, durationInFrames],
    [1, maxScale, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    }
  );
}

// ============ 旋转动画 ============

/**
 * 旋转（度数）
 */
export function rotateIn(frame: number, degrees: number = 360): number {
  return interpolate(frame, [0, 60], [0, degrees], {
    extrapolateRight: 'clamp'
  });
}

// ============ 组合动画 ============

/**
 * 完整的入场动画（淡入 + 滑入 + 缩放）
 */
export function enterAnimation(frame: number) {
  const opacity = fadeIn(frame, 20);
  const translateX = slideInFromLeft(frame, 100);
  const scale = scaleIn(frame, 0.8);

  return {
    opacity,
    transform: `translateX(${translateX}px) scale(${scale})`
  };
}