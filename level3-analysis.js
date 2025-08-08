/**
 * 第3关单词分析脚本
 * 深入分析第3关的单词分配情况
 */

// 从word-library.js中提取的第3关单词映射
const LEVEL3_WORDS = ["arm", "eye", "leg", "back", "body", "face", "hair", "hand", "head", "neck", "nose", "his", "how", "its", "let", "lot", "may", "new", "not", "now", "off", "old", "one", "our", "out", "put"];

// 从unified-level-themes.js中提取的第3关配置
const LEVEL3_CONFIG = {
  "theme": "身体认知",
  "name": "认识自己",
  "description": "学习身体各部位名称，关爱自己的身体",
  "icon": "👤",
  "targetWords": 11,
  "difficulty": "beginner",
  "focusCategories": ["身体部位"],
  "learningGoals": [
    "认识身体部位",
    "学会保护身体",
    "表达身体感受"
  ]
};

// 身体部位相关的单词
const BODY_PART_WORDS = ["arm", "eye", "leg", "back", "body", "face", "hair", "hand", "head", "neck", "nose"];

// 非身体部位的单词
const NON_BODY_PART_WORDS = ["his", "how", "its", "let", "lot", "may", "new", "not", "now", "off", "old", "one", "our", "out", "put"];

function analyzeLevel3() {
  console.log('🔍 第3关单词分析报告');
  console.log('=' .repeat(50));
  
  console.log('\n📋 第3关配置信息：');
  console.log(`主题：${LEVEL3_CONFIG.theme}`);
  console.log(`名称：${LEVEL3_CONFIG.name}`);
  console.log(`目标单词数：${LEVEL3_CONFIG.targetWords}`);
  console.log(`焦点分类：${LEVEL3_CONFIG.focusCategories.join(', ')}`);
  
  console.log('\n📝 第3关实际单词列表：');
  console.log(`总数：${LEVEL3_WORDS.length}个单词`);
  console.log(`单词：[${LEVEL3_WORDS.join(', ')}]`);
  
  console.log('\n🎯 身体部位相关单词分析：');
  console.log(`身体部位单词数：${BODY_PART_WORDS.length}个`);
  console.log(`身体部位单词：[${BODY_PART_WORDS.join(', ')}]`);
  
  console.log('\n❓ 非身体部位单词分析：');
  console.log(`非身体部位单词数：${NON_BODY_PART_WORDS.length}个`);
  console.log(`非身体部位单词：[${NON_BODY_PART_WORDS.join(', ')}]`);
  
  console.log('\n📊 分析结果：');
  console.log(`• 配置目标：${LEVEL3_CONFIG.targetWords}个单词`);
  console.log(`• 实际分配：${LEVEL3_WORDS.length}个单词`);
  console.log(`• 身体部位相关：${BODY_PART_WORDS.length}个单词`);
  console.log(`• 其他单词：${NON_BODY_PART_WORDS.length}个单词`);
  
  const bodyPartRatio = (BODY_PART_WORDS.length / LEVEL3_WORDS.length * 100).toFixed(1);
  console.log(`• 身体部位单词占比：${bodyPartRatio}%`);
  
  console.log('\n🤔 可能的原因分析：');
  if (LEVEL3_WORDS.length > LEVEL3_CONFIG.targetWords) {
    console.log('1. 实际分配的单词数量超过了配置的目标数量');
    console.log('2. 可能存在固定的26个单词分配策略，而不是基于主题的动态分配');
    console.log('3. 身体部位相关的单词只有11个，但系统分配了额外的15个基础词汇');
  }
  
  if (BODY_PART_WORDS.length === LEVEL3_CONFIG.targetWords) {
    console.log('✅ 身体部位单词数量正好等于目标单词数量');
    console.log('💡 建议：如果要严格按主题分配，应该只使用身体部位相关的单词');
  }
  
  console.log('\n💡 优化建议：');
  console.log('1. 如果要严格按主题学习，第3关应该只包含身体部位相关的11个单词');
  console.log('2. 如果要保持每关26个单词的一致性，可以考虑添加更多身体部位相关的单词');
  console.log('3. 或者调整配置，明确说明包含基础词汇的学习策略');
  
  return {
    configTarget: LEVEL3_CONFIG.targetWords,
    actualCount: LEVEL3_WORDS.length,
    bodyPartCount: BODY_PART_WORDS.length,
    otherWordsCount: NON_BODY_PART_WORDS.length,
    bodyPartRatio: parseFloat(bodyPartRatio)
  };
}

// 执行分析
if (require.main === module) {
  analyzeLevel3();
}

module.exports = {
  analyzeLevel3,
  LEVEL3_WORDS,
  LEVEL3_CONFIG,
  BODY_PART_WORDS,
  NON_BODY_PART_WORDS
};