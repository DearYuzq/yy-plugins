/**
 * Root Component - 视频根组件
 *
 * 组装所有场景组件，使用 Sequence 控制时间线。
 * 每个场景是一个独立的 Sequence，按顺序播放。
 */

import React from 'react';
import {Composition, Sequence} from 'remotion';

// 场景组件导入（实际使用时由 promo-director 替换）
import {LogoIntro} from './scenes/LogoIntro';
import {ValueProp} from './scenes/ValueProp';
import {FeatureCards} from './scenes/FeatureCards';
import {Screenshot} from './scenes/Screenshot';
import {CTAOutro} from './scenes/CTAOutro';

// 项目信息（由 promo-director 根据用户项目生成）
const projectInfo = {
  name: 'Your Project',
  tagline: 'A powerful tool for modern development',
  description: 'Build faster, deploy smarter',
  features: [
    {title: 'Fast', description: 'Lightning quick performance'},
    {title: 'Reliable', description: 'Built for production'},
    {title: 'Modern', description: 'Latest tech stack'},
  ],
  logo: '/assets/logo.png',
  screenshots: ['/assets/screenshot.png'],
};

// 风格配置（由用户选择）
const style = 'tech'; // 'tech' | 'saas' | 'open-source' | 'minimal' | 'neon' | 'corporate' | 'brutalist' | 'editorial' | 'ethereal'

// 视频总时长（帧数 @ 30fps）
// 15秒 = 450帧
// 30秒 = 900帧
// 60秒 = 1800帧
const TOTAL_FRAMES = 900; // 30 seconds

/**
 * Root 组件 - 视频组装
 *
 * 时间线结构：
 * Scene 1 (0-4s): Logo 入场
 * Scene 2 (4-10s): 价值主张
 * Scene 3 (10-20s): 产品演示/截图
 * Scene 4 (20-25s): 功能列表
 * Scene 5 (25-30s): CTA 结尾
 */
export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="PromoVideo"
        component={PromoVideo}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          projectInfo,
          style,
        }}
      />
    </>
  );
};

/**
 * PromoVideo 主视频组件
 */
interface PromoVideoProps {
  projectInfo: typeof projectInfo;
  style: string;
}

const PromoVideo: React.FC<PromoVideoProps> = ({projectInfo, style}) => {
  return (
    <div style={{background: '#000'}}>
      {/* Scene 1: Logo Intro (0-4s = 0-120 frames) */}
      <Sequence from={0} durationInFrames={120}>
        <LogoIntro
          logo={projectInfo.logo}
          title={projectInfo.name}
          subtitle={projectInfo.tagline}
          style={style as any}
        />
      </Sequence>

      {/* Scene 2: Value Prop (4-10s = 120-300 frames) */}
      <Sequence from={120} durationInFrames={180}>
        <ValueProp
          headline={projectInfo.tagline}
          description={projectInfo.description}
          style={style as any}
        />
      </Sequence>

      {/* Scene 3: Screenshot (10-20s = 300-600 frames) */}
      <Sequence from={300} durationInFrames={300}>
        <Screenshot
          src={projectInfo.screenshots[0]}
          caption="Product Overview"
          style={style as any}
        />
      </Sequence>

      {/* Scene 4: Features (20-25s = 600-750 frames) */}
      <Sequence from={600} durationInFrames={150}>
        <FeatureCards
          features={projectInfo.features}
          style={style as any}
        />
      </Sequence>

      {/* Scene 5: CTA Outro (25-30s = 750-900 frames) */}
      <Sequence from={750} durationInFrames={150}>
        <CTAOutro
          text="Get Started Today"
          buttonText="Learn More"
          link="https://github.com/yourproject"
          style={style as any}
        />
      </Sequence>
    </div>
  );
};

export default Root;