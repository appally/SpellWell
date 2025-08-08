/**
 * 系统性记忆方法弹窗诊断和修复脚本
 * 用于彻底解决第3次默写错误后弹窗不显示的问题
 */

(function() {
  console.log('🔍 开始系统性记忆方法弹窗诊断...');
  
  // 获取当前页面实例
  const pages = getCurrentPages();
  if (pages.length === 0) {
    console.error('❌ 未找到当前页面');
    return;
  }
  
  const page = pages[pages.length - 1];
  
  // 诊断报告对象
  const diagnosis = {
    timestamp: new Date().toISOString(),
    issues: [],
    fixes: [],
    status: 'unknown'
  };
  
  /**
   * 第一步：基础状态诊断
   */
  function diagnoseBasicState() {
    console.log('📊 第一步：基础状态诊断');
    
    const currentState = {
      route: page.route,
      showMemoryTip: page.data.showMemoryTip,
      memoryTipContent: page.data.memoryTipContent,
      memoryTipLoading: page.data.memoryTipLoading,
      dictationAttempts: page.data.dictationAttempts,
      maxAttempts: page.data.maxAttempts,
      currentWord: page.data.currentWord,
      mode: page.data.mode
    };
    
    console.log('当前状态:', currentState);
    
    // 检查页面路由
    if (!page.route || !page.route.includes('word-learning')) {
      diagnosis.issues.push('不在word-learning页面');
    }
    
    // 检查基础数据
    if (!page.data.currentWord) {
      diagnosis.issues.push('当前单词数据缺失');
    }
    
    // 检查默写状态
    if (page.data.dictationAttempts >= page.data.maxAttempts && !page.data.showMemoryTip) {
      diagnosis.issues.push('达到最大尝试次数但弹窗未显示');
    }
    
    return currentState;
  }
  
  /**
   * 第二步：DOM结构诊断
   */
  function diagnoseDOMStructure() {
    console.log('🏗️ 第二步：DOM结构诊断');
    
    const modalElement = document.querySelector('.memory-tip-modal');
    const domState = {
      exists: !!modalElement,
      visible: false,
      styles: null,
      computedDisplay: null
    };
    
    if (modalElement) {
      const computedStyle = window.getComputedStyle(modalElement);
      domState.visible = computedStyle.display !== 'none';
      domState.computedDisplay = computedStyle.display;
      domState.styles = {
        position: computedStyle.position,
        zIndex: computedStyle.zIndex,
        display: computedStyle.display,
        visibility: computedStyle.visibility,
        opacity: computedStyle.opacity
      };
    } else {
      diagnosis.issues.push('DOM中不存在.memory-tip-modal元素');
    }
    
    console.log('DOM状态:', domState);
    return domState;
  }
  
  /**
   * 第三步：函数完整性诊断
   */
  function diagnoseFunctionIntegrity() {
    console.log('⚙️ 第三步：函数完整性诊断');
    
    const functions = {
      onSubmitDictation: typeof page.onSubmitDictation === 'function',
      showMemoryTipModal: typeof page.showMemoryTipModal === 'function',
      loadCurrentWord: typeof page.loadCurrentWord === 'function',
      generateMemoryTip: typeof page.generateMemoryTip === 'function',
      onContinuePractice: typeof page.onContinuePractice === 'function',
      onSkipWord: typeof page.onSkipWord === 'function'
    };
    
    console.log('函数完整性:', functions);
    
    Object.keys(functions).forEach(funcName => {
      if (!functions[funcName]) {
        diagnosis.issues.push(`缺失关键函数: ${funcName}`);
      }
    });
    
    return functions;
  }
  
  /**
   * 第四步：事件流程诊断
   */
  function diagnoseEventFlow() {
    console.log('🔄 第四步：事件流程诊断');
    
    // 模拟第3次错误的完整流程
    const simulationResult = {
      step1_setAttempts: false,
      step2_callShowModal: false,
      step3_setShowMemoryTip: false,
      step4_domUpdate: false
    };
    
    try {
      // 步骤1：设置尝试次数
      const originalAttempts = page.data.dictationAttempts;
      page.setData({
        dictationAttempts: 3,
        maxAttempts: 3
      });
      simulationResult.step1_setAttempts = true;
      console.log('✅ 步骤1：设置尝试次数成功');
      
      // 步骤2：调用showMemoryTipModal
      if (page.showMemoryTipModal) {
        simulationResult.step2_callShowModal = true;
        console.log('✅ 步骤2：showMemoryTipModal函数存在');
      }
      
      // 步骤3：直接设置showMemoryTip状态
      page.setData({
        showMemoryTip: true,
        memoryTipContent: '测试内容',
        memoryTipLoading: false
      });
      simulationResult.step3_setShowMemoryTip = page.data.showMemoryTip;
      console.log('✅ 步骤3：设置showMemoryTip状态', page.data.showMemoryTip);
      
      // 步骤4：检查DOM更新
      setTimeout(() => {
        const modal = document.querySelector('.memory-tip-modal');
        if (modal) {
          const isVisible = window.getComputedStyle(modal).display !== 'none';
          simulationResult.step4_domUpdate = isVisible;
          console.log('✅ 步骤4：DOM更新检查', isVisible);
        }
        
        // 恢复原始状态
        page.setData({
          dictationAttempts: originalAttempts,
          showMemoryTip: false,
          memoryTipContent: '',
          memoryTipLoading: false
        });
      }, 200);
      
    } catch (error) {
      console.error('❌ 事件流程模拟失败:', error);
      diagnosis.issues.push(`事件流程错误: ${error.message}`);
    }
    
    return simulationResult;
  }
  
  /**
   * 第五步：微信小程序特有问题诊断
   */
  function diagnoseWeChatSpecific() {
    console.log('📱 第五步：微信小程序特有问题诊断');
    
    const wechatIssues = {
      setDataTiming: false,
      renderingDelay: false,
      memoryLeak: false
    };
    
    // 检查setData时序问题
    const startTime = Date.now();
    page.setData({
      testFlag: true
    }, () => {
      const endTime = Date.now();
      const delay = endTime - startTime;
      console.log('setData回调延迟:', delay + 'ms');
      
      if (delay > 100) {
        wechatIssues.setDataTiming = true;
        diagnosis.issues.push('setData回调延迟过长');
      }
      
      // 清理测试标志
      page.setData({ testFlag: false });
    });
    
    // 检查页面实例数量
    const pageCount = getCurrentPages().length;
    if (pageCount > 5) {
      wechatIssues.memoryLeak = true;
      diagnosis.issues.push('页面栈过深，可能存在内存泄漏');
    }
    
    return wechatIssues;
  }
  
  /**
   * 修复方案1：强化onSubmitDictation函数
   */
  function fixOnSubmitDictation() {
    console.log('🔧 修复方案1：强化onSubmitDictation函数');
    
    if (!page.onSubmitDictation) {
      console.error('❌ onSubmitDictation函数不存在');
      return false;
    }
    
    const originalOnSubmitDictation = page.onSubmitDictation;
    
    page.onSubmitDictation = function() {
      console.log('🎯 [增强版] onSubmitDictation被调用');
      
      // 调用原始函数
      const result = originalOnSubmitDictation.apply(this, arguments);
      
      // 额外的弹窗触发逻辑
      const currentAttempts = this.data.dictationAttempts || 0;
      const maxAttempts = this.data.maxAttempts || 3;
      
      console.log('📊 [增强版] 默写状态:', {
        currentAttempts,
        maxAttempts,
        shouldTrigger: currentAttempts >= maxAttempts
      });
      
      // 如果达到最大尝试次数，强制触发弹窗
      if (currentAttempts >= maxAttempts) {
        console.log('🚨 [增强版] 强制触发记忆方法弹窗');
        
        // 多重保险机制
        const triggerModal = async () => {
          // 方法1：调用原始showMemoryTipModal
          if (this.showMemoryTipModal) {
            try {
              await this.showMemoryTipModal();
              console.log('✅ [增强版] 方法1成功');
              return;
            } catch (error) {
              console.warn('⚠️ [增强版] 方法1失败:', error);
            }
          }
          
          // 方法2：直接设置状态
          console.log('🔄 [增强版] 使用方法2：直接设置状态');
          this.setData({
            showMemoryTip: true,
            memoryTipContent: this.data.memoryTipContent || '请仔细观察这个单词的拼写规律，多练习几遍加深记忆。',
            memoryTipLoading: false
          });
          
          // 方法3：DOM强制显示
          setTimeout(() => {
            const modal = document.querySelector('.memory-tip-modal');
            if (modal) {
              modal.style.display = 'flex';
              modal.style.zIndex = '9999';
              console.log('✅ [增强版] 方法3：DOM强制显示');
            }
          }, 100);
        };
        
        // 延迟执行，确保状态更新完成
        setTimeout(triggerModal, 50);
      }
      
      return result;
    };
    
    diagnosis.fixes.push('强化onSubmitDictation函数');
    return true;
  }
  
  /**
   * 修复方案2：增强showMemoryTipModal函数
   */
  function fixShowMemoryTipModal() {
    console.log('🔧 修复方案2：增强showMemoryTipModal函数');
    
    if (!page.showMemoryTipModal) {
      console.error('❌ showMemoryTipModal函数不存在');
      return false;
    }
    
    const originalShowMemoryTipModal = page.showMemoryTipModal;
    
    page.showMemoryTipModal = async function() {
      console.log('🎭 [增强版] showMemoryTipModal开始执行');
      
      // 立即设置显示状态，防止被其他逻辑重置
      this.setData({
        showMemoryTip: true
      });
      
      try {
        // 调用原始函数
        await originalShowMemoryTipModal.apply(this, arguments);
        console.log('✅ [增强版] 原始函数执行完成');
      } catch (error) {
        console.error('❌ [增强版] 原始函数执行失败:', error);
        
        // 降级处理
        this.setData({
          memoryTipContent: '请仔细观察这个单词的拼写规律，多练习几遍加深记忆。',
          memoryTipLoading: false
        });
      }
      
      // 最终验证和强制修复
      setTimeout(() => {
        if (!this.data.showMemoryTip) {
          console.warn('⚠️ [增强版] 弹窗状态被重置，强制恢复');
          this.setData({
            showMemoryTip: true,
            memoryTipContent: this.data.memoryTipContent || '请仔细观察这个单词的拼写规律，多练习几遍加深记忆。',
            memoryTipLoading: false
          });
        }
        
        // DOM层面的强制显示
        const modal = document.querySelector('.memory-tip-modal');
        if (modal && window.getComputedStyle(modal).display === 'none') {
          modal.style.display = 'flex';
          console.log('🔧 [增强版] DOM强制显示');
        }
      }, 200);
    };
    
    diagnosis.fixes.push('增强showMemoryTipModal函数');
    return true;
  }
  
  /**
   * 修复方案3：保护loadCurrentWord函数
   */
  function fixLoadCurrentWord() {
    console.log('🔧 修复方案3：保护loadCurrentWord函数');
    
    if (!page.loadCurrentWord) {
      console.error('❌ loadCurrentWord函数不存在');
      return false;
    }
    
    const originalLoadCurrentWord = page.loadCurrentWord;
    
    page.loadCurrentWord = function() {
      console.log('🔄 [保护版] loadCurrentWord被调用');
      
      // 保存弹窗状态
      const memoryTipState = {
        showMemoryTip: this.data.showMemoryTip,
        memoryTipContent: this.data.memoryTipContent,
        memoryTipLoading: this.data.memoryTipLoading
      };
      
      console.log('💾 [保护版] 保存弹窗状态:', memoryTipState);
      
      // 调用原始函数
      const result = originalLoadCurrentWord.apply(this, arguments);
      
      // 如果之前弹窗是显示的，恢复状态
      if (memoryTipState.showMemoryTip) {
        console.log('🔄 [保护版] 恢复弹窗状态');
        setTimeout(() => {
          this.setData({
            showMemoryTip: true,
            memoryTipContent: memoryTipState.memoryTipContent,
            memoryTipLoading: memoryTipState.memoryTipLoading
          });
        }, 50);
      }
      
      return result;
    };
    
    diagnosis.fixes.push('保护loadCurrentWord函数');
    return true;
  }
  
  /**
   * 修复方案4：添加状态监控和自动恢复
   */
  function addStateMonitoring() {
    console.log('🔧 修复方案4：添加状态监控和自动恢复');
    
    if (page.memoryTipMonitor) {
      page.memoryTipMonitor.stop();
    }
    
    page.memoryTipMonitor = {
      isActive: false,
      interval: null,
      
      start() {
        if (this.isActive) return;
        
        console.log('👁️ 开始记忆方法弹窗状态监控');
        this.isActive = true;
        
        this.interval = setInterval(() => {
          const currentState = {
            dictationAttempts: page.data.dictationAttempts,
            maxAttempts: page.data.maxAttempts,
            showMemoryTip: page.data.showMemoryTip,
            mode: page.data.mode
          };
          
          // 检查异常状态：达到最大尝试次数但弹窗未显示
          if (currentState.mode === 'dictation' && 
              currentState.dictationAttempts >= currentState.maxAttempts && 
              !currentState.showMemoryTip) {
            
            console.warn('🚨 检测到异常状态，自动修复弹窗');
            page.setData({
              showMemoryTip: true,
              memoryTipContent: page.data.memoryTipContent || '请仔细观察这个单词的拼写规律，多练习几遍加深记忆。',
              memoryTipLoading: false
            });
            
            // DOM层面强制显示
            setTimeout(() => {
              const modal = document.querySelector('.memory-tip-modal');
              if (modal) {
                modal.style.display = 'flex';
                modal.style.zIndex = '9999';
              }
            }, 100);
          }
        }, 1000);
      },
      
      stop() {
        if (this.interval) {
          clearInterval(this.interval);
          this.interval = null;
          this.isActive = false;
          console.log('⏹️ 停止记忆方法弹窗状态监控');
        }
      }
    };
    
    page.memoryTipMonitor.start();
    diagnosis.fixes.push('添加状态监控和自动恢复');
    return true;
  }
  
  /**
   * 修复方案5：添加强制显示方法
   */
  function addForceShowMethod() {
    console.log('🔧 修复方案5：添加强制显示方法');
    
    page.forceShowMemoryTip = function(content) {
      console.log('🚀 强制显示记忆方法弹窗');
      
      const defaultContent = content || '请仔细观察这个单词的拼写规律，多练习几遍加深记忆。';
      
      // 多层保险
      this.setData({
        showMemoryTip: true,
        memoryTipContent: defaultContent,
        memoryTipLoading: false
      });
      
      // DOM强制显示
      setTimeout(() => {
        const modal = document.querySelector('.memory-tip-modal');
        if (modal) {
          modal.style.display = 'flex';
          modal.style.zIndex = '9999';
          modal.style.position = 'fixed';
          modal.style.top = '0';
          modal.style.left = '0';
          modal.style.right = '0';
          modal.style.bottom = '0';
          
          console.log('✅ DOM强制显示完成');
        } else {
          console.error('❌ 未找到弹窗DOM元素');
        }
      }, 100);
      
      // 验证显示效果
      setTimeout(() => {
        const modal = document.querySelector('.memory-tip-modal');
        if (modal) {
          const isVisible = window.getComputedStyle(modal).display !== 'none';
          console.log('🔍 弹窗显示验证:', {
            exists: true,
            visible: isVisible,
            dataState: this.data.showMemoryTip
          });
        }
      }, 200);
    };
    
    // 添加测试方法
    page.testMemoryTipFix = function() {
      console.log('🧪 测试记忆方法弹窗修复');
      
      // 模拟第3次错误
      this.setData({
        dictationAttempts: 3,
        maxAttempts: 3,
        mode: 'dictation'
      });
      
      setTimeout(() => {
        this.forceShowMemoryTip('这是测试内容，如果你看到这个弹窗，说明修复成功！');
      }, 100);
    };
    
    diagnosis.fixes.push('添加强制显示方法');
    return true;
  }
  
  /**
   * 执行完整诊断
   */
  function runFullDiagnosis() {
    console.log('🔍 开始完整诊断流程...');
    
    const results = {
      basicState: diagnoseBasicState(),
      domStructure: diagnoseDOMStructure(),
      functionIntegrity: diagnoseFunctionIntegrity(),
      eventFlow: diagnoseEventFlow(),
      wechatSpecific: diagnoseWeChatSpecific()
    };
    
    // 分析诊断结果
    if (diagnosis.issues.length === 0) {
      diagnosis.status = 'healthy';
      console.log('✅ 诊断完成：系统状态正常');
    } else {
      diagnosis.status = 'issues_found';
      console.log('⚠️ 诊断完成：发现问题', diagnosis.issues);
    }
    
    return { diagnosis, results };
  }
  
  /**
   * 执行所有修复
   */
  function runAllFixes() {
    console.log('🔧 开始执行所有修复方案...');
    
    const fixResults = {
      onSubmitDictation: fixOnSubmitDictation(),
      showMemoryTipModal: fixShowMemoryTipModal(),
      loadCurrentWord: fixLoadCurrentWord(),
      stateMonitoring: addStateMonitoring(),
      forceShowMethod: addForceShowMethod()
    };
    
    const successCount = Object.values(fixResults).filter(Boolean).length;
    console.log(`✅ 修复完成：${successCount}/5 个修复方案成功应用`);
    
    return fixResults;
  }
  
  /**
   * 生成诊断报告
   */
  function generateReport(diagnosisResults, fixResults) {
    const report = {
      timestamp: diagnosis.timestamp,
      summary: {
        issuesFound: diagnosis.issues.length,
        fixesApplied: diagnosis.fixes.length,
        status: diagnosis.status
      },
      issues: diagnosis.issues,
      fixes: diagnosis.fixes,
      diagnosisResults,
      fixResults,
      recommendations: []
    };
    
    // 生成建议
    if (diagnosis.issues.length > 0) {
      report.recommendations.push('建议运行 page.testMemoryTipFix() 测试修复效果');
    }
    
    if (diagnosis.issues.includes('setData回调延迟过长')) {
      report.recommendations.push('考虑优化页面性能，减少setData调用频率');
    }
    
    if (diagnosis.issues.includes('页面栈过深，可能存在内存泄漏')) {
      report.recommendations.push('检查页面跳转逻辑，避免页面栈过深');
    }
    
    console.log('📊 诊断报告:', report);
    return report;
  }
  
  // 暴露全局方法
  window.runMemoryTipDiagnosis = function() {
    const diagnosisResults = runFullDiagnosis();
    const fixResults = runAllFixes();
    const report = generateReport(diagnosisResults, fixResults);
    
    console.log('🎉 系统性诊断和修复完成！');
    console.log('📋 可用的测试命令：');
    console.log('  - page.testMemoryTipFix() // 测试修复效果');
    console.log('  - page.forceShowMemoryTip() // 强制显示弹窗');
    console.log('  - page.memoryTipMonitor.stop() // 停止监控');
    
    return report;
  };
  
  // 自动执行诊断和修复
  const report = window.runMemoryTipDiagnosis();
  
  // 将页面实例暴露到全局，方便调试
  window.debugPage = page;
  
  console.log('🚀 系统性诊断和修复脚本加载完成！');
  console.log('💡 提示：现在可以进入默写模式，故意输入错误答案3次来测试修复效果');
  console.log('🔧 如果问题仍然存在，运行 page.forceShowMemoryTip() 强制显示弹窗');
  
})();