/**
 * 记忆方法弹窗深度分析脚本
 * 全面检查可能导致弹窗不显示的所有原因
 */

// 深度分析器
class DeepMemoryTipAnalyzer {
  constructor() {
    this.page = null
    this.analysisResults = []
    this.domObserver = null
  }

  // 初始化分析器
  init() {
    console.log('🔍 初始化记忆方法弹窗深度分析器...')
    
    this.page = getCurrentPages()[getCurrentPages().length - 1]
    if (!this.page) {
      console.error('❌ 无法获取当前页面')
      return false
    }

    console.log('✅ 分析器初始化完成')
    return true
  }

  // 运行完整的深度分析
  async runCompleteAnalysis() {
    console.log('\n🎯 ===== 开始记忆方法弹窗深度分析 =====')
    
    if (!this.init()) {
      return
    }

    // 分析1: 页面状态分析
    await this.analyzePageState()
    
    // 分析2: DOM结构分析
    await this.analyzeDOMStructure()
    
    // 分析3: CSS样式分析
    await this.analyzeCSSStyles()
    
    // 分析4: 事件绑定分析
    await this.analyzeEventBindings()
    
    // 分析5: 函数执行流程分析
    await this.analyzeFunctionFlow()
    
    // 分析6: 异步时序分析
    await this.analyzeAsyncTiming()
    
    // 分析7: 微信小程序特有问题分析
    await this.analyzeWechatSpecificIssues()
    
    // 生成综合分析报告
    this.generateComprehensiveReport()
  }

  // 分析1: 页面状态分析
  async analyzePageState() {
    console.log('\n📋 分析1: 页面状态分析')
    
    const analysis = {
      name: '页面状态分析',
      issues: [],
      recommendations: []
    }
    
    // 检查关键状态变量
    const state = this.page.data
    const criticalStates = {
      showMemoryTip: state.showMemoryTip,
      memoryTipContent: state.memoryTipContent,
      memoryTipLoading: state.memoryTipLoading,
      dictationAttempts: state.dictationAttempts,
      maxAttempts: state.maxAttempts,
      mode: state.mode,
      currentWord: state.currentWord
    }
    
    console.log('关键状态变量:', criticalStates)
    
    // 状态一致性检查
    if (state.dictationAttempts >= state.maxAttempts && !state.showMemoryTip) {
      analysis.issues.push('状态不一致：已达到最大尝试次数但弹窗未显示')
      analysis.recommendations.push('检查onSubmitDictation函数中的状态更新逻辑')
    }
    
    if (state.showMemoryTip && !state.memoryTipContent) {
      analysis.issues.push('状态不一致：弹窗显示但无内容')
      analysis.recommendations.push('检查showMemoryTipModal函数中的内容生成逻辑')
    }
    
    if (state.mode !== 'dictation' && state.dictationAttempts > 0) {
      analysis.issues.push('状态不一致：非默写模式但有尝试次数记录')
      analysis.recommendations.push('检查模式切换时的状态清理逻辑')
    }
    
    this.analysisResults.push(analysis)
    console.log(`分析1完成: 发现${analysis.issues.length}个问题`)
  }

  // 分析2: DOM结构分析
  async analyzeDOMStructure() {
    console.log('\n📋 分析2: DOM结构分析')
    
    const analysis = {
      name: 'DOM结构分析',
      issues: [],
      recommendations: []
    }
    
    // 检查弹窗DOM元素
    const modalElement = document.querySelector('.memory-tip-modal')
    const overlayElement = document.querySelector('.memory-tip-overlay')
    const contentElement = document.querySelector('.memory-tip-content')
    
    console.log('DOM元素检查:', {
      modal: !!modalElement,
      overlay: !!overlayElement,
      content: !!contentElement
    })
    
    if (!modalElement) {
      analysis.issues.push('DOM中不存在.memory-tip-modal元素')
      analysis.recommendations.push('检查WXML模板中的wx:if条件和元素结构')
    } else {
      // 检查DOM元素的属性
      const modalInfo = {
        className: modalElement.className,
        style: modalElement.getAttribute('style'),
        hidden: modalElement.hidden,
        offsetWidth: modalElement.offsetWidth,
        offsetHeight: modalElement.offsetHeight,
        clientWidth: modalElement.clientWidth,
        clientHeight: modalElement.clientHeight
      }
      
      console.log('弹窗DOM详细信息:', modalInfo)
      
      if (modalElement.offsetWidth === 0 || modalElement.offsetHeight === 0) {
        analysis.issues.push('弹窗DOM元素尺寸为0')
        analysis.recommendations.push('检查CSS样式中的display、width、height属性')
      }
      
      if (modalElement.hidden) {
        analysis.issues.push('弹窗DOM元素被设置为hidden')
        analysis.recommendations.push('检查是否有代码设置了hidden属性')
      }
    }
    
    // 检查父容器
    const pageContainer = document.querySelector('.page')
    if (pageContainer) {
      const containerInfo = {
        overflow: window.getComputedStyle(pageContainer).overflow,
        position: window.getComputedStyle(pageContainer).position,
        zIndex: window.getComputedStyle(pageContainer).zIndex
      }
      console.log('页面容器样式:', containerInfo)
    }
    
    this.analysisResults.push(analysis)
    console.log(`分析2完成: 发现${analysis.issues.length}个问题`)
  }

