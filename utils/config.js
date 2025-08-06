/**
 * 配置管理模块
 * 集中管理API配置和应用设置
 */

// 环境配置
const ENV = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production'
}

// 当前环境（开发时可手动切换）
const CURRENT_ENV = ENV.DEVELOPMENT

// API基础配置
const API_CONFIG = {
  
  // AI服务配置
  ai: {
    qwenplus: {
      enabled: true,
      // 生产环境应使用后端代理或环境变量
      apiKey: CURRENT_ENV === ENV.DEVELOPMENT ? 
        "sk-d8fa10db341a41f189d582a7486841c7" : 
        null,
      baseUrl: CURRENT_ENV === ENV.DEVELOPMENT ?
        "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions" :
        "/api/ai/qwenplus",
      model: "qwen-plus",
      timeout: 15000,
      retryTimes: 2
    },
    
    // TTS语音合成配置
    tts: {
      enabled: true,
      apiKey: CURRENT_ENV === ENV.DEVELOPMENT ? 
        "sk-d8fa10db341a41f189d582a7486841c7" : 
        null,
      baseUrl: CURRENT_ENV === ENV.DEVELOPMENT ?
        "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation" :
        "/api/ai/tts",
      model: "qwen-tts",
      timeout: 10000,
      retryTimes: 1,
      voice: "samantha", // 默认英文女声
      format: "wav",
      speed: 1.0,
      volume: 1.0
    }
  },
  
}

// 缓存配置
const CACHE_CONFIG = {
  
  // AI讲解缓存
  ai: {
    storage: {
      enabled: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30天过期
      keyPrefix: 'spellwell_ai_'
    }
  },
  
  // 音频缓存配置
  audio: {
    storage: {
      enabled: true,
      maxAge: 20 * 60 * 60 * 1000, // 20小时过期（阿里云URL有效期24小时）
      maxCacheSize: 50, // 最大缓存50个音频文件
      keyPrefix: 'spellwell_audio_'
    },
    memory: {
      enabled: true,
      maxSize: 50, // 内存缓存最大50个项目
      maxAge: 20 * 60 * 60 * 1000 // 20小时过期
    },
    preload: {
      enabled: true,
      maxPreloadWords: 5, // 最多预加载5个单词的发音
      preloadOnLevelStart: true
    }
  },
  
  // 用户数据缓存
  user: {
    storage: {
      enabled: true,
      syncInterval: 5 * 60 * 1000, // 5分钟同步一次
      keyPrefix: 'spellwell_user_'
    }
  }
}

// 应用配置
const APP_CONFIG = {
  // 性能配置
  performance: {
    // 内存管理
    memory: {
      autoCleanup: true,
      cleanupInterval: 10 * 60 * 1000, // 10分钟清理一次
      maxCanvasInstances: 3
    }
  },
  
  // 用户体验配置
  ux: {
    // 加载状态
    loading: {
      minShowTime: 500, // 最小显示时间，避免闪烁
      timeout: 30000 // 超时时间
    },
    
    // 反馈配置
    feedback: {
      vibration: {
        enabled: true,
        patterns: {
          success: 'light',
          error: 'medium',
          warning: 'light'
        }
      },
    }
  },
  
  // 学习配置
  learning: {
    // 简化的学习配置
    progress: {
      autoSave: true,
      saveInterval: 30 * 1000 // 30秒自动保存
    }
  }
}

// 安全配置
const SECURITY_CONFIG = {
  // API安全
  api: {
    // 请求限制
    rateLimit: {
      ai: {
        requests: 50,         // 每小时50次
        window: 60 * 60 * 1000
      }
    },
    
    // 请求验证
    validation: {
      enabled: true,
      maxRequestSize: 1024 * 1024, // 1MB
      allowedOrigins: CURRENT_ENV === ENV.DEVELOPMENT ? 
        ['*'] : 
        ['https://your-domain.com']
    }
  },
  
  // 数据安全
  data: {
    encryption: {
      enabled: CURRENT_ENV === ENV.PRODUCTION,
      algorithm: 'AES-256-GCM'
    },
    sanitization: {
      enabled: true,
      strictMode: CURRENT_ENV === ENV.PRODUCTION
    }
  }
}

/**
 * 获取环境配置
 */
function getEnvConfig() {
  return {
    current: CURRENT_ENV,
    isDevelopment: CURRENT_ENV === ENV.DEVELOPMENT,
    isProduction: CURRENT_ENV === ENV.PRODUCTION
  }
}

/**
 * 获取API配置
 * @param {string} service 服务名称
 * @returns {Object} API配置
 */
function getApiConfig(service) {
  const config = API_CONFIG[service]
  if (!config) {
    console.warn(`API配置不存在: ${service}`)
    return null
  }
  
  // 安全检查：生产环境不应包含敏感信息
  if (CURRENT_ENV === ENV.PRODUCTION) {
    const secureConfig = { ...config }
    Object.keys(secureConfig).forEach(key => {
      if (secureConfig[key] && typeof secureConfig[key] === 'object') {
        if (secureConfig[key].apiKey || secureConfig[key].secretKey) {
          console.warn(`生产环境检测到明文API密钥: ${service}.${key}`)
        }
      }
    })
  }
  
  return config
}

/**
 * 获取缓存配置
 * @param {string} type 缓存类型
 * @returns {Object} 缓存配置
 */
function getCacheConfig(type) {
  return CACHE_CONFIG[type] || {}
}

/**
 * 获取应用配置
 * @param {string} section 配置节
 * @returns {Object} 应用配置
 */
function getAppConfig(section) {
  return section ? APP_CONFIG[section] : APP_CONFIG
}

/**
 * 获取安全配置
 * @returns {Object} 安全配置
 */
function getSecurityConfig() {
  return SECURITY_CONFIG
}

/**
 * 验证配置完整性
 */
function validateConfig() {
  const issues = []
  
  // 检查生产环境配置
  if (CURRENT_ENV === ENV.PRODUCTION) {
    // 检查API密钥
    if (API_CONFIG.ai && API_CONFIG.ai.qwenplus && API_CONFIG.ai.qwenplus.apiKey) {
      issues.push('生产环境不应在前端包含完整API密钥')
    }
    
    // 检查调试设置
    if (getAppConfig('performance').memory.autoCleanup === false) {
      issues.push('生产环境应启用内存自动清理')
    }
  }
  
  // 检查必要配置
  if (!getCacheConfig('ai').storage) {
    issues.push('AI缓存配置缺失')
  }
  
  return {
    isValid: issues.length === 0,
    issues
  }
}

module.exports = {
  ENV,
  getEnvConfig,
  getApiConfig,
  getCacheConfig,
  getAppConfig,
  getSecurityConfig,
  validateConfig,
  
  // 直接导出常用配置（向后兼容）
  API_CONFIG,
  CACHE_CONFIG,
  APP_CONFIG,
  SECURITY_CONFIG
}