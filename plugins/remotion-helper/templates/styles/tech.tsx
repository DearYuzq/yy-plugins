/**
 * Tech Style - 科技风格
 *
 * 深色背景 + 渐变，蓝紫系配色（避免 AI 紫蓝渐变陷阱）
 * 等宽字体，快速利落动画
 * 适合技术产品、开发者工具
 *
 * 设计升级：
 * - 主色饱和度降低，更沉稳
 * - 字体升级为 Geist Sans
 * - 单强调色原则
 */

export const techPalette = {
  background: '#0f0f23',
  backgroundGradient: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)',
  // 主色饱和度降低，避免 AI 紫蓝渐变
  primary: '#4f46e5',        // 更沉稳的紫蓝（原 #6366f1）
  secondary: '#6366f1',      // 辅助色
  accent: '#a855f7',
  text: '#ffffff',
  textMuted: '#a1a1aa',
  cardBg: '#1e1e3f',
  codeBg: '#0d0d1a',
  border: '#2e2e5a',
  // 单强调色
  highlight: '#4f46e5',
};

export const techFonts = {
  title: 'JetBrains Mono, monospace',
  // 字体升级：Geist Sans 替代 Inter
  body: 'Geist Sans, Inter, system-ui, sans-serif',
  code: 'JetBrains Mono, monospace',
};

export const techAnimation = {
  stiffness: 200,
  damping: 15,
  mass: 1,
};

export const techSceneStyles = {
  logoIntro: {
    container: {
      background: techPalette.background,
      backgroundImage: techPalette.backgroundGradient,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logo: {
      width: 160,
      height: 160,
    },
    title: {
      fontFamily: techFonts.title,
      fontSize: 64,
      color: techPalette.text,
      fontWeight: 'bold',
      marginTop: 32,
      textAlign: 'center',
    },
    subtitle: {
      fontFamily: techFonts.body,
      fontSize: 24,
      color: techPalette.textMuted,
      marginTop: 16,
    },
  },
  valueProp: {
    container: {
      background: techPalette.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0 10%',
    },
    headline: {
      fontFamily: techFonts.title,
      fontSize: 48,
      color: techPalette.text,
      fontWeight: 'bold',
      textAlign: 'center',
      lineHeight: 1.2,
    },
    description: {
      fontFamily: techFonts.body,
      fontSize: 24,
      color: techPalette.textMuted,
      textAlign: 'center',
      marginTop: 24,
      maxWidth: '80%',
    },
  },
  featureCard: {
    container: {
      background: techPalette.cardBg,
      borderRadius: 16,
      border: `1px solid ${techPalette.border}`,
      padding: 24,
      minWidth: 280,
    },
    icon: {
      width: 48,
      height: 48,
      backgroundColor: techPalette.primary,
      borderRadius: 12,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontFamily: techFonts.title,
      fontSize: 20,  // 功能标题字号
      color: techPalette.text,
      fontWeight: 'bold',
      marginTop: 16,
    },
    description: {
      fontFamily: techFonts.body,
      fontSize: 24,  // 提升最小字号（原 14px）
      color: techPalette.textMuted,
      marginTop: 8,
    },
  },
  codeShowcase: {
    container: {
      background: techPalette.codeBg,
      borderRadius: 12,
      border: `1px solid ${techPalette.border}`,
      padding: 24,
      fontFamily: techFonts.code,
      fontSize: 18,  // 代码字号（最小可接受）
      color: techPalette.text,
    },
    keyword: {
      color: techPalette.primary,
    },
    string: {
      color: techPalette.accent,
    },
    comment: {
      color: techPalette.textMuted,
    },
  },
  ctaOutro: {
    container: {
      background: techPalette.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      fontFamily: techFonts.title,
      fontSize: 56,
      color: techPalette.text,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    button: {
      backgroundColor: techPalette.primary,
      color: '#fff',
      padding: '16px 48px',
      borderRadius: 8,
      fontSize: 24,
      fontWeight: 'bold',
      marginTop: 32,
      boxShadow: `0 4px 20px ${techPalette.primary}40`,
    },
    link: {
      fontFamily: techFonts.body,
      fontSize: 18,
      color: techPalette.textMuted,
      marginTop: 16,
    },
  },
};

export default {
  palette: techPalette,
  fonts: techFonts,
  animation: techAnimation,
  scenes: techSceneStyles,
};