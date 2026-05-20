/**
 * Remotion Entry Point - Composition 注册入口
 *
 * 这是 Remotion 项目的入口文件，注册所有视频 Composition。
 * 运行 `npx remotion studio` 可预览，`npx remotion render` 可渲染输出。
 */

import {registerRoot} from 'remotion';
import {Root} from './Root';

registerRoot(Root);