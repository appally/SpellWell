// utils/data-manager.js
// SpellWell 数据管理中心 - 统一管理关卡数据、用户进度和缓存

const util = require('./util.js')

/**
 * 数据管理中心
 * 负责统一管理关卡数据、用户进度、缓存等核心数据
 */
class DataManager {
  constructor() {
    this.cache = new Map()
    this.cacheTimeout = 5 * 60 * 1000 // 5分钟缓存
    this.storageKeys = {
      userProfile: 'wordHero_profile',
      learningHistory: 'wordHero_learningHistory',
      currentLevel: 'wordHero_currentLevel',
      backup: 'wordHero_profile_backup',
      settings: 'wordHero_settings'
    }
    
    this.init()
  }

  init() {
    // 初始化时预加载常用数据
    this.preloadCommonData()
    
    // 启动自动备份
    this.startAutoBackup()
  }

  /**
   * 获取关卡数据（带缓存）
   * @param {number} level - 关卡编号
   * @returns {Object} 关卡数据
   */
  getLevelData(level) {
    const cacheKey = `level_${level}`
    
    // 检查缓存
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data
      }
    }

    // 获取新数据
    const wordLibrary = require('./word-library.js')
    const levelData = wordLibrary.getLevelWords(level)
    
    // 缓存数据
    this.cache.set(cacheKey, {
      data: levelData,
      timestamp: Date.now()
    })
    
    return levelData
  }

  /**
   * 批量获取关卡数据
   * @param {Array} levels - 关卡编号数组
   * @returns {Array} 关卡数据数组
   */
  getBatchLevelData(levels) {
    return levels.map(level => this.getLevelData(level))
  }

  /**
   * 获取用户档案
   * @returns {Object} 用户档案数据
   */
  getUserProfile() {
    try {
      const profile = util.storage.get(this.storageKeys.userProfile)
      if (!profile) {
        return this.createDefaultProfile()
      }
      
      // 数据迁移和校验
      return this.validateAndMigrateProfile(profile)
    } catch (error) {
      console.error('获取用户档案失败:', error)
      return this.createDefaultProfile()
    }
  }

  /**
   * 创建默认用户档案
   * @returns {Object} 默认档案
   */
  createDefaultProfile() {
    const defaultProfile = {
      userId: this.generateUserId(),
      version: '2.0',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      
      // 基本信息（兼容性：保持与app.js一致）
      nickname: '小超人',
      avatar: '🎓',
      grade: 'primary',
      currentLevel: 1,
      totalWordsLearned: 0,
      streak: 0,
      lastStudyDate: null,
      
      // 详细学习进度
      progress: {
        currentLevel: 1,
        completedLevels: [],
        levelProgress: {},
        totalScore: 0,
        globalStreak: 0,
        maxStreak: 0
      },
      
      // 统计数据
      stats: {
        totalWords: 0,
        totalCorrect: 0,
        totalAttempts: 0,
        accuracy: 0,
        totalStudyTime: 0,
        lastStudyDate: null,
        consecutiveDays: 0
      },
      
      // 每日记录
      dailyRecords: {},
      
      // 成就系统
      achievements: [],
      
      // 学习偏好
      preferences: {
        soundEnabled: true,
        vibrationEnabled: true,
        autoPlay: false,
        difficulty: 'normal'
      }
    }
    
    this.saveUserProfile(defaultProfile)
    return defaultProfile
  }

  /**
   * 保存用户档案（原子性操作）
   * @param {Object} profile - 用户档案
   * @param {Object} options - 保存选项
   */
  async saveUserProfile(profile, options = {}) {
    try {
      // 数据校验
      if (!this.validateProfile(profile)) {
        throw new Error('用户档案数据格式错误')
      }

      // 备份当前数据
      if (!options.skipBackup) {
        const currentProfile = util.storage.get(this.storageKeys.userProfile)
        if (currentProfile) {
          util.storage.set(this.storageKeys.backup, currentProfile)
        }
      }

      // 更新时间戳
      profile.lastUpdated = new Date().toISOString()
      
      // 保存数据
      const success = util.storage.set(this.storageKeys.userProfile, profile)
      
      if (!success) {
        throw new Error('存储失败')
      }

      // 清除相关缓存
      this.clearUserCache()
      
      // 触发数据更新事件
      this.emitDataUpdate('profile', profile)
      
      return profile
    } catch (error) {
      console.error('保存用户档案失败:', error)
      
      // 尝试恢复备份
      if (!options.skipRestore) {
        this.restoreFromBackup()
      }
      
      throw error
    }
  }

  /**
   * 更新学习进度
   * @param {Object} progressData - 进度数据
   */
  updateLearningProgress(progressData) {
    const profile = this.getUserProfile()
    
    // 更新关卡进度
    if (progressData.level && progressData.completed) {
      const level = progressData.level
      
      // 标记关卡完成
      if (!profile.progress.completedLevels.includes(level)) {
        profile.progress.completedLevels.push(level)
      }
      
      // 更新当前关卡
      profile.progress.currentLevel = Math.max(
        profile.progress.currentLevel,
        level + 1
      )
      
      // 记录关卡详细进度
      profile.progress.levelProgress[level] = {
        completed: true,
        accuracy: progressData.accuracy || 0,
        timeSpent: progressData.timeSpent || 0,
        completedAt: new Date().toISOString(),
        stars: this.calculateStars(progressData.accuracy)
      }
    }
    
    // 更新统计数据
    if (progressData.stats) {
      const stats = progressData.stats
      profile.stats.totalWords += stats.totalWords || 0
      profile.stats.totalCorrect += stats.correct || 0
      profile.stats.totalAttempts += stats.total || 0
      profile.stats.accuracy = profile.stats.totalAttempts > 0 ? 
        Math.round((profile.stats.totalCorrect / profile.stats.totalAttempts) * 100) : 0
      profile.stats.lastStudyDate = new Date().toISOString()
    }
    
    // 更新每日记录
    this.updateDailyRecord(profile, progressData)
    
    // 保存更新后的档案
    return this.saveUserProfile(profile)
  }

  /**
   * 更新每日学习记录
   * @param {Object} profile - 用户档案
   * @param {Object} progressData - 进度数据
   */
  updateDailyRecord(profile, progressData) {
    const today = this.formatDate(new Date(), 'YYYY-MM-DD')
    
    if (!profile.dailyRecords[today]) {
      profile.dailyRecords[today] = {
        words: 0,
        accuracy: 0,
        studyTime: 0,
        levels: [],
        sessions: 0
      }
    }
    
    const todayRecord = profile.dailyRecords[today]
    
    if (progressData.wordsCount) {
      todayRecord.words += progressData.wordsCount
    }
    
    if (progressData.timeSpent) {
      todayRecord.studyTime += progressData.timeSpent
    }
    
    if (progressData.level && !todayRecord.levels.includes(progressData.level)) {
      todayRecord.levels.push(progressData.level)
    }
    
    todayRecord.sessions += 1
    
    // 计算今日准确率
    if (progressData.accuracy) {
      todayRecord.accuracy = Math.round(
        (todayRecord.accuracy * (todayRecord.sessions - 1) + progressData.accuracy) / todayRecord.sessions
      )
    }
  }

  /**
   * 预加载常用数据
   */
  preloadCommonData() {
    try {
      // 预加载前3个关卡的数据
      for (let i = 1; i <= 3; i++) {
        this.getLevelData(i)
      }
      
      // 预加载用户档案
      this.getUserProfile()
      
    } catch (error) {
      console.error('预加载数据失败:', error)
    }
  }

  /**
   * 清除缓存
   * @param {string} type - 缓存类型
   */
  clearCache(type) {
    if (type === 'all') {
      this.cache.clear()
    } else if (type === 'level') {
      for (const key of this.cache.keys()) {
        if (key.startsWith('level_')) {
          this.cache.delete(key)
        }
      }
    } else if (type === 'user') {
      this.clearUserCache()
    }
  }

  /**
   * 清除用户相关缓存
   */
  clearUserCache() {
    for (const key of this.cache.keys()) {
      if (key.startsWith('user_') || key.startsWith('profile_')) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * 数据校验
   * @param {Object} profile - 用户档案
   * @returns {boolean} 是否有效
   */
  validateProfile(profile) {
    try {
      // 检查必要字段
      if (!profile || typeof profile !== 'object') {
        console.warn('档案不是有效对象')
        return false
      }
      
      if (!profile.userId) {
        console.warn('缺少用户ID')
        return false
      }
      
      if (!profile.progress || typeof profile.progress !== 'object') {
        console.warn('缺少进度对象')
        return false
      }
      
      if (!profile.stats || typeof profile.stats !== 'object') {
        console.warn('缺少统计对象')
        return false
      }
      
      // 检查数据类型
      if (typeof profile.progress.currentLevel !== 'number') {
        console.warn('当前关卡不是数字类型:', typeof profile.progress.currentLevel)
        return false
      }
      
      if (!Array.isArray(profile.progress.completedLevels)) {
        console.warn('已完成关卡不是数组类型:', typeof profile.progress.completedLevels)
        return false
      }
      
      return true
    } catch (error) {
      console.error('数据校验出错:', error)
      return false
    }
  }

  /**
   * 数据迁移和兼容性处理
   * @param {Object} profile - 原始档案
   * @returns {Object} 迁移后的档案
   */
  validateAndMigrateProfile(profile) {
    // 版本迁移
    if (!profile.version || profile.version === '1.0') {
      profile = this.migrateFromV1(profile)
    }
    
    // 补充缺失字段
    if (!profile.preferences) {
      profile.preferences = {
        soundEnabled: true,
        vibrationEnabled: true,
        autoPlay: false,
        difficulty: 'normal'
      }
    }
    
    if (!profile.achievements) {
      profile.achievements = []
    }
    
    return profile
  }

  /**
   * 从V1.0版本迁移数据
   * @param {Object} oldProfile - V1.0档案
   * @returns {Object} V2.0档案
   */
  migrateFromV1(oldProfile) {
    try {
      const newProfile = this.createDefaultProfile()
      
      // 安全地迁移基本信息（兼容两种结构）
      let currentLevel = 1
      
      if (oldProfile.currentLevel && typeof oldProfile.currentLevel === 'number') {
        currentLevel = oldProfile.currentLevel
      } else if (oldProfile.progress && 
                 oldProfile.progress.currentLevel && 
                 typeof oldProfile.progress.currentLevel === 'number') {
        currentLevel = oldProfile.progress.currentLevel
      }
      
      // 确保关卡数值合理
      currentLevel = Math.max(1, Math.min(currentLevel, 35))
      
      newProfile.currentLevel = currentLevel
      newProfile.progress.currentLevel = currentLevel
      
      // 安全地迁移已完成关卡
      if (oldProfile.progress && 
          oldProfile.progress.completedLevels && 
          Array.isArray(oldProfile.progress.completedLevels)) {
        newProfile.progress.completedLevels = [...oldProfile.progress.completedLevels]
      } else {
        // 根据当前关卡推算已完成关卡
        newProfile.progress.completedLevels = []
        for (let i = 1; i < currentLevel; i++) {
          newProfile.progress.completedLevels.push(i)
        }
      }
      
      // 安全地迁移其他基本信息
      if (oldProfile.nickname && typeof oldProfile.nickname === 'string') {
        newProfile.nickname = oldProfile.nickname
      }
      if (oldProfile.avatar && typeof oldProfile.avatar === 'string') {
        newProfile.avatar = oldProfile.avatar
      }
      if (oldProfile.grade && typeof oldProfile.grade === 'string') {
        newProfile.grade = oldProfile.grade
      }
      if (oldProfile.totalWordsLearned && typeof oldProfile.totalWordsLearned === 'number') {
        newProfile.totalWordsLearned = oldProfile.totalWordsLearned
      }
      if (oldProfile.streak && typeof oldProfile.streak === 'number') {
        newProfile.streak = oldProfile.streak
      }
      if (oldProfile.lastStudyDate && typeof oldProfile.lastStudyDate === 'string') {
        newProfile.lastStudyDate = oldProfile.lastStudyDate
      }
      
      // 安全地迁移统计数据
      if (oldProfile.stats && typeof oldProfile.stats === 'object') {
        if (typeof oldProfile.stats.totalWords === 'number') {
          newProfile.stats.totalWords = oldProfile.stats.totalWords
        }
        if (typeof oldProfile.stats.accuracy === 'number') {
          newProfile.stats.accuracy = oldProfile.stats.accuracy
        }
        if (typeof oldProfile.stats.totalCorrect === 'number') {
          newProfile.stats.totalCorrect = oldProfile.stats.totalCorrect
        }
        if (typeof oldProfile.stats.totalAttempts === 'number') {
          newProfile.stats.totalAttempts = oldProfile.stats.totalAttempts
        }
      }
      
      // 保持原有的用户ID和创建时间
      if (oldProfile.userId && typeof oldProfile.userId === 'string') {
        newProfile.userId = oldProfile.userId
      }
      if (oldProfile.createdAt && typeof oldProfile.createdAt === 'string') {
        newProfile.createdAt = oldProfile.createdAt
      }
      
      newProfile.version = '2.0'
      
      console.log('数据迁移完成:', {
        currentLevel: newProfile.progress.currentLevel,
        completedLevels: newProfile.progress.completedLevels
      })
      
      return newProfile
    } catch (error) {
      console.error('数据迁移失败:', error)
      // 如果迁移失败，返回默认档案
      return this.createDefaultProfile()
    }
  }

  /**
   * 自动备份机制
   */
  startAutoBackup() {
    // 每24小时自动备份一次
    const backupInterval = 24 * 60 * 60 * 1000
    
    setInterval(() => {
      this.createBackup()
    }, backupInterval)
    
    // 应用启动时也备份一次
    setTimeout(() => {
      this.createBackup()
    }, 5000)
  }

  /**
   * 创建数据备份
   */
  createBackup() {
    try {
      const profile = util.storage.get(this.storageKeys.userProfile)
      if (!profile) return
      
      const backup = {
        timestamp: Date.now(),
        data: profile,
        version: profile.version || '1.0'
      }
      
      util.storage.set(this.storageKeys.backup, backup)
      console.log('自动备份完成')
    } catch (error) {
      console.error('自动备份失败:', error)
    }
  }

  /**
   * 从备份恢复数据
   */
  restoreFromBackup() {
    try {
      const backup = util.storage.get(this.storageKeys.backup)
      if (!backup || !backup.data) return false
      
      util.storage.set(this.storageKeys.userProfile, backup.data)
      this.clearCache('all')
      
      console.log('从备份恢复数据成功')
      return true
    } catch (error) {
      console.error('从备份恢复失败:', error)
      return false
    }
  }

  /**
   * 触发数据更新事件（安全版本）
   * @param {string} type - 事件类型
   * @param {*} data - 事件数据
   */
  emitDataUpdate(type, data) {
    try {
      // 检查是否在微信小程序环境中
      if (typeof getApp !== 'function') {
        console.warn('getApp函数不可用，跳过数据更新事件')
        return
      }

      let app = null
      
      try {
        app = getApp()
      } catch (appError) {
        console.warn('获取app实例失败:', appError.message)
        return
      }
      
      // 安全检查app对象
      if (!app || typeof app !== 'object') {
        console.warn('app对象未初始化或无效，跳过数据更新事件')
        return
      }

      // 检查onDataUpdate属性是否存在且为函数
      if (app.hasOwnProperty('onDataUpdate') && typeof app.onDataUpdate === 'function') {
        console.log(`触发数据更新事件: ${type}`)
        try {
          app.onDataUpdate(type, data)
        } catch (callError) {
          console.error('调用app.onDataUpdate时发生错误:', callError)
        }
      } else {
        console.log(`app.onDataUpdate方法不存在或不是函数，事件类型: ${type}`)
        // 如果onDataUpdate不存在，可能app还在初始化中，稍后重试
        setTimeout(() => {
          this.retryEmitDataUpdate(type, data, 1)
        }, 100)
      }
      
    } catch (error) {
      console.error('触发数据更新事件时发生错误:', error)
      // 即使事件触发失败，也不应该影响主要功能
    }
  }

  /**
   * 重试触发数据更新事件
   * @param {string} type - 事件类型
   * @param {*} data - 事件数据
   * @param {number} retryCount - 重试次数
   */
  retryEmitDataUpdate(type, data, retryCount) {
    if (retryCount > 3) {
      console.warn(`数据更新事件重试失败，放弃重试: ${type}`)
      return
    }

    try {
      if (typeof getApp === 'function') {
        const app = getApp()
        if (app && typeof app.onDataUpdate === 'function') {
          console.log(`重试触发数据更新事件成功: ${type}, 重试次数: ${retryCount}`)
          app.onDataUpdate(type, data)
          return
        }
      }
      
      // 继续重试
      setTimeout(() => {
        this.retryEmitDataUpdate(type, data, retryCount + 1)
      }, 200)
      
    } catch (error) {
      console.error(`重试触发数据更新事件失败: ${retryCount}`, error)
    }
  }

  /**
   * 计算关卡星级
   * @param {number} accuracy - 准确率
   * @returns {number} 星级(1-3)
   */
  calculateStars(accuracy) {
    if (accuracy >= 95) return 3
    if (accuracy >= 85) return 2
    return 1
  }

  /**
   * 生成用户ID
   * @returns {string} 用户ID
   */
  generateUserId() {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 记录单词学习进度
   * @param {string} word - 单词
   * @param {Object} progress - 进度数据
   * @returns {boolean} 是否成功
   */
  recordWordProgress(word, progress) {
    try {
      const key = `word_progress_${word}`
      const progressData = {
        word,
        success: progress.success,
        timeTaken: progress.timeTaken,
        sessionId: progress.sessionId,
        timestamp: new Date().toISOString()
      }
      
      util.storage.set(key, progressData)
      
      // 更新用户总体统计
      this.updateUserStats(progress.success)
      
      console.log(`📝 记录单词进度: ${word} - ${progress.success ? '成功' : '失败'}`)
      return true
    } catch (error) {
      console.error('记录单词进度失败:', error)
      return false
    }
  }

  /**
   * 记录单词错误拼写次数
   * @param {string} word - 单词
   * @param {Object} errorData - 错误数据
   * @returns {boolean} 是否成功
   */
  recordWordError(word, errorData = {}) {
    try {
      const key = `word_errors_${word}`
      const existingData = util.storage.get(key) || {
        word,
        totalErrors: 0,
        errorHistory: [],
        firstErrorDate: null,
        lastErrorDate: null
      }
      
      // 更新错误次数
      existingData.totalErrors += 1
      existingData.lastErrorDate = new Date().toISOString()
      
      if (!existingData.firstErrorDate) {
        existingData.firstErrorDate = existingData.lastErrorDate
      }
      
      // 记录错误详情
      const errorRecord = {
        timestamp: new Date().toISOString(),
        sessionId: errorData.sessionId || '',
        errorType: errorData.errorType || 'spelling', // spelling, timeout, skip
        userInput: errorData.userInput || '',
        correctAnswer: word,
        attemptNumber: errorData.attemptNumber || 1
      }
      
      existingData.errorHistory.push(errorRecord)
      
      // 保持错误历史记录在合理范围内（最多保留50条）
      if (existingData.errorHistory.length > 50) {
        existingData.errorHistory = existingData.errorHistory.slice(-50)
      }
      
      util.storage.set(key, existingData)
      
      console.log(`❌ 记录单词错误: ${word} - 总错误次数: ${existingData.totalErrors}`)
      return true
    } catch (error) {
      console.error('记录单词错误失败:', error)
      return false
    }
  }

  /**
   * 获取单词错误统计
   * @param {string} word - 单词
   * @returns {Object} 错误统计数据
   */
  getWordErrorStats(word) {
    try {
      const key = `word_errors_${word}`
      const errorData = util.storage.get(key)
      
      if (!errorData) {
        return {
          word,
          totalErrors: 0,
          errorHistory: [],
          firstErrorDate: null,
          lastErrorDate: null
        }
      }
      
      return errorData
    } catch (error) {
      console.error('获取单词错误统计失败:', error)
      return {
        word,
        totalErrors: 0,
        errorHistory: [],
        firstErrorDate: null,
        lastErrorDate: null
      }
    }
  }

  /**
   * 获取用户最容易出错的单词排行榜
   * @param {number} limit - 返回数量限制，默认10个
   * @returns {Array} 错误单词排行榜
   */
  getMostErrorProneWords(limit = 10) {
    try {
      const allKeys = util.storage.getAllKeys()
      const errorKeys = allKeys.filter(key => key.startsWith('word_errors_'))
      
      const errorStats = errorKeys.map(key => {
        const data = util.storage.get(key)
        return {
          word: data.word,
          totalErrors: data.totalErrors,
          lastErrorDate: data.lastErrorDate,
          errorRate: this.calculateWordErrorRate(data.word)
        }
      })
      
      // 按错误次数降序排序
      errorStats.sort((a, b) => b.totalErrors - a.totalErrors)
      
      return errorStats.slice(0, limit)
    } catch (error) {
      console.error('获取错误单词排行榜失败:', error)
      return []
    }
  }

  /**
   * 计算单词错误率
   * @param {string} word - 单词
   * @returns {number} 错误率（0-100）
   */
  calculateWordErrorRate(word) {
    try {
      const errorData = this.getWordErrorStats(word)
      const progressKey = `word_progress_${word}`
      const progressData = util.storage.get(progressKey)
      
      if (!progressData && errorData.totalErrors === 0) {
        return 0
      }
      
      const totalAttempts = (progressData ? 1 : 0) + errorData.totalErrors
      const errorRate = totalAttempts > 0 ? (errorData.totalErrors / totalAttempts) * 100 : 0
      
      return Math.round(errorRate * 100) / 100 // 保留两位小数
    } catch (error) {
      console.error('计算单词错误率失败:', error)
      return 0
    }
  }

  /**
   * 清除单词错误记录
   * @param {string} word - 单词，如果不提供则清除所有错误记录
   * @returns {boolean} 是否成功
   */
  clearWordErrors(word = null) {
    try {
      if (word) {
        // 清除特定单词的错误记录
        const key = `word_errors_${word}`
        util.storage.remove(key)
        console.log(`🧹 已清除单词 ${word} 的错误记录`)
      } else {
        // 清除所有单词错误记录
        const allKeys = util.storage.getAllKeys()
        const errorKeys = allKeys.filter(key => key.startsWith('word_errors_'))
        
        errorKeys.forEach(key => {
          util.storage.remove(key)
        })
        
        console.log(`🧹 已清除所有单词错误记录，共 ${errorKeys.length} 条`)
      }
      
      return true
    } catch (error) {
      console.error('清除单词错误记录失败:', error)
      return false
    }
  }

  /**
   * 保存关卡中途进度
   * @param {number} levelId - 关卡ID
   * @param {Object} progressData - 进度数据
   * @returns {boolean} 是否成功
   */
  saveLevelProgress(levelId, progressData) {
    try {
      const progressKey = `level_progress_${levelId}`
      const saveData = {
        levelId,
        currentWordIndex: progressData.currentWordIndex,
        stats: progressData.stats,
        sessionId: progressData.sessionId,
        savedAt: new Date().toISOString(),
        mode: progressData.mode || 'learn'
      }
      
      util.storage.set(progressKey, saveData)
      console.log(`💾 保存关卡${levelId}中途进度: 单词索引${progressData.currentWordIndex}`)
      return true
    } catch (error) {
      console.error('保存关卡进度失败:', error)
      return false
    }
  }

  /**
   * 获取关卡中途进度
   * @param {number} levelId - 关卡ID
   * @returns {Object|null} 进度数据
   */
  getLevelProgress(levelId) {
    try {
      const progressKey = `level_progress_${levelId}`
      const progressData = util.storage.get(progressKey)
      
      if (progressData) {
        console.log(`📖 找到关卡${levelId}的中途进度: 单词索引${progressData.currentWordIndex}`)
        return progressData
      }
      
      return null
    } catch (error) {
      console.error('获取关卡进度失败:', error)
      return null
    }
  }

  /**
   * 清除关卡中途进度
   * @param {number} levelId - 关卡ID
   * @returns {boolean} 是否成功
   */
  clearLevelProgress(levelId) {
    try {
      const progressKey = `level_progress_${levelId}`
      util.storage.remove(progressKey)
      console.log(`🗑️ 清除关卡${levelId}的中途进度`)
      return true
    } catch (error) {
      console.error('清除关卡进度失败:', error)
      return false
    }
  }

  /**
   * 完成关卡学习
   * @param {number} levelId - 关卡ID
   * @param {Object} stats - 统计数据
   * @returns {Promise<boolean>} 是否成功
   */
  async completeLevelProgress(levelId, stats) {
    try {
      const levelKey = `level_complete_${levelId}`
      const levelData = {
        levelId,
        accuracy: stats.accuracy,
        totalWords: stats.totalWords,
        correctWords: stats.correctWords,
        sessionId: stats.sessionId,
        completedAt: new Date().toISOString()
      }
      
      util.storage.set(levelKey, levelData)
      
      // 清除中途进度
      this.clearLevelProgress(levelId)
      
      // 解锁下一关
      await this.unlockNextLevel(levelId)
      
      console.log(`🎉 完成关卡 ${levelId}: ${stats.correctWords}/${stats.totalWords} 正确`)
      return true
    } catch (error) {
      console.error('记录关卡完成失败:', error)
      return false
    }
  }

  /**
   * 解锁下一关
   * @param {number} currentLevel - 当前关卡
   * @returns {Promise<void>}
   */
  async unlockNextLevel(currentLevel) {
    try {
      console.log(`🔍 开始解锁关卡${currentLevel + 1}...`)
      
      const userProfile = this.getUserProfile()
      console.log(`📊 当前用户档案: currentLevel=${userProfile.currentLevel}, progress.currentLevel=${userProfile.progress.currentLevel}`)
      console.log(`📋 已完成关卡: [${userProfile.progress.completedLevels.join(', ')}]`)
      
      if (userProfile && currentLevel >= userProfile.currentLevel) {
        // 同时更新两个位置的currentLevel以确保兼容性
        const oldCurrentLevel = userProfile.currentLevel
        userProfile.currentLevel = currentLevel + 1
        userProfile.progress.currentLevel = currentLevel + 1
        
        console.log(`📈 更新currentLevel: ${oldCurrentLevel} -> ${currentLevel + 1}`)
        
        // 标记当前关卡为已完成
        if (!userProfile.progress.completedLevels.includes(currentLevel)) {
          userProfile.progress.completedLevels.push(currentLevel)
          console.log(`✅ 添加已完成关卡: ${currentLevel}`)
        } else {
          console.log(`ℹ️ 关卡${currentLevel}已在完成列表中`)
        }
        
        // 等待保存完成
        console.log(`💾 保存用户档案...`)
        await this.saveUserProfile(userProfile)
        console.log(`🔓 解锁关卡 ${currentLevel + 1}，已完成关卡: [${userProfile.progress.completedLevels.join(', ')}]`)
      } else {
        console.log(`⏭️ 跳过解锁: currentLevel=${currentLevel}, userProfile.currentLevel=${userProfile.currentLevel}`)
      }
    } catch (error) {
      console.error('❌ 解锁下一关失败:', error)
    }
  }

  /**
   * 更新用户统计
   * @param {boolean} success - 是否成功
   */
  updateUserStats(success) {
    try {
      const userProfile = this.getUserProfile()
      if (userProfile) {
        if (success) {
          userProfile.totalWordsLearned = (userProfile.totalWordsLearned || 0) + 1
          userProfile.streak = (userProfile.streak || 0) + 1
        } else {
          userProfile.streak = 0
        }
        userProfile.lastStudyDate = new Date().toISOString()
        this.saveUserProfile(userProfile)
      }
    } catch (error) {
      console.error('更新用户统计失败:', error)
    }
  }

  /**
   * 格式化日期
   * @param {Date} date - 日期对象
   * @param {string} format - 格式
   * @returns {string} 格式化后的日期
   */
  formatDate(date, format) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    return format.replace('YYYY', year).replace('MM', month).replace('DD', day)
  }
}

// 创建全局实例
const dataManager = new DataManager()

module.exports = dataManager