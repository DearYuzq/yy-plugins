import {spring, SpringConfig} from 'remotion';

/**
 * Spring 动画代码片段集合
 *
 * spring() 是基于物理的动画函数，模拟弹簧运动。
 * 参数：stiffness（刚度）、damping（阻尼）、mass（质量）
 */

// ============ 预设配置 ============

/** 快速弹性 - 快速到达目标，有轻微弹跳 */
export const SPRING_BOUNCY: SpringConfig = {
  stiffness: 200,
  damping: 15,
  mass: 1
};

/** 柔和弹跳 - 慢速、柔和的弹跳效果 */
export const SPRING_SOFT: SpringConfig = {
  stiffness: 80,
  damping: 8,
  mass: 1.5
};

/** 无弹跳 - 平滑到达目标，不超出 */
export const SPRING_SMOOTH: SpringConfig = {
  stiffness: 100,
  damping: 20,
  mass: 1
};

/** 夸张效果 - 高弹性、明显弹跳 */
export const SPRING_DRAMATIC: SpringConfig = {
  stiffness: 300,
  damping: 5,
  mass: 0.5
};

/** 慢动作 - 慢速、平滑 */
export const SPRING_SLOW: SpringConfig = {
  stiffness: 50,
  damping: 10,
  mass: 2
};

// ============ 使用示例 ============

/**
 * 基础 spring 动画
 */
export function basicSpringExample(frame: number, fps: number) {
  return spring({
    frame,
    fps,
    config: SPRING_BOUNCY
  });
}

/**
 * 指定时长的 spring 动画
 * 动画将被拉伸/压缩以匹配指定帧数
 */
export function timedSpringExample(frame: number, fps: number) {
  return spring({
    frame,
    fps,
    durationInFrames: 40,  // 动画在 40 帧内完成
    config: SPRING_SMOOTH
  });
}

/**
 * 延迟开始的 spring 动画
 */
export function delayedSpringExample(frame: number, fps: number) {
  return spring({
    frame,
    fps,
    delay: 20,  // 前 20 帧保持初始值
    config: SPRING_SOFT
  });
}

/**
 * 反向 spring 动画
 */
export function reverseSpringExample(frame: number, fps: number) {
  return spring({
    frame,
    fps,
    reverse: true,  // 从 1 到 0
    config: SPRING_BOUNCY
  });
}

/**
 * 自定义起止值
 */
export function customRangeSpringExample(frame: number, fps: number) {
  return spring({
    frame,
    fps,
    from: 100,  // 起始值
    to: 500,    // 结束值
    config: SPRING_DRAMATIC
  });
}

/**
 * 防止超出目标值
 * overshootClamping: true 确保值不会超过 to
 */
export function clampedSpringExample(frame: number, fps: number) {
  return spring({
    frame,
    fps,
    config: {
      ...SPRING_BOUNCY,
      overshootClamping: true  // 不会超过 1
    }
  });
}

// ============ 组合动画 ============

/**
 * 多个 spring 组合（X 和 Y 方向不同速度）
 */
export function multiAxisSpringExample(frame: number, fps: number) {
  const x = spring({
    frame,
    fps,
    config: {stiffness: 200, damping: 15}  // 快速 X
  });

  const y = spring({
    frame,
    fps,
    config: {stiffness: 80, damping: 10}   // 慢速 Y
  });

  return {x, y};
}