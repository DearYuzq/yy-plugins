import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, useVideo } from 'remotion';
import { SafeZone } from '../components/SafeZone';
import { techPalette, techFonts, techAnimation, fontSize } from '../styles/tech';

interface CTAOutroProps {
  ctaText: string;
  buttonText: string;
  link: string;
}

/**
 * Scene 5 (25-30s): CTA Outro
 * Animation: Pulsing effect (frequency <= 0.05)
 */
export const CTAOutro: React.FC<CTAOutroProps> = ({ ctaText, buttonText, link }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Main content fade in
  const contentOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const contentY = spring({
    frame,
    fps,
    config: {
      damping: techAnimation.damping,
      stiffness: techAnimation.stiffness,
      mass: techAnimation.mass,
    },
    from: 100,
    to: 0,
  });

  // Pulse animation for CTA button (sine wave, low frequency)
  // Frequency: 0.05 (one pulse every ~20 frames at 30fps = ~0.67s)
  const pulse = interpolate(
    frame,
    [0, 30],
    [0, Math.PI * 2 * 0.05 * 30], // Low frequency pulse
    { extrapolateRight: 'extend' }
  );

  const pulseScale = 1 + Math.sin(pulse) * 0.03; // Subtle scale change: 0.97 to 1.03

  // Glow animation for button
  const glowOpacity = 0.4 + Math.sin(pulse) * 0.2;

  // Background gradient animation
  const bgRotation = interpolate(frame, [0, 150], [0, 45], {
    extrapolateRight: 'extend',
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${bgRotation}deg, ${techPalette.background} 0%, ${techPalette.primary}20 50%, ${techPalette.secondary}10 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Animated background rings */}
      {[0, 1, 2].map((i) => {
        const ringDelay = i * 10;
        const ringScale = spring({
          frame,
          fps,
          config: {
            damping: techAnimation.damping,
            stiffness: techAnimation.stiffness,
            mass: techAnimation.mass,
          },
          from: 0,
          to: 1,
          delay: ringDelay,
        });

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: 300 + i * 150,
              height: 300 + i * 150,
              borderRadius: '50%',
              border: `2px solid ${techPalette.primary}`,
              opacity: 0.1 * (1 - i * 0.3) * ringScale,
              transform: `scale(${ringScale})`,
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
        <div
          style={{
            transform: `translateY(${contentY}px)`,
            opacity: contentOpacity,
            textAlign: 'center',
          }}
        >
          {/* CTA Title */}
          <h2
            style={{
              fontFamily: techFonts.title,
              fontSize: fontSize.ctaTitle,
              fontWeight: 'bold',
              color: techPalette.text,
              margin: 0,
              marginBottom: 48,
              textShadow: `0 0 40px ${techPalette.primary}60`,
            }}
          >
            {ctaText}
          </h2>

          {/* CTA Button with Pulse */}
          <div
            style={{
              transform: `scale(${pulseScale})`,
              display: 'inline-block',
            }}
          >
            <div
              style={{
                background: `linear-gradient(135deg, ${techPalette.primary} 0%, ${techPalette.secondary} 100%)`,
                padding: '20px 48px',
                borderRadius: 12,
                fontFamily: techFonts.body,
                fontSize: fontSize.ctaButton,
                fontWeight: 'bold',
                color: techPalette.text,
                boxShadow: `0 0 ${40 + glowOpacity * 40}px ${techPalette.primary}${Math.floor(glowOpacity * 100)}`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span>{buttonText}</span>
              <span style={{ fontSize: 24 }}>→</span>
            </div>
          </div>

          {/* Link */}
          <p
            style={{
              fontFamily: techFonts.body,
              fontSize: fontSize.bodySmall,
              color: techPalette.textMuted,
              margin: 0,
              marginTop: 32,
            }}
          >
            {link}
          </p>

          {/* Bottom decoration */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              justifyContent: 'center',
              marginTop: 48,
            }}
          >
            {['#', '#', '#'].map((_, i) => (
              <div
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background:
                    i === 0 ? techPalette.primary : i === 1 ? techPalette.secondary : techPalette.accent,
                }}
              />
            ))}
          </div>
        </div>
      </SafeZone>
    </AbsoluteFill>
  );
};

export default CTAOutro;