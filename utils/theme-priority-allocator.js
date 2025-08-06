/**
 * 基于主题相关性优先的单词分配器
 * 解决当前关卡单词与主题不匹配的问题
 */

const wordLibrary = require('./word-library.js')
const unifiedThemes = require('./unified-level-themes.js')

class ThemePriorityAllocator {
  constructor() {
    this.allWords = wordLibrary.getAllPrimaryWords()
    this.wordsByCategory = this.groupWordsByCategory()
    this.allocationHistory = new Set()
    
    // 定义分类兼容性映射
    this.categoryCompatibility = {
      '科学探索': ['自然景观', '学习用品', '基础词汇'],
      '艺术创作': ['音乐艺术', '娱乐活动', '基础词汇'],
      '运动健身': ['娱乐活动', '身体部位', '基础词汇'],
      '自然景观': ['植物花卉', '动物世界', '基础词汇'],
      '植物花卉': ['自然景观', '美食天地', '基础词汇'],
      '音乐艺术': ['艺术创作', '娱乐活动', '基础词汇'],
      '世界地理': ['自然景观', '基础词汇'],
      '职业体验': ['学习用品', '基础词汇'],
      '娱乐活动': ['音乐艺术', '艺术创作', '运动健身', '基础词汇'],
      '交通工具': ['基础词汇'],
      '动物世界': ['自然景观', '基础词汇'],
      '美食天地': ['基础词汇'],
      '家庭成员': ['基础词汇'],
      '家庭用品': ['基础词汇'],
      '学习用品': ['基础词汇'],
      '身体部位': ['基础词汇'],
      '颜色彩虹': ['基础词汇'],
      '情感表达': ['基础词汇'],
      '基础词汇': [] // 基础词汇作为万能补充
    }
  }

  /**
   * 按分类分组单词
   */
  groupWordsByCategory() {
    const grouped = {}
    this.allWords.forEach(word => {
      const category = word.category
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(word)
    })
    return grouped
  }

  /**
   * 为指定关卡分配单词（主题优先）
   */
  allocateWordsForLevel(level) {
    const levelConfig = unifiedThemes.getUnifiedLevelConfig(level)
    const targetWords = levelConfig.targetWords
    const focusCategories = levelConfig.focusCategories
    const targetDifficulty = levelConfig.difficulty
    
    console.log(`\n🎯 为第${level}关"${levelConfig.theme}"分配单词...`)
    console.log(`目标: ${targetWords}个单词, 难度: ${targetDifficulty}, 主题分类: ${focusCategories.join(', ')}`)
    
    const selectedWords = []
    
    // 第一优先级：从主题分类中选择单词
    for (const category of focusCategories) {
      if (category === '全部分类') {
        // 特殊处理：从所有分类中选择
        const remainingWords = targetWords - selectedWords.length
        const allAvailable = this.getAvailableWordsByDifficulty(targetDifficulty)
        const selected = this.selectBestWords(allAvailable, remainingWords)
        selectedWords.push(...selected)
        break
      }
      
      const categoryWords = this.getAvailableWordsFromCategory(category, targetDifficulty)
      const needed = Math.min(categoryWords.length, Math.ceil((targetWords - selectedWords.length) / (focusCategories.length - focusCategories.indexOf(category))))
      const selected = this.selectBestWords(categoryWords, needed)
      selectedWords.push(...selected)
      
      if (selectedWords.length >= targetWords) break
    }
    
    // 第二优先级：从兼容分类中补充
    if (selectedWords.length < targetWords) {
      console.log(`  需要从兼容分类补充 ${targetWords - selectedWords.length} 个单词`)
      
      for (const category of focusCategories) {
        if (selectedWords.length >= targetWords) break
        
        const compatibleCategories = this.categoryCompatibility[category] || []
        for (const compatibleCategory of compatibleCategories) {
          if (selectedWords.length >= targetWords) break
          
          const categoryWords = this.getAvailableWordsFromCategory(compatibleCategory, targetDifficulty)
          const needed = targetWords - selectedWords.length
          const selected = this.selectBestWords(categoryWords, needed)
          selectedWords.push(...selected)
        }
      }
    }
    
    // 第三优先级：从基础词汇中补充
    if (selectedWords.length < targetWords) {
      console.log(`  需要从基础词汇补充 ${targetWords - selectedWords.length} 个单词`)
      const basicWords = this.getAvailableWordsFromCategory('基础词汇', targetDifficulty)
      const needed = targetWords - selectedWords.length
      const selected = this.selectBestWords(basicWords, needed)
      selectedWords.push(...selected)
    }
    
    // 记录已分配的单词
    selectedWords.forEach(word => this.allocationHistory.add(word.word))
    
    console.log(`✅ 成功分配 ${selectedWords.length} 个单词`)
    
    return selectedWords.map(word => word.word)
  }

