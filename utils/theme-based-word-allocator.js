/**
 * 基于主题的智能单词分配器
 * 解决关卡单词分布不合理的问题，实现科学的主题优先分配
 */

const { PRIMARY_WORD_DATABASE } = require('./word-library')
const unifiedThemes = require('./unified-level-themes')

class ThemeBasedWordAllocator {
  constructor() {
    this.wordDatabase = PRIMARY_WORD_DATABASE
    this.usedWords = new Set()
    this.levelAllocations = new Map()
    this.categoryWordMap = this.buildCategoryWordMap()
    
    console.log('🎯 初始化基于主题的智能单词分配器')
    console.log(`📚 总单词数: ${Object.keys(this.wordDatabase).length}`)
    console.log(`🏷️ 分类数量: ${Object.keys(this.categoryWordMap).length}`)
  }

  /**
   * 构建分类-单词映射表
   */
  buildCategoryWordMap() {
    const categoryMap = {}
    
    Object.keys(this.wordDatabase).forEach(wordKey => {
      const word = this.wordDatabase[wordKey]
      const category = word.category || '基础词汇'
      
      if (!categoryMap[category]) {
        categoryMap[category] = []
      }
      
      categoryMap[category].push({
        key: wordKey,
        word: word.word || wordKey,
        difficulty: word.difficulty || 'easy',
        length: (word.word || wordKey).length,
        chinese: word.chinese || '',
        phonetic: word.phonetic || ''
      })
    })
    
    // 对每个分类的单词按难度和长度排序
    Object.keys(categoryMap).forEach(category => {
      categoryMap[category].sort((a, b) => {
        // 难度权重
        const difficultyOrder = { 'easy': 1, 'medium': 2, 'hard': 3, 'advanced': 4 }
        const diffA = difficultyOrder[a.difficulty] || 1
        const diffB = difficultyOrder[b.difficulty] || 1
        
        if (diffA !== diffB) {
          return diffA - diffB
        }
        
        // 长度权重（短词优先）
        return a.length - b.length
      })
    })
    
    return categoryMap
  }

  /**
   * 为指定关卡智能分配单词
   * @param {number} level 关卡编号
   * @returns {Array} 分配的单词键数组
   */
  allocateWordsForLevel(level) {
    const levelConfig = unifiedThemes.getUnifiedLevelConfig(level)
    const targetWords = levelConfig.targetWords
    const focusCategories = levelConfig.focusCategories
    const targetDifficulty = levelConfig.difficulty
    
    console.log(`\n🎯 为第${level}关"${levelConfig.theme}"分配单词...`)
    console.log(`目标: ${targetWords}个单词, 难度: ${targetDifficulty}, 主题分类: ${focusCategories.join(', ')}`)
    
    const selectedWords = []
    const candidateWords = []
    
    // 第一优先级：从主题相关分类中选择单词
    focusCategories.forEach(category => {
      if (category === '全部分类') {
        // 特殊处理：从所有分类中选择适合难度的单词
        Object.keys(this.categoryWordMap).forEach(cat => {
          const categoryWords = this.getAvailableWordsFromCategory(cat, targetDifficulty)
          candidateWords.push(...categoryWords)
        })
      } else if (this.categoryWordMap[category]) {
        const categoryWords = this.getAvailableWordsFromCategory(category, targetDifficulty)
        candidateWords.push(...categoryWords)
      }
    })
    
    // 去重并按优先级排序
    const uniqueCandidates = this.removeDuplicatesAndSort(candidateWords, targetDifficulty)
    
    // 选择目标数量的单词
    let selectedCount = 0
    for (const candidate of uniqueCandidates) {
      if (selectedCount >= targetWords) break
      if (!this.usedWords.has(candidate.key)) {
        selectedWords.push(candidate.key)
        this.usedWords.add(candidate.key)
        selectedCount++
      }
    }
    
    // 如果主题相关单词不足，从基础词汇中补充
    if (selectedWords.length < targetWords) {
      const basicWords = this.getAvailableWordsFromCategory('基础词汇', targetDifficulty)
      const needed = targetWords - selectedWords.length
      
      for (const word of basicWords) {
        if (selectedWords.length >= targetWords) break
        if (!this.usedWords.has(word.key)) {
          selectedWords.push(word.key)
          this.usedWords.add(word.key)
        }
      }
    }
    
    // 如果仍然不足，从所有可用单词中补充
    if (selectedWords.length < targetWords) {
      const allAvailable = this.getAllAvailableWords(targetDifficulty)
      const needed = targetWords - selectedWords.length
      
      for (const word of allAvailable) {
        if (selectedWords.length >= targetWords) break
        if (!this.usedWords.has(word.key)) {
          selectedWords.push(word.key)
          this.usedWords.add(word.key)
        }
      }
    }
    
    console.log(`✅ 成功分配${selectedWords.length}个单词`)
    
    // 显示分配的单词示例
    const examples = selectedWords.slice(0, 5).map(key => {
      const word = this.wordDatabase[key]
      return `${word.word || key}(${word.category})`
    }).join(', ')
    console.log(`📝 示例单词: ${examples}${selectedWords.length > 5 ? '...' : ''}`)
    
    return selectedWords
  }

