/**
 * 记忆方法弹窗综合修复脚本
 * 解决用户错误拼写3次后记忆提示弹窗不显示的问题
 */

// 记忆提示弹窗修复器
class MemoryTipFixer {
  constructor() {
    this.page = null
    this.isFixed = false
  }

  // 初始化修复器
  init() {
    console.log('🛠️ 初始化记忆提示弹窗修复器...')
    
    this.page = getCurrentPages()[getCurrentPages().length - 1]
    if (!this.page) {
      console.error('❌ 无法获取当前页面')
      return false
    }

    console.log('✅ 修复器初始化完成')
    return true
  }

  // 运行综合修复
  async runFix() {
    console.log('\n🎯 ===== 开始记忆提示弹窗综合修复 =====')
    
    if (!this.init()) {
      return
    }

    // 修复1: 强化onSubmitDictation逻辑
    this.fixOnSubmitDictation()
    
    // 修复2: 增强showMemoryTipModal函数
    this.fixShowMemoryTipModal()
    
    // 修复3: 修复状态管理问题
    this.fixStateManagement()
    
    // 修复4: 添加调试和监控
    this.addDebugging()
    
    // 验证修复效果
    await this.verifyFix()
    
    console.log('✅ 记忆提示弹窗修复完成')
    this.isFixed = true
  }

