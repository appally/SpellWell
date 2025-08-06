/**
 * 优化版单词库管理模块 - 集成所有优化方案
 * 包含：科学难度分级、统一主题配置、智能分配算法、渐进式学习曲线
 */

// 直接使用原始单词数据库（避免循环引用）
const wordLibraryBackup = require('./word-library.js.backup')
const BalancedDifficultySystem = require('./balanced-difficulty-system.js')
const unifiedThemes = require('./unified-level-themes.js')

// 使用原始单词数据库
const PRIMARY_WORD_DATABASE = wordLibraryBackup.PRIMARY_WORD_DATABASE

/**
 * 优化的关卡数据管理器
 */
class OptimizedLevelManager {
  constructor() {
    this.wordDatabase = PRIMARY_WORD_DATABASE
    this.allWords = Object.keys(this.wordDatabase)
    this.difficultySystem = new BalancedDifficultySystem.BalancedDifficultySystem()
    
    // 生成优化的单词-关卡映射
    this.levelWordMapping = this.generateLevelWordMapping()
    
    // 缓存关卡数据
    this.levelCache = new Map()
    
    console.log('🚀 优化版单词库管理器初始化完成')
  }

  /**
   * 生成优化的关卡-单词映射
   */
  generateLevelWordMapping() {
    console.log('🧠 生成优化的关卡-单词映射...')
    
    // 获取平衡难度分级的结果
    const reassignments = this.difficultySystem.reassignDifficulties()
    
    // 按新难度分组
    const wordsByDifficulty = {
      beginner: [],
      basic: [],
      intermediate: [],
      advanced: [],
      expert: []
    }
    
    reassignments.forEach(item => {
      wordsByDifficulty[item.newDifficulty].push(item.wordKey)
    })
    
    // 基于主题相关性重新排序
    Object.keys(wordsByDifficulty).forEach(difficulty => {
      wordsByDifficulty[difficulty] = this.sortWordsByThemeRelevance(
        wordsByDifficulty[difficulty], difficulty
      )
    })
    
    // 分配到具体关卡
    const mapping = {}
    
    // 关卡1-3: beginner (32个单词)
    mapping[1] = this.selectBestWordsForLevel(wordsByDifficulty.beginner, 1, 10)
    mapping[2] = this.selectBestWordsForLevel(wordsByDifficulty.beginner, 2, 10)  
    mapping[3] = this.selectBestWordsForLevel(wordsByDifficulty.beginner, 3, 12)
    
    // 关卡4-7: basic (44个单词)
    mapping[4] = this.selectBestWordsForLevel(wordsByDifficulty.basic, 4, 12)
    mapping[5] = this.selectBestWordsForLevel(wordsByDifficulty.basic, 5, 12)
    mapping[6] = this.selectBestWordsForLevel(wordsByDifficulty.basic, 6, 10)
    mapping[7] = this.selectBestWordsForLevel(wordsByDifficulty.basic, 7, 10)
    
    // 关卡8-13: intermediate (91个单词)
    mapping[8] = this.selectBestWordsForLevel(wordsByDifficulty.intermediate, 8, 14)
    mapping[9] = this.selectBestWordsForLevel(wordsByDifficulty.intermediate, 9, 14)
    mapping[10] = this.selectBestWordsForLevel(wordsByDifficulty.intermediate, 10, 12)
    mapping[11] = this.selectBestWordsForLevel(wordsByDifficulty.intermediate, 11, 12)
    mapping[12] = this.selectBestWordsForLevel(wordsByDifficulty.intermediate, 12, 16)
    mapping[13] = this.selectBestWordsForLevel(wordsByDifficulty.intermediate, 13, 16)
    
    // 关卡14-17: advanced (63个单词)
    mapping[14] = this.selectBestWordsForLevel(wordsByDifficulty.advanced, 14, 18)
    mapping[15] = this.selectBestWordsForLevel(wordsByDifficulty.advanced, 15, 18)
    mapping[16] = this.selectBestWordsForLevel(wordsByDifficulty.advanced, 16, 15)
    mapping[17] = this.selectBestWordsForLevel(wordsByDifficulty.advanced, 17, 12)
    
    // 关卡18-20: expert (51个单词，尽力分配)
    mapping[18] = this.selectBestWordsForLevel(wordsByDifficulty.expert, 18, 15)
    mapping[19] = this.selectBestWordsForLevel(wordsByDifficulty.expert, 19, 20)
    mapping[20] = this.selectBestWordsForLevel(wordsByDifficulty.expert, 20, 16)
    
    console.log('✅ 关卡-单词映射生成完成')
    return mapping
  }

