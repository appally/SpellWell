/**
 * 单词学习特征深度分析工具
 * 为关卡优化提供数据支持
 */

const wordLibrary = require('./word-library.js')

/**
 * 分析507个单词的完整学习特征
 */
function analyzeWordDatabase() {
  const database = wordLibrary.PRIMARY_WORD_DATABASE
  const allWords = Object.keys(database)
  
  console.log('🔍 开始深度分析507个单词的学习特征...\n')
  
  // 1. 基础统计
  const stats = {
    totalWords: allWords.length,
    difficulties: {},
    categories: {},
    wordLengths: {},
    syllableCounts: {},
    complexityScores: {}
  }
  
  // 2. 详细分析每个单词
  const wordAnalysis = []
  
  allWords.forEach(wordKey => {
    const word = database[wordKey]
    const analysis = analyzeWord(word, wordKey)
    wordAnalysis.push(analysis)
    
    // 统计分布
    stats.difficulties[word.difficulty] = (stats.difficulties[word.difficulty] || 0) + 1
    stats.categories[word.category] = (stats.categories[word.category] || 0) + 1
    stats.wordLengths[analysis.length] = (stats.wordLengths[analysis.length] || 0) + 1
    stats.syllableCounts[analysis.syllableCount] = (stats.syllableCounts[analysis.syllableCount] || 0) + 1
    
    const complexityLevel = getComplexityLevel(analysis.complexityScore)
    stats.complexityScores[complexityLevel] = (stats.complexityScores[complexityLevel] || 0) + 1
  })
  
  // 3. 输出分析结果
  printAnalysisResults(stats, wordAnalysis)
  
  return {
    statistics: stats,
    wordAnalysis: wordAnalysis,
    recommendations: generateOptimizationRecommendations(stats, wordAnalysis)
  }
}

/**
 * 分析单个单词的学习特征
 */
function analyzeWord(word, wordKey) {
  const wordText = word.word || wordKey
  
  return {
    word: wordText,
    length: wordText.length,
    syllableCount: word.syllables ? word.syllables.length : 1,
    difficulty: word.difficulty,
    category: word.category,
    hasPhonetic: !!word.phonetic,
    hasTips: !!(word.tips && word.tips.length > 0),
    complexityScore: calculateComplexityScore(word, wordText),
    learningPriority: calculateLearningPriority(word, wordText)
  }
}

/**
 * 计算单词复杂度评分
 */
function calculateComplexityScore(word, wordText) {
  let score = 0
  
  // 长度影响 (权重: 20%)
  score += Math.min(wordText.length * 0.5, 5)
  
  // 音节影响 (权重: 25%)
  const syllableCount = word.syllables ? word.syllables.length : 1
  score += syllableCount * 0.8
  
  // 难度标记影响 (权重: 35%)
  const difficultyScores = {
    'easy': 1,
    'medium': 2.5,
    'advanced': 4,
    'hard': 5
  }
  score += difficultyScores[word.difficulty] || 2
  
  // 特殊字符和组合 (权重: 20%)
  if (wordText.includes('th') || wordText.includes('sh') || wordText.includes('ch')) score += 0.5
  if (/[aeiou]{2,}/.test(wordText)) score += 0.5 // 元音组合
  if (/[bcdfghjklmnpqrstvwxyz]{2,}/.test(wordText)) score += 0.8 // 辅音组合
  
  return Math.round(score * 10) / 10 // 保留一位小数
}

/**
 * 计算学习优先级
 */
function calculateLearningPriority(word, wordText) {
  let priority = 0
  
  // 基础词汇优先
  if (word.category === '基础词汇') priority += 10
  
  // 常用词汇优先
  const commonWords = ['a', 'the', 'is', 'are', 'in', 'on', 'at', 'to', 'and', 'or']
  if (commonWords.includes(wordText.toLowerCase())) priority += 15
  
  // 短词优先
  if (wordText.length <= 3) priority += 8
  else if (wordText.length <= 5) priority += 5
  
  // 单音节优先
  const syllableCount = word.syllables ? word.syllables.length : 1
  if (syllableCount === 1) priority += 6
  
  // 有记忆技巧的词汇优先
  if (word.tips && word.tips.length > 0) priority += 3
  
  return priority
}

/**
 * 获取复杂度等级
 */
function getComplexityLevel(score) {
  if (score <= 2) return '非常简单'
  if (score <= 3.5) return '简单'
  if (score <= 5) return '中等'
  if (score <= 6.5) return '困难'
  return '非常困难'
}

