import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { SafeZone } from '../components/SafeZone';
import { techPalette, techFonts, techAnimation, fontSize } from '../styles/tech';

interface ValuePropProps {
  title: string;
  description: string;
}

/**
 * Scene 2 (4-10s): Value Proposition
 * Animation: Slide in + Fade in
 */
export const ValueProp: React.FC<ValuePropProps> = ({ title, description }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slide in from left
  const titleX = spring({
    frame,
    fps,
    config: {
      damping: techAnimation.damping,
      stiffness: techAnimation.stiffness,
      mass: techAnimation.mass,
    },
    from: -500,
    to: 0,
  });

  // Fade in for title
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Description slide in from right with delay
  const descX = spring({
    frame,
    fps,
    config: {
      damping: techAnimation.damping,
      stiffness: techAnimation.stiffness,
      mass: techAnimation.mass,
    },
    from: 500,
    to: 0,
    delay: 10,
  });

  const descOpacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Background particles effect
  const particles = Array.from({ length: 6 }, (_, i) => i);

  return (
    <AbsoluteFill
      style={{
        background: techPalette.backgroundGradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Decorative particles */}
      {particles.map((i) => {
        const delay = i * 5;
        const particleY = interpolate(
          frame,
          [delay, delay + 60],
          [1080 + i * 100, -100],
          { extrapolate: 'clamp' }
        );
        const particleOpacity = interpolate(
          frame,
          [delay, delay + 10, delay + 50, delay + 60],
          [0, 0.3, 0.3, 0],
          { extrapolate: 'clamp' }
        );

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${15 + i * 15}%`,
              top: particleY,
              width: 4,
              height: 60,
              background: techPalette.primary,
              opacity: particleOpacity,
              borderRadius: 2,
            }}
          />
        );
      })}

      <SafeZone
        style={{
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Main Title */}
        <div
          style={{
            transform: `translateX(${titleX}px)`,
            opacity: titleOpacity,
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontFamily: techFonts.title,
              fontSize: fontSize.sceneTitle,
              fontWeight: 'bold',
              color: techPalette.text,
              margin: 0,
              marginBottom: 24,
              letterSpacing: -1,
              background: `linear-gradient(135deg, ${techPalette.text} 0%, ${techPalette.primary} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {title}
          </h2>
        </div>

        {/* Description */}
        <div
          style={{
            transform: `translateX(${descX}px)`,
            opacity: descOpacity,
            maxWidth: 1200,
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: techFonts.body,
              fontSize: fontSize.body,
              color: techPalette.textMuted,
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            {description}
          </p>
        </div>

        {/* Decorative line */}
        <div
          style={{
            width: interpolate(frame, [20, 40], [0, 200], { extrapolateRight: 'clamp' }),
            height: 3,
            background: `linear-gradient(90deg, ${techPalette.primary}, ${techPalette.secondary})`,
            marginTop: 48,
            borderRadius: 2,
          }}
        />
      </SafeZone>
    </AbsoluteFill>
  );
};

export default ValueProp;