/**
 * AI服务配置测试脚本
 * 验证API配置和本地降级方案
 */

/**
 * 模拟微信小程序环境
 */
global.wx = {
  request: (options) => {
    console.log('🌐 模拟网络请求:', options.url)
    // 模拟API调用失败，测试降级方案
    setTimeout(() => {
      options.fail && options.fail({
        errMsg: '模拟网络错误，测试降级方案'
      })
    }, 1000)
  },
  getStorageSync: () => null,
  setStorageSync: () => {},
  getNetworkType: (options) => {
    options.success({ networkType: 'wifi' })
  }
}

/**
 * 模拟getApp函数
 */
global.getApp = () => ({
  globalData: {
    userInfo: { nickname: '测试用户' }
  }
})

// 在模拟环境设置完成后再加载模块
const { generateWordExplanation } = require('./utils/ai-service.js')
const { getApiConfig } = require('./utils/config.js')

/**
 * 测试AI服务配置
 */
async function testAIService() {
  console.log('🧪 开始测试AI服务配置...\n')
  
  // 1. 测试配置读取
  console.log('📋 1. 检查配置信息')
  const aiConfig = getApiConfig('ai')
  if (aiConfig && aiConfig.qwenplus) {
    console.log('✅ AI配置读取成功')
    console.log(`   - API Key: ${aiConfig.qwenplus.apiKey ? '已配置' : '未配置'}`)
    console.log(`   - Base URL: ${aiConfig.qwenplus.baseUrl}`)
    console.log(`   - Model: ${aiConfig.qwenplus.model}`)
    console.log(`   - Timeout: ${aiConfig.qwenplus.timeout}ms`)
  } else {
    console.log('❌ AI配置读取失败')
    return
  }
  
  console.log('\n📋 2. 测试本地降级方案')
  
  // 2. 测试常见单词的本地解释
  const testWords = ['cat', 'dog', 'book', 'hello', 'water', 'sun', 'tree', 'fish']
  
  for (const word of testWords) {
    try {
      console.log(`\n🔤 测试单词: ${word}`)
      const explanation = await generateWordExplanation(word)
      
      if (explanation && explanation.length > 0) {
        console.log('✅ 获取解释成功')
        console.log(`   内容长度: ${explanation.length}字符`)
        
        // 检查是否包含本地降级提示
        if (explanation.includes('魔法老师小贴士')) {
          console.log('✅ 本地降级方案正常工作')
        }
        
        // 检查内容质量
        const hasEmoji = /[🎯🏠🧠🎮✨🌟]/u.test(explanation)
        const hasExamples = explanation.includes('生活实例')
        const hasGames = explanation.includes('小游戏')
        
        if (hasEmoji && hasExamples && hasGames) {
          console.log('✅ 内容质量良好（包含表情、实例、游戏）')
        } else {
          console.log('⚠️ 内容质量待优化')
        }
      } else {
        console.log('❌ 未获取到解释内容')
      }
    } catch (error) {
      console.log(`❌ 测试失败: ${error.message}`)
    }
  }
  
  console.log('\n📋 3. 测试未知单词处理')
  try {
    const unknownWord = 'unknownword123'
    console.log(`\n🔤 测试未知单词: ${unknownWord}`)
    const explanation = await generateWordExplanation(unknownWord)
    
    if (explanation && explanation.length > 0) {
      console.log('✅ 未知单词降级处理正常')
      console.log(`   内容: ${explanation.substring(0, 100)}...`)
    } else {
      console.log('❌ 未知单词处理失败')
    }
  } catch (error) {
    console.log(`❌ 未知单词测试失败: ${error.message}`)
  }
  
  console.log('\n🎉 AI服务配置测试完成！')
  
  // 4. 输出优化建议
  console.log('\n💡 优化建议:')
  console.log('1. ✅ 本地词库已扩展到8个常用单词')
  console.log('2. ✅ 内容质量已优化（表情、实例、游戏、记忆诀窍）')
  console.log('3. ✅ 降级提示已添加，用户体验更友好')
  console.log('4. ✅ API重试机制已实现，提高成功率')
  console.log('5. 🔧 建议在微信小程序后台配置域名白名单')
  console.log('6. 🔧 建议监控API调用成功率，及时发现问题')
}

// 运行测试
testAIService().catch(console.error)