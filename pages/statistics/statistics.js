// pages/statistics/statistics.js
const util = require('../../utils/util.js')
const wordLibrary = require('../../utils/word-library.js')
const dataManager = require('../../utils/data-manager.js')
const { processPageEmojis } = require('../../utils/emoji-compatibility')

Page({
  data: {
    // 用户信息
    userProfile: null,
    
    // 总体统计
    overallStats: {
      totalWords: 0,
      accuracy: 0,
      streak: 0,
      studyDays: 0,
      currentLevel: 1
    },
    

    
    // 错误分析数据
    errorWords: [],
    totalErrors: 0,
    averageErrors: '0.0',
    
    // UI状态
    loading: false
  },

  onLoad() {
    console.log('统计页面加载')
    this.loadStatistics()
  },

  onShow() {
    console.log('统计页面显示')
    this.refreshData()
    // 应用表情符号兼容性处理
    processPageEmojis(this)
    
    // 强制刷新页面数据（解决数据绑定问题）
    setTimeout(() => {
      console.log('🔄 强制刷新页面数据...')
      const currentErrorWords = this.data.errorWords
      console.log('🔍 当前errorWords数据:', currentErrorWords)
      if (currentErrorWords && currentErrorWords.length > 0) {
        console.log('📊 强制重新设置errorWords数据')
        this.setData({
          errorWords: [...currentErrorWords] // 创建新数组引用
        })
      }
    }, 100)
  },

  onPullDownRefresh() {
    console.log('下拉刷新统计数据')
    this.refreshData()
  },

  // 加载统计数据
  loadStatistics() {
    console.log('🚀 loadStatistics 开始执行...')
    this.setData({ loading: true })
    
    try {
      const userProfile = util.storage.get('wordHero_profile') || {}
      const overallStats = this.calculateOverallStats(userProfile)
      
      // 获取错误单词统计
      console.log('📞 调用 getErrorWordsStats...')
      const errorWords = this.getErrorWordsStats()
      console.log('📊 getErrorWordsStats 返回结果:', errorWords)
      console.log('📊 errorWords.length:', errorWords.length)
      
      // 计算总错误次数 - 如果errorWords为空，直接从存储中统计
      let totalErrors = errorWords.reduce((sum, word) => sum + word.totalErrors, 0)
      console.log('🔢 计算的总错误次数:', totalErrors)
      
      // 备用计算方法：直接从存储中统计所有错误
      if (totalErrors === 0) {
        console.log('⚠️ 总错误次数为0，使用备用计算方法...')
        const allKeys = util.storage.getAllKeys()
        const errorKeys = allKeys.filter(key => key.startsWith('word_errors_'))
        console.log('🔑 找到的错误键:', errorKeys)
        totalErrors = errorKeys.reduce((sum, key) => {
          const data = util.storage.get(key)
          console.log(`📋 处理键 ${key}:`, data)
          return sum + (data ? data.totalErrors || 0 : 0)
        }, 0)
        console.log('🔢 备用方法计算的总错误次数:', totalErrors)
      }
      
      const averageErrors = errorWords.length > 0 ? (totalErrors / errorWords.length).toFixed(1) : '0.0'
      
      const dataToSet = {
        userProfile,
        overallStats,
        errorWords,
        totalErrors,
        averageErrors,
        loading: false
      }
      
      console.log('📤 准备设置到页面的数据:', {
        errorWordsLength: errorWords.length,
        totalErrors,
        averageErrors,
        errorWordsPreview: errorWords.slice(0, 3)
      })
      
      this.setData(dataToSet)
      
      console.log('✅ setData 完成，当前页面数据:', {
        errorWordsLength: this.data.errorWords.length,
        totalErrors: this.data.totalErrors
      })
      
      // 延迟验证数据是否正确设置
      setTimeout(() => {
        console.log('🔍 延迟验证页面数据:')
        console.log('- errorWords.length:', this.data.errorWords.length)
        console.log('- errorWords内容:', this.data.errorWords)
        console.log('- totalErrors:', this.data.totalErrors)
        
        if (this.data.errorWords.length > 0) {
          console.log('✅ 数据验证成功：错误单词列表不为空')
        } else {
          console.log('⚠️ 数据验证失败：错误单词列表为空')
          // 尝试再次设置数据
          console.log('🔄 尝试再次设置数据...')
          const retryErrorWords = this.getErrorWordsStats()
           if (retryErrorWords.length > 0) {
             console.log('📊 重试获取到数据，再次设置:', retryErrorWords)
             this.setData({ errorWords: retryErrorWords })
             
             // 再次延迟验证
             setTimeout(() => {
               console.log('🔍 二次验证页面数据:')
               console.log('- errorWords.length:', this.data.errorWords.length)
               if (this.data.errorWords.length === 0) {
                 console.log('⚠️ 二次验证仍然失败，尝试强制刷新页面')
                 // 强制触发页面重新渲染
                 this.setData({
                   loading: true
                 })
                 setTimeout(() => {
                   this.setData({
                     loading: false,
                     errorWords: [...retryErrorWords]
                   })
                 }, 100)
               }
             }, 300)
           } else {
             console.log('⚠️ 重试仍然没有获取到数据，可能存在数据源问题')
           }
        }
      }, 200)
      
      
    } catch (error) {
      console.error('❌ 加载统计数据失败:', error)
      util.showToast('加载数据失败', 'none')
      this.setData({ loading: false })
    }
  },

  // 刷新数据
  refreshData() {
    this.loadStatistics()
    
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  },

  // 计算总体统计
  calculateOverallStats(profile) {
    const stats = profile.stats || {}
    const progress = profile.progress || {}
    
    return {
      totalWords: stats.totalWords || 0,
      accuracy: stats.accuracy || 0,
      streak: stats.streak || 0,
      studyDays: this.calculateStudyDays(profile),
      currentLevel: progress.currentLevel || 1
    }
  },

  // 计算学习天数
  calculateStudyDays(profile) {
    const dailyRecords = profile.dailyRecords || {}
    return Object.keys(dailyRecords).length
  },



  /**
   * 获取错误单词统计
   * @returns {Array} 错误单词列表
   */
  getErrorWordsStats() {
    try {
      console.log('🔍 开始获取错误单词统计...')
      
      // 首先检查存储中是否有错误数据
      const allKeys = util.storage.getAllKeys()
      const errorKeys = allKeys.filter(key => key.startsWith('word_errors_'))
      console.log(`📊 找到 ${errorKeys.length} 个错误数据键:`, errorKeys)
      
      if (errorKeys.length === 0) {
        console.log('⚠️ 没有找到任何错误数据，返回空数组')
        return []
      }
      
      // 获取最容易出错的单词（前20个）
      const errorWords = dataManager.getMostErrorProneWords(20)
      console.log(`📈 dataManager.getMostErrorProneWords返回:`, errorWords)
      
      if (!errorWords || errorWords.length === 0) {
        console.log('⚠️ getMostErrorProneWords返回空数组，尝试手动构建数据...')
        
        // 手动构建错误单词数据
        const manualErrorWords = errorKeys.map(key => {
          const data = util.storage.get(key)
          console.log(`📋 处理错误数据 ${key}:`, data)
          return {
            word: data.word,
            totalErrors: data.totalErrors,
            lastErrorDate: data.lastErrorDate,
            errorRate: 0 // 简化处理
          }
        }).filter(word => word.totalErrors > 0)
        
        // 按错误次数降序排序
        manualErrorWords.sort((a, b) => b.totalErrors - a.totalErrors)
        console.log(`🔧 手动构建的错误单词数据:`, manualErrorWords)
        
        // 使用手动构建的数据
        const errorWordsToProcess = manualErrorWords.slice(0, 20)
        
        // 为每个单词添加中文释义
        const wordsWithMeaning = errorWordsToProcess.map(errorWord => {
          // 尝试多种方式查找单词数据
          let wordData = wordLibrary.getWordByEnglish(errorWord.word)
          
          // 如果找不到，尝试小写查找
          if (!wordData && errorWord.word) {
            wordData = wordLibrary.getWordByEnglish(errorWord.word.toLowerCase())
          }
          
          // 如果还是找不到，尝试从PRIMARY_WORD_DATABASE直接查找
          if (!wordData && errorWord.word) {
            const database = wordLibrary.PRIMARY_WORD_DATABASE
            wordData = database[errorWord.word] || database[errorWord.word.toLowerCase()]
          }
        
          return {
            ...errorWord,
            chinese: wordData ? wordData.chinese : '未知',
            phonetic: wordData ? wordData.phonetic : '',
            difficulty: this.calculateWordDifficulty(errorWord.totalErrors)
          }
        })
        
        console.log(`✅ 最终处理的错误单词数据:`, wordsWithMeaning)
        return wordsWithMeaning
      }
      
      // 为每个单词添加中文释义
      const wordsWithMeaning = errorWords.map(errorWord => {
          // 尝试多种方式查找单词数据
          let wordData = wordLibrary.getWordByEnglish(errorWord.word)
          
          // 如果找不到，尝试小写查找
          if (!wordData && errorWord.word) {
            wordData = wordLibrary.getWordByEnglish(errorWord.word.toLowerCase())
          }
          
          // 如果还是找不到，尝试从PRIMARY_WORD_DATABASE直接查找
          if (!wordData && errorWord.word) {
            const database = wordLibrary.PRIMARY_WORD_DATABASE
            wordData = database[errorWord.word] || database[errorWord.word.toLowerCase()]
          }
        
        return {
          ...errorWord,
          chinese: wordData ? wordData.chinese : '未知',
          phonetic: wordData ? wordData.phonetic : '',
          difficulty: this.calculateWordDifficulty(errorWord.totalErrors)
        }
      })
      
      // 过滤掉无效的错误单词（totalErrors为0或undefined）
      const validErrorWords = wordsWithMeaning.filter(word => word.totalErrors > 0)
      console.log(`✅ 最终返回的有效错误单词:`, validErrorWords)
      
      return validErrorWords
    } catch (error) {
      console.error('获取错误单词统计失败:', error)
      return []
    }
  },

  /**
   * 计算单词难度等级
   * @param {number} errorCount - 错误次数
   * @returns {string} 难度等级
   */
  calculateWordDifficulty(errorCount) {
    if (errorCount >= 10) return '极难'
    if (errorCount >= 5) return '困难'
    if (errorCount >= 3) return '中等'
    return '简单'
  },



  // 重置统计数据
  onResetStats() {
    util.showModal('确认重置', '重置后所有学习数据将被清除，此操作不可恢复')
      .then((confirmed) => {
        if (confirmed) {
          this.resetAllData()
        }
      })
  },

  // 重置所有数据
  resetAllData() {
    try {
      // 保留基本用户信息，清除统计数据
      const userProfile = util.storage.get('wordHero_profile') || {}
      
      userProfile.stats = {
        totalWords: 0,
        accuracy: 0,
        streak: 0
      }
      
      userProfile.progress = {
        currentLevel: 1,
        completedWords: [],
        totalScore: 0
      }
      
      userProfile.dailyRecords = {}
      
      util.storage.set('wordHero_profile', userProfile)
      
      util.showToast('数据已重置', 'success')
      this.loadStatistics()
      
    } catch (error) {
      console.error('重置数据失败:', error)
      util.showToast('重置失败', 'none')
    }
  },

  // 导出数据
  onExportData() {
    util.showModal('导出数据', '即将导出学习数据到剪贴板')
      .then((confirmed) => {
        if (confirmed) {
          this.exportToClipboard()
        }
      })
  },

  // 导出到剪贴板
  exportToClipboard() {
    try {
      const exportData = {
        profile: this.data.userProfile,
        stats: this.data.overallStats,
        exportTime: new Date().toISOString(),
        version: '1.0'
      }
      
      const dataString = JSON.stringify(exportData, null, 2)
      
      wx.setClipboardData({
        data: dataString,
        success: () => {
          util.showToast('数据已复制到剪贴板', 'success')
        },
        fail: () => {
          util.showToast('导出失败', 'none')
        }
      })
      
    } catch (error) {
      console.error('导出数据失败:', error)
      util.showToast('导出失败', 'none')
    }
  },

  // 分享成绩
  onShareResults() {
    const stats = this.data.overallStats
    
    return {
      title: `我在单词小超人已经学会了${stats.totalWords}个单词！`,
      path: '/pages/welcome/welcome',
      imageUrl: '/images/share-bg.png' // 需要准备分享图片
    }
  },



  /**
   * 查看错误单词详情
   */
  onErrorWordDetail(e) {
    const word = e.currentTarget.dataset.word
    const errorStats = dataManager.getWordErrorStats(word)
    
    console.log('查看错误单词详情:', word, errorStats)
    
    // 显示错误详情弹窗
    const errorHistory = errorStats.errorHistory.slice(-5) // 显示最近5次错误
    const errorDetails = errorHistory.map(error => {
      const date = new Date(error.timestamp)
      return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')} - ${error.userInput || '未完成'}`
    }).join('\n')
    
    wx.showModal({
      title: `${word} 错误记录`,
      content: `总错误次数: ${errorStats.totalErrors}次\n\n最近错误记录:\n${errorDetails || '暂无记录'}`,
      showCancel: true,
      cancelText: '关闭',
      confirmText: '重新学习',
      success: (res) => {
        if (res.confirm) {
          // 跳转到单词学习页面重新学习这个单词
          this.restudyErrorWord(word)
        }
      }
    })
  },

  /**
   * 查找包含指定单词的关卡
   * @param {string} word - 要查找的单词
   * @returns {number|null} 关卡编号，如果未找到则返回null
   */
  findWordLevel(word) {
    try {
      // 遍历所有关卡（1-35）查找包含该单词的关卡
      for (let level = 1; level <= 35; level++) {
        try {
          const levelData = wordLibrary.getLevelWords(level)
          if (levelData && levelData.words) {
            const foundWord = levelData.words.find(w => 
              w.word && w.word.toLowerCase() === word.toLowerCase()
            )
            if (foundWord) {
              console.log(`找到单词 ${word} 在第${level}关`)
              return level
            }
          }
        } catch (levelError) {
          // 某个关卡数据获取失败，继续查找下一个关卡
          console.warn(`获取第${level}关数据失败:`, levelError)
          continue
        }
      }
      
      console.warn(`未在任何关卡中找到单词: ${word}`)
      return null
    } catch (error) {
      console.error('查找单词关卡失败:', error)
      return null
    }
  },

  /**
   * 重新学习错误单词
   */
  restudyErrorWord(word) {
    try {
      console.log(`开始查找单词 ${word} 的关卡信息...`)
      
      // 查找包含该单词的关卡
      const levelId = this.findWordLevel(word)
      
      if (levelId) {
        console.log(`重新学习单词 ${word}，跳转到第${levelId}关`)
        
        wx.navigateTo({
          url: `/pages/word-learning/word-learning?level=${levelId}&focusWord=${word}`,
          success: () => {
            console.log(`成功跳转到第${levelId}关学习单词 ${word}`)
          },
          fail: (error) => {
            console.error('跳转到学习页面失败:', error)
            wx.showToast({
              title: '跳转失败',
              icon: 'none'
            })
          }
        })
      } else {
        console.warn(`未找到单词 ${word} 的关卡信息`)
        wx.showToast({
          title: '未找到该单词的关卡信息',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('重新学习单词失败:', error)
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  },

  // 返回地图
  onBackToMap() {
    util.navigateTo('/pages/adventure-map/adventure-map')
  }
})