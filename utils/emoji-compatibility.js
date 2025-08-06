/**
 * 表情符号兼容性工具
 * 解决安卓设备表情符号显示问题
 */

/**
 * 检测设备是否支持彩色表情符号
 * @returns {boolean} 是否支持彩色表情符号
 */
function supportsColorEmoji() {
  try {
    const systemInfo = wx.getSystemInfoSync()
    const platform = systemInfo.platform
    const version = systemInfo.version
    
    // iOS设备通常支持良好
    if (platform === 'ios') {
      return true
    }
    
    // 安卓设备需要检查版本
    if (platform === 'android') {
      // 安卓7.0以上版本支持较好
      const androidVersion = parseFloat(systemInfo.system.replace('Android ', ''))
      return androidVersion >= 7.0
    }
    
    // 其他平台默认不支持
    return false
  } catch (error) {
    console.warn('检测表情符号支持失败:', error)
    return false
  }
}

/**
 * 表情符号映射表
 */
const EMOJI_MAP = {
  // 庆祝相关
  '🎉': { class: 'emoji-party', fallback: '[庆祝]' },
  '⭐': { class: 'emoji-star', fallback: '★' },
  '✨': { class: 'emoji-sparkles', fallback: '✦' },
  '🌟': { class: 'emoji-glowing-star', fallback: '☆' },
  '🏆': { class: 'emoji-trophy', fallback: '[奖杯]' },
  '🎁': { class: 'emoji-gift', fallback: '[礼物]' },
  '🏅': { class: 'emoji-medal', fallback: '[奖牌]' },
  '⚡': { class: 'emoji-lightning', fallback: '⚡' },
  '💫': { class: 'emoji-dizzy', fallback: '✧' },
  
  // 界面图标
  '🗺️': { class: 'emoji-map', fallback: '[地图]' },
  '📤': { class: 'emoji-share', fallback: '[分享]' },
  '📚': { class: 'emoji-book', fallback: '[书本]' },
  '💡': { class: 'emoji-bulb', fallback: '[提示]' },
  '🔊': { class: 'emoji-speaker', fallback: '♪' },
  '😊': { class: 'emoji-smile', fallback: '☺' },
  '💎': { class: 'emoji-gem', fallback: '◆' },
  
  // 特殊符号
  '✓': { class: 'emoji-check', fallback: '✓' }
}

/**
 * 获取表情符号的兼容性类名
 * @param {string} emoji 原始表情符号
 * @returns {string} CSS类名
 */
function getEmojiClass(emoji) {
  const mapping = EMOJI_MAP[emoji]
  if (!mapping) {
    console.warn(`未找到表情符号映射: ${emoji}`)
    return 'emoji-icon'
  }
  
  const supportsEmoji = supportsColorEmoji()
  const baseClass = `emoji-icon ${mapping.class}`
  
  return supportsEmoji ? baseClass : `${baseClass} fallback`
}

/**
 * 获取表情符号的备用文本
 * @param {string} emoji 原始表情符号
 * @returns {string} 备用文本
 */
function getEmojiFallback(emoji) {
  const mapping = EMOJI_MAP[emoji]
  return mapping ? mapping.fallback : emoji
}

/**
 * 为页面应用表情符号兼容性
 * @param {Object} pageInstance 页面实例
 */
function applyEmojiCompatibility(pageInstance) {
  const supportsEmoji = supportsColorEmoji()
  
  // 设置页面数据
  pageInstance.setData({
    supportsColorEmoji: supportsEmoji,
    emojiCompatibilityApplied: true
  })
  
  console.log(`表情符号兼容性已应用: ${supportsEmoji ? '支持彩色表情' : '使用备用方案'}`)
}

/**
 * 生成兼容性表情符号HTML
 * @param {string} emoji 原始表情符号
 * @param {string} size 尺寸 (small, medium, large, xl, xxl)
 * @param {string} color 颜色 (primary, secondary, success, warning, error)
 * @returns {string} 兼容性HTML
 */
function generateCompatibleEmoji(emoji, size = 'medium', color = '') {
  const emojiClass = getEmojiClass(emoji)
  const sizeClass = size ? ` ${size}` : ''
  const colorClass = color ? ` ${color}` : ''
  const fallbackText = getEmojiFallback(emoji)
  
  return `<view class="${emojiClass}${sizeClass}${colorClass}" data-fallback="${fallbackText}"></view>`
}

/**
 * 批量替换页面中的表情符号
 * @param {Object} pageData 页面数据对象
 * @returns {Object} 处理后的页面数据
 */
function processPageEmojis(pageData) {
  const processed = { ...pageData }
  const supportsEmoji = supportsColorEmoji()
  
  // 如果不支持彩色表情符号，替换为备用文本
  if (!supportsEmoji) {
    Object.keys(processed).forEach(key => {
      if (typeof processed[key] === 'string') {
        Object.keys(EMOJI_MAP).forEach(emoji => {
          if (processed[key].includes(emoji)) {
            processed[key] = processed[key].replace(
              new RegExp(emoji, 'g'), 
              EMOJI_MAP[emoji].fallback
            )
          }
        })
      }
    })
  }
  
  return processed
}

/**
 * 创建表情符号组件数据
 * @param {string} emoji 表情符号
 * @param {Object} options 选项 {size, color, animate}
 * @returns {Object} 组件数据
 */
function createEmojiComponent(emoji, options = {}) {
  const { size = 'medium', color = '', animate = false } = options
  
  return {
    emoji: emoji,
    className: getEmojiClass(emoji),
    size: size,
    color: color,
    animate: animate,
    fallback: getEmojiFallback(emoji),
    supported: supportsColorEmoji()
  }
}

module.exports = {
  supportsColorEmoji,
  getEmojiClass,
  getEmojiFallback,
  applyEmojiCompatibility,
  generateCompatibleEmoji,
  processPageEmojis,
  createEmojiComponent,
  EMOJI_MAP
}