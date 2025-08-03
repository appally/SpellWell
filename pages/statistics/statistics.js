// pages/statistics/statistics.js
const util = require('../../utils/util.js')
const wordLibrary = require('../../utils/word-library.js')

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
    
    // 每日学习数据
    dailyStats: [],
    
    // 关卡进度
    levelProgress: [],
    
    // 成就数据
    achievements: [],
    completedAchievements: 0,
    
    // 图表数据
    chartData: {
      accuracy: [],
      words: []
    },
    
    // UI状态
    selectedTab: 'overview', // overview, progress, achievements, charts
    loading: false
  },

  onLoad() {
    console.log('统计页面加载')
    this.loadStatistics()
  },

  onShow() {
    console.log('统计页面显示')
    this.refreshData()
  },

  onPullDownRefresh() {
    console.log('下拉刷新统计数据')
    this.refreshData()
  },

  // 加载统计数据
  loadStatistics() {
    this.setData({ loading: true })
    
    try {
      const userProfile = util.storage.get('wordHero_profile') || {}
      const overallStats = this.calculateOverallStats(userProfile)
      const dailyStats = this.getDailyStats(userProfile)
      const levelProgress = this.getLevelProgress(userProfile)
      const achievements = this.getAchievements(userProfile)
      const completedAchievements = achievements.filter(a => a.completed).length
      const chartData = this.generateChartData(dailyStats)
      
      this.setData({
        userProfile,
        overallStats,
        dailyStats,
        levelProgress,
        achievements,
        completedAchievements,
        chartData,
        loading: false
      })
      
    } catch (error) {
      console.error('加载统计数据失败:', error)
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

  // 获取每日统计
  getDailyStats(profile) {
    const dailyRecords = profile.dailyRecords || {}
    const stats = []
    
    // 获取最近7天的数据
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateKey = util.formatDate(date, 'YYYY-MM-DD')
      
      const record = dailyRecords[dateKey] || {
        words: 0,
        accuracy: 0,
        studyTime: 0
      }
      
      stats.push({
        date: dateKey,
        displayDate: util.formatDate(date, 'MM/DD'),
        weekday: this.getWeekday(date.getDay()),
        barHeight: record.words * 10,
        ...record
      })
    }
    
    return stats
  },

  // 获取星期几
  getWeekday(day) {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return weekdays[day]
  },

  // 获取关卡进度
  getLevelProgress(profile) {
    const progress = profile.progress || {}
    const currentLevel = progress.currentLevel || 1
    
    const levels = []
    
    for (let level = 1; level <= 20; level++) {
      const levelData = wordLibrary.getLevelWords(level) // 移除年级参数，使用默认小学词库
      
      let status = 'locked'
      if (level < currentLevel) {
        status = 'completed'
      } else if (level === currentLevel) {
        status = 'current'
      } else if (level === currentLevel + 1) {
        status = 'available'
      }
      
      levels.push({
        level,
        theme: levelData.theme,
        totalWords: levelData.totalWords,
        status,
        stars: level < currentLevel ? 3 : 0 // 简化星级系统
      })
    }
    
    return levels
  },

  // 获取成就数据
  getAchievements(profile) {
    const achievements = []
    const stats = profile.stats || {}
    
    // 定义成就列表
    const achievementList = [
      {
        id: 'first_word',
        title: '初学者',
        description: '学会第一个单词',
        icon: '🌟',
        requirement: 1,
        current: stats.totalWords || 0,
        type: 'words'
      },
      {
        id: 'word_master_10',
        title: '小小词汇家',
        description: '累计学会10个单词',
        icon: '📚',
        requirement: 10,
        current: stats.totalWords || 0,
        type: 'words'
      },
      {
        id: 'word_master_50',
        title: '词汇达人',
        description: '累计学会50个单词',
        icon: '🎓',
        requirement: 50,
        current: stats.totalWords || 0,
        type: 'words'
      },
      {
        id: 'accuracy_80',
        title: '精准射手',
        description: '准确率达到80%',
        icon: '🎯',
        requirement: 80,
        current: stats.accuracy || 0,
        type: 'accuracy'
      },
      {
        id: 'streak_5',
        title: '连击高手',
        description: '连续答对5题',
        icon: '⚡',
        requirement: 5,
        current: stats.streak || 0,
        type: 'streak'
      },
      {
        id: 'daily_study_7',
        title: '坚持学习',
        description: '连续学习7天',
        icon: '🔥',
        requirement: 7,
        current: this.calculateStudyDays(profile),
        type: 'days'
      }
    ]
    
    // 计算成就完成状态
    achievementList.forEach(achievement => {
      achievement.completed = achievement.current >= achievement.requirement
      achievement.progress = Math.min(achievement.current / achievement.requirement, 1)
      achievement.progressWidth = Math.round(achievement.progress * 100)
    })
    
    return achievementList
  },

  // 生成图表数据
  generateChartData(dailyStats) {
    return {
      accuracy: dailyStats.map(day => ({
        label: day.weekday,
        value: day.accuracy
      })),
      words: dailyStats.map(day => ({
        label: day.weekday,
        value: day.words,
        barHeight: day.words * 10
      }))
    }
  },

  // 切换选项卡
  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab
    util.playSound('button_click')
    
    this.setData({ selectedTab: tab })
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

  // 查看关卡详情
  onLevelDetail(e) {
    const level = e.currentTarget.dataset.level
    const levelData = this.data.levelProgress.find(l => l.level === level)
    
    if (levelData && levelData.status !== 'locked') {
      util.showModal(
        `第${level}关 - ${levelData.theme}`,
        `包含${levelData.totalWords}个单词\n完成度：${levelData.stars}/3星`
      )
    }
  },

  // 返回地图
  onBackToMap() {
    util.navigateTo('/pages/adventure-map/adventure-map')
  }
})