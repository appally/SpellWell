/**
 * 平衡主题分配器
 * 确保每关约25个单词，覆盖全部507个单词，优先考虑主题相关性
 */

const { PRIMARY_WORD_DATABASE } = require('./word-library')
const unifiedThemes = require('./unified-level-themes')

class BalancedThemeAllocator {
  constructor() {
    this.wordDatabase = PRIMARY_WORD_DATABASE
    this.allWords = Object.keys(this.wordDatabase)
    this.totalWords = this.allWords.length
    this.targetLevels = 20
    this.wordsPerLevel = Math.ceil(this.totalWords / this.targetLevels) // 约25-26个单词/关
    
    console.log('🎯 初始化平衡主题分配器')
    console.log(`📚 总单词数: ${this.totalWords}`)
    console.log(`🎮 目标关卡数: ${this.targetLevels}`)
    console.log(`📝 平均每关单词数: ${this.wordsPerLevel}`)
    
    this.categoryWordMap = this.buildCategoryWordMap()
    this.usedWords = new Set()
  }

  /**
   * 构建分类-单词映射表
   */
  buildCategoryWordMap() {
    const categoryMap = {}
    
    this.allWords.forEach(wordKey => {
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
        category: category,
        chinese: word.chinese || ''
      })
    })
    
    // 对每个分类的单词按难度和长度排序
    Object.keys(categoryMap).forEach(category => {
      categoryMap[category].sort((a, b) => {
        const difficultyOrder = { 'easy': 1, 'medium': 2, 'hard': 3, 'advanced': 4 }
        const diffA = difficultyOrder[a.difficulty] || 1
        const diffB = difficultyOrder[b.difficulty] || 1
        
        if (diffA !== diffB) {
          return diffA - diffB
        }
        
        return a.length - b.length
      })
    })
    
    return categoryMap
  }

  /**
   * 为指定关卡智能分配单词
   * @param {number} level 关卡编号
   * @param {number} targetCount 目标单词数量
   * @returns {Array} 分配的单词键数组
   */
  allocateWordsForLevel(level, targetCount) {
    const levelConfig = unifiedThemes.getUnifiedLevelConfig(level)
    const focusCategories = levelConfig.focusCategories
    const targetDifficulty = levelConfig.difficulty
    
    console.log(`\n🎯 为第${level}关"${levelConfig.theme}"分配单词...`)
    console.log(`目标: ${targetCount}个单词, 难度: ${targetDifficulty}, 主题分类: ${focusCategories.join(', ')}`)
    
    const selectedWords = []
    const candidates = []
    
    // 第一步：收集主题相关的候选单词
    focusCategories.forEach(category => {
      if (category === '全部分类') {
        // 从所有分类中选择
        Object.keys(this.categoryWordMap).forEach(cat => {
          const categoryWords = this.getAvailableWordsFromCategory(cat, targetDifficulty)
          candidates.push(...categoryWords)
        })
      } else if (this.categoryWordMap[category]) {
        const categoryWords = this.getAvailableWordsFromCategory(category, targetDifficulty)
        candidates.push(...categoryWords)
      }
    })
    
    // 第二步：如果主题相关单词不足，添加基础词汇
    if (candidates.length < targetCount) {
      const basicWords = this.getAvailableWordsFromCategory('基础词汇', targetDifficulty)
      candidates.push(...basicWords)
    }
    
    // 第三步：如果仍然不足，添加所有可用单词
    if (candidates.length < targetCount) {
      const allAvailable = this.getAllAvailableWords()
      candidates.push(...allAvailable)
    }
    
    // 第四步：去重并排序
    const uniqueCandidates = this.removeDuplicatesAndSort(candidates, focusCategories, targetDifficulty)
    
    // 第五步：选择目标数量的单词
    for (let i = 0; i < Math.min(targetCount, uniqueCandidates.length); i++) {
      const candidate = uniqueCandidates[i]
      if (!this.usedWords.has(candidate.key)) {
        selectedWords.push(candidate.key)
        this.usedWords.add(candidate.key)
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
   */
  getAllAvailableWords() {
    const allWords = []
    
    this.allWords.forEach(wordKey => {
      if (!this.usedWords.has(wordKey)) {
        const word = this.wordDatabase[wordKey]
        allWords.push({
          key: wordKey,
          word: word.word || wordKey,
          difficulty: word.difficulty || 'easy',
          length: (word.word || wordKey).length,
          category: word.category || '基础词汇'
        })
      }
    })
    
    return allWords
  }

  /**
   * 检查难度兼容性
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
   */
  removeDuplicatesAndSort(candidates, focusCategories, targetDifficulty) {
    const uniqueMap = new Map()
    
    candidates.forEach(word => {
      if (!uniqueMap.has(word.key)) {
        uniqueMap.set(word.key, word)
      }
    })
    
    const uniqueCandidates = Array.from(uniqueMap.values())
    
    // 按优先级排序：主题相关性 > 难度匹配度 > 单词长度
    return uniqueCandidates.sort((a, b) => {
      // 主题相关性评分
      const themeScoreA = this.calculateThemeScore(a, focusCategories)
      const themeScoreB = this.calculateThemeScore(b, focusCategories)
      
      if (themeScoreA !== themeScoreB) {
        return themeScoreB - themeScoreA // 高分优先
      }
      
      // 难度匹配度评分
      const difficultyLevels = { 'easy': 1, 'medium': 2, 'hard': 3, 'advanced': 4 }
      const targetLevel = difficultyLevels[targetDifficulty] || 1
      const scoreA = this.calculateDifficultyScore(a.difficulty, targetLevel)
      const scoreB = this.calculateDifficultyScore(b.difficulty, targetLevel)
      
      if (scoreA !== scoreB) {
        return scoreB - scoreA
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
   * 计算主题相关性评分
   */
  calculateThemeScore(word, focusCategories) {
    if (focusCategories.includes('全部分类')) {
      return 3 // 中等优先级
    }
    
    if (focusCategories.includes(word.category)) {
      return 5 // 高优先级
    }
    
    if (word.category === '基础词汇') {
      return 2 // 基础词汇作为补充
    }
    
    return 1 // 低优先级
  }

  /**
   * 计算难度匹配评分
   */
  calculateDifficultyScore(wordDifficulty, targetLevel) {
    const difficultyLevels = { 'easy': 1, 'medium': 2, 'hard': 3, 'advanced': 4 }
    const wordLevel = difficultyLevels[wordDifficulty] || 1
    
    const diff = Math.abs(wordLevel - targetLevel)
    return Math.max(0, 4 - diff)
  }

  /**
   * 为所有20个关卡分配单词，确保覆盖全部单词
   */
  allocateAllLevels() {
    console.log('\n🚀 开始平衡分配所有20个关卡的单词...')
    
    // 重置状态
    this.usedWords.clear()
    
    const levelMapping = {}
    const remainingWords = this.totalWords
    
    // 计算每关的目标单词数，确保总和等于总单词数
    const targetCounts = this.calculateTargetCounts()
    
    console.log('\n📊 每关目标单词数:')
    targetCounts.forEach((count, index) => {
      console.log(`第${index + 1}关: ${count}个单词`)
    })
    
    // 为每个关卡分配单词
    for (let level = 1; level <= this.targetLevels; level++) {
      const targetCount = targetCounts[level - 1]
      const words = this.allocateWordsForLevel(level, targetCount)
      levelMapping[level] = words
    }
    
    // 处理剩余未分配的单词
    this.distributeRemainingWords(levelMapping)
    
    // 生成分配统计
    this.generateAllocationStats(levelMapping)
    
    return levelMapping
  }

  /**
   * 计算每关的目标单词数
   */
  calculateTargetCounts() {
    const baseCount = Math.floor(this.totalWords / this.targetLevels) // 基础数量
    const remainder = this.totalWords % this.targetLevels // 余数
    
    const targetCounts = []
    
    for (let i = 0; i < this.targetLevels; i++) {
      let count = baseCount
      
      // 将余数分配给前几关
      if (i < remainder) {
        count += 1
      }
      
      targetCounts.push(count)
    }
    
    return targetCounts
  }

  /**
   * 分配剩余未使用的单词
   */
  distributeRemainingWords(levelMapping) {
    const remainingWords = this.allWords.filter(wordKey => !this.usedWords.has(wordKey))
    
    if (remainingWords.length === 0) {
      console.log('\n✅ 所有单词都已分配完毕')
      return
    }
    
    console.log(`\n📝 还有${remainingWords.length}个单词未分配，开始补充分配...`)
    
    // 将剩余单词分配给单词数量较少的关卡
    const levelCounts = Object.keys(levelMapping).map(level => ({
      level: parseInt(level),
      count: levelMapping[level].length
    })).sort((a, b) => a.count - b.count)
    
    let wordIndex = 0
    for (const levelInfo of levelCounts) {
      if (wordIndex >= remainingWords.length) break
      
      const level = levelInfo.level
      const currentCount = levelMapping[level].length
      const targetCount = this.wordsPerLevel
      
      // 如果当前关卡单词数少于目标数，补充单词
      while (currentCount + (levelMapping[level].length - currentCount) < targetCount && wordIndex < remainingWords.length) {
        levelMapping[level].push(remainingWords[wordIndex])
        this.usedWords.add(remainingWords[wordIndex])
        wordIndex++
      }
    }
    
    // 如果还有剩余单词，平均分配到所有关卡
    while (wordIndex < remainingWords.length) {
      for (let level = 1; level <= this.targetLevels && wordIndex < remainingWords.length; level++) {
        levelMapping[level].push(remainingWords[wordIndex])
        this.usedWords.add(remainingWords[wordIndex])
        wordIndex++
      }
    }
    
    console.log(`✅ 剩余${remainingWords.length}个单词分配完成`)
  }

  /**
   * 生成分配统计信息
   */
  generateAllocationStats(levelMapping) {
    console.log('\n📊 最终单词分配统计:')
    
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
    
    console.log(`\n📈 总分配单词数: ${totalAllocated}/${this.totalWords}`)
    console.log(`📊 覆盖率: ${((totalAllocated / this.totalWords) * 100).toFixed(1)}%`)
    
    console.log('\n🏷️ 分类分布:')
    Object.keys(categoryStats).sort().forEach(category => {
      console.log(`  ${category}: ${categoryStats[category]}个`)
    })
    
    console.log('\n⭐ 难度分布:')
    Object.keys(difficultyStats).sort().forEach(difficulty => {
      console.log(`  ${difficulty}: ${difficultyStats[difficulty]}个`)
    })
  }

  /**
   * 验证分配结果
   */
  validateAllocation(levelMapping) {
    const validation = {
      totalWords: 0,
      duplicates: [],
      levelCounts: [],
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
      })
      
      // 检查关卡单词数量是否合理
      const expectedCount = this.wordsPerLevel
      const tolerance = 3 // 允许±3的误差
      
      if (Math.abs(words.length - expectedCount) > tolerance) {
        validation.issues.push(`第${level}关单词数量偏差较大: ${words.length}个 (期望${expectedCount}±${tolerance})`)
      }
    })
    
    // 检查总覆盖率
    if (validation.totalWords !== this.totalWords) {
      validation.issues.push(`总单词数不匹配: ${validation.totalWords}/${this.totalWords}`)
    }
    
    return validation
  }
}

// 如果直接运行此脚本，执行分配
if (require.main === module) {
  const allocator = new BalancedThemeAllocator()
  const mapping = allocator.allocateAllLevels()
  const validation = allocator.validateAllocation(mapping)
  
  console.log('\n✅ 平衡分配完成！')
  console.log('\n🔍 验证结果:')
  console.log(`总单词数: ${validation.totalWords}/${allocator.totalWords}`)
  console.log(`重复单词: ${validation.duplicates.length}个`)
  console.log(`问题数量: ${validation.issues.length}个`)
  
  if (validation.issues.length > 0) {
    console.log('\n⚠️ 发现的问题:')
    validation.issues.forEach(issue => console.log(`  - ${issue}`))
  } else {
    console.log('\n🎉 分配结果完美！')
  }
}

module.exports = {
  BalancedThemeAllocator
}