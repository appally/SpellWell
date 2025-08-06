/**
 * 实施单词库覆盖率扩展方案
 * 将覆盖率从53.6%提升到75%+
 */

const fs = require('fs')
const path = require('path')
const { WordCoverageExpansionPlan } = require('./word-coverage-expansion-plan.js')
const wordLibrary = require('./word-library.js')

class CoverageExpansionImplementer {
  constructor() {
    this.expansionPlan = new WordCoverageExpansionPlan()
  }

  /**
   * 实施完整的扩展方案
   */
  async implementFullExpansion() {
    console.log('🚀 开始实施单词库覆盖率扩展方案...\n')
    
    // 1. 分析当前状况
    const currentCoverage = this.expansionPlan.analyzeCurrentCoverage()
    console.log('📊 当前覆盖状况:')
    console.log(`- 覆盖率: ${currentCoverage.coverageRate}%`)
    console.log(`- 未分配单词: ${currentCoverage.unallocatedWords.length}个\n`)
    
    // 2. 生成扩展配置
    const newLevelConfigs = this.generateNewLevelConfigs()
    
    // 3. 更新主题配置文件
    await this.updateUnifiedLevelThemes(newLevelConfigs)
    
    // 4. 生成新的单词分配
    const newAllocation = this.generateExpandedAllocation(newLevelConfigs)
    
    // 5. 更新单词库文件
    await this.updateWordLibrary(newAllocation)
    
    // 6. 验证扩展效果
    this.validateExpansionResults()
    
    console.log('\n✅ 单词库覆盖率扩展完成！')
  }

  /**
   * 生成新关卡配置
   */
  generateNewLevelConfigs() {
    console.log('🔧 生成新关卡配置...')
    
    const newConfigs = [
      {
        level: 21,
        theme: '进阶词汇A',
        description: '基础词汇和情感表达的进阶学习',
        targetWords: 15,
        difficulty: 'medium',
        focusCategories: ['基础词汇', '情感表达'],
        learningGoals: ['扩展词汇量', '提升表达能力'],
        interactionTypes: ['拼写练习', '语音识别'],
        estimatedTime: 8
      },
      {
        level: 22,
        theme: '进阶词汇B',
        description: '美食和家居用品词汇扩展',
        targetWords: 15,
        difficulty: 'medium',
        focusCategories: ['美食天地', '家庭用品'],
        learningGoals: ['生活词汇掌握', '实用性提升'],
        interactionTypes: ['拼写练习', '语音识别'],
        estimatedTime: 8
      },
      {
        level: 23,
        theme: '进阶词汇C',
        description: '学习用品和动物世界词汇',
        targetWords: 15,
        difficulty: 'medium',
        focusCategories: ['学习用品', '动物世界'],
        learningGoals: ['学科词汇', '自然认知'],
        interactionTypes: ['拼写练习', '语音识别'],
        estimatedTime: 8
      },
      {
        level: 24,
        theme: '高级词汇A',
        description: '职业和运动相关高级词汇',
        targetWords: 18,
        difficulty: 'hard',
        focusCategories: ['职业体验', '运动健身'],
        learningGoals: ['专业词汇', '兴趣拓展'],
        interactionTypes: ['拼写练习', '语音识别', '听写模式'],
        estimatedTime: 10
      },
      {
        level: 25,
        theme: '高级词汇B',
        description: '综合高级词汇挑战',
        targetWords: 20,
        difficulty: 'hard',
        focusCategories: ['全部分类'],
        learningGoals: ['综合运用', '挑战提升'],
        interactionTypes: ['拼写练习', '语音识别', '听写模式'],
        estimatedTime: 12
      },
      {
        level: 26,
        theme: '专家词汇A',
        description: '高难度词汇掌握',
        targetWords: 22,
        difficulty: 'advanced',
        focusCategories: ['全部分类'],
        learningGoals: ['高级掌握', '专家水平'],
        interactionTypes: ['拼写练习', '语音识别', '听写模式'],
        estimatedTime: 15
      }
    ]
    
    console.log(`✅ 生成 ${newConfigs.length} 个新关卡配置\n`)
    return newConfigs
  }