  /**
   * 基于主题相关性排序单词
   */
  sortWordsByThemeRelevance(wordKeys, difficulty) {
    return wordKeys.sort((a, b) => {
      const wordA = this.wordDatabase[a]
      const wordB = this.wordDatabase[b]
      
      // 基础词汇优先
      if (wordA.category === '基础词汇' && wordB.category !== '基础词汇') return -1
      if (wordB.category === '基础词汇' && wordA.category !== '基础词汇') return 1
      
      // 高频词汇优先
      const highFrequencyWords = ['a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 'in', 'is', 'it', 'of', 'on', 'that', 'the', 'to', 'was', 'were', 'will', 'with', 'you']
      const isHighFreqA = highFrequencyWords.includes((wordA.word || a).toLowerCase())
      const isHighFreqB = highFrequencyWords.includes((wordB.word || b).toLowerCase())
      
      if (isHighFreqA && !isHighFreqB) return -1
      if (isHighFreqB && !isHighFreqA) return 1
      
      // 按单词长度排序
      const lengthA = (wordA.word || a).length
      const lengthB = (wordB.word || b).length
      return lengthA - lengthB
    })
  }

  /**
   * 为指定关卡选择最佳单词
   */
  selectBestWordsForLevel(availableWords, level, targetCount) {
    const levelConfig = unifiedThemes.getUnifiedLevelConfig(level)
    const focusCategories = levelConfig.focusCategories
    
    // 已分配的单词集合（避免重复）
    if (!this.allocatedWords) {
      this.allocatedWords = new Set()
    }
    
    // 筛选候选词
    const candidates = availableWords.filter(wordKey => {
      if (this.allocatedWords.has(wordKey)) return false
      
      const word = this.wordDatabase[wordKey]
      
      // 检查分类匹配
      if (focusCategories.includes('全部分类')) return true
      return focusCategories.some(category => category === word.category)
    })
    
    // 如果候选词不足，从基础词汇中补充
    if (candidates.length < targetCount) {
      const basicWords = availableWords.filter(wordKey => {
        if (this.allocatedWords.has(wordKey)) return false
        const word = this.wordDatabase[wordKey]
        return word.category === '基础词汇'
      })
      
      candidates.push(...basicWords.slice(0, targetCount - candidates.length))
    }
    
    // 选择最终单词
    const selectedWords = candidates.slice(0, targetCount)
    
    // 记录已分配的单词
    selectedWords.forEach(wordKey => this.allocatedWords.add(wordKey))
    
    return selectedWords
  }

  /**
   * 获取优化后的关卡数据
   */
  getLevelWords(level) {
    // 检查缓存
    if (this.levelCache.has(level)) {
      return this.levelCache.get(level)
    }
    
    // 确保关卡在有效范围内
    if (level < 1 || level > 20) {
      level = 1
    }
    
    // 获取关卡配置
    const levelConfig = unifiedThemes.getUnifiedLevelConfig(level)
    
    // 获取分配的单词
    const wordKeys = this.levelWordMapping[level] || []
    
    // 格式化单词数据
    const words = wordKeys.map(wordKey => {
      const wordData = this.wordDatabase[wordKey]
      return {
        word: wordData.word || wordKey,
        phonetic: wordData.phonetic,
        chinese: wordData.chinese,
        image: wordData.image || '📝',
        category: wordData.category,
        difficulty: wordData.difficulty,
        syllables: wordData.syllables,
        tips: wordData.tips,
        sentence: wordData.sentence
      }
    })
    
    const levelData = {
      level,
      theme: levelConfig.theme,
      name: levelConfig.name,
      description: levelConfig.description,
      icon: levelConfig.icon,
      words,
      totalWords: words.length,
      wordCount: words.length,
      targetWords: levelConfig.targetWords,
      difficulty: levelConfig.difficulty,
      focusCategories: levelConfig.focusCategories,
      learningGoals: levelConfig.learningGoals,
      interactionTypes: levelConfig.interactionTypes,
      estimatedTime: levelConfig.estimatedTime
    }
    
    // 缓存数据
    this.levelCache.set(level, levelData)
    
    return levelData
  }

  /**
   * 获取所有关卡概览
   */
  getAllLevelsOverview() {
    const overview = []
    
    for (let level = 1; level <= 35; level++) {
      const levelData = this.getLevelWords(level)
      overview.push({
        level,
        theme: levelData.theme,
        name: levelData.name,
        difficulty: levelData.difficulty,
        wordCount: levelData.wordCount,
        targetWords: levelData.targetWords,
        estimatedTime: levelData.estimatedTime,
        icon: levelData.icon
      })
    }
    
    return overview
  }

  /**
   * 生成分配报告
   */
  generateAllocationReport() {
    console.log('\n📊 优化版关卡分配报告')
    console.log('=' * 60)
    
    let totalAllocated = 0
    let totalTarget = 0
    
    for (let level = 1; level <= 35; level++) {
      const levelData = this.getLevelWords(level)
      totalAllocated += levelData.wordCount
      totalTarget += levelData.targetWords
      
      const status = levelData.wordCount >= levelData.targetWords ? '✅' : '⚠️'
      
      console.log(`关卡${level.toString().padStart(2)}: ${levelData.theme.padEnd(8)} | ${levelData.difficulty.padEnd(12)} | ${levelData.wordCount}/${levelData.targetWords}个单词 ${status}`)
    }
    
    console.log('\n📈 总体统计:')
    console.log(`总分配单词: ${totalAllocated}/${this.allWords.length} (${((totalAllocated/this.allWords.length)*100).toFixed(1)}%)`)
    console.log(`目标完成度: ${totalAllocated}/${totalTarget} (${((totalAllocated/totalTarget)*100).toFixed(1)}%)`)
    
    // 统计各难度级别的分配情况
    const difficultyStats = {}
    for (let level = 1; level <= 20; level++) {
      const levelData = this.getLevelWords(level)
      const difficulty = levelData.difficulty
      if (!difficultyStats[difficulty]) {
        difficultyStats[difficulty] = { levels: 0, words: 0, target: 0 }
      }
      difficultyStats[difficulty].levels++
      difficultyStats[difficulty].words += levelData.wordCount
      difficultyStats[difficulty].target += levelData.targetWords
    }
    
    console.log('\n🎯 难度级别统计:')
    Object.entries(difficultyStats).forEach(([difficulty, stats]) => {
      const completion = ((stats.words / stats.target) * 100).toFixed(1)
      console.log(`${difficulty.padEnd(12)}: ${stats.levels}关 | ${stats.words}/${stats.target}单词 (${completion}%)`)
    })
  }
}

// 创建优化管理器实例
const optimizedManager = new OptimizedLevelManager()

// 兼容原始接口的函数
function getLevelWords(level) {
  return optimizedManager.getLevelWords(level)
}

function getAllPrimaryWords() {
  return Object.keys(PRIMARY_WORD_DATABASE).map(key => {
    const wordData = PRIMARY_WORD_DATABASE[key]
    return {
      word: wordData.word || key,
      phonetic: wordData.phonetic,
      chinese: wordData.chinese,
      image: wordData.image,
      category: wordData.category,
      difficulty: wordData.difficulty,
      syllables: wordData.syllables,
      tips: wordData.tips,
      sentence: wordData.sentence
    }
  })
}

// 如果直接运行此脚本
if (require.main === module) {
  optimizedManager.generateAllocationReport()
}

// 导出所有接口（兼容原始系统）
module.exports = {
  PRIMARY_WORD_DATABASE,
  getLevelWords,
  getAllPrimaryWords,
  getWordsByCategory: wordLibraryBackup.getWordsByCategory,
  getWordsByDifficulty: wordLibraryBackup.getWordsByDifficulty,
  getRandomWords: wordLibraryBackup.getRandomWords,
  validateSpelling: wordLibraryBackup.validateSpelling,
  calculateSimilarity: wordLibraryBackup.calculateSimilarity,
  getFeedbackMessage: wordLibraryBackup.getFeedbackMessage,
  generateAIPrompt: wordLibraryBackup.generateAIPrompt,
  getWordsByGrade: wordLibraryBackup.getWordsByGrade,
  
  // 新增的优化接口
  OptimizedLevelManager,
  optimizedManager,
  levelThemes: unifiedThemes.UNIFIED_LEVEL_THEMES,
  categoryStats: originalWordLibrary.categoryStats
}