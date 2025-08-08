/**
 * 记忆方法弹窗实时调试脚本
 * 专门用于监控第3次错误时的状态变化和弹窗显示问题
 */

// 实时状态监控器
class MemoryTipDebugger {
  constructor() {
    this.page = null
    this.originalSetData = null
    this.originalShowMemoryTipModal = null
    this.stateHistory = []
    this.isMonitoring = false
  }

  // 开始监控
  startMonitoring() {
    console.log('🔍 开始实时监控记忆方法弹窗状态...')
    
    this.page = getCurrentPages()[getCurrentPages().length - 1]
    if (!this.page) {
      console.error('❌ 无法获取当前页面')
      return
    }

    // 备份原始方法
    this.originalSetData = this.page.setData
    this.originalShowMemoryTipModal = this.page.showMemoryTipModal

    // 拦截setData方法
    this.page.setData = (data, callback) => {
      this.logStateChange('setData调用', data)
      return this.originalSetData.call(this.page, data, callback)
    }

    // 拦截showMemoryTipModal方法
    this.page.showMemoryTipModal = async () => {
      console.log('🧠 [INTERCEPTED] showMemoryTipModal被调用')
      this.logCurrentState('showMemoryTipModal调用前')
      
      const result = await this.originalShowMemoryTipModal.call(this.page)
      
      this.logCurrentState('showMemoryTipModal调用后')
      return result
    }

    this.isMonitoring = true
    console.log('✅ 监控已启动，现在可以进行第3次错误测试')
  }

  // 停止监控
  stopMonitoring() {
    if (!this.isMonitoring) return

    console.log('🛑 停止监控')
    
    // 恢复原始方法
    if (this.page && this.originalSetData) {
      this.page.setData = this.originalSetData
    }
    if (this.page && this.originalShowMemoryTipModal) {
      this.page.showMemoryTipModal = this.originalShowMemoryTipModal
    }

    this.isMonitoring = false
    console.log('📊 状态变化历史:', this.stateHistory)
  }

  // 记录状态变化
  logStateChange(action, data) {
    const timestamp = new Date().toLocaleTimeString()
    const relevantData = this.extractRelevantData(data)
    
    if (Object.keys(relevantData).length > 0) {
      const stateRecord = {
        timestamp,
        action,
        changes: relevantData,
        currentState: this.getCurrentRelevantState()
      }
      
      this.stateHistory.push(stateRecord)
      
      console.log(`📝 [${timestamp}] ${action}:`, relevantData)
      
      // 特别关注关键状态变化
      if (relevantData.dictationAttempts || relevantData.showMemoryTip !== undefined) {
        console.log('🚨 关键状态变化检测到!')
        this.logCurrentState('关键状态变化后')
      }
    }
  }

  // 提取相关数据
  extractRelevantData(data) {
    const relevantKeys = [
      'dictationAttempts', 'showMemoryTip', 'memoryTipContent', 
      'memoryTipLoading', 'mode', 'dictationInput'
    ]
    
    const relevant = {}
    for (const key of relevantKeys) {
      if (data && data.hasOwnProperty(key)) {
        relevant[key] = data[key]
      }
    }
    
    return relevant
  }

  // 获取当前相关状态
  getCurrentRelevantState() {
    if (!this.page) return {}
    
    return {
      dictationAttempts: this.page.data.dictationAttempts,
      maxAttempts: this.page.data.maxAttempts,
      showMemoryTip: this.page.data.showMemoryTip,
      memoryTipContent: this.page.data.memoryTipContent ? '有内容' : '无内容',
      memoryTipLoading: this.page.data.memoryTipLoading,
      mode: this.page.data.mode,
      currentWord: this.page.data.currentWord?.word
    }
  }

  // 记录当前状态
  logCurrentState(context) {
    const state = this.getCurrentRelevantState()
    console.log(`📊 [${context}] 当前状态:`, state)
    
    // 检查DOM元素
    setTimeout(() => {
      const modalExists = !!document.querySelector('.memory-tip-modal')
      console.log(`🔍 [${context}] DOM检查: memory-tip-modal存在=${modalExists}`)
    }, 100)
  }

