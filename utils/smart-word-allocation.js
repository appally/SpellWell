/**
 * 智能单词选择和分配算法
 * 基于科学难度分级和认知学习理论
 */

const enhancedDifficulty = require('./enhanced-difficulty-system.js')
const unifiedThemes = require('./unified-level-themes.js')
const wordLibrary = require('./word-library.js')

/**
 * 智能单词分配器
 */
class SmartWordAllocator {
  constructor() {
    this.wordDatabase = wordLibrary.PRIMARY_WORD_DATABASE
    this.allWords = Object.keys(this.wordDatabase)
    this.wordAssessments = this.generateWordAssessments()
    this.allocationHistory = new Set() // 追踪已分配的单词
  }

  /**
   * 生成所有单词的评估数据
   */
  generateWordAssessments() {
    console.log('🧠 生成智能单词评估数据...')
    
    const assessments = new Map()
    
    this.allWords.forEach(wordKey => {
      const word = this.wordDatabase[wordKey]
      const assessment = enhancedDifficulty.calculateScientificDifficulty(word, wordKey)
      
      // 扩展评估信息
      const extendedAssessment = {
        ...assessment,
        category: word.category,
        themeRelevance: this.calculateThemeRelevance(word),
        memoryDifficulty: this.calculateMemoryDifficulty(word, wordKey),
        prerequisiteWords: this.identifyPrerequisites(word, wordKey),
        learningValue: this.calculateLearningValue(word, wordKey)
      }
      
      assessments.set(wordKey, extendedAssessment)
    })
    
    return assessments
  }

  /**
   * 计算单词的主题相关性
   */
  calculateThemeRelevance(word) {
    const relevanceMap = {
      '基础词汇': ['英语启蒙', '日常问候', '我的家人', '综合复习', '终极挑战'],
      '家庭成员': ['我的家人'],
      '动物世界': ['可爱动物'],
      '美食天地': ['美味食物'],
      '身体部位': ['认识自己'],
      '颜色彩虹': ['缤纷色彩'],
      '学习用品': ['学习好帮手'],
      '自然景观': ['大自然的礼物'],
      '交通工具': ['出行小能手'],
      '运动健身': ['运动小达人'],
      '家庭用品': ['温馨的家'],
      '情感表达': ['我的心情', '日常问候'],
      '娱乐活动': ['快乐时光'],
      '职业体验': ['未来梦想'],
      '科学探索': ['小小科学家'],
      '艺术创作': ['创意无限'],
      '世界地理': ['环游世界'],
      '音乐艺术': ['快乐时光', '创意无限']
    }
    
    return relevanceMap[word.category] || []
  }

  /**
   * 计算记忆难度
   */
  calculateMemoryDifficulty(word, wordKey) {
    const wordText = word.word || wordKey
    let difficulty = 0
    
    // 长度影响记忆
    difficulty += Math.min(wordText.length * 0.3, 2)
    
    // 相似单词干扰
    const similarWords = this.findSimilarWords(wordText)
    difficulty += similarWords.length * 0.2
    
    // 抽象概念难记忆
    const abstractCategories = ['情感表达', '科学探索', '艺术创作']
    if (abstractCategories.includes(word.category)) {
      difficulty += 1.0
    }
    
    // 有记忆技巧的单词容易记忆
    if (word.tips && word.tips.length > 0) {
      difficulty -= 0.8
    }
    
    return Math.max(0, difficulty)
  }

  /**
   * 识别前置单词
   */
  identifyPrerequisites(word, wordKey) {
    const prerequisites = []
    const wordText = word.word || wordKey
    
    // 基于词根和常见组合
    if (wordText.includes('ing')) prerequisites.push('go', 'play', 'run')
    if (wordText.includes('ed')) prerequisites.push('play', 'walk', 'talk')
    if (wordText.includes('er')) prerequisites.push('teach', 'work', 'play')
    
    // 基于语义关系
    const semanticRelations = {
      'mother': ['family'],
      'father': ['family'],
      'brother': ['family', 'mother', 'father'],
      'sister': ['family', 'mother', 'father'],
      'afternoon': ['morning', 'day'],
      'tomorrow': ['today', 'day'],
      'yesterday': ['today', 'day']
    }
    
    return semanticRelations[wordText.toLowerCase()] || []
  }

  /**
   * 计算学习价值
   */
  calculateLearningValue(word, wordKey) {
    const wordText = word.word || wordKey
    let value = 5 // 基础价值
    
    // 高频词汇价值高
    const highFrequencyWords = [
      'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
      'has', 'he', 'in', 'is', 'it', 'of', 'on', 'that', 'the', 'to',
      'was', 'were', 'will', 'with', 'you', 'can', 'do', 'get', 'go',
      'good', 'have', 'like', 'make', 'see', 'this', 'time', 'way'
    ]
    
    if (highFrequencyWords.includes(wordText.toLowerCase())) {
      value += 3
    }
    
    // 基础词汇价值高
    if (word.category === '基础词汇') {
      value += 2
    }
    
    // 日常生活相关价值高
    const dailyCategories = ['家庭成员', '美食天地', '身体部位', '颜色彩虹']
    if (dailyCategories.includes(word.category)) {
      value += 1
    }
    
    return value
  }

