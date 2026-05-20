/**
 * Minimal Style - 极简风格
 *
 * 大量留白，文字为主
 * 黑白灰配色 + 单色点缀
 * 优雅缓动，适合高端产品
 */

export const minimalPalette = {
  background: '#ffffff',
  backgroundAlt: '#fafafa',
  primary: '#000000',
  secondary: '#666666',
  accent: '#ff3366',  // 可配置的单色点缀
  text: '#000000',
  textMuted: '#999999',
  border: '#e5e5e5',
};

export const minimalFonts = {
  title: 'Inter Light, Inter, system-ui, sans-serif',
  body: 'Inter, system-ui, sans-serif',
};

export const minimalAnimation = {
  stiffness: 80,
  damping: 20,
  mass: 1.5,
};

export const minimalSceneStyles = {
  logoIntro: {
    container: {
      background: minimalPalette.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logo: {
      width: 100,
      height: 100,
    },
    title: {
      fontFamily: minimalFonts.title,
      fontSize: 48,
      color: minimalPalette.text,
      fontWeight: '300',
      letterSpacing: '-0.02em',
      marginTop: 40,
      textAlign: 'center',
    },
    subtitle: {
      fontFamily: minimalFonts.body,
      fontSize: 18,
      color: minimalPalette.textMuted,
      fontWeight: '400',
      marginTop: 16,
      letterSpacing: '0.05em',
    },
  },
  valueProp: {
    container: {
      background: minimalPalette.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0 15%',
    },
    headline: {
      fontFamily: minimalFonts.title,
      fontSize: 36,
      color: minimalPalette.text,
      fontWeight: '300',
      letterSpacing: '-0.02em',
      textAlign: 'center',
      lineHeight: 1.3,
    },
    description: {
      fontFamily: minimalFonts.body,
      fontSize: 18,
      color: minimalPalette.textMuted,
      fontWeight: '400',
      textAlign: 'center',
      marginTop: 28,
      maxWidth: '70%',
      lineHeight: 1.6,
    },
  },
  featureCard: {
    container: {
      background: minimalPalette.background,
      border: `1px solid ${minimalPalette.border}`,
      borderRadius: 4,
      padding: 32,
      minWidth: 260,
    },
    icon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: minimalPalette.accent,
    },
    title: {
      fontFamily: minimalFonts.body,
      fontSize: 24,  // 提升字号（原 16px）
      color: minimalPalette.text,
      fontWeight: '500',
      marginTop: 20,
      letterSpacing: '-0.01em',
    },
    description: {
      fontFamily: minimalFonts.body,
      fontSize: 24,  // 提升最小字号（原 14px）
      color: minimalPalette.textMuted,
      marginTop: 8,
      lineHeight: 1.5,
    },
  },
  screenshot: {
    container: {
      background: minimalPalette.backgroundAlt,
      border: `1px solid ${minimalPalette.border}`,
      borderRadius: 8,
      padding: 16,
    },
    image: {
      borderRadius: 4,
      width: '100%',
      height: 'auto',
    },
  },
  ctaOutro: {
    container: {
      background: minimalPalette.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      fontFamily: minimalFonts.title,  // 修复字体引用错误（原 minimalFonts.light 不存在）
      fontSize: 40,
      color: minimalPalette.text,
      fontWeight: '300',
      letterSpacing: '-0.02em',
      textAlign: 'center',
    },
    button: {
      backgroundColor: minimalPalette.text,
      color: minimalPalette.background,
      padding: '14px 40px',
      borderRadius: 4,
      fontSize: 20,  // 提升字号（原 16px）
      fontWeight: '500',
      marginTop: 32,
      letterSpacing: '0.02em',
    },
    link: {
      fontFamily: minimalFonts.body,
      fontSize: 18,  // 提升最小字号（原 14px）
      color: minimalPalette.textMuted,
      marginTop: 24,
      letterSpacing: '0.05em',
    },
  },
};

export default {
  palette: minimalPalette,
  fonts: minimalFonts,
  animation: minimalAnimation,
  scenes: minimalSceneStyles,
};