  /**
   * 从指定分类获取可用单词
   * @param {string} category 分类名称
   * @param {string} targetDifficulty 目标难度
   * @returns {Array} 可用单词数组
   */
  getAvailableWordsFromCategory(category, targetDifficulty) {
    if (!this.categoryWordMap[category]) {
      return []
    }
    
    return this.categoryWordMap[category].filter(word => {
      if (this.usedWords.has(word.key)) return false
      return this.isDifficultyCompatible(word.difficulty, targetDifficulty)
    })
  }

  /**
   * 获取所有可用单词
   * @param {string} targetDifficulty 目标难度
   * @returns {Array} 所有可用单词数组
   */
  getAllAvailableWords(targetDifficulty) {
    const allWords = []
    
    Object.keys(this.categoryWordMap).forEach(category => {
      const categoryWords = this.getAvailableWordsFromCategory(category, targetDifficulty)
      allWords.push(...categoryWords)
    })
    
    return allWords
  }

  /**
   * 检查难度兼容性
   * @param {string} wordDifficulty 单词难度
   * @param {string} targetDifficulty 目标难度
   * @returns {boolean} 是否兼容
   */
  isDifficultyCompatible(wordDifficulty, targetDifficulty) {
    const difficultyLevels = {
      'easy': 1,
      'medium': 2,
      'hard': 3,
      'advanced': 4
    }
    
    const wordLevel = difficultyLevels[wordDifficulty] || 1
    const targetLevel = difficultyLevels[targetDifficulty] || 1
    
    // 允许目标难度±1的范围
    return Math.abs(wordLevel - targetLevel) <= 1
  }

  /**
   * 去重并排序候选单词
   * @param {Array} candidates 候选单词数组
   * @param {string} targetDifficulty 目标难度
   * @returns {Array} 排序后的唯一候选单词
   */
  removeDuplicatesAndSort(candidates, targetDifficulty) {
    const uniqueMap = new Map()
    
    candidates.forEach(word => {
      if (!uniqueMap.has(word.key)) {
        uniqueMap.set(word.key, word)
      }
    })
    
    const uniqueCandidates = Array.from(uniqueMap.values())
    
    // 按优先级排序：难度匹配度 > 单词长度 > 字母顺序
    return uniqueCandidates.sort((a, b) => {
      const difficultyLevels = { 'easy': 1, 'medium': 2, 'hard': 3, 'advanced': 4 }
      const targetLevel = difficultyLevels[targetDifficulty] || 1
      
      // 难度匹配度评分
      const scoreA = this.calculateDifficultyScore(a.difficulty, targetLevel)
      const scoreB = this.calculateDifficultyScore(b.difficulty, targetLevel)
      
      if (scoreA !== scoreB) {
        return scoreB - scoreA // 高分优先
      }
      
      // 长度优先（短词优先）
      if (a.length !== b.length) {
        return a.length - b.length
      }
      
      // 字母顺序
      return a.word.localeCompare(b.word)
    })
  }

  /**
   * 计算难度匹配评分
   * @param {string} wordDifficulty 单词难度
   * @param {number} targetLevel 目标难度等级
   * @returns {number} 匹配评分
   */
  calculateDifficultyScore(wordDifficulty, targetLevel) {
    const difficultyLevels = { 'easy': 1, 'medium': 2, 'hard': 3, 'advanced': 4 }
    const wordLevel = difficultyLevels[wordDifficulty] || 1
    
    const diff = Math.abs(wordLevel - targetLevel)
    return Math.max(0, 4 - diff) // 差距越小，评分越高
  }

