/**
 * 记忆方法弹窗最终修复验证脚本
 * 专门测试第3次错误后弹窗显示的完整修复方案
 */

// 最终修复验证器
class FinalMemoryTipFixValidator {
  constructor() {
    this.page = null
    this.testResults = []
    this.originalMethods = {}
  }

  // 初始化测试环境
  init() {
    console.log('🚀 初始化记忆方法弹窗最终修复验证器...')
    
    this.page = getCurrentPages()[getCurrentPages().length - 1]
    if (!this.page) {
      console.error('❌ 无法获取当前页面')
      return false
    }

    // 备份原始方法
    this.originalMethods = {
      setData: this.page.setData,
      loadCurrentWord: this.page.loadCurrentWord,
      proceedToNext: this.page.proceedToNext
    }

    console.log('✅ 验证器初始化完成')
    return true
  }

  // 运行完整的修复验证测试
  async runCompleteFixValidation() {
    console.log('\n🎯 ===== 开始完整修复验证测试 =====')
    
    if (!this.init()) {
      return
    }

    // 测试1: 基础状态验证
    await this.testBasicStateValidation()
    
    // 测试2: 第3次错误流程验证
    await this.testThirdErrorFlow()
    
    // 测试3: loadCurrentWord保护机制验证
    await this.testLoadCurrentWordProtection()
    
    // 测试4: 弹窗显示持久性验证
    await this.testModalPersistence()
    
    // 生成最终报告
    this.generateFinalReport()
  }

  // 测试1: 基础状态验证
  async testBasicStateValidation() {
    console.log('\n📋 测试1: 基础状态验证')
    
    const initialState = {
      dictationAttempts: this.page.data.dictationAttempts,
      maxAttempts: this.page.data.maxAttempts,
      showMemoryTip: this.page.data.showMemoryTip,
      mode: this.page.data.mode
    }
    
    console.log('初始状态:', initialState)
    
    const testResult = {
      name: '基础状态验证',
      passed: true,
      details: []
    }
    
    // 检查必要的方法是否存在
    const requiredMethods = ['onSubmitDictation', 'showMemoryTipModal', 'loadCurrentWord']
    for (const method of requiredMethods) {
      if (typeof this.page[method] === 'function') {
        testResult.details.push(`✅ ${method} 方法存在`)
      } else {
        testResult.details.push(`❌ ${method} 方法缺失`)
        testResult.passed = false
      }
    }
    
    this.testResults.push(testResult)
    console.log(`测试1结果: ${testResult.passed ? '✅ 通过' : '❌ 失败'}`)
  }

  // 测试2: 第3次错误流程验证
  async testThirdErrorFlow() {
    console.log('\n📋 测试2: 第3次错误流程验证')
    
    const testResult = {
      name: '第3次错误流程验证',
      passed: false,
      details: []
    }
    
    try {
      // 设置测试环境
      this.page.setData({
        dictationAttempts: 2,
        dictationInput: 'wronganswer',
        showMemoryTip: false,
        mode: 'dictation',
        currentWord: { word: 'test', chinese: '测试' }
      })
      
      testResult.details.push('✅ 测试环境设置完成')
      
      // 模拟第3次错误提交
      console.log('🔄 模拟第3次错误提交...')
      
      // 监控状态变化
      let stateChanges = []
      const originalSetData = this.page.setData
      this.page.setData = function(data, callback) {
        if (data.hasOwnProperty('showMemoryTip') || data.hasOwnProperty('dictationAttempts')) {
          stateChanges.push({
            timestamp: Date.now(),
            changes: data
          })
        }
        return originalSetData.call(this, data, callback)
      }
      
      // 执行第3次错误提交
      this.page.onSubmitDictation()
      
      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 恢复原始setData
      this.page.setData = originalSetData
      
      // 检查结果
      const finalState = {
        dictationAttempts: this.page.data.dictationAttempts,
        showMemoryTip: this.page.data.showMemoryTip,
        memoryTipContent: this.page.data.memoryTipContent
      }
      
      console.log('状态变化历史:', stateChanges)
      console.log('最终状态:', finalState)
      
      // 验证关键条件
      if (finalState.dictationAttempts >= 3) {
        testResult.details.push('✅ 尝试次数正确更新到3次')
      } else {
        testResult.details.push(`❌ 尝试次数错误: ${finalState.dictationAttempts}`)
      }
      
      if (finalState.showMemoryTip === true) {
        testResult.details.push('✅ showMemoryTip状态正确设置为true')
        testResult.passed = true
      } else {
        testResult.details.push(`❌ showMemoryTip状态错误: ${finalState.showMemoryTip}`)
      }
      
      // 检查DOM元素
      setTimeout(() => {
        const modalElement = document.querySelector('.memory-tip-modal')
        if (modalElement) {
          testResult.details.push('✅ DOM中存在memory-tip-modal元素')
          const styles = window.getComputedStyle(modalElement)
          testResult.details.push(`DOM样式: display=${styles.display}, visibility=${styles.visibility}`)
        } else {
          testResult.details.push('❌ DOM中不存在memory-tip-modal元素')
        }
      }, 200)
      
    } catch (error) {
      testResult.details.push(`❌ 测试执行错误: ${error.message}`)
      console.error('测试2执行错误:', error)
    }
    
    this.testResults.push(testResult)
    console.log(`测试2结果: ${testResult.passed ? '✅ 通过' : '❌ 失败'}`)
  }

