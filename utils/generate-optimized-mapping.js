/**
 * 生成优化的关卡映射
 * 解决主题匹配度问题，确保全部507个单词覆盖
 */

const fs = require('fs')
const path = require('path')

// 从当前word-library.js获取单词数据库
function getCurrentWordDatabase() {
  const content = fs.readFileSync(path.join(__dirname, 'word-library.js'), 'utf8')
  
  // 提取PRIMARY_WORD_DATABASE
  const match = content.match(/const PRIMARY_WORD_DATABASE = (\{[\s\S]*?\n\})/m)
  if (!match) {
    throw new Error('无法找到PRIMARY_WORD_DATABASE')
  }
  
  try {
    return eval('(' + match[1] + ')')
  } catch (error) {
    console.error('解析PRIMARY_WORD_DATABASE失败:', error)
    throw error
  }
}

/**
 * 统一的关卡主题配置
 */
const LEVEL_THEMES = {
  1: { theme: '英语启蒙', categories: ['基础词汇'], targetWords: 10 },
  2: { theme: '日常问候', categories: ['基础词汇', '情感表达'], targetWords: 10 },
  3: { theme: '我的家人', categories: ['家庭成员', '基础词汇'], targetWords: 12 },
  4: { theme: '可爱动物', categories: ['动物世界', '基础词汇'], targetWords: 12 },
  5: { theme: '美味食物', categories: ['美食天地', '基础词汇'], targetWords: 12 },
  6: { theme: '身体部位', categories: ['身体部位', '基础词汇'], targetWords: 10 },
  7: { theme: '缤纷色彩', categories: ['颜色彩虹', '基础词汇'], targetWords: 10 },
  8: { theme: '学习用品', categories: ['学习用品', '基础词汇'], targetWords: 14 },
  9: { theme: '自然风光', categories: ['自然景观', '植物花卉'], targetWords: 14 },
  10: { theme: '交通出行', categories: ['交通工具', '基础词汇'], targetWords: 12 },
  11: { theme: '运动健身', categories: ['运动健身', '基础词汇'], targetWords: 12 },
  12: { theme: '家居生活', categories: ['家庭用品', '基础词汇'], targetWords: 16 },
  13: { theme: '情感表达', categories: ['情感表达', '基础词汇'], targetWords: 16 },
  14: { theme: '娱乐活动', categories: ['娱乐活动', '音乐艺术'], targetWords: 18 },
  15: { theme: '职业世界', categories: ['职业体验', '基础词汇'], targetWords: 18 },
  16: { theme: '科学探索', categories: ['科学探索', '基础词汇'], targetWords: 15 },
  17: { theme: '艺术创作', categories: ['艺术创作', '音乐艺术'], targetWords: 12 },
  18: { theme: '世界地理', categories: ['世界地理', '基础词汇'], targetWords: 15 },
  19: { theme: '综合复习', categories: ['基础词汇', '情感表达', '自然景观'], targetWords: 20 },
  20: { theme: '终极挑战', categories: ['全部分类'], targetWords: 25 }
}

/**
 * 生成优化的关卡映射
 */
