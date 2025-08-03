// app.js
const dataManager = require('./utils/data-manager.js')

App({
  onLaunch() {
    console.log('单词小超人启动')
    
    // 初始化数据管理器
    this.initDataManager()
    
    // 初始化用户数据
    this.initUserData()
    
    // 初始化单词库
    this.initWordLibrary()
    
    // 检查更新
    this.checkUpdate()
  },

  onShow() {
    console.log('应用显示')
    // 记录学习时长
    this.globalData.sessionStartTime = Date.now()
  },

  onHide() {
    console.log('应用隐藏')
    // 记录学习时长
    if (this.globalData.sessionStartTime) {
      const sessionTime = Date.now() - this.globalData.sessionStartTime
      console.log('本次学习时长:', Math.round(sessionTime / 1000), '秒')
    }
  },

  onError(error) {
    console.error('应用发生错误:', error)
  },

  // 初始化数据管理器
  initDataManager() {
    try {
      // 使用数据管理器初始化缓存等基础设施
      console.log('📊 数据管理器初始化完成')
    } catch (error) {
      console.error('📊 数据管理器初始化失败:', error)
    }
  },

  // 初始化用户数据
  initUserData() {
    try {
      // 获取或创建用户档案
      let userProfile = dataManager.getUserProfile()
      
      if (!userProfile) {
        userProfile = {
          userId: this.generateUserId(),
          nickname: '小学员',
          avatar: '',
          grade: 1,
          currentLevel: 1,
          totalWordsLearned: 0,
          streak: 0,
          lastStudyDate: null,
          createdAt: new Date().toISOString(),
          version: 2 // 数据版本号
        }
        
        dataManager.saveUserProfile(userProfile)
        console.log('👤 创建新用户档案:', userProfile.userId)
      } else {
        console.log('👤 加载用户档案:', userProfile.userId)
      }
      
      // 将用户数据存储到全局数据
      this.globalData.userProfile = userProfile
      
    } catch (error) {
      console.error('👤 用户数据初始化失败:', error)
      // 创建默认用户数据
      this.globalData.userProfile = {
        userId: this.generateUserId(),
        nickname: '小学员',
        grade: 1,
        currentLevel: 1,
        totalWordsLearned: 0,
        streak: 0
      }
    }
  },

  // 初始化单词库
  initWordLibrary() {
    try {
      const wordLibrary = require('./utils/word-library.js')
      
      // 预加载小学单词数据
      const primaryWords = wordLibrary.getAllPrimaryWords()
      console.log('📚 单词库初始化完成，小学单词数量:', primaryWords.length)
      
      // 检查单词库完整性
      if (primaryWords.length === 0) {
        console.warn('⚠️ 小学单词库为空，请检查数据')
      }
      
    } catch (error) {
      console.error('📚 单词库初始化失败:', error)
    }
  },

  // 检查应用更新
  checkUpdate() {
    try {
      if (wx.canIUse('getUpdateManager')) {
        const updateManager = wx.getUpdateManager()
        
        updateManager.onCheckForUpdate((res) => {
          if (res.hasUpdate) {
            console.log('🔄 发现新版本')
          }
        })
        
        updateManager.onUpdateReady(() => {
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用？',
            success: (res) => {
              if (res.confirm) {
                updateManager.applyUpdate()
              }
            }
          })
        })
        
        updateManager.onUpdateFailed(() => {
          console.error('❌ 新版本下载失败')
        })
      }
    } catch (error) {
      console.error('🔄 检查更新失败:', error)
    }
  },

  // 生成用户ID
  generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  },

  // 数据更新事件处理
  onDataUpdate(type, data) {
    try {
      console.log(`📊 接收到数据更新事件: ${type}`)
      
      if (type === 'profile') {
        // 更新全局用户档案数据
        this.globalData.userProfile = data
        console.log('📊 全局用户档案已更新')
        
        // 通知当前页面刷新数据
        const pages = getCurrentPages()
        if (pages.length > 0) {
          const currentPage = pages[pages.length - 1]
          if (currentPage && typeof currentPage.onDataUpdate === 'function') {
            console.log(`📊 通知页面 ${currentPage.route} 刷新数据`)
            currentPage.onDataUpdate(type, data)
          }
        }
      }
    } catch (error) {
      console.error('📊 处理数据更新事件失败:', error)
    }
  },

  // 全局数据
  globalData: {
    userProfile: null,
    sessionStartTime: null,
    appVersion: '1.0.0'
  }
})