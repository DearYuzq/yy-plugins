import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { LogoIntro } from './scenes/LogoIntro';
import { ValueProp } from './scenes/ValueProp';
import { FeatureCards } from './scenes/FeatureCards';
import { MoreFeatures } from './scenes/MoreFeatures';
import { CTAOutro } from './scenes/CTAOutro';
import { techPalette } from './styles/tech';

/**
 * Main promotional video component
 * Total duration: 30 seconds @ 30fps = 900 frames
 *
 * Scene timing:
 * - Scene 1 (0-4s): Logo Intro
 * - Scene 2 (4-10s): Value Proposition
 * - Scene 3 (10-20s): Feature Cards
 * - Scene 4 (20-25s): More Features
 * - Scene 5 (25-30s): CTA Outro
 */
export const PromoVideo: React.FC = () => {
  const { fps } = useVideoConfig();

  // Scene timings in frames (at 30fps)
  const scene1Start = 0;
  const scene2Start = 4 * fps; // 4s
  const scene3Start = 10 * fps; // 10s
  const scene4Start = 20 * fps; // 20s
  const scene5Start = 25 * fps; // 25s

  // Scene durations
  const scene1Duration = 4 * fps;
  const scene2Duration = 6 * fps;
  const scene3Duration = 10 * fps;
  const scene4Duration = 5 * fps;
  const scene5Duration = 5 * fps;

  // Project info
  const projectInfo = {
    name: 'yuzq-plugins',
    tagline: 'Claude Code 插件市场',
    title: '一站式插件开发与分发平台',
    description: '包含多个可分发的 Claude Code 插件，支持 SDD/TDD 开发工作流、交互式插件构建等功能',
    features: [
      { icon: '🚀', title: 'ai-dev-create', description: 'SDD/TDD 开发工作流' },
      { icon: '🔧', title: 'plugin-builder', description: '交互式插件构建器' },
      { icon: '🎬', title: 'remotion-helper', description: '视频自动生成器' },
      { icon: '📝', title: 'claude-init', description: 'CLAUDE.md 规则管理' },
      { icon: '📦', title: 'demo-plugin', description: '示例插件模板' },
    ],
    ctaText: '开始构建你的插件',
    buttonText: '访问 GitHub',
    link: 'github.com/DearYuzq/yy-plugins',
  };

  return (
    <AbsoluteFill
      style={{
        background: techPalette.background,
      }}
    >
      {/* Scene 1: Logo Intro (0-4s) */}
      <Sequence
        from={scene1Start}
        durationInFrames={scene1Duration}
        name="Logo Intro"
      >
        <LogoIntro
          name={projectInfo.name}
          tagline={projectInfo.tagline}
        />
      </Sequence>

      {/* Scene 2: Value Proposition (4-10s) */}
      <Sequence
        from={scene2Start}
        durationInFrames={scene2Duration}
        name="Value Proposition"
      >
        <ValueProp
          title={projectInfo.title}
          description={projectInfo.description}
        />
      </Sequence>

      {/* Scene 3: Feature Cards (10-20s) */}
      <Sequence
        from={scene3Start}
        durationInFrames={scene3Duration}
        name="Feature Cards"
      >
        <FeatureCards
          features={projectInfo.features}
          title="核心插件"
        />
      </Sequence>

      {/* Scene 4: More Features (20-25s) */}
      <Sequence
        from={scene4Start}
        durationInFrames={scene4Duration}
        name="More Features"
      >
        <MoreFeatures
          features={projectInfo.features.slice(3, 5)}
        />
      </Sequence>

      {/* Scene 5: CTA Outro (25-30s) */}
      <Sequence
        from={scene5Start}
        durationInFrames={scene5Duration}
        name="CTA Outro"
      >
        <CTAOutro
          ctaText={projectInfo.ctaText}
          buttonText={projectInfo.buttonText}
          link={projectInfo.link}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export default PromoVideo;