function generateOptimizedMapping() {
  console.log('🔄 生成优化的关卡映射...')
  
  const wordDatabase = getCurrentWordDatabase()
  const allWords = Object.keys(wordDatabase)
  
  console.log(`📊 单词总数: ${allWords.length}`)
  
  // 按分类分组单词
  const wordsByCategory = {}
  allWords.forEach(wordKey => {
    const word = wordDatabase[wordKey]
    const category = word.category
    
    if (!wordsByCategory[category]) {
      wordsByCategory[category] = []
    }
    wordsByCategory[category].push(wordKey)
  })
  
  console.log('📚 分类统计:')
  Object.entries(wordsByCategory).forEach(([category, words]) => {
    console.log(`  ${category}: ${words.length}个`)
  })
  
  // 用于追踪已分配的单词
  const usedWords = new Set()
  const levelMapping = {}
  
  // 为每个关卡分配单词
  for (let level = 1; level <= 20; level++) {
    const levelConfig = LEVEL_THEMES[level]
    const selectedWords = selectWordsForLevel(
      level, 
      levelConfig, 
      wordsByCategory, 
      wordDatabase, 
      usedWords
    )
    
    levelMapping[level] = selectedWords
    selectedWords.forEach(word => usedWords.add(word))
    
    console.log(`关卡${level}: ${levelConfig.theme} - 分配${selectedWords.length}/${levelConfig.targetWords}个单词`)
  }
  
  // 检查覆盖率
  const totalAssigned = usedWords.size
  const coverageRate = ((totalAssigned / allWords.length) * 100).toFixed(1)
  
  console.log(`\n📈 单词覆盖率: ${totalAssigned}/${allWords.length} (${coverageRate}%)`)
  
  // 找出未分配的单词
  const unassignedWords = allWords.filter(word => !usedWords.has(word))
  if (unassignedWords.length > 0) {
    console.log(`\n⚠️ 未分配单词 (${unassignedWords.length}个):`)
    const unassignedByCategory = {}
    unassignedWords.forEach(wordKey => {
      const category = wordDatabase[wordKey].category
      if (!unassignedByCategory[category]) {
        unassignedByCategory[category] = []
      }
      unassignedByCategory[category].push(wordKey)
    })
    
    Object.entries(unassignedByCategory).forEach(([category, words]) => {
      console.log(`  ${category}: ${words.length}个 (${words.slice(0,5).join(', ')}${words.length > 5 ? '...' : ''})`)
    })
    
    // 将未分配的单词添加到适当的关卡
    distributeUnassignedWords(levelMapping, unassignedWords, wordDatabase, LEVEL_THEMES)
  }
  
  return levelMapping
}

/**
 * 为指定关卡选择单词
 */
function selectWordsForLevel(level, levelConfig, wordsByCategory, wordDatabase, usedWords) {
  const { categories, targetWords } = levelConfig
  const candidates = []
  
  // 优先选择主题相关的单词
  categories.forEach(category => {
    if (category === '全部分类') {
      // 终极挑战关卡，选择所有剩余单词
      Object.values(wordsByCategory).forEach(words => {
        words.forEach(word => {
          if (!usedWords.has(word)) {
            candidates.push(word)
          }
        })
      })
    } else if (wordsByCategory[category]) {
      wordsByCategory[category].forEach(word => {
        if (!usedWords.has(word)) {
          candidates.push(word)
        }
      })
    }
  })
  
  // 如果候选词不足，从基础词汇中补充
  if (candidates.length < targetWords && wordsByCategory['基础词汇']) {
    wordsByCategory['基础词汇'].forEach(word => {
      if (!usedWords.has(word) && !candidates.includes(word)) {
        candidates.push(word)
      }
    })
  }
  
  // 按难度和长度排序，简单短词优先
  candidates.sort((a, b) => {
    const wordA = wordDatabase[a]
    const wordB = wordDatabase[b]
    
    // 难度排序
    const difficultyOrder = { 'easy': 1, 'medium': 2, 'advanced': 3, 'hard': 4 }
    const diffA = difficultyOrder[wordA.difficulty] || 2
    const diffB = difficultyOrder[wordB.difficulty] || 2
    
    if (diffA !== diffB) {
      return diffA - diffB
    }
    
    // 长度排序
    const lengthA = (wordA.word || a).length
    const lengthB = (wordB.word || b).length
    
    return lengthA - lengthB
  })
  
  // 选择目标数量的单词
  return candidates.slice(0, targetWords)
}

/**
 * 分配未分配的单词
 */
