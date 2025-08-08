/**
 * 记忆方法弹窗终极修复脚本
 * 基于深度分析结果的综合修复方案
 */

// 终极修复器
class UltimateMemoryTipFixer {
  constructor() {
    this.page = null
    this.fixResults = []
    this.originalMethods = {}
  }

  // 初始化修复器
  init() {
    console.log('🛠️ 初始化记忆方法弹窗终极修复器...')
    
    this.page = getCurrentPages()[getCurrentPages().length - 1]
    if (!this.page) {
      console.error('❌ 无法获取当前页面')
      return false
    }

    // 备份原始方法
    this.originalMethods = {
      setData: this.page.setData.bind(this.page),
      onSubmitDictation: this.page.onSubmitDictation.bind(this.page),
      showMemoryTipModal: this.page.showMemoryTipModal.bind(this.page),
      loadCurrentWord: this.page.loadCurrentWord.bind(this.page)
    }

    console.log('✅ 修复器初始化完成')
    return true
  }

  // 运行终极修复
  async runUltimateFix() {
    console.log('\n🎯 ===== 开始记忆方法弹窗终极修复 =====')
    
    if (!this.init()) {
      return
    }

    // 修复1: 强化onSubmitDictation函数
    this.fixOnSubmitDictation()
    
    // 修复2: 增强showMemoryTipModal函数
    this.fixShowMemoryTipModal()
    
    // 修复3: 保护loadCurrentWord函数
    this.fixLoadCurrentWord()
    
    // 修复4: 添加状态监控和自动恢复
    this.addStateMonitoring()
    
    // 修复5: 强制DOM渲染修复
    this.fixDOMRendering()
    
    // 验证修复效果
    await this.verifyFixes()
    
    // 生成修复报告
    this.generateFixReport()
  }

