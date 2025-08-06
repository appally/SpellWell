/**
 * 单词库覆盖率扩展方案
 * 解决当前关卡只覆盖53.6%单词的问题
 */

const wordLibrary = require('./word-library.js')
const unifiedThemes = require('./unified-level-themes.js')
const { ThemePriorityAllocator } = require('./theme-priority-allocator.js')

class WordCoverageExpansionPlan {
  constructor() {
    this.allWords = wordLibrary.getAllPrimaryWords()
    this.currentCoverage = this.analyzeCurrentCoverage()
  }

  /**
   * 分析当前覆盖情况
   */
  analyzeCurrentCoverage() {
    const allocatedWords = new Set()
    const unallocatedWords = []
    
    // 收集已分配的单词
    for (let level = 1; level <= 20; level++) {
      const levelResult = wordLibrary.getLevelWords(level)
      levelResult.words.forEach(w => {
        const wordString = typeof w === 'string' ? w : w.word || w
        allocatedWords.add(wordString)
      })
    }
    
    // 收集未分配的单词
    this.allWords.forEach(word => {
      if (!allocatedWords.has(word.word)) {
        unallocatedWords.push(word)
      }
    })
    
    return {
      totalWords: this.allWords.length,
      allocatedCount: allocatedWords.size,
      unallocatedWords,
      coverageRate: (allocatedWords.size / this.allWords.length * 100).toFixed(1)
    }
  }

  /**
   * 分析未分配单词的特征
   */
  analyzeUnallocatedWords() {
    const { unallocatedWords } = this.currentCoverage
    
    const analysis = {
      byDifficulty: {},
      byCategory: {},
      highValueWords: [],
      potentialNewLevels: []
    }
    
    unallocatedWords.forEach(word => {
      // 按难度统计
      const difficulty = word.difficulty
      analysis.byDifficulty[difficulty] = (analysis.byDifficulty[difficulty] || 0) + 1
      
      // 按分类统计
      const category = word.category
      if (!analysis.byCategory[category]) {
        analysis.byCategory[category] = []
      }
      analysis.byCategory[category].push(word)
      
      // 识别高价值单词（有例句、提示等）
      if (word.sentence || (word.tips && word.tips.length > 0)) {
        analysis.highValueWords.push(word)
      }
    })
    
    return analysis
  }

  /**
   * 生成扩展方案
   */
  generateExpansionPlan() {
    const analysis = this.analyzeUnallocatedWords()
    const { unallocatedWords } = this.currentCoverage
    
    console.log('🎯 单词库覆盖率扩展方案')
    console.log('=' .repeat(50))
    
    console.log('\n📊 当前状况:')
    console.log(`- 总单词数: ${this.currentCoverage.totalWords}个`)
    console.log(`- 已分配: ${this.currentCoverage.allocatedCount}个`)
    console.log(`- 未分配: ${unallocatedWords.length}个`)
    console.log(`- 当前覆盖率: ${this.currentCoverage.coverageRate}%`)
    
    console.log('\n🔍 未分配单词分析:')
    console.log('按难度分布:')
    Object.entries(analysis.byDifficulty)
      .sort((a, b) => b[1] - a[1])
      .forEach(([difficulty, count]) => {
        console.log(`  ${difficulty}: ${count}个`)
      })
    
    console.log('\n按分类分布:')
    Object.entries(analysis.byCategory)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 10)
      .forEach(([category, words]) => {
        console.log(`  ${category}: ${words.length}个`)
      })
    
    console.log(`\n💎 高价值单词: ${analysis.highValueWords.length}个`)
    
    // 生成具体的扩展方案
    const expansionOptions = this.generateExpansionOptions(analysis)
    
    console.log('\n🚀 扩展方案选项:')
    expansionOptions.forEach((option, index) => {
      console.log(`\n方案${index + 1}: ${option.name}`)
      console.log(`  目标覆盖率: ${option.targetCoverage}%`)
      console.log(`  新增关卡: ${option.newLevels}个`)
      console.log(`  实施难度: ${option.difficulty}`)
      console.log(`  预期效果: ${option.description}`)
    })
    
