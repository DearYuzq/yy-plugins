/**
 * SaaS Style - 商业产品风格
 *
 * 明亮专业背景，单强调色原则
 * 圆角卡片，柔和漫射阴影
 * 平滑动画，适合商业产品
 *
 * 设计升级：
 * - 单强调色：仅 #0ea5e9 一个主色
 * - 字体升级：Satoshi 替代 Poppins
 * - 漫射阴影替代硬阴影
 */

export const saasPalette = {
  background: '#f8fafc',
  backgroundGradient: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
  // 单强调色原则
  primary: '#0ea5e9',        // 蓝色（唯一强调色）
  secondary: '#06b6d4',      // 辅助色（仅在需要时）
  accent: '#10b981',         // 绿色（CTA）
  text: '#1e293b',
  textMuted: '#64748b',
  cardBg: '#ffffff',
  cardBorder: '#e2e8f0',
  // 漫射阴影替代硬阴影
  shadow: '0 10px 60px -15px rgba(0, 0, 0, 0.08)',
  shadowSoft: '0 4px 20px rgba(0, 0, 0, 0.04)',
};

export const saasFonts = {
  // 字体升级：Satoshi 替代 Poppins
  title: 'Satoshi, Poppins, system-ui, sans-serif',
  body: 'Geist Sans, Inter, system-ui, sans-serif',
};

export const saasAnimation = {
  stiffness: 100,
  damping: 20,
  mass: 1,
};

export const saasSceneStyles = {
  logoIntro: {
    container: {
      background: saasPalette.background,
      backgroundImage: saasPalette.backgroundGradient,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logo: {
      width: 140,
      height: 140,
      borderRadius: 24,
      backgroundColor: saasPalette.cardBg,
      boxShadow: saasPalette.shadow,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontFamily: saasFonts.title,
      fontSize: 56,
      color: saasPalette.text,
      fontWeight: 'bold',
      marginTop: 32,
      textAlign: 'center',
    },
    subtitle: {
      fontFamily: saasFonts.body,
      fontSize: 24,  // 提升最小字号（原 22px）
      color: saasPalette.textMuted,
      marginTop: 16,
    },
  },
  valueProp: {
    container: {
      background: saasPalette.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0 10%',
    },
    headline: {
      fontFamily: saasFonts.title,
      fontSize: 44,
      color: saasPalette.text,
      fontWeight: 'bold',
      textAlign: 'center',
      lineHeight: 1.2,
    },
    description: {
      fontFamily: saasFonts.body,
      fontSize: 22,
      color: saasPalette.textMuted,
      textAlign: 'center',
      marginTop: 24,
      maxWidth: '75%',
    },
  },
  featureCard: {
    container: {
      background: saasPalette.cardBg,
      borderRadius: 20,
      boxShadow: saasPalette.shadow,
      padding: 32,
      minWidth: 300,
    },
    icon: {
      width: 56,
      height: 56,
      backgroundColor: `${saasPalette.primary}20`,
      borderRadius: 16,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontFamily: saasFonts.title,
      fontSize: 22,
      color: saasPalette.text,
      fontWeight: '600',
      marginTop: 20,
    },
    description: {
      fontFamily: saasFonts.body,
      fontSize: 24,  // 提升最小字号（原 16px）
      color: saasPalette.textMuted,
      marginTop: 12,
      lineHeight: 1.5,
    },
  },
  screenshot: {
    container: {
      background: saasPalette.cardBg,
      borderRadius: 24,
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
      padding: 20,
    },
    image: {
      borderRadius: 16,
      width: '100%',
      height: 'auto',
    },
  },
  ctaOutro: {
    container: {
      background: saasPalette.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      fontFamily: saasFonts.title,
      fontSize: 48,
      color: saasPalette.text,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    button: {
      backgroundColor: saasPalette.accent,
      color: '#fff',
      padding: '18px 48px',
      borderRadius: 12,
      fontSize: 22,
      fontWeight: '600',
      marginTop: 32,
      boxShadow: `0 4px 20px ${saasPalette.accent}40`,
    },
    link: {
      fontFamily: saasFonts.body,
      fontSize: 18,
      color: saasPalette.primary,
      marginTop: 24,
    },
  },
};

export default {
  palette: saasPalette,
  fonts: saasFonts,
  animation: saasAnimation,
  scenes: saasSceneStyles,
};