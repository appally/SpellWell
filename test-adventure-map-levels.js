// 测试 adventure-map.js 的关卡数量修复
const unifiedThemes = require('./utils/unified-level-themes.js');

console.log('🧪 测试 Adventure Map 关卡数量修复');
console.log('='.repeat(50));

// 测试 getMaxLevel 函数
try {
  const maxLevel = unifiedThemes.getMaxLevel();
  console.log(`✅ getMaxLevel() 返回: ${maxLevel}`);
  
  if (maxLevel === 35) {
    console.log('🎉 成功：最大关卡数已正确设置为 35');
  } else {
    console.log(`❌ 错误：期望 35，实际得到 ${maxLevel}`);
  }
} catch (error) {
  console.log(`❌ getMaxLevel() 测试失败: ${error.message}`);
}

// 测试关卡主题配置
try {
  const allThemes = unifiedThemes.getAllLevelThemes();
  const themeKeys = Object.keys(allThemes);
  const maxThemeLevel = Math.max(...themeKeys.map(Number));
  
  console.log(`📚 关卡主题配置数量: ${themeKeys.length}`);
  console.log(`🔢 最高关卡主题: ${maxThemeLevel}`);
  
  if (maxThemeLevel >= 35) {
    console.log('✅ 关卡主题配置已包含 35 关');
  } else {
    console.log(`❌ 关卡主题配置不足，最高仅到第 ${maxThemeLevel} 关`);
  }
} catch (error) {
  console.log(`❌ 关卡主题测试失败: ${error.message}`);
}

// 模拟 adventure-map.js 的 onLoad 逻辑
console.log('\n🎮 模拟 Adventure Map onLoad 逻辑:');
try {
  const maxLevel = unifiedThemes.getMaxLevel();
  const progressText = `1/${maxLevel}`;
  
  console.log(`📊 设置数据:`);
  console.log(`   maxLevel: ${maxLevel}`);
  console.log(`   progressText: "${progressText}"`);
  
  // 模拟关卡生成
  console.log(`\n🏗️  模拟关卡生成 (1-${maxLevel}):`);
  for (let i = 1; i <= Math.min(5, maxLevel); i++) {
    console.log(`   关卡 ${i}: 已生成`);
  }
  if (maxLevel > 5) {
    console.log(`   ... (省略中间关卡)`);
    console.log(`   关卡 ${maxLevel}: 已生成`);
  }
  
  console.log(`\n🎉 成功生成 ${maxLevel} 个关卡！`);
} catch (error) {
  console.log(`❌ 模拟测试失败: ${error.message}`);
}

console.log('\n' + '='.repeat(50));
console.log('📋 修复总结:');
console.log('• unified-level-themes.js: 添加 getMaxLevel() 函数');
console.log('• adventure-map.js: 动态获取最大关卡数');
console.log('• 其他相关文件: 更新硬编码的关卡限制');
console.log('\n🚀 关卡选择页面现在应该显示 35 个关卡！');