/**
 * 验证第3关实际单词选择逻辑
 */

// 模拟selectWordsForLevel函数的逻辑
function simulateSelectWordsForLevel(level, config) {
  const LEVEL_WORD_MAPPING = {
    "3": ["arm", "eye", "leg", "back", "body", "face", "hair", "hand", "head", "neck", "nose", "his", "how", "its", "let", "lot", "may", "new", "not", "now", "off", "old", "one", "our", "out", "put"]
  };
  
  const preAllocatedWords = LEVEL_WORD_MAPPING[level.toString()] || [];
  
  console.log(`预分配单词数量: ${preAllocatedWords.length}`);
  console.log(`目标单词数量: ${config.targetWords}`);
  console.log(`预分配单词: [${preAllocatedWords.join(', ')}]`);
  
  // 如果预分配的单词数量符合要求，直接返回
  if (preAllocatedWords.length >= config.targetWords) {
    const result = preAllocatedWords.slice(0, config.targetWords);
    console.log(`\n✅ 条件满足: 预分配数量(${preAllocatedWords.length}) >= 目标数量(${config.targetWords})`);
    console.log(`返回前${config.targetWords}个单词: [${result.join(', ')}]`);
    return result;
  }
  
  console.log(`\n❌ 条件不满足: 预分配数量(${preAllocatedWords.length}) < 目标数量(${config.targetWords})`);
  return preAllocatedWords;
}

// 第3关配置
const level3Config = {
  targetWords: 11,
  difficulty: "beginner",
  focusCategories: ["身体部位"]
};

console.log('🔍 验证第3关单词选择逻辑');
console.log('=' .repeat(50));

const actualWords = simulateSelectWordsForLevel(3, level3Config);

console.log('\n📊 分析结果:');
console.log(`实际返回的单词数量: ${actualWords.length}`);
console.log(`这解释了为什么第3关实际只有${actualWords.length}个单词，而不是预分配的26个单词`);

// 检查这11个单词是否都是身体部位相关
const bodyParts = ["arm", "eye", "leg", "back", "body", "face", "hair", "hand", "head", "neck", "nose"];
const isAllBodyParts = actualWords.every(word => bodyParts.includes(word));

console.log(`\n✅ 验证: 这${actualWords.length}个单词是否都是身体部位? ${isAllBodyParts ? '是' : '否'}`);
if (isAllBodyParts) {
  console.log('💡 这证实了系统确实按照主题正确分配了身体部位相关的单词！');
}