/**
 * 输出分析结果
 */
function printAnalysisResults(stats, wordAnalysis) {
  console.log('📊 单词数据库分析结果')
  console.log('=' * 50)
  
  console.log(`\n📈 总体统计:`)
  console.log(`总词汇量: ${stats.totalWords}`)
  
  console.log(`\n🎯 难度分布:`)
  Object.entries(stats.difficulties)
    .sort(([,a], [,b]) => b - a)
    .forEach(([diff, count]) => {
      const percent = ((count / stats.totalWords) * 100).toFixed(1)
      console.log(`  ${diff}: ${count}个 (${percent}%)`)
    })
  
  console.log(`\n📚 分类分布:`)
  Object.entries(stats.categories)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10) // 显示前10个分类
    .forEach(([category, count]) => {
      const percent = ((count / stats.totalWords) * 100).toFixed(1)
      console.log(`  ${category}: ${count}个 (${percent}%)`)
    })
  
  console.log(`\n📏 单词长度分布:`)
  Object.entries(stats.wordLengths)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .forEach(([length, count]) => {
      const percent = ((count / stats.totalWords) * 100).toFixed(1)
      console.log(`  ${length}字母: ${count}个 (${percent}%)`)
    })
  
  console.log(`\n🎵 音节数量分布:`)
  Object.entries(stats.syllableCounts)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .forEach(([syllables, count]) => {
      const percent = ((count / stats.totalWords) * 100).toFixed(1)
      console.log(`  ${syllables}音节: ${count}个 (${percent}%)`)
    })
  
  console.log(`\n⚡ 复杂度分布:`)
  Object.entries(stats.complexityScores)
    .forEach(([level, count]) => {
      const percent = ((count / stats.totalWords) * 100).toFixed(1)
      console.log(`  ${level}: ${count}个 (${percent}%)`)
    })
  
  // 找出最适合不同关卡的单词
  console.log(`\n🎮 关卡适配性分析:`)
  const sortedByPriority = wordAnalysis
    .sort((a, b) => b.learningPriority - a.learningPriority)
  
  console.log(`\n🌟 最适合入门关卡的单词 (前15个):`)
  sortedByPriority.slice(0, 15).forEach((analysis, index) => {
    console.log(`  ${index + 1}. ${analysis.word} (优先级: ${analysis.learningPriority}, 复杂度: ${analysis.complexityScore})`)
  })
  
  console.log(`\n💪 最具挑战性的单词 (后10个):`)
  sortedByPriority.slice(-10).forEach((analysis, index) => {
    console.log(`  ${analysis.word} (复杂度: ${analysis.complexityScore})`)
  })
}

/**
 * 生成优化建议
 */
function generateOptimizationRecommendations(stats, wordAnalysis) {
  const recommendations = []
  
  // 分析难度分布合理性
  const diffPercents = {
    easy: ((stats.difficulties.easy || 0) / stats.totalWords * 100),
    medium: ((stats.difficulties.medium || 0) / stats.totalWords * 100),
    advanced: ((stats.difficulties.advanced || 0) / stats.totalWords * 100),
    hard: ((stats.difficulties.hard || 0) / stats.totalWords * 100)
  }
  
  if (diffPercents.medium > 60) {
    recommendations.push({
      type: 'warning',
      message: `中等难度词汇占比过高 (${diffPercents.medium.toFixed(1)}%)，建议重新平衡难度分配`
    })
  }
  
  if (diffPercents.easy < 20) {
    recommendations.push({
      type: 'suggestion',
      message: `简单词汇不足 (${diffPercents.easy.toFixed(1)}%)，建议增加更多入门级词汇`
    })
  }
  
  // 分析关卡分配策略
  const avgComplexity = wordAnalysis.reduce((sum, w) => sum + w.complexityScore, 0) / wordAnalysis.length
  recommendations.push({
    type: 'info',
    message: `词汇平均复杂度: ${avgComplexity.toFixed(2)}`
  })
  
  recommendations.push({
    type: 'strategy',
    message: '建议关卡分配策略：1-4关(简单)，5-8关(简单-中等)，9-14关(中等)，15-17关(中等-困难)，18-20关(困难)'
  })
  
  return recommendations
}

// 如果直接运行此脚本
if (require.main === module) {
  analyzeWordDatabase()
}

module.exports = {
  analyzeWordDatabase,
  analyzeWord,
  calculateComplexityScore,
  calculateLearningPriority
}