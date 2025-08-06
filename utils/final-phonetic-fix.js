const fs = require('fs');
const path = require('path');

function comprehensivePhoneticCheck() {
  const filePath = '/Users/appally/Documents/Dev/SpellWell/utils/word-library.js';
  let content = fs.readFileSync(filePath, 'utf8');
  
  console.log('全面phonetic字段检查...');
  
  // 查找所有phonetic字段
  const allPhoneticMatches = content.match(/"phonetic":\s*"[^"]+"/g);
  
  if (allPhoneticMatches) {
    console.log(`总phonetic字段数: ${allPhoneticMatches.length}`);
    
    // 分类统计
    const simpleFormat = allPhoneticMatches.filter(match => {
      // 简单格式：只包含字母、连字符和斜杠
      return match.match(/"phonetic":\s*"\/[a-zA-Z-]+\/"/);
    });
    
    const standardFormat = allPhoneticMatches.filter(match => {
      // 标准格式：包含国际音标符号
      return !match.match(/"phonetic":\s*"\/[a-zA-Z-]+\/"/);
    });
    
    console.log(`\n分类统计:`);
    console.log(`- 简单格式 (/word/): ${simpleFormat.length}`);
    console.log(`- 标准国际音标格式: ${standardFormat.length}`);
    
    // 显示简单格式的例子
    console.log(`\n简单格式phonetic字段:`);
    simpleFormat.forEach(match => {
      console.log(match);
    });
    
    // 显示标准格式的例子
    console.log(`\n标准国际音标格式样本:`);
    standardFormat.slice(0, 10).forEach(match => {
      console.log(match);
    });
    
    // 检查是否有异常格式
    const potentialErrors = allPhoneticMatches.filter(match => {
      // 检查是否有明显错误的格式
      return !match.match(/"phonetic":\s*"\/[^"]+\/"/);
    });
    
    if (potentialErrors.length > 0) {
      console.log(`\n发现 ${potentialErrors.length} 个可能有问题的phonetic字段:`);
      potentialErrors.forEach(match => {
        console.log(match);
      });
    }
    
    console.log(`\n总结:`);
    console.log(`- 总phonetic字段: ${allPhoneticMatches.length}`);
    console.log(`- 简单格式: ${simpleFormat.length} (${(simpleFormat.length/allPhoneticMatches.length*100).toFixed(1)}%)`);
    console.log(`- 标准格式: ${standardFormat.length} (${(standardFormat.length/allPhoneticMatches.length*100).toFixed(1)}%)`);
    
    if (potentialErrors.length === 0) {
      console.log(`\n✅ 所有phonetic字段格式正确`);
      if (simpleFormat.length > 0) {
        console.log(`⚠️  有 ${simpleFormat.length} 个简化格式的phonetic字段，这些可能是为小学生设计的`);
        console.log(`   如果需要统一为标准国际音标格式，可以进行修正`);
      }
    } else {
      console.log(`\n❌ 发现 ${potentialErrors.length} 个格式异常的phonetic字段需要修正`);
    }
  } else {
    console.log('未找到任何phonetic字段');
  }
}

console.log('执行全面phonetic字段检查...');
comprehensivePhoneticCheck();