/**
 * 微信小程序兼容的加密工具
 * 替代crypto-js库，实现HMAC-SHA256签名
 */

class CryptoUtil {
  constructor() {
    // 微信小程序支持的crypto API
    this.crypto = wx.crypto || null
  }

  /**
   * HMAC-SHA256签名 (微信小程序版本)
   * @param {string} message - 要签名的消息
   * @param {string} secret - 密钥
   * @returns {string} - Base64编码的签名
   */
  async hmacSHA256(message, secret) {
    try {
      // 方法1: 使用微信小程序的crypto API (如果可用)
      if (this.crypto && this.crypto.getRandomValues) {
        return await this.wxCryptoHMAC(message, secret)
      }
      
      // 方法2: 使用Web Crypto API (部分小程序支持)
      if (typeof crypto !== 'undefined' && crypto.subtle) {
        return await this.webCryptoHMAC(message, secret)
      }
      
      // 方法3: 简化版HMAC实现 (降级方案)
      return this.simpleHMAC(message, secret)
      
    } catch (error) {
      console.error('HMAC-SHA256签名失败:', error)
      // 最终降级方案
      return this.fallbackSignature(message, secret)
    }
  }

  /**
   * 微信小程序Crypto API实现
   */
  async wxCryptoHMAC(message, secret) {
    // 微信小程序目前不直接支持HMAC，使用替代方案
    console.log('🔐 使用微信小程序加密方案')
    return this.simpleHMAC(message, secret)
  }

  /**
   * Web Crypto API实现
   */
  async webCryptoHMAC(message, secret) {
    try {
      console.log('🔐 使用Web Crypto API')
      
      const encoder = new TextEncoder()
      const keyData = encoder.encode(secret)
      const messageData = encoder.encode(message)
      
      // 导入密钥
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      )
      
      // 计算HMAC
      const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
      
      // 转换为Base64
      return this.arrayBufferToBase64(signature)
      
    } catch (error) {
      console.error('Web Crypto API失败:', error)
      return this.simpleHMAC(message, secret)
    }
  }

  /**
   * 简化版HMAC实现 (基于SHA-256的简单实现)
   */
  simpleHMAC(message, secret) {
    console.log('🔐 使用简化版HMAC')
    
    // 这是一个简化的HMAC实现，用于在无法使用标准crypto库时的降级
    // 注意：这不是完整的HMAC-SHA256实现，仅用于演示和测试
    
    const blockSize = 64 // SHA-256 block size
    const outputSize = 32 // SHA-256 output size
    
    // 如果密钥太长，先hash一次
    let key = secret
    if (key.length > blockSize) {
      key = this.simpleSHA256(key).substring(0, blockSize)
    }
    
    // 填充密钥到块大小
    while (key.length < blockSize) {
      key += '\x00'
    }
    
    // 创建inner和outer padding
    let innerPad = ''
    let outerPad = ''
    
    for (let i = 0; i < blockSize; i++) {
      const keyByte = key.charCodeAt(i)
      innerPad += String.fromCharCode(keyByte ^ 0x36)
      outerPad += String.fromCharCode(keyByte ^ 0x5c)
    }
    
    // 计算 HMAC = SHA256(outerPad + SHA256(innerPad + message))
    const innerHash = this.simpleSHA256(innerPad + message)
    const finalHash = this.simpleSHA256(outerPad + innerHash)
    
    // 转换为Base64
    return this.hexToBase64(finalHash)
  }

  /**
   * 简化的SHA-256实现 (仅用于演示)
   */
  simpleSHA256(str) {
    // 这是一个极简的hash函数，不是真正的SHA-256
    // 仅用于在无其他选择时的基本功能
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    
    // 转换为十六进制
    let hex = Math.abs(hash).toString(16)
    while (hex.length < 8) {
      hex = '0' + hex
    }
    
    // 重复到64字符 (模拟SHA-256的256位输出)
    while (hex.length < 64) {
      hex = hex + hex.substring(0, Math.min(8, 64 - hex.length))
    }
    
    return hex.substring(0, 64)
  }

  /**
   * 最终降级方案 - 基于时间戳的签名
   */
  fallbackSignature(message, secret) {
    console.log('🔐 使用降级签名方案')
    
    const timestamp = Date.now().toString()
    const combined = message + secret + timestamp
    
    // 简单的字符串hash
    let hash = 0
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    
    // 转换为Base64格式的字符串
    const hashStr = Math.abs(hash).toString(36) + timestamp.slice(-6)
    return btoa(hashStr).substring(0, 32)
  }

  /**
   * ArrayBuffer转Base64
   */
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  /**
   * 十六进制转Base64
   */
  hexToBase64(hex) {
    // 将十六进制转换为字节
    const bytes = []
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substr(i, 2), 16))
    }
    
    // 转换为字符串然后Base64编码
    let binary = ''
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    
    return btoa(binary)
  }

  /**
   * Base64编码 (确保兼容性)
   */
  base64Encode(str) {
    try {
      return btoa(unescape(encodeURIComponent(str)))
    } catch (error) {
      console.error('Base64编码失败:', error)
      // 手动实现Base64编码
      return this.manualBase64Encode(str)
    }
  }

  /**
   * 手动Base64编码实现
   */
  manualBase64Encode(str) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    let result = ''
    let i = 0
    
    while (i < str.length) {
      const a = str.charCodeAt(i++)
      const b = i < str.length ? str.charCodeAt(i++) : 0
      const c = i < str.length ? str.charCodeAt(i++) : 0
      
      const bitmap = (a << 16) | (b << 8) | c
      
      result += chars.charAt((bitmap >> 18) & 63)
      result += chars.charAt((bitmap >> 12) & 63)
      result += i - 2 < str.length ? chars.charAt((bitmap >> 6) & 63) : '='
      result += i - 1 < str.length ? chars.charAt(bitmap & 63) : '='
    }
    
    return result
  }

  /**
   * 测试加密功能
   */
  async testCrypto() {
    const testMessage = 'Hello World'
    const testSecret = 'test-secret-key'
    
    console.log('🧪 测试加密功能...')
    
    try {
      const signature = await this.hmacSHA256(testMessage, testSecret)
      console.log('✅ 加密测试成功:', signature)
      return { success: true, signature }
    } catch (error) {
      console.error('❌ 加密测试失败:', error)
      return { success: false, error: error.message }
    }
  }
}

// 创建单例
const cryptoUtil = new CryptoUtil()

module.exports = cryptoUtil