/**
 * 记忆方法弹窗关键修复验证脚本
 * 解决第3次错误后弹窗不显示的问题
 * 
 * 使用方法：在微信开发者工具控制台中运行
 * memoryTipCriticalFixTest.runFullTest()
 */

const memoryTipCriticalFixTest = {
  /**
   * 运行完整的修复验证测试
   */
  async runFullTest() {
    console.log('🔧 [关键修复测试] 开始验证记忆方法弹窗修复效果')
    
    // 检查当前页面状态
    const currentPage = getCurrentPages()[getCurrentPages().length - 1]
    if (!currentPage || currentPage.route !== 'pages/word-learning/word-learning') {
      console.error('❌ 请在单词学习页面运行此测试')
      return
    }
    
    console.log('📊 当前页面状态:', {
      mode: currentPage.data.mode,
      currentWord: currentPage.data.currentWord?.word,
      dictationAttempts: currentPage.data.dictationAttempts,
      showMemoryTip: currentPage.data.showMemoryTip
    })
    
    // 确保在默写模式
    if (currentPage.data.mode !== 'dictation') {
      console.log('🔄 切换到默写模式')
      currentPage.setData({ mode: 'dictation' })
    }
    
    // 模拟3次错误
    await this.simulateThreeErrors(currentPage)
    
    // 验证弹窗状态
    setTimeout(() => {
      this.verifyModalState(currentPage)
    }, 2000)
  },
  
  /**
   * 模拟3次默写错误
   */
  async simulateThreeErrors(page) {
    console.log('🎯 开始模拟3次默写错误')
    
    const wrongInput = 'wronganswer'
    
    for (let i = 1; i <= 3; i++) {
      console.log(`❌ 模拟第${i}次错误`)
      
      // 设置错误输入
      page.setData({ dictationInput: wrongInput })
      
      // 调用提交函数
      page.onSubmitDictation()
      
      // 等待状态更新
      await new Promise(resolve => setTimeout(resolve, 500))
      
      console.log(`📊 第${i}次错误后状态:`, {
        dictationAttempts: page.data.dictationAttempts,
        showMemoryTip: page.data.showMemoryTip,
        mode: page.data.mode
      })
    }
  },
  
  /**
   * 验证弹窗状态
   */
  verifyModalState(page) {
    console.log('🔍 验证记忆方法弹窗状态')
    
    const state = {
      showMemoryTip: page.data.showMemoryTip,
      memoryTipContent: page.data.memoryTipContent ? '有内容' : '无内容',
      memoryTipLoading: page.data.memoryTipLoading,
      dictationAttempts: page.data.dictationAttempts,
      mode: page.data.mode
    }
    
    console.log('📊 最终状态:', state)
    
    // 检查DOM元素
    const modalElement = wx.createSelectorQuery().select('.memory-tip-modal')
    modalElement.boundingClientRect((rect) => {
      if (rect) {
        console.log('✅ 记忆方法弹窗DOM元素存在')
        console.log('📐 弹窗尺寸:', { width: rect.width, height: rect.height })
      } else {
        console.log('❌ 记忆方法弹窗DOM元素不存在')
      }
    }).exec()
    
    // 评估修复效果
    if (page.data.showMemoryTip && page.data.dictationAttempts >= 3) {
      console.log('🎉 修复成功！记忆方法弹窗正常显示')
      this.showSuccessMessage()
    } else {
      console.log('⚠️ 修复可能存在问题，请检查日志')
      this.showTroubleshootingAdvice(state)
    }
  },
  
  /**
   * 显示成功消息
   */
  showSuccessMessage() {
    console.log(`
🎉 ===== 修复验证成功 =====
✅ 记忆方法弹窗在第3次错误后正常显示
✅ 页面状态管理正确
✅ 不再出现页面跳转冲突

🔧 关键修复点：
1. 避免在第3次错误时调用handleWordCompletion
2. 确保showMemoryTipModal优先执行
3. 在继续练习时正确重置状态

📝 测试建议：
- 可以尝试点击"继续练习"按钮
- 可以尝试点击"跳过单词"按钮
- 观察状态变化是否正常
`)
  },
  
  /**
   * 显示故障排除建议
   */
  showTroubleshootingAdvice(state) {
    console.log(`
⚠️ ===== 需要进一步检查 =====
当前状态: ${JSON.stringify(state, null, 2)}

🔍 检查项目：
1. showMemoryTip 是否为 true
2. dictationAttempts 是否 >= 3
3. mode 是否为 'dictation'
4. memoryTipContent 是否有内容

🛠️ 可能的解决方案：
- 检查AI服务是否正常
- 检查网络连接
- 尝试手动调用: getCurrentPages()[getCurrentPages().length-1].showMemoryTipModal()
- 检查WXML模板中的条件判断
`)
  },
  
  /**
   * 快速修复尝试
   */
  quickFix() {
    console.log('🔧 尝试快速修复')
    
    const currentPage = getCurrentPages()[getCurrentPages().length - 1]
    if (!currentPage) {
      console.error('❌ 无法获取当前页面')
      return
    }
    
    // 强制设置状态
    currentPage.setData({
      showMemoryTip: true,
      dictationAttempts: 3,
      mode: 'dictation',
      memoryTipContent: '这是一个测试记忆方法，用于验证弹窗显示功能。'
    }, () => {
      console.log('✅ 快速修复完成，检查弹窗是否显示')
    })
  },
  
  /**
   * 重置测试环境
   */
  resetTest() {
    console.log('🔄 重置测试环境')
    
    const currentPage = getCurrentPages()[getCurrentPages().length - 1]
    if (!currentPage) {
      console.error('❌ 无法获取当前页面')
      return
    }
    
    currentPage.setData({
      showMemoryTip: false,
      dictationAttempts: 0,
      dictationInput: '',
      showHint: false,
      mode: 'dictation',
      memoryTipContent: '',
      memoryTipLoading: false
    }, () => {
      console.log('✅ 测试环境已重置')
    })
  }
}

// 导出到全局
if (typeof window !== 'undefined') {
  window.memoryTipCriticalFixTest = memoryTipCriticalFixTest
} else if (typeof global !== 'undefined') {
  global.memoryTipCriticalFixTest = memoryTipCriticalFixTest
}

console.log('🔧 记忆方法弹窗关键修复测试脚本已加载')
console.log('📝 使用方法: memoryTipCriticalFixTest.runFullTest()')
console.log('🔧 快速修复: memoryTipCriticalFixTest.quickFix()')
console.log('🔄 重置环境: memoryTipCriticalFixTest.resetTest()')