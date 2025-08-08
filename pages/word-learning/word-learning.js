// pages/word-learning/word-learning.js
const util = require('../../utils/util.js')
const dataManager = require('../../utils/data-manager.js')
const aiService = require('../../utils/ai-service.js')
const { playWordPronunciation, playSentencePronunciation, preloadPronunciations, cleanupAudio, playSuccessSound, playErrorSound } = require('../../utils/audio-service.js')
const { processPageEmojis } = require('../../utils/emoji-compatibility')

Page({
  data: {
    // 关卡信息
    levelData: null,
    currentWordIndex: 0,
    currentWord: null,
    
    // 学习状态
    mode: 'learn', // learn, confirm, dictation, result
    
    // 默写状态
    dictationInput: '',
    dictationAttempts: 0,
    maxAttempts: 3,
    showHint: false,
    dictationHintText: '',
    
    // 学习会话统计数据
    sessionStats: {
      totalWords: 0,           // 总单词数
      completedWords: 0,       // 完成单词数
      errorWords: new Set(),   // 出错单词集合 (使用Set避免重复)
      totalErrors: 0,          // 总错误次数
      skippedWords: new Set(), // 跳过单词集合
      correctAttempts: 0       // 正确尝试次数
    },
    
    // 记忆方法相关
    memoryTipContent: '',
    showMemoryTip: false,
    memoryTipLoading: false,
    preloadingMemoryTip: false,
    
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
    
    // 庆祝动画相关
    showCelebrationAnimation: false,
    celebrationWord: '',
    progressPercentage: 0,
    accuracyPercentage: 0,

    // 庆祝弹窗状态
    showCelebration: false,
    starRating: 0,
    experienceGained: 0,
    countdownSeconds: 3,
    countdownTimer: null,

    // 学习会话数据
    sessionId: '',
    wordStartTime: null,
    
    // 动画状态变量
    wordFlashAnimation: false,
    sentenceWordAnimation: false,
    sentenceWithWord: '',
    answerCompleted: false, // 添加答案完成状态
    // 错误爆炸动画状态
    explodeAnimation: false,
    // 朗读加载状态
    wordAudioLoading: false,
    sentenceAudioLoading: false
  },

  onLoad(options) {
    console.log('单词学习页面加载', options)
    
    // 初始化会话ID
    const sessionId = `word_learning_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // 性能监控：记录页面加载开始时间
    this.pageLoadStartTime = Date.now()
    
    this.setData({
      sessionId,
      wordStartTime: Date.now(),
      // 初始化会话统计数据
      sessionStats: {
        totalWords: 0,
        completedWords: 0,
        errorWords: new Set(),
        totalErrors: 0,
        skippedWords: new Set(),
        correctAttempts: 0
      }
    })
    
    // 性能优化：预加载关键资源
    this.preloadCriticalResources()
    
    // 保存关卡ID和focusWord用于进度保存
    this.levelId = options.levelId || options.level
    this.focusWord = options.focusWord // 保存focusWord参数
    
    // 加载关卡数据
    this.loadLevelData(options)
    
    // 初始化页面
    this.initializePage()
  },

  onReady() {
    console.log('单词学习页面渲染完成')
    
    // 性能监控：记录页面渲染完成时间
    const pageLoadTime = Date.now() - this.pageLoadStartTime
    console.log(`📊 页面加载性能: ${pageLoadTime}ms`)
    
    // 应用表情符号兼容性处理
    processPageEmojis(this)
    
    // 性能优化：延迟加载非关键资源
    this.loadNonCriticalResources()
  },

  onShow() {
    // 页面显示时的处理
  },

  onHide() {
    // 页面隐藏时保存进度
    this.saveCurrentProgress()
  },

  onUnload() {
    // 页面卸载时保存进度
    this.saveCurrentProgress()
    
    // 性能优化：清理内存
    this.cleanupMemory()
    
    // 清理音频资源
    cleanupAudio()
    
    console.log('🏁 页面卸载，资源清理完成')
  },

  /**
   * 加载关卡数据
   */
  async loadLevelData(options) {
    try {
      // 检查是否是单个单词模式（从AI讲解页面跳转过来）
      if (options.word && options.wordData) {
        const wordData = JSON.parse(decodeURIComponent(options.wordData))
        const singleWordLevel = {
          id: 'single_word',
          name: '单词练习',
          words: [wordData]
        }
        
        this.setData({
          levelData: singleWordLevel,
          currentWordIndex: 0,
          mode: options.mode || 'learn' // 支持指定模式
        })
        
        // 加载单词
        this.loadCurrentWord()
        return
      }
      
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

      let startWordIndex = 0
      
      // 检查是否有focusWord参数，如果有则定位到该单词
      if (options.focusWord) {
        const focusWordIndex = levelData.words.findIndex(word => 
          word.word.toLowerCase() === options.focusWord.toLowerCase()
        )
        if (focusWordIndex !== -1) {
          startWordIndex = focusWordIndex
          console.log(`🎯 定位到目标单词: ${options.focusWord}，索引: ${focusWordIndex}`)
        } else {
          console.warn(`⚠️ 未找到目标单词: ${options.focusWord}，从第一个单词开始`)
        }
      }

      this.setData({
        levelData,
        currentWordIndex: startWordIndex
      })

      // 检查是否有中途进度需要恢复
      // 如果有进度恢复，restoreProgress会处理单词加载
      // 如果没有进度或用户选择重新开始，则正常加载第一个单词
      const hasProgress = await this.checkAndRestoreProgress()
      
      // 只有在没有恢复进度的情况下才加载当前单词
      if (!hasProgress) {
        this.loadCurrentWord()
      }

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
    
    console.log('📚 加载新单词，切换到学习模式')
    console.log('  - 单词:', currentWord.word)
    console.log('  - 例句:', currentWord.sentence)
    
    this.setData({
      currentWord,
      mode: 'learn',
      showAIExplanation: false,
      aiExplanation: '',
      wordStartTime: Date.now(),
      // 清除默写模式的数据，避免数据残留
      sentenceWithBlank: '',
      targetWord: '',
      shuffledLetters: [],
      userAnswer: [],
      // 重置视觉反馈状态
      answerCompleted: false,
      wordFlashAnimation: false,
      explodeAnimation: false,
      // 重置朗读加载状态
      wordAudioLoading: false,
      sentenceAudioLoading: false,
      // 重置记忆方法相关状态（但保护正在显示的弹窗）
      memoryTipContent: this.data.showMemoryTip ? this.data.memoryTipContent : '',
      showMemoryTip: this.data.showMemoryTip || false, // 如果弹窗正在显示，保持状态
      memoryTipLoading: this.data.showMemoryTip ? this.data.memoryTipLoading : false,
      preloadingMemoryTip: false
    })
    
    console.log('✅ 学习模式数据设置完成，已清除默写模式残留数据')

    // 预加载AI讲解
    this.preloadAIExplanation()
    
    // 预加载当前和后续单词的发音
    this.preloadWordPronunciations()

    console.log('📚 加载单词详细信息:', currentWord)
    console.log('📊 单词数据结构:')
    console.log('  - word 属性:', currentWord?.word, typeof currentWord?.word)
    console.log('  - chinese 属性:', currentWord?.chinese, typeof currentWord?.chinese)
    console.log('  - 完整数据:', JSON.stringify(currentWord, null, 2))
  },


  /**
   * 播放单词发音
   */
  onPlayPronunciation() {
    const { currentWord, wordAudioLoading } = this.data
    
    if (!currentWord || !currentWord.word) {
      wx.showToast({
        title: '单词数据无效',
        icon: 'none'
      })
      return
    }

    // 防止重复点击
    if (wordAudioLoading) {
      return
    }

    // 设置加载状态
    this.setData({
      wordAudioLoading: true
    })

    playWordPronunciation(currentWord.word)
      .then(() => {
        console.log('播放发音成功:', currentWord.word)
      })
      .catch((error) => {
        console.error('播放发音失败:', error)
        wx.showToast({
          title: '发音播放失败',
          icon: 'none'
        })
      })
      .finally(() => {
        // 延迟一点时间再移除加载状态，确保用户看到反馈
        setTimeout(() => {
          this.setData({
            wordAudioLoading: false
          })
        }, 800)
      })
  },

  /**
   * 播放例句朗读
   * 点击例句文本时调用此方法
   */
  onPlaySentence() {
    const { currentWord, sentenceWithBlank, mode, sentenceAudioLoading } = this.data
    
    console.log('🔊 开始播放例句')
    console.log('📋 当前模式:', mode)
    console.log('📝 当前单词:', currentWord)
    console.log('📄 带空白例句:', sentenceWithBlank)
    
    // 防止重复点击
    if (sentenceAudioLoading) {
      return
    }
    
    // 确定要播放的例句内容
    let sentenceText = ''
    
    if (mode === 'dictation' && sentenceWithBlank) {
      // 默写模式：播放完整例句（将空白替换为单词）
      const blankPattern = /_+/g
      sentenceText = sentenceWithBlank.replace(blankPattern, currentWord.word)
      console.log('🎯 默写模式 - 播放完整例句:', sentenceText)
    } else if (mode === 'learn' && currentWord && currentWord.sentence) {
      // 学习模式：播放完整例句
      sentenceText = currentWord.sentence
      console.log('📚 学习模式 - 播放完整例句:', sentenceText)
    } else {
      // 兜底逻辑：尝试使用当前单词的例句
      if (currentWord && currentWord.sentence) {
        sentenceText = currentWord.sentence
        console.log('🔄 兜底逻辑 - 使用当前单词例句:', sentenceText)
      }
    }
    
    if (!sentenceText) {
      console.error('❌ 无法确定要播放的例句内容')
      console.error('📊 调试信息:')
      console.error('  - mode:', mode)
      console.error('  - currentWord:', currentWord)
      console.error('  - sentenceWithBlank:', sentenceWithBlank)
      
      wx.showToast({
        title: '例句数据无效',
        icon: 'none'
      })
      return
    }

    console.log('✅ 确定播放例句:', sentenceText)
    
    // 设置加载状态
    this.setData({
      sentenceAudioLoading: true
    })
    
    playSentencePronunciation(sentenceText)
      .then(() => {
        console.log('🎵 播放例句成功:', sentenceText)
      })
      .catch((error) => {
        console.error('❌ 播放例句失败:', error)
        wx.showToast({
          title: '例句播放失败',
          icon: 'none'
        })
      })
      .finally(() => {
        // 延迟一点时间再移除加载状态，确保用户看到反馈
        setTimeout(() => {
          this.setData({
            sentenceAudioLoading: false
          })
        }, 1200) // 例句加载时间稍长一些
      })
  },

  /**
   * 预加载单词发音
   */
  preloadWordPronunciations() {
    const { levelData, currentWordIndex } = this.data
    
    if (!levelData || !levelData.words) return

    // 预加载当前单词和后续2个单词的发音
    const wordsToPreload = []
    for (let i = currentWordIndex; i < Math.min(currentWordIndex + 3, levelData.words.length); i++) {
      const word = levelData.words[i]
      if (word && word.word) {
        wordsToPreload.push(word.word)
      }
    }

    if (wordsToPreload.length > 0) {
      preloadPronunciations(wordsToPreload)
        .then(() => {
          console.log('预加载发音成功:', wordsToPreload)
        })
        .catch((error) => {
          console.log('预加载发音失败:', error.message)
        })
    }
  },

  /**
   * 获取AI讲解 - 跳转到新页面
   */
  onGetAIExplanation() {
    const { currentWord } = this.data
    
    if (!currentWord) {
      wx.showToast({
        title: '请先选择单词',
        icon: 'none'
      })
      return
    }

    // 准备传递给AI讲解页面的数据
    const wordData = {
      word: currentWord.word,
      phonetic: currentWord.phonetic,
      chinese: currentWord.chinese,
      image: currentWord.image,
      sentence: currentWord.sentence,
      tips: currentWord.tips
    }

    // 跳转到AI讲解页面
    wx.navigateTo({
      url: `/pages/ai-explanation/ai-explanation?word=${currentWord.word}&wordData=${encodeURIComponent(JSON.stringify(wordData))}`,
      success: () => {
        console.log('跳转到AI讲解页面成功')
      },
      fail: (error) => {
        console.error('跳转到AI讲解页面失败:', error)
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        })
      }
    })
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
    console.log('📝 生成填空句子:')
    console.log('  - 原始例句:', word.sentence)
    console.log('  - 目标单词:', word.word)
    
    const sentenceWithBlank = this.createSentenceWithBlank(word.sentence, word.word)
    console.log('  - 生成的填空句子:', sentenceWithBlank)
    
    this.setData({
      mode: 'dictation',
      targetWord: targetWord,
      shuffledLetters: shuffledLetters,
      userAnswer: [],
      sentenceWithBlank: sentenceWithBlank,
      dictationInput: '', // 重置输入框
      showHint: false, // 重置提示状态
      showHintOption: false,
      dictationAttempts: 0,
      // 重置视觉反馈状态
      answerCompleted: false,
      wordFlashAnimation: false,
      explodeAnimation: false,
      // 重置朗读加载状态
      wordAudioLoading: false,
      sentenceAudioLoading: false
      // 注意：不重置记忆方法相关状态，保留预加载的内容
    })
    
    console.log('✅ 默写模式数据设置完成:')
    console.log('  - mode:', 'dictation')
    console.log('  - targetWord:', targetWord)
    console.log('  - sentenceWithBlank:', sentenceWithBlank)
    
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
    
    // 转义特殊字符，防止正则表达式错误
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const escapedWord = escapeRegex(word)
    
    // 匹配单词的各种形式：原形、复数、过去式等
    // 匹配规则：单词边界 + 目标单词 + 可选的常见词尾变化
    const patterns = [
      `\\b${escapedWord}s\\b`,        // 复数形式 (cats, dogs)
      `\\b${escapedWord}es\\b`,       // -es复数 (boxes, wishes)
      `\\b${escapedWord}ed\\b`,       // 过去式 (played, walked)
      `\\b${escapedWord}ing\\b`,      // 进行时 (playing, walking)
      `\\b${escapedWord}er\\b`,       // 比较级 (bigger, faster)
      `\\b${escapedWord}est\\b`,      // 最高级 (biggest, fastest)
      `\\b${escapedWord}ly\\b`,       // 副词 (quickly, slowly)
      `\\b${escapedWord}\\b`          // 原形 (cat, dog) - 放在最后确保精确匹配
    ]
    
    let result = sentence
    
    // 按顺序尝试每个模式，并记录替换的长度用于生成对应长度的下划线
    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'gi')
      result = result.replace(regex, (match) => {
        // 根据匹配到的实际单词长度生成下划线
        return '_'.repeat(match.length)
      })
    }
    
    return result
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
    
    // 如果字母错误，立即触发爆炸动画
    if (!isCorrect) {
      // 播放错误音效
      playErrorSound({ volume: 0.4 })
        .catch(() => {
          console.log('⚠️ 字母错误音效播放失败，使用震动反馈')
        })
      
      wx.vibrateShort()
      
      // 增加拼写错误次数
      const newAttempts = this.data.dictationAttempts + 1
      
      // 记录错误拼写
      const userInput = newUserAnswer.map(item => item.char).join('')
      
      // 记录到本地统计
      this.recordSpellingError(targetWord, newAttempts)
      
      // 记录到数据管理器
      dataManager.recordWordError(targetWord, {
        sessionId: this.data.sessionId,
        errorType: 'spelling',
        userInput: userInput,
        attemptNumber: newAttempts
      })
      
      console.log('🔤 字母拼写错误:', {
        userInput: userInput,
        attempts: newAttempts,
        maxAttempts: this.data.maxAttempts
      })
      
      this.setData({
        shuffledLetters: newShuffledLetters,
        userAnswer: newUserAnswer,
        showHintOption: true,
        dictationAttempts: newAttempts
      })
      
      // 检查是否达到最大错误次数
      if (newAttempts >= this.data.maxAttempts) {
        // 延迟一下再显示提示，让用户看到错误反馈
        setTimeout(() => {
          this.showMagicTeacherPrompt()
        }, 1000)
      }
      
      // 立即触发爆炸动画
      this.triggerExplodeAnimation()
      return
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
      // 拼写正确，播放成功音效
      playSuccessSound({ volume: 0.8 })
        .then(() => {
          console.log('✅ 成功音效播放完成')
        })
        .catch((error) => {
          console.log('⚠️ 成功音效播放失败，使用震动反馈')
        })
      
      // 拼写正确，先触发单词闪动动画
      this.triggerWordFlashAnimation()
      
      // 触发例句单词动画
      this.triggerSentenceWordAnimation()
      
      // 延迟处理完成逻辑，让动画播放完毕
      setTimeout(() => {
        this.handleWordCompletion(true)
      }, 1500) // 给动画足够时间播放
    } else {
      // 拼写错误，播放错误音效
      playErrorSound({ volume: 0.6 })
        .then(() => {
          console.log('❌ 错误音效播放完成')
        })
        .catch((error) => {
          console.log('⚠️ 错误音效播放失败，使用震动反馈')
        })
      
      // 拼写错误，记录错误并触发爆炸消失动画
      this.recordSpellingError(targetWord, this.data.dictationAttempts + 1)
      
      dataManager.recordWordError(targetWord, {
        sessionId: this.data.sessionId,
        errorType: 'spelling',
        userInput: userWord,
        attemptNumber: this.data.dictationAttempts + 1
      })
      
      this.triggerExplodeAnimation()
    }
  },

  /**
   * 触发单词闪动动画
   */
  triggerWordFlashAnimation() {
    // 为所有正确的字母添加闪动效果，并添加完成状态的视觉反馈
    this.setData({
      wordFlashAnimation: true,
      answerCompleted: true // 添加完成状态标记
    })
    
    // 动画结束后移除效果
    setTimeout(() => {
      this.setData({
        wordFlashAnimation: false
      })
    }, 1200)
  },

  /**
   * 触发例句单词动画
   */
  triggerSentenceWordAnimation() {
    const { currentWord, sentenceWithBlank } = this.data
    
    if (!sentenceWithBlank || !currentWord.word) return
    
    // 将下划线替换为正确的单词，并添加动画效果
    const wordLength = currentWord.word.length
    const blank = '_'.repeat(wordLength)
    const sentenceWithWord = sentenceWithBlank.replace(blank, `<span class="animated-sentence-word">${currentWord.word}</span>`)
    
    // 设置动画状态
    this.setData({
      sentenceWordAnimation: true,
      sentenceWithWord: sentenceWithWord
    })
    
    // 动画结束后恢复原状
    setTimeout(() => {
      this.setData({
        sentenceWordAnimation: false,
        sentenceWithWord: ''
      })
    }, 2000)
  },

  /**
   * 触发爆炸消失动画
   * 检测到错误字母时立即触发，将整个answer-content区域的字母作为整体进行爆炸消失
   */
  triggerExplodeAnimation() {
    // 启动爆炸动画
    this.setData({
      explodeAnimation: true
    })
    
    // 0.8秒后清空答案、重置字母区域并移除动画效果
    setTimeout(() => {
      // 重置所有字母为未使用状态
      const resetLetters = this.data.shuffledLetters.map(letter => ({
        ...letter,
        used: false,
        correct: false
      }))
      
      this.setData({
        explodeAnimation: false,
        userAnswer: [],
        shuffledLetters: resetLetters,
        showHintOption: false,
        // 重置完成状态
        answerCompleted: false,
        // 重置朗读加载状态
        wordAudioLoading: false,
        sentenceAudioLoading: false
      })
    }, 800)
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
    
    console.log('📝 提交默写:', {
      input: dictationInput,
      currentAttempts: dictationAttempts,
      maxAttempts: maxAttempts
    })
    
    if (!dictationInput.trim()) {
      wx.showToast({
        title: '请输入单词',
        icon: 'none'
      })
      return
    }

    const isCorrect = dictationInput.trim().toLowerCase() === currentWord.word.toLowerCase()
    const newAttempts = dictationAttempts + 1
    
    console.log('📝 默写结果:', {
      isCorrect: isCorrect,
      newAttempts: newAttempts,
      shouldShowMemoryTip: newAttempts >= maxAttempts
    })

    if (isCorrect) {
      // 默写成功
      this.handleWordCompletion(true)
    } else {
      // 记录听写错误
      this.recordSpellingError(currentWord.word, newAttempts)
      
      dataManager.recordWordError(currentWord.word, {
        sessionId: this.data.sessionId,
        errorType: 'dictation',
        userInput: dictationInput.trim(),
        attemptNumber: newAttempts
      })
      
      // 错误2次后开始预加载记忆方法
      if (newAttempts === 2 && !this.data.preloadingMemoryTip) {
        console.log('🔄 开始预加载记忆方法')
        this.preloadMemoryTip()
      }
      
      if (newAttempts >= maxAttempts) {
        // 达到最大尝试次数，提示用户是否需要进一步学习
        console.log('🧠 达到最大尝试次数，提示用户进一步学习，当前状态:', {
          newAttempts: newAttempts,
          maxAttempts: maxAttempts,
          currentWord: this.data.currentWord?.word
        })
        
        // 先更新尝试次数
        this.setData({
          dictationAttempts: newAttempts,
          dictationInput: ''
        })
        
        // 显示确认对话框，询问用户是否要进一步学习该单词
        wx.showModal({
          title: '需要帮助吗？',
          content: `单词"${this.data.currentWord.word}"似乎有点难度，要不要让魔法老师来帮助你更好地理解这个单词？`,
          confirmText: '好的',
          cancelText: '跳过',
          success: (res) => {
            if (res.confirm) {
              // 用户同意，跳转到魔法老师页面
              console.log('✅ 用户同意跳转到魔法老师页面')
              this.jumpToMagicTeacher()
            } else {
              // 用户选择跳过，直接进入下一个单词
              console.log('⏭️ 用户选择跳过，进入下一个单词')
              this.handleWordCompletion(false)
            }
          },
          fail: () => {
            // 对话框显示失败，默认跳转到魔法老师页面
            console.log('⚠️ 对话框显示失败，默认跳转到魔法老师页面')
            this.jumpToMagicTeacher()
          }
        })
        
        // 重要：不要在这里调用handleWordCompletion，避免页面状态冲突
        return
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
    }
  },

  /**
   * 显示魔法老师提示对话框
   */
  showMagicTeacherPrompt() {
    console.log('🧙‍♂️ 显示魔法老师提示对话框')
    
    wx.showModal({
      title: '需要帮助吗？',
      content: `单词"${this.data.currentWord.word}"似乎有点难度，要不要让魔法老师来帮助你更好地理解这个单词？`,
      confirmText: '好的',
      cancelText: '继续尝试',
      success: (res) => {
        if (res.confirm) {
          // 用户同意，跳转到魔法老师页面
          console.log('✅ 用户同意跳转到魔法老师页面')
          this.jumpToMagicTeacher()
        } else {
          // 用户选择继续尝试，重置错误次数给用户更多机会
          console.log('💪 用户选择继续尝试，重置错误次数')
          this.setData({
            dictationAttempts: 0
          })
          wx.showToast({
            title: '加油！你可以的！',
            icon: 'none',
            duration: 1500
          })
        }
      },
      fail: () => {
        // 对话框显示失败，默认跳转到魔法老师页面
        console.log('⚠️ 对话框显示失败，默认跳转到魔法老师页面')
        this.jumpToMagicTeacher()
      }
    })
  },

  /**
   * 跳转到魔法老师页面
   */
  jumpToMagicTeacher() {
    console.log('🧙‍♂️ 开始跳转到魔法老师页面')
    
    // 准备传递给AI讲解页面的数据
    const wordData = {
      word: this.data.currentWord.word,
      phonetic: this.data.currentWord.phonetic,
      chinese: this.data.currentWord.chinese,
      image: this.data.currentWord.image,
      sentence: this.data.currentWord.sentence,
      tips: this.data.currentWord.tips
    }
    
    console.log('📦 准备传递的单词数据:', wordData)
    
    // 跳转到魔法老师页面，传递当前单词信息
    wx.navigateTo({
      url: `/pages/ai-explanation/ai-explanation?word=${encodeURIComponent(this.data.currentWord.word)}&wordData=${encodeURIComponent(JSON.stringify(wordData))}&from=dictation`,
      success: () => {
        console.log('✅ 成功跳转到魔法老师页面')
      },
      fail: (error) => {
        console.error('❌ 跳转到魔法老师页面失败:', error)
        // 如果跳转失败，显示提示信息并提供重试选项
        wx.showModal({
          title: '跳转失败',
          content: '无法打开魔法老师页面，是否重试？',
          confirmText: '重试',
          cancelText: '跳过',
          success: (retryRes) => {
            if (retryRes.confirm) {
              // 重试跳转
              this.jumpToMagicTeacher()
            } else {
              // 用户选择跳过，进入下一个单词
              this.handleWordCompletion(false)
            }
          }
        })
      }
    })
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
          // 记录跳过听写的错误
          this.recordSkippedWord(this.data.currentWord.word)
          
          dataManager.recordWordError(this.data.currentWord.word, {
            sessionId: this.data.sessionId,
            errorType: 'dictation_skip',
            userInput: '',
            attemptNumber: this.data.dictationAttempts + 1
          })
          
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
   * 记录拼写错误
   */
  recordSpellingError(word, attemptNumber) {
    console.log('📊 记录拼写错误:', { word, attemptNumber })
    
    const sessionStats = this.data.sessionStats
    sessionStats.errorWords.add(word)
    sessionStats.totalErrors++
    
    this.setData({
      sessionStats: sessionStats
    })
    
    console.log('📊 当前统计:', {
      errorWords: sessionStats.errorWords.size,
      totalErrors: sessionStats.totalErrors
    })
  },

  /**
   * 记录跳过单词
   */
  recordSkippedWord(word) {
    console.log('📊 记录跳过单词:', word)
    
    const sessionStats = this.data.sessionStats
    sessionStats.errorWords.add(word)
    sessionStats.skippedWords.add(word)
    sessionStats.totalErrors++
    
    this.setData({
      sessionStats: sessionStats
    })
    
    console.log('📊 当前统计:', {
      errorWords: sessionStats.errorWords.size,
      skippedWords: sessionStats.skippedWords.size,
      totalErrors: sessionStats.totalErrors
    })
  },

  /**
   * 记录正确尝试
   */
  recordCorrectAttempt() {
    const sessionStats = this.data.sessionStats
    sessionStats.correctAttempts++
    
    this.setData({
      sessionStats: sessionStats
    })
  },

  /**
   * 计算最终统计数据
   */
  calculateFinalStats() {
    const sessionStats = this.data.sessionStats
    const stats = this.data.stats
    
    const finalStats = {
      errorWords: sessionStats.errorWords.size,
      errorCount: sessionStats.totalErrors,
      totalWords: stats.total || sessionStats.totalWords,
      correctWords: stats.correct || sessionStats.correctAttempts,
      accuracy: 0
    }
    
    // 计算准确率
    if (finalStats.totalWords > 0) {
      finalStats.accuracy = Math.round((finalStats.correctWords / finalStats.totalWords) * 100)
    }
    
    console.log('📊 最终统计数据:', finalStats)
    return finalStats
  },

  /**
   * 安全获取统计数据
   */
  getSafeStats() {
    const sessionStats = this.data.sessionStats || {}
    const stats = this.data.stats || {}
    
    return {
      errorWords: Math.max(0, sessionStats.errorWords?.size || 0),
      errorCount: Math.max(0, sessionStats.totalErrors || 0),
      totalWords: Math.max(1, stats.total || sessionStats.totalWords || 1), // 避免除零
      correctWords: Math.max(0, stats.correct || sessionStats.correctAttempts || 0),
      accuracy: Math.min(100, Math.max(0, stats.accuracy || 0))
    }
  },

  /**
   * 计算星级评价
   */
  calculateStarRating(stats) {
    const { errorWords, totalWords, totalErrors } = stats
    const errorRate = totalWords > 0 ? errorWords / totalWords : 0
    const avgErrorsPerWord = totalWords > 0 ? totalErrors / totalWords : 0
    
    console.log('⭐ 星级评价计算:', {
      errorWords,
      totalWords,
      totalErrors,
      errorRate,
      avgErrorsPerWord
    })
    
    // 三星：无错误或错误率 < 10%
    if (errorWords === 0 || errorRate < 0.1) {
      return 3
    }
    
    // 二星：错误率 < 30% 且平均错误次数 < 2
    if (errorRate < 0.3 && avgErrorsPerWord < 2) {
      return 2
    }
    
    // 一星：其他情况
    return 1
  },

  /**
   * 预加载关键资源
   */
  preloadCriticalResources() {
    // 预加载庆祝页面可能用到的音效
    try {
      // 这里可以预加载音效文件
      console.log('🚀 预加载关键资源完成')
    } catch (error) {
      console.warn('⚠️ 预加载关键资源失败:', error)
    }
  },

  /**
   * 延迟加载非关键资源
   */
  loadNonCriticalResources() {
    // 延迟加载一些非关键的资源
    setTimeout(() => {
      try {
        // 这里可以加载一些非关键资源
        console.log('📦 非关键资源加载完成')
      } catch (error) {
        console.warn('⚠️ 非关键资源加载失败:', error)
      }
    }, 1000)
  },

  /**
   * 性能监控：记录关键操作耗时
   */
  recordPerformanceMetric(operation, startTime) {
    const duration = Date.now() - startTime
    console.log(`⏱️ ${operation} 耗时: ${duration}ms`)
    
    // 如果操作耗时过长，记录警告
    if (duration > 1000) {
      console.warn(`🐌 ${operation} 耗时过长: ${duration}ms`)
    }
    
    return duration
  },

  /**
   * 内存优化：清理不必要的数据
   */
  cleanupMemory() {
    // 清理大型对象和事件监听器
    try {
      // 清理定时器
      if (this.celebrationTimer) {
        clearTimeout(this.celebrationTimer)
        this.celebrationTimer = null
      }
      
      if (this.data.countdownTimer) {
        clearInterval(this.data.countdownTimer)
        this.setData({ countdownTimer: null })
      }
      
      console.log('🧹 内存清理完成')
    } catch (error) {
      console.warn('⚠️ 内存清理失败:', error)
    }
  },

  /**
   * 处理单词完成
   */
  async handleWordCompletion(success) {
    const { currentWord, currentWordIndex, levelData, stats } = this.data
    
    try {
      // 更新会话统计
      const sessionStats = this.data.sessionStats
      sessionStats.totalWords = Math.max(sessionStats.totalWords, stats.total + 1)
      sessionStats.completedWords++
      
      if (success) {
        sessionStats.correctAttempts++
      }
      
      this.setData({
        sessionStats: sessionStats
      })
      
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

      // 保存当前进度
      this.saveCurrentProgress()

      // 显示庆祝动画（替代弹窗）
      this.showWordCelebration(success)

    } catch (error) {
      console.error('记录学习进度失败:', error)
      // 即使记录失败也继续学习流程
      this.proceedToNext()
    }
  },

  /**
   * 显示单词庆祝动画（替代弹窗）
   */
  /**
   * 显示简化的庆祝动画
   */
  showWordCelebration(success) {
    const { currentWord } = this.data
    
    if (success) {
      // 拼写正确，触发简化庆祝动画
      this.setData({
        showCelebrationAnimation: true,
        celebrationWord: currentWord.word
      })
      
      // 1.2秒后自动进入下一个单词
      this.celebrationTimer = setTimeout(() => {
        this.setData({
          showCelebrationAnimation: false
        })
        this.proceedToNext()
      }, 1200)
    } else {
      // 拼写错误，直接进入下一个单词
      this.proceedToNext()
    }
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
        showCelebrationAnimation: false,
        celebrationWord: ''
      })
      
      // 保存进度
      this.saveCurrentProgress()
      
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
  /**
   * 完成关卡学习处理
   * 显示庆祝弹窗并自动跳转到关卡选择页面
   */
  async completeLevelLearning() {
    const performanceStart = Date.now()
    const { levelData, stats } = this.data
    
    console.log('🎉 开始完成关卡学习流程...')
    console.log(`📊 当前关卡数据:`, {
      level: levelData.level,
      stats: stats
    })
    
    try {
      // 使用新的统计系统获取准确数据
      const finalStats = this.calculateFinalStats()
      const safeStats = this.getSafeStats()
      
      console.log('📊 最终统计数据:', finalStats)
      console.log('📊 安全统计数据:', safeStats)
      
      // 数据验证：确保所有统计数据都是有效的
      if (typeof safeStats.errorWords !== 'number' || typeof safeStats.errorCount !== 'number') {
        console.error('❌ 统计数据类型错误:', safeStats)
        throw new Error('统计数据类型错误')
      }
      
      // 计算星级评价（基于错误率和平均错误次数）
      const starRating = this.calculateStarRating(finalStats)
      
      // 计算经验值奖励
      const baseExp = 50
      const bonusExp = Math.floor(finalStats.accuracy / 10) * 5
      const experienceGained = baseExp + bonusExp
      
      console.log(`⭐ 关卡${levelData.level}完成: 错误单词=${finalStats.errorWords}个, 错误次数=${finalStats.errorCount}次, 星级=${starRating}, 经验=${experienceGained}`)
      
      // 播放通关音效
      this.playLevelCompleteSound()
      
      // 性能优化：批量更新数据，减少setData调用
      const celebrationData = {
        showCelebration: true,
        starRating: Math.max(1, Math.min(3, starRating)), // 确保星级在1-3之间
        experienceGained: Math.max(0, experienceGained), // 确保经验值非负
        errorWords: Math.max(0, safeStats.errorWords), // 确保错误单词数非负
        errorCount: Math.max(0, safeStats.errorCount), // 确保错误次数非负
        countdownSeconds: 3
      }
      
      // 最终数据验证
      Object.entries(celebrationData).forEach(([key, value]) => {
        if (key !== 'showCelebration' && (typeof value !== 'number' || isNaN(value))) {
          console.error(`❌ 庆祝数据验证失败: ${key} = ${value}`)
          celebrationData[key] = 0 // 设置默认值
        }
      })
      
      console.log('🎊 庆祝数据:', celebrationData)
      this.setData(celebrationData)
    
      // 开始倒计时
      this.startCountdown()
      
      // 异步保存数据，不阻塞UI
      this.saveCompletionDataAsync(levelData, finalStats, starRating, experienceGained)
      
      // 记录性能指标
      this.recordPerformanceMetric('关卡完成流程', performanceStart)
      
    } catch (error) {
      console.error('❌ 关卡完成流程失败:', error)
      
      // 错误恢复：显示基本的庆祝信息
      this.setData({
        showCelebration: true,
        starRating: 1,
        experienceGained: 50,
        errorWords: 0,
        errorCount: 0,
        countdownSeconds: 3
      })
      
      this.startCountdown()
    }
  },

  /**
   * 异步保存完成数据
   */
  async saveCompletionDataAsync(levelData, finalStats, starRating, experienceGained) {
    try {
      console.log(`💾 异步保存关卡${levelData.level}完成数据...`)
      
      await dataManager.completeLevelProgress(levelData.level, {
        accuracy: finalStats.accuracy,
        totalWords: finalStats.totalWords,
        correctWords: finalStats.correctWords,
        errorWords: finalStats.errorWords,
        errorCount: finalStats.errorCount,
        sessionId: this.data.sessionId,
        starRating,
        experienceGained
      })
      
      console.log(`✅ 关卡完成数据已保存`)
    } catch (error) {
      console.error('❌ 异步保存关卡数据失败:', error)
      // 不影响用户体验，静默处理错误
    }
  },

  /**
   * 开始倒计时自动跳转
   */
  startCountdown() {
    const timer = setInterval(() => {
      const currentSeconds = this.data.countdownSeconds
      if (currentSeconds <= 1) {
        clearInterval(timer)
        this.redirectToMap()
      } else {
        this.setData({
          countdownSeconds: currentSeconds - 1
        })
      }
    }, 1000)
    
    this.setData({
      countdownTimer: timer
    })
  },



  /**
   * 播放通关音效
   */
  async playLevelCompleteSound() {
    try {
      console.log('🎵 播放通关音效')
      // 播放成功音效，音量稍大一些表示通关
      await playSuccessSound({ volume: 0.8 })
      
      // 延迟一下再播放第二个音效，营造庆祝氛围
      setTimeout(async () => {
        try {
          await playSuccessSound({ volume: 0.6 })
        } catch (error) {
          console.log('⚠️ 第二个庆祝音效播放失败')
        }
      }, 300)
      
    } catch (error) {
      console.error('❌ 播放通关音效失败:', error)
      // 降级方案：使用震动
      wx.vibrateShort()
      setTimeout(() => {
        wx.vibrateShort()
      }, 200)
    }
  },

  /**
   * 进入下一关
   */
  onReturnToMap() {
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer)
    }
    this.redirectToMap()
  },

  /**
   * 跳转到关卡选择页面
   */
  redirectToMap() {
    wx.redirectTo({
      url: '/pages/adventure-map/adventure-map'
    })
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
   * 手动跳过庆祝动画（如果用户点击屏幕）
   */
  onSkipCelebration() {
    if (this.data.showCelebrationAnimation) {
      // 清除定时器
      if (this.celebrationTimer) {
        clearTimeout(this.celebrationTimer)
        this.celebrationTimer = null
      }
      
      // 立即进入下一个单词
      this.setData({
        showCelebrationAnimation: false
      })
      this.proceedToNext()
    }
  },

  /**
   * 检查并恢复中途进度
   * @returns {Promise<boolean>} 是否恢复了进度
   */
  checkAndRestoreProgress() {
    return new Promise((resolve) => {
      if (!this.levelId) {
        resolve(false)
        return
      }
      
      // 如果有focusWord参数，说明是从统计页面跳转过来重新学习特定单词
      // 此时应该跳过进度恢复，直接开始学习目标单词
      if (this.focusWord) {
        console.log(`🎯 检测到focusWord参数: ${this.focusWord}，跳过进度恢复`)
        resolve(false)
        return
      }
      
      try {
        const savedProgress = dataManager.getLevelProgress(this.levelId)
        
        if (savedProgress && savedProgress.currentWordIndex > 0) {
          // 询问用户是否恢复进度
          wx.showModal({
            title: '发现未完成的进度',
            content: `检测到您在第${savedProgress.currentWordIndex + 1}个单词处退出，是否继续之前的进度？`,
            confirmText: '继续学习',
            cancelText: '重新开始',
            success: (res) => {
              if (res.confirm) {
                // 恢复进度
                this.restoreProgress(savedProgress)
                resolve(true) // 表示恢复了进度
              } else {
                // 清除旧进度，重新开始
                dataManager.clearLevelProgress(this.levelId)
                resolve(false) // 表示没有恢复进度
              }
            },
            fail: () => {
              resolve(false) // 弹窗失败时也返回false
            }
          })
        } else {
          resolve(false) // 没有保存的进度
        }
      } catch (error) {
        console.error('检查进度失败:', error)
        resolve(false) // 出错时返回false
      }
    })
  },

  /**
   * 恢复保存的进度
   * @param {Object} savedProgress - 保存的进度数据
   */
  restoreProgress(savedProgress) {
    try {
      console.log('🔄 恢复关卡进度:', savedProgress)
      
      this.setData({
        currentWordIndex: savedProgress.currentWordIndex,
        stats: savedProgress.stats || { correct: 0, total: 0, streak: 0 },
        mode: savedProgress.mode || 'learn'
      })
      
      // 更新进度显示
      this.updateProgress()
      
      // 重要：加载当前单词，确保页面显示正确的单词
      this.loadCurrentWord()
      
      wx.showToast({
        title: '进度已恢复',
        icon: 'success'
      })
      
      console.log(`✅ 已恢复到第${savedProgress.currentWordIndex + 1}个单词`)
    } catch (error) {
      console.error('恢复进度失败:', error)
      wx.showToast({
        title: '恢复进度失败',
        icon: 'none'
      })
    }
  },

  /**
   * 保存当前进度
   */
  saveCurrentProgress() {
    if (!this.levelId) return
    
    try {
      const { currentWordIndex, stats, mode, sessionId } = this.data
      
      // 只有在有实际进度时才保存（不是第一个单词且有统计数据）
      if (currentWordIndex > 0 || (stats && stats.total > 0)) {
        const progressData = {
          currentWordIndex,
          stats,
          mode,
          sessionId
        }
        
        dataManager.saveLevelProgress(this.levelId, progressData)
      }
    } catch (error) {
      console.error('保存进度失败:', error)
    }
  },

  /**
   * 预加载记忆方法
   * 在用户错误2次后开始预加载，确保第3次错误时能流畅显示
   */
  async preloadMemoryTip() {
    const { currentWord } = this.data
    if (!currentWord || this.data.preloadingMemoryTip) {
      return
    }

    console.log('🧠 开始预加载记忆方法:', currentWord.word)
    
    this.setData({
      preloadingMemoryTip: true
    })

    try {
      const memoryTip = await this.generateMemoryTip(currentWord.word)
      
      this.setData({
        memoryTipContent: memoryTip,
        preloadingMemoryTip: false
      })
      
      console.log('✅ 记忆方法预加载完成')
    } catch (error) {
      console.error('❌ 记忆方法预加载失败:', error)
      this.setData({
        preloadingMemoryTip: false
      })
    }
  },

  /**
   * 生成记忆方法内容
   * @param {string} word 单词
   * @returns {Promise<string>} 记忆方法内容
   */
  async generateMemoryTip(word) {
    console.log('🤖 [generateMemoryTip] 开始为单词生成记忆方法:', word)
    
    // 优先使用降级方案，确保稳定性
    try {
      // 使用本地生成的记忆方法，避免依赖网络API
      const fallbackTip = this.generateFallbackMemoryTip(word)
      console.log('✅ [generateMemoryTip] 使用稳定的本地记忆方法')
      return fallbackTip
    } catch (error) {
      console.error('❌ [generateMemoryTip] 记忆方法生成失败:', error)
      // 最终兜底内容
      return `🌟【记忆魔法画】\n\n想象一下"${word}"这个单词就像一个小精灵，它有自己独特的样子和声音！\n\n🎯 **记忆小窍门**：\n• 仔细观察单词的每个字母\n• 大声读出来，感受它的发音\n• 想想这个单词在生活中的使用场景\n\n💡 **小贴士**：多练习几遍，你一定能记住它的！加油！🎉`
    }
  },

  /**
   * 生成降级记忆方法
   * @param {string} word 单词
   * @returns {string} 基础记忆提示
   */
  generateFallbackMemoryTip(word) {
    return `🌟【记忆魔法画】\n\n想象一下"${word}"这个单词就像一个小精灵，它有自己独特的样子和声音！\n\n🎯 **记忆小窍门**：\n• 仔细观察单词的每个字母\n• 大声读出来，感受它的发音\n• 想想这个单词在生活中的使用场景\n\n💡 **小贴士**：多练习几遍，你一定能记住它的！加油！🎉`
  },

  /**
   * 显示记忆方法弹窗
   */
  async showMemoryTipModal() {
    console.log('🧠 [showMemoryTipModal] 开始执行，当前数据状态:', {
      memoryTipContent: this.data.memoryTipContent ? '有内容' : '无内容',
      showMemoryTip: this.data.showMemoryTip,
      memoryTipLoading: this.data.memoryTipLoading,
      currentWord: this.data.currentWord?.word,
      dictationAttempts: this.data.dictationAttempts,
      maxAttempts: this.data.maxAttempts
    })
    
    // 强制确保弹窗显示状态
    const forceShowModal = () => {
      return new Promise((resolve) => {
        console.log('🔧 [forceShowModal] 强制设置弹窗显示状态')
        this.setData({
          showMemoryTip: true
        }, () => {
          console.log('✅ [forceShowModal] setData回调确认 - 弹窗状态已设置为显示:', this.data.showMemoryTip)
          
          setTimeout(() => {
            console.log('🔍 [forceShowModal] 100ms后检查 - showMemoryTip:', this.data.showMemoryTip)
            resolve()
          }, 100)
        })
      })
    }
    
    // 立即设置显示状态，防止被其他逻辑重置
    this.setData({
      showMemoryTip: true
    })
    
    // 如果已经有预加载的内容，直接使用
    if (this.data.memoryTipContent) {
      console.log('✅ [showMemoryTipModal] 使用预加载的记忆方法内容')
      await forceShowModal()
      return
    }
    
    // 否则现场生成
    console.log('🔄 [showMemoryTipModal] 现场生成记忆方法内容')
    
    // 先设置加载状态和显示弹窗
    await new Promise((resolve) => {
      this.setData({
        memoryTipLoading: true,
        showMemoryTip: true
      }, () => {
        console.log('✅ [showMemoryTipModal] 加载状态设置完成:', {
          memoryTipLoading: this.data.memoryTipLoading,
          showMemoryTip: this.data.showMemoryTip
        })
        resolve()
      })
    })
    
    try {
      console.log('🤖 [showMemoryTipModal] 开始调用AI生成记忆方法')
      const memoryTip = await this.generateMemoryTip(this.data.currentWord.word)
      console.log('✅ [showMemoryTipModal] AI记忆方法生成成功，长度:', memoryTip.length)
      
      await new Promise((resolve) => {
        this.setData({
          memoryTipContent: memoryTip,
          memoryTipLoading: false,
          showMemoryTip: true  // 再次确保显示状态
        }, () => {
          console.log('✅ [showMemoryTipModal] 内容设置完成')
          resolve()
        })
      })
    } catch (error) {
      console.error('❌ [showMemoryTipModal] 生成记忆方法失败:', error)
      const fallbackTip = this.generateFallbackMemoryTip(this.data.currentWord.word)
      console.log('🔄 [showMemoryTipModal] 使用降级记忆方法，长度:', fallbackTip.length)
      
      await new Promise((resolve) => {
        this.setData({
          memoryTipContent: fallbackTip,
          memoryTipLoading: false,
          showMemoryTip: true  // 再次确保显示状态
        }, () => {
          console.log('✅ [showMemoryTipModal] 降级内容设置完成')
          resolve()
        })
      })
    }
    
    // 最终状态验证 - 简化版
    setTimeout(() => {
      console.log('🎯 [showMemoryTipModal] 最终弹窗状态验证:', {
        showMemoryTip: this.data.showMemoryTip,
        memoryTipLoading: this.data.memoryTipLoading,
        hasContent: !!this.data.memoryTipContent,
        contentLength: this.data.memoryTipContent?.length || 0
      })
      
      // 如果弹窗仍然没有显示，强制设置
      if (!this.data.showMemoryTip) {
        console.warn('⚠️ [showMemoryTipModal] 弹窗状态异常，强制重新设置')
        this.setData({
          showMemoryTip: true,
          memoryTipContent: this.data.memoryTipContent || this.generateFallbackMemoryTip(this.data.currentWord.word),
          memoryTipLoading: false
        })
      }
    }, 200)
  },

  /**
   * 关闭记忆方法弹窗
   */
  onCloseMemoryTip() {
    this.setData({
      showMemoryTip: false
    })
  },

  /**
   * 记忆方法弹窗 - 继续练习
   */
  onContinuePractice() {
    console.log('🔄 [onContinuePractice] 用户选择继续练习，重置默写状态')
    
    this.setData({
      showMemoryTip: false,
      dictationAttempts: 0,
      dictationInput: '',
      showHint: false,
      mode: 'dictation' // 确保保持在默写模式
    }, () => {
      console.log('✅ [onContinuePractice] 状态重置完成:', {
        showMemoryTip: this.data.showMemoryTip,
        dictationAttempts: this.data.dictationAttempts,
        mode: this.data.mode
      })
    })
  },

  /**
   * 记忆方法弹窗 - 跳过单词
   */
  onSkipWord() {
    this.setData({
      showMemoryTip: false
    })
    
    // 记录跳过的错误
    this.recordSkippedWord(this.data.currentWord.word)
    
    dataManager.recordWordError(this.data.currentWord.word, {
      sessionId: this.data.sessionId,
      errorType: 'memory_tip_skip',
      userInput: '',
      attemptNumber: this.data.dictationAttempts + 1
    })
    
    this.handleWordCompletion(false)
  },

  /**
   * 手动测试记忆方法弹窗 - 调试用
   * 在控制台执行: getCurrentPages()[0].testMemoryTipModal()
   */
  testMemoryTipModal() {
    console.log('🧪 手动测试记忆方法弹窗')
    console.log('🔍 测试前状态:', {
      showMemoryTip: this.data.showMemoryTip,
      memoryTipContent: this.data.memoryTipContent,
      currentWord: this.data.currentWord
    })
    
    // 设置测试内容
    this.setData({
      memoryTipContent: '这是一个测试记忆方法内容，用于验证弹窗是否能正常显示。',
      showMemoryTip: true
    }, () => {
      console.log('✅ 测试弹窗状态设置完成:', {
        showMemoryTip: this.data.showMemoryTip,
        memoryTipContent: this.data.memoryTipContent
      })
    })
  },

  /**
   * 强制触发记忆方法弹窗 - 调试用
   * 在控制台执行: getCurrentPages()[0].forceShowMemoryTip()
   */
  /**
   * 强制创建记忆方法弹窗 - 最后的强制措施
   * 当所有其他方法都失败时使用
   */
  forceCreateMemoryTipModal() {
    console.log('🚨 [forceCreateMemoryTipModal] 执行强制显示措施')
    
    // 确保数据状态正确
    this.setData({
      showMemoryTip: true,
      memoryTipContent: this.data.memoryTipContent || `单词 "${this.data.currentWord?.word || ''}" 记忆方法：\n\n请仔细观察这个单词的拼写规律，注意每个字母的位置和组合。多练习几遍，加深记忆印象。`,
      memoryTipLoading: false
    })
    
    console.log('✅ [forceCreateMemoryTipModal] 强制显示设置完成')
  },

  forceShowMemoryTip() {
    console.log('🚀 强制触发记忆方法弹窗')
    this.showMemoryTipModal()
  }

})