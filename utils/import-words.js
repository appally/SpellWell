/**
 * 从words_with_sentences.md导入完整单词库
 */

const fs = require('fs')
const path = require('path')

// 读取markdown文件
function parseWordsFromMarkdown() {
  const filePath = path.join(__dirname, '../_readme/words_with_sentences.md')
  const content = fs.readFileSync(filePath, 'utf-8')
  
  const lines = content.split('\n')
  const words = []
  
  // 跳过表头，从第3行开始
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line && line.startsWith('|')) {
      const columns = line.split('|').map(col => col.trim()).filter(col => col)
      
      if (columns.length >= 4) {
        const [word, chinese, sentence, category] = columns
        
        if (word && chinese && sentence && category) {
          words.push({
            word: word.toLowerCase(),
            chinese,
            sentence,
            category
          })
        }
      }
    }
  }
  
  return words
}

// 生成发音相关信息
function generatePhoneticInfo(word) {
  // 简单的发音规则生成，实际项目中应该有专业的发音库
  const phoneticMap = {
    'a': '/eɪ/',
    'about': '/əˈbaʊt/',
    'after': '/ˈæf.tər/',
    'afternoon': '/ˌæf.tərˈnuːn/',
    'again': '/əˈɡen/',
    'all': '/ɔːl/',
    'always': '/ˈɔːl.weɪz/',
    'and': '/ænd/',
    'any': '/ˈen.i/',
    'apple': '/ˈæp.əl/',
    'cat': '/kæt/',
    'dog': '/dɔːɡ/',
    'hello': '/həˈloʊ/',
    'yes': '/jes/',
    'no': '/noʊ/',
    'book': '/bʊk/',
    'pen': '/pen/',
    'red': '/red/',
    'blue': '/bluː/',
    'family': '/ˈfæm.ə.li/',
    'school': '/skuːl/',
    'teacher': '/ˈtiː.tʃər/'
  }
  
  return phoneticMap[word] || `/${word}/`
}

// 生成音节分解
function generateSyllables(word) {
  // 简单的音节分解规则
  if (word.length <= 3) return [word]
  if (word.length <= 5) return [word.slice(0, Math.ceil(word.length/2)), word.slice(Math.ceil(word.length/2))]
  
  // 更复杂的单词，尝试找元音分割
  const vowels = 'aeiou'
  const syllables = []
  let currentSyllable = ''
  
  for (let i = 0; i < word.length; i++) {
    currentSyllable += word[i]
    
    if (vowels.includes(word[i]) && i < word.length - 1) {
      if (currentSyllable.length >= 2) {
        syllables.push(currentSyllable)
        currentSyllable = ''
      }
    }
  }
  
  if (currentSyllable) {
    syllables.push(currentSyllable)
  }
  
  return syllables.length > 0 ? syllables : [word]
}

// 生成难度等级
function generateDifficulty(word) {
  if (word.length <= 3) return 'easy'
  if (word.length <= 6) return 'medium'
  if (word.length <= 8) return 'hard'
  return 'advanced'
}

// 生成发音技巧
function generateTips(word) {
  const tips = ['注意发音清晰', '注意重音位置']
  
  if (word.includes('th')) tips.push('th要咬舌音')
  if (word.includes('ch')) tips.push('ch读tʃ音')
  if (word.includes('sh')) tips.push('sh要清晰')
  if (word.includes('oo')) tips.push('oo注意长短音')
  if (word.includes('ea')) tips.push('ea注意发音')
  if (word.includes('igh')) tips.push('igh读aɪ音')
  
  return tips.slice(0, 2) // 最多返回2个技巧
}

// 生成图标
function generateIcon(category) {
  const iconMap = {
    '基础词汇': '📝',
    '动物世界': '🐾',
    '美食天地': '🍎',
    '颜色彩虹': '🌈',
    '家庭成员': '👨‍👩‍👧‍👦',
    '学习用品': '📚',
    '身体部位': '👤',
    '音乐艺术': '🎵',
    '娱乐活动': '🎮',
    '职业体验': '💼',
    '交通工具': '🚗',
    '世界地理': '🌍',
    '科学探索': '🔬',
    '艺术创作': '🎨',
    '植物花卉': '🌸',
    '情感表达': '😊',
    '自然景观': '🌳',
    '运动健身': '⚽',
    '家庭用品': '🏠'
  }
  
  return iconMap[category] || '📝'
}

