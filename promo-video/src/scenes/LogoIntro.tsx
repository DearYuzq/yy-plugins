import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { SafeZone } from '../components/SafeZone';
import { techPalette, techFonts, techAnimation, fontSize } from '../styles/tech';

interface LogoIntroProps {
  name: string;
  tagline: string;
}

/**
 * Scene 1 (0-4s): Logo bounce intro
 * Animation: spring bounce
 */
export const LogoIntro: React.FC<LogoIntroProps> = ({ name, tagline }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Calculate duration based on scene timing
  const sceneDuration = 4 * fps;
  const progress = Math.min(frame / sceneDuration, 1);

  // Spring animation for logo bounce
  const logoY = spring({
    frame,
    fps,
    config: {
      damping: techAnimation.damping,
      stiffness: techAnimation.stiffness,
      mass: techAnimation.mass,
    },
    from: -200,
    to: 0,
  });

  // Fade in animation
  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Subtitle fade in with delay
  const subtitleOpacity = interpolate(frame, [15, 25], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Scale animation for logo
  const scale = spring({
    frame,
    fps,
    config: {
      damping: techAnimation.damping,
      stiffness: techAnimation.stiffness,
      mass: techAnimation.mass,
    },
    from: 0.5,
    to: 1,
  });

  return (
    <AbsoluteFill
      style={{
        background: techPalette.backgroundGradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <SafeZone
        style={{
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Logo Container */}
        <div
          style={{
            transform: `translateY(${logoY}px) scale(${scale})`,
            opacity,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Logo Icon */}
          <div
            style={{
              width: 120,
              height: 120,
              background: `linear-gradient(135deg, ${techPalette.primary} 0%, ${techPalette.secondary} 100%)`,
              borderRadius: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 32,
              boxShadow: `0 0 60px ${techPalette.primary}40`,
            }}
          >
            <span
              style={{
                fontSize: 60,
                fontWeight: 'bold',
                color: techPalette.text,
              }}
            >
              Y
            </span>
          </div>

          {/* Project Name */}
          <h1
            style={{
              fontFamily: techFonts.title,
              fontSize: fontSize.heroTitle,
              fontWeight: 'bold',
              color: techPalette.text,
              margin: 0,
              letterSpacing: -2,
              textShadow: `0 0 40px ${techPalette.primary}60`,
            }}
          >
            {name}
          </h1>

          {/* Tagline */}
          <p
            style={{
              fontFamily: techFonts.body,
              fontSize: fontSize.body,
              color: techPalette.textMuted,
              marginTop: 16,
              opacity: subtitleOpacity,
            }}
          >
            {tagline}
          </p>
        </div>
      </SafeZone>
    </AbsoluteFill>
  );
};

export default LogoIntro;