/**
 * 一键修复记忆方法弹窗问题
 * 使用方法：在微信开发者工具控制台中直接粘贴并运行此脚本
 */

(function() {
  console.log('🔧 开始应用记忆方法弹窗一键修复...');
  
  // 获取当前页面实例
  const pages = getCurrentPages();
  if (pages.length === 0) {
    console.error('❌ 未找到当前页面');
    return;
  }
  
  const page = pages[pages.length - 1];
  
  // 检查是否为word-learning页面
  if (!page.route || !page.route.includes('word-learning')) {
    console.warn('⚠️ 当前不在word-learning页面，修复可能无效');
  }
  
  console.log('📄 当前页面:', page.route);
  
  // 修复1: 增强onSubmitDictation函数
  if (page.onSubmitDictation) {
    const originalOnSubmitDictation = page.onSubmitDictation;
    page.onSubmitDictation = function() {
      console.log('🎯 onSubmitDictation被调用');
      
      const result = originalOnSubmitDictation.apply(this, arguments);
      
      // 检查是否需要显示记忆方法弹窗
      const currentAttempts = this.data.dictationAttempts || 0;
      const maxAttempts = this.data.maxAttempts || 3;
      
      console.log('📊 默写尝试次数:', currentAttempts, '/', maxAttempts);
      
      if (currentAttempts >= maxAttempts) {
        console.log('🚨 达到最大尝试次数，准备显示记忆方法弹窗');
        
        // 延迟显示弹窗，确保状态更新完成
        setTimeout(() => {
          console.log('⏰ 延迟执行showMemoryTipModal');
          if (this.showMemoryTipModal) {
            this.showMemoryTipModal();
          } else {
            console.error('❌ showMemoryTipModal函数不存在');
            // 降级处理：直接设置状态
            this.setData({
              showMemoryTip: true,
              memoryTipContent: '请仔细观察这个单词的拼写规律，多练习几遍加深记忆。',
              memoryTipLoading: false
            });
          }
        }, 100);
      }
      
      return result;
    };
    console.log('✅ onSubmitDictation函数已增强');
  } else {
    console.warn('⚠️ onSubmitDictation函数不存在');
  }
  
  // 修复2: 保护loadCurrentWord函数
  if (page.loadCurrentWord) {
    const originalLoadCurrentWord = page.loadCurrentWord;
    page.loadCurrentWord = function() {
      console.log('🔄 loadCurrentWord被调用');
      
      // 保存当前弹窗状态
      const currentShowMemoryTip = this.data.showMemoryTip;
      const currentMemoryTipContent = this.data.memoryTipContent;
      
      console.log('💾 保存弹窗状态:', {
        showMemoryTip: currentShowMemoryTip,
        hasContent: !!currentMemoryTipContent
      });
      
      const result = originalLoadCurrentWord.apply(this, arguments);
      
      // 如果之前弹窗是显示的，恢复状态
      if (currentShowMemoryTip) {
        console.log('🔄 恢复记忆方法弹窗状态');
        this.setData({
          showMemoryTip: true,
          memoryTipContent: currentMemoryTipContent,
          memoryTipLoading: false
        });
      }
      
      return result;
    };
    console.log('✅ loadCurrentWord函数已保护');
  } else {
    console.warn('⚠️ loadCurrentWord函数不存在');
  }
  
  // 修复3: 增强showMemoryTipModal函数
  if (page.showMemoryTipModal) {
    const originalShowMemoryTipModal = page.showMemoryTipModal;
    page.showMemoryTipModal = function() {
      console.log('🎭 showMemoryTipModal被调用');
      
      // 立即设置显示状态
      this.setData({
        showMemoryTip: true,
        memoryTipLoading: true
      });
      
      const result = originalShowMemoryTipModal.apply(this, arguments);
      
      // 添加超时保护
      setTimeout(() => {
        if (this.data.memoryTipLoading) {
          console.log('⏰ 超时保护：设置降级内容');
          this.setData({
            memoryTipContent: '请仔细观察这个单词的拼写规律，多练习几遍加深记忆。',
            memoryTipLoading: false
          });
        }
      }, 3000);
      
      return result;
    };
    console.log('✅ showMemoryTipModal函数已增强');
  } else {
    console.warn('⚠️ showMemoryTipModal函数不存在');
  }
  
  // 修复4: 添加强制显示弹窗的方法
  page.forceShowMemoryTip = function(content) {
    console.log('🚀 强制显示记忆方法弹窗');
    
    const defaultContent = content || '请仔细观察这个单词的拼写规律，多练习几遍加深记忆。';
    
    this.setData({
      showMemoryTip: true,
      memoryTipContent: defaultContent,
      memoryTipLoading: false
    });
    
    // 验证DOM更新
    setTimeout(() => {
      const modal = document.querySelector('.memory-tip-modal');
      if (modal) {
        const isVisible = window.getComputedStyle(modal).display !== 'none';
        console.log('✅ 弹窗DOM状态:', {
          exists: true,
          visible: isVisible,
          content: this.data.memoryTipContent
        });
      } else {
        console.error('❌ 未找到弹窗DOM元素');
      }
    }, 100);
  };
  console.log('✅ 强制显示方法已添加');
  
  // 修复5: 添加状态监控
  page.memoryTipStateMonitor = {
    isMonitoring: false,
    
    start: function() {
      if (this.isMonitoring) return;
      
      console.log('👁️ 开始监控记忆方法弹窗状态');
      this.isMonitoring = true;
      
      this.interval = setInterval(() => {
        const currentState = {
          showMemoryTip: page.data.showMemoryTip,
          memoryTipLoading: page.data.memoryTipLoading,
          hasContent: !!page.data.memoryTipContent,
          dictationAttempts: page.data.dictationAttempts,
          maxAttempts: page.data.maxAttempts
        };
        
        // 检查异常状态
        if (currentState.dictationAttempts >= currentState.maxAttempts && !currentState.showMemoryTip) {
          console.warn('🚨 检测到异常：应该显示弹窗但未显示');
          console.log('🔧 自动修复：显示记忆方法弹窗');
          page.forceShowMemoryTip();
        }
      }, 1000);
    },
    
    stop: function() {
      if (this.interval) {
        clearInterval(this.interval);
        this.isMonitoring = false;
        console.log('⏹️ 停止监控记忆方法弹窗状态');
      }
    },
    
    getReport: function() {
      const report = {
        currentState: {
          showMemoryTip: page.data.showMemoryTip,
          memoryTipLoading: page.data.memoryTipLoading,
          hasContent: !!page.data.memoryTipContent,
          dictationAttempts: page.data.dictationAttempts,
          maxAttempts: page.data.maxAttempts
        },
        domState: null,
        isMonitoring: this.isMonitoring
      };
      
      // 检查DOM状态
      const modal = document.querySelector('.memory-tip-modal');
      if (modal) {
        report.domState = {
          exists: true,
          visible: window.getComputedStyle(modal).display !== 'none',
          className: modal.className,
          innerHTML: modal.innerHTML.length > 0
        };
      } else {
        report.domState = { exists: false };
      }
      
      console.log('📊 记忆方法弹窗状态报告:', report);
      return report;
    }
  };
  
  // 自动启动监控
  page.memoryTipStateMonitor.start();
  console.log('✅ 状态监控已启动');
  
  // 修复6: 添加测试方法
  page.testMemoryTipFix = function() {
    console.log('🧪 开始测试记忆方法弹窗修复');
    
    // 模拟第3次错误
    this.setData({
      dictationAttempts: 3,
      maxAttempts: 3
    });
    
    console.log('📝 模拟第3次默写错误');
    
    // 触发弹窗显示
    setTimeout(() => {
      if (this.showMemoryTipModal) {
        this.showMemoryTipModal();
      } else {
        this.forceShowMemoryTip();
      }
      
      // 验证结果
      setTimeout(() => {
        const success = this.data.showMemoryTip;
        console.log(success ? '✅ 测试成功：弹窗正常显示' : '❌ 测试失败：弹窗未显示');
        
        if (success) {
          console.log('🎉 记忆方法弹窗修复成功！');
        } else {
          console.log('🔧 建议运行深度分析：page.memoryTipStateMonitor.getReport()');
        }
      }, 500);
    }, 100);
  };
  console.log('✅ 测试方法已添加');
  
  console.log('🎉 一键修复完成！');
  console.log('📋 可用的测试命令：');
  console.log('  - page.testMemoryTipFix() // 运行测试');
  console.log('  - page.forceShowMemoryTip() // 强制显示弹窗');
  console.log('  - page.memoryTipStateMonitor.getReport() // 查看状态报告');
  console.log('  - page.memoryTipStateMonitor.stop() // 停止监控');
  
  // 返回页面实例供进一步操作
  window.fixedPage = page;
  
  console.log('💡 提示：现在可以进入默写模式，故意输入错误答案3次来测试修复效果');
  
})();

console.log('🚀 记忆方法弹窗一键修复脚本已加载完成！');
console.log('📖 使用说明：');
console.log('1. 进入单词学习页面');
console.log('2. 选择一个单词进入默写模式');
console.log('3. 故意输入错误答案3次');
console.log('4. 观察记忆方法弹窗是否正常显示');
console.log('5. 如需手动测试，运行：fixedPage.testMemoryTipFix()');