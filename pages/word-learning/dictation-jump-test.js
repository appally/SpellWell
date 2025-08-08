/**
 * 默写错误3次跳转魔法老师页面测试脚本
 * 用于验证修改后的逻辑是否正常工作
 * 更新：修复了语法错误后的测试版本
 */

const dictationJumpTest = {
  /**
   * 运行完整测试
   */
  async run() {
    console.log('🧪 开始测试默写错误3次跳转魔法老师页面功能...');
    
    try {
      // 检查当前页面状态
      const currentPages = getCurrentPages();
      const currentPage = currentPages[currentPages.length - 1];
      
      if (!currentPage || currentPage.route !== 'pages/word-learning/word-learning') {
        console.error('❌ 请在单词学习页面运行此测试');
        return false;
      }
      
      // 检查是否有当前单词
      if (!currentPage.data.currentWord) {
        console.error('❌ 当前没有学习单词，请先加载单词');
        return false;
      }
      
      console.log('📝 当前测试单词:', currentPage.data.currentWord.word);
      
      // 模拟3次错误默写
      await this.simulateThreeErrors(currentPage);
      
      console.log('✅ 测试完成');
      return true;
      
    } catch (error) {
      console.error('❌ 测试过程中出现错误:', error);
      return false;
    }
  },
  
  /**
   * 模拟3次错误默写
   */
  async simulateThreeErrors(page) {
    console.log('🎯 开始模拟3次错误默写...');
    
    // 确保在默写模式
    if (page.data.mode !== 'dictation') {
      page.setData({ mode: 'dictation' });
      console.log('🔄 切换到默写模式');
    }
    
    // 重置默写状态
    page.setData({
      dictationAttempts: 0,
      dictationInput: '',
      showHint: false
    });
    
    // 模拟3次错误输入
    for (let i = 1; i <= 3; i++) {
      console.log(`📝 模拟第${i}次错误默写...`);
      
      // 设置错误输入
      const wrongInput = 'wrong' + i;
      page.setData({ dictationInput: wrongInput });
      
      // 等待一下模拟用户输入时间
      await this.sleep(500);
      
      // 调用提交默写方法
      await page.onSubmitDictation();
      
      console.log(`❌ 第${i}次错误默写完成，当前尝试次数: ${page.data.dictationAttempts}`);
      
      // 如果是第3次错误，检查是否跳转
      if (i === 3) {
        console.log('🔍 检查是否触发跳转到魔法老师页面...');
        // 这里应该会触发跳转逻辑
        await this.sleep(1000); // 等待跳转处理
      } else {
        await this.sleep(1000); // 等待处理完成
      }
    }
  },
  
  /**
   * 检查跳转状态
   */
  checkJumpStatus() {
    const currentPages = getCurrentPages();
    const currentPage = currentPages[currentPages.length - 1];
    
    console.log('🔍 当前页面路由:', currentPage.route);
    
    if (currentPage.route === 'pages/magic-teacher/magic-teacher') {
      console.log('✅ 成功跳转到魔法老师页面');
      return true;
    } else {
      console.log('❌ 未跳转到魔法老师页面，当前页面:', currentPage.route);
      return false;
    }
  },
  
  /**
   * 重置测试环境
   */
  reset() {
    console.log('🔄 重置测试环境...');
    
    const currentPages = getCurrentPages();
    const currentPage = currentPages[currentPages.length - 1];
    
    if (currentPage && currentPage.route === 'pages/word-learning/word-learning') {
      currentPage.setData({
        dictationAttempts: 0,
        dictationInput: '',
        showHint: false,
        mode: 'learn'
      });
      console.log('✅ 测试环境已重置');
    }
  },
  
  /**
   * 快速测试（直接设置为2次错误，然后再错一次）
   */
  async quickTest() {
    console.log('⚡ 开始快速测试...');
    
    const currentPages = getCurrentPages();
    const currentPage = currentPages[currentPages.length - 1];
    
    if (!currentPage || currentPage.route !== 'pages/word-learning/word-learning') {
      console.error('❌ 请在单词学习页面运行此测试');
      return;
    }
    
    // 直接设置为已经错误2次
    currentPage.setData({
      dictationAttempts: 2,
      dictationInput: 'wrongtest',
      mode: 'dictation'
    });
    
    console.log('📝 设置为已错误2次，现在提交第3次错误...');
    
    // 提交第3次错误
    await currentPage.onSubmitDictation();
    
    console.log('✅ 快速测试完成');
  },
  
  /**
   * 延迟函数
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};

// 导出测试接口
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    run: () => dictationJumpTest.run(),
    check: () => dictationJumpTest.checkJumpStatus(),
    reset: () => dictationJumpTest.reset(),
    quick: () => dictationJumpTest.quickTest()
  };
}

// 在控制台中可用的全局测试函数
if (typeof global !== 'undefined') {
  global.testDictationJump = dictationJumpTest;
}

console.log('📋 默写跳转测试脚本已加载');
console.log('🔧 可用测试方法:');
console.log('  - testDictationJump.run() - 运行完整测试');
console.log('  - testDictationJump.quickTest() - 快速测试');
console.log('  - testDictationJump.checkJumpStatus() - 检查跳转状态');
console.log('  - testDictationJump.reset() - 重置测试环境');