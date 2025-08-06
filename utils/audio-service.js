/**
 * 音频服务模块 - 集成阿里云Qwen-TTS语音合成
 * 提供单词发音、音频缓存和播放管理功能
 */

const { getApiConfig, getCacheConfig } = require('./config.js')
const cacheManager = require('./cache-manager.js')

/**
 * 音频服务类
 * 管理语音合成、缓存和播放功能
 */
class AudioService {
  constructor() {
    this.audioContext = null
    this.currentAudio = null
    this.isPlaying = false
    this.audioCache = new Map()
    this.maxCacheSize = 50 // 最大缓存50个音频文件
    
    // 从配置文件获取TTS API配置
    const aiConfig = getApiConfig('ai')
    this.ttsConfig = aiConfig ? aiConfig.tts : null
    
    console.log('🎵 音频服务初始化完成', this.ttsConfig)
  }

  /**
   * 初始化音频上下文
   * 创建微信小程序音频播放器实例
   */
  initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = wx.createInnerAudioContext()
      this.audioContext.useWebAudioImplement = true // 优化短音频播放
      
      // 监听音频事件
      this.audioContext.onPlay(() => {
        this.isPlaying = true
        console.log('🎵 音频开始播放')
      })
      
      this.audioContext.onEnded(() => {
        this.isPlaying = false
        console.log('🎵 音频播放完成')
      })
      
      this.audioContext.onError((error) => {
        this.isPlaying = false
        console.error('🎵 音频播放错误:', error)
        wx.showToast({
          title: '音频播放失败',
          icon: 'none',
          duration: 2000
        })
      })
      