  // 强制显示弹窗并监控
  async forceShowWithMonitoring() {
    console.log('🔧 强制显示弹窗并监控过程...')
    
    this.logCurrentState('强制显示前')
    
    // 设置必要状态
    this.page.setData({
      dictationAttempts: 3,
      showMemoryTip: true,
      memoryTipContent: '测试记忆方法内容'
    })
    
    this.logCurrentState('强制设置状态后')
    
    // 等待渲染
    await new Promise(resolve => setTimeout(resolve, 500))
    
    this.logCurrentState('等待渲染后')
  }

  // 模拟第3次错误
  async simulateThirdError() {
    console.log('🎯 模拟第3次错误流程...')
    
    // 重置状态
    this.page.setData({
      dictationAttempts: 2,
      dictationInput: 'wrong',
      showMemoryTip: false
    })
    
    this.logCurrentState('重置状态后')
    
    // 模拟提交错误答案
    console.log('📝 模拟提交第3次错误答案...')
    this.page.onSubmitDictation()
    
    // 等待处理完成
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    this.logCurrentState('第3次错误处理后')
  }

  // 生成诊断报告
  generateDiagnosticReport() {
    console.log('\n📋 ===== 记忆方法弹窗诊断报告 =====')
    
    const currentState = this.getCurrentRelevantState()
    console.log('1. 当前状态:', currentState)
    
    // 检查关键条件
    const diagnostics = {
      '尝试次数达到上限': currentState.dictationAttempts >= currentState.maxAttempts,
      'showMemoryTip为true': currentState.showMemoryTip === true,
      '在默写模式': currentState.mode === 'dictation',
      '有记忆内容': currentState.memoryTipContent !== '无内容'
    }
    
    console.log('2. 关键条件检查:')
    for (const [condition, passed] of Object.entries(diagnostics)) {
      console.log(`   ${passed ? '✅' : '❌'} ${condition}: ${passed}`)
    }
    
    // DOM检查
    const modalElement = document.querySelector('.memory-tip-modal')
    console.log('3. DOM检查:')
    console.log(`   memory-tip-modal元素: ${modalElement ? '存在' : '不存在'}`)
    if (modalElement) {
      const styles = window.getComputedStyle(modalElement)
      console.log(`   display: ${styles.display}`)
      console.log(`   visibility: ${styles.visibility}`)
      console.log(`   z-index: ${styles.zIndex}`)
    }
    
    // 状态变化历史
    console.log('4. 最近5次状态变化:')
    const recentHistory = this.stateHistory.slice(-5)
    recentHistory.forEach((record, index) => {
      console.log(`   ${index + 1}. [${record.timestamp}] ${record.action}:`, record.changes)
    })
    
    console.log('\n🔧 建议的修复步骤:')
    if (!currentState.showMemoryTip) {
      console.log('   1. showMemoryTip状态未设置，检查onSubmitDictation逻辑')
    }
    if (currentState.mode !== 'dictation') {
      console.log('   2. 页面不在默写模式，检查模式切换逻辑')
    }
    if (!modalElement) {
      console.log('   3. DOM元素未渲染，检查WXML条件和CSS样式')
    }
    
    console.log('\n===== 诊断报告结束 =====')
  }
}

// 创建全局调试器实例
window.memoryTipDebugger = new MemoryTipDebugger()

// 快捷方法
window.startMemoryTipDebug = () => window.memoryTipDebugger.startMonitoring()
window.stopMemoryTipDebug = () => window.memoryTipDebugger.stopMonitoring()
window.debugMemoryTipReport = () => window.memoryTipDebugger.generateDiagnosticReport()
window.forceMemoryTipShow = () => window.memoryTipDebugger.forceShowWithMonitoring()
window.simulateThirdError = () => window.memoryTipDebugger.simulateThirdError()

console.log('🚀 记忆方法弹窗实时调试器已加载!')
console.log('📖 使用方法:')
console.log('   startMemoryTipDebug()     - 开始监控')
console.log('   stopMemoryTipDebug()      - 停止监控')
console.log('   debugMemoryTipReport()    - 生成诊断报告')
console.log('   forceMemoryTipShow()      - 强制显示弹窗')
console.log('   simulateThirdError()      - 模拟第3次错误')
console.log('\n💡 建议流程:')
console.log('   1. 先运行 startMemoryTipDebug()')
console.log('   2. 进行第3次错误测试')
console.log('   3. 运行 debugMemoryTipReport() 查看诊断')
console.log('   4. 运行 stopMemoryTipDebug() 停止监控')