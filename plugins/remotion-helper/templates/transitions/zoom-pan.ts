import {interpolate, Easing} from 'remotion';

/**
 * Zoom + Pan Transition
 *
 * 缩放 + 平移的组合转场效果
 * 适用于截图和图片展示之间的切换
 */

interface ZoomPanConfig {
  startScale: number;      // 起始缩放比例
  endScale: number;        // 结束缩放比例
  startX: number;          // 起始 X 坐标（像素）
  endX: number;            // 结束 X 坐标（像素）
  startY: number;          // 起始 Y 坐标（像素）
  endY: number;            // 结束 Y 坐标（像素）
  durationInFrames: number;
}

/**
 * 计算缩放平移的样式值
 */
export function zoomPan(
  frame: number,
  config: ZoomPanConfig = {
    startScale: 1.5,
    endScale: 1,
    startX: 100,
    endX: 0,
    startY: 50,
    endY: 0,
    durationInFrames: 30,
  }
): {transform: string; opacity: number} {
  const progress = interpolate(frame, [0, config.durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  const scale = interpolate(progress, [0, 1], [config.startScale, config.endScale]);
  const x = interpolate(progress, [0, 1], [config.startX, config.endX]);
  const y = interpolate(progress, [0, 1], [config.startY, config.endY]);

  // 淡入配合缩放
  const opacity = interpolate(frame, [0, config.durationInFrames * 0.5], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return {
    transform: `scale(${scale}) translate(${x}px, ${y}px)`,
    opacity,
  };
}

/**
 * 缩放平移淡出
 */
export function zoomPanOut(
  frame: number,
  totalDuration: number,
  config: ZoomPanConfig = {
    startScale: 1,
    endScale: 1.5,
    startX: 0,
    endX: -100,
    startY: 0,
    endY: -50,
    durationInFrames: 30,
  }
): {transform: string; opacity: number} {
  const progress = interpolate(
    frame,
    [totalDuration - config.durationInFrames, totalDuration],
    [1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.cubic),
    }
  );

  const scale = interpolate(progress, [0, 1], [config.endScale, config.startScale]);
  const x = interpolate(progress, [0, 1], [config.endX, config.startX]);
  const y = interpolate(progress, [0, 1], [config.endY, config.startY]);

  // 淡出
  const opacity = interpolate(
    frame,
    [totalDuration - config.durationInFrames, totalDuration],
    [1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  return {
    transform: `scale(${scale}) translate(${x}px, ${y}px)`,
    opacity,
  };
}

/**
 * 预设配置
 */
export const zoomPanPresets = {
  // 从左上角缩放进入
  zoomInFromLeft: {
    startScale: 1.3,
    endScale: 1,
    startX: 80,
    endX: 0,
    startY: 40,
    endY: 0,
    durationInFrames: 30,
  },
  // 从右下角缩放进入
  zoomInFromRight: {
    startScale: 1.3,
    endScale: 1,
    startX: -80,
    endX: 0,
    startY: -40,
    endY: 0,
    durationInFrames: 30,
  },
  // 中心缩放进入（Ken Burns 效果）
  kenBurnsIn: {
    startScale: 1.2,
    endScale: 1,
    startX: 0,
    endX: 0,
    startY: 0,
    endY: 0,
    durationInFrames: 45,
  },
  // 慢速缩放平移
  slowZoomPan: {
    startScale: 1.5,
    endScale: 1,
    startX: 150,
    endX: 0,
    startY: 75,
    endY: 0,
    durationInFrames: 60,
  },
  // 快速缩放
  quickZoom: {
    startScale: 2,
    endScale: 1,
    startX: 0,
    endX: 0,
    startY: 0,
    endY: 0,
    durationInFrames: 20,
  },
};

export default zoomPan;