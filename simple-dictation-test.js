/**
 * 简单的默写错误弹窗测试脚本
 * 专门测试默写错误3次后记忆方法弹窗是否正常显示
 */

(function() {
  'use strict'
  
  console.log('📝 默写错误弹窗测试脚本已加载')
  
  // 获取当前页面实例
  const page = getCurrentPages()[getCurrentPages().length - 1]
  
  if (!page) {
    console.error('❌ 无法获取当前页面实例')
    return
  }
  
  /**
   * 检查弹窗状态
   */
  function checkModalStatus() {
    const data = page.data
    console.log('📊 当前状态:', {
      showMemoryTip: data.showMemoryTip,
      memoryTipContent: data.memoryTipContent ? '有内容' : '无内容',
      dictationAttempts: data.dictationAttempts,
      maxAttempts: data.maxAttempts,
      currentWord: data.currentWord?.word || '无'
    })
    
    // 检查DOM状态
    const query = wx.createSelectorQuery()
    query.select('.memory-tip-modal').boundingClientRect((rect) => {
      console.log('🏗️ DOM状态:', {
        exists: !!rect,
        visible: rect && rect.width > 0 && rect.height > 0,
        width: rect ? rect.width : 0,
        height: rect ? rect.height : 0
      })
    }).exec()
  }
  
  /**
   * 模拟默写错误3次
   */
  function simulateDictationErrors() {
    console.log('\n🎯 开始模拟默写错误3次...')
    
    // 确保在默写模式
    page.setData({
      mode: 'dictation',
      dictationAttempts: 0,
      dictationInput: '',
      showMemoryTip: false
    })
    
    console.log('✅ 已设置为默写模式')
    
    // 模拟第一次错误
    setTimeout(() => {
      console.log('\n--- 第1次错误 ---')
      page.setData({ dictationInput: 'wrong1' })
      page.onSubmitDictation()
      checkModalStatus()
    }, 500)
    
    // 模拟第二次错误
    setTimeout(() => {
      console.log('\n--- 第2次错误 ---')
      page.setData({ dictationInput: 'wrong2' })
      page.onSubmitDictation()
      checkModalStatus()
    }, 1500)
    
    // 模拟第三次错误（应该触发弹窗）
    setTimeout(() => {
      console.log('\n--- 第3次错误（应该触发弹窗）---')
      page.setData({ dictationInput: 'wrong3' })
      page.onSubmitDictation()
      
      // 等待弹窗显示
      setTimeout(() => {
        console.log('\n=== 最终检查 ===')
        checkModalStatus()
        
        if (page.data.showMemoryTip) {
          console.log('✅ 测试成功：记忆方法弹窗已显示')
        } else {
          console.log('❌ 测试失败：记忆方法弹窗未显示')
          console.log('🔧 尝试强制修复...')
          if (typeof page.forceCreateMemoryTipModal === 'function') {
            page.forceCreateMemoryTipModal()
          }
        }
      }, 1000)
    }, 2500)
  }
  
  /**
   * 重置测试环境
   */
  function resetTest() {
    console.log('🔄 重置测试环境')
    page.setData({
      dictationAttempts: 0,
      dictationInput: '',
      showMemoryTip: false,
      memoryTipContent: '',
      mode: 'dictation'
    })
  }
  
  // 导出测试接口
  window.dictationTest = {
    // 运行完整测试
    run: simulateDictationErrors,
    
    // 检查当前状态
    check: checkModalStatus,
    
    // 重置环境
    reset: resetTest,
    
    // 快速测试（直接设置为第3次错误）
    quick: () => {
      console.log('⚡ 快速测试：直接模拟第3次错误')
      page.setData({
        mode: 'dictation',
        dictationAttempts: 2,
        dictationInput: 'wrong3'
      })
      page.onSubmitDictation()
      
      setTimeout(() => {
        checkModalStatus()
        if (page.data.showMemoryTip) {
          console.log('✅ 快速测试成功')
        } else {
          console.log('❌ 快速测试失败')
        }
      }, 1000)
    }
  }
  
  console.log('✅ 测试接口已准备就绪')
  console.log('💡 使用方法:')
  console.log('  - dictationTest.run() // 完整测试（模拟3次错误）')
  console.log('  - dictationTest.quick() // 快速测试')
  console.log('  - dictationTest.check() // 检查状态')
  console.log('  - dictationTest.reset() // 重置环境')
  
})()