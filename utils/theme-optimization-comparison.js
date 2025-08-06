/**
 * 主题优化前后对比分析
 * 展示基于主题相关性优先的分配算法的改进效果
 */

const wordLibrary = require('./word-library.js')
const unifiedThemes = require('./unified-level-themes.js')

/**
 * 分析当前分配方案的主题匹配情况
 */
function analyzeCurrentAllocation() {
  console.log('🔍 分析当前基于主题优先的分配方案...\n')
  
  const allWords = wordLibrary.getAllPrimaryWords()
  let totalWords = 0
  let totalThemeMatches = 0
  const problemLevels = []
  
  console.log('=== 各关卡主题匹配度分析 ===')
  
  for (let level = 1; level <= 20; level++) {
    const levelResult = wordLibrary.getLevelWords(level)
    const levelConfig = unifiedThemes.getUnifiedLevelConfig(level)
    const words = levelResult.words
    
    // 计算主题匹配度
    let themeMatchCount = 0
    const categoryBreakdown = {}
    
    words.forEach(wordKey => {
      const wordString = typeof wordKey === 'string' ? wordKey : wordKey.word || wordKey
      const word = allWords.find(w => w.word === wordString)
      
      if (word) {
        const category = word.category
        categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1
        
        if (levelConfig.focusCategories.includes(category) || levelConfig.focusCategories.includes('全部分类')) {
          themeMatchCount++
        }
      }
    })
    
    const matchRate = ((themeMatchCount / words.length) * 100).toFixed(1)
    totalWords += words.length
    totalThemeMatches += themeMatchCount
    
    const status = matchRate >= 80 ? '✅' : matchRate >= 50 ? '⚠️' : '❌'
    console.log(`${status} 第${level}关 ${levelConfig.theme}: ${matchRate}% (${themeMatchCount}/${words.length})`)
    
    // 显示分类分布
    const categoryList = Object.entries(categoryBreakdown)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, count]) => `${cat}(${count})`)
      .slice(0, 3)
      .join(', ')
    console.log(`   主要分类: ${categoryList}`)
    
    if (matchRate < 80) {
      problemLevels.push({
        level,
        theme: levelConfig.theme,
        matchRate: parseFloat(matchRate),
        targetCategories: levelConfig.focusCategories,
        actualCategories: Object.keys(categoryBreakdown)
      })
    }
  }
  
  const overallMatchRate = ((totalThemeMatches / totalWords) * 100).toFixed(1)
  console.log(`\n📊 总体统计:`)
  console.log(`- 总单词数: ${totalWords}个`)
  console.log(`- 主题匹配单词: ${totalThemeMatches}个`)
  console.log(`- 整体主题匹配度: ${overallMatchRate}%`)
  console.log(`- 优秀关卡(≥80%): ${20 - problemLevels.length}个`)
  console.log(`- 需要改进关卡(<80%): ${problemLevels.length}个`)
  
  if (problemLevels.length > 0) {
    console.log('\n⚠️ 需要改进的关卡:')
    problemLevels.forEach(level => {
      console.log(`   第${level.level}关 ${level.theme}: ${level.matchRate}%`)
      console.log(`     目标分类: ${level.targetCategories.join(', ')}`)
    })
  }
  
  return {
    totalWords,
    totalThemeMatches,
    overallMatchRate: parseFloat(overallMatchRate),
    problemLevels
  }
}

/**
 * 分析单词库的分类分布
 */
function analyzeCategoryDistribution() {
  console.log('\n📚 单词库分类分布分析...')
  
  const allWords = wordLibrary.getAllPrimaryWords()
  const categoryStats = {}
  const difficultyStats = {}
  
  allWords.forEach(word => {
    const category = word.category
    const difficulty = word.difficulty
    
    categoryStats[category] = (categoryStats[category] || 0) + 1
    difficultyStats[difficulty] = (difficultyStats[difficulty] || 0) + 1
  })
  
  console.log('\n=== 分类分布 ===')
  Object.entries(categoryStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, count]) => {
      const percentage = ((count / allWords.length) * 100).toFixed(1)
      console.log(`${category}: ${count}个 (${percentage}%)`)
    })
  
  console.log('\n=== 难度分布 ===')
  Object.entries(difficultyStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([difficulty, count]) => {
      const percentage = ((count / allWords.length) * 100).toFixed(1)
      console.log(`${difficulty}: ${count}个 (${percentage}%)`)
    })
}

/**
 * 提供优化建议
 */
function provideOptimizationSuggestions(analysisResult) {
  console.log('\n💡 优化建议:')
  
  if (analysisResult.overallMatchRate >= 95) {
    console.log('🎉 优秀！当前分配方案的主题相关性已经非常高')
    console.log('✅ 建议保持当前的主题优先分配策略')
  } else if (analysisResult.overallMatchRate >= 85) {
    console.log('👍 良好！主题相关性达到了较高水平')
    console.log('🔧 可以针对个别关卡进行微调优化')
  } else {
    console.log('⚠️ 需要改进！主题相关性有待提升')
    console.log('🔧 建议采用主题优先的分配算法')
  }
  
  if (analysisResult.problemLevels.length > 0) {
    console.log('\n🎯 针对性改进建议:')
    analysisResult.problemLevels.forEach(level => {
      console.log(`- 第${level.level}关: 增加"${level.targetCategories.join('、')}"分类的单词比例`)
    })
  }
  
  console.log('\n📈 持续优化策略:')
  console.log('1. 定期检查主题匹配度，确保不低于80%')
  console.log('2. 根据学习反馈调整单词难度分级')
  console.log('3. 扩充小众分类的单词库（如科学探索、艺术创作）')
  console.log('4. 保持单词分配的多样性和渐进性')
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 SpellWell 主题优化分析报告')
  console.log('=' .repeat(50))
  
  const analysisResult = analyzeCurrentAllocation()
  analyzeCategoryDistribution()
  provideOptimizationSuggestions(analysisResult)
  
  console.log('\n' + '='.repeat(50))
  console.log('📋 分析完成！')
  
  if (analysisResult.overallMatchRate >= 90) {
    console.log('🎉 恭喜！您的单词分配方案已经达到了很高的主题相关性标准')
  }
}

// 如果直接运行此文件，执行分析
if (require.main === module) {
  main()
}

module.exports = {
  analyzeCurrentAllocation,
  analyzeCategoryDistribution,
  provideOptimizationSuggestions
}