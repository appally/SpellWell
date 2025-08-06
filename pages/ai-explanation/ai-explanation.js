/**
 * AI讲解页面
 * 专门用于显示AI生成的单词讲解内容
 */

const aiService = require('../../utils/ai-service.js')

Page({
  data: {
    // 单词信息
    word: '',
    wordData: null,
    
    // AI讲解内容
    aiExplanation: '',
    isLoadingAI: false,
    loadingText: 'AI老师正在思考中...',
    
    // 页面状态
    hasError: false,
    errorMessage: ''
  },

  /**
   * 页面加载时的处理函数
   * @param {Object} options 页面参数
   */
  onLoad(options) {
    console.log('AI讲解页面加载:', options)
    
    // 获取传递的参数
    const { word, wordData } = options
    
    if (!word) {
      this.setData({
        hasError: true,
        errorMessage: '缺少单词参数'
      })
      return
    }
    
    // 解析单词数据
    let parsedWordData = null
    if (wordData) {
      try {
        parsedWordData = JSON.parse(decodeURIComponent(wordData))
      } catch (error) {
        console.warn('解析单词数据失败:', error)
      }
    }
    
    this.setData({
      word: word,
      wordData: parsedWordData
    })
    
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: `${word} - AI讲解`
    })
    
    // 开始获取AI讲解
    this.loadAIExplanation()
  },

  /**
   * 获取AI讲解内容
   */
  async loadAIExplanation() {
    const { word } = this.data
    
    this.setData({
      isLoadingAI: true,
      hasError: false,
      loadingText: 'AI老师正在思考中...'
    })
    
    // 动态更新loading文字
    const loadingTimer = setTimeout(() => {
      this.setData({ loadingText: '马上就好...' })
    }, 1500)
    
    try {
      // 获取AI讲解内容 - 使用详细模式
      const explanation = await aiService.generateWordExplanation(word, {
        level: 'elementary',
        style: 'friendly',
        quick: false // 启用详细模式，获取丰富内容
      })
      
      clearTimeout(loadingTimer)
      
      // 格式化内容
      const formatted = this.formatAIExplanation(explanation)
      
      this.setData({
        aiExplanation: formatted,
        isLoadingAI: false
      })
      
    } catch (error) {
      clearTimeout(loadingTimer)
      console.error('获取AI讲解失败:', error)
      
      // 使用预设讲解作为降级方案
      const fallbackExplanation = this.getFallbackExplanation(word)
      
      this.setData({
        aiExplanation: fallbackExplanation,
        isLoadingAI: false
      })
      
      wx.showToast({
        title: '使用离线讲解',
        icon: 'none',
        duration: 2000
      })
    }
  },

  /**
   * 格式化AI讲解内容
   * @param {string} text 原始AI讲解文本
   * @returns {string} 格式化后的文本
   */
  formatAIExplanation(text) {
    if (!text) return '暂无讲解内容'
    
    // 简单的格式化处理
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // 移除markdown粗体标记
      .replace(/\*(.*?)\*/g, '$1')     // 移除markdown斜体标记
      .trim()
  },

  /**
   * 获取预设的讲解内容（降级方案）
   * @param {string} word 单词
   * @returns {string} 预设讲解内容
   */
  getFallbackExplanation(word) {
    const fallbackExplanations = {
      'cat': '🐱 Cat是小猫咪的意思！\n\n🏠 生活实例：\n• I have a cat. 我有一只猫咪。\n• The cat is sleeping. 猫咪在睡觉。\n\n🧠 记忆诀窍：\nCat的发音像"凯特"，想象一个叫凯特的小女孩养了一只可爱的小猫咪！',
      'dog': '🐶 Dog是小狗狗的意思！\n\n🏠 生活实例：\n• My dog is cute. 我的狗狗很可爱。\n• The dog likes to play. 狗狗喜欢玩耍。\n\n🧠 记忆诀窍：\nDog听起来像"多格"，想象有很多格子，每个格子里都有一只可爱的小狗狗！',
      'book': '📚 Book是书本的意思！\n\n🏠 生活实例：\n• I read a book. 我读一本书。\n• This book is interesting. 这本书很有趣。\n\n🧠 记忆诀窍：\nBook的发音像"布克"，想象用布包着的珍贵书籍！'
    }
    
    return fallbackExplanations[word.toLowerCase()] || 
           `📖 ${word}\n\n这是一个很有用的英语单词！\n\n💡 建议：\n• 多读几遍加深印象\n• 尝试在句子中使用这个单词\n• 和朋友一起练习会更有趣哦！`
  },

  /**
   * 重新获取AI讲解
   */
  onRetryExplanation() {
    this.loadAIExplanation()
  },

  /**
   * 返回上一页
   */
  onGoBack() {
    wx.navigateBack({
      delta: 1
    })
  },

  /**
   * 分享功能
   */
  onShareAppMessage() {
    const { word } = this.data
    return {
      title: `学习单词 "${word}" - SpellWell`,
      path: `/pages/ai-explanation/ai-explanation?word=${word}`,
      imageUrl: '/images/logo.png'
    }
  }
})