  /**
   * 更新统一主题配置文件
   */
  async updateUnifiedLevelThemes(newConfigs) {
    console.log('📝 更新 unified-level-themes.js...')
    
    const filePath = path.join(__dirname, 'unified-level-themes.js')
    let fileContent = fs.readFileSync(filePath, 'utf8')
    
    // 找到 UNIFIED_LEVEL_THEMES 对象的结束位置
    const themesRegex = /const UNIFIED_LEVEL_THEMES = \{([\s\S]*?)\n\}/
    const match = fileContent.match(themesRegex)
    
    if (match) {
      const existingThemes = match[1]
      
      // 生成新关卡的配置字符串
      const newThemesString = newConfigs.map(config => {
        return `  ${config.level}: {
    theme: '${config.theme}',
    description: '${config.description}',
    targetWords: ${config.targetWords},
    difficulty: '${config.difficulty}',
    focusCategories: [${config.focusCategories.map(cat => `'${cat}'`).join(', ')}],
    learningGoals: [${config.learningGoals.map(goal => `'${goal}'`).join(', ')}],
    interactionTypes: [${config.interactionTypes.map(type => `'${type}'`).join(', ')}],
    estimatedTime: ${config.estimatedTime}
  }`
      }).join(',\n')
      
      // 替换原有内容
      const newThemesObject = `const UNIFIED_LEVEL_THEMES = {${existingThemes},\n${newThemesString}\n}`
      fileContent = fileContent.replace(themesRegex, newThemesObject)
      
      // 更新 getUnifiedLevelConfig 函数中的最大关卡数
      fileContent = fileContent.replace(
        /if \(level < 1 \|\| level > 20\)/,
        `if (level < 1 || level > ${20 + newConfigs.length})`
      )
      
      fs.writeFileSync(filePath, fileContent, 'utf8')
      console.log(`✅ 已添加 ${newConfigs.length} 个新关卡到主题配置\n`)
    } else {
      console.error('❌ 未找到 UNIFIED_LEVEL_THEMES 定义')
    }
  }

  /**
   * 生成扩展后的单词分配
   */
  generateExpandedAllocation(newConfigs) {
    console.log('🎯 生成扩展后的单词分配...')
    
    const analysis = this.expansionPlan.analyzeUnallocatedWords()
    const { unallocatedWords } = this.expansionPlan.currentCoverage
    const newAllocation = {}
    const usedWords = new Set()
    
    // 收集已分配的单词
    for (let level = 1; level <= 20; level++) {
      const levelResult = wordLibrary.getLevelWords(level)
      levelResult.words.forEach(w => {
        const wordString = typeof w === 'string' ? w : w.word || w
        usedWords.add(wordString)
      })
    }
    
    // 为新关卡分配单词
    newConfigs.forEach(config => {
      const availableWords = unallocatedWords.filter(word => {
        if (usedWords.has(word.word)) return false
        
        // 难度匹配
        if (!this.isDifficultyCompatible(word.difficulty, config.difficulty)) return false
        
        // 分类匹配
        if (config.focusCategories.includes('全部分类')) return true
        return config.focusCategories.includes(word.category)
      })
      
      // 按学习价值排序
      availableWords.sort((a, b) => this.calculateWordValue(b) - this.calculateWordValue(a))
      
      const selectedWords = availableWords.slice(0, config.targetWords)
      selectedWords.forEach(word => usedWords.add(word.word))
      
      newAllocation[config.level] = selectedWords.map(w => w.word)
      
      console.log(`第${config.level}关 ${config.theme}: ${selectedWords.length}个单词`)
    })
    
    console.log('\n✅ 新关卡单词分配完成\n')
    return newAllocation
  }

