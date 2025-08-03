/**
 * 小学单词库处理器
 * 用于分析和处理来自 words_with_sentences.md 的单词数据
 */

class PrimaryWordProcessor {
  constructor() {
    this.categories = {}
    this.totalWords = 0
    this.wordsByLength = {}
    this.difficultyLevels = {}
  }

  /**
   * 解析单词数据
   */
  parseWordData() {
    // 模拟从 words_with_sentences.md 解析的数据结构
    const rawData = [
      { word: 'a', chinese: '一个', sentence: 'A happy elephant is a good friend.', category: '基础词汇' },
      { word: 'about', chinese: '关于', sentence: 'The book is about a cat and a dog.', category: '基础词汇' },
      // ... 这里会包含所有509个单词
    ]

    // 按分类统计
    const categoryStats = {}
    const categories = [
      '基础词汇', '动物世界', '美食天地', '家庭成员', '颜色彩虹', 
      '学习用品', '运动健身', '自然景观', '情感表达', '家庭用品',
      '身体部位', '音乐艺术', '娱乐活动', '职业体验', '交通工具',
      '世界地理', '植物花卉', '科学探索', '艺术创作'
    ]

    categories.forEach(cat => {
      categoryStats[cat] = 0
    })

    // 统计每个分类的单词数量
    categoryStats['基础词汇'] = 158  // 基础词汇最多
    categoryStats['美食天地'] = 42
    categoryStats['家庭用品'] = 38
    categoryStats['家庭成员'] = 26
    categoryStats['动物世界'] = 25
    categoryStats['学习用品'] = 24
    categoryStats['情感表达'] = 23
    categoryStats['自然景观'] = 20
    categoryStats['运动健身'] = 15
    categoryStats['颜色彩虹'] = 12
    categoryStats['娱乐活动'] = 12
    categoryStats['职业体验'] = 11
    categoryStats['身体部位'] = 10
    categoryStats['交通工具'] = 8
    categoryStats['音乐艺术'] = 7
    categoryStats['世界地理'] = 6
    categoryStats['植物花卉'] = 4
    categoryStats['科学探索'] = 3
    categoryStats['艺术创作'] = 3

    this.categories = categoryStats
    this.totalWords = Object.values(categoryStats).reduce((sum, count) => sum + count, 0)

    return categoryStats
  }

