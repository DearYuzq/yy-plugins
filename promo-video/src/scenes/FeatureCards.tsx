import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { SafeZone } from '../components/SafeZone';
import { techPalette, techFonts, techAnimation, fontSize } from '../styles/tech';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface FeatureCardsProps {
  features: Feature[];
  title: string;
}

/**
 * Scene 3 (10-20s): Feature Cards
 * Animation: Cards enter sequentially (stagger)
 * Shows first 3 features prominently
 */
export const FeatureCards: React.FC<FeatureCardsProps> = ({ features, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title animation
  const titleY = spring({
    frame,
    fps,
    config: {
      damping: techAnimation.damping,
      stiffness: techAnimation.stiffness,
      mass: techAnimation.mass,
    },
    from: -100,
    to: 0,
  });

  const titleOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Use first 3 features for main showcase
  const showcaseFeatures = features.slice(0, 3);

  return (
    <AbsoluteFill
      style={{
        background: techPalette.backgroundGradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Decorative background elements */}
      <div
        style={{
          position: 'absolute',
          top: 100,
          right: 100,
          width: 400,
          height: 400,
          background: `radial-gradient(circle, ${techPalette.primary}20, transparent 70%)`,
          borderRadius: '50%',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 100,
          left: 100,
          width: 300,
          height: 300,
          background: `radial-gradient(circle, ${techPalette.secondary}15, transparent 70%)`,
          borderRadius: '50%',
        }}
      />

      <SafeZone
        style={{
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Section Title */}
        <div
          style={{
            transform: `translateY(${titleY}px)`,
            opacity: titleOpacity,
            marginBottom: 60,
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
            }}
          >
            {title}
          </h2>
          <div
            style={{
              width: 80,
              height: 4,
              background: `linear-gradient(90deg, ${techPalette.primary}, ${techPalette.accent})`,
              marginTop: 16,
              marginLeft: 'auto',
              marginRight: 'auto',
              borderRadius: 2,
            }}
          />
        </div>

        {/* Feature Cards Grid */}
        <div
          style={{
            display: 'flex',
            gap: 32,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {showcaseFeatures.map((feature, index) => {
            const delay = index * 8;

            // Card entrance animation
            const cardY = spring({
              frame,
              fps,
              config: {
                damping: techAnimation.damping,
                stiffness: techAnimation.stiffness,
                mass: techAnimation.mass,
              },
              from: 200,
              to: 0,
              delay,
            });

            const cardOpacity = interpolate(frame, [delay, delay + 10], [0, 1], {
              extrapolateRight: 'clamp',
            });

            const cardScale = spring({
              frame,
              fps,
              config: {
                damping: techAnimation.damping,
                stiffness: techAnimation.stiffness,
                mass: techAnimation.mass,
              },
              from: 0.8,
              to: 1,
              delay,
            });

            return (
              <div
                key={feature.title}
                style={{
                  width: 380,
                  transform: `translateY(${cardY}px) scale(${cardScale})`,
                  opacity: cardOpacity,
                  background: techPalette.cardBg,
                  borderRadius: 20,
                  border: `1px solid ${techPalette.border}`,
                  padding: 32,
                  boxShadow: `0 20px 60px ${techPalette.primary}20`,
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    fontSize: 48,
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

export default FeatureCards;