      console.log('🎵 音频上下文初始化完成')
    }
    return this.audioContext
  }

  /**
   * 播放单词发音
   * @param {string} word - 要发音的单词
   * @param {Object} options - 播放选项
   * @returns {Promise<boolean>} 播放是否成功
   */
  async playWordPronunciation(word, options = {}) {
    try {
      console.log('🎵 开始播放单词发音:', word)
      
      if (!word || typeof word !== 'string') {
        throw new Error('无效的单词参数')
      }
      
      // 检查缓存
      const cachedAudioUrl = this.getCachedAudioUrl(word, 'word')
      if (cachedAudioUrl) {
        console.log('🎵 使用缓存的音频URL')
        return await this.playAudioFromUrl(cachedAudioUrl)
      }
      
      // 生成新的音频
      const audioUrl = await this.generateSpeech(word, options)
      if (audioUrl) {
        // 缓存音频URL
        this.cacheAudioUrl(word, audioUrl, 'word')
        return await this.playAudioFromUrl(audioUrl)
      }
      
      return false
      
    } catch (error) {
      console.error('🎵 播放单词发音失败:', error)
      
      // 降级方案：使用震动反馈
      this.playFallbackFeedback()
      return false
    }
  }

  /**
   * 调用Qwen-TTS API生成语音
   * @param {string} text - 要合成的文本
   * @param {Object} options - 合成选项
   * @returns {Promise<string>} 音频文件URL
   */
  async generateSpeech(text, options = {}) {
    try {
      console.log('🎵 调用Qwen-TTS生成语音:', text)
      
      const requestData = {
        model: this.ttsConfig.model,
        input: {
          text: text.trim(),
          voice: options.voice || 'Chelsie' // 使用API文档中的默认声音
        }
      }
      
      const response = await this.makeApiRequest('/generation', requestData)
      
      if (response && response.output && response.output.audio && response.output.audio.url) {
        console.log('🎵 语音合成成功，获得音频URL')
        return response.output.audio.url
      } else {
        console.error('🎵 API响应格式错误，完整响应:', JSON.stringify(response, null, 2))
        throw new Error('API响应格式错误')
      }
      
    } catch (error) {
      console.error('🎵 语音合成失败:', error)
      throw error
    }
  }

  /**
   * 发起API请求
   * @param {string} endpoint - API端点
   * @param {Object} data - 请求数据
   * @returns {Promise<Object>} API响应
   */
  async makeApiRequest(endpoint, data) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: this.ttsConfig.baseUrl + endpoint,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.ttsConfig.apiKey}`
        },
        data: data,
        timeout: this.ttsConfig.timeout,
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            reject(new Error(`API请求失败: ${res.statusCode}`))
          }
        },
        fail: (error) => {
          reject(new Error(`网络请求失败: ${error.errMsg}`))
        }
      })
    })
  }

  /**
   * 从URL播放音频
   * @param {string} audioUrl - 音频文件URL
   * @returns {Promise<boolean>} 播放是否成功
   */
  async playAudioFromUrl(audioUrl) {
    return new Promise((resolve) => {
      try {
        console.log('🎵 准备播放音频URL:', audioUrl)
        
        // 停止当前播放
        this.stopCurrentAudio()
        
        // 初始化音频上下文
        const audioContext = this.initAudioContext()
        
        // 设置音频源
        audioContext.src = audioUrl
        
        // 设置播放完成回调
        const onEnded = () => {
          console.log('🎵 音频播放完成')
          audioContext.offEnded(onEnded)
          audioContext.offError(onError)
          this.isPlaying = false
          resolve(true)
        }
        
        const onError = (error) => {
          console.error('🎵 音频播放错误:', error)
          audioContext.offEnded(onEnded)
          audioContext.offError(onError)
          this.isPlaying = false
          resolve(false)
        }
        
        audioContext.onEnded(onEnded)
        audioContext.onError(onError)
        
        // 开始播放
        console.log('🎵 开始播放音频')
        audioContext.play()
        this.isPlaying = true
        
      } catch (error) {
        console.error('🎵 播放音频失败:', error)
        this.isPlaying = false
        resolve(false)
      }
    })
  }

  /**
   * 停止当前音频播放
   */
  stopCurrentAudio() {
    if (this.audioContext) {
      try {
        // 移除所有事件监听器
        this.audioContext.offPlay()
        this.audioContext.offEnded()
        this.audioContext.offError()
        
        // 停止播放
        if (this.isPlaying) {
          this.audioContext.stop()
          console.log('🎵 停止当前音频播放')
        }
        
        // 重置状态
        this.isPlaying = false
        
        // 销毁音频上下文
        this.audioContext.destroy()
        this.audioContext = null
        
      } catch (error) {
        console.warn('🎵 停止音频时出现警告:', error)
        this.isPlaying = false
        this.audioContext = null
      }
    }
  }

  /**
   * 获取缓存的音频URL
   * @param {string} text - 单词或例句
   * @param {string} type - 缓存类型 ('word' 或 'sentence')
   * @returns {string|null} 缓存的音频URL
   */
  getCachedAudioUrl(text, type = 'word') {
    const cacheKey = `audio_${type}_${text.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_')}`
    const cached = this.audioCache.get(cacheKey)
    
    if (cached && cached.expireTime > Date.now()) {
      return cached.url
    }
    
    // 清理过期缓存
    if (cached) {
      this.audioCache.delete(cacheKey)
    }
    
    return null
  }

  /**
   * 缓存音频URL
   * @param {string} text - 单词或例句
   * @param {string} audioUrl - 音频URL
   * @param {string} type - 缓存类型 ('word' 或 'sentence')
   */
  cacheAudioUrl(text, audioUrl, type = 'word') {
    const cacheKey = `audio_${type}_${text.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_')}`
    const expireTime = Date.now() + (20 * 60 * 60 * 1000) // 20小时过期
    
    // 检查缓存大小，清理最旧的缓存
    if (this.audioCache.size >= this.maxCacheSize) {
      const firstKey = this.audioCache.keys().next().value
      this.audioCache.delete(firstKey)
    }
    
    this.audioCache.set(cacheKey, {
      url: audioUrl,
      expireTime: expireTime,
      cachedAt: Date.now()
    })
    
    console.log('🎵 音频URL已缓存:', cacheKey)
  }

  /**
   * 降级方案：播放反馈
   * 当音频播放失败时使用震动和提示
   */
  playFallbackFeedback() {
    try {
      // 震动反馈
      wx.vibrateShort({
        type: 'light'
      })
      
      // 显示提示
      wx.showToast({
        title: '🔊 发音',
        icon: 'none',
        duration: 1000
      })
      
      console.log('🎵 使用降级反馈方案')
    } catch (error) {
      console.error('🎵 降级反馈失败:', error)
    }
  }

  /**
   * 预加载单词发音
   * @param {Array<string>} words - 单词列表
   */
  async preloadPronunciations(words) {
    try {
      console.log('🎵 开始预加载发音:', words.length, '个单词')
      
      const promises = words.slice(0, 5).map(async (word) => {
        try {
          if (!this.getCachedAudioUrl(word)) {
            const audioUrl = await this.generateSpeech(word)
            if (audioUrl) {
              this.cacheAudioUrl(word, audioUrl)
            }
          }
        } catch (error) {
          console.warn('🎵 预加载单词发音失败:', word, error)
        }
      })
      
      await Promise.allSettled(promises)
      console.log('🎵 发音预加载完成')
      
    } catch (error) {
      console.error('🎵 预加载发音失败:', error)
    }
  }

  /**
   * 清理音频资源
   */
  cleanup() {
    try {
      // 停止当前播放
      this.stopCurrentAudio()
      
      // 销毁音频上下文
      if (this.audioContext) {
        this.audioContext.destroy()
        this.audioContext = null
      }
      
      // 清理缓存
      this.audioCache.clear()
      
      console.log('🎵 音频资源清理完成')
    } catch (error) {
      console.error('🎵 清理音频资源失败:', error)
    }
  }

  /**
   * 获取音频服务状态
   * @returns {Object} 服务状态信息
   */
  getStatus() {
    return {
      isPlaying: this.isPlaying,
      cacheSize: this.audioCache.size,
      maxCacheSize: this.maxCacheSize,
      hasAudioContext: !!this.audioContext
    }
  }
}