// 主函数
function main() {
  console.log('开始导入单词库...')
  
  const words = parseWordsFromMarkdown()
  console.log(`解析到 ${words.length} 个单词`)
  
  // 生成完整的单词数据库
  const wordDatabase = {}
  
  words.forEach(wordData => {
    const word = wordData.word
    
    wordDatabase[word] = {
      phonetic: generatePhoneticInfo(word),
      syllables: generateSyllables(word),
      tips: generateTips(word),
      difficulty: generateDifficulty(word),
      category: wordData.category,
      chinese: wordData.chinese,
      sentence: wordData.sentence,
      word: word,
      image: generateIcon(wordData.category)
    }
  })
  
  // 生成新的word-library.js内容
  const wordLibraryContent = `/**
 * 单词库管理模块 - 完整的507个小学单词库
 * 自动生成自 words_with_sentences.md
 */

// 完整的小学单词数据库 (${Object.keys(wordDatabase).length}个单词)
const PRIMARY_WORD_DATABASE = ${JSON.stringify(wordDatabase, null, 2)}

// 按分类统计
const categoryStats = {}
Object.values(PRIMARY_WORD_DATABASE).forEach(word => {
  categoryStats[word.category] = (categoryStats[word.category] || 0) + 1
})

console.log('📚 小学单词库加载完成，共', Object.keys(PRIMARY_WORD_DATABASE).length, '个单词')
console.log('📊 分类统计:', categoryStats)

// 基于分类的关卡主题配置 (20个关卡)
const levelThemes = {
  1: { 
    name: '基础词汇入门', 
    words: ['a', 'hello', 'yes', 'no', 'you'],
    description: '最基本的英语词汇',
    icon: '📝'
  },
  2: { 
    name: '家庭成员', 
    words: ['family', 'father', 'mother', 'brother', 'sister'],
    description: '家庭关系词汇',
    icon: '👨‍👩‍👧‍👦'
  },
  3: { 
    name: '动物世界', 
    words: ['cat', 'dog', 'bird', 'fish', 'animal'],
    description: '常见动物名称',
    icon: '🐾'
  },
  4: { 
    name: '颜色彩虹', 
    words: ['red', 'blue', 'green', 'yellow', 'black'],
    description: '基本颜色词汇',
    icon: '🌈'
  },
  5: { 
    name: '美食天地', 
    words: ['apple', 'banana', 'cake', 'bread', 'milk'],
    description: '食物和饮品',
    icon: '🍎'
  },
  6: { 
    name: '学习用品', 
    words: ['book', 'pen', 'pencil', 'school', 'teacher'],
    description: '学习相关用品',
    icon: '📚'
  },
  7: { 
    name: '身体部位', 
    words: ['head', 'hand', 'foot', 'eye', 'arm'],
    description: '身体器官名称',
    icon: '👤'
  },
  8: { 
    name: '自然景观', 
    words: ['sun', 'moon', 'star', 'tree', 'flower'],
    description: '自然环境词汇',
    icon: '🌳'
  },
  9: { 
    name: '交通工具', 
    words: ['car', 'bus', 'bike', 'plane', 'train'],
    description: '各种交通工具',
    icon: '🚗'
  },
  10: { 
    name: '运动健身', 
    words: ['run', 'jump', 'swim', 'play', 'ball'],
    description: '运动相关词汇',
    icon: '⚽'
  },
  11: { 
    name: '时间概念', 
    words: ['day', 'night', 'morning', 'afternoon', 'time'],
    description: '时间相关词汇',
    icon: '⏰'
  },
  12: { 
    name: '地点方位', 
    words: ['here', 'there', 'home', 'school', 'park'],
    description: '地点和方位',
    icon: '📍'
  },
  13: { 
    name: '数字计数', 
    words: ['one', 'two', 'three', 'many', 'all'],
    description: '数字和数量',
    icon: '🔢'
  },
  14: { 
    name: '天气季节', 
    words: ['hot', 'cold', 'rain', 'snow', 'wind'],
    description: '天气和季节',
    icon: '🌤️'
  },
  15: { 
    name: '情感表达', 
    words: ['happy', 'sad', 'angry', 'good', 'bad'],
    description: '情感和感受',
    icon: '😊'
  },
  16: { 
    name: '日常动作', 
    words: ['eat', 'drink', 'sleep', 'walk', 'talk'],
    description: '日常行为动作',
    icon: '🚶'
  },
  17: { 
    name: '服装用品', 
    words: ['shirt', 'dress', 'hat', 'shoe', 'coat'],
    description: '衣服和配饰',
    icon: '👕'
  },
  18: { 
    name: '职业体验', 
    words: ['doctor', 'teacher', 'worker', 'nurse', 'cook'],
    description: '各种职业',
    icon: '💼'
  },
  19: { 
    name: '综合复习', 
    words: ['big', 'small', 'new', 'old', 'long'],
    description: '形容词综合',
    icon: '🎯'
  },
  20: { 
    name: '终极挑战', 
    words: ['wonderful', 'beautiful', 'interesting', 'important', 'different'],
    description: '高级词汇挑战',
    icon: '🏆'
  }
}

/**
 * 获取所有小学词库单词
 * @returns {Array} 所有小学单词数组
 */
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

/**
 * 获取指定关卡的单词
 * @param {number} level 关卡编号 (1-20)
 * @returns {Object} 关卡数据
 */
function getLevelWords(level) {
  const theme = levelThemes[level] || levelThemes[1]
  
  // 从完整词库中获取对应单词
  const words = theme.words.map(wordKey => {
    const wordData = PRIMARY_WORD_DATABASE[wordKey]
    if (wordData) {
      return {
        word: wordData.word || wordKey,
        phonetic: wordData.phonetic,
        chinese: wordData.chinese,
        image: wordData.image,
        category: wordData.category,
        difficulty: wordData.difficulty,
        syllables: wordData.syllables,
        tips: wordData.tips,
        sentence: wordData.sentence
      }
    } else {
      // 如果找不到，从其他单词中随机选择一个同类型的
      const similarWords = Object.keys(PRIMARY_WORD_DATABASE)
        .filter(key => PRIMARY_WORD_DATABASE[key].category === theme.name || 
                      PRIMARY_WORD_DATABASE[key].difficulty === 'easy')
        .slice(0, 1)
      
      if (similarWords.length > 0) {
        const fallbackWord = PRIMARY_WORD_DATABASE[similarWords[0]]
        return {
          word: fallbackWord.word,
          phonetic: fallbackWord.phonetic,
          chinese: fallbackWord.chinese,
          image: fallbackWord.image,
          category: fallbackWord.category,
          difficulty: fallbackWord.difficulty,
          syllables: fallbackWord.syllables,
          tips: fallbackWord.tips,
          sentence: fallbackWord.sentence
        }
      }
      
      // 最后的降级方案
      return {
        word: wordKey,
        phonetic: \`/\${wordKey}/\`,
        chinese: wordKey,
        image: '📝',
        category: theme.name,
        difficulty: 'medium',
        syllables: [wordKey],
        tips: ['注意发音'],
        sentence: \`This is \${wordKey}.\`
      }
    }
  })

  return {
    level,
    theme: theme.name,
    description: theme.description,
    icon: theme.icon,
    words,
    totalWords: words.length,
    wordCount: words.length
  }
}

/**
 * 根据分类获取单词
 * @param {string} category 分类名称
 * @returns {Array} 单词数组
 */
function getWordsByCategory(category) {
  return Object.keys(PRIMARY_WORD_DATABASE)
    .filter(key => PRIMARY_WORD_DATABASE[key].category === category)
    .map(key => {
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

/**
 * 根据难度获取单词
 * @param {string} difficulty 难度级别
 * @returns {Array} 单词数组
 */
function getWordsByDifficulty(difficulty) {
  return Object.keys(PRIMARY_WORD_DATABASE)
    .filter(key => PRIMARY_WORD_DATABASE[key].difficulty === difficulty)
    .map(key => {
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

/**
 * 获取随机单词
 * @param {number} count 数量
 * @returns {Array} 随机单词数组
 */
function getRandomWords(count = 5) {
  const allWords = getAllPrimaryWords()
  const shuffled = allWords.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

/**
 * 验证拼写
 * @param {string} input 用户输入
 * @param {string} correct 正确答案
 * @returns {Object} 验证结果
 */
function validateSpelling(input, correct) {
  const userInput = input.toLowerCase().trim()
  const correctWord = correct.toLowerCase().trim()
  
  if (userInput === correctWord) {
    return {
      isCorrect: true,
      similarity: 1.0,
      message: '完全正确！'
    }
  }
  
  const similarity = calculateSimilarity(userInput, correctWord)
  
  return {
    isCorrect: false,
    similarity,
    message: getFeedbackMessage(similarity, correctWord, userInput)
  }
}

/**
 * 计算字符串相似度
 * @param {string} str1 字符串1
 * @param {string} str2 字符串2
 * @returns {number} 相似度 (0-1)
 */
function calculateSimilarity(str1, str2) {
  const len1 = str1.length
  const len2 = str2.length
  const maxLen = Math.max(len1, len2)
  
  if (maxLen === 0) return 1.0
  
  // 计算编辑距离
  const dp = Array(len1 + 1).fill().map(() => Array(len2 + 1).fill(0))
  
  for (let i = 0; i <= len1; i++) dp[i][0] = i
  for (let j = 0; j <= len2; j++) dp[0][j] = j
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + 1
        )
      }
    }
  }
  
  const editDistance = dp[len1][len2]
  return 1 - (editDistance / maxLen)
}

/**
 * 生成反馈消息
 * @param {number} similarity 相似度
 * @param {string} correct 正确答案
 * @param {string} input 用户输入
 * @returns {string} 反馈消息
 */
function getFeedbackMessage(similarity, correct, input) {
  if (similarity > 0.8) {
    return '很接近了！检查一下拼写'
  } else if (similarity > 0.6) {
    return '不错的尝试！再仔细看看'
  } else if (similarity > 0.4) {
    return '继续努力！可以先听听发音'
  } else {
    return '继续努力！可以先听听发音'
  }
}

/**
 * 生成AI提示词
 * @param {Object} word 单词数据
 * @returns {string} 提示词
 */
function generateAIPrompt(word) {
  return \`请为小学生解释英语单词"\${word.word}"的含义、用法和记忆技巧。要求：
1. 用简单易懂的中文解释
2. 提供记忆方法
3. 给出简单的例句
4. 语言要生动有趣
单词：\${word.word}
音标：\${word.phonetic}
中文：\${word.chinese}
例句：\${word.sentence}\`
}

// 兼容旧版本的函数
function getWordsByGrade(grade) {
  // 返回所有小学词库，不再区分年级
  return getAllPrimaryWords()
}

module.exports = {
  getAllPrimaryWords,
  getLevelWords,
  getWordsByCategory,
  getWordsByDifficulty,
  getRandomWords,
  validateSpelling,
  calculateSimilarity,
  getFeedbackMessage,
  generateAIPrompt,
  getWordsByGrade, // 兼容性
  PRIMARY_WORD_DATABASE,
  levelThemes,
  categoryStats
}
`
  
  // 写入新的word-library.js文件
  const outputPath = path.join(__dirname, 'word-library-complete.js')
  fs.writeFileSync(outputPath, wordLibraryContent)
  
  console.log(`✅ 成功生成完整单词库文件: ${outputPath}`)
  console.log(`📊 总计 ${Object.keys(wordDatabase).length} 个单词`)
  
  // 统计分类
  const categoryCount = {}
  Object.values(wordDatabase).forEach(word => {
    categoryCount[word.category] = (categoryCount[word.category] || 0) + 1
  })
  
  console.log('📋 分类统计:')
  Object.entries(categoryCount).forEach(([category, count]) => {
    console.log(`  ${category}: ${count}个`)
  })
}

if (require.main === module) {
  main()
}

module.exports = { parseWordsFromMarkdown, main }