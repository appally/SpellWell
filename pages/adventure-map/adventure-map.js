// pages/adventure-map/adventure-map.js
const util = require('../../utils/util.js')
const dataManager = require('../../utils/data-manager.js')

Page({
  data: {
    userInfo: {
      name: '小超人',
      grade: '小学词库',
      avatar: '🎓'
    },
    currentLevel: 1,
    maxLevel: 20,
    userProgress: 1,
    levels: [],
    selectedLevel: null,
    showLevelPreview: false,
    previewData: {},
    progressPercentage: 0,
    progressText: '1/20',
    
    // 新增数据
    dailyStreak: 3,
    hasNewItems: true,
    mapDecorations: true
  },

  onLoad(options) {
    console.log('冒险地图页面加载')
    this.loadUserData()
    this.generateLevels()
  },

  onReady() {
    console.log('冒险地图页面准备完成')
  },

  onShow() {
    console.log('冒险地图页面显示')
    
    // 刷新用户数据（可能在其他页面有更新）
    this.loadUserData()
    this.updateProgress()
    this.animateLevels()
    this.initMapPath()
  },

  onHide() {
    console.log('冒险地图页面隐藏')
  },

  onUnload() {
    console.log('冒险地图页面卸载')
  },

  // 加载用户数据
  loadUserData() {
    try {
      const userProfile = dataManager.getUserProfile()
      
      this.setData({
        userInfo: {
          name: userProfile.nickname || '小超人',
          grade: '小学词库',
          avatar: userProfile.avatar || '🎓'
        },
        currentLevel: userProfile.currentLevel || 1,
        userProgress: userProfile.currentLevel || 1,
        dailyStreak: userProfile.streak || 0
      })
      
      // 生成关卡数据
      this.generateLevels()
    } catch (error) {
      console.error('加载用户数据失败:', error)
      // 使用默认数据
      this.setData({
        currentLevel: 1,
        userProgress: 1
      })
      this.generateLevels()
    }
  },

  // 生成关卡数据 (优化版 - 使用数据管理器和缓存)
  generateLevels() {
    try {
      const levels = []
      const levelNumbers = Array.from({length: this.data.maxLevel}, (_, i) => i + 1)
      
      // 获取最新的用户档案数据
      const userProfile = dataManager.getUserProfile()
      const completedLevels = userProfile?.progress?.completedLevels || []
      const currentLevel = userProfile?.progress?.currentLevel || 1
      
      // 批量获取关卡数据（带缓存）
      const levelDataList = dataManager.getBatchLevelData(levelNumbers)
      
      for (let i = 0; i < levelDataList.length; i++) {
        const levelData = levelDataList[i]
        const levelNumber = i + 1
        
        // 确定关卡状态
        let status = 'locked'
        if (completedLevels.includes(levelNumber)) {
          status = 'completed'
        } else if (levelNumber === currentLevel) {
          status = 'current'
        } else if (levelNumber <= currentLevel) {
          status = 'available'
        }
        
        // 调试日志
        if (levelNumber <= 3) {
          console.log(`关卡${levelNumber}: currentLevel=${currentLevel}, completedLevels=[${completedLevels.join(',')}], status=${status}`)
        }
        
        // 获取关卡详细进度
        const levelProgress = userProfile && userProfile.progress && userProfile.progress.levelProgress ? 
          userProfile.progress.levelProgress[levelNumber] : null
        
        levels.push({
          id: levelNumber,
          icon: levelData.icon,
          name: levelData.theme,
          desc: levelData.description,
          status,
          wordCount: levelData.totalWords,
          // 新增字段：完成度信息
          accuracy: levelProgress?.accuracy || 0,
          stars: levelProgress?.stars || 0,
          timeSpent: levelProgress?.timeSpent || 0
        })
      }

      // 计算进度百分比 - 使用最新的用户进度
      const progressPercentage = Math.round((currentLevel / this.data.maxLevel) * 100)
      const progressText = `${currentLevel}/${this.data.maxLevel}`
      
      this.setData({ 
        levels,
        progressPercentage,
        progressText
      })
      
      // 数据加载完成后重新绘制路径
      setTimeout(() => {
        this.initMapPath()
      }, 100)
    } catch (error) {
      console.error('生成关卡数据失败:', error)
      // 降级处理：使用默认数据
      this.generateDefaultLevels()
    }
  },

  // 降级处理：生成默认关卡数据
  generateDefaultLevels() {
    const levels = []
    const userProfile = dataManager.getUserProfile()
    const completedLevels = userProfile?.progress?.completedLevels || []
    const currentLevel = userProfile?.progress?.currentLevel || 1
    
    for (let i = 1; i <= this.data.maxLevel; i++) {
      let status = 'locked'
      if (completedLevels.includes(i)) {
        status = 'completed'
      } else if (i === currentLevel) {
        status = 'current'
      } else if (i <= currentLevel) {
        status = 'available'
      }
      
      // 尝试获取实际单词数量，如果失败则使用默认值
      let wordCount = 5 // 默认值
      try {
        const wordLibrary = require('../../utils/word-library.js')
        const levelData = wordLibrary.getLevelWords(i)
        wordCount = levelData.totalWords || 5
      } catch (error) {
        console.warn(`无法获取关卡${i}的单词数量，使用默认值5`)
      }
      
      levels.push({
        id: i,
        icon: '📖',
        name: `第${i}关`,
        desc: '学习单词',
        status,
        wordCount
      })
    }
    
    this.setData({ levels })
    
    // 降级数据加载完成后重新绘制路径
    setTimeout(() => {
      this.initMapPath()
    }, 100)
  },

  // 数据更新监听
  onDataUpdate(type, data) {
    if (type === 'profile') {
      console.log('接收到用户档案更新，刷新页面数据')
      this.loadUserData()
    }
  },

  // 更新进度显示
  updateProgress() {
    const userProfile = dataManager.getUserProfile()
    const currentLevel = userProfile?.progress?.currentLevel || 1
    
    const progressText = `${currentLevel}/${this.data.maxLevel}`
    const progressPercentage = Math.round((currentLevel / this.data.maxLevel) * 100)
    this.setData({
      progressText,
      progressPercentage,
      userProgress: currentLevel,
      currentLevel: currentLevel
    })
  },

  // 关卡动画
  animateLevels() {
    this.data.levels.forEach((level, index) => {
      setTimeout(() => {
        const animation = wx.createAnimation({
          duration: 400,
          timingFunction: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
        })
        
        animation.opacity(1).translateY(0).step()
        
        this.setData({
          [`levelAnimation${index}`]: animation.export()
        })
      }, index * 100)
    })
  },

  // 点击关卡
  onLevelTap(e) {
    const levelId = e.currentTarget.dataset.id
    const level = this.data.levels.find(l => l.id === levelId)
    
    console.log(`点击关卡${levelId}, 状态: ${level?.status}`)
    
    if (level.status === 'locked') {
      util.showToast('请先完成前面的关卡', 'none')
      return
    }

    util.playSound('tap')
    
    this.setData({
      selectedLevel: levelId,
      previewData: {
        ...level,
        title: `第${level.id}关 - ${level.name}`,
        description: `学习${level.name}相关的${level.wordCount}个单词，完成手写练习挑战`
      },
      showLevelPreview: true
    })
  },

  // 关闭预览
  onClosePreview() {
    this.setData({
      showLevelPreview: false,
      selectedLevel: null
    })
  },

  // 开始关卡
  onStartLevel() {
    if (!this.data.selectedLevel) return

    util.playSound('level_start')
    
    // 保存当前关卡到本地存储
    util.storage.set('wordHero_currentLevel', this.data.selectedLevel)
    
    // 跳转到单词学习页面
    util.navigateTo('/pages/word-learning/word-learning', {
      level: this.data.selectedLevel
    })
  },

  // 继续冒险
  onContinueAdventure() {
    util.playSound('button_click')
    
    // 直接进入当前关卡
    util.storage.set('wordHero_currentLevel', this.data.currentLevel)
    util.navigateTo('/pages/word-learning/word-learning', {
      level: this.data.currentLevel
    })
  },

  // 打开设置
  onOpenSettings() {
    util.playSound('button_click')
    util.navigateTo('/pages/statistics/statistics')
  },

  // 预览遮罩点击
  onPreviewMaskTap() {
    this.onClosePreview()
  },

  // 初始化地图路径Canvas
  initMapPath() {
    const query = wx.createSelectorQuery().in(this)
    query.select('#pathCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (res && res[0] && res[0].node) {
          const canvas = res[0].node
          const ctx = canvas.getContext('2d')
          
          const dpr = wx.getSystemInfoSync().pixelRatio || 1
          canvas.width = res[0].width * dpr
          canvas.height = res[0].height * dpr
          ctx.scale(dpr, dpr)
          
          this.drawMapPath(ctx, res[0].width, res[0].height)
        }
      })
  },

  // 绘制地图路径
  drawMapPath(ctx, width, height) {
    ctx.strokeStyle = 'rgba(127, 179, 211, 0.4)'
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.setLineDash([12, 8])
    
    // 计算关卡位置 (基于2列网格布局)
    const levels = this.data.levels || []
    const gridCols = 2
    const levelPositions = []
    
    // rpx到px的转换比例 (假设375px设计稿)
    const rpxToPx = width / 750 // 微信小程序的rpx基准
    
    // 计算每个关卡的中心位置
    for (let i = 0; i < Math.min(levels.length, 20); i++) {
      const row = Math.floor(i / gridCols)
      const col = i % gridCols
      
      // 基于CSS网格布局计算位置
      // grid-template-columns: repeat(2, 1fr); gap: 80rpx 60rpx; padding: 40rpx 30rpx;
      const containerPadding = 30 * rpxToPx
      const gapX = 60 * rpxToPx
      const gapY = 80 * rpxToPx
      const ringSize = 120 * rpxToPx
      
      // 计算每列的宽度
      const availableWidth = width - (containerPadding * 2)
      const colWidth = (availableWidth - gapX) / gridCols
      
      const x = containerPadding + (col * (colWidth + gapX)) + (colWidth / 2)
      const y = 40 * rpxToPx + (row * (ringSize + gapY + 80 * rpxToPx)) + (ringSize / 2)
      
      levelPositions.push({ x, y })
    }
    
    if (levelPositions.length < 2) return
    
    // 绘制连接路径
    ctx.beginPath()
    
    // 从第一个关卡开始
    ctx.moveTo(levelPositions[0].x, levelPositions[0].y)
    
    // 连接每个关卡
    for (let i = 1; i < levelPositions.length; i++) {
      const current = levelPositions[i]
      const previous = levelPositions[i - 1]
      
      // 使用二次贝塞尔曲线创建自然的连接
      const controlX = (previous.x + current.x) / 2
      const controlY = previous.y + (current.y - previous.y) * 0.3
      
      ctx.quadraticCurveTo(controlX, controlY, current.x, current.y)
    }
    
    ctx.stroke()
    
    // 重置虚线设置
    ctx.setLineDash([])
    
    // 添加一些装饰性的点
    this.drawPathDecorations(ctx, levelPositions)
  },

  // 绘制路径装饰
  drawPathDecorations(ctx, levelPositions) {
    ctx.fillStyle = 'rgba(127, 179, 211, 0.2)'
    
    // 在路径上添加一些小点作为装饰
    for (let i = 0; i < levelPositions.length - 1; i++) {
      const current = levelPositions[i]
      const next = levelPositions[i + 1]
      
      // 在两点之间添加装饰点
      const midX = (current.x + next.x) / 2
      const midY = (current.y + next.y) / 2
      
      ctx.beginPath()
      ctx.arc(midX, midY, 2, 0, 2 * Math.PI)
      ctx.fill()
    }
  },

  // 打开统计页面
  onOpenStats() {
    util.playSound('button_click')
    util.navigateTo('/pages/statistics/statistics')
  },

  // 每日挑战
  onDailyChallenge() {
    util.playSound('button_click')
    util.showToast('每日挑战功能即将上线！', 'none')
  },

  // 打开商店
  onOpenShop() {
    util.playSound('button_click')
    util.showToast('商店功能即将上线！', 'none')
  }
})