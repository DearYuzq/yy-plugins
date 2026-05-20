/**
 * Ethereal Style - 空灵玻璃风格
 *
 * 深黑 + 径向网格渐变 + 重度毛玻璃
 * 柔和发光边框、优雅缓动动画
 * 冷蓝光强调色、空灵通透感
 * 适合高端科技产品、AI 工具、创意产品
 */

export const etherealPalette = {
  // 深黑背景
  background: '#050505',
  // 径向网格渐变
  backgroundGradient: 'radial-gradient(ellipse at 50% 50%, #1a1a2e 0%, #050505 70%)',
  // 冷蓝光强调色
  accent: '#00D9FF',
  accentSecondary: '#7B61FF',  // 柔和紫
  // 文字
  text: '#EAEAEA',
  textMuted: '#888888',
  textLight: '#AAAAAA',
  // 发光效果
  glow: 'rgba(0, 217, 255, 0.15)',
  glowStrong: 'rgba(0, 217, 255, 0.3)',
  // 毛玻璃
  glassBg: 'rgba(255, 255, 255, 0.03)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  // 边框
  border: 'rgba(255, 255, 255, 0.1)',
};

export const etherealFonts = {
  // 现代无衬线
  title: 'Cabinet Grotesk, Satoshi, system-ui, sans-serif',
  body: 'Geist Sans, Inter, system-ui, sans-serif',
  // 标注
  caption: 'Geist Mono, monospace',
};

export const etherealAnimation = {
  // 优雅缓动
  stiffness: 60,
  damping: 25,
  mass: 1.5,
};

export const etherealSceneStyles = {
  logoIntro: {
    container: {
      background: etherealPalette.background,
      backgroundImage: etherealPalette.backgroundGradient,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logo: {
      width: 120,
      height: 120,
      backgroundColor: etherealPalette.glassBg,
      backdropFilter: 'blur(20px)',
      border: `1px solid ${etherealPalette.glassBorder}`,
      borderRadius: 24,
      boxShadow: `0 0 40px ${etherealPalette.glow}`,
    },
    title: {
      fontFamily: etherealFonts.title,
      fontSize: 64,
      color: etherealPalette.text,
      fontWeight: '500',
      letterSpacing: '-0.02em',
      marginTop: 40,
      textAlign: 'center',
    },
    subtitle: {
      fontFamily: etherealFonts.body,
      fontSize: 24,
      color: etherealPalette.textMuted,
      fontWeight: '400',
      marginTop: 16,
      letterSpacing: '0.02em',
    },
  },
  valueProp: {
    container: {
      background: etherealPalette.background,
      backgroundImage: etherealPalette.backgroundGradient,
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0 12%',
    },
    headline: {
      fontFamily: etherealFonts.title,
      fontSize: 52,
      color: etherealPalette.text,
      fontWeight: '500',
      letterSpacing: '-0.01em',
      textAlign: 'center',
      lineHeight: 1.15,
    },
    description: {
      fontFamily: etherealFonts.body,
      fontSize: 24,
      color: etherealPalette.textMuted,
      textAlign: 'center',
      marginTop: 24,
      maxWidth: '70%',
      lineHeight: 1.6,
    },
  },
  featureCard: {
    container: {
      background: etherealPalette.glassBg,
      backdropFilter: 'blur(20px)',
      border: `1px solid ${etherealPalette.glassBorder}`,
      borderRadius: 20,
      padding: 32,
      minWidth: 300,
      boxShadow: `0 0 30px ${etherealPalette.glow}`,
    },
    icon: {
      width: 56,
      height: 56,
      backgroundColor: `rgba(0, 217, 255, 0.1)`,
      borderRadius: 16,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: 28,
      color: etherealPalette.accent,
    },
    title: {
      fontFamily: etherealFonts.title,
      fontSize: 28,
      color: etherealPalette.text,
      fontWeight: '500',
      marginTop: 24,
      letterSpacing: '-0.01em',
    },
    description: {
      fontFamily: etherealFonts.body,
      fontSize: 24,
      color: etherealPalette.textMuted,
      marginTop: 12,
      lineHeight: 1.5,
    },
  },
  screenshot: {
    container: {
      background: etherealPalette.glassBg,
      backdropFilter: 'blur(16px)',
      border: `1px solid ${etherealPalette.glassBorder}`,
      borderRadius: 24,
      padding: 20,
      boxShadow: `0 0 40px ${etherealPalette.glow}`,
    },
    image: {
      width: '100%',
      height: 'auto',
      borderRadius: 12,
      display: 'block',
    },
    caption: {
      fontFamily: etherealFonts.caption,
      fontSize: 18,
      color: etherealPalette.textMuted,
      marginTop: 16,
      letterSpacing: '0.05em',
    },
  },
  ctaOutro: {
    container: {
      background: etherealPalette.background,
      backgroundImage: etherealPalette.backgroundGradient,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      fontFamily: etherealFonts.title,
      fontSize: 48,
      color: etherealPalette.text,
      fontWeight: '500',
      letterSpacing: '-0.01em',
      textAlign: 'center',
    },
    button: {
      background: `linear-gradient(135deg, ${etherealPalette.accent} 0%, ${etherealPalette.accentSecondary} 100%)`,
      color: '#FFFFFF',
      padding: '18px 52px',
      borderRadius: 12,
      fontSize: 24,
      fontWeight: '500',
      marginTop: 32,
      letterSpacing: '0.02em',
      boxShadow: `0 0 30px ${etherealPalette.glowStrong}`,
    },
    link: {
      fontFamily: etherealFonts.body,
      fontSize: 18,
      color: etherealPalette.accent,
      marginTop: 24,
      textDecoration: 'underline',
      textUnderlineOffset: '4px',
    },
  },
};

export default {
  palette: etherealPalette,
  fonts: etherealFonts,
  animation: etherealAnimation,
  scenes: etherealSceneStyles,
};