  /**
   * 为所有20个关卡分配单词
   * @returns {Object} 关卡-单词映射对象
   */
  allocateAllLevels() {
    console.log('\n🚀 开始为所有20个关卡分配单词...')
    
    // 重置状态
    this.usedWords.clear()
    this.levelAllocations.clear()
    
    const levelMapping = {}
    
    // 为每个关卡分配单词
    for (let level = 1; level <= 20; level++) {
      const words = this.allocateWordsForLevel(level)
      levelMapping[level] = words
      this.levelAllocations.set(level, words)
    }
    
    // 生成分配统计
    this.generateAllocationStats(levelMapping)
    
    return levelMapping
  }

  /**
   * 生成分配统计信息
   * @param {Object} levelMapping 关卡映射
   */
  generateAllocationStats(levelMapping) {
    console.log('\n📊 单词分配统计:')
    
    let totalAllocated = 0
    const categoryStats = {}
    const difficultyStats = {}
    
    Object.keys(levelMapping).forEach(level => {
      const words = levelMapping[level]
      totalAllocated += words.length
      
      console.log(`第${level}关: ${words.length}个单词`)
      
      // 统计分类分布
      words.forEach(wordKey => {
        const word = this.wordDatabase[wordKey]
        const category = word.category || '基础词汇'
        const difficulty = word.difficulty || 'easy'
        
        categoryStats[category] = (categoryStats[category] || 0) + 1
        difficultyStats[difficulty] = (difficultyStats[difficulty] || 0) + 1
      })
    })
    
    console.log(`\n📈 总分配单词数: ${totalAllocated}/${Object.keys(this.wordDatabase).length}`)
    console.log('\n🏷️ 分类分布:')
    Object.keys(categoryStats).forEach(category => {
      console.log(`  ${category}: ${categoryStats[category]}个`)
    })
    
    console.log('\n⭐ 难度分布:')
    Object.keys(difficultyStats).forEach(difficulty => {
      console.log(`  ${difficulty}: ${difficultyStats[difficulty]}个`)
    })
  }

  /**
   * 验证分配结果
   * @param {Object} levelMapping 关卡映射
   * @returns {Object} 验证结果
   */
  validateAllocation(levelMapping) {
    const validation = {
      totalWords: 0,
      duplicates: [],
      levelCounts: [],
      categoryDistribution: {},
      difficultyDistribution: {},
      issues: []
    }
    
    const allUsedWords = new Set()
    
    Object.keys(levelMapping).forEach(level => {
      const words = levelMapping[level]
      validation.totalWords += words.length
      validation.levelCounts.push({ level: parseInt(level), count: words.length })
      
      // 检查重复
      words.forEach(wordKey => {
        if (allUsedWords.has(wordKey)) {
          validation.duplicates.push(wordKey)
        } else {
          allUsedWords.add(wordKey)
        }
        
        const word = this.wordDatabase[wordKey]
        const category = word.category || '基础词汇'
        const difficulty = word.difficulty || 'easy'
        
        validation.categoryDistribution[category] = (validation.categoryDistribution[category] || 0) + 1
        validation.difficultyDistribution[difficulty] = (validation.difficultyDistribution[difficulty] || 0) + 1
      })
      
      // 检查关卡单词数量是否合理（目标25±5）
      if (words.length < 20 || words.length > 30) {
        validation.issues.push(`第${level}关单词数量异常: ${words.length}个`)
      }
    })
    
    return validation
  }
}

// 如果直接运行此脚本，执行分配
if (require.main === module) {
  const allocator = new ThemeBasedWordAllocator()
  const mapping = allocator.allocateAllLevels()
  const validation = allocator.validateAllocation(mapping)
  
  console.log('\n✅ 分配完成！')
  console.log('\n🔍 验证结果:')
  console.log(`总单词数: ${validation.totalWords}`)
  console.log(`重复单词: ${validation.duplicates.length}个`)
  console.log(`问题数量: ${validation.issues.length}个`)
  
  if (validation.issues.length > 0) {
    console.log('\n⚠️ 发现的问题:')
    validation.issues.forEach(issue => console.log(`  - ${issue}`))
  }
}

module.exports = {
  ThemeBasedWordAllocator
}