// 简化的记忆提示弹窗测试脚本
// 可以直接在微信开发者工具控制台执行

console.log('🧪 开始简化测试...')

// 获取当前页面
const page = getCurrentPages()[getCurrentPages().length - 1]
if (!page) {
  console.error('❌ 无法获取当前页面')
} else {
  console.log('✅ 成功获取当前页面')
  
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
