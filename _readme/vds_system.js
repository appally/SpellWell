/**
 * 单词小超人 - 视觉设计系统 (Visual Design System)
 * 基于设计风格卡片自动生成的代码化设计规范
 * 风格DNA: 可爱Q版 + 纸张质感 + 果冻按钮 + Q弹动效 + 多汁反馈 + 莫兰迪色彩
 */

// ===== 1. 色彩规范 (PALETTE) =====
// 莫兰迪色系：低饱和度、温和、治愈的色彩搭配
const PALETTE = {
    // 主色调 - 温和的蓝绿色
    primary: '#7FB3D3',
    primaryLight: '#A8C8E1',
    primaryDark: '#5A9BC4',
    
    // 强调色 - 温暖的珊瑚粉
    accent: '#F4A6A6',
    accentLight: '#F7C4C4',
    accentDark: '#E88888',
    
    // 背景色系 - 纸张质感
    background: '#F8F6F0',
    backgroundSecondary: '#F2EFE7',
    backgroundTertiary: '#EBE7DC',
    
    // 文字色系
    textPrimary: '#4A4A4A',
    textSecondary: '#6B6B6B',
    textLight: '#8A8A8A',
    textWhite: '#FFFFFF',
    
    // 功能色系
    success: '#A8D8A8',
    warning: '#F4D03F',
    error: '#E8A8A8',
    
    // 阴影和边框
    shadow: 'rgba(74, 74, 74, 0.1)',
    border: 'rgba(74, 74, 74, 0.15)',
    
    // 特殊效果色
    glow: '#FFE5B4',
    particle: '#F0E68C'
};

// ===== 2. 字体规范 (TYPOGRAPHY) =====
// 可爱Q版风格的字体配置
const TYPOGRAPHY = {
    // 字体族
    fontFamily: {
        primary: '"Comic Sans MS", "PingFang SC", "Hiragino Sans GB", sans-serif',
        display: '"Fredoka One", "Comic Sans MS", cursive',
        mono: '"Courier New", monospace'
    },
    
    // 字体大小 (移动端优化)
    fontSize: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '28px',
        '4xl': '32px',
        display: '36px'
    },
    
    // 字重
    fontWeight: {
        normal: 400,
        medium: 500,
        bold: 700
    },
    
    // 行高
    lineHeight: {
        tight: 1.2,
        normal: 1.4,
        relaxed: 1.6
    }
};

// ===== 3. 间距规范 (SPACING) =====
// 基于8px网格系统
const SPACING = {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
    
    // 安全区域
    safeAreaTop: '88px',
    safeAreaBottom: '34px',
    
    // 最小触控区域
    minTouchTarget: '48px'
};

// ===== 4. 动效规范 (ANIMATIONS) =====
// Q弹趣味的动画配置
const ANIMATIONS = {
    // 缓动函数 - Q弹效果
    easing: {
        bouncy: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',  // 强烈Q弹
        gentle: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',     // 温和Q弹
        elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'  // 弹性效果
    },
    
    // 持续时间
    duration: {
        fast: '0.15s',
        normal: '0.3s',
        slow: '0.5s',
        verySlow: '0.8s'
    },
    
    // 预设动画效果
    presets: {
        // 按钮按压效果
        buttonPress: {
            transform: 'scale(0.95)',
            transition: 'transform 0.15s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
        },
        
        // 果冻弹跳
        jellyBounce: {
            animation: 'jellyBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
        },
        
        // 淡入动画
        fadeIn: {
            opacity: '0',
            animation: 'fadeIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards'
        },
        
        // 滑入动画
        slideIn: {
            transform: 'translateY(20px)',
            opacity: '0',
            animation: 'slideIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards'
        }
    }
};

// ===== 5. 组件样式规范 (COMPONENTS) =====
const COMPONENTS = {
    // 按钮样式 - 果冻质感
    button: {
        primary: {
            background: `linear-gradient(135deg, ${PALETTE.primary}, ${PALETTE.primaryLight})`,
            color: PALETTE.textWhite,
            border: 'none',
            borderRadius: '24px',
            padding: '12px 24px',
            fontSize: TYPOGRAPHY.fontSize.lg,
            fontWeight: TYPOGRAPHY.fontWeight.bold,
            boxShadow: `0 4px 12px ${PALETTE.shadow}, inset 0 1px 0 rgba(255,255,255,0.3)`,
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            minHeight: SPACING.minTouchTarget,
            minWidth: SPACING.minTouchTarget
        },
        
        secondary: {
            background: `linear-gradient(135deg, ${PALETTE.accent}, ${PALETTE.accentLight})`,
            color: PALETTE.textPrimary,
            border: 'none',
            borderRadius: '24px',
            padding: '12px 24px',
            fontSize: TYPOGRAPHY.fontSize.lg,
            fontWeight: TYPOGRAPHY.fontWeight.bold,
            boxShadow: `0 4px 12px ${PALETTE.shadow}, inset 0 1px 0 rgba(255,255,255,0.3)`,
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            minHeight: SPACING.minTouchTarget,
            minWidth: SPACING.minTouchTarget
        }
    },
    
    // 卡片样式 - 纸张质感
    card: {
        background: PALETTE.background,
        borderRadius: '16px',
        padding: SPACING.lg,
        boxShadow: `0 8px 24px ${PALETTE.shadow}`,
        border: `1px solid ${PALETTE.border}`,
        position: 'relative',
        overflow: 'hidden'
    },
    
    // 纸张纹理背景
    paperTexture: {
        background: `
            radial-gradient(circle at 20% 50%, rgba(120, 119, 108, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(120, 119, 108, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(120, 119, 108, 0.03) 0%, transparent 50%),
            ${PALETTE.background}
        `,
        backgroundSize: '100px 100px, 80px 80px, 120px 120px',
        backgroundPosition: '0 0, 40px 60px, 130px 270px'
    }
};

// ===== 6. CSS关键帧动画 =====
const CSS_KEYFRAMES = `
@keyframes jellyBounce {
    0% { transform: scale(1); }
    30% { transform: scale(1.25, 0.75); }
    40% { transform: scale(0.75, 1.25); }
    50% { transform: scale(1.15, 0.85); }
    65% { transform: scale(0.95, 1.05); }
    75% { transform: scale(1.05, 0.95); }
    100% { transform: scale(1); }
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideIn {
    from { 
        transform: translateY(20px); 
        opacity: 0; 
    }
    to { 
        transform: translateY(0); 
        opacity: 1; 
    }
}

@keyframes glow {
    0%, 100% { box-shadow: 0 0 5px ${PALETTE.glow}; }
    50% { box-shadow: 0 0 20px ${PALETTE.glow}, 0 0 30px ${PALETTE.glow}; }
}

@keyframes sparkle {
    0%, 100% { opacity: 0; transform: scale(0); }
    50% { opacity: 1; transform: scale(1); }
}
`;

// ===== 7. 导出配置 =====
const VDS = {
    PALETTE,
    TYPOGRAPHY,
    SPACING,
    ANIMATIONS,
    COMPONENTS,
    CSS_KEYFRAMES
};

// 如果在浏览器环境中，添加到全局
if (typeof window !== 'undefined') {
    window.VDS = VDS;
}

// 如果在Node.js环境中，导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VDS;
}