  // 修复1: 强化onSubmitDictation函数
  fixOnSubmitDictation() {
    console.log('\n🔧 修复1: 强化onSubmitDictation函数')
    
    const originalMethod = this.originalMethods.onSubmitDictation
    
    this.page.onSubmitDictation = function() {
      const { currentWord, dictationInput, dictationAttempts, maxAttempts } = this.data
      
      console.log('📝 [增强版] 提交默写:', {
        input: dictationInput,
        currentAttempts: dictationAttempts,
        maxAttempts: maxAttempts
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
      
      console.log('📝 [增强版] 默写结果:', {
        isCorrect: isCorrect,
        newAttempts: newAttempts,
        shouldShowMemoryTip: newAttempts >= maxAttempts
      })

      if (isCorrect) {
        // 默写成功
        this.handleWordCompletion(true)
      } else {
        // 记录听写错误
        const dataManager = require('../../utils/data-manager.js')
        dataManager.recordWordError(currentWord.word, {
          sessionId: this.data.sessionId,
          errorType: 'dictation',
          userInput: dictationInput.trim(),
          attemptNumber: newAttempts
        })
        
        // 错误2次后开始预加载记忆方法
        if (newAttempts === 2 && !this.data.preloadingMemoryTip) {
          console.log('🔄 [增强版] 开始预加载记忆方法')
          this.preloadMemoryTip()
        }
        
        if (newAttempts >= maxAttempts) {
          // 达到最大尝试次数，显示记忆方法弹窗
          console.log('🧠 [增强版] 触发记忆方法弹窗，当前状态:', {
            showMemoryTip: this.data.showMemoryTip,
            memoryTipContent: this.data.memoryTipContent,
            newAttempts: newAttempts,
            maxAttempts: maxAttempts
          })
          
          // 使用Promise确保异步操作的正确执行
          this.setData({
            dictationAttempts: newAttempts,
            dictationInput: ''
          }, async () => {
            console.log('✅ [增强版] 已更新尝试次数，准备显示记忆方法弹窗')
            
            try {
              // 多重保障的弹窗显示
              await this.showMemoryTipModalWithRetry()
              
              // 验证弹窗状态
              setTimeout(() => {
                this.verifyModalState('[增强版onSubmitDictation]')
              }, 200)
              
            } catch (error) {
              console.error('❌ [增强版] showMemoryTipModal调用失败:', error)
              // 降级处理：直接设置状态
              this.forceShowMemoryTip()
            }
          })
          
          return // 重要：不调用handleWordCompletion
        } else {
          // 继续尝试
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
    }.bind(this.page)
    
    this.fixResults.push({
      name: 'onSubmitDictation函数强化',
      status: 'success',
      description: '增加了多重保障和错误处理'
    })
  }

  // 修复2: 增强showMemoryTipModal函数
  fixShowMemoryTipModal() {
    console.log('\n🔧 修复2: 增强showMemoryTipModal函数')
    
    // 添加带重试机制的弹窗显示方法
    this.page.showMemoryTipModalWithRetry = async function(maxRetries = 3) {
      console.log('🔄 [带重试] 开始显示记忆方法弹窗')
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`🔄 [带重试] 第${attempt}次尝试显示弹窗`)
        
        try {
          // 先强制设置显示状态
          await new Promise((resolve) => {
            this.setData({
              showMemoryTip: true,
              memoryTipLoading: true
            }, () => {
              console.log(`✅ [带重试-${attempt}] 弹窗状态已设置为显示`)
              resolve()
            })
          })
          
          // 等待DOM更新
          await new Promise(resolve => setTimeout(resolve, 100))
          
          // 检查DOM是否存在
          const modalElement = document.querySelector('.memory-tip-modal')
          if (modalElement) {
            console.log(`✅ [带重试-${attempt}] DOM元素已创建`)
            
            // 生成或获取记忆方法内容
            let memoryTipContent = this.data.memoryTipContent
            if (!memoryTipContent) {
              console.log(`🔄 [带重试-${attempt}] 生成记忆方法内容`)
              try {
                memoryTipContent = await this.generateMemoryTip(this.data.currentWord.word)
              } catch (error) {
                console.warn(`⚠️ [带重试-${attempt}] AI生成失败，使用降级方案`)
                memoryTipContent = this.generateFallbackMemoryTip(this.data.currentWord.word)
              }
            }
            
            // 设置内容并完成显示
            await new Promise((resolve) => {
              this.setData({
                memoryTipContent: memoryTipContent,
                memoryTipLoading: false
              }, () => {
                console.log(`✅ [带重试-${attempt}] 弹窗内容设置完成`)
                resolve()
              })
            })
            
            // 最终验证
            const finalState = {
              showMemoryTip: this.data.showMemoryTip,
              hasContent: !!this.data.memoryTipContent,
              loading: this.data.memoryTipLoading
            }
            
            console.log(`🎯 [带重试-${attempt}] 最终状态:`, finalState)
            
            if (finalState.showMemoryTip && finalState.hasContent && !finalState.loading) {
              console.log(`✅ [带重试] 第${attempt}次尝试成功！`)
              return true
            }
          } else {
            console.warn(`⚠️ [带重试-${attempt}] DOM元素未创建`)
          }
          
        } catch (error) {
          console.error(`❌ [带重试-${attempt}] 尝试失败:`, error)
        }
        
        if (attempt < maxRetries) {
          console.log(`🔄 [带重试] 等待${attempt * 200}ms后重试...`)
          await new Promise(resolve => setTimeout(resolve, attempt * 200))
        }
      }
      
      console.error('❌ [带重试] 所有尝试都失败了')
      return false
    }.bind(this.page)
    
    this.fixResults.push({
      name: 'showMemoryTipModal函数增强',
      status: 'success',
      description: '添加了重试机制和更强的错误处理'
    })
  }

  // 修复3: 保护loadCurrentWord函数
  fixLoadCurrentWord() {
    console.log('\n🔧 修复3: 保护loadCurrentWord函数')
    
    const originalLoadCurrentWord = this.originalMethods.loadCurrentWord
    
    this.page.loadCurrentWord = function() {
      console.log('📚 [保护版] 加载新单词，检查弹窗状态')
      
      const shouldPreserveModal = this.data.showMemoryTip
      console.log(`🛡️ [保护版] 是否需要保护弹窗状态: ${shouldPreserveModal}`)
      
      if (shouldPreserveModal) {
        console.log('🛡️ [保护版] 检测到弹窗正在显示，跳过状态重置')
        // 只更新必要的单词数据，保护弹窗状态
        const { levelData, currentWordIndex } = this.data
        
        if (!levelData || !levelData.words || currentWordIndex >= levelData.words.length) {
          console.error('单词数据不存在或索引超出范围')
          return
        }

        const currentWord = levelData.words[currentWordIndex]
        
        this.setData({
          currentWord,
          mode: 'learn',
          wordStartTime: Date.now(),
          // 只重置必要的状态，保护记忆方法弹窗
          sentenceWithBlank: '',
          targetWord: '',
          shuffledLetters: [],
          userAnswer: [],
          answerCompleted: false,
          wordFlashAnimation: false,
          explodeAnimation: false,
          wordAudioLoading: false,
          sentenceAudioLoading: false
          // 不重置记忆方法相关状态
        })
        
        console.log('✅ [保护版] 单词数据更新完成，弹窗状态已保护')
      } else {
        // 正常执行原始逻辑
        console.log('📚 [保护版] 正常加载单词，无需保护弹窗状态')
        originalLoadCurrentWord.call(this)
      }
    }.bind(this.page)
    
    this.fixResults.push({
      name: 'loadCurrentWord函数保护',
      status: 'success',
      description: '添加了弹窗状态保护机制'
    })
  }

  // 修复4: 添加状态监控和自动恢复
  addStateMonitoring() {
    console.log('\n🔧 修复4: 添加状态监控和自动恢复')
    
    // 状态监控器
    this.page.memoryTipStateMonitor = {
      isMonitoring: false,
      monitorInterval: null,
      
      start() {
        if (this.isMonitoring) return
        
        console.log('👁️ 开始监控记忆方法弹窗状态')
        this.isMonitoring = true
        
        this.monitorInterval = setInterval(() => {
          const page = getCurrentPages()[getCurrentPages().length - 1]
          const state = page.data
          
          // 检查异常状态
          if (state.dictationAttempts >= state.maxAttempts && !state.showMemoryTip) {
            console.warn('⚠️ 检测到异常状态：应该显示弹窗但未显示')
            this.autoRecover(page)
          }
          
          // 检查DOM与状态不一致
          if (state.showMemoryTip) {
            const modalElement = document.querySelector('.memory-tip-modal')
            if (!modalElement) {
              console.warn('⚠️ 检测到状态与DOM不一致：状态显示但DOM不存在')
              this.autoRecover(page)
            }
          }
        }, 1000)
      },
      
      stop() {
        if (!this.isMonitoring) return
        
        console.log('👁️ 停止监控记忆方法弹窗状态')
        this.isMonitoring = false
        
        if (this.monitorInterval) {
          clearInterval(this.monitorInterval)
          this.monitorInterval = null
        }
      },
      
      autoRecover(page) {
        console.log('🔧 执行自动恢复...')
        
        page.setData({
          showMemoryTip: true,
          memoryTipContent: page.data.memoryTipContent || page.generateFallbackMemoryTip(page.data.currentWord.word),
          memoryTipLoading: false
        }, () => {
          console.log('✅ 自动恢复完成')
        })
      }
    }
    
    // 启动监控
    this.page.memoryTipStateMonitor.start()
    
    this.fixResults.push({
      name: '状态监控和自动恢复',
      status: 'success',
      description: '添加了实时状态监控和自动恢复机制'
    })
  }

  // 修复5: 强制DOM渲染修复
  fixDOMRendering() {
    console.log('\n🔧 修复5: 强制DOM渲染修复')
    
    // 添加强制显示方法
    this.page.forceShowMemoryTip = function() {
      console.log('💪 强制显示记忆方法弹窗')
      
      const fallbackContent = this.generateFallbackMemoryTip(this.data.currentWord.word)
      
      // 强制设置所有相关状态
      this.setData({
        showMemoryTip: true,
        memoryTipContent: fallbackContent,
        memoryTipLoading: false,
        dictationAttempts: Math.max(this.data.dictationAttempts, this.data.maxAttempts)
      }, () => {
        console.log('✅ 强制显示完成')
        
        // 强制触发页面重新渲染
        setTimeout(() => {
          this.setData({})
        }, 50)
      })
    }.bind(this.page)
    
    // 添加验证方法
    this.page.verifyModalState = function(context = '') {
      const state = this.data
      const modalElement = document.querySelector('.memory-tip-modal')
      
      const verification = {
        context: context,
        showMemoryTip: state.showMemoryTip,
        hasContent: !!state.memoryTipContent,
        loading: state.memoryTipLoading,
        domExists: !!modalElement,
        domVisible: modalElement ? window.getComputedStyle(modalElement).display !== 'none' : false
      }
      
      console.log('🔍 弹窗状态验证:', verification)
      
      const isValid = verification.showMemoryTip && verification.hasContent && !verification.loading && verification.domExists && verification.domVisible
      
      if (!isValid) {
        console.warn('⚠️ 弹窗状态异常，尝试修复...')
        this.forceShowMemoryTip()
      }
      
      return isValid
    }.bind(this.page)
    
    this.fixResults.push({
      name: 'DOM渲染强制修复',
      status: 'success',
      description: '添加了强制显示和状态验证方法'
    })
  }

  // 验证修复效果
  async verifyFixes() {
    console.log('\n🔍 验证修复效果...')
    
    // 模拟第3次错误场景
    console.log('🎯 模拟第3次错误场景')
    
    this.page.setData({
      currentWord: { word: 'test', chinese: '测试' },
      dictationAttempts: 2,
      dictationInput: 'wrong',
      showMemoryTip: false,
      memoryTipContent: '',
      mode: 'dictation'
    })
    
    // 等待状态设置完成
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // 触发第3次错误
    console.log('🚀 触发第3次错误提交...')
    this.page.onSubmitDictation()
    
    // 等待处理完成
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 验证结果
    const finalState = {
      showMemoryTip: this.page.data.showMemoryTip,
      hasContent: !!this.page.data.memoryTipContent,
      attempts: this.page.data.dictationAttempts,
      domExists: !!document.querySelector('.memory-tip-modal')
    }
    
    console.log('📊 验证结果:', finalState)
    
    const isSuccess = finalState.showMemoryTip && finalState.hasContent && finalState.attempts >= 3 && finalState.domExists
    
    this.fixResults.push({
      name: '修复效果验证',
      status: isSuccess ? 'success' : 'failed',
      description: isSuccess ? '所有修复都生效了' : '部分修复可能未生效'
    })
  }

  // 生成修复报告
  generateFixReport() {
    console.log('\n📊 ===== 终极修复报告 =====')
    
    const successCount = this.fixResults.filter(fix => fix.status === 'success').length
    const totalCount = this.fixResults.length
    
    console.log(`修复概况: ${successCount}/${totalCount} 项修复成功`)
    
    this.fixResults.forEach((fix, index) => {
      const statusIcon = fix.status === 'success' ? '✅' : '❌'
      console.log(`${index + 1}. ${statusIcon} ${fix.name}: ${fix.description}`)
    })
    
    if (successCount === totalCount) {
      console.log('\n🎉 ===== 终极修复成功！=====')
      console.log('✅ 所有修复都已应用')
      console.log('✅ 记忆方法弹窗问题应该已经解决')
      console.log('✅ 状态监控和自动恢复已启用')
      
      console.log('\n🎯 测试建议:')
      console.log('1. 进入默写模式')
      console.log('2. 故意输入错误答案3次')
      console.log('3. 观察记忆方法弹窗是否正常显示')
      console.log('4. 测试弹窗中的"继续练习"和"跳过单词"功能')
    } else {
      console.log('\n⚠️ ===== 部分修复失败 =====')
      console.log('请检查失败的修复项并手动处理')
    }
    
    console.log('\n🛠️ 可用的修复方法:')
    console.log('   this.page.forceShowMemoryTip()     - 强制显示弹窗')
    console.log('   this.page.verifyModalState()       - 验证弹窗状态')
    console.log('   this.page.showMemoryTipModalWithRetry() - 带重试的弹窗显示')
  }

  // 恢复原始方法
  restoreOriginalMethods() {
    console.log('🔄 恢复原始方法...')
    
    Object.keys(this.originalMethods).forEach(methodName => {
      if (this.page[methodName] && this.originalMethods[methodName]) {
        this.page[methodName] = this.originalMethods[methodName]
        console.log(`✅ 已恢复 ${methodName} 方法`)
      }
    })
    
    // 停止监控
    if (this.page.memoryTipStateMonitor) {
      this.page.memoryTipStateMonitor.stop()
    }
    
    console.log('✅ 原始方法恢复完成')
  }

  // 清理修复器
  cleanup() {
    this.restoreOriginalMethods()
    this.fixResults = []
    console.log('🧹 修复器已清理')
  }
}

// 创建全局修复器实例
window.ultimateMemoryTipFixer = new UltimateMemoryTipFixer()

// 快捷方法
window.runUltimateFix = () => window.ultimateMemoryTipFixer.runUltimateFix()
window.restoreOriginalMethods = () => window.ultimateMemoryTipFixer.restoreOriginalMethods()
window.cleanupFixer = () => window.ultimateMemoryTipFixer.cleanup()

console.log('🛠️ 记忆方法弹窗终极修复器已加载!')
console.log('📖 使用方法:')
console.log('   runUltimateFix()         - 运行终极修复')
console.log('   restoreOriginalMethods() - 恢复原始方法')
console.log('   cleanupFixer()           - 清理修复器')
console.log('\n💡 推荐使用流程:')
console.log('   1. runUltimateFix() - 应用所有修复')
console.log('   2. 测试第3次错误场景')
console.log('   3. 如果需要，使用 restoreOriginalMethods() 恢复')
console.log('   4. 测试完成后使用 cleanupFixer() 清理')