  // 分析3: CSS样式分析
  async analyzeCSSStyles() {
    console.log('\n📋 分析3: CSS样式分析')
    
    const analysis = {
      name: 'CSS样式分析',
      issues: [],
      recommendations: []
    }
    
    const modalElement = document.querySelector('.memory-tip-modal')
    if (modalElement) {
      const computedStyles = window.getComputedStyle(modalElement)
      const criticalStyles = {
        display: computedStyles.display,
        visibility: computedStyles.visibility,
        opacity: computedStyles.opacity,
        position: computedStyles.position,
        zIndex: computedStyles.zIndex,
        top: computedStyles.top,
        left: computedStyles.left,
        width: computedStyles.width,
        height: computedStyles.height,
        transform: computedStyles.transform,
        pointerEvents: computedStyles.pointerEvents
      }
      
      console.log('弹窗关键CSS样式:', criticalStyles)
      
      // 检查可能导致不显示的样式问题
      if (criticalStyles.display === 'none') {
        analysis.issues.push('CSS display属性为none')
        analysis.recommendations.push('检查CSS规则或内联样式设置')
      }
      
      if (criticalStyles.visibility === 'hidden') {
        analysis.issues.push('CSS visibility属性为hidden')
        analysis.recommendations.push('检查CSS规则中的visibility设置')
      }
      
      if (parseFloat(criticalStyles.opacity) === 0) {
        analysis.issues.push('CSS opacity属性为0')
        analysis.recommendations.push('检查CSS动画或透明度设置')
      }
      
      if (criticalStyles.position === 'fixed' && (criticalStyles.top === 'auto' || criticalStyles.left === 'auto')) {
        analysis.issues.push('固定定位但位置未正确设置')
        analysis.recommendations.push('检查CSS中的top、left属性设置')
      }
      
      const zIndexValue = parseInt(criticalStyles.zIndex)
      if (isNaN(zIndexValue) || zIndexValue < 1000) {
        analysis.issues.push('z-index值过低，可能被其他元素遮挡')
        analysis.recommendations.push('增加z-index值确保弹窗在最上层')
      }
    }
    
    this.analysisResults.push(analysis)
    console.log(`分析3完成: 发现${analysis.issues.length}个问题`)
  }

  // 分析4: 事件绑定分析
  async analyzeEventBindings() {
    console.log('\n📋 分析4: 事件绑定分析')
    
    const analysis = {
      name: '事件绑定分析',
      issues: [],
      recommendations: []
    }
    
    // 检查关键函数是否存在
    const criticalFunctions = [
      'onSubmitDictation',
      'showMemoryTipModal',
      'onCloseMemoryTip',
      'onContinuePractice',
      'onSkipWord'
    ]
    
    criticalFunctions.forEach(funcName => {
      if (typeof this.page[funcName] === 'function') {
        console.log(`✅ ${funcName} 函数存在`)
      } else {
        analysis.issues.push(`${funcName} 函数不存在或不是函数`)
        analysis.recommendations.push(`检查${funcName}函数的定义和绑定`)
      }
    })
    
    // 检查事件绑定
    const modalElement = document.querySelector('.memory-tip-modal')
    if (modalElement) {
      const closeButton = modalElement.querySelector('.close-btn')
      const continueButton = modalElement.querySelector('.continue-btn')
      const skipButton = modalElement.querySelector('.skip-btn')
      
      if (!closeButton) {
        analysis.issues.push('弹窗中缺少关闭按钮')
        analysis.recommendations.push('检查WXML模板中的按钮元素')
      }
      
      if (!continueButton) {
        analysis.issues.push('弹窗中缺少继续练习按钮')
        analysis.recommendations.push('检查WXML模板中的继续按钮')
      }
    }
    
    this.analysisResults.push(analysis)
    console.log(`分析4完成: 发现${analysis.issues.length}个问题`)
  }

