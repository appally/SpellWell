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
      if (!profile.userId || !profile.progress || !profile.stats) {
        return false
      }
      
      // 检查数据类型
      if (typeof profile.progress.currentLevel !== 'number' ||
          !Array.isArray(profile.progress.completedLevels)) {
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
    const newProfile = this.createDefaultProfile()
    
    // 迁移基本信息（兼容两种结构）
    const currentLevel = oldProfile.currentLevel || 
                        (oldProfile.progress && oldProfile.progress.currentLevel) || 1
    
    newProfile.currentLevel = currentLevel
    newProfile.progress.currentLevel = currentLevel
    
    // 迁移已完成关卡
    if (oldProfile.progress && oldProfile.progress.completedLevels) {
      newProfile.progress.completedLevels = oldProfile.progress.completedLevels
    } else {
      // 根据当前关卡推算已完成关卡
      newProfile.progress.completedLevels = []
      for (let i = 1; i < currentLevel; i++) {
        newProfile.progress.completedLevels.push(i)
      }
    }
    
    // 迁移其他基本信息
    if (oldProfile.nickname) newProfile.nickname = oldProfile.nickname
    if (oldProfile.avatar) newProfile.avatar = oldProfile.avatar
    if (oldProfile.grade) newProfile.grade = oldProfile.grade
    if (oldProfile.totalWordsLearned) newProfile.totalWordsLearned = oldProfile.totalWordsLearned
    if (oldProfile.streak) newProfile.streak = oldProfile.streak
    if (oldProfile.lastStudyDate) newProfile.lastStudyDate = oldProfile.lastStudyDate
    
    // 迁移统计数据
    if (oldProfile.stats) {
      newProfile.stats.totalWords = oldProfile.stats.totalWords || 0
      newProfile.stats.accuracy = oldProfile.stats.accuracy || 0
      newProfile.stats.totalCorrect = oldProfile.stats.totalCorrect || 0
      newProfile.stats.totalAttempts = oldProfile.stats.totalAttempts || 0
    }
    
    // 保持原有的用户ID和创建时间
    if (oldProfile.userId) {
      newProfile.userId = oldProfile.userId
    }
    if (oldProfile.createdAt) {
      newProfile.createdAt = oldProfile.createdAt
    }
    
    newProfile.version = '2.0'
    
    return newProfile
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
   * 完成关卡学习
   * @param {number} levelId - 关卡ID
   * @param {Object} stats - 统计数据
   * @returns {boolean} 是否成功
   */
  completeLevelProgress(levelId, stats) {
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
      
      // 解锁下一关
      this.unlockNextLevel(levelId)
      
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
   */
  unlockNextLevel(currentLevel) {
    try {
      const userProfile = this.getUserProfile()
      if (userProfile && currentLevel >= userProfile.currentLevel) {
        // 同时更新两个位置的currentLevel以确保兼容性
        userProfile.currentLevel = currentLevel + 1
        userProfile.progress.currentLevel = currentLevel + 1
        
        // 标记当前关卡为已完成
        if (!userProfile.progress.completedLevels.includes(currentLevel)) {
          userProfile.progress.completedLevels.push(currentLevel)
        }
        
        this.saveUserProfile(userProfile)
        console.log(`🔓 解锁关卡 ${currentLevel + 1}，已完成关卡: ${userProfile.progress.completedLevels.join(', ')}`)
      }
    } catch (error) {
      console.error('解锁下一关失败:', error)
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