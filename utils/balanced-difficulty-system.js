/**
 * 平衡的难度分级系统
 * 确保507个单词合理分布在各个难度级别
 */

const wordLibrary = require('./word-library.js')

/**
 * 平衡难度分级器
 */
class BalancedDifficultySystem {
  constructor() {
    this.wordDatabase = wordLibrary.PRIMARY_WORD_DATABASE
    this.allWords = Object.keys(this.wordDatabase)
    this.targetDistribution = {
      beginner: 0.20,    // 20% - 约101个单词 (关卡1-3需要32个)
      basic: 0.25,       // 25% - 约127个单词 (关卡4-7需要44个)  
      intermediate: 0.30, // 30% - 约152个单词 (关卡8-13需要91个)
      advanced: 0.15,    // 15% - 约76个单词 (关卡14-17需要63个)
      expert: 0.10       // 10% - 约51个单词 (关卡18-20需要60个)
    }
  }

  /**
   * 计算单词的综合复杂度评分
   */
  calculateComplexityScore(word, wordKey) {
    const wordText = word.word || wordKey
    let score = 0
    
    // 1. 基础长度复杂度 (权重30%)
    const length = wordText.length
    if (length <= 2) score += 1
    else if (length <= 4) score += 2
    else if (length <= 6) score += 3
    else if (length <= 8) score += 4
    else score += 5
    
    // 2. 音节复杂度 (权重25%)
    const syllableCount = word.syllables ? word.syllables.length : this.estimateSyllables(wordText)
    score += syllableCount * 0.8
    
    // 3. 拼写规律复杂度 (权重25%)
    let spellingComplexity = 0
    
    // 元音组合
    const vowelCombinations = (wordText.match(/[aeiou]{2,}/g) || []).length
    spellingComplexity += vowelCombinations * 0.5
    
    // 辅音组合
    const consonantCombinations = (wordText.match(/[bcdfghjklmnpqrstvwxyz]{2,}/g) || []).length
    spellingComplexity += consonantCombinations * 0.6
    
    // 特殊组合
    if (/th|sh|ch|wh|ph|gh/.test(wordText)) spellingComplexity += 0.8
    if (/tion|sion|ture/.test(wordText)) spellingComplexity += 1.2
    
    score += spellingComplexity
    
    // 4. 语义抽象度 (权重20%)
    const semanticScore = this.calculateSemanticComplexity(word)
    score += semanticScore
    
    // 5. 原始难度标记参考
    const originalDifficultyBonus = {
      'easy': 0,
      'medium': 0.5,
      'advanced': 1.0,
      'hard': 1.5
    }
    score += originalDifficultyBonus[word.difficulty] || 0
    
    return Math.round(score * 10) / 10
  }

  /**
   * 计算语义复杂度
   */
  calculateSemanticComplexity(word) {
    let complexity = 1 // 基础值
    
    // 抽象概念更复杂
    const abstractCategories = ['情感表达', '科学探索', '世界地理', '艺术创作']
    if (abstractCategories.includes(word.category)) {
      complexity += 1.5
    }
    
    // 具体概念较简单
    const concreteCategories = ['动物世界', '美食天地', '身体部位', '颜色彩虹']
    if (concreteCategories.includes(word.category)) {
      complexity += 0.3
    }
    
    // 基础词汇较简单
    if (word.category === '基础词汇') {
      complexity += 0.2
    }
    
    return complexity
  }

  /**
   * 估算音节数
   */
  estimateSyllables(word) {
    // 简单估算：元音组合大致对应音节
    const vowels = word.toLowerCase().match(/[aeiou]+/g)
    return vowels ? vowels.length : 1
  }

  /**
   * 基于百分位数重新分配难度等级
   */
  reassignDifficulties() {
    console.log('⚖️ 重新平衡507个单词的难度分级...\n')
    
    // 1. 计算所有单词的复杂度评分
    const wordScores = this.allWords.map(wordKey => {
      const word = this.wordDatabase[wordKey]
      return {
        wordKey,
        word: word.word || wordKey,
        score: this.calculateComplexityScore(word, wordKey),
        originalDifficulty: word.difficulty,
        category: word.category
      }
    })
    
    // 2. 按复杂度评分排序
    wordScores.sort((a, b) => a.score - b.score)
    
    // 3. 基于目标分布计算百分位点
    const totalWords = wordScores.length
    const breakpoints = {
      beginner: Math.floor(totalWords * this.targetDistribution.beginner),
      basic: Math.floor(totalWords * (this.targetDistribution.beginner + this.targetDistribution.basic)),
      intermediate: Math.floor(totalWords * (this.targetDistribution.beginner + this.targetDistribution.basic + this.targetDistribution.intermediate)),
      advanced: Math.floor(totalWords * (this.targetDistribution.beginner + this.targetDistribution.basic + this.targetDistribution.intermediate + this.targetDistribution.advanced))
    }
    
    // 4. 分配新的难度等级
    const reassignments = []
    const newDistribution = {
      beginner: 0,
      basic: 0,
      intermediate: 0,
      advanced: 0,
      expert: 0
    }
    
    wordScores.forEach((wordScore, index) => {
      let newDifficulty
      
      if (index < breakpoints.beginner) {
        newDifficulty = 'beginner'
      } else if (index < breakpoints.basic) {
        newDifficulty = 'basic'
      } else if (index < breakpoints.intermediate) {
        newDifficulty = 'intermediate'
      } else if (index < breakpoints.advanced) {
        newDifficulty = 'advanced'
      } else {
        newDifficulty = 'expert'
      }
      
      reassignments.push({
        ...wordScore,
        newDifficulty
      })
      
      newDistribution[newDifficulty]++
    })
    
    // 5. 输出结果
    this.printReassignmentResults(reassignments, newDistribution)
    
    return reassignments
  }

