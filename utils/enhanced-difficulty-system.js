/**
 * 增强的科学难度分级系统
 * 基于6-12岁儿童认知发展特点设计
 */

const wordLibrary = require('./word-library.js')

/**
 * 重新计算单词的科学难度等级
 * 基于多维度评估：认知负荷、语音复杂性、语义抽象度、学习频次
 */
function calculateScientificDifficulty(word, wordKey) {
  const wordText = word.word || wordKey
  
  // 1. 基础认知负荷 (40%)
  const cognitiveLoad = calculateCognitiveLoad(wordText, word)
  
  // 2. 语音复杂性 (25%)
  const phoneticComplexity = calculatePhoneticComplexity(wordText, word)
  
  // 3. 语义抽象度 (20%)
  const semanticAbstraction = calculateSemanticAbstraction(word)
  
  // 4. 学习频次和实用性 (15%)
  const learningFrequency = calculateLearningFrequency(wordText, word)
  
  // 加权平均计算最终分数
  const finalScore = (
    cognitiveLoad * 0.4 +
    phoneticComplexity * 0.25 +
    semanticAbstraction * 0.2 +
    learningFrequency * 0.15
  )
  
  return {
    word: wordText,
    difficulty: getDifficultyLevel(finalScore),
    score: Math.round(finalScore * 10) / 10,
    components: {
      cognitiveLoad: Math.round(cognitiveLoad * 10) / 10,
      phoneticComplexity: Math.round(phoneticComplexity * 10) / 10,
      semanticAbstraction: Math.round(semanticAbstraction * 10) / 10,
      learningFrequency: Math.round(learningFrequency * 10) / 10
    },
    originalDifficulty: word.difficulty
  }
}

/**
 * 计算认知负荷 (长度、拼写规律、视觉复杂度)
 */
function calculateCognitiveLoad(wordText, word) {
  let load = 0
  
  // 单词长度影响 (非线性增长)
  const length = wordText.length
  if (length <= 2) load += 0.5
  else if (length <= 4) load += 1.0
  else if (length <= 6) load += 2.0
  else if (length <= 8) load += 3.5
  else load += 5.0
  
  // 音节数量影响
  const syllableCount = word.syllables ? word.syllables.length : estimateSyllables(wordText)
  load += (syllableCount - 1) * 0.8
  
  // 不规则拼写影响
  if (hasIrregularSpelling(wordText)) load += 1.5
  
  // 重复字母影响 (降低难度)
  if (hasRepeatedLetters(wordText)) load -= 0.3
  
  return Math.max(0, load) // 确保非负
}

/**
 * 计算语音复杂性
 */
function calculatePhoneticComplexity(wordText, word) {
  let complexity = 0
  
  // 元音组合复杂度
  const vowelCombinations = (wordText.match(/[aeiou]{2,}/g) || []).length
  complexity += vowelCombinations * 0.8
  
  // 辅音组合复杂度
  const consonantCombinations = (wordText.match(/[bcdfghjklmnpqrstvwxyz]{2,}/g) || []).length
  complexity += consonantCombinations * 1.0
  
  // 特殊组合 (th, sh, ch, wh等)
  const specialCombinations = (wordText.match(/(th|sh|ch|wh|ph|gh)/g) || []).length
  complexity += specialCombinations * 0.5
  
  // 静音字母
  if (hasSilentLetters(wordText)) complexity += 1.2
  
  // 音标复杂度 (如果有音标信息)
  if (word.phonetic) {
    const phoneticComplexSymbols = (word.phonetic.match(/[θðʃʒʧʤŋ]/g) || []).length
    complexity += phoneticComplexSymbols * 0.3
  }
  
  return complexity
}

/**
 * 计算语义抽象度
 */
function calculateSemanticAbstraction(word) {
  let abstraction = 0
  
  // 具体vs抽象概念
  const abstractCategories = ['情感表达', '科学探索', '世界地理', '艺术创作']
  const concreteCategories = ['动物世界', '美食天地', '身体部位', '颜色彩虹', '家庭成员']
  
  if (abstractCategories.includes(word.category)) {
    abstraction += 2.0
  } else if (concreteCategories.includes(word.category)) {
    abstraction += 0.5
  } else {
    abstraction += 1.0
  }
  
  // 基础词汇降低抽象度
  if (word.category === '基础词汇') {
    abstraction *= 0.6
  }
  
  return abstraction
}

/**
 * 计算学习频次和实用性
 */
