/**
 * Remotion Configuration - v4 API 配置
 *
 * 注意：Remotion v4 配置 API 有变更
 * - Config.setDefaultFP() 已废弃
 * - Config.setDefaultFPS() 已废弃
 * - 使用 Config.overrideFps() 替代
 *
 * 渲染质量参数：
 * - CRF: 18 (高质量，默认 23)
 * - Preset: medium (平衡速度和质量)
 * - 分辨率: 1920x1080 (Full HD)
 */

import { Config } from '@remotion/cli/config';

// 设置默认帧率（v4.0.424+）
Config.overrideFps(30);

// 渲染质量配置（高质量输出）
// CRF 值越低质量越高：18 = 高质量，23 = 默认，28 = 低质量
Config.setCrf(18);

// x264 编码预设（仅适用于 H.264 codec，平衡速度和质量）
// 可选：ultrafast, superfast, veryfast, faster, fast, medium, slow, slower, veryslow
Config.setX264Preset('medium');

// 并发设置（根据 CPU 核心数调整）
// Config.setConcurrency(4);

// 输出格式配置
// Config.setVideoImageFormat('jpeg');
// Config.setJpegQuality(90);

// 多 pass 编码（更高质量，但渲染时间更长）
// Config.setShouldOutputImageSequence(false);