  /**
   * 打印重新分配结果
   */
  printReassignmentResults(reassignments, distribution) {
    console.log('📊 新的平衡难度分布:')
    console.log('=' * 50)
    
    Object.entries(distribution).forEach(([level, count]) => {
      const percent = ((count / this.allWords.length) * 100).toFixed(1)
      const levelNames = {
        beginner: '🌟 入门级',
        basic: '📚 基础级',
        intermediate: '🎯 中级',
        advanced: '💪 高级',
        expert: '👑 专家级'
      }
      console.log(`${levelNames[level]}: ${count}个 (${percent}%)`)
    })
    
    // 显示各关卡需求和可用单词对比
    console.log('\n🎮 关卡需求 vs 可用单词:')
    const levelRequirements = {
      beginner: '关卡1-3: 需要32个',
      basic: '关卡4-7: 需要44个',
      intermediate: '关卡8-13: 需要91个', 
      advanced: '关卡14-17: 需要63个',
      expert: '关卡18-20: 需要60个'
    }
    
    Object.entries(levelRequirements).forEach(([level, requirement]) => {
      const available = distribution[level]
      const status = this.getRequirementStatus(level, available)
      console.log(`${requirement} -> 可用${available}个 ${status}`)
    })
    
    // 显示显著变化的单词
    const significantChanges = reassignments.filter(r => 
      this.getDifficultyIndex(r.originalDifficulty) !== this.getDifficultyIndex(r.newDifficulty)
    )
    
    console.log(`\n🔄 难度调整的单词 (共${significantChanges.length}个):`)
    
    // 按调整幅度分组显示
    const upgrades = significantChanges.filter(r => 
      this.getDifficultyIndex(r.newDifficulty) > this.getDifficultyIndex(r.originalDifficulty)
    )
    const downgrades = significantChanges.filter(r => 
      this.getDifficultyIndex(r.newDifficulty) < this.getDifficultyIndex(r.originalDifficulty)
    )
    
    console.log(`📈 难度提升: ${upgrades.length}个`)
    upgrades.slice(0, 5).forEach(r => {
      console.log(`  ${r.word}: ${r.originalDifficulty} → ${r.newDifficulty} (评分: ${r.score})`)
    })
    
    console.log(`📉 难度降低: ${downgrades.length}个`)
    downgrades.slice(0, 5).forEach(r => {
      console.log(`  ${r.word}: ${r.originalDifficulty} → ${r.newDifficulty} (评分: ${r.score})`)
    })
  }

  /**
   * 获取难度需求状态
   */
  getRequirementStatus(level, available) {
    const requirements = {
      beginner: 32,
      basic: 44,
      intermediate: 91,
      advanced: 63,
      expert: 60
    }
    
    const needed = requirements[level]
    if (available >= needed) {
      return `✅ (余${available - needed}个)`
    } else {
      return `⚠️ (缺${needed - available}个)`
    }
  }

  /**
   * 获取难度索引
   */
  getDifficultyIndex(difficulty) {
    const difficultyOrder = ['easy', 'medium', 'advanced', 'hard', 'beginner', 'basic', 'intermediate', 'advanced', 'expert']
    return difficultyOrder.indexOf(difficulty)
  }

  /**
   * 生成优化的关卡分配映射
   */
  generateOptimizedMapping() {
    const reassignments = this.reassignDifficulties()
    
    // 按新难度分组
    const wordsByDifficulty = {
      beginner: [],
      basic: [],
      intermediate: [],
      advanced: [],
      expert: []
    }
    
    reassignments.forEach(item => {
      wordsByDifficulty[item.newDifficulty].push(item)
    })
    
    console.log('\n🎯 生成优化的关卡映射...')
    
    // 生成关卡映射
    const levelMapping = {}
    
    // 关卡1-3: beginner
    this.allocateWordsToLevels(levelMapping, wordsByDifficulty.beginner, [1, 2, 3], [10, 10, 12])
    
    // 关卡4-7: basic  
    this.allocateWordsToLevels(levelMapping, wordsByDifficulty.basic, [4, 5, 6, 7], [12, 12, 10, 10])
    
    // 关卡8-13: intermediate
    this.allocateWordsToLevels(levelMapping, wordsByDifficulty.intermediate, [8, 9, 10, 11, 12, 13], [14, 14, 12, 12, 16, 16])
    
    // 关卡14-17: advanced
    this.allocateWordsToLevels(levelMapping, wordsByDifficulty.advanced, [14, 15, 16, 17], [18, 18, 15, 12])
    
    // 关卡18-20: expert
    this.allocateWordsToLevels(levelMapping, wordsByDifficulty.expert, [18, 19, 20], [15, 20, 25])
    
    return levelMapping
  }

  /**
   * 将单词分配到具体关卡
   */
  allocateWordsToLevels(levelMapping, availableWords, levels, targetCounts) {
    let wordIndex = 0
    
    levels.forEach((level, i) => {
      const targetCount = targetCounts[i]
      const wordsForLevel = []
      
      for (let j = 0; j < targetCount && wordIndex < availableWords.length; j++, wordIndex++) {
        wordsForLevel.push(availableWords[wordIndex])
      }
      
      levelMapping[level] = wordsForLevel
      console.log(`关卡${level}: 分配${wordsForLevel.length}/${targetCount}个单词`)
    })
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const system = new BalancedDifficultySystem()
  const mapping = system.generateOptimizedMapping()
}

module.exports = {
  BalancedDifficultySystem
}