  // 测试3: loadCurrentWord保护机制验证
  async testLoadCurrentWordProtection() {
    console.log('\n📋 测试3: loadCurrentWord保护机制验证')
    
    const testResult = {
      name: 'loadCurrentWord保护机制验证',
      passed: false,
      details: []
    }
    
    try {
      // 设置弹窗显示状态
      this.page.setData({
        showMemoryTip: true,
        memoryTipContent: '测试记忆方法内容',
        memoryTipLoading: false
      })
      
      testResult.details.push('✅ 设置弹窗显示状态')
      
      const beforeState = {
        showMemoryTip: this.page.data.showMemoryTip,
        memoryTipContent: this.page.data.memoryTipContent
      }
      
      console.log('调用loadCurrentWord前状态:', beforeState)
      
      // 调用loadCurrentWord
      this.page.loadCurrentWord()
      
      const afterState = {
        showMemoryTip: this.page.data.showMemoryTip,
        memoryTipContent: this.page.data.memoryTipContent
      }
      
      console.log('调用loadCurrentWord后状态:', afterState)
      
      // 验证保护机制
      if (afterState.showMemoryTip === true && afterState.memoryTipContent) {
        testResult.details.push('✅ loadCurrentWord保护机制生效，弹窗状态保持')
        testResult.passed = true
      } else {
        testResult.details.push('❌ loadCurrentWord保护机制失效，弹窗状态被重置')
        testResult.details.push(`状态变化: showMemoryTip ${beforeState.showMemoryTip} → ${afterState.showMemoryTip}`)
      }
      
    } catch (error) {
      testResult.details.push(`❌ 测试执行错误: ${error.message}`)
      console.error('测试3执行错误:', error)
    }
    
    this.testResults.push(testResult)
    console.log(`测试3结果: ${testResult.passed ? '✅ 通过' : '❌ 失败'}`)
  }

  // 测试4: 弹窗显示持久性验证
  async testModalPersistence() {
    console.log('\n📋 测试4: 弹窗显示持久性验证')
    
    const testResult = {
      name: '弹窗显示持久性验证',
      passed: false,
      details: []
    }
    
    try {
      // 强制显示弹窗
      await this.page.showMemoryTipModal()
      
      testResult.details.push('✅ 调用showMemoryTipModal')
      
      // 等待渲染
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const state1 = this.page.data.showMemoryTip
      testResult.details.push(`第1次检查: showMemoryTip = ${state1}`)
      
      // 等待更长时间
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const state2 = this.page.data.showMemoryTip
      testResult.details.push(`第2次检查: showMemoryTip = ${state2}`)
      
      // 检查DOM持久性
      const modalElement = document.querySelector('.memory-tip-modal')
      if (modalElement) {
        testResult.details.push('✅ DOM元素持续存在')
        
        const styles = window.getComputedStyle(modalElement)
        if (styles.display !== 'none' && styles.visibility !== 'hidden') {
          testResult.details.push('✅ 弹窗样式正常显示')
          testResult.passed = true
        } else {
          testResult.details.push(`❌ 弹窗样式异常: display=${styles.display}, visibility=${styles.visibility}`)
        }
      } else {
        testResult.details.push('❌ DOM元素不存在')
      }
      
    } catch (error) {
      testResult.details.push(`❌ 测试执行错误: ${error.message}`)
      console.error('测试4执行错误:', error)
    }
    
    this.testResults.push(testResult)
    console.log(`测试4结果: ${testResult.passed ? '✅ 通过' : '❌ 失败'}`)
  }

