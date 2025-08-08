/**
 * 记忆提示弹窗快速测试脚本
 * 专门用于验证DOM修复后的效果
 */

// 快速测试函数
function quickTestMemoryTip() {
  console.log('🧪 开始记忆提示弹窗快速测试...')
  
  const page = getCurrentPages()[getCurrentPages().length - 1]
  if (!page) {
    console.error('❌ 无法获取当前页面')
    return
  }
  
  console.log('📊 当前页面状态:', {
    showMemoryTip: page.data.showMemoryTip,
    memoryTipContent: page.data.memoryTipContent ? '有内容' : '无内容',
    dictationAttempts: page.data.dictationAttempts,
    maxAttempts: page.data.maxAttempts,
    currentWord: page.data.currentWord?.word
  })
  
  // 测试1: 手动显示弹窗
  console.log('\n🔧 测试1: 手动显示弹窗')
  page.setData({
    memoryTipContent: '这是一个测试记忆方法内容，用于验证弹窗是否能正常显示。',
    showMemoryTip: true
  })
  
  setTimeout(() => {
    console.log('✅ 测试1结果:', {
      showMemoryTip: page.data.showMemoryTip,
      hasContent: !!page.data.memoryTipContent
    })
    
    // 测试2: 检查函数是否存在
    console.log('\n🔧 测试2: 检查关键函数')
    console.log('  - showMemoryTipModal:', typeof page.showMemoryTipModal === 'function' ? '✅ 存在' : '❌ 不存在')
    console.log('  - forceShowMemoryTipModal:', typeof page.forceShowMemoryTipModal === 'function' ? '✅ 存在' : '❌ 不存在')
    console.log('  - testMemoryTipModal:', typeof page.testMemoryTipModal === 'function' ? '✅ 存在' : '❌ 不存在')
    console.log('  - checkMemoryTipState:', typeof page.checkMemoryTipState === 'function' ? '✅ 存在' : '❌ 不存在')
    
    // 测试3: 调用强制显示函数
    if (typeof page.forceShowMemoryTipModal === 'function') {
      console.log('\n🔧 测试3: 调用强制显示函数')
      page.forceShowMemoryTipModal()
    } else if (typeof page.showMemoryTipModal === 'function') {
      console.log('\n🔧 测试3: 调用showMemoryTipModal函数')
      page.showMemoryTipModal()
    } else {
      console.error('❌ 没有可用的显示函数')
    }
    
    // 最终状态检查
    setTimeout(() => {
      console.log('\n📊 最终状态检查:', {
        showMemoryTip: page.data.showMemoryTip,
        memoryTipContent: page.data.memoryTipContent ? '有内容' : '无内容'
      })
      
      if (page.data.showMemoryTip) {
        console.log('🎉 测试成功！记忆提示弹窗应该已显示')
      } else {
        console.error('❌ 测试失败！记忆提示弹窗未显示')
      }
    }, 1000)
  }, 1000)
}

// 状态检查函数
function checkMemoryTipState() {
  const page = getCurrentPages()[getCurrentPages().length - 1]
  if (!page) {
    console.error('❌ 无法获取当前页面')
    return
  }
  
  console.log('🔍 记忆提示弹窗状态检查:')
  console.log('  - showMemoryTip:', page.data.showMemoryTip)
  console.log('  - memoryTipContent:', page.data.memoryTipContent ? '有内容' : '无内容')
  console.log('  - memoryTipLoading:', page.data.memoryTipLoading)
  console.log('  - preloadingMemoryTip:', page.data.preloadingMemoryTip)
  console.log('  - dictationAttempts:', page.data.dictationAttempts)
  console.log('  - maxAttempts:', page.data.maxAttempts)
  console.log('  - currentWord:', page.data.currentWord?.word)
  
  // 检查关键函数
  console.log('\n🔧 关键函数检查:')
  console.log('  - onSubmitDictation:', typeof page.onSubmitDictation === 'function' ? '✅ 存在' : '❌ 不存在')
  console.log('  - showMemoryTipModal:', typeof page.showMemoryTipModal === 'function' ? '✅ 存在' : '❌ 不存在')
  console.log('  - forceShowMemoryTipModal:', typeof page.forceShowMemoryTipModal === 'function' ? '✅ 存在' : '❌ 不存在')
  console.log('  - testMemoryTipModal:', typeof page.testMemoryTipModal === 'function' ? '✅ 存在' : '❌ 不存在')
  console.log('  - checkMemoryTipState:', typeof page.checkMemoryTipState === 'function' ? '✅ 存在' : '❌ 不存在')
}

// 模拟第3次错误
function simulateThirdError() {
  console.log('🎮 模拟第3次错误...')
  
  const page = getCurrentPages()[getCurrentPages().length - 1]
  if (!page) {
    console.error('❌ 无法获取当前页面')
    return
  }
  
  // 设置模拟状态
  page.setData({
    dictationAttempts: 2,
    dictationInput: 'wrong',
    currentWord: { word: 'test', chinese: '测试' }
  })
  
  console.log('📝 模拟状态设置完成:', {
    dictationAttempts: page.data.dictationAttempts,
    dictationInput: page.data.dictationInput,
    currentWord: page.data.currentWord?.word
  })
  
  // 调用提交函数
  if (typeof page.onSubmitDictation === 'function') {
    console.log('🚀 调用onSubmitDictation函数')
    page.onSubmitDictation()
  } else {
    console.error('❌ onSubmitDictation函数不存在')
  }
}

// 导出测试函数
window.quickTestMemoryTip = quickTestMemoryTip
window.checkMemoryTipState = checkMemoryTipState
window.simulateThirdError = simulateThirdError

console.log('🧪 记忆提示弹窗快速测试脚本已加载')
console.log('📝 可用测试函数:')
console.log('  - quickTestMemoryTip() // 快速测试')
console.log('  - checkMemoryTipState() // 状态检查')
console.log('  - simulateThirdError() // 模拟第3次错误')
