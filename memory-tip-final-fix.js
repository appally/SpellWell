/**
 * 记忆提示弹窗最终修复脚本
 * 可以直接在微信开发者工具控制台执行
 */

console.log('🚀 开始记忆提示弹窗最终修复...')

// 获取当前页面
const page = getCurrentPages()[getCurrentPages().length - 1]
if (!page) {
  console.error('❌ 无法获取当前页面')
} else {
  console.log('✅ 成功获取当前页面')
  
  // 修复1: 确保showMemoryTipModal函数正常工作
  if (!page.showMemoryTipModal) {
    page.showMemoryTipModal = async function() {
      console.log('🧠 [最终修复版] showMemoryTipModal开始执行')
      
      // 强制设置弹窗显示状态
      this.setData({
        showMemoryTip: true
      })
      
      // 如果已经有预加载的内容，直接使用
      if (this.data.memoryTipContent) {
        console.log('✅ 使用预加载的记忆方法内容')
        return
      }
      
      // 设置加载状态
      this.setData({
        memoryTipLoading: true
      })
      
      try {
        console.log('🤖 开始生成记忆方法')
        const memoryTip = await this.generateMemoryTip(this.data.currentWord.word)
        
        this.setData({
          memoryTipContent: memoryTip,
          memoryTipLoading: false
        })
        
        console.log('✅ 记忆方法生成成功')
      } catch (error) {
        console.error('❌ 记忆方法生成失败:', error)
        const fallbackTip = this.generateFallbackMemoryTip(this.data.currentWord.word)
        
        this.setData({
          memoryTipContent: fallbackTip,
          memoryTipLoading: false
        })
        
        console.log('✅ 使用降级记忆方法')
      }
    }
    console.log('✅ showMemoryTipModal函数已创建')
  }
  
  // 修复2: 添加强制显示函数
  page.forceShowMemoryTipModal = async function() {
    console.log('🚀 强制显示记忆方法弹窗')
    
    // 确保有内容
    if (!this.data.memoryTipContent) {
      const fallbackTip = this.generateFallbackMemoryTip(this.data.currentWord.word)
      this.setData({
        memoryTipContent: fallbackTip
      })
    }
    
    // 强制显示
    this.setData({
      showMemoryTip: true,
      memoryTipLoading: false
    })
    
    // 验证显示状态
    setTimeout(() => {
      console.log('🔍 弹窗状态验证:', {
        showMemoryTip: this.data.showMemoryTip,
        hasContent: !!this.data.memoryTipContent
      })
    }, 200)
  }
  console.log('✅ forceShowMemoryTipModal函数已添加')
  
  // 修复3: 添加测试函数
  page.testMemoryTipModal = function() {
    console.log('🧪 手动测试记忆方法弹窗')
    this.setData({
      memoryTipContent: '这是一个测试记忆方法内容，用于验证弹窗是否能正常显示。',
      showMemoryTip: true
    })
  }
  console.log('✅ testMemoryTipModal函数已添加')
  
  // 修复4: 添加状态检查函数
  page.checkMemoryTipState = function() {
    console.log('🔍 记忆方法弹窗状态检查:', {
      showMemoryTip: this.data.showMemoryTip,
      memoryTipContent: this.data.memoryTipContent ? '有内容' : '无内容',
      memoryTipLoading: this.data.memoryTipLoading,
      preloadingMemoryTip: this.data.preloadingMemoryTip,
      dictationAttempts: this.data.dictationAttempts,
      maxAttempts: this.data.maxAttempts,
      currentWord: this.data.currentWord?.word
    })
  }
  console.log('✅ checkMemoryTipState函数已添加')
  
  // 修复5: 添加降级显示函数
  page.showFallbackMemoryTip = function() {
    console.log('🔄 显示降级记忆方法')
    const fallbackTip = this.generateFallbackMemoryTip(this.data.currentWord.word)
    
    wx.showModal({
      title: '🧠 记忆提示',
      content: fallbackTip,
      showCancel: true,
      cancelText: '跳过',
      confirmText: '继续练习',
      success: (res) => {
        if (res.confirm) {
          this.onContinuePractice()
        } else {
          this.onSkipWord()
        }
      }
    })
  }
  console.log('✅ showFallbackMemoryTip函数已添加')
  
  // 修复6: 修复onSubmitDictation函数
  const originalOnSubmitDictation = page.onSubmitDictation
  page.onSubmitDictation = function() {
    const { currentWord, dictationInput, dictationAttempts, maxAttempts } = this.data
    
    console.log('📝 [最终修复版] 提交默写:', {
      input: dictationInput,
      currentAttempts: dictationAttempts,
      maxAttempts: maxAttempts,
      currentWord: currentWord?.word
    })
    
    if (!dictationInput.trim()) {
      wx.showToast({
        title: '请输入单词',
        icon: 'none'
      })
      return
    }

    const isCorrect = dictationInput.trim().toLowerCase() === currentWord.word.toLowerCase()
    const newAttempts = dictationAttempts + 1
    
    console.log('📝 [最终修复版] 默写结果:', {
      isCorrect: isCorrect,
      newAttempts: newAttempts,
      shouldShowMemoryTip: newAttempts >= maxAttempts
    })

    if (isCorrect) {
      // 默写成功
      this.handleWordCompletion(true)
    } else {
      // 记录听写错误
      dataManager.recordWordError(currentWord.word, {
        sessionId: this.data.sessionId,
        errorType: 'dictation',
        userInput: dictationInput.trim(),
        attemptNumber: newAttempts
      })
      
      // 错误2次后开始预加载记忆方法
      if (newAttempts === 2 && !this.data.preloadingMemoryTip) {
        console.log('🔄 开始预加载记忆方法')
        this.preloadMemoryTip()
      }
      
      if (newAttempts >= maxAttempts) {
        // 达到最大尝试次数，显示记忆方法弹窗
        console.log('🧠 [最终修复版] 触发记忆方法弹窗')
        
        // 先更新尝试次数
        this.setData({
          dictationAttempts: newAttempts,
          dictationInput: ''
        }, async () => {
          console.log('✅ 已更新尝试次数，准备显示记忆方法弹窗')
          
          // 确保状态更新完成后再显示弹窗
          await new Promise(resolve => setTimeout(resolve, 100))
          
          try {
            // 强制显示弹窗
            await this.forceShowMemoryTipModal()
            console.log('✅ 记忆方法弹窗显示成功')
          } catch (error) {
            console.error('❌ 记忆方法弹窗显示失败:', error)
            // 降级方案：使用系统弹窗
            this.showFallbackMemoryTip()
          }
        })
        
        return
      } else {
        // 继续尝试，显示提示
        this.setData({
          dictationAttempts: newAttempts,
          showHint: newAttempts >= 2,
          dictationInput: ''
        })
        
        wx.showToast({
          title: `还有${maxAttempts - newAttempts}次机会`,
          icon: 'none'
        })
      }
    }
  }
  console.log('✅ onSubmitDictation函数已修复')
  
  // 验证所有函数
  console.log('\n🔍 验证所有函数:')
  const functions = [
    'showMemoryTipModal',
    'forceShowMemoryTipModal', 
    'testMemoryTipModal',
    'checkMemoryTipState',
    'showFallbackMemoryTip',
    'onSubmitDictation'
  ]
  
  functions.forEach(funcName => {
    if (typeof page[funcName] === 'function') {
      console.log(`✅ ${funcName} 函数存在`)
    } else {
      console.error(`❌ ${funcName} 函数不存在`)
    }
  })
  
  // 检查当前状态
  console.log('\n📊 当前页面状态:', {
    showMemoryTip: page.data.showMemoryTip,
    memoryTipContent: page.data.memoryTipContent ? '有内容' : '无内容',
    dictationAttempts: page.data.dictationAttempts,
    maxAttempts: page.data.maxAttempts,
    currentWord: page.data.currentWord?.word
  })
  
  console.log('\n🎉 记忆提示弹窗最终修复完成！')
  console.log('📝 现在可以使用以下命令测试:')
  console.log('1. 手动测试弹窗: page.testMemoryTipModal()')
  console.log('2. 状态检查: page.checkMemoryTipState()')
  console.log('3. 强制显示: page.forceShowMemoryTipModal()')
  console.log('4. 模拟第3次错误: 在默写界面故意错误拼写3次')
  
  // 将page对象暴露到全局，方便测试
  window.currentPage = page
  console.log('💡 页面对象已暴露为 window.currentPage，可以直接使用')
}
