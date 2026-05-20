/**
 * Neon Style - 霓虹风格
 *
 * 纯黑背景 + 霓虹发光效果
 * 粉紫青配色（饱和度降低），粗体字体
 * 快速闪烁动画，适合游戏/潮流产品
 *
 * 设计升级：
 * - 霓虹饱和度降低，避免刺眼
 * - 发光效果精细化（透明度控制）
 * - 字体升级：Clash Display + Cabinet Grotesk
 */

export const neonPalette = {
  background: '#000000',
  // 饱和度降低的霓虹色
  primary: '#E91E8C',        // 粉色（替代 #ff00ff，降低饱和度）
  secondary: '#00D4D4',      // 青色（替代 #00ffff）
  accent: '#FFD700',         // 黄色（替代 #ffff00）
  text: '#ffffff',
  textMuted: '#888888',
  // 精细化发光效果（透明度控制）
  glowPink: '0 0 20px rgba(233, 30, 140, 0.4), 0 0 40px rgba(233, 30, 140, 0.2)',
  glowCyan: '0 0 20px rgba(0, 212, 212, 0.4), 0 0 40px rgba(0, 212, 212, 0.2)',
  glowYellow: '0 0 20px rgba(255, 215, 0, 0.4), 0 0 40px rgba(255, 215, 0, 0.2)',
};

export const neonFonts = {
  // 字体升级：Clash Display + Cabinet Grotesk
  title: 'Clash Display, Impact, sans-serif',
  body: 'Cabinet Grotesk, Montserrat, system-ui, sans-serif',
};

export const neonAnimation = {
  stiffness: 300,
  damping: 10,
  mass: 0.5,
};

export const neonSceneStyles = {
  logoIntro: {
    container: {
      background: neonPalette.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logo: {
      width: 150,
      height: 150,
      filter: 'drop-shadow(0 0 20px currentColor)',
    },
    title: {
      fontFamily: neonFonts.title,
      fontSize: 72,
      color: neonPalette.primary,
      fontWeight: '900',
      textTransform: 'uppercase',
      textAlign: 'center',
      marginTop: 24,
      textShadow: neonPalette.glowPink,
      letterSpacing: '0.1em',
    },
    subtitle: {
      fontFamily: neonFonts.body,
      fontSize: 24,
      color: neonPalette.secondary,
      marginTop: 16,
      textShadow: neonPalette.glowCyan,
      letterSpacing: '0.2em',
    },
  },
  valueProp: {
    container: {
      background: neonPalette.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0 8%',
    },
    headline: {
      fontFamily: neonFonts.title,
      fontSize: 48,
      color: neonPalette.text,
      fontWeight: '900',
      textTransform: 'uppercase',
      textAlign: 'center',
      textShadow: '0 0 20px #ffffff80',
      letterSpacing: '0.08em',
      lineHeight: 1.1,
    },
    description: {
      fontFamily: neonFonts.body,
      fontSize: 20,
      color: neonPalette.textMuted,
      textAlign: 'center',
      marginTop: 28,
      maxWidth: '80%',
      letterSpacing: '0.1em',
    },
  },
  featureCard: {
    container: {
      background: 'transparent',
      border: `2px solid ${neonPalette.primary}`,
      borderRadius: 12,
      padding: 28,
      minWidth: 280,
      boxShadow: `inset ${neonPalette.glowPink}`,
    },
    icon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: neonPalette.secondary,
      boxShadow: neonPalette.glowCyan,
    },
    title: {
      fontFamily: neonFonts.title,
      fontSize: 20,
      color: neonPalette.primary,
      fontWeight: '800',
      textTransform: 'uppercase',
      marginTop: 20,
      textShadow: neonPalette.glowPink,
      letterSpacing: '0.1em',
    },
    description: {
      fontFamily: neonFonts.body,
      fontSize: 24,  // 提升最小字号（原 14px）
      color: neonPalette.textMuted,
      marginTop: 12,
      letterSpacing: '0.05em',
    },
  },
  screenshot: {
    container: {
      background: 'transparent',
      border: `2px solid ${neonPalette.secondary}`,
      borderRadius: 16,
      padding: 12,
      boxShadow: neonPalette.glowCyan,
    },
    image: {
      borderRadius: 8,
      width: '100%',
      height: 'auto',
    },
  },
  ctaOutro: {
    container: {
      background: neonPalette.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      fontFamily: neonFonts.title,
      fontSize: 48,
      color: neonPalette.accent,
      fontWeight: '900',
      textTransform: 'uppercase',
      textAlign: 'center',
      textShadow: neonPalette.glowYellow,
      letterSpacing: '0.1em',
    },
    button: {
      backgroundColor: 'transparent',
      color: neonPalette.primary,
      border: `3px solid ${neonPalette.primary}`,
      padding: '18px 50px',
      borderRadius: 8,
      fontSize: 24,
      fontWeight: '800',
      marginTop: 32,
      textTransform: 'uppercase',
      boxShadow: neonPalette.glowPink,
      letterSpacing: '0.15em',
    },
    link: {
      fontFamily: neonFonts.body,
      fontSize: 18,  // 提升最小字号（原 16px）
      color: neonPalette.secondary,
      marginTop: 24,
      textShadow: neonPalette.glowCyan,
      letterSpacing: '0.1em',
    },
  },
};

export default {
  palette: neonPalette,
  fonts: neonFonts,
  animation: neonAnimation,
  scenes: neonSceneStyles,
};