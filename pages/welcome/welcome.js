// pages/welcome/welcome.js
const util = require('../../utils/util.js')
const { processPageEmojis } = require('../../utils/emoji-compatibility')

Page({
  data: {
    showLoading: false,
    showWelcome: true,
  },

  onLoad(options) {
    console.log('欢迎页面加载')
    // 直接显示欢迎页面，无需加载过程
    this.animateWelcome()
  },

  onReady() {
    console.log('欢迎页面准备完成')
    // 应用表情符号兼容性处理
    processPageEmojis(this)
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

  // 已移除模拟加载过程，直接显示欢迎页面

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

  /**
   * 查看学习统计
   * 跳转到统计页面
   */
  onViewStatistics() {
    util.playSound('button_click')
    util.navigateTo('/pages/statistics/statistics')
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