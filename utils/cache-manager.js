/**
 * 高级缓存管理器
 * 支持多层缓存、LRU淘汰、持久化存储
 */

const config = require('./config.js')

/**
 * LRU缓存实现
 */
class LRUCache {
  constructor(maxSize = 50, maxAge = 30 * 60 * 1000) {
    this.maxSize = maxSize
    this.maxAge = maxAge
    this.cache = new Map()
    this.accessTimes = new Map()
  }
  
  set(key, value, customAge = null) {
    const now = Date.now()
    const age = customAge || this.maxAge
    
    // 如果已存在，删除旧记录
    if (this.cache.has(key)) {
      this.cache.delete(key)
      this.accessTimes.delete(key)
    }
    
    // 检查容量限制
    while (this.cache.size >= this.maxSize) {
      this._evictLRU()
    }
    
    // 添加新记录
    this.cache.set(key, {
      value,
      timestamp: now,
      maxAge: age
    })
    this.accessTimes.set(key, now)
  }
  
  get(key) {
    const now = Date.now()
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }
    
    // 检查过期
    if (now - item.timestamp > item.maxAge) {
      this.cache.delete(key)
      this.accessTimes.delete(key)
      return null
    }
    
    // 更新访问时间
    this.accessTimes.set(key, now)
    return item.value
  }
  
  has(key) {
    return this.get(key) !== null
  }
  
  delete(key) {
    this.cache.delete(key)
    this.accessTimes.delete(key)
  }
  
  clear() {
    this.cache.clear()
    this.accessTimes.clear()
  }
  
  size() {
    return this.cache.size
  }
  
  // 清理过期项
  cleanup() {
    const now = Date.now()
    const toDelete = []
    
    for (const [key, item] of this.cache) {
      if (now - item.timestamp > item.maxAge) {
        toDelete.push(key)
      }
    }
    
    toDelete.forEach(key => {
      this.cache.delete(key)
      this.accessTimes.delete(key)
    })
    
    return toDelete.length
  }
  
  // 淘汰最少使用的项
  _evictLRU() {
    let oldestKey = null
    let oldestTime = Date.now()
    
    for (const [key, time] of this.accessTimes) {
      if (time < oldestTime) {
        oldestTime = time
        oldestKey = key
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey)
      this.accessTimes.delete(oldestKey)
    }
  }
  
  // 获取统计信息
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      usage: (this.cache.size / this.maxSize * 100).toFixed(1) + '%',
      oldestItem: Math.min(...this.accessTimes.values()),
      newestItem: Math.max(...this.accessTimes.values())
    }
  }
}

/**
 * 持久化存储缓存
 */
class StorageCache {
  constructor(keyPrefix = 'cache_', maxAge = 7 * 24 * 60 * 60 * 1000) {
    this.keyPrefix = keyPrefix
    this.maxAge = maxAge
  }
  
  _getKey(key) {
    return this.keyPrefix + key
  }
  
  set(key, value, customAge = null) {
    try {
      const storageKey = this._getKey(key)
      const age = customAge || this.maxAge
      const item = {
        value,
        timestamp: Date.now(),
        maxAge: age
      }
      
      wx.setStorageSync(storageKey, item)
      return true
    } catch (error) {
      console.error('StorageCache set error:', error)
      return false
    }
  }
  
  get(key) {
    try {
      const storageKey = this._getKey(key)
      const item = wx.getStorageSync(storageKey)
      
      if (!item || typeof item !== 'object') {
        return null
      }
      
      // 检查过期
      const now = Date.now()
      if (now - item.timestamp > item.maxAge) {
        this.delete(key)
        return null
      }
      
      return item.value
    } catch (error) {
      console.error('StorageCache get error:', error)
      return null
    }
  }
  
  has(key) {
    return this.get(key) !== null
  }
  
  delete(key) {
    try {
      const storageKey = this._getKey(key)
      wx.removeStorageSync(storageKey)
      return true
    } catch (error) {
      console.error('StorageCache delete error:', error)
      return false
    }
  }
  
  clear() {
    try {
      const info = wx.getStorageInfoSync()
      const keysToDelete = info.keys.filter(key => key.startsWith(this.keyPrefix))
      
      keysToDelete.forEach(key => {
        wx.removeStorageSync(key)
      })
      
      return keysToDelete.length
    } catch (error) {
      console.error('StorageCache clear error:', error)
      return 0
    }
  }
  
