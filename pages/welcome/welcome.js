// pages/welcome/welcome.js
const util = require('../../utils/util.js')

Page({
  data: {
    loadingProgress: 0,
    showLoading: true,
    showWelcome: false,
  },

  onLoad(options) {
    console.log('欢迎页面加载')
    this.simulateLoading()
  },

  onReady() {
    console.log('欢迎页面准备完成')
  },

  onShow() {
    console.log('欢迎页面显示')
    // 播放欢迎音效
    util.playSound('welcome')
  },

  onHide() {
    console.log('欢迎页面隐藏')
  },

  onUnload() {
    console.log('欢迎页面卸载')
  },

  // 模拟加载过程
  simulateLoading() {
    const interval = setInterval(() => {
      let progress = this.data.loadingProgress + Math.random() * 15 + 5
      
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        
        setTimeout(() => {
          this.setData({
            showLoading: false,
            showWelcome: true
          })
          
          // 添加入场动画
          this.animateWelcome()
        }, 500)
      }
      
      this.setData({
        loadingProgress: progress
      })
    }, 100)
  },

  // 欢迎页面入场动画
  animateWelcome() {
    const animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    })

    animation.opacity(1).scale(1).step()
    
    this.setData({
      welcomeAnimation: animation.export()
    })
  },

  // 开始冒险
  onStartAdventure() {
    util.playSound('button_click')
    
    // 直接进入冒险地图（使用默认小学词库）
    this.initDefaultProfile()
    util.navigateTo('/pages/adventure-map/adventure-map')
  },


  // 初始化默认用户资料
  initDefaultProfile() {
    let userProfile = util.storage.get('wordHero_profile') || {}
    
    // 设置默认配置（小学词库）
    userProfile = {
      ...userProfile,
      level: 'primary', // 小学词库
      createdAt: userProfile.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: {
        currentLevel: 1,
        completedWords: [],
        totalScore: 0,
        streak: 0,
        ...userProfile.progress
      }
    }

    // 保存用户资料
    util.storage.set('wordHero_profile', userProfile)
  }
})