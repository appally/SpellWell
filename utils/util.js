/**
 * 单词小超人工具函数库
 */

// 时间格式化函数
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

// 日期格式化函数
const formatDate = (date, format = 'YYYY-MM-DD') => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  const pad = (num) => num.toString().padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', pad(month))
    .replace('DD', pad(day))
}

// 页面跳转函数
const navigateTo = (url, params = {}) => {
  let urlWithParams = url
  if (Object.keys(params).length > 0) {
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&')
    urlWithParams = `${url}?${queryString}`
  }

  wx.navigateTo({
    url: urlWithParams,
    fail: (error) => {
      console.error('页面跳转失败:', error)
      wx.showToast({
        title: '页面跳转失败',
        icon: 'none'
      })
    }
  })
}

// 页面重定向
const redirectTo = (url) => {
  wx.redirectTo({
    url,
    fail: (error) => {
      console.error('页面重定向失败:', error)
    }
  })
}

// 返回上一页
const navigateBack = (delta = 1) => {
  wx.navigateBack({
    delta,
    fail: (error) => {
      console.error('页面返回失败:', error)
      // 如果返回失败，尝试重定向到首页
      redirectTo('/pages/welcome/welcome')
    }
  })
}

// 显示加载提示
const showLoading = (title = '加载中...') => {
  wx.showLoading({
    title,
    mask: true
  })
}

// 隐藏加载提示
const hideLoading = () => {
  wx.hideLoading()
}

// 显示消息提示
const showToast = (title, icon = 'success', duration = 2000) => {
  wx.showToast({
    title,
    icon,
    duration
  })
}

// 显示确认对话框
const showModal = (title, content, options = {}) => {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      showCancel: options.showCancel !== false,
      cancelText: options.cancelText || '取消',
      confirmText: options.confirmText || '确定',
      success: (res) => {
        resolve(res.confirm)
      },
      fail: () => {
        resolve(false)
      }
    })
  })
}

// 数据存储函数
const storage = {
  // 同步设置存储
  set: (key, value) => {
    try {
      wx.setStorageSync(key, value)
      return true
    } catch (error) {
      console.error('存储数据失败:', error)
      return false
    }
  },

  // 同步获取存储
  get: (key, defaultValue = null) => {
    try {
      const value = wx.getStorageSync(key)
      return value !== '' ? value : defaultValue
    } catch (error) {
      console.error('获取存储数据失败:', error)
      return defaultValue
    }
  },

  // 异步设置存储
  setAsync: (key, value) => {
    return new Promise((resolve, reject) => {
      wx.setStorage({
        key,
        data: value,
        success: () => resolve(true),
        fail: reject
      })
    })
  },

  // 异步获取存储
  getAsync: (key) => {
    return new Promise((resolve, reject) => {
      wx.getStorage({
        key,
        success: (res) => resolve(res.data),
        fail: reject
      })
    })
  },

  // 删除存储
  remove: (key) => {
    try {
      wx.removeStorageSync(key)
      return true
    } catch (error) {
      console.error('删除存储数据失败:', error)
      return false
    }
  },

  // 清空存储
  clear: () => {
    try {
      wx.clearStorageSync()
      console.log('本地存储已清空')
      return true
    } catch (error) {
      console.error('清空本地存储失败:', error)
      return false
    }
  },

  /**
   * 获取所有存储的键名
   * @returns {Array} 键名数组
   */
  getAllKeys: () => {
    try {
      const info = wx.getStorageInfoSync()
      return info.keys || []
    } catch (error) {
      console.error('获取存储键名失败:', error)
      return []
    }
  }
}

// 音频服务已简化，不再依赖外部服务

// 简化的音效播放函数 - 使用震动反馈
const playSound = (soundType) => {
  console.log(`🔊 播放音效: ${soundType}`)
  
  try {
    // 使用震动反馈替代音频
    switch (soundType) {
      case 'success':
      case 'correct':
        wx.vibrateShort({ type: 'light' })
        break
      case 'error':
      case 'incorrect':
        wx.vibrateShort({ type: 'heavy' })
        break
      case 'button_click':
      case 'tap':
      case 'level_start':
        wx.vibrateShort({ type: 'light' })
        break
      default:
        break
    }
  } catch (error) {
    console.error('震动反馈失败:', error)
  }
}

// 简化的单词发音函数 - 显示提示信息
const playPronunciation = (word, options = {}) => {
  console.log(`🔊 播放单词发音: ${word}`)
  
  try {
    // 简化为显示发音提示
    wx.showToast({
      title: `发音: ${word}`,
      icon: 'none',
      duration: 2000
    })
    
    // 添加轻微震动反馈
    wx.vibrateShort({ type: 'light' })
    
    return true
  } catch (error) {
    console.error('发音提示失败:', error)
    return false
  }
}

// 随机数生成
const random = {
  // 生成指定范围的随机整数
  int: (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min
  },

  // 生成随机浮点数
  float: (min, max) => {
    return Math.random() * (max - min) + min
  },

  // 从数组中随机选择元素
  choice: (array) => {
    if (!Array.isArray(array) || array.length === 0) {
      return null
    }
    return array[Math.floor(Math.random() * array.length)]
  },

  // 随机打乱数组
  shuffle: (array) => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }
}

// 防抖函数
const debounce = (func, delay) => {
  let timeoutId
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(this, args), delay)
  }
}

// 节流函数
const throttle = (func, delay) => {
  let lastCall = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      return func.apply(this, args)
    }
  }
}

// 数据验证函数
const validate = {
  // 验证是否为空
  isEmpty: (value) => {
    return value === null || value === undefined || value === ''
  },

  // 验证年级范围
  isValidGrade: (grade) => {
    return Number.isInteger(grade) && grade >= 1 && grade <= 6
  },

  // 验证单词格式
  isValidWord: (word) => {
    return typeof word === 'string' && /^[a-zA-Z\s]+$/.test(word.trim())
  }
}

// 获取系统信息
const getSystemInfo = () => {
  try {
    return wx.getSystemInfoSync()
  } catch (error) {
    console.error('获取系统信息失败:', error)
    return {}
  }
}

// 网络状态检查
const checkNetworkStatus = () => {
  return new Promise((resolve) => {
    wx.getNetworkType({
      success: (res) => {
        resolve({
          isConnected: res.networkType !== 'none',
          networkType: res.networkType
        })
      },
      fail: () => {
        resolve({
          isConnected: false,
          networkType: 'unknown'
        })
      }
    })
  })
}

// 模块导出
module.exports = {
  formatTime,
  formatNumber,
  formatDate,
  navigateTo,
  redirectTo,
  navigateBack,
  showLoading,
  hideLoading,
  showToast,
  showModal,
  storage,
  playSound,
  playPronunciation,
  random,
  debounce,
  throttle,
  validate,
  getSystemInfo,
  checkNetworkStatus
}