  // 清理过期项
  cleanup() {
    try {
      const info = wx.getStorageInfoSync()
      const relevantKeys = info.keys.filter(key => key.startsWith(this.keyPrefix))
      const now = Date.now()
      let cleanedCount = 0
      
      relevantKeys.forEach(storageKey => {
        try {
          const item = wx.getStorageSync(storageKey)
          if (item && typeof item === 'object' && item.timestamp) {
            if (now - item.timestamp > item.maxAge) {
              wx.removeStorageSync(storageKey)
              cleanedCount++
            }
          }
        } catch (error) {
          // 损坏的数据，直接删除
          wx.removeStorageSync(storageKey)
          cleanedCount++
        }
      })
      
      return cleanedCount
    } catch (error) {
      console.error('StorageCache cleanup error:', error)
      return 0
    }
  }
  
  // 获取存储使用情况
  getStorageInfo() {
    try {
      const info = wx.getStorageInfoSync()
      const relevantKeys = info.keys.filter(key => key.startsWith(this.keyPrefix))
      
      return {
        totalKeys: relevantKeys.length,
        currentSize: info.currentSize,
        limitSize: info.limitSize,
        usage: (info.currentSize / info.limitSize * 100).toFixed(1) + '%'
      }
    } catch (error) {
      console.error('StorageCache getStorageInfo error:', error)
      return null
    }
  }
}

/**
 * 多层缓存管理器
 */
class MultiLayerCache {
  constructor(options = {}) {
    const cacheConfig = config.getCacheConfig('audio')
    
    // 配置选项
    this.options = {
      enableMemoryCache: options.enableMemoryCache ?? cacheConfig.memory.enabled,
      enableStorageCache: options.enableStorageCache ?? cacheConfig.storage.enabled,
      keyPrefix: options.keyPrefix || cacheConfig.storage.keyPrefix,
      ...options
    }
    
    // 初始化缓存层
    if (this.options.enableMemoryCache) {
      this.memoryCache = new LRUCache(
        cacheConfig.memory.maxSize,
        cacheConfig.memory.maxAge
      )
    }
    
    if (this.options.enableStorageCache) {
      this.storageCache = new StorageCache(
        this.options.keyPrefix,
        cacheConfig.storage.maxAge
      )
    }
    
    // 统计信息
    this.stats = {
      hits: { memory: 0, storage: 0 },
      misses: 0,
      sets: { memory: 0, storage: 0 }
    }
    
    // 启动定期清理
    this._startCleanupTimer()
  }
  
  /**
   * 设置缓存
   * @param {string} key 缓存键
   * @param {any} value 缓存值
   * @param {Object} options 选项
   */
  set(key, value, options = {}) {
    const success = { memory: false, storage: false }
    
    // 写入内存缓存
    if (this.memoryCache) {
      try {
        this.memoryCache.set(key, value, options.maxAge)
        success.memory = true
        this.stats.sets.memory++
      } catch (error) {
        console.error('Memory cache set error:', error)
      }
    }
    
    // 写入存储缓存
    if (this.storageCache && options.persistent !== false) {
      try {
        success.storage = this.storageCache.set(key, value, options.maxAge)
        if (success.storage) {
          this.stats.sets.storage++
        }
      } catch (error) {
        console.error('Storage cache set error:', error)
      }
    }
    
    return success
  }
  
  /**
   * 获取缓存
   * @param {string} key 缓存键
   * @returns {any} 缓存值
   */
  get(key) {
    // 先尝试内存缓存
    if (this.memoryCache) {
      const memoryValue = this.memoryCache.get(key)
      if (memoryValue !== null) {
        this.stats.hits.memory++
        return memoryValue
      }
    }
    
    // 尝试存储缓存
    if (this.storageCache) {
      const storageValue = this.storageCache.get(key)
      if (storageValue !== null) {
        this.stats.hits.storage++
        
        // 回写到内存缓存（如果启用）
        if (this.memoryCache) {
          this.memoryCache.set(key, storageValue)
        }
        
        return storageValue
      }
    }
    
    this.stats.misses++
    return null
  }
  
  /**
   * 检查缓存是否存在
   * @param {string} key 缓存键
   * @returns {boolean} 是否存在
   */
  has(key) {
    if (this.memoryCache && this.memoryCache.has(key)) {
      return true
    }
    
    if (this.storageCache && this.storageCache.has(key)) {
      return true
    }
    
    return false
  }
  