function calculateLearningFrequency(wordText, word) {
  let frequency = 2.0 // 基准值
  
  // 高频词汇列表 (牛津儿童3000词基础)
  const highFrequencyWords = [
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'were', 'will', 'with', 'you', 'your', 'have', 'had',
    'can', 'could', 'do', 'does', 'did', 'get', 'go', 'goes', 'went',
    'good', 'bad', 'big', 'small', 'new', 'old', 'long', 'short',
    'one', 'two', 'three', 'four', 'five', 'many', 'all', 'some'
  ]
  
  if (highFrequencyWords.includes(wordText.toLowerCase())) {
    frequency = 0.5 // 高频词降低学习难度
  }
  
  // 日常生活相关词汇
  const dailyLifeCategories = ['家庭成员', '美食天地', '身体部位', '学习用品']
  if (dailyLifeCategories.includes(word.category)) {
    frequency *= 0.8
  }
  
  // 学科专业词汇
  const academicCategories = ['科学探索', '世界地理', '艺术创作']
  if (academicCategories.includes(word.category)) {
    frequency *= 1.3
  }
  
  return frequency
}

/**
 * 根据综合分数确定难度等级
 */
function getDifficultyLevel(score) {
  if (score <= 1.8) return 'beginner'      // 入门级 (建议关卡1-3)
  if (score <= 2.8) return 'basic'         // 基础级 (建议关卡4-7)  
  if (score <= 4.0) return 'intermediate'  // 中级 (建议关卡8-13)
  if (score <= 5.5) return 'advanced'      // 高级 (建议关卡14-17)
  return 'expert'                           // 专家级 (建议关卡18-20)
}

/**
 * 重新评估所有单词的难度
 */
function reassessAllWordDifficulties() {
  const database = wordLibrary.PRIMARY_WORD_DATABASE
  const allWords = Object.keys(database)
  
  console.log('🔬 开始重新评估507个单词的科学难度等级...\n')
  
  const reassessments = []
  const difficultyStats = {
    beginner: 0,
    basic: 0,
    intermediate: 0,
    advanced: 0,
    expert: 0
  }
  
  allWords.forEach(wordKey => {
    const word = database[wordKey]
    const assessment = calculateScientificDifficulty(word, wordKey)
    reassessments.push(assessment)
    difficultyStats[assessment.difficulty]++
  })
  
  // 输出统计结果
  console.log('📊 新的科学难度分布:')
  console.log('=' * 40)
  Object.entries(difficultyStats).forEach(([level, count]) => {
    const percent = ((count / allWords.length) * 100).toFixed(1)
    const levelNames = {
      beginner: '入门级',
      basic: '基础级', 
      intermediate: '中级',
      advanced: '高级',
      expert: '专家级'
    }
    console.log(`${levelNames[level]}: ${count}个 (${percent}%)`)
  })
  
  console.log('\n🎯 建议关卡分配:')
  console.log('关卡1-3: 入门级单词')
  console.log('关卡4-7: 基础级单词') 
  console.log('关卡8-13: 中级单词')
  console.log('关卡14-17: 高级单词')
  console.log('关卡18-20: 专家级单词')
  
  // 显示难度变化最大的单词
  const significantChanges = reassessments.filter(r => {
    const originalLevel = r.originalDifficulty
    const newLevel = r.difficulty
    const levelOrder = ['easy', 'medium', 'advanced', 'hard']
    const newLevelOrder = ['beginner', 'basic', 'intermediate', 'advanced', 'expert']
    
    const oldIndex = levelOrder.indexOf(originalLevel)
    const newIndex = newLevelOrder.indexOf(newLevel)
    
    return Math.abs(oldIndex - newIndex) >= 2
  })
  
  console.log(`\n⚡ 难度调整较大的单词 (${significantChanges.length}个):`)
  significantChanges.slice(0, 10).forEach(r => {
    console.log(`${r.word}: ${r.originalDifficulty} → ${r.difficulty} (分数: ${r.score})`)
  })
  
  return {
    reassessments,
    statistics: difficultyStats,
    significantChanges
  }
}

// 辅助函数
function estimateSyllables(word) {
  return word.toLowerCase().replace(/[^aeiou]/g, '').length || 1
}

function hasIrregularSpelling(word) {
  const irregularPatterns = [
    /ough/, /augh/, /eigh/, /tion/, /sion/, /ture/,
    /[^c]ial/, /tial/, /cious/, /tious/
  ]
  return irregularPatterns.some(pattern => pattern.test(word))
}

function hasRepeatedLetters(word) {
  return /(.)\1/.test(word)
}

function hasSilentLetters(word) {
  const silentPatterns = [
    /^k[n]/, /mb$/, /^wr/, /gh/, /^gn/, /[aeiou]l$/
  ]
  return silentPatterns.some(pattern => pattern.test(word))
}

// 如果直接运行此脚本
if (require.main === module) {
  reassessAllWordDifficulties()
}

module.exports = {
  calculateScientificDifficulty,
  reassessAllWordDifficulties,
  getDifficultyLevel
}