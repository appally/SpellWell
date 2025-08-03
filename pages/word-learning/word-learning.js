// pages/word-learning/word-learning.js
const util = require('../../utils/util.js')
const dataManager = require('../../utils/data-manager.js')
const aiService = require('../../utils/ai-service.js')

Page({
  data: {
    // 关卡信息
    levelData: null,
    currentWordIndex: 0,
    currentWord: null,
    
    // 学习状态
    mode: 'learn', // learn, confirm, dictation, result
    showAIExplanation: false,
    aiExplanation: '',
    isLoadingAI: false,
    
    // 默写状态
    dictationInput: '',
    dictationAttempts: 0,
    maxAttempts: 3,
    showHint: false,
    dictationHintText: '',
    
    // 字母拼写游戏数据
    targetWord: '',
    shuffledLetters: [],
    userAnswer: [],
    sentenceWithBlank: '',

    showHintOption: false,
    
    // 统计数据
    stats: {
      correct: 0,
      total: 0,
      streak: 0
    },
    
    // UI状态
    showFeedback: false,
    feedbackData: {},
    progressPercentage: 0,
    accuracyPercentage: 0,
    
    // 学习会话数据
    sessionId: '',
    wordStartTime: null
  },

  onLoad(options) {
    console.log('单词学习页面加载', options)
    
    // 初始化会话ID
    const sessionId = `word_learning_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    this.setData({
      sessionId,
      wordStartTime: Date.now()
    })
    
    // 加载关卡数据
    this.loadLevelData(options)
    
    // 初始化页面
    this.initializePage()
  },

  onReady() {
    console.log('单词学习页面渲染完成')
  },

  onShow() {
    // 页面显示时的处理
  },

  onHide() {
    // 页面隐藏时的处理
  },

  onUnload() {
    // 页面卸载时的处理
  },

  /**
   * 加载关卡数据
   */
  async loadLevelData(options) {
    try {
      // 兼容不同的参数名：levelId 或 level
      const levelId = options.levelId || options.level
      if (!levelId) {
        console.error('缺少关卡ID参数')
        wx.showModal({
          title: '错误',
          content: '关卡数据加载失败',
          showCancel: false,
          success: () => {
            wx.navigateBack()
          }
        })
        return
      }

      const levelData = await dataManager.getLevelData(levelId)
      if (!levelData) {
        throw new Error('关卡数据不存在')
      }

      this.setData({
        levelData,
        currentWordIndex: 0
      })

      // 加载第一个单词
      this.loadCurrentWord()

    } catch (error) {
      console.error('加载关卡数据失败:', error)
      wx.showModal({
        title: '加载失败',
        content: '无法加载关卡数据，请重试',
        showCancel: false,
        success: () => {
          wx.navigateBack()
        }
      })
    }
  },

  /**
   * 初始化页面
   */
  initializePage() {
    // 更新进度
    this.updateProgress()
  },

  /**
   * 加载当前单词
   */
  loadCurrentWord() {
    const { levelData, currentWordIndex } = this.data
    
    if (!levelData || !levelData.words || currentWordIndex >= levelData.words.length) {
      console.error('单词数据不存在或索引超出范围')
      return
    }

    const currentWord = levelData.words[currentWordIndex]
    
    this.setData({
      currentWord,
      mode: 'learn',
      showAIExplanation: false,
      aiExplanation: '',
      wordStartTime: Date.now()
    })

    console.log('📚 加载单词详细信息:', currentWord)
    console.log('📊 单词数据结构:')
    console.log('  - word 属性:', currentWord?.word, typeof currentWord?.word)
    console.log('  - chinese 属性:', currentWord?.chinese, typeof currentWord?.chinese)
    console.log('  - 完整数据:', JSON.stringify(currentWord, null, 2))
  },


  /**
   * 获取AI讲解 - 优化UX版本
   */
  async onGetAIExplanation() {
    const { currentWord, isLoadingAI } = this.data
    
    if (!currentWord || isLoadingAI) return

    // 立即显示loading UI
    this.setData({
      isLoadingAI: true,
      showAIExplanation: true, // 立即显示弹窗
      loadingText: 'AI老师正在思考中...',
      showDetailedMode: false
    })

    // 动态更新loading文字
    setTimeout(() => {
      this.setData({ loadingText: '马上就好...' })
    }, 1500)

    try {
      // 首先获取快速版本
      const quickExplanation = await aiService.generateWordExplanation(currentWord.word, {
        level: 'elementary',
        style: 'friendly',
        quick: true // 启用快速模式
      })

      // 格式化快速版本
      const formattedQuick = this.formatAIExplanation(quickExplanation)

      // 显示快速内容
      this.setData({
        aiExplanation: formattedQuick,
        isLoadingAI: false,
        loadingText: '准备好了！'
      })

      // 预加载详细版本（后台加载）
      this.preloadDetailedExplanation(currentWord.word)

    } catch (error) {
      console.error('获取AI讲解失败:', error)
      
      // 使用预设讲解作为降级方案
      const fallbackExplanation = this.getFallbackExplanation(currentWord.word)
      
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
   * 预加载详细讲解（后台静默加载）
   */
  async preloadDetailedExplanation(word) {
    try {
      const detailedExplanation = await aiService.generateWordExplanation(word, {
        level: 'elementary',
        style: 'friendly',
        quick: false // 详细模式
      })
      
      // 缓存详细内容，用户点击时立即显示
      this.detailedExplanation = this.formatAIExplanation(detailedExplanation)
      console.log('📚 详细讲解已预加载完成')
      
    } catch (error) {
      console.log('预加载详细讲解失败，将使用扩展版本:', error)
      this.detailedExplanation = null
    }
  },

  /**
   * 显示详细讲解
   */
  onShowDetailedExplanation() {
    if (this.detailedExplanation) {
      // 使用预加载的详细内容
      this.setData({
        aiExplanation: this.detailedExplanation,
        showDetailedMode: true
      })
    } else {
      // 降级：显示扩展版本提示
      wx.showModal({
        title: '📚 更多内容',
        content: '详细讲解正在准备中，请稍后再试，或联系老师获取更多学习资料！',
        showCancel: false,
        confirmText: '好的'
      })
    }
  },

  /**
   * 格式化AI输出，提高可读性
   */
  formatAIExplanation(text) {
    if (!text) return ''
    
    // 确保换行正确显示
    let formatted = text.replace(/\n/g, '\n')
    
    // 为不同部分添加适当的间距
    formatted = formatted.replace(/(\*\*\【[^】]+\】\*\*)/g, '\n$1')
    
    return formatted
  },

  /**
   * 获取降级讲解内容
   */
  getFallbackExplanation(word) {
    const fallbackExplanations = {
      'a': `🌟 **【趣味解释】** "A"是英语字母表的第一个字母，也是最常用的小词！它就像一个神奇的介绍师，帮我们认识新朋友。

🏠 **【生活实例】**
• I have a cat. - 我有一只猫咪。
• This is a book. - 这是一本书。

🧠 **【记忆诀窍】** "A"的读音像"诶"，想象你指着东西惊喜地说"诶！这是一个..."

🎮 **【小游戏】** 在房间里找5样东西，用"This is a..."介绍给家人听！`,
      
      'apple': `🍎 **【趣味解释】** Apple是大自然的甜蜜礼物！圆圆的、脆脆的，咬一口甜甜的汁水在嘴里爆开！

🏠 **【生活实例】**
• I eat an apple every day. - 我每天都吃一个苹果。
• The apple is red and sweet. - 苹果又红又甜。

🧠 **【记忆诀窍】** Apple读音像"爱泡"→苹果爱泡在蜂蜜里变更甜！

🎮 **【小游戏】** 画苹果树，每说对一次"apple"就画一个苹果🍎`
    }
    
    return fallbackExplanations[word.toLowerCase()] || 
      `🌟 让我们一起学习"${word}"这个有趣的英语单词吧！虽然暂时无法获取详细讲解，但这个单词一定有它独特的魅力。试着在生活中多使用它，你会发现学英语其实很有趣！💪`
  },

  /**
   * 确认学习完成，进入默写模式
   */
  onConfirmLearning() {
    const { currentWord } = this.data
    console.log('🚀 确认学习，当前单词:', currentWord)
    
    // 详细分析currentWord数据结构
    console.log('📊 单词详细数据:')
    console.log('  - word:', currentWord?.word)
    console.log('  - chinese:', currentWord?.chinese)
    console.log('  - phonetic:', currentWord?.phonetic)
    console.log('  - sentence:', currentWord?.sentence)
    
    this.setupLetterSpellingGame(currentWord)
  },

  /**
   * 设置字母拼写游戏
   */
  setupLetterSpellingGame(word) {
    console.log('🎮 设置字母拼写游戏，输入单词:', word)
    
    // 验证单词数据
    if (!word || !word.word) {
      console.error('❌ 单词数据无效:', word)
      wx.showModal({
        title: '错误',
        content: '单词数据无效，请重试',
        showCancel: false
      })
      return
    }
    
    const targetWord = word.word.toLowerCase()
    console.log('🎯 目标单词:', targetWord)
    
    // 检查是否为英文单词
    if (!/^[a-zA-Z]+$/.test(targetWord)) {
      console.error('❌ 非英文单词:', targetWord)
      console.error('📋 完整单词数据:', word)
      
      // 数据修复逻辑
      console.log('🔍 尝试修复数据问题...')
      
      // 情况1: word.word是中文，需要查找对应的英文单词
      if (word.chinese && word.chinese === targetWord) {
        console.log('📋 检测到word.word是中文，尝试查找正确的英文单词...')
        
        // 查找正确的英文单词
        const wordLibrary = require('../../utils/word-library.js')
        const allWords = wordLibrary.getAllPrimaryWords()
        const correctWord = allWords.find(w => w.chinese === targetWord)
        
        if (correctWord && correctWord.word !== targetWord) {
          console.log('✅ 找到正确的英文单词:', correctWord)
          this.setupLetterSpellingGame(correctWord)
          return
        }
      }
      
      // 情况2: 直接使用word对象的其他属性
      if (word.word && word.word !== targetWord && /^[a-zA-Z]+$/.test(word.word)) {
        console.log('🔄 使用word对象的word属性:', word.word)
        const correctedWord = {
          ...word,
          word: word.word
        }
        this.setupLetterSpellingGame(correctedWord)
        return
      }
      
      // 情况3: 如果是字母"a"的特殊情况
      if (targetWord === '一' || word.chinese === '一个') {
        console.log('🔤 检测到字母"a"的特殊情况，使用默认数据')
        const letterA = {
          word: 'a',
          phonetic: '/eɪ/',
          chinese: '一个',
          sentence: 'A happy elephant is a good friend.',
          image: '📝',
          category: '基础词汇',
          difficulty: 'easy'
        }
        this.setupLetterSpellingGame(letterA)
        return
      }
      
      wx.showModal({
        title: '数据错误', 
        content: `检测到无效单词数据: ${targetWord}，请检查单词库数据`,
        showCancel: false,
        success: () => {
          // 返回上一页或重新加载
          wx.navigateBack()
        }
      })
      return
    }
    
    const letters = targetWord.split('')
    console.log('📝 分割后的字母:', letters)
    
    // 打乱字母顺序
    const shuffledLetters = this.shuffleArray([...letters]).map((char, index) => ({
      char: char.toLowerCase(), // 改为小写
      used: false,
      correct: false,
      originalIndex: index
    }))
    
    console.log('🔀 打乱后的字母数据:', shuffledLetters)
    
    // 验证字母数据的完整性
    const hasValidChars = shuffledLetters.every(letter => 
      letter.char && typeof letter.char === 'string' && letter.char.length === 1
    )
    
    if (!hasValidChars) {
      console.error('❌ 字母数据无效:', shuffledLetters)
      wx.showModal({
        title: '数据错误',
        content: '字母数据格式错误，请检查',
        showCancel: false
      })
      return
    }
    
    // 生成填空句子
    const sentenceWithBlank = this.createSentenceWithBlank(word.sentence, word.word)
    
    this.setData({
      mode: 'dictation',
      targetWord: targetWord,
      shuffledLetters: shuffledLetters,
      userAnswer: [],
      sentenceWithBlank: sentenceWithBlank,
  
      showHintOption: false,
      dictationAttempts: 0
    })
    
    console.log('✅ 字母拼写游戏初始化完成')
    
    // 测试：输出setData后的实际数据
    setTimeout(() => {
      console.log('🔍 验证setData后的实际数据:')
      console.log('  shuffledLetters:', this.data.shuffledLetters)
      console.log('  mode:', this.data.mode)
      console.log('  targetWord:', this.data.targetWord)
    }, 100)
  },

  /**
   * 打乱数组顺序
   */
  shuffleArray(array) {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  },

  /**
   * 创建填空句子
   */
  createSentenceWithBlank(sentence, word) {
    if (!sentence || !word) return ''
    
    // 使用正则表达式替换单词（不区分大小写）
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    const blank = '_'.repeat(word.length)
    return sentence.replace(regex, blank)
  },

  /**
   * 点击字母按钮
   */
  onLetterTap(e) {
    const { index } = e.currentTarget.dataset
    const { shuffledLetters, userAnswer, targetWord } = this.data
    
    // 从 shuffledLetters 数组中获取字母，而不是从 dataset
    const letterData = shuffledLetters[index]
    if (!letterData) {
      console.error('找不到字母数据:', index)
      return
    }
    
    const letter = letterData.char
    
    // 检查字母是否已被使用
    if (letterData.used) return
    
    // 标记字母为已使用
    const newShuffledLetters = [...shuffledLetters]
    newShuffledLetters[index].used = true
    
    // 添加到用户答案
    const newUserAnswer = [...userAnswer]
    const expectedLetter = targetWord[userAnswer.length]
    const isCorrect = letter.toLowerCase() === expectedLetter
    
    const answerLetter = {
      char: letter.toLowerCase(), // 确保答案区也是小写
      status: isCorrect ? 'correct' : 'wrong',
      letterIndex: index
    }
    newUserAnswer.push(answerLetter)
    
    console.log('🔤 添加答案字母:', answerLetter)
    console.log('📝 当前答案数组:', newUserAnswer)
    
    // 如果字母错误，显示震动效果
    if (!isCorrect) {
      wx.vibrateShort()
      this.setData({
        showHintOption: true
      })
    }
    
    this.setData({
      shuffledLetters: newShuffledLetters,
      userAnswer: newUserAnswer
    })
    
    // 检查是否完成
    if (newUserAnswer.length === targetWord.length) {
      this.checkSpellingCompletion(newUserAnswer)
    }
  },

  /**
   * 检查拼写完成
   */
  checkSpellingCompletion(userAnswer) {
    const { targetWord } = this.data
    const userWord = userAnswer.map(item => item.char.toLowerCase()).join('')
    const isCorrect = userWord === targetWord
    
    if (isCorrect) {
      // 拼写正确，直接处理完成逻辑，不显示内联完成消息
      // 使用反馈弹窗统一显示庆祝信息
      this.handleWordCompletion(true)
    } else {
      // 拼写错误，等待1秒后自动重置
      setTimeout(() => {
        this.onResetAnswer()
      }, 1000)
    }
  },

  /**
   * 重新开始拼写
   */
  onResetAnswer() {
    const { targetWord, currentWord } = this.data
    
    // 重新打乱字母
    const letters = targetWord.split('')
    const shuffledLetters = this.shuffleArray([...letters]).map((char, index) => ({
      char: char.toLowerCase(), // 改为小写
      used: false,
      correct: false,
      originalIndex: index
    }))
    
    this.setData({
      shuffledLetters: shuffledLetters,
      userAnswer: [],
  
      dictationAttempts: this.data.dictationAttempts + 1
    })
  },

  /**
   * 显示字母提示
   */
  onShowLetterHint() {
    const { userAnswer, targetWord, shuffledLetters } = this.data
    
    if (userAnswer.length >= targetWord.length) return
    
    // 找到下一个正确字母的位置
    const nextLetter = targetWord[userAnswer.length].toLowerCase()
    const hintIndex = shuffledLetters.findIndex(letter => 
      letter.char.toLowerCase() === nextLetter && !letter.used
    )
    
    if (hintIndex !== -1) {
      // 高亮提示字母
      const newShuffledLetters = [...shuffledLetters]
      newShuffledLetters[hintIndex].correct = true
      
      this.setData({
        shuffledLetters: newShuffledLetters
      })
      
      // 1秒后移除高亮
      setTimeout(() => {
        const resetLetters = [...newShuffledLetters]
        resetLetters[hintIndex].correct = false
        this.setData({
          shuffledLetters: resetLetters
        })
      }, 1000)
    }
  },

  /**
   * 确认掌握单词
   */
  onConfirmMastery() {
    this.handleWordCompletion(true)
  },

  /**
   * 需要重新学习
   */
  onNeedRelearn() {
    this.setData({
      mode: 'learn',
      showAIExplanation: false
    })
  },

  /**
   * 默写输入处理
   */
  onDictationInput(e) {
    this.setData({
      dictationInput: e.detail.value
    })
  },

  /**
   * 提交默写答案
   */
  onSubmitDictation() {
    const { currentWord, dictationInput, dictationAttempts, maxAttempts } = this.data
    
    if (!dictationInput.trim()) {
      wx.showToast({
        title: '请输入单词',
        icon: 'none'
      })
      return
    }

    const isCorrect = dictationInput.trim().toLowerCase() === currentWord.word.toLowerCase()
    const newAttempts = dictationAttempts + 1

    if (isCorrect) {
      // 默写成功
      this.handleWordCompletion(true)
    } else if (newAttempts >= maxAttempts) {
      // 达到最大尝试次数，显示正确答案并标记为失败
      wx.showModal({
        title: '默写完成',
        content: `正确答案是: ${currentWord.word}`,
        showCancel: false,
        success: () => {
          this.handleWordCompletion(false)
        }
      })
    } else {
      // 继续尝试，显示提示
      this.setData({
        dictationAttempts: newAttempts,
        showHint: newAttempts >= 2, // 第二次错误后显示提示
        dictationInput: ''
      })
      
      wx.showToast({
        title: `还有${maxAttempts - newAttempts}次机会`,
        icon: 'none'
      })
    }
  },

  /**
   * 跳过默写
   */
  onSkipDictation() {
    wx.showModal({
      title: '确认跳过',
      content: '跳过默写将直接进入下一个单词，确定吗？',
      success: (res) => {
        if (res.confirm) {
          this.handleWordCompletion(false)
        }
      }
    })
  },

  /**
   * 显示默写提示
   */
  onShowDictationHint() {
    this.setData({
      showHint: true
    })
  },

  /**
   * 生成提示文本
   */
  generateHintText(word) {
    if (!word || word.length === 0) return ''
    return word.charAt(0) + '*'.repeat(word.length - 1)
  },

  /**
   * 处理单词完成
   */
  async handleWordCompletion(success) {
    const { currentWord, currentWordIndex, levelData, stats } = this.data
    
    try {
      // 记录学习结果
      const learningTime = Date.now() - this.data.wordStartTime
      await dataManager.recordWordProgress(currentWord.word, {
        success,
        timeTaken: learningTime,
        sessionId: this.data.sessionId
      })

      // 更新统计
      const newStats = {
        total: stats.total + 1,
        correct: success ? stats.correct + 1 : stats.correct,
        streak: success ? stats.streak + 1 : 0
      }

      this.setData({
        stats: newStats
      })

      // 显示反馈
      this.showWordFeedback(success)

      // 延迟后进入下一个单词或完成关卡
      setTimeout(() => {
        this.proceedToNext()
      }, 2500) // 稍微延长一点时间让用户享受成功的感觉

    } catch (error) {
      console.error('记录学习进度失败:', error)
      // 即使记录失败也继续学习流程
      this.proceedToNext()
    }
  },

  /**
   * 显示单词反馈
   */
  showWordFeedback(success) {
    const { currentWord } = this.data
    
    const feedbackData = {
      success,
      word: currentWord.word,
      message: success ? '拼写正确！继续加油！' : '再试一次，你可以的！'
    }

    this.setData({
      showFeedback: true,
      feedbackData,
      mode: 'result'
    })
  },

  /**
   * 进入下一个单词或完成关卡
   */
  proceedToNext() {
    const { currentWordIndex, levelData } = this.data
    
    if (currentWordIndex + 1 < levelData.words.length) {
      // 还有更多单词
      this.setData({
        currentWordIndex: currentWordIndex + 1,
        showFeedback: false,
        feedbackData: {}
      })
      
      this.loadCurrentWord()
      this.updateProgress()
      
    } else {
      // 关卡完成
      this.completeLevelLearning()
    }
  },

  /**
   * 完成关卡学习
   */
  async completeLevelLearning() {
    const { levelData, stats } = this.data
    
    console.log(`完成关卡学习: level=${levelData.level}, stats=${stats.correct}/${stats.total}`)
    
    try {
      // 记录关卡完成
      await dataManager.completeLevelProgress(levelData.level, {
        accuracy: stats.total > 0 ? (stats.correct / stats.total * 100) : 0,
        totalWords: stats.total,
        correctWords: stats.correct,
        sessionId: this.data.sessionId
      })

      // 显示完成页面
      wx.showModal({
        title: '关卡完成！',
        content: `你完成了 ${stats.correct}/${stats.total} 个单词的学习`,
        showCancel: false,
        confirmText: '返回地图',
        success: () => {
          wx.navigateBack()
        }
      })

    } catch (error) {
      console.error('完成关卡记录失败:', error)
      wx.navigateBack()
    }
  },

  /**
   * 更新进度
   */
  updateProgress() {
    const { currentWordIndex, levelData, stats } = this.data
    
    if (!levelData || !levelData.words) return

    const progressPercentage = Math.round((currentWordIndex / levelData.words.length) * 100)
    const accuracyPercentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0

    this.setData({
      progressPercentage,
      accuracyPercentage
    })
  },

  /**
   * 返回地图
   */
  onBackToMap() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出当前学习吗？进度将不会保存。',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack()
        }
      }
    })
  },

  /**
   * 关闭AI讲解
   */
  onCloseAIExplanation() {
    this.setData({
      showAIExplanation: false,
      aiExplanation: '', // 清理内容，节省内存
      isLoadingAI: false, // 重置loading状态
      loadingText: '',
      showDetailedMode: false
    })
    
    // 清理预加载的详细内容
    this.detailedExplanation = null
  },

  /**
   * 预加载AI讲解（性能优化）
   */
  async preloadAIExplanation() {
    if (!this.data.currentWord) return
    
    try {
      // 异步预加载，不阻塞主流程
      setTimeout(async () => {
        const aiService = require('../../utils/ai-service.js')
        // 检查缓存，如果没有则预加载
        const cached = aiService.getCachedExplanation(this.data.currentWord.word)
        if (!cached) {
          console.log('🔄 预加载AI讲解:', this.data.currentWord.word)
          await aiService.generateWordExplanation(this.data.currentWord.word, {
            level: 'elementary',
            style: 'friendly'
          })
        }
      }, 2000) // 2秒后开始预加载
    } catch (error) {
      // 预加载失败不影响主功能
      console.log('预加载AI讲解失败:', error.message)
    }
  },

  /**
   * 关闭反馈
   */
  onCloseFeedback() {
    this.setData({
      showFeedback: false
    })
  },

})