/**
 * 生成新的关卡映射配置
 * 基于平衡主题分配器的结果，生成可用于替换现有系统的关卡映射
 */

const { BalancedThemeAllocator } = require('./balanced-theme-allocator')
const fs = require('fs')
const path = require('path')

/**
 * 生成新的关卡映射配置
 */
function generateNewLevelMapping() {
  console.log('🚀 开始生成新的关卡映射配置...')
  
  // 创建分配器并生成映射
  const allocator = new BalancedThemeAllocator()
  const levelMapping = allocator.allocateAllLevels()
  
  // 验证结果
  const validation = allocator.validateAllocation(levelMapping)
  
  if (validation.issues.length > 0) {
    console.error('❌ 分配结果存在问题，无法生成配置')
    validation.issues.forEach(issue => console.error(`  - ${issue}`))
    return null
  }
  
  console.log('\n✅ 分配验证通过，开始生成配置文件...')
  
  // 生成配置对象
  const config = {
    version: '2.0.0',
    description: '基于主题优先的平衡单词分配方案',
    generatedAt: new Date().toISOString(),
    totalWords: validation.totalWords,
    totalLevels: 20,
    averageWordsPerLevel: Math.round(validation.totalWords / 20),
    levelMapping: levelMapping,
    statistics: {
      categoryDistribution: {},
      difficultyDistribution: {},
      levelWordCounts: validation.levelCounts
    }
  }
  
  // 计算统计信息
  Object.keys(levelMapping).forEach(level => {
    const words = levelMapping[level]
    
    words.forEach(wordKey => {
      const word = allocator.wordDatabase[wordKey]
      const category = word.category || '基础词汇'
      const difficulty = word.difficulty || 'easy'
      
      config.statistics.categoryDistribution[category] = (config.statistics.categoryDistribution[category] || 0) + 1
      config.statistics.difficultyDistribution[difficulty] = (config.statistics.difficultyDistribution[difficulty] || 0) + 1
    })
  })
  
  return config
}

/**
 * 保存配置到文件
 */
function saveConfigToFile(config, filename = 'new-level-mapping.json') {
  const filePath = path.join(__dirname, filename)
  
  try {
    fs.writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf8')
    console.log(`\n💾 配置已保存到: ${filePath}`)
    return filePath
  } catch (error) {
    console.error(`❌ 保存配置失败: ${error.message}`)
    return null
  }
}

/**
 * 生成用于替换 word-library.js 的新函数
 */
function generateNewSelectWordsFunction(levelMapping) {
  const functionCode = `
/**
 * 新的基于主题优先的单词选择函数
 * 替换原有的按索引分配策略
 */
function selectWordsForLevel(level, config) {
  // 预定义的关卡映射（基于主题优先分配）
  const LEVEL_WORD_MAPPING = ${JSON.stringify(levelMapping, null, 2)};
  
  // 确保关卡在有效范围内
  if (level < 1 || level > 20) {
    level = 1;
  }
  
  // 获取预分配的单词
  const preAllocatedWords = LEVEL_WORD_MAPPING[level] || [];
  
  // 如果预分配的单词数量符合要求，直接返回
  if (preAllocatedWords.length >= config.targetWords) {
    return preAllocatedWords.slice(0, config.targetWords);
  }
  
  // 如果预分配单词不足，从基础词汇中补充
  const allWords = Object.keys(PRIMARY_WORD_DATABASE);
  const basicWords = allWords.filter(wordKey => {
    const word = PRIMARY_WORD_DATABASE[wordKey];
    return word.category === '基础词汇' && 
           word.difficulty === config.difficulty &&
           !preAllocatedWords.includes(wordKey);
  });
  
  const finalWords = [...preAllocatedWords];
  const needed = config.targetWords - finalWords.length;
  
  if (needed > 0) {
    finalWords.push(...basicWords.slice(0, needed));
  }
  
  return finalWords.slice(0, config.targetWords);
}
`
  
  return functionCode
}

/**
 * 生成完整的替换代码
 */
function generateReplacementCode(config) {
  const replacementCode = `
// ==========================================
// 新的基于主题优先的关卡映射系统
// 生成时间: ${config.generatedAt}
// 版本: ${config.version}
// ==========================================

${generateNewSelectWordsFunction(config.levelMapping)}

/**
 * 获取关卡映射统计信息
 */
function getLevelMappingStats() {
  return ${JSON.stringify(config.statistics, null, 2)};
}

/**
 * 验证关卡映射完整性
 */
function validateLevelMapping() {
  const LEVEL_WORD_MAPPING = ${JSON.stringify(config.levelMapping, null, 2)};
  
  let totalWords = 0;
  const usedWords = new Set();
  const duplicates = [];
  
  Object.keys(LEVEL_WORD_MAPPING).forEach(level => {
    const words = LEVEL_WORD_MAPPING[level];
    totalWords += words.length;
    
    words.forEach(wordKey => {
      if (usedWords.has(wordKey)) {
        duplicates.push(wordKey);
      } else {
        usedWords.add(wordKey);
      }
    });
  });
  
  return {
    totalWords,
    uniqueWords: usedWords.size,
    duplicates: duplicates.length,
    isValid: duplicates.length === 0 && totalWords === ${config.totalWords}
  };
}

// 导出新函数（用于替换）
module.exports = {
  selectWordsForLevel,
  getLevelMappingStats,
  validateLevelMapping
};
`
  
  return replacementCode
}

/**
 * 主函数
 */
function main() {
  console.log('🎯 开始生成新的关卡映射配置...')
  
  // 生成配置
  const config = generateNewLevelMapping()
  
  if (!config) {
    console.error('❌ 配置生成失败')
    return
  }
  
  // 保存配置文件
  const configPath = saveConfigToFile(config)
  
  if (!configPath) {
    console.error('❌ 配置保存失败')
    return
  }
  
  // 生成替换代码
  const replacementCode = generateReplacementCode(config)
  const codePath = path.join(__dirname, 'new-select-words-function.js')
  
  try {
    fs.writeFileSync(codePath, replacementCode, 'utf8')
    console.log(`💾 替换代码已保存到: ${codePath}`)
  } catch (error) {
    console.error(`❌ 替换代码保存失败: ${error.message}`)
    return
  }
  
  // 显示摘要
  console.log('\n📊 生成摘要:')
  console.log(`✅ 总单词数: ${config.totalWords}`)
  console.log(`✅ 关卡数: ${config.totalLevels}`)
  console.log(`✅ 平均每关单词数: ${config.averageWordsPerLevel}`)
  console.log(`✅ 配置文件: ${configPath}`)
  console.log(`✅ 替换代码: ${codePath}`)
  
  console.log('\n🎯 下一步操作:')
  console.log('1. 检查生成的配置文件和代码')
  console.log('2. 备份现有的 word-library.js 文件')
  console.log('3. 替换 selectWordsForLevel 函数')
  console.log('4. 测试新的关卡分配效果')
  
  return {
    configPath,
    codePath,
    config
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main()
}

module.exports = {
  generateNewLevelMapping,
  saveConfigToFile,
  generateNewSelectWordsFunction,
  generateReplacementCode,
  main
}