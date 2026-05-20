/**
 * Remotion Configuration - 正确的 v4 API
 *
 * 注意：Remotion v4 配置 API 有变更
 * - Config.setDefaultFP() 已废弃
 * - Config.setDefaultFPS() 已废弃
 * - 使用 Config.overrideFps() 替代
 */

import { Config } from '@remotion/cli/config';

// 设置默认帧率（v4.0.424+）
Config.overrideFps(30);

// 可选配置
// Config.setVideoImageFormat('jpeg');
// Config.setConcurrency(4);