// 创建全局音频服务实例
const audioService = new AudioService()

/**
 * 播放单词发音（简化接口）
 * @param {string} word - 单词
 * @returns {Promise<boolean>} 播放是否成功
 */
async function playWordPronunciation(word) {
  return await audioService.playWordPronunciation(word)
}

/**
 * 播放例句朗读的便捷函数
 * @param {string} sentence - 要播放的例句
 * @param {Object} options - 播放选项
 */
async function playSentencePronunciation(sentence, options = {}) {
  try {
    console.log('🎵 开始播放例句:', sentence)
    
    if (!sentence || typeof sentence !== 'string') {
      throw new Error('无效的例句参数')
    }
    
    // 检查缓存
    const cachedAudioUrl = audioService.getCachedAudioUrl(sentence, 'sentence')
    if (cachedAudioUrl) {
      console.log('🎵 使用缓存的例句音频URL')
      await audioService.playAudioFromUrl(cachedAudioUrl)
      console.log('🎵 例句播放成功:', sentence)
      return true
    }
    
    // 生成例句的语音
    const audioUrl = await audioService.generateSpeech(sentence, {
      voice: options.voice || 'Chelsie' // 使用温和的女声
    })
    
    if (audioUrl) {
      // 缓存例句音频URL
      audioService.cacheAudioUrl(sentence, audioUrl, 'sentence')
      
      // 播放音频
      await audioService.playAudioFromUrl(audioUrl)
      
      console.log('🎵 例句播放成功:', sentence)
      return true
    }
    
    return false
    
  } catch (error) {
    console.error('🎵 例句播放失败:', error)
    
    // 降级方案：使用震动反馈
    audioService.playFallbackFeedback()
    throw error
  }
}

/**
 * 预加载发音（简化接口）
 * @param {Array<string>} words - 单词列表
 */
async function preloadPronunciations(words) {
  return await audioService.preloadPronunciations(words)
}

/**
 * 停止音频播放（简化接口）
 */
function stopAudio() {
  audioService.stopCurrentAudio()
}

/**
 * 清理音频资源（简化接口）
 */
function cleanupAudio() {
  audioService.cleanup()
}

module.exports = {
  AudioService,
  audioService,
  playWordPronunciation,
  playSentencePronunciation,
  preloadPronunciations,
  stopAudio,
  cleanupAudio
}