/**
 * 记忆方法弹窗问题快速修复脚本
 * 在微信开发者工具控制台中运行此脚本进行诊断和修复
 */

// 快速诊断函数
function quickDiagnosis() {
  console.log('=== 记忆方法弹窗快速诊断 ===');
  
  const page = getCurrentPages()[0];
  if (!page) {
    console.error('❌ 无法获取当前页面对象');
    return;
  }
  
  console.log('✅ 页面对象正常');
  
  // 检查关键状态
  const data = page.data;
  console.log('📊 当前状态:', {
    showMemoryTip: data.showMemoryTip,
    memoryTipContent: data.memoryTipContent ? '有内容' : '无内容',
    memoryTipLoading: data.memoryTipLoading,
    dictationAttempts: data.dictationAttempts,
    maxAttempts: data.maxAttempts,
    currentWord: data.currentWord ? data.currentWord.word : '无单词'
  });
  
  // 检查关键函数
  const functions = ['showMemoryTipModal', 'testMemoryTipModal', 'forceShowMemoryTip'];
  functions.forEach(funcName => {
    if (typeof page[funcName] === 'function') {
      console.log(`✅ ${funcName} 函数存在`);
    } else {
      console.error(`❌ ${funcName} 函数不存在`);
    }
  });
  
  console.log('=== 诊断完成 ===');
}

// 快速测试弹窗显示
function testPopup() {
  console.log('=== 测试弹窗显示 ===');
  
  const page = getCurrentPages()[0];
  if (!page) {
    console.error('❌ 无法获取当前页面对象');
    return;
  }
  
  if (typeof page.testMemoryTipModal === 'function') {
    console.log('🧪 执行测试函数...');
    page.testMemoryTipModal();
    
    setTimeout(() => {
      if (page.data.showMemoryTip) {
        console.log('✅ 弹窗显示成功');
      } else {
        console.error('❌ 弹窗显示失败');
        console.log('尝试强制修复...');
        forceFixPopup();
      }
    }, 1000);
  } else {
    console.error('❌ 测试函数不存在，尝试手动设置...');
    manualSetPopup();
  }
}

// 手动设置弹窗
function manualSetPopup() {
  console.log('🔧 手动设置弹窗状态...');
  
  const page = getCurrentPages()[0];
  page.setData({
    showMemoryTip: true,
    memoryTipContent: '这是一个测试记忆方法：将单词分解为音节，重复练习发音。',
    memoryTipLoading: false
  }, () => {
    console.log('✅ 手动设置完成');
    setTimeout(() => {
      if (page.data.showMemoryTip) {
        console.log('✅ 弹窗显示成功');
      } else {
        console.error('❌ 弹窗仍然无法显示，可能是WXML或CSS问题');
      }
    }, 500);
  });
}

// 强制修复弹窗
function forceFixPopup() {
  console.log('🚨 执行强制修复...');
  
  const page = getCurrentPages()[0];
  
  // 先重置状态
  page.setData({
    showMemoryTip: false,
    memoryTipContent: '',
    memoryTipLoading: false
  }, () => {
    console.log('🔄 状态重置完成');
    
    // 延迟设置显示
    setTimeout(() => {
      page.setData({
        showMemoryTip: true,
        memoryTipContent: '强制修复测试：这个单词可以通过联想记忆法来记住。',
        memoryTipLoading: false,
        _forceUpdate: Date.now() // 强制更新标记
      }, () => {
        console.log('🔧 强制修复完成');
        
        setTimeout(() => {
          if (page.data.showMemoryTip) {
            console.log('✅ 强制修复成功');
          } else {
            console.error('❌ 强制修复失败，建议检查WXML和CSS');
            suggestManualCheck();
          }
        }, 500);
      });
    }, 200);
  });
}

