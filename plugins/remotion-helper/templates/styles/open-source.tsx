/**
 * Open Source Style - 开源项目风格
 *
 * GitHub 深色背景风格
 * 专业字体，简洁设计
 * 黑白绿配色，适合开源项目
 *
 * 设计升级：
 * - 字体升级：SF Mono + Switzer
 * - 保持 GitHub 经典配色
 */

export const openSourcePalette = {
  background: '#0d1117',
  backgroundSecondary: '#161b22',
  primary: '#58a6ff',
  secondary: '#8b949e',
  accent: '#3fb950',
  text: '#c9d1d9',
  textMuted: '#8b949e',
  border: '#30363d',
  cardBg: '#161b22',
};

export const openSourceFonts = {
  // 字体升级：Switzer 替代 system-ui
  title: 'Switzer, SF Pro Display, system-ui, sans-serif',
  body: 'Switzer, SF Pro Text, system-ui, sans-serif',
  code: 'SF Mono, JetBrains Mono, Consolas, monospace',
};

export const openSourceAnimation = {
  stiffness: 150,
  damping: 15,
  mass: 1,
};

export const openSourceSceneStyles = {
  logoIntro: {
    container: {
      background: openSourcePalette.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logo: {
      width: 120,
      height: 120,
      borderRadius: 60,
      border: `2px solid ${openSourcePalette.border}`,
    },
    title: {
      fontFamily: openSourceFonts.title,
      fontSize: 52,
      color: openSourcePalette.text,
      fontWeight: '600',
      marginTop: 28,
      textAlign: 'center',
    },
    subtitle: {
      fontFamily: openSourceFonts.body,
      fontSize: 20,
      color: openSourcePalette.textMuted,
      marginTop: 12,
    },
  },
  valueProp: {
    container: {
      background: openSourcePalette.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0 10%',
    },
    headline: {
      fontFamily: openSourceFonts.title,
      fontSize: 40,
      color: openSourcePalette.text,
      fontWeight: '600',
      textAlign: 'center',
      lineHeight: 1.3,
    },
    description: {
      fontFamily: openSourceFonts.body,
      fontSize: 20,
      color: openSourcePalette.textMuted,
      textAlign: 'center',
      marginTop: 20,
      maxWidth: '85%',
    },
  },
  featureCard: {
    container: {
      background: openSourcePalette.cardBg,
      border: `1px solid ${openSourcePalette.border}`,
      borderRadius: 12,
      padding: 24,
      minWidth: 280,
    },
    icon: {
      width: 40,
      height: 40,
      backgroundColor: `${openSourcePalette.primary}20`,
      borderRadius: 8,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontFamily: openSourceFonts.title,
      fontSize: 24,  // 提升最小字号（原 18px）
      color: openSourcePalette.text,
      fontWeight: '600',
      marginTop: 16,
    },
    description: {
      fontFamily: openSourceFonts.body,
      fontSize: 24,  // 提升最小字号（原 14px）
      color: openSourcePalette.textMuted,
      marginTop: 8,
    },
  },
  codeShowcase: {
    container: {
      background: openSourcePalette.backgroundSecondary,
      border: `1px solid ${openSourcePalette.border}`,
      borderRadius: 8,
      padding: 20,
      fontFamily: openSourceFonts.code,
      fontSize: 18,  // 代码字号（最小可接受）
      color: openSourcePalette.text,
    },
    keyword: {
      color: openSourcePalette.primary,
    },
    string: {
      color: openSourcePalette.accent,
    },
    comment: {
      color: openSourcePalette.textMuted,
    },
  },
  ctaOutro: {
    container: {
      background: openSourcePalette.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      fontFamily: openSourceFonts.title,
      fontSize: 44,
      color: openSourcePalette.text,
      fontWeight: '600',
      textAlign: 'center',
    },
    button: {
      backgroundColor: `${openSourcePalette.accent}20`,
      color: openSourcePalette.accent,
      border: `2px solid ${openSourcePalette.accent}`,
      padding: '14px 40px',
      borderRadius: 8,
      fontSize: 20,
      fontWeight: '600',
      marginTop: 28,
    },
    link: {
      fontFamily: openSourceFonts.body,
      fontSize: 18,  // 提升最小字号（原 16px）
      color: openSourcePalette.primary,
      marginTop: 20,
    },
  },
};

export default {
  palette: openSourcePalette,
  fonts: openSourceFonts,
  animation: openSourceAnimation,
  scenes: openSourceSceneStyles,
};