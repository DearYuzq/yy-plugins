/**
 * Brutalist Style - 工业粗野主义风格
 *
 * 瑞士工业印刷 + 军事遥测终端美学
 * 无圆角、严格网格、可见分隔线
 * 高对比度配色，极端字体比例
 * 适合数据密集型仪表盘、技术产品
 */

export const brutalistPalette = {
  // 深色模式（默认）
  background: '#0A0A0A',
  backgroundAlt: '#141414',
  // 浅色模式备选
  backgroundLight: '#F4F4F0',
  text: '#EAEAEA',
  textMuted: '#666666',
  textAccent: '#E61919',  // 强红强调色
  border: '#1A1A1A',
  borderLight: '#D0D0D0',
  gridLine: '#2A2A2A',
  // 功能色
  success: '#00FF41',     // 终端绿
  warning: '#FFB800',
  error: '#FF3B30',
};

export const brutalistFonts = {
  // 宏观排版：瑞士工业字体
  title: 'Monument Extended, Inter Extra Bold, system-ui, sans-serif',
  // 微观数据：等宽字体
  body: 'JetBrains Mono, IBM Plex Mono, monospace',
  // 数据展示：像素字体
  data: 'VT323, monospace',
  // 代码
  code: 'JetBrains Mono, SF Mono, monospace',
};

export const brutalistAnimation = {
  // 快速利落的动画
  stiffness: 220,
  damping: 12,
  mass: 0.9,
};

export const brutalistSceneStyles = {
  logoIntro: {
    container: {
      background: brutalistPalette.background,
      // 可选：CRT 扫描线效果
      backgroundImage: `repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(0, 0, 0, 0.3) 2px,
        rgba(0, 0, 0, 0.3) 4px
      )`,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logo: {
      width: 140,
      height: 140,
      border: `3px solid ${brutalistPalette.text}`,
      borderRadius: 0,  // 无圆角
    },
    title: {
      fontFamily: brutalistFonts.title,
      fontSize: 64,
      color: brutalistPalette.text,
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: '0.15em',
      marginTop: 32,
      textAlign: 'center',
    },
    subtitle: {
      fontFamily: brutalistFonts.body,
      fontSize: 24,
      color: brutalistPalette.textMuted,
      marginTop: 16,
      letterSpacing: '0.1em',
    },
  },
  valueProp: {
    container: {
      background: brutalistPalette.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0 8%',
      // 网格线装饰
      borderLeft: `1px solid ${brutalistPalette.gridLine}`,
      borderRight: `1px solid ${brutalistPalette.gridLine}`,
    },
    headline: {
      fontFamily: brutalistFonts.title,
      fontSize: 48,
      color: brutalistPalette.text,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      textAlign: 'center',
      lineHeight: 1.1,
    },
    description: {
      fontFamily: brutalistFonts.body,
      fontSize: 24,
      color: brutalistPalette.textMuted,
      textAlign: 'center',
      marginTop: 24,
      maxWidth: '75%',
      lineHeight: 1.5,
    },
  },
  featureCard: {
    container: {
      background: brutalistPalette.backgroundAlt,
      border: `2px solid ${brutalistPalette.border}`,
      borderRadius: 0,  // 无圆角
      padding: 28,
      minWidth: 300,
      // 内部网格线
      borderTop: `1px solid ${brutalistPalette.gridLine}`,
      borderLeft: `1px solid ${brutalistPalette.gridLine}`,
    },
    icon: {
      width: 56,
      height: 56,
      backgroundColor: brutalistPalette.textAccent,
      borderRadius: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: 28,
      color: brutalistPalette.background,
    },
    title: {
      fontFamily: brutalistFonts.title,
      fontSize: 24,
      color: brutalistPalette.text,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      marginTop: 20,
    },
    description: {
      fontFamily: brutalistFonts.body,
      fontSize: 24,  // 最小字号
      color: brutalistPalette.textMuted,
      marginTop: 12,
      lineHeight: 1.5,
    },
  },
  screenshot: {
    container: {
      background: brutalistPalette.backgroundAlt,
      border: `2px solid ${brutalistPalette.border}`,
      borderRadius: 0,
      padding: 0,  // 无边框内边距
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: 'auto',
      display: 'block',
    },
    caption: {
      fontFamily: brutalistFonts.body,
      fontSize: 18,
      color: brutalistPalette.textMuted,
      marginTop: 12,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
    },
  },
  ctaOutro: {
    container: {
      background: brutalistPalette.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      fontFamily: brutalistFonts.title,
      fontSize: 56,
      color: brutalistPalette.textAccent,
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
      textAlign: 'center',
    },
    button: {
      backgroundColor: brutalistPalette.textAccent,
      color: brutalistPalette.background,
      padding: '18px 56px',
      borderRadius: 0,  // 无圆角
      fontSize: 24,
      fontWeight: '800',
      marginTop: 32,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      border: `3px solid ${brutalistPalette.textAccent}`,
    },
    link: {
      fontFamily: brutalistFonts.body,
      fontSize: 18,
      color: brutalistPalette.text,
      marginTop: 24,
      textDecoration: 'underline',
      textUnderlineOffset: '4px',
    },
  },
};

export default {
  palette: brutalistPalette,
  fonts: brutalistFonts,
  animation: brutalistAnimation,
  scenes: brutalistSceneStyles,
};