    return expansionOptions
  }

  /**
   * 生成扩展方案选项
   */
  generateExpansionOptions(analysis) {
    const { unallocatedWords } = this.currentCoverage
    
    return [
      {
        name: '渐进式扩展方案',
        targetCoverage: 75,
        newLevels: 5,
        difficulty: '低',
        description: '新增5个关卡，优先分配高价值和常用单词',
        implementation: () => this.implementGradualExpansion(analysis)
      },
      {
        name: '主题完善方案',
        targetCoverage: 85,
        newLevels: 8,
        difficulty: '中',
        description: '基于现有主题扩展，确保每个分类都有充分覆盖',
        implementation: () => this.implementThemeCompletionPlan(analysis)
      },
      {
        name: '全覆盖方案',
        targetCoverage: 95,
        newLevels: 12,
        difficulty: '高',
        description: '新增12个关卡，实现近乎完全的单词覆盖',
        implementation: () => this.implementFullCoveragePlan(analysis)
      },
      {
        name: '智能优化方案',
        targetCoverage: 80,
        newLevels: 6,
        difficulty: '中',
        description: '基于学习价值和难度梯度的智能分配',
        implementation: () => this.implementSmartOptimizationPlan(analysis)
      }
    ]
  }

  /**
   * 实施渐进式扩展方案
   */
  implementGradualExpansion(analysis) {
    console.log('\n🔧 实施渐进式扩展方案...')
    
    const newLevels = [
      {
        level: 21,
        theme: '进阶词汇A',
        targetWords: 15,
        difficulty: 'medium',
        focusCategories: ['基础词汇', '情感表达']
      },
      {
        level: 22,
        theme: '进阶词汇B',
        targetWords: 15,
        difficulty: 'medium',
        focusCategories: ['美食天地', '家庭用品']
      },
      {
        level: 23,
        theme: '进阶词汇C',
        targetWords: 15,
        difficulty: 'medium',
        focusCategories: ['学习用品', '动物世界']
      },
      {
        level: 24,
        theme: '高级词汇A',
        targetWords: 18,
        difficulty: 'hard',
        focusCategories: ['职业体验', '运动健身']
      },
      {
        level: 25,
        theme: '高级词汇B',
        targetWords: 20,
        difficulty: 'hard',
        focusCategories: ['全部分类']
      }
    ]
    
    return this.allocateWordsForNewLevels(newLevels, analysis)
  }

  /**
   * 为新关卡分配单词
   */
  allocateWordsForNewLevels(newLevels, analysis) {
    const { unallocatedWords } = this.currentCoverage
    const allocation = {}
    const usedWords = new Set()
    
    newLevels.forEach(levelConfig => {
      const availableWords = unallocatedWords.filter(word => {
        if (usedWords.has(word.word)) return false
        
        // 难度匹配
        const difficultyMatch = this.isDifficultyCompatible(word.difficulty, levelConfig.difficulty)
        if (!difficultyMatch) return false
        
        // 分类匹配
        if (levelConfig.focusCategories.includes('全部分类')) return true
        return levelConfig.focusCategories.includes(word.category)
      })
      
      // 按学习价值排序
      availableWords.sort((a, b) => this.calculateWordValue(b) - this.calculateWordValue(a))
      
      const selectedWords = availableWords.slice(0, levelConfig.targetWords)
      selectedWords.forEach(word => usedWords.add(word.word))
      
      allocation[levelConfig.level] = {
        config: levelConfig,
        words: selectedWords.map(w => w.word),
        coverage: selectedWords.length
      }
      
      console.log(`第${levelConfig.level}关 ${levelConfig.theme}: ${selectedWords.length}个单词`)
    })
    
    const totalNewWords = Object.values(allocation).reduce((sum, level) => sum + level.coverage, 0)
    const newCoverageRate = ((this.currentCoverage.allocatedCount + totalNewWords) / this.currentCoverage.totalWords * 100).toFixed(1)
    
    console.log(`\n📈 扩展效果:`)
    console.log(`- 新增单词: ${totalNewWords}个`)
    console.log(`- 新覆盖率: ${newCoverageRate}%`)
    console.log(`- 提升幅度: +${(newCoverageRate - this.currentCoverage.coverageRate).toFixed(1)}%`)
    
    return allocation
  }

  /**
   * 检查难度兼容性
   */
  isDifficultyCompatible(wordDifficulty, targetDifficulty) {
    const difficultyOrder = ['beginner', 'easy', 'basic', 'medium', 'intermediate', 'hard', 'advanced', 'expert']
    const targetIndex = difficultyOrder.indexOf(targetDifficulty)
    const wordIndex = difficultyOrder.indexOf(wordDifficulty)
    
    return Math.abs(targetIndex - wordIndex) <= 2
  }

  /**
   * 计算单词学习价值
   */
  calculateWordValue(word) {
    let value = 0
    
    // 有例句加分
    if (word.sentence) value += 5
    
    // 有提示加分
    if (word.tips && word.tips.length > 0) value += 3
    
    // 单词长度评分（适中长度更好）
    const length = word.word.length
    if (length >= 3 && length <= 8) value += 2
    
    // 音节数评分
    if (word.syllables && word.syllables.length <= 3) value += 2
    
    return value
  }

  /**
   * 生成扩展配置文件
   */
  generateExpansionConfig(selectedPlan) {
    const config = {
      planName: selectedPlan.name,
      targetCoverage: selectedPlan.targetCoverage,
      newLevels: selectedPlan.newLevels,
      implementation: selectedPlan.implementation(),
      timestamp: new Date().toISOString()
    }
    
    return config
  }
}

/**
 * 主函数
 */
function main() {
  const expansionPlan = new WordCoverageExpansionPlan()
  const options = expansionPlan.generateExpansionPlan()
  
  console.log('\n💡 推荐方案:')
  console.log('建议选择"渐进式扩展方案"或"智能优化方案"，既能显著提升覆盖率，又不会过度增加关卡数量。')
  
  console.log('\n🔧 实施步骤:')
  console.log('1. 选择合适的扩展方案')
  console.log('2. 更新 unified-level-themes.js 添加新关卡配置')
  console.log('3. 运行扩展分配算法')
  console.log('4. 更新 word-library.js 的 OPTIMIZED_LEVEL_MAPPING')
  console.log('5. 测试验证新的分配效果')
  
  return options
}

// 如果直接运行此文件，执行分析
if (require.main === module) {
  main()
}

module.exports = {
  WordCoverageExpansionPlan
}