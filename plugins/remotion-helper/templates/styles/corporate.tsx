/**
 * Corporate Style - 企业风格
 *
 * 浅灰蓝背景，商务字体
 * 规整动画，蓝系配色
 * 适合企业级、B2B 产品
 *
 * 设计升级：
 * - 字体升级：IBM Plex Sans 替代 Roboto
 * - 保持专业商务感
 */

export const corporatePalette = {
  background: '#eef2f7',
  backgroundGradient: 'linear-gradient(180deg, #eef2f7 0%, #dce4ed 100%)',
  primary: '#0052cc',
  secondary: '#0080ff',
  accent: '#00c853',
  text: '#172b4d',
  textMuted: '#5e6c84',
  textLight: '#8993a4',
  cardBg: '#ffffff',
  border: '#dfe1e6',
  shadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
};

export const corporateFonts = {
  // 字体升级：IBM Plex Sans 替代 Roboto
  title: 'IBM Plex Sans, system-ui, sans-serif',
  body: 'IBM Plex Sans, Geist Sans, system-ui, sans-serif',
};

export const corporateAnimation = {
  stiffness: 100,
  damping: 18,
  mass: 1,
};

export const corporateSceneStyles = {
  logoIntro: {
    container: {
      background: corporatePalette.background,
      backgroundImage: corporatePalette.backgroundGradient,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logo: {
      width: 130,
      height: 130,
      borderRadius: 24,
      backgroundColor: corporatePalette.cardBg,
      boxShadow: corporatePalette.shadow,
    },
    title: {
      fontFamily: corporateFonts.title,
      fontSize: 54,
      color: corporatePalette.text,
      fontWeight: '500',
      marginTop: 32,
      textAlign: 'center',
    },
    subtitle: {
      fontFamily: corporateFonts.body,
      fontSize: 20,
      color: corporatePalette.textMuted,
      marginTop: 16,
    },
  },
  valueProp: {
    container: {
      background: corporatePalette.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0 12%',
    },
    headline: {
      fontFamily: corporateFonts.title,
      fontSize: 42,
      color: corporatePalette.text,
      fontWeight: '500',
      textAlign: 'center',
      lineHeight: 1.25,
    },
    description: {
      fontFamily: corporateFonts.body,
      fontSize: 20,
      color: corporatePalette.textMuted,
      textAlign: 'center',
      marginTop: 24,
      maxWidth: '80%',
      lineHeight: 1.5,
    },
  },
  featureCard: {
    container: {
      background: corporatePalette.cardBg,
      borderRadius: 12,
      boxShadow: corporatePalette.shadow,
      border: `1px solid ${corporatePalette.border}`,
      padding: 28,
      minWidth: 300,
    },
    icon: {
      width: 48,
      height: 48,
      backgroundColor: `${corporatePalette.primary}15`,
      borderRadius: 10,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontFamily: corporateFonts.title,
      fontSize: 20,
      color: corporatePalette.text,
      fontWeight: '500',
      marginTop: 18,
    },
    description: {
      fontFamily: corporateFonts.body,
      fontSize: 24,  // 提升最小字号（原 15px）
      color: corporatePalette.textMuted,
      marginTop: 10,
      lineHeight: 1.5,
    },
  },
  screenshot: {
    container: {
      background: corporatePalette.cardBg,
      borderRadius: 16,
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
      border: `1px solid ${corporatePalette.border}`,
      padding: 16,
    },
    image: {
      borderRadius: 8,
      width: '100%',
      height: 'auto',
    },
  },
  ctaOutro: {
    container: {
      background: corporatePalette.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      fontFamily: corporateFonts.title,
      fontSize: 44,
      color: corporatePalette.text,
      fontWeight: '500',
      textAlign: 'center',
    },
    button: {
      backgroundColor: corporatePalette.primary,
      color: '#fff',
      padding: '16px 44px',
      borderRadius: 8,
      fontSize: 20,
      fontWeight: '500',
      marginTop: 32,
      boxShadow: `0 4px 16px ${corporatePalette.primary}40`,
    },
    link: {
      fontFamily: corporateFonts.body,
      fontSize: 18,  // 提升最小字号（原 17px）
      color: corporatePalette.secondary,
      marginTop: 24,
    },
  },
};

export default {
  palette: corporatePalette,
  fonts: corporateFonts,
  animation: corporateAnimation,
  scenes: corporateSceneStyles,
};