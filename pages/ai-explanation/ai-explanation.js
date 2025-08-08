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
    loadingText: '魔法老师正在思考中...',
    
    // 页面状态
    hasError: false,
    errorMessage: '',
    fromDictation: false // 是否从默写页面跳转过来
  },

  /**
   * 页面加载时的处理函数
   * @param {Object} options 页面参数
   */
  onLoad(options) {
    console.log('AI讲解页面加载:', options)
    
    // 获取传递的参数
    const { word, wordData, from } = options
    
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
    
    // 检查是否从默写页面跳转过来
    const fromDictation = from === 'dictation'
    
    this.setData({
      word: word,
      wordData: parsedWordData,
      fromDictation: fromDictation
    })
    
    // 设置导航栏标题
    const titlePrefix = fromDictation ? '魔法老师来帮忙' : '魔法老师讲'
    wx.setNavigationBarTitle({
      title: `${titlePrefix}${word}`
    })
    
    // 如果是从默写页面跳转过来，显示特殊的欢迎提示
    if (fromDictation) {
      console.log('🧙‍♂️ 用户从默写页面跳转过来，显示特殊提示')
      this.setData({
        loadingText: '魔法老师来帮你攻克这个单词...'
      })
    }
    
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
      loadingText: '魔法老师正在思考中...'
    })
    
    // 动态更新loading文字
    const loadingTimer = setTimeout(() => {
      this.setData({ loadingText: '马上就好...' })
    }, 1500)
    
    try {
      // 获取AI讲解内容 - 优先使用快速模式提高性能
      const explanation = await aiService.generateWordExplanation(word, {
        level: 'elementary',
        style: 'friendly',
        quick: this.data.fromDictation ? false : true // 从默写跳转用详细模式，其他用快速模式
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
    
    // 清理和格式化文本
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '$1') // 移除markdown粗体标记
      .replace(/\*(.*?)\*/g, '$1')     // 移除markdown斜体标记
      .trim()
    
    // 确保内容结构清晰，保持原有的换行格式
    return formatted
  },

  /**
   * 获取预设的讲解内容（降级方案）
   * @param {string} word 单词
   * @returns {string} 预设讲解内容
   */
  getFallbackExplanation(word) {
    const fallbackExplanations = {
      'cat': `📖【核心含义】
Cat是猫咪，家里常见的宠物动物

🏠【实用例句】
• I have a cat. 
  我有一只猫咪。
• The cat is sleeping. 
  猫咪在睡觉。
• My cat likes fish. 
  我的猫咪喜欢吃鱼。

🎯【记忆方法】
做猫爪手势，学猫叫"meow"来记忆

✨【词汇扩展】
• 复数形式：cats（很多猫咪）
• 相关词：dog（狗）、pet（宠物）`,

      'dog': `📖【核心含义】
Dog是狗狗，人类最好的朋友

🏠【实用例句】
• I have a dog. 
  我有一只狗狗。
• The dog is running. 
  狗狗在跑步。
• Dogs like to play. 
  狗狗喜欢玩耍。

🎯【记忆方法】
学狗叫声"woof woof"来记忆

✨【词汇扩展】
• 复数形式：dogs（很多狗狗）
• 相关词：cat（猫）、bone（骨头）`,

      'apple': `📖【核心含义】
Apple是苹果，红色的水果，脆脆甜甜

🏠【实用例句】
• I like apples. 
  我喜欢苹果。
• This apple is sweet. 
  这个苹果很甜。
• I eat an apple every day. 
  我每天吃一个苹果。

🎯【记忆方法】
做咬苹果动作，发出"咔嚓"声

✨【词汇扩展】
• 复数形式：apples（很多苹果）
• 相关词：fruit（水果）、orange（橙子）`
    }
    
    return fallbackExplanations[word.toLowerCase()] || 
           `📖【核心含义】
${word} 是一个很有用的英语单词

🏠【学习建议】
• 多读几遍加深印象
• 尝试在句子中使用这个单词
• 和朋友一起练习会更有趣

💡【小贴士】
学习单词需要反复练习，不要着急，慢慢来！`
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