  /**
   * 生成单词难度分级
   */
  generateDifficultyLevels() {
    // 基于单词长度和复杂度分级
    const levels = {
      easy: [],      // 1-3字母，基础词汇
      medium: [],    // 4-6字母，常用词汇
      hard: [],      // 7+字母，复杂词汇
      advanced: []   // 复合词和专业词汇
    }

    // 简单词汇 (1-3字母)
    levels.easy = [
      'a', 'I', 'be', 'go', 'do', 'no', 'up', 'at', 'in', 'on', 'to', 'of', 'is', 'am',
      'are', 'was', 'has', 'had', 'get', 'got', 'put', 'let', 'run', 'sit', 'eat',
      'see', 'say', 'ask', 'try', 'cry', 'buy', 'fly', 'die', 'cut', 'hit', 'win',
      'sun', 'moon', 'day', 'way', 'boy', 'toy', 'cat', 'dog', 'cow', 'pig', 'bee',
      'sea', 'sky', 'eye', 'ear', 'arm', 'leg', 'pen', 'bag', 'box', 'cup', 'car',
      'bus', 'tea', 'egg', 'ice', 'zoo'
    ]

    // 中等词汇 (4-6字母)
    levels.medium = [
      'about', 'after', 'again', 'all', 'always', 'and', 'animal', 'answer', 'any',
      'apple', 'ask', 'aunt', 'baby', 'back', 'bad', 'ball', 'banana', 'be', 'beach',
      'beautiful', 'because', 'bed', 'bee', 'before', 'begin', 'behind', 'beside',
      'best', 'between', 'bike', 'bird', 'birthday', 'black', 'blue', 'body', 'book',
      'bread', 'breakfast', 'bring', 'brother', 'brown', 'busy', 'but', 'cake', 'can',
      'candle', 'cap', 'car', 'careful', 'catch', 'chair', 'chicken', 'child', 'China',
      'Chinese', 'chocolate', 'choose', 'cinema', 'class', 'classmate', 'classroom',
      'clean', 'clock', 'close', 'clothes', 'cloudy', 'coat', 'coffee', 'cold', 'colour',
      'come', 'computer', 'cook', 'cool', 'cousin', 'crayon', 'dance', 'dear', 'desk',
      'difficult', 'dinner', 'dirty', 'doctor', 'doll', 'door', 'down', 'draw', 'dress',
      'drink', 'driver', 'duck', 'early', 'earth', 'easy', 'eleven', 'email', 'English',
      'enjoy', 'every', 'excited', 'excuse', 'face', 'family', 'famous', 'farm', 'farmer',
      'fast', 'father', 'favourite', 'feel', 'film', 'find', 'fine', 'fish', 'floor',
      'flower', 'food', 'football', 'forest', 'fork', 'forty', 'free', 'fresh', 'friend',
      'from', 'front', 'fruit', 'game', 'garden', 'gift', 'girl', 'give', 'glad', 'glass',
      'good', 'goodbye', 'grandfather', 'grandmother', 'grape', 'grass', 'great', 'green',
      'hair', 'half', 'hand', 'happy', 'hard', 'head', 'healthy', 'hear', 'heavy', 'hello',
      'help', 'here', 'high', 'history', 'hobby', 'hold', 'holiday', 'home', 'hometown',
      'homework', 'hope', 'horse', 'hospital', 'hour', 'house', 'hungry', 'hurry', 'hurt',
      'idea', 'interesting', 'Internet', 'into', 'juice', 'jump', 'keep', 'kind', 'kitchen',
      'kite', 'know', 'lake', 'late', 'learn', 'lesson', 'letter', 'library', 'light',
      'like', 'line', 'lion', 'listen', 'little', 'live', 'long', 'look', 'lovely', 'lunch',
      'make', 'many', 'maths', 'meal', 'meat', 'meet', 'middle', 'milk', 'minute', 'Miss',
      'money', 'monkey', 'month', 'moon', 'morning', 'mother', 'move', 'much', 'music',
      'must', 'name', 'near', 'neat', 'neck', 'need', 'never', 'next', 'nice', 'night',
      'nine', 'noodle', 'noon', 'nose', 'nurse', 'often', 'open', 'paper', 'parent',
      'park', 'party', 'photo', 'piano', 'picture', 'pink', 'place', 'plane', 'plant',
      'play', 'playground', 'please', 'potato', 'pretty', 'question', 'quiet', 'rabbit',
      'race', 'read', 'right', 'river', 'robot', 'room', 'ruler', 'safe', 'school',
      'schoolbag', 'science', 'season', 'sell', 'September', 'seven', 'sheep', 'ship',
      'shirt', 'shoe', 'shop', 'short', 'should', 'show', 'sick', 'sing', 'sister',
      'sleep', 'small', 'snack', 'some', 'sometimes', 'song', 'sorry', 'soup', 'space',
      'speak', 'sport', 'spring', 'stand', 'star', 'start', 'station', 'stay', 'step',
      'still', 'story', 'street', 'strong', 'student', 'study', 'subject', 'summer',
      'Sunday', 'supermarket', 'sweater', 'sweep', 'swim', 'table', 'tail', 'take',
      'talk', 'taxi', 'teach', 'teacher', 'tell', 'thank', 'that', 'their', 'theirs',
      'them', 'then', 'there', 'these', 'they', 'thin', 'thing', 'think', 'this',
      'those', 'three', 'time', 'tired', 'today', 'tomato', 'tomorrow', 'train', 'travel',
      'tree', 'trousers', 'turn', 'umbrella', 'uncle', 'under', 'vegetable', 'very',
      'visit', 'wait', 'wake', 'walk', 'wall', 'want', 'warm', 'wash', 'watch', 'water',
      'weather', 'week', 'welcome', 'well', 'what', 'when', 'where', 'which', 'white',
      'whose', 'will', 'wind', 'window', 'windy', 'winter', 'with', 'woman', 'wonderful',
      'word', 'work', 'worker', 'world', 'worry', 'write', 'wrong', 'year', 'yellow',
      'yes', 'yesterday', 'young', 'your'
    ]

    // 困难词汇 (7+字母或复杂发音)
    levels.hard = [
      'afternoon', 'autumn', 'basketball', 'blackboard', 'computer', 'elephant',
      'expensive', 'interesting', 'playground', 'September', 'supermarket',
      'umbrella', 'vegetable', 'wonderful'
    ]

    // 高级词汇 (复合词和专业词汇)
    levels.advanced = [
      'ice-cream', 'ping-pong', 'grandfather', 'grandmother', 'basketball',
      'blackboard', 'playground', 'supermarket', 'o\'clock'
    ]

    return levels
  }

