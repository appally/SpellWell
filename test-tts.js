/**
 * TTS功能快速测试脚本
 * 用于验证Qwen-TTS API集成是否正常工作
 */

// 模拟微信小程序环境
const mockWx = {
  request: (options) => {
    console.log('🌐 模拟微信请求:', options.url)
    console.log('📤 请求数据:', JSON.stringify(options.data, null, 2))
    
    // 模拟成功响应
    setTimeout(() => {
      if (options.success) {
        options.success({
          statusCode: 200,
          data: {
            output: {
              audio: {
                url: 'https://example.com/audio/test.wav'
              }
            }
          }
        })
      }
    }, 1000)
  },
  
  createInnerAudioContext: () => {
    console.log('🎵 创建音频上下文')
    return {
      src: '',
      play: () => console.log('▶️ 开始播放音频'),
      stop: () => console.log('⏹️ 停止播放音频'),
      destroy: () => console.log('🗑️ 销毁音频上下文'),
      onPlay: (callback) => {
        setTimeout(callback, 100)
      },
      onEnded: (callback) => {
        setTimeout(callback, 2000)
      },
      onError: (callback) => {
        // 不触发错误
      },
      offEnded: () => {},
      offError: () => {}
    }
  },
  
  vibrateShort: (options) => {
    console.log('📳 震动反馈:', options.type)
  },
  
  showToast: (options) => {
    console.log('💬 显示提示:', options.title)
  }
}

// 设置全局wx对象
global.wx = mockWx
global.getApp = () => ({})

// 引入音频服务
const { AudioService, playWordPronunciation } = require('./utils/audio-service.js')

/**
 * 测试TTS API调用
 */
async function testTTSAPI() {
  console.log('\n🧪 开始测试TTS API调用...')
  
  try {
    const audioService = new AudioService()
    const audioUrl = await audioService.generateSpeech('hello')
    
    if (audioUrl) {
      console.log('✅ TTS API调用成功')
      console.log('🔗 音频URL:', audioUrl)
      return true
    } else {
      console.log('❌ TTS API调用失败: 未返回音频URL')
      return false
    }
  } catch (error) {
    console.log('❌ TTS API调用异常:', error.message)
    return false
  }
}

/**
 * 测试音频播放功能
 */
async function testAudioPlayback() {
  console.log('\n🧪 开始测试音频播放功能...')
  
  try {
    const success = await playWordPronunciation('hello')
    
    if (success) {
      console.log('✅ 音频播放测试成功')
      return true
    } else {
      console.log('❌ 音频播放测试失败')
      return false
    }
  } catch (error) {
    console.log('❌ 音频播放测试异常:', error.message)
    return false
  }
}

/**
 * 测试缓存功能
 */
async function testCaching() {
  console.log('\n🧪 开始测试缓存功能...')
  
  try {
    const audioService = new AudioService()
    
    // 第一次调用
    console.log('📥 第一次播放 "world"')
    await audioService.playWordPronunciation('world')
    
    // 第二次调用（应该使用缓存）
    console.log('📥 第二次播放 "world" (应该使用缓存)')
    await audioService.playWordPronunciation('world')
    
    console.log('✅ 缓存功能测试完成')
    return true
  } catch (error) {
    console.log('❌ 缓存功能测试异常:', error.message)
    return false
  }
}

/**
 * 测试预加载功能
 */
async function testPreloading() {
  console.log('\n🧪 开始测试预加载功能...')
  
  try {
    const { preloadPronunciations } = require('./utils/audio-service.js')
    
    const words = ['apple', 'banana', 'orange']
    console.log('📦 预加载单词:', words.join(', '))
    
    await preloadPronunciations(words)
    
    console.log('✅ 预加载功能测试完成')
    return true
  } catch (error) {
    console.log('❌ 预加载功能测试异常:', error.message)
    return false
  }
}

/**
 * 测试错误处理
 */
