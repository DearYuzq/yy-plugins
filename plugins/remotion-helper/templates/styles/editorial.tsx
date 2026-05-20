/**
 * Editorial Style - 编辑杂志风格
 *
 * 杂志排版、高端出版物美学
 * 大量留白、极端字体比例
 * 编辑分割布局（左大字，右图片胶囊）
 * 适合内容产品、知识库、编辑类产品
 */

export const editorialPalette = {
  // 温暖奶油色调
  background: '#FFFFFF',
  backgroundAlt: '#F7F6F3',    // 温暖奶油
  backgroundCream: '#FDFBF7',  // 更暖的奶油
  text: '#111111',
  textMuted: '#666666',
  textLight: '#888888',
  // 编辑红强调色
  accent: '#E61919',
  accentMuted: '#D94A4A',
  // 边框和分隔
  border: '#EAEAEA',
  borderDark: '#D0D0D0',
  // 柔和粉彩点缀
  pastelRed: '#FDEBEC',
  pastelBlue: '#E1F3FE',
  pastelGreen: '#EDF3EC',
  pastelYellow: '#FBF3DB',
};

export const editorialFonts = {
  // 编辑衬线：高端杂志感
  title: 'Playfair Display, Newsreader, Georgia, serif',
  // 无衬线正文
  body: 'Geist Sans, Switzer, system-ui, sans-serif',
  // 标注和元信息
  caption: 'Geist Mono, SF Mono, monospace',
};

export const editorialAnimation = {
  // 优雅缓动
  stiffness: 80,
  damping: 22,
  mass: 1.2,
};

export const editorialSceneStyles = {
  logoIntro: {
    container: {
      background: editorialPalette.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logo: {
      width: 100,
      height: 100,
      border: `2px solid ${editorialPalette.text}`,
      borderRadius: 0,
    },
    title: {
      fontFamily: editorialFonts.title,
      fontSize: 72,  // 极端字体比例
      color: editorialPalette.text,
      fontWeight: '400',
      fontStyle: 'italic',
      letterSpacing: '-0.02em',
      marginTop: 40,
      textAlign: 'center',
    },
    subtitle: {
      fontFamily: editorialFonts.body,
      fontSize: 24,
      color: editorialPalette.textMuted,
      fontWeight: '400',
      marginTop: 20,
      letterSpacing: '0.05em',
    },
  },
  valueProp: {
    container: {
      background: editorialPalette.background,
      // 编辑分割布局
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      padding: '0 10%',
    },
    headline: {
      fontFamily: editorialFonts.title,
      fontSize: 56,
      color: editorialPalette.text,
      fontWeight: '400',
      fontStyle: 'italic',
      letterSpacing: '-0.01em',
      textAlign: 'left',
      lineHeight: 1.15,
      maxWidth: '60%',
    },
    description: {
      fontFamily: editorialFonts.body,
      fontSize: 24,
      color: editorialPalette.textMuted,
      textAlign: 'left',
      marginTop: 24,
      maxWidth: '50%',
      lineHeight: 1.6,
    },
  },
  featureCard: {
    container: {
      background: editorialPalette.backgroundCream,
      border: `1px solid ${editorialPalette.border}`,
      borderRadius: 0,
      padding: 32,
      minWidth: 320,
    },
    icon: {
      width: 48,
      height: 48,
      backgroundColor: editorialPalette.pastelRed,
      borderRadius: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: 24,
    },
    title: {
      fontFamily: editorialFonts.title,
      fontSize: 28,
      color: editorialPalette.text,
      fontWeight: '500',
      fontStyle: 'italic',
      marginTop: 24,
      letterSpacing: '-0.01em',
    },
    description: {
      fontFamily: editorialFonts.body,
      fontSize: 24,
      color: editorialPalette.textMuted,
      marginTop: 12,
      lineHeight: 1.6,
    },
  },
  screenshot: {
    container: {
      background: editorialPalette.background,
      border: `1px solid ${editorialPalette.border}`,
      borderRadius: 0,
      padding: 24,
    },
    image: {
      width: '100%',
      height: 'auto',
      display: 'block',
    },
    caption: {
      fontFamily: editorialFonts.caption,
      fontSize: 18,
      color: editorialPalette.textLight,
      marginTop: 16,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    },
  },
  ctaOutro: {
    container: {
      background: editorialPalette.backgroundAlt,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      fontFamily: editorialFonts.title,
      fontSize: 48,
      color: editorialPalette.text,
      fontWeight: '400',
      fontStyle: 'italic',
      letterSpacing: '-0.01em',
      textAlign: 'center',
    },
    button: {
      backgroundColor: editorialPalette.accent,
      color: '#FFFFFF',
      padding: '16px 48px',
      borderRadius: 0,
      fontSize: 24,
      fontWeight: '500',
      marginTop: 32,
      letterSpacing: '0.05em',
    },
    link: {
      fontFamily: editorialFonts.body,
      fontSize: 18,
      color: editorialPalette.textMuted,
      marginTop: 24,
      textDecoration: 'underline',
      textUnderlineOffset: '4px',
    },
  },
};

export default {
  palette: editorialPalette,
  fonts: editorialFonts,
  animation: editorialAnimation,
  scenes: editorialSceneStyles,
};