  // 分析5: 函数执行流程分析
  async analyzeFunctionFlow() {
    console.log('\n📋 分析5: 函数执行流程分析')
    
    const analysis = {
      name: '函数执行流程分析',
      issues: [],
      recommendations: []
    }
    
    // 模拟函数调用链
    console.log('🔄 模拟第3次错误的函数调用链...')
    
    try {
      // 检查onSubmitDictation函数
      const onSubmitDictation = this.page.onSubmitDictation.toString()
      
      if (!onSubmitDictation.includes('showMemoryTipModal')) {
        analysis.issues.push('onSubmitDictation函数中未调用showMemoryTipModal')
        analysis.recommendations.push('确保在达到最大尝试次数时调用showMemoryTipModal')
      }
      
      if (onSubmitDictation.includes('handleWordCompletion') && onSubmitDictation.includes('newAttempts >= maxAttempts')) {
        analysis.issues.push('在第3次错误时可能同时调用了handleWordCompletion')
        analysis.recommendations.push('避免在显示记忆方法弹窗时调用handleWordCompletion')
      }
      
      // 检查showMemoryTipModal函数
      const showMemoryTipModal = this.page.showMemoryTipModal.toString()
      
      if (!showMemoryTipModal.includes('setData')) {
        analysis.issues.push('showMemoryTipModal函数中未调用setData')
        analysis.recommendations.push('确保函数中正确设置showMemoryTip状态')
      }
      
    } catch (error) {
      analysis.issues.push(`函数分析失败: ${error.message}`)
      analysis.recommendations.push('检查函数定义是否正确')
    }
    
    this.analysisResults.push(analysis)
    console.log(`分析5完成: 发现${analysis.issues.length}个问题`)
  }

  // 分析6: 异步时序分析
  async analyzeAsyncTiming() {
    console.log('\n📋 分析6: 异步时序分析')
    
    const analysis = {
      name: '异步时序分析',
      issues: [],
      recommendations: []
    }
    
    // 模拟异步调用时序
    console.log('⏱️ 测试异步时序问题...')
    
    const startTime = Date.now()
    
    // 测试setData的异步性
    this.page.setData({
      testTimestamp: startTime
    }, () => {
      const callbackTime = Date.now()
      const delay = callbackTime - startTime
      console.log(`setData回调延迟: ${delay}ms`)
      
      if (delay > 100) {
        analysis.issues.push(`setData回调延迟过长: ${delay}ms`)
        analysis.recommendations.push('考虑使用更短的延迟或优化setData调用')
      }
    })
    
    // 测试DOM更新时序
    setTimeout(() => {
      const domUpdateTime = Date.now()
      const totalDelay = domUpdateTime - startTime
      console.log(`DOM更新总延迟: ${totalDelay}ms`)
      
      if (totalDelay > 200) {
        analysis.issues.push(`DOM更新延迟过长: ${totalDelay}ms`)
        analysis.recommendations.push('优化页面渲染性能或增加更长的等待时间')
      }
    }, 150)
    
    this.analysisResults.push(analysis)
    console.log(`分析6完成: 发现${analysis.issues.length}个问题`)
  }

  // 分析7: 微信小程序特有问题分析
  async analyzeWechatSpecificIssues() {
    console.log('\n📋 分析7: 微信小程序特有问题分析')
    
    const analysis = {
      name: '微信小程序特有问题分析',
      issues: [],
      recommendations: []
    }
    
    // 检查微信小程序环境
    if (typeof wx === 'undefined') {
      analysis.issues.push('wx对象不存在，可能不在微信小程序环境中')
      analysis.recommendations.push('确保在微信开发者工具中运行')
    }
    
    // 检查页面栈
    const pages = getCurrentPages()
    console.log(`当前页面栈深度: ${pages.length}`)
    
    if (pages.length > 5) {
      analysis.issues.push('页面栈过深，可能影响性能')
      analysis.recommendations.push('考虑使用redirectTo替代navigateTo')
    }
    
    // 检查数据绑定
    const dataKeys = Object.keys(this.page.data)
    const memoryTipKeys = dataKeys.filter(key => key.includes('memoryTip') || key.includes('MemoryTip'))
    console.log('记忆方法相关数据键:', memoryTipKeys)
    
    if (memoryTipKeys.length === 0) {
      analysis.issues.push('页面data中缺少记忆方法相关字段')
      analysis.recommendations.push('检查页面data初始化')
    }
    
    // 检查WXML编译
    const wxmlElements = document.querySelectorAll('[wx\\:if], [wx\\:for], [wx\\:key]')
    console.log(`WXML指令元素数量: ${wxmlElements.length}`)
    
    this.analysisResults.push(analysis)
    console.log(`分析7完成: 发现${analysis.issues.length}个问题`)
  }

