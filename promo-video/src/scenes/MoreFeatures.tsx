import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { SafeZone } from '../components/SafeZone';
import { techPalette, techFonts, techAnimation, fontSize } from '../styles/tech';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface MoreFeaturesProps {
  features: Feature[];
}

/**
 * Scene 4 (20-25s): More Features
 * Animation: Scale + Fade in
 * Shows remaining features (4 and 5)
 */
export const MoreFeatures: React.FC<MoreFeaturesProps> = ({ features }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background decoration animation
  const bgOpacity = interpolate(frame, [0, 20], [0, 0.5], {
    extrapolateRight: 'clamp',
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
      {/* Decorative elements */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: 2,
          top: '50%',
          background: `linear-gradient(90deg, transparent, ${techPalette.primary}${Math.floor(bgOpacity * 100)}, transparent)`,
          transform: 'translateY(-50%)',
        }}
      />

      <SafeZone
        style={{
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 80,
            justifyContent: 'center',
          }}
        >
          {features.map((feature, index) => {
            const delay = index * 8;

            // Card entrance animation
            const cardScale = spring({
              frame,
              fps,
              config: {
                damping: techAnimation.damping,
                stiffness: techAnimation.stiffness,
                mass: techAnimation.mass,
              },
              from: 0,
              to: 1,
              delay,
            });

            const cardOpacity = interpolate(frame, [delay, delay + 15], [0, 1], {
              extrapolateRight: 'clamp',
            });

            return (
              <div
                key={feature.title}
                style={{
                  transform: `scale(${cardScale})`,
                  opacity: cardOpacity,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: '40px 60px',
                  background: `${techPalette.cardBg}80`,
                  borderRadius: 24,
                  border: `1px solid ${techPalette.border}`,
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    fontSize: 64,
                    marginBottom: 20,
                  }}
                >
                  {feature.icon}
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontFamily: techFonts.title,
                    fontSize: fontSize.featureTitle,
                    fontWeight: 'bold',
                    color: techPalette.text,
                    margin: 0,
                    marginBottom: 12,
                  }}
                >
                  {feature.title}
                </h3>

                {/* Description */}
                <p
                  style={{
                    fontFamily: techFonts.body,
                    fontSize: fontSize.featureDesc,
                    color: techPalette.textMuted,
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </SafeZone>
    </AbsoluteFill>
  );
};

export default MoreFeatures;