// 模拟完整的错误流程
function simulateErrorFlow() {
  console.log('=== 模拟完整错误流程 ===');
  
  const page = getCurrentPages()[0];
  
  // 设置测试环境
  page.setData({
    currentWord: { word: 'test', chinese: '测试' },
    dictationAttempts: 2, // 设置为2，下次错误就是第3次
    dictationInput: 'wrong',
    showMemoryTip: false,
    memoryTipContent: ''
  }, () => {
    console.log('🎯 测试环境设置完成');
    console.log('📝 当前状态: 第2次错误，下次将触发记忆方法');
    
    // 模拟提交错误答案
    if (typeof page.onSubmitDictation === 'function') {
      console.log('🚀 模拟提交错误答案...');
      page.onSubmitDictation();
      
      // 检查结果
      setTimeout(() => {
        console.log('📊 流程执行结果:', {
          dictationAttempts: page.data.dictationAttempts,
          showMemoryTip: page.data.showMemoryTip,
          hasMemoryTipContent: !!page.data.memoryTipContent
        });
        
        if (page.data.showMemoryTip) {
          console.log('✅ 完整流程测试成功');
        } else {
          console.error('❌ 完整流程测试失败');
          console.log('🔍 建议检查onSubmitDictation函数中的逻辑');
        }
      }, 2000); // 等待AI生成完成
    } else {
      console.error('❌ onSubmitDictation函数不存在');
    }
  });
}

// 建议手动检查
function suggestManualCheck() {
  console.log('=== 手动检查建议 ===');
  console.log('1. 检查WXML文件中的条件判断:');
  console.log('   wx:if="{{showMemoryTip}}"');
  console.log('');
  console.log('2. 检查CSS样式:');
  console.log('   .memory-tip-modal { display: flex; z-index: 9999; }');
  console.log('');
  console.log('3. 在Elements面板中搜索"memory-tip-modal"');
  console.log('');
  console.log('4. 检查控制台是否有JavaScript错误');
  console.log('');
  console.log('5. 尝试重新编译小程序');
}

// 应急解决方案
function emergencyFix() {
  console.log('=== 应急解决方案 ===');
  
  const page = getCurrentPages()[0];
  
  // 修改maxAttempts为2，降低触发门槛
  page.setData({
    maxAttempts: 2
  }, () => {
    console.log('🚨 应急修复：将maxAttempts改为2');
    console.log('现在第2次错误就会触发记忆方法');
    
    // 重新测试
    setTimeout(() => {
      simulateErrorFlow();
    }, 500);
  });
}

// 恢复正常设置
function restoreNormalSettings() {
  console.log('=== 恢复正常设置 ===');
  
  const page = getCurrentPages()[0];
  page.setData({
    maxAttempts: 3,
    showMemoryTip: false,
    memoryTipContent: '',
    memoryTipLoading: false,
    dictationAttempts: 0
  }, () => {
    console.log('✅ 已恢复正常设置');
  });
}

// 主要诊断流程
function runFullDiagnosis() {
  console.log('🔍 开始完整诊断流程...');
  
  quickDiagnosis();
  
  setTimeout(() => {
    testPopup();
  }, 1000);
  
  setTimeout(() => {
    simulateErrorFlow();
  }, 3000);
}

// 导出函数到全局
window.memoryTipDebug = {
  quickDiagnosis,
  testPopup,
  manualSetPopup,
  forceFixPopup,
  simulateErrorFlow,
  emergencyFix,
  restoreNormalSettings,
  runFullDiagnosis
};

console.log('🛠️ 记忆方法弹窗调试工具已加载');
console.log('使用方法:');
console.log('- memoryTipDebug.runFullDiagnosis() // 运行完整诊断');
console.log('- memoryTipDebug.testPopup() // 快速测试弹窗');
console.log('- memoryTipDebug.forceFixPopup() // 强制修复');
console.log('- memoryTipDebug.emergencyFix() // 应急解决方案');
console.log('- memoryTipDebug.restoreNormalSettings() // 恢复正常设置');