  // 生成综合分析报告
  generateComprehensiveReport() {
    console.log('\n📊 ===== 记忆方法弹窗深度分析报告 =====')
    
    const totalIssues = this.analysisResults.reduce((sum, analysis) => sum + analysis.issues.length, 0)
    const totalRecommendations = this.analysisResults.reduce((sum, analysis) => sum + analysis.recommendations.length, 0)
    
    console.log(`总体概况: 发现${totalIssues}个问题，提供${totalRecommendations}条建议`)
    
    this.analysisResults.forEach((analysis, index) => {
      console.log(`\n${index + 1}. ${analysis.name}:`)
      
      if (analysis.issues.length === 0) {
        console.log('   ✅ 未发现问题')
      } else {
        console.log(`   ❌ 发现${analysis.issues.length}个问题:`)
        analysis.issues.forEach((issue, i) => {
          console.log(`      ${i + 1}. ${issue}`)
        })
      }
      
      if (analysis.recommendations.length > 0) {
        console.log(`   💡 建议:`)
        analysis.recommendations.forEach((rec, i) => {
          console.log(`      ${i + 1}. ${rec}`)
        })
      }
    })
    
    // 生成优先级修复建议
    console.log('\n🎯 ===== 优先级修复建议 =====')
    console.log('1. 高优先级: 检查onSubmitDictation函数中的状态更新和函数调用逻辑')
    console.log('2. 中优先级: 验证WXML模板中的wx:if条件和DOM结构')
    console.log('3. 低优先级: 优化CSS样式和异步时序处理')
    
    console.log('\n🔧 ===== 快速诊断命令 =====')
    console.log('// 检查当前状态')
    console.log('console.log(getCurrentPages()[getCurrentPages().length-1].data)')
    console.log('')
    console.log('// 强制显示弹窗')
    console.log('getCurrentPages()[getCurrentPages().length-1].setData({showMemoryTip: true, memoryTipContent: "测试内容"})')
    console.log('')
    console.log('// 检查DOM元素')
    console.log('console.log(document.querySelector(".memory-tip-modal"))')
  }

  // 实时监控DOM变化
  startDOMMonitoring() {
    console.log('🔍 开始实时监控DOM变化...')
    
    if (this.domObserver) {
      this.domObserver.disconnect()
    }
    
    this.domObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1 && node.classList && node.classList.contains('memory-tip-modal')) {
              console.log('✅ 检测到记忆方法弹窗DOM元素被添加')
            }
          })
          
          mutation.removedNodes.forEach((node) => {
            if (node.nodeType === 1 && node.classList && node.classList.contains('memory-tip-modal')) {
              console.log('⚠️ 检测到记忆方法弹窗DOM元素被移除')
            }
          })
        }
        
        if (mutation.type === 'attributes' && mutation.target.classList && mutation.target.classList.contains('memory-tip-modal')) {
          console.log(`🔄 检测到记忆方法弹窗属性变化: ${mutation.attributeName}`)
        }
      })
    })
    
    this.domObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'hidden']
    })
  }

  // 停止DOM监控
  stopDOMMonitoring() {
    if (this.domObserver) {
      this.domObserver.disconnect()
      this.domObserver = null
      console.log('🛑 已停止DOM监控')
    }
  }

  // 清理分析器
  cleanup() {
    this.stopDOMMonitoring()
    this.analysisResults = []
    console.log('🧹 分析器已清理')
  }
}

// 创建全局分析器实例
window.deepMemoryTipAnalyzer = new DeepMemoryTipAnalyzer()

// 快捷方法
window.runDeepAnalysis = () => window.deepMemoryTipAnalyzer.runCompleteAnalysis()
window.startDOMMonitoring = () => window.deepMemoryTipAnalyzer.startDOMMonitoring()
window.stopDOMMonitoring = () => window.deepMemoryTipAnalyzer.stopDOMMonitoring()
window.cleanupAnalyzer = () => window.deepMemoryTipAnalyzer.cleanup()

console.log('🔍 记忆方法弹窗深度分析器已加载!')
console.log('📖 使用方法:')
console.log('   runDeepAnalysis()     - 运行完整深度分析')
console.log('   startDOMMonitoring()  - 开始实时DOM监控')
console.log('   stopDOMMonitoring()   - 停止DOM监控')
console.log('   cleanupAnalyzer()     - 清理分析器')
console.log('\n💡 推荐使用流程:')
console.log('   1. runDeepAnalysis() - 全面分析问题')
console.log('   2. startDOMMonitoring() - 监控DOM变化')
console.log('   3. 手动触发第3次错误，观察日志')
console.log('   4. stopDOMMonitoring() - 停止监控')
console.log('   5. cleanupAnalyzer() - 清理环境')