  // 生成最终报告
  generateFinalReport() {
    console.log('\n📊 ===== 最终修复验证报告 =====')
    
    const passedTests = this.testResults.filter(test => test.passed).length
    const totalTests = this.testResults.length
    
    console.log(`总体结果: ${passedTests}/${totalTests} 测试通过`)
    
    this.testResults.forEach((test, index) => {
      console.log(`\n${index + 1}. ${test.name}: ${test.passed ? '✅ 通过' : '❌ 失败'}`)
      test.details.forEach(detail => {
        console.log(`   ${detail}`)
      })
    })
    
    if (passedTests === totalTests) {
      console.log('\n🎉 ===== 修复验证成功！=====')
      console.log('✅ 记忆方法弹窗第3次错误显示问题已完全修复')
      console.log('✅ loadCurrentWord保护机制正常工作')
      console.log('✅ 弹窗显示持久性良好')
    } else {
      console.log('\n⚠️ ===== 修复验证部分失败 =====')
      console.log('需要进一步检查和修复的问题:')
      
      this.testResults.filter(test => !test.passed).forEach(test => {
        console.log(`- ${test.name}`)
      })
    }
    
    console.log('\n🔧 快速修复建议:')
    console.log('1. 如果测试2失败，检查onSubmitDictation中的异步逻辑')
    console.log('2. 如果测试3失败，检查loadCurrentWord中的状态保护逻辑')
    console.log('3. 如果测试4失败，检查showMemoryTipModal的实现')
    console.log('4. 检查WXML中的wx:if条件和CSS样式')
  }

  // 快速修复尝试
  async quickFix() {
    console.log('\n🔧 执行快速修复...')
    
    try {
      // 强制重置并显示弹窗
      this.page.setData({
        dictationAttempts: 3,
        showMemoryTip: true,
        memoryTipContent: '快速修复测试内容',
        memoryTipLoading: false,
        mode: 'dictation'
      })
      
      console.log('✅ 快速修复完成，弹窗应该现在显示')
      
      // 验证修复结果
      setTimeout(() => {
        const modalElement = document.querySelector('.memory-tip-modal')
        if (modalElement) {
          console.log('✅ 快速修复成功，弹窗已显示')
        } else {
          console.log('❌ 快速修复失败，弹窗仍未显示')
        }
      }, 200)
      
    } catch (error) {
      console.error('❌ 快速修复失败:', error)
    }
  }

  // 清理测试环境
  cleanup() {
    console.log('🧹 清理测试环境...')
    
    // 恢复原始方法
    if (this.page && this.originalMethods.setData) {
      this.page.setData = this.originalMethods.setData
    }
    
    // 重置状态
    if (this.page) {
      this.page.setData({
        dictationAttempts: 0,
        showMemoryTip: false,
        memoryTipContent: '',
        memoryTipLoading: false,
        dictationInput: ''
      })
    }
    
    console.log('✅ 测试环境清理完成')
  }
}

// 创建全局验证器实例
window.finalMemoryTipValidator = new FinalMemoryTipFixValidator()

// 快捷方法
window.runFinalFixValidation = () => window.finalMemoryTipValidator.runCompleteFixValidation()
window.quickFixMemoryTip = () => window.finalMemoryTipValidator.quickFix()
window.cleanupMemoryTipTest = () => window.finalMemoryTipValidator.cleanup()

console.log('🎯 记忆方法弹窗最终修复验证器已加载!')
console.log('📖 使用方法:')
console.log('   runFinalFixValidation()  - 运行完整修复验证')
console.log('   quickFixMemoryTip()      - 快速修复尝试')
console.log('   cleanupMemoryTipTest()   - 清理测试环境')
console.log('\n💡 推荐测试流程:')
console.log('   1. runFinalFixValidation() - 验证修复效果')
console.log('   2. 如果失败，运行 quickFixMemoryTip()')
console.log('   3. 测试完成后运行 cleanupMemoryTipTest()')