  /**
   * 更新单词库文件
   */
  async updateWordLibrary(newAllocation) {
    console.log('📝 更新 word-library.js...')
    
    const filePath = path.join(__dirname, 'word-library.js')
    let fileContent = fs.readFileSync(filePath, 'utf8')
    
    // 找到 OPTIMIZED_LEVEL_MAPPING 的结束位置
    const mappingRegex = /const OPTIMIZED_LEVEL_MAPPING = \{([\s\S]*?)\n\}/
    const match = fileContent.match(mappingRegex)
    
    if (match) {
      const existingMapping = match[1]
      
      // 生成新关卡的映射字符串
      const newMappingString = Object.entries(newAllocation).map(([level, words]) => {
        const wordsString = words.map(word => `'${word}'`).join(', ')
        return `  ${level}: [${wordsString}]`
      }).join(',\n')
      
      // 替换原有内容
      const newMappingObject = `const OPTIMIZED_LEVEL_MAPPING = {${existingMapping},\n${newMappingString}\n}`
      fileContent = fileContent.replace(mappingRegex, newMappingObject)
      
      fs.writeFileSync(filePath, fileContent, 'utf8')
      console.log(`✅ 已添加 ${Object.keys(newAllocation).length} 个新关卡到单词映射\n`)
    } else {
      console.error('❌ 未找到 OPTIMIZED_LEVEL_MAPPING 定义')
    }
  }

  /**
   * 验证扩展结果
   */
  validateExpansionResults() {
    console.log('🔍 验证扩展结果...')
    
    // 清除require缓存以获取最新内容
    delete require.cache[require.resolve('./word-library.js')]
    delete require.cache[require.resolve('./unified-level-themes.js')]
    
    const updatedWordLib = require('./word-library.js')
    const allWords = updatedWordLib.getAllPrimaryWords()
    const allocatedWords = new Set()
    
    // 计算新的覆盖率
    for (let level = 1; level <= 26; level++) {
      try {
        const levelResult = updatedWordLib.getLevelWords(level)
        if (levelResult && levelResult.words) {
          levelResult.words.forEach(w => {
            const wordString = typeof w === 'string' ? w : w.word || w
            allocatedWords.add(wordString)
          })
        }
      } catch (error) {
        // 关卡不存在，跳过
      }
    }
    
    const newCoverageRate = (allocatedWords.size / allWords.length * 100).toFixed(1)
    const improvement = (newCoverageRate - 53.6).toFixed(1)
    
    console.log('📊 扩展结果:')
    console.log(`- 新覆盖率: ${newCoverageRate}%`)
    console.log(`- 提升幅度: +${improvement}%`)
    console.log(`- 已分配单词: ${allocatedWords.size}个`)
    console.log(`- 未分配单词: ${allWords.length - allocatedWords.size}个`)
  }

  /**
   * 检查难度兼容性
   */
  isDifficultyCompatible(wordDifficulty, targetDifficulty) {
    const difficultyOrder = ['beginner', 'easy', 'basic', 'medium', 'intermediate', 'hard', 'advanced', 'expert']
    const targetIndex = difficultyOrder.indexOf(targetDifficulty)
    const wordIndex = difficultyOrder.indexOf(wordDifficulty)
    
    if (targetIndex >= 5) { // hard及以上难度
      return wordIndex >= 2 // 允许basic及以上的所有单词
    }
    
    return Math.abs(targetIndex - wordIndex) <= 3
  }

  /**
   * 计算单词学习价值
   */
  calculateWordValue(word) {
    let value = 0
    
    if (word.sentence) value += 5
    if (word.tips && word.tips.length > 0) value += 3
    
    const length = word.word.length
    if (length >= 3 && length <= 8) value += 2
    
    if (word.syllables && word.syllables.length <= 3) value += 2
    
    return value
  }
}

/**
 * 主函数
 */
async function main() {
  const implementer = new CoverageExpansionImplementer()
  await implementer.implementFullExpansion()
  
  console.log('\n🎉 单词库覆盖率扩展实施完成！')
  console.log('\n📋 后续建议:')
  console.log('1. 测试新关卡的学习体验')
  console.log('2. 根据用户反馈调整难度分配')
  console.log('3. 监控学习数据，持续优化')
}

// 如果直接运行此文件，执行实施
if (require.main === module) {
  main().catch(console.error)
}

module.exports = {
  CoverageExpansionImplementer
}