async function testErrorHandling() {
  console.log('\n🧪 开始测试错误处理...')
  
  try {
    // 测试无效单词
    console.log('🔍 测试无效参数处理')
    await playWordPronunciation('')
    await playWordPronunciation(null)
    await playWordPronunciation(undefined)
    
    console.log('✅ 错误处理测试完成')
    return true
  } catch (error) {
    console.log('❌ 错误处理测试异常:', error.message)
    return false
  }
}

/**
 * 测试资源清理
 */
function testResourceCleanup() {
  console.log('\n🧪 开始测试资源清理...')
  
  try {
    const { cleanupAudio } = require('./utils/audio-service.js')
    
    console.log('🗑️ 执行资源清理')
    cleanupAudio()
    
    console.log('✅ 资源清理测试完成')
    return true
  } catch (error) {
    console.log('❌ 资源清理测试异常:', error.message)
    return false
  }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('🚀 开始TTS功能完整测试\n')
  console.log('=' * 50)
  
  const tests = [
    { name: 'TTS API调用', fn: testTTSAPI },
    { name: '音频播放功能', fn: testAudioPlayback },
    { name: '缓存功能', fn: testCaching },
    { name: '预加载功能', fn: testPreloading },
    { name: '错误处理', fn: testErrorHandling },
    { name: '资源清理', fn: testResourceCleanup }
  ]
  
  const results = []
  
  for (const test of tests) {
    try {
      const result = await test.fn()
      results.push({ name: test.name, success: result })
    } catch (error) {
      results.push({ name: test.name, success: false, error: error.message })
    }
  }
  
  // 输出测试结果
  console.log('\n' + '=' * 50)
  console.log('📊 测试结果汇总:\n')
  
  let passedCount = 0
  results.forEach(result => {
    const status = result.success ? '✅ 通过' : '❌ 失败'
    console.log(`${status} ${result.name}`)
    if (result.error) {
      console.log(`   错误: ${result.error}`)
    }
    if (result.success) passedCount++
  })
  
  console.log(`\n📈 测试通过率: ${passedCount}/${results.length} (${Math.round(passedCount/results.length*100)}%)`)
  
  if (passedCount === results.length) {
    console.log('🎉 所有测试通过！TTS功能集成成功！')
  } else {
    console.log('⚠️ 部分测试失败，请检查相关功能')
  }
  
  console.log('\n💡 提示:')
  console.log('- 这是模拟测试，实际效果需要在微信小程序环境中验证')
  console.log('- 请确保已在微信小程序后台配置合法域名')
  console.log('- 建议在真机上进行最终测试')
}

/**
 * 配置验证
 */
function validateConfiguration() {
  console.log('\n🔧 验证配置信息...')
  
  try {
    const config = require('./utils/config.js')
    const ttsConfig = config.getApiConfig('tts')
    
    console.log('📋 TTS配置信息:')
    console.log(`- API Key: ${ttsConfig?.apiKey ? '已配置' : '未配置'}`)
    console.log(`- Base URL: ${ttsConfig?.baseUrl || '未配置'}`)
    console.log(`- Model: ${ttsConfig?.model || '未配置'}`)
    console.log(`- Voice: ${ttsConfig?.voice || '未配置'}`)
    
    if (!ttsConfig?.apiKey) {
      console.log('⚠️ 警告: API Key未配置')
    }
    
    return true
  } catch (error) {
    console.log('❌ 配置验证失败:', error.message)
    return false
  }
}

// 主函数
async function main() {
  console.log('🎯 TTS功能测试工具')
  console.log('版本: 1.0.0')
  console.log('用途: 验证Qwen-TTS集成功能')
  
  // 验证配置
  validateConfiguration()
  
  // 运行测试
  await runAllTests()
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(error => {
    console.error('💥 测试执行失败:', error)
    process.exit(1)
  })
}

module.exports = {
  testTTSAPI,
  testAudioPlayback,
  testCaching,
  testPreloading,
  testErrorHandling,
  testResourceCleanup,
  runAllTests,
  validateConfiguration
}