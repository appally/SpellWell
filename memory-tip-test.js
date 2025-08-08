/**
 * 记忆方法弹窗功能测试脚本
 * 在微信开发者工具控制台执行：
 * 1. 复制这个文件内容
 * 2. 在控制台粘贴执行
 */

console.log('🧪 开始记忆方法弹窗功能测试...')

const page = getCurrentPages()[getCurrentPages().length - 1]
if (!page) {
  console.error('❌ 无法获取当前页面')
} else {
  console.log('✅ 成功获取页面实例')
  
  // 测试1: 检查当前页面数据状态
  console.log('\n📊 测试1: 当前页面状态检查')
  console.log('页面数据:', {
    mode: page.data.mode,
    currentWord: page.data.currentWord?.word,
    dictationAttempts: page.data.dictationAttempts,
    maxAttempts: page.data.maxAttempts,
    showMemoryTip: page.data.showMemoryTip,
    memoryTipContent: page.data.memoryTipContent ? '有内容' : '无内容'
  })
  
  // 测试2: 验证关键函数存在
  console.log('\n🔧 测试2: 关键函数检查')
  const functions = [
    'showMemoryTipModal',
    'generateMemoryTip', 
    'generateFallbackMemoryTip',
    'onSubmitDictation',
    'forceCreateMemoryTipModal'
  ]
  
  functions.forEach(funcName => {
    if (typeof page[funcName] === 'function') {
      console.log(`✅ ${funcName} 函数存在`)
    } else {
      console.error(`❌ ${funcName} 函数不存在`)
    }
  })
  
  // 测试3: 模拟错误拼写3次的场景
  console.log('\n🎯 测试3: 模拟错误拼写3次场景')
  
  // 设置测试环境
  if (!page.data.currentWord) {
    page.setData({
      currentWord: { word: 'test', chinese: '测试' }
    })
  }
  
  // 模拟第3次错误
  page.setData({
    dictationAttempts: 2,
    dictationInput: 'wrong',
    maxAttempts: 3
  })
  
  console.log('📝 设置测试数据完成，模拟提交错误答案...')
  
  // 延迟执行，确保setData完成
  setTimeout(() => {
    try {
      page.onSubmitDictation()
      console.log('✅ onSubmitDictation 执行成功')
      
      // 检查弹窗是否显示
      setTimeout(() => {
        console.log('\n📋 测试结果:')
        console.log('弹窗状态:', {
          showMemoryTip: page.data.showMemoryTip,
          memoryTipContent: page.data.memoryTipContent ? '有内容' : '无内容',
          memoryTipLoading: page.data.memoryTipLoading,
          dictationAttempts: page.data.dictationAttempts
        })
        
        if (page.data.showMemoryTip) {
          console.log('🎉 测试成功！记忆方法弹窗已显示')
          if (page.data.memoryTipContent) {
            console.log('📄 弹窗内容预览:', page.data.memoryTipContent.substring(0, 50) + '...')
          }
        } else {
          console.error('❌ 测试失败！记忆方法弹窗未显示')
          
          // 尝试手动修复
          console.log('🔧 尝试手动修复...')
          page.forceCreateMemoryTipModal()
          
          setTimeout(() => {
            if (page.data.showMemoryTip) {
              console.log('✅ 手动修复成功！弹窗现在显示了')
            } else {
              console.error('❌ 手动修复也失败了')
            }
          }, 500)
        }
      }, 1000)
      
    } catch (error) {
      console.error('❌ onSubmitDictation 执行失败:', error)
    }
  }, 100)
}

// 测试4: 直接测试弹窗显示
console.log('\n🚀 测试4: 直接测试弹窗显示功能')
setTimeout(() => {
  try {
    const page = getCurrentPages()[getCurrentPages().length - 1]
    if (page) {
      console.log('📱 直接调用 showMemoryTipModal...')
      page.showMemoryTipModal()
    }
  } catch (error) {
    console.error('❌ 直接测试失败:', error)
  }
}, 2000)