  // 修复1: 强化onSubmitDictation逻辑
  fixOnSubmitDictation() {
    console.log('\n🔧 修复1: 强化onSubmitDictation逻辑')
    
    const originalMethod = this.page.onSubmitDictation
    
    this.page.onSubmitDictation = function() {
      const { currentWord, dictationInput, dictationAttempts, maxAttempts } = this.data
      
      console.log('📝 [修复版] 提交默写:', {
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
      
      console.log('📝 [修复版] 默写结果:', {
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
          console.log('🧠 [修复版] 触发记忆方法弹窗，当前状态:', {
            showMemoryTip: this.data.showMemoryTip,
            memoryTipContent: this.data.memoryTipContent ? '有内容' : '无内容',
            newAttempts: newAttempts,
            maxAttempts: maxAttempts
          })
          
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
    
    console.log('✅ onSubmitDictation逻辑修复完成')
  }

  // 修复2: 增强showMemoryTipModal函数
  fixShowMemoryTipModal() {
    console.log('\n🔧 修复2: 增强showMemoryTipModal函数')
    
    const originalMethod = this.page.showMemoryTipModal
    
    this.page.showMemoryTipModal = async function() {
      console.log('🧠 [修复版] showMemoryTipModal开始执行')
      
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
    
    // 添加强制显示函数
    this.page.forceShowMemoryTipModal = async function() {
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
    
    console.log('✅ showMemoryTipModal函数增强完成')
  }

  // 修复3: 修复状态管理问题
  fixStateManagement() {
    console.log('\n🔧 修复3: 修复状态管理问题')
    
    // 修复setupLetterSpellingGame函数，确保不重置记忆方法状态
    const originalSetupMethod = this.page.setupLetterSpellingGame
    
    this.page.setupLetterSpellingGame = function(word) {
      console.log('🎮 [修复版] 设置字母拼写游戏，输入单词:', word)
      
      // 验证单词数据
      if (!word || !word.word) {
        console.error('❌ 单词数据无效:', word)
        wx.showModal({
          title: '错误',
          content: '单词数据无效，请重试',
          showCancel: false
        })
        return
      }
      
      const targetWord = word.word.toLowerCase()
      console.log('🎯 目标单词:', targetWord)
      
      // 检查是否为英文单词
      if (!/^[a-zA-Z]+$/.test(targetWord)) {
        console.error('❌ 非英文单词:', targetWord)
        wx.showModal({
          title: '数据错误', 
          content: `检测到无效单词数据: ${targetWord}，请检查单词库数据`,
          showCancel: false,
          success: () => {
            wx.navigateBack()
          }
        })
        return
      }
      
      const letters = targetWord.split('')
      const shuffledLetters = this.shuffleArray([...letters]).map((char, index) => ({
        char: char.toLowerCase(),
        used: false,
        correct: false,
        originalIndex: index
      }))
      
      const sentenceWithBlank = this.createSentenceWithBlank(word.sentence, word.word)
      
      // 重要：保护记忆方法相关状态
      const currentMemoryTipState = {
        memoryTipContent: this.data.memoryTipContent,
        showMemoryTip: this.data.showMemoryTip,
        memoryTipLoading: this.data.memoryTipLoading,
        preloadingMemoryTip: this.data.preloadingMemoryTip
      }
      
      this.setData({
        mode: 'dictation',
        targetWord: targetWord,
        shuffledLetters: shuffledLetters,
        userAnswer: [],
        sentenceWithBlank: sentenceWithBlank,
        dictationInput: '',
        showHint: false,
        showHintOption: false,
        dictationAttempts: 0,
        answerCompleted: false,
        wordFlashAnimation: false,
        explodeAnimation: false,
        wordAudioLoading: false,
        sentenceAudioLoading: false,
        // 恢复记忆方法状态
        memoryTipContent: currentMemoryTipState.memoryTipContent,
        showMemoryTip: currentMemoryTipState.showMemoryTip,
        memoryTipLoading: currentMemoryTipState.memoryTipLoading,
        preloadingMemoryTip: currentMemoryTipState.preloadingMemoryTip
      })
      
      console.log('✅ 默写模式数据设置完成，记忆方法状态已保护')
    }
    
    console.log('✅ 状态管理修复完成')
  }

  // 修复4: 添加调试和监控
  addDebugging() {
    console.log('\n🔧 修复4: 添加调试和监控')
    
    // 添加手动测试函数
    this.page.testMemoryTipModal = function() {
      console.log('🧪 手动测试记忆方法弹窗')
      this.setData({
        memoryTipContent: '这是一个测试记忆方法内容，用于验证弹窗是否能正常显示。',
        showMemoryTip: true
      })
    }
    
    // 添加状态检查函数
    this.page.checkMemoryTipState = function() {
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
    
    // 添加降级显示函数
    this.page.showFallbackMemoryTip = function() {
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
    
    console.log('✅ 调试和监控功能添加完成')
  }

  // 验证修复效果
  async verifyFix() {
    console.log('\n🔍 验证修复效果...')
    
    // 检查关键函数是否存在
    const requiredFunctions = [
      'onSubmitDictation',
      'showMemoryTipModal',
      'forceShowMemoryTipModal',
      'testMemoryTipModal',
      'checkMemoryTipState',
      'showFallbackMemoryTip'
    ]
    
    for (const funcName of requiredFunctions) {
      if (typeof this.page[funcName] === 'function') {
        console.log(`✅ ${funcName} 函数存在`)
      } else {
        console.error(`❌ ${funcName} 函数不存在`)
      }
    }
    
    // 检查数据状态
    console.log('📊 当前页面数据状态:', {
      showMemoryTip: this.page.data.showMemoryTip,
      memoryTipContent: this.page.data.memoryTipContent ? '有内容' : '无内容',
      dictationAttempts: this.page.data.dictationAttempts,
      maxAttempts: this.page.data.maxAttempts
    })
    
    console.log('✅ 修复验证完成')
  }

  // 清理函数
  cleanup() {
    if (this.isFixed) {
      console.log('🧹 清理修复器...')
      // 可以在这里添加清理逻辑
    }
  }
}

// 自动运行修复
console.log('🚀 自动运行记忆提示弹窗修复...')
const fixer = new MemoryTipFixer()
fixer.runFix().then(() => {
  console.log('🎉 记忆提示弹窗修复完成！')
  console.log('📝 使用说明:')
  console.log('1. 在默写界面错误拼写3次后，记忆提示弹窗应该自动显示')
  console.log('2. 手动测试: getCurrentPages()[0].testMemoryTipModal()')
  console.log('3. 状态检查: getCurrentPages()[0].checkMemoryTipState()')
  console.log('4. 强制显示: getCurrentPages()[0].forceShowMemoryTipModal()')
}).catch(error => {
  console.error('❌ 修复失败:', error)
})
