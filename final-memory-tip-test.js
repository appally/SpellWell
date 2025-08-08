/**
 * 记忆方法弹窗最终测试脚本（微信小程序兼容版本）
 * 用于验证所有修复措施是否生效
 * 
 * 使用方法：
 * 1. 在微信开发者工具控制台中运行此脚本
 * 2. 调用 memoryTipTest.quick() 进行快速测试
 * 3. 调用 memoryTipTest.full() 进行完整测试
 * 4. 调用 memoryTipTest.manual.check() 检查当前状态
 */

(function() {
  'use strict'
  
  // 获取当前页面实例
  const page = getCurrentPages()[getCurrentPages().length - 1]
  
  if (!page) {
    console.error('❌ 无法获取当前页面实例')
    return
  }
  
  console.log('📱 记忆方法弹窗测试脚本已加载（微信小程序兼容版本）')
  
  /**
   * 全面的弹窗状态检查（微信小程序兼容版本）
   */
  function comprehensiveModalCheck() {
    console.log('\n=== 🔍 全面弹窗状态检查 ===')
    
    // 1. 数据层检查
    const pageInstance = getCurrentPages()[getCurrentPages().length - 1]
    const data = pageInstance.data
    
    console.log('📊 数据层状态:')
    console.log('  - showMemoryTip:', data.showMemoryTip)
    console.log('  - memoryTipContent:', data.memoryTipContent ? '已设置' : '未设置')
    console.log('  - memoryTipLoading:', data.memoryTipLoading)
    console.log('  - currentWord:', data.currentWord?.word || '无')
    
    const dataState = {
      showMemoryTip: data.showMemoryTip,
      hasContent: !!data.memoryTipContent,
      loading: data.memoryTipLoading,
      currentWord: data.currentWord?.word
    }
    
    console.log('📊 [数据层状态]:', dataState)
    
    return new Promise((resolve) => {
      // DOM层检查（使用微信小程序API）
      const query = wx.createSelectorQuery()
      query.select('.memory-tip-modal').boundingClientRect((rect) => {
        const domState = {
          modalExists: !!rect,
          isVisible: rect ? (rect.width > 0 && rect.height > 0) : false,
          width: rect ? rect.width : 0,
          height: rect ? rect.height : 0,
          top: rect ? rect.top : 0,
          left: rect ? rect.left : 0
        }
        
        console.log('🏗️ [DOM层状态]:', domState)
        
        // 容器检查
        const containerQuery = wx.createSelectorQuery()
        containerQuery.select('.memory-tip-container').boundingClientRect((containerRect) => {
          const containerState = {
            containerExists: !!containerRect,
            containerVisible: containerRect ? (containerRect.width > 0 && containerRect.height > 0) : false,
            containerWidth: containerRect ? containerRect.width : 0,
            containerHeight: containerRect ? containerRect.height : 0
          }
          
          console.log('📦 [容器状态]:', containerState)
          
          // 综合判断
          const isFullyWorking = dataState.showMemoryTip && 
                                dataState.hasContent && 
                                domState.modalExists && 
                                domState.isVisible && 
                                containerState.containerExists && 
                                containerState.containerVisible
          
          console.log(isFullyWorking ? '✅ [综合判断] 弹窗完全正常' : '❌ [综合判断] 弹窗存在问题')
          
          resolve({
            dataState,
            domState,
            containerState,
            isFullyWorking
          })
        }).exec()
      }).exec()
    })
  }
  
  /**
   * 模拟默写错误流程
   */
  async function simulateDictationError() {
    console.log('\n📝 模拟默写错误流程...')
    
    const pageInstance = getCurrentPages()[getCurrentPages().length - 1]
    
    // 确保有当前单词
    if (!pageInstance.data.currentWord) {
      console.log('⚠️ 没有当前单词，尝试加载...')
      if (typeof pageInstance.loadCurrentWord === 'function') {
        await pageInstance.loadCurrentWord()
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
    
    // 设置默写模式和达到最大错误次数
    pageInstance.setData({
      mode: 'dictation',
      dictationAttempts: pageInstance.data.maxAttempts || 3,
      dictationInput: 'wrong_answer'
    })
    
    console.log('✅ 模拟设置完成，当前单词:', pageInstance.data.currentWord?.word)
    
    // 触发提交默写（这应该会显示记忆方法弹窗）
    if (typeof pageInstance.onSubmitDictation === 'function') {
      await pageInstance.onSubmitDictation()
    } else {
      console.warn('⚠️ onSubmitDictation 方法不存在')
    }
  }
  
  /**
   * 压力测试
   */
  async function stressTest() {
    console.log('\n💪 压力测试开始...')
    
    const pageInstance = getCurrentPages()[getCurrentPages().length - 1]
    
    for (let i = 0; i < 5; i++) {
      console.log(`\n--- 第${i + 1}次压力测试 ---`)
      
      // 重置状态
      pageInstance.setData({
        showMemoryTip: false,
        memoryTipContent: '',
        memoryTipLoading: false
      })
      
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // 触发显示
      if (typeof pageInstance.showMemoryTipModal === 'function') {
        await pageInstance.showMemoryTipModal()
      }
      
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // 检查状态
      const result = await comprehensiveModalCheck()
      if (!result.isFullyWorking) {
        console.warn(`⚠️ [压力测试] 第${i + 1}次触发失败`)
        
        // 尝试强制修复
        if (typeof pageInstance.forceCreateMemoryTipModal === 'function') {
          pageInstance.forceCreateMemoryTipModal()
          await new Promise(resolve => setTimeout(resolve, 300))
          
          const retryResult = await comprehensiveModalCheck()
          if (retryResult.isFullyWorking) {
            console.log(`✅ [压力测试] 第${i + 1}次强制修复成功`)
          }
        }
      } else {
        console.log(`✅ [压力测试] 第${i + 1}次测试成功`)
      }
    }
    
    console.log('💪 压力测试完成')
  }
  
  /**
   * 边界条件测试
   */
  async function boundaryTest() {
    console.log('\n🔬 边界条件测试...')
    
    const pageInstance = getCurrentPages()[getCurrentPages().length - 1]
    
    // 测试1: 无当前单词情况
    console.log('\n--- 测试1: 无当前单词情况 ---')
    const originalWord = pageInstance.data.currentWord
    pageInstance.setData({ currentWord: null })
    
    try {
      if (typeof pageInstance.showMemoryTipModal === 'function') {
        await pageInstance.showMemoryTipModal()
      }
      await new Promise(resolve => setTimeout(resolve, 300))
      await comprehensiveModalCheck()
    } catch (error) {
      console.log('🔬 [边界测试] 无单词情况处理:', error.message)
    }
    
    // 恢复原始单词
    pageInstance.setData({ currentWord: originalWord })
    
    // 测试2: 网络错误模拟
    console.log('\n--- 测试2: 网络错误降级处理 ---')
    pageInstance.setData({
      memoryTipContent: '',
      memoryTipLoading: true
    })
    
    if (typeof pageInstance.showMemoryTipModal === 'function') {
      await pageInstance.showMemoryTipModal()
    }
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const result = await comprehensiveModalCheck()
    if (result.isFullyWorking) {
      console.log('✅ [边界测试] 网络错误降级处理成功')
    } else {
      console.log('❌ [边界测试] 网络错误降级处理失败')
    }
    
    console.log('🔬 边界条件测试完成')
  }
  
  /**
   * 主要测试函数
   */
  async function runMainTest() {
    console.log('\n🚀 开始主要测试流程...')
    
    try {
      // 1. 初始状态检查
      console.log('\n=== 1. 初始状态检查 ===')
      await comprehensiveModalCheck()
      
      // 2. 模拟默写错误流程
      console.log('\n=== 2. 模拟默写错误流程 ===')
      await simulateDictationError()
      
      // 等待弹窗显示
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 3. 压力测试
      console.log('\n=== 3. 压力测试 ===')
      await stressTest()
      
      // 4. 边界条件测试
      console.log('\n=== 4. 边界条件测试 ===')
      await boundaryTest()
      
      // 5. 最终状态检查
      console.log('\n=== 5. 最终状态检查 ===')
      const finalResult = await comprehensiveModalCheck()
      
      console.log('\n🎉 [主测试] 测试完成')
      return finalResult.isFullyWorking
      
    } catch (error) {
      console.error('❌ [主测试] 测试过程中出现错误:', error)
      return false
    }
  }
  
  // 导出测试接口
  window.memoryTipTest = {
    // 快速测试
    quick: async () => {
      console.log('⚡ 快速测试开始')
      page.setData({
        showMemoryTip: true,
        memoryTipContent: '快速测试内容'
      })
      if (typeof page.showMemoryTipModal === 'function') {
        page.showMemoryTipModal()
      }
      setTimeout(async () => await comprehensiveModalCheck(), 500)
    },
    
    // 完整测试
    full: runMainTest,
    
    // 强制测试
    force: () => {
      console.log('🔧 强制显示测试')
      page.setData({
        showMemoryTip: true,
        memoryTipContent: '强制测试内容：这是一个测试记忆方法。',
        memoryTipLoading: false
      })
      if (typeof page.forceCreateMemoryTipModal === 'function') {
        page.forceCreateMemoryTipModal()
      } else {
        console.warn('⚠️ forceCreateMemoryTipModal 方法不存在')
        if (typeof page.showMemoryTipModal === 'function') {
          page.showMemoryTipModal()
        }
      }
    },
    
    // 重置测试环境
    reset: () => {
      console.log('🔄 重置测试环境')
      page.setData({
        showMemoryTip: false,
        memoryTipContent: '',
        memoryTipLoading: false,
        dictationAttempts: 0,
        dictationInput: ''
      })
    },
    
    // 手动测试接口
    manual: {
      // 检查当前状态
      check: async () => {
        console.log('🔍 手动检查当前状态')
        return await comprehensiveModalCheck()
      },
      
      // 强制显示弹窗
      show: () => {
        console.log('👆 手动显示弹窗')
        page.setData({ showMemoryTip: true })
        if (typeof page.showMemoryTipModal === 'function') {
          page.showMemoryTipModal()
        }
      },
      
      // 强制隐藏弹窗
      hide: () => {
        console.log('👇 手动隐藏弹窗')
        page.setData({ showMemoryTip: false })
      },
      
      // 检查DOM（微信小程序兼容版本）
      checkDOM: () => {
        const query = wx.createSelectorQuery()
        query.select('.memory-tip-modal').boundingClientRect((rect) => {
          console.log('🏗️ DOM检查结果:', {
            exists: !!rect,
            width: rect ? rect.width : 0,
            height: rect ? rect.height : 0,
            top: rect ? rect.top : 0,
            left: rect ? rect.left : 0,
            visible: rect ? (rect.width > 0 && rect.height > 0) : false
          })
        }).exec()
      },
      
      // 强制创建弹窗（使用页面方法）
      forceCreate: () => {
        if (typeof page.forceCreateMemoryTipModal === 'function') {
          page.forceCreateMemoryTipModal()
          console.log('🔧 调用强制创建方法')
        } else {
          console.log('❌ 找不到强制创建方法')
        }
      }
    }
  }
  
  console.log('✅ 测试接口已准备就绪')
  console.log('💡 使用方法:')
  console.log('  - memoryTipTest.quick() // 快速测试')
  console.log('  - memoryTipTest.full() // 完整测试')
  console.log('  - memoryTipTest.force() // 强制测试')
  console.log('  - memoryTipTest.manual.check() // 检查状态')
  console.log('  - memoryTipTest.manual.show() // 手动显示')
  console.log('  - memoryTipTest.manual.hide() // 手动隐藏')
  
})()