  /**
   * 寻找相似单词
   */
  findSimilarWords(targetWord) {
    return this.allWords.filter(wordKey => {
      const word = wordLibrary.PRIMARY_WORD_DATABASE[wordKey].word || wordKey
      if (word === targetWord) return false
      
      // 长度相似
      if (Math.abs(word.length - targetWord.length) <= 1) {
        // 编辑距离相似
        const editDistance = this.calculateEditDistance(word, targetWord)
        return editDistance <= 2
      }
      
      return false
    })
  }

  /**
   * 计算编辑距离
   */
  calculateEditDistance(str1, str2) {
    const len1 = str1.length
    const len2 = str2.length
    const dp = Array(len1 + 1).fill().map(() => Array(len2 + 1).fill(0))
    
    for (let i = 0; i <= len1; i++) dp[i][0] = i
    for (let j = 0; j <= len2; j++) dp[0][j] = j
    
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1]
        } else {
          dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1
        }
      }
    }
    
    return dp[len1][len2]
  }

  /**
   * 为指定关卡智能选择单词
   */
  selectWordsForLevel(level) {
    const levelConfig = unifiedThemes.getUnifiedLevelConfig(level)
    const targetWords = levelConfig.targetWords
    const targetDifficulty = levelConfig.difficulty
    const focusCategories = levelConfig.focusCategories
    
    console.log(`\n🎯 为关卡${level}选择单词...`)
    console.log(`目标: ${targetWords}个单词, 难度: ${targetDifficulty}, 分类: ${focusCategories.join(', ')}`)
    
    // 1. 获取候选单词
    const candidates = this.getCandidateWords(targetDifficulty, focusCategories)
    
    // 2. 基于多个维度评分
    const scoredCandidates = candidates.map(wordKey => ({
      wordKey,
      score: this.calculateSelectionScore(wordKey, levelConfig, level)
    }))
    
    // 3. 排序并选择
    scoredCandidates.sort((a, b) => b.score - a.score)
    
    // 4. 智能选择，确保多样性
    const selectedWords = this.intelligentSelection(scoredCandidates, targetWords, levelConfig)
    
    // 5. 记录已分配的单词
    selectedWords.forEach(wordKey => this.allocationHistory.add(wordKey))
    
    console.log(`✅ 选择了${selectedWords.length}个单词`)
    
    return selectedWords
  }

  /**
   * 获取候选单词
   */
  getCandidateWords(targetDifficulty, focusCategories) {
    const candidates = []
    
    this.allWords.forEach(wordKey => {
      // 跳过已分配的单词
      if (this.allocationHistory.has(wordKey)) return
      
      const assessment = this.wordAssessments.get(wordKey)
      const word = this.wordDatabase[wordKey]
      
      // 难度匹配（允许一定容差）
      const difficultyOrder = ['beginner', 'basic', 'intermediate', 'advanced', 'expert']
      const targetIndex = difficultyOrder.indexOf(targetDifficulty)
      const wordIndex = difficultyOrder.indexOf(assessment.difficulty)
      
      if (Math.abs(targetIndex - wordIndex) <= 1) {
        // 分类匹配
        if (focusCategories.includes('全部分类') || 
            focusCategories.includes(word.category)) {
          candidates.push(wordKey)
        }
      }
    })
    
    return candidates
  }

  /**
   * 计算选择评分
   */
  calculateSelectionScore(wordKey, levelConfig, level) {
    const assessment = this.wordAssessments.get(wordKey)
    const word = this.wordDatabase[wordKey]
    let score = 0
    
    // 1. 难度匹配度 (30%)
    const difficultyMatch = this.calculateDifficultyMatch(assessment.difficulty, levelConfig.difficulty)
    score += difficultyMatch * 0.3
    
    // 2. 分类相关性 (25%)
    const categoryRelevance = levelConfig.focusCategories.includes(word.category) ? 1.0 : 0.3
    score += categoryRelevance * 0.25
    
    // 3. 学习价值 (20%)
    score += (assessment.learningValue / 10) * 0.2
    
    // 4. 记忆难度倒数 (15%)
    score += (1 / (assessment.memoryDifficulty + 1)) * 0.15
    
    // 5. 关卡位置适应性 (10%)
    const positionFit = this.calculatePositionFit(wordKey, level)
    score += positionFit * 0.1
    
    return score
  }

  /**
   * 计算难度匹配度
   */
  calculateDifficultyMatch(wordDifficulty, targetDifficulty) {
    const difficultyOrder = ['beginner', 'basic', 'intermediate', 'advanced', 'expert']
    const targetIndex = difficultyOrder.indexOf(targetDifficulty)
    const wordIndex = difficultyOrder.indexOf(wordDifficulty)
    
    const distance = Math.abs(targetIndex - wordIndex)
    return Math.max(0, 1 - distance * 0.3)
  }

  /**
   * 计算位置适应性
   */
  calculatePositionFit(wordKey, level) {
    const assessment = this.wordAssessments.get(wordKey)
    
    // 前置词汇检查
    const prerequisites = assessment.prerequisiteWords
    let prerequisitesMet = 0
    prerequisites.forEach(prereq => {
      if (this.allocationHistory.has(prereq)) {
        prerequisitesMet++
      }
    })
    
    const prerequisiteScore = prerequisites.length > 0 ? 
      (prerequisitesMet / prerequisites.length) : 1.0
    
    return prerequisiteScore
  }

  /**
   * 智能选择，确保多样性
   */
  intelligentSelection(scoredCandidates, targetWords, levelConfig) {
    const selected = []
    const categoryCount = {}
    
    // 初始化分类计数
    levelConfig.focusCategories.forEach(category => {
      categoryCount[category] = 0
    })
    
    // 确保基础词汇的比例
    const basicWordsTarget = Math.max(1, Math.floor(targetWords * 0.4))
    let basicWordsSelected = 0
    
    for (const candidate of scoredCandidates) {
      if (selected.length >= targetWords) break
      
      const word = this.wordDatabase[candidate.wordKey]
      const category = word.category
      
      // 检查分类平衡
      const maxPerCategory = Math.ceil(targetWords / levelConfig.focusCategories.length) + 2
      if (categoryCount[category] >= maxPerCategory) continue
      
      // 优先选择基础词汇
      if (category === '基础词汇' && basicWordsSelected < basicWordsTarget) {
        selected.push(candidate.wordKey)
        categoryCount[category] = (categoryCount[category] || 0) + 1
        basicWordsSelected++
        continue
      }
      
      // 选择其他分类的词汇
      if (category !== '基础词汇' || basicWordsSelected >= basicWordsTarget) {
        selected.push(candidate.wordKey)
        categoryCount[category] = (categoryCount[category] || 0) + 1
      }
    }
    
    return selected
  }

  /**
   * 生成完整的关卡分配方案
   */
  generateCompleteAllocation() {
    console.log('🚀 生成完整的智能关卡分配方案...\n')
    
    const allocation = {}
    
    for (let level = 1; level <= 20; level++) {
      const selectedWords = this.selectWordsForLevel(level)
      allocation[level] = {
        words: selectedWords,
        config: unifiedThemes.getUnifiedLevelConfig(level),
        wordDetails: selectedWords.map(wordKey => ({
          word: this.wordDatabase[wordKey].word || wordKey,
          chinese: this.wordDatabase[wordKey].chinese,
          difficulty: this.wordAssessments.get(wordKey).difficulty,
          score: this.wordAssessments.get(wordKey).score,
          category: this.wordDatabase[wordKey].category
        }))
      }
    }
    
    this.printAllocationSummary(allocation)
    return allocation
  }

  /**
   * 打印分配方案摘要
   */
  printAllocationSummary(allocation) {
    console.log('\n📋 智能分配方案摘要:')
    console.log('=' * 60)
    
    Object.entries(allocation).forEach(([level, data]) => {
      const config = data.config
      const words = data.wordDetails
      
      console.log(`\n🎮 关卡${level}: ${config.theme} (${config.difficulty})`)
      console.log(`   目标单词数: ${config.targetWords}, 实际分配: ${words.length}`)
      console.log(`   学习时间: ${config.estimatedTime}`)
      console.log(`   重点分类: ${config.focusCategories.join(', ')}`)
      
      // 显示前5个单词作为示例
      const sampleWords = words.slice(0, 5).map(w => 
        `${w.word}(${w.chinese})`
      ).join(', ')
      console.log(`   单词示例: ${sampleWords}${words.length > 5 ? '...' : ''}`)
    })
    
    // 统计信息
    const totalAllocated = Object.values(allocation).reduce((sum, data) => sum + data.words.length, 0)
    console.log(`\n📊 总计分配: ${totalAllocated}/${this.allWords.length} 个单词`)
    console.log(`📈 分配率: ${((totalAllocated / this.allWords.length) * 100).toFixed(1)}%`)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const allocator = new SmartWordAllocator()
  const allocation = allocator.generateCompleteAllocation()
}

module.exports = {
  SmartWordAllocator
}