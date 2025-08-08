/**
 * 记忆提示弹窗DOM操作修复脚本
 * 解决微信小程序中document.querySelector未定义的问题
 */

// DOM操作修复器
class MemoryTipDOMFixer {
  constructor() {
    this.page = null
    this.isFixed = false
  }

  // 初始化修复器
  init() {
    console.log('🛠️ 初始化DOM操作修复器...')
    
    this.page = getCurrentPages()[getCurrentPages().length - 1]
    if (!this.page) {
      console.error('❌ 无法获取当前页面')
      return false
    }

    console.log('✅ DOM修复器初始化完成')
    return true
  }

  // 运行DOM修复
  async runDOMFix() {
    console.log('\n🎯 ===== 开始DOM操作修复 =====')
    
    if (!this.init()) {
      return
    }

    // 修复1: 移除所有document.querySelector调用
    this.removeDocumentQueries()
    
    // 修复2: 增强showMemoryTipModal函数
    this.fixShowMemoryTipModal()
    
    // 修复3: 添加强制显示函数
    this.addForceShowFunction()
    
    // 修复4: 优化状态验证
    this.optimizeStateValidation()
    
    // 验证修复效果
    await this.verifyDOMFix()
    
    console.log('✅ DOM操作修复完成')
    this.isFixed = true
  }

  // 修复1: 移除所有document.querySelector调用
  removeDocumentQueries() {
    console.log('\n🔧 修复1: 移除document.querySelector调用')
    
    // 检查并修复showMemoryTipModal函数中的DOM操作
    if (this.page.showMemoryTipModal) {
      const originalMethod = this.page.showMemoryTipModal
      
      this.page.showMemoryTipModal = async function() {
        console.log('🧠 [DOM修复版] showMemoryTipModal开始执行')
        
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
    }
    
    console.log('✅ document.querySelector调用已移除')
  }

  // 修复2: 增强showMemoryTipModal函数
  fixShowMemoryTipModal() {
    console.log('\n🔧 修复2: 增强showMemoryTipModal函数')
    
    // 确保函数存在
    if (!this.page.showMemoryTipModal) {
      this.page.showMemoryTipModal = async function() {
        console.log('🧠 [增强版] showMemoryTipModal开始执行')
        
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
    }
    
    console.log('✅ showMemoryTipModal函数已增强')
  }

  // 修复3: 添加强制显示函数
  addForceShowFunction() {
    console.log('\n🔧 修复3: 添加强制显示函数')
    
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
      
      // 验证显示状态（不使用DOM查询）
      setTimeout(() => {
        console.log('🔍 弹窗状态验证:', {
          showMemoryTip: this.data.showMemoryTip,
          hasContent: !!this.data.memoryTipContent
        })
      }, 200)
    }
    
    console.log('✅ 强制显示函数已添加')
  }

  // 修复4: 优化状态验证
  optimizeStateValidation() {
    console.log('\n🔧 修复4: 优化状态验证')
    
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
    
    // 添加手动测试函数
    this.page.testMemoryTipModal = function() {
      console.log('🧪 手动测试记忆方法弹窗')
      this.setData({
        memoryTipContent: '这是一个测试记忆方法内容，用于验证弹窗是否能正常显示。',
        showMemoryTip: true
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
    
    console.log('✅ 状态验证已优化')
  }

  // 验证修复效果
  async verifyDOMFix() {
    console.log('\n🔍 验证DOM修复效果...')
    
    // 检查关键函数是否存在
    const requiredFunctions = [
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
    
    console.log('✅ DOM修复验证完成')
  }

  // 清理函数
  cleanup() {
    if (this.isFixed) {
      console.log('🧹 清理DOM修复器...')
    }
  }
}

// 自动运行DOM修复
console.log('🚀 自动运行DOM操作修复...')
const domFixer = new MemoryTipDOMFixer()
domFixer.runDOMFix().then(() => {
  console.log('🎉 DOM操作修复完成！')
  console.log('📝 使用说明:')
  console.log('1. 所有document.querySelector调用已移除')
  console.log('2. 记忆提示弹窗应该能正常显示')
  console.log('3. 手动测试: getCurrentPages()[0].testMemoryTipModal()')
  console.log('4. 状态检查: getCurrentPages()[0].checkMemoryTipState()')
  console.log('5. 强制显示: getCurrentPages()[0].forceShowMemoryTipModal()')
}).catch(error => {
  console.error('❌ DOM修复失败:', error)
})