  /**
   * 从指定分类获取可用单词
   */
  getAvailableWordsFromCategory(category, targetDifficulty) {
    const categoryWords = this.wordsByCategory[category] || []
    return categoryWords.filter(word => {
      // 跳过已分配的单词
      if (this.allocationHistory.has(word.word)) return false
      
      // 难度匹配（允许一定容差）
      return this.isDifficultyCompatible(word.difficulty, targetDifficulty)
    })
  }

  /**
   * 按难度获取所有可用单词
   */
  getAvailableWordsByDifficulty(targetDifficulty) {
    return this.allWords.filter(word => {
      if (this.allocationHistory.has(word.word)) return false
      return this.isDifficultyCompatible(word.difficulty, targetDifficulty)
    })
  }

  /**
   * 检查难度兼容性
   */
  isDifficultyCompatible(wordDifficulty, targetDifficulty) {
    const difficultyOrder = ['beginner', 'easy', 'basic', 'medium', 'intermediate', 'hard', 'advanced', 'expert']
    const targetIndex = difficultyOrder.indexOf(targetDifficulty)
    const wordIndex = difficultyOrder.indexOf(wordDifficulty)
    
    // 对于高难度关卡，允许更大的难度容差
    if (targetIndex >= 5) { // hard及以上难度
      return wordIndex >= 2 // 允许basic及以上的所有单词
    }
    
    // 对于低难度关卡，允许±3级的难度差异
    return Math.abs(targetIndex - wordIndex) <= 3
  }

  /**
   * 从候选单词中选择最佳单词
   */
  selectBestWords(candidates, count) {
    if (candidates.length <= count) {
      return candidates
    }
    
    // 按学习价值排序（优先选择常用、重要的单词）
    const scored = candidates.map(word => ({
      word,
      score: this.calculateWordScore(word)
    }))
    
    scored.sort((a, b) => b.score - a.score)
    return scored.slice(0, count).map(item => item.word)
  }

  /**
   * 计算单词评分
   */
  calculateWordScore(word) {
    let score = 0
    
    // 单词长度评分（较短的单词更容易学习）
    score += Math.max(0, 10 - word.word.length)
    
    // 音节数评分（较少音节更容易发音）
    if (word.syllables) {
      score += Math.max(0, 5 - word.syllables.length)
    }
    
    // 有例句的单词加分
    if (word.sentence) {
      score += 3
    }
    
    // 有提示的单词加分
    if (word.tips && word.tips.length > 0) {
      score += 2
    }
    
    return score
  }

  /**
   * 生成完整的关卡分配方案
   */
  generateCompleteAllocation() {
    console.log('🚀 开始生成基于主题优先的关卡分配方案...\n')
    
    const allocation = {}
    
    for (let level = 1; level <= 20; level++) {
      allocation[level] = this.allocateWordsForLevel(level)
    }
    
    console.log('\n✅ 完成所有关卡的单词分配')
    this.printAllocationSummary(allocation)
    
    return allocation
  }

  /**
   * 打印分配摘要
   */
  printAllocationSummary(allocation) {
    console.log('\n=== 分配摘要 ===')
    
    for (let level = 1; level <= 20; level++) {
      const levelConfig = unifiedThemes.getUnifiedLevelConfig(level)
      const words = allocation[level]
      
      // 计算主题匹配度
      let themeMatchCount = 0
      words.forEach(wordKey => {
        const word = this.allWords.find(w => w.word === wordKey)
        if (word && (levelConfig.focusCategories.includes(word.category) || levelConfig.focusCategories.includes('全部分类'))) {
          themeMatchCount++
        }
      })
      
      const matchRate = ((themeMatchCount / words.length) * 100).toFixed(1)
      console.log(`第${level}关 ${levelConfig.theme}: ${words.length}个单词, 主题匹配度 ${matchRate}%`)
    }
  }
}

// 如果直接运行此文件，生成新的分配方案
if (require.main === module) {
  const allocator = new ThemePriorityAllocator()
  const allocation = allocator.generateCompleteAllocation()
  
  // 可以选择性地输出到文件
  console.log('\n如需应用此分配方案，请运行: node apply-theme-priority-allocation.js')
}

module.exports = {
  ThemePriorityAllocator
}