function distributeUnassignedWords(levelMapping, unassignedWords, wordDatabase, levelThemes) {
  console.log('\n🔄 分配剩余单词...')
  
  // 按难度分组未分配的单词
  const unassignedByDifficulty = {
    easy: [],
    medium: [],
    advanced: [],
    hard: []
  }
  
  unassignedWords.forEach(wordKey => {
    const difficulty = wordDatabase[wordKey].difficulty
    if (unassignedByDifficulty[difficulty]) {
      unassignedByDifficulty[difficulty].push(wordKey)
    } else {
      unassignedByDifficulty.medium.push(wordKey) // 默认为medium
    }
  })
  
  // 将简单单词添加到前期关卡
  const easyWords = unassignedByDifficulty.easy
  for (let i = 0; i < easyWords.length; i++) {
    const targetLevel = (i % 7) + 1 // 分配到关卡1-7
    levelMapping[targetLevel] = levelMapping[targetLevel] || []
    levelMapping[targetLevel].push(easyWords[i])
  }
  
  // 将中等难度单词添加到中期关卡
  const mediumWords = unassignedByDifficulty.medium
  for (let i = 0; i < mediumWords.length; i++) {
    const targetLevel = (i % 6) + 8 // 分配到关卡8-13
    levelMapping[targetLevel] = levelMapping[targetLevel] || []
    levelMapping[targetLevel].push(mediumWords[i])
  }
  
  // 将困难单词添加到后期关卡
  const hardWords = [...unassignedByDifficulty.advanced, ...unassignedByDifficulty.hard]
  for (let i = 0; i < hardWords.length; i++) {
    const targetLevel = (i % 7) + 14 // 分配到关卡14-20
    levelMapping[targetLevel] = levelMapping[targetLevel] || []
    levelMapping[targetLevel].push(hardWords[i])
  }
  
  console.log('✅ 剩余单词分配完成')
}

/**
 * 生成优化后的word-library.js
 */
function generateOptimizedWordLibrary(levelMapping) {
  console.log('\n🔄 生成优化后的word-library.js...')
  
  const originalContent = fs.readFileSync(path.join(__dirname, 'word-library.js'), 'utf8')
  
  // 替换OPTIMIZED_LEVEL_MAPPING
  const newMappingString = JSON.stringify(levelMapping, null, 2)
    .replace(/"/g, '"')
    .replace(/\n  /g, '\n  ')
  
  const updatedContent = originalContent.replace(
    /const OPTIMIZED_LEVEL_MAPPING = \{[\s\S]*?\n\}/,
    `const OPTIMIZED_LEVEL_MAPPING = ${newMappingString}`
  )
  
  // 写入文件
  fs.writeFileSync(path.join(__dirname, 'word-library.js'), updatedContent, 'utf8')
  
  console.log('✅ word-library.js 已更新')
}

/**
 * 验证优化效果
 */
function validateOptimization(levelMapping) {
  console.log('\n🔍 验证优化效果...')
  
  const wordDatabase = getCurrentWordDatabase()
  let totalWords = 0
  let totalMatched = 0
  
  for (let level = 1; level <= 20; level++) {
    const levelConfig = LEVEL_THEMES[level]
    const words = levelMapping[level] || []
    
    let matchedCount = 0
    words.forEach(wordKey => {
      const word = wordDatabase[wordKey]
      if (word && (levelConfig.categories.includes(word.category) || 
                   levelConfig.categories.includes('全部分类') ||
                   word.category === '基础词汇')) {
        matchedCount++
      }
    })
    
    totalWords += words.length
    totalMatched += matchedCount
    
    const matchRate = words.length > 0 ? ((matchedCount / words.length) * 100).toFixed(1) : '0.0'
    console.log(`关卡${level}: ${levelConfig.theme} - ${matchedCount}/${words.length} (${matchRate}%匹配)`)
  }
  
  const overallMatchRate = totalWords > 0 ? ((totalMatched / totalWords) * 100).toFixed(1) : '0.0'
  console.log(`\n📊 总体主题匹配度: ${totalMatched}/${totalWords} (${overallMatchRate}%)`)
  
  return {
    totalWords,
    totalMatched,
    matchRate: overallMatchRate
  }
}

// 执行优化
function main() {
  try {
    console.log('🚀 开始生成优化的关卡映射...\n')
    
    const levelMapping = generateOptimizedMapping()
    const validation = validateOptimization(levelMapping)
    
    generateOptimizedWordLibrary(levelMapping)
    
    console.log('\n🎉 优化完成！')
    console.log(`📈 主题匹配度提升到: ${validation.matchRate}%`)
    console.log(`📚 单词覆盖: ${validation.totalWords}/507个`)
    
  } catch (error) {
    console.error('❌ 优化过程中出现错误:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { generateOptimizedMapping, validateOptimization }