  /**
   * 删除缓存
   * @param {string} key 缓存键
   */
  delete(key) {
    const result = { memory: false, storage: false }
    
    if (this.memoryCache) {
      this.memoryCache.delete(key)
      result.memory = true
    }
    
    if (this.storageCache) {
      result.storage = this.storageCache.delete(key)
    }
    
    return result
  }
  
  /**
   * 清空所有缓存
   */
  clear() {
    const result = { memory: 0, storage: 0 }
    
    if (this.memoryCache) {
      this.memoryCache.clear()
      result.memory = 1
    }
    
    if (this.storageCache) {
      result.storage = this.storageCache.clear()
    }
    
    return result
  }
  
  /**
   * 手动清理过期缓存
   */
  cleanup() {
    const result = { memory: 0, storage: 0 }
    
    if (this.memoryCache) {
      result.memory = this.memoryCache.cleanup()
    }
    
    if (this.storageCache) {
      result.storage = this.storageCache.cleanup()
    }
    
    console.log('🧹 缓存清理完成:', result)
    return result
  }
  
  /**
   * 获取缓存统计信息
   */
  getStats() {
    const stats = {
      ...this.stats,
      memory: this.memoryCache ? this.memoryCache.getStats() : null,
      storage: this.storageCache ? this.storageCache.getStorageInfo() : null,
      hitRate: {
        memory: this.stats.hits.memory / (this.stats.hits.memory + this.stats.hits.storage + this.stats.misses) * 100,
        storage: this.stats.hits.storage / (this.stats.hits.memory + this.stats.hits.storage + this.stats.misses) * 100,
        total: (this.stats.hits.memory + this.stats.hits.storage) / (this.stats.hits.memory + this.stats.hits.storage + this.stats.misses) * 100
      }
    }
    
    return stats
  }
  
  /**
   * 启动定期清理定时器
   */
  _startCleanupTimer() {
    const cleanupInterval = 15 * 60 * 1000 // 15分钟
    
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, cleanupInterval)
  }
  
  /**
   * 停止定期清理
   */
  destroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
  }
}

/**
 * 缓存管理器工厂
 */
class CacheManagerFactory {
  constructor() {
    this.instances = new Map()
  }
  
  /**
   * 创建或获取缓存实例
   * @param {string} name 缓存名称
   * @param {Object} options 配置选项
   * @returns {MultiLayerCache} 缓存实例
   */
  getCache(name, options = {}) {
    if (!this.instances.has(name)) {
      const cache = new MultiLayerCache(options)
      this.instances.set(name, cache)
      console.log(`🎯 创建缓存实例: ${name}`)
    }
    
    return this.instances.get(name)
  }
  
  /**
   * 获取所有缓存统计
   */
  getAllStats() {
    const stats = {}
    
    for (const [name, cache] of this.instances) {
      stats[name] = cache.getStats()
    }
    
    return stats
  }
  
  /**
   * 清理所有缓存
   */
  cleanupAll() {
    const results = {}
    
    for (const [name, cache] of this.instances) {
      results[name] = cache.cleanup()
    }
    
    return results
  }
  
  /**
   * 销毁所有缓存实例
   */
  destroyAll() {
    for (const [name, cache] of this.instances) {
      cache.destroy()
    }
    this.instances.clear()
  }
}

// 创建全局缓存管理器实例
const cacheManager = new CacheManagerFactory()

// 预创建常用缓存实例
const audioCacheConfig = config.getCacheConfig('audio')
const aiCacheConfig = config.getCacheConfig('ai')

const audioCache = cacheManager.getCache('audio', {
  keyPrefix: audioCacheConfig.storage.keyPrefix,
  enableMemoryCache: audioCacheConfig.memory.enabled,
  enableStorageCache: audioCacheConfig.storage.enabled
})

const aiCache = cacheManager.getCache('ai', {
  keyPrefix: aiCacheConfig.storage.keyPrefix,
  enableMemoryCache: false, // AI缓存仅使用存储
  enableStorageCache: aiCacheConfig.storage.enabled
})

module.exports = {
  LRUCache,
  StorageCache,
  MultiLayerCache,
  CacheManagerFactory,
  cacheManager,
  audioCache,
  aiCache
}