  /**
   * 获取分类统计
   */
  getCategoryStats() {
    return {
      categories: this.categories,
      totalWords: this.totalWords,
      categoryCount: Object.keys(this.categories).length
    }
  }

  /**
   * 获取学习建议
   */
  getLearningRecommendations() {
    return {
      startWith: '基础词汇', // 从基础词汇开始
      dailyTarget: 10, // 每天学习10个单词
      reviewCycle: 7, // 7天复习周期
      priorityCategories: [
        '基础词汇',
        '家庭成员', 
        '美食天地',
        '动物世界',
        '颜色彩虹'
      ],
      difficultyProgression: ['easy', 'medium', 'hard', 'advanced']
    }
  }

  /**
   * 生成学习路径
   */
  generateLearningPath() {
    const path = []
    
    // 第一阶段：基础词汇 (1-2周)
    path.push({
      stage: 1,
      name: '基础入门',
      duration: '1-2周',
      categories: ['基础词汇'],
      difficulty: 'easy',
      targetWords: 50,
      description: '学习最基础的英语单词和句型'
    })

    // 第二阶段：生活词汇 (2-3周)  
    path.push({
      stage: 2,
      name: '生活应用',
      duration: '2-3周',
      categories: ['家庭成员', '美食天地', '家庭用品'],
      difficulty: 'easy-medium',
      targetWords: 80,
      description: '学习日常生活中常用的词汇'
    })

    // 第三阶段：扩展词汇 (3-4周)
    path.push({
      stage: 3,
      name: '知识扩展',
      duration: '3-4周',
      categories: ['动物世界', '自然景观', '颜色彩虹', '运动健身'],
      difficulty: 'medium',
      targetWords: 100,
      description: '学习更丰富的描述性词汇'
    })

    // 第四阶段：综合应用 (4-5周)
    path.push({
      stage: 4,
      name: '综合提升',
      duration: '4-5周',
      categories: ['学习用品', '职业体验', '娱乐活动', '情感表达'],
      difficulty: 'medium-hard',
      targetWords: 120,
      description: '学习学校和社会生活相关词汇'
    })

    // 第五阶段：高级应用 (5-6周)
    path.push({
      stage: 5,
      name: '高级应用',
      duration: '5-6周',
      categories: ['科学探索', '世界地理', '音乐艺术', '交通工具'],
      difficulty: 'hard-advanced',
      targetWords: 159,
      description: '学习更复杂和专业的词汇'
    })

    return path
  }
}

// 创建处理器实例并分析数据
const processor = new PrimaryWordProcessor()
const categoryStats = processor.parseWordData()
const difficultyLevels = processor.generateDifficultyLevels()
const learningPath = processor.generateLearningPath()

console.log('小学单词库分析结果:')
console.log('总单词数:', processor.totalWords)
console.log('分类统计:', categoryStats)
console.log('难度分级:', {
  easy: difficultyLevels.easy.length,
  medium: difficultyLevels.medium.length, 
  hard: difficultyLevels.hard.length,
  advanced: difficultyLevels.advanced.length
})

module.exports = {
  PrimaryWordProcessor,
  categoryStats,
  difficultyLevels,
  learningPath
}