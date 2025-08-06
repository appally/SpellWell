/**
 * 统一关卡主题配置系统
 * 为SpellWell应用提供完整的35个关卡配置
 */

const enhancedDifficulty = require('./enhanced-difficulty-system.js');
const wordLibrary = require('./word-library.js');

/**
 * 统一关卡主题配置对象
 * 包含35个关卡的完整配置信息
 */
const UNIFIED_LEVEL_THEMES = {
  // 入门级关卡 (1-3关) - beginner难度
  1: {
    theme: '英语启蒙',
    name: '第一次相遇',
    description: '最简单的英语单词，开始英语之旅',
    icon: '🌟',
    targetWords: 10,
    difficulty: 'beginner',
    focusCategories: ['基础词汇'],
    learningGoals: ['认识英语字母组合', '学会基础发音', '建立学习信心'],
    interactionTypes: ['看图识词', '听音跟读'],
    estimatedTime: '5-8分钟'
  },
  
  2: {
    theme: '日常问候',
    name: '友好交流',
    description: '学习打招呼和简单交流用语',
    icon: '👋',
    targetWords: 10,
    difficulty: 'beginner',
    focusCategories: ['基础词汇', '情感表达'],
    learningGoals: ['掌握问候语', '表达基本情感', '练习简单对话'],
    interactionTypes: ['情景对话', '角色扮演'],
    estimatedTime: '5-8分钟'
  },
  
  3: {
    theme: '我的家人',
    name: '温馨家庭',
    description: '认识家庭成员，学习亲情表达',
    icon: '👨‍👩‍👧‍👦',
    targetWords: 12,
    difficulty: 'beginner',
    focusCategories: ['家庭成员', '基础词汇'],
    learningGoals: ['认识家庭成员', '学会称呼', '表达家庭关系'],
    interactionTypes: ['家庭树绘制', '亲情故事'],
    estimatedTime: '6-9分钟'
  },
  
  // 基础级关卡 (4-7关) - easy难度
  4: {
    theme: '可爱动物',
    name: '动物朋友',
    description: '探索动物世界，学习动物名称',
    icon: '🐾',
    targetWords: 12,
    difficulty: 'easy',
    focusCategories: ['动物世界', '自然景观'],
    learningGoals: ['认识常见动物', '模仿动物声音', '了解动物习性'],
    interactionTypes: ['动物园游览', '声音配对'],
    estimatedTime: '8-10分钟'
  },
  
  5: {
    theme: '美味食物',
    name: '美食探索',
    description: '认识各种食物，培养健康饮食观念',
    icon: '🍎',
    targetWords: 12,
    difficulty: 'easy',
    focusCategories: ['美食天地', '基础词汇'],
    learningGoals: ['识别食物种类', '表达喜好', '学习营养知识'],
    interactionTypes: ['厨房体验', '菜单制作'],
    estimatedTime: '8-10分钟'
  },
  
  6: {
    theme: '身体部位',
    name: '认识自己',
    description: '学习身体各部位名称，关爱自己的身体',
    icon: '👤',
    targetWords: 10,
    difficulty: 'easy',
    focusCategories: ['身体部位', '基础词汇'],
    learningGoals: ['认识身体部位', '学会保护身体', '表达身体感受'],
    interactionTypes: ['身体地图', '健康小贴士'],
    estimatedTime: '8-10分钟'
  },
  
  7: {
    theme: '缤纷色彩',
    name: '彩虹世界',
    description: '探索色彩奥秘，发现生活中的美',
    icon: '🌈',
    targetWords: 10,
    difficulty: 'easy',
    focusCategories: ['颜色彩虹', '基础词汇'],
    learningGoals: ['识别基本颜色', '描述物体颜色', '培养审美能力'],
    interactionTypes: ['调色游戏', '色彩搭配'],
    estimatedTime: '8-10分钟'
  },
  
  // 中级关卡 (8-13关) - medium难度
  8: {
    theme: '学习用品',
    name: '学习好帮手',
    description: '认识各种学习用品，培养学习兴趣',
    icon: '📚',
    targetWords: 14,
    difficulty: 'medium',
    focusCategories: ['学习用品', '基础词汇'],
    learningGoals: ['熟悉学习工具', '养成学习习惯', '提高学习效率'],
    interactionTypes: ['教室探索', '学习计划'],
    estimatedTime: '10-12分钟'
  },
  
  9: {
    theme: '自然风光',
    name: '大自然的礼物',
    description: '欣赏自然美景，培养环保意识',
    icon: '🌳',
    targetWords: 14,
    difficulty: 'medium',
    focusCategories: ['自然景观', '植物花卉'],
    learningGoals: ['认识自然事物', '热爱大自然', '学会环保'],
    interactionTypes: ['自然探索', '环保行动'],
    estimatedTime: '10-12分钟'
  },
  
  10: {
    theme: '交通出行',
    name: '出行小能手',
    description: '学习各种交通工具，掌握出行知识',
    icon: '🚗',
    targetWords: 12,
    difficulty: 'medium',
    focusCategories: ['交通工具', '基础词汇'],
    learningGoals: ['认识交通工具', '学习交通规则', '培养安全意识'],
    interactionTypes: ['交通模拟', '安全知识'],
    estimatedTime: '10-12分钟'
  },
  
  11: {
    theme: '运动健身',
    name: '运动小达人',
    description: '学习运动项目，培养健康体魄',
    icon: '⚽',
    targetWords: 12,
    difficulty: 'medium',
    focusCategories: ['运动健身', '基础词汇'],
    learningGoals: ['了解运动项目', '养成运动习惯', '团队合作精神'],
    interactionTypes: ['运动体验', '团队游戏'],
    estimatedTime: '10-12分钟'
  },
  
  12: {
    theme: '家居生活',
    name: '温馨的家',
    description: '认识家居用品，学会整理家务',
    icon: '🏠',
    targetWords: 16,
    difficulty: 'medium',
    focusCategories: ['家庭用品', '基础词汇'],
    learningGoals: ['熟悉家具用品', '学会做家务', '培养责任感'],
    interactionTypes: ['家务体验', '房间布置'],
    estimatedTime: '12-14分钟'
  },
  
  13: {
    theme: '情感表达',
    name: '我的心情',
    description: '学会表达情感，理解他人感受',
    icon: '😊',
    targetWords: 16,
    difficulty: 'medium',
    focusCategories: ['情感表达', '基础词汇'],
    learningGoals: ['识别情感状态', '正确表达情感', '培养同理心'],
    interactionTypes: ['情感游戏', '心理健康'],
    estimatedTime: '12-14分钟'
  },
  
  // 高级关卡 (14-17关) - hard难度
  14: {
    theme: '娱乐活动',
    name: '快乐时光',
    description: '学习各种娱乐活动，培养兴趣爱好',
    icon: '🎮',
    targetWords: 18,
    difficulty: 'hard',
    focusCategories: ['娱乐活动', '音乐艺术'],
    learningGoals: ['了解娱乐方式', '培养兴趣爱好', '平衡学习与娱乐'],
    interactionTypes: ['兴趣探索', '才艺展示'],
    estimatedTime: '14-16分钟'
  },
  
  15: {
    theme: '职业世界',
    name: '未来梦想',
    description: '认识各种职业，树立职业理想',
    icon: '💼',
    targetWords: 18,
    difficulty: 'hard',
    focusCategories: ['职业体验', '基础词汇'],
    learningGoals: ['了解职业特点', '树立理想目标', '培养职业素养'],
    interactionTypes: ['职业体验', '理想规划'],
    estimatedTime: '14-16分钟'
  },
  
  16: {
    theme: '科学探索',
    name: '小小科学家',
    description: '探索科学奥秘，激发求知欲',
    icon: '🔬',
    targetWords: 15,
    difficulty: 'hard',
    focusCategories: ['科学探索', '自然景观'],
    learningGoals: ['培养科学思维', '学会观察实验', '激发创新精神'],
    interactionTypes: ['科学实验', '观察记录'],
    estimatedTime: '14-16分钟'
  },
  
  17: {
    theme: '艺术创作',
    name: '创意无限',
    description: '体验艺术创作，培养审美情趣',
    icon: '🎨',
    targetWords: 12,
    difficulty: 'hard',
    focusCategories: ['艺术创作', '音乐艺术'],
    learningGoals: ['培养艺术感知', '体验创作乐趣', '提升审美能力'],
    interactionTypes: ['艺术创作', '作品展示'],
    estimatedTime: '14-16分钟'
  },
  
  // 专家级关卡 (18-20关) - expert难度
  18: {
    theme: '世界地理',
    name: '环游世界',
    description: '了解世界各地，开拓国际视野',
    icon: '🌍',
    targetWords: 15,
    difficulty: 'expert',
    focusCategories: ['世界地理', '基础词汇'],
    learningGoals: ['了解世界文化', '培养国际视野', '增强文化自信'],
    interactionTypes: ['世界之旅', '文化交流'],
    estimatedTime: '16-18分钟'
  },
  
  19: {
    theme: '综合复习',
    name: '知识大融合',
    description: '综合运用所学知识，查漏补缺',
    icon: '🎯',
    targetWords: 20,
    difficulty: 'expert',
    focusCategories: ['基础词汇', '情感表达', '自然景观'],
    learningGoals: ['巩固已学知识', '查漏补缺', '综合运用能力'],
    interactionTypes: ['综合测试', '知识竞赛'],
    estimatedTime: '18-20分钟'
  },
  
  20: {
    theme: '终极挑战',
    name: '英语小达人',
    description: '最高难度的综合挑战，成为英语小达人',
    icon: '👑',
    targetWords: 25,
    difficulty: 'expert',
    focusCategories: ['全部分类'],
    learningGoals: ['达到学习目标', '建立学习自信', '为进阶学习做准备'],
    interactionTypes: ['终极挑战', '成就庆祝'],
    estimatedTime: '20-25分钟'
  },
  
  // 扩展关卡 (21-35关) - 覆盖剩余单词
  21: {
    theme: '进阶词汇A',
    name: '词汇扩展',
    description: '基础词汇和情感表达的进阶学习',
    icon: '📖',
    targetWords: 15,
    difficulty: 'medium',
    focusCategories: ['基础词汇', '情感表达'],
    learningGoals: ['扩展词汇量', '提升表达能力'],
    interactionTypes: ['拼写练习', '语音识别'],
    estimatedTime: '8-10分钟'
  },
  
  22: {
    theme: '进阶词汇B',
    name: '生活词汇',
    description: '美食和家居用品词汇扩展',
    icon: '🏡',
    targetWords: 15,
    difficulty: 'medium',
    focusCategories: ['美食天地', '家庭用品'],
    learningGoals: ['生活词汇掌握', '实用性提升'],
    interactionTypes: ['拼写练习', '语音识别'],
    estimatedTime: '8-10分钟'
  },
  
  23: {
    theme: '进阶词汇C',
    name: '学习探索',
    description: '学习用品和动物世界词汇',
    icon: '🔍',
    targetWords: 15,
    difficulty: 'medium',
    focusCategories: ['学习用品', '动物世界'],
    learningGoals: ['学科词汇', '自然认知'],
    interactionTypes: ['拼写练习', '语音识别'],
    estimatedTime: '8-10分钟'
  },
  
  24: {
    theme: '高级词汇A',
    name: '专业领域',
    description: '职业和运动相关高级词汇',
    icon: '🏆',
    targetWords: 18,
    difficulty: 'hard',
    focusCategories: ['职业体验', '运动健身'],
    learningGoals: ['专业词汇', '兴趣拓展'],
    interactionTypes: ['拼写练习', '语音识别', '听写模式'],
    estimatedTime: '10-12分钟'
  },
  
  25: {
    theme: '高级词汇B',
    name: '综合挑战',
    description: '综合高级词汇挑战',
    icon: '🎪',
    targetWords: 20,
    difficulty: 'hard',
    focusCategories: ['全部分类'],
    learningGoals: ['综合运用', '挑战提升'],
    interactionTypes: ['拼写练习', '语音识别', '听写模式'],
    estimatedTime: '12-14分钟'
  },
  
  26: {
    theme: '专家词汇A',
    name: '高级掌握',
    description: '高难度词汇掌握',
    icon: '🎓',
    targetWords: 22,
    difficulty: 'advanced',
    focusCategories: ['全部分类'],
    learningGoals: ['高级掌握', '专家水平'],
    interactionTypes: ['拼写练习', '语音识别', '听写模式'],
    estimatedTime: '15-18分钟'
  },
  
  27: {
    theme: '专家词汇B',
    name: '精通之路',
    description: '向词汇精通迈进',
    icon: '🌟',
    targetWords: 20,
    difficulty: 'advanced',
    focusCategories: ['全部分类'],
    learningGoals: ['词汇精通', '语言能力提升'],
    interactionTypes: ['高级练习', '综合应用'],
    estimatedTime: '15-18分钟'
  },
  
  28: {
    theme: '专家词汇C',
    name: '语言艺术',
    description: '语言表达的艺术性学习',
    icon: '🎭',
    targetWords: 18,
    difficulty: 'advanced',
    focusCategories: ['情感表达', '艺术创作'],
    learningGoals: ['表达艺术', '语言美感'],
    interactionTypes: ['创意表达', '艺术融合'],
    estimatedTime: '15-18分钟'
  },
  
  29: {
    theme: '专家词汇D',
    name: '知识融合',
    description: '跨领域知识词汇整合',
    icon: '🧩',
    targetWords: 16,
    difficulty: 'advanced',
    focusCategories: ['科学探索', '世界地理'],
    learningGoals: ['知识整合', '跨域思维'],
    interactionTypes: ['知识连接', '综合分析'],
    estimatedTime: '15-18分钟'
  },
  
  30: {
    theme: '专家词汇E',
    name: '实践应用',
    description: '词汇的实际应用场景',
    icon: '🛠️',
    targetWords: 14,
    difficulty: 'advanced',
    focusCategories: ['职业体验', '家庭用品'],
    learningGoals: ['实用技能', '场景应用'],
    interactionTypes: ['情景模拟', '实践操作'],
    estimatedTime: '15-18分钟'
  },
  
  31: {
    theme: '大师词汇A',
    name: '语言大师',
    description: '向语言大师级别进发',
    icon: '👨‍🏫',
    targetWords: 12,
    difficulty: 'master',
    focusCategories: ['全部分类'],
    learningGoals: ['大师水平', '语言精通'],
    interactionTypes: ['大师挑战', '创新表达'],
    estimatedTime: '18-20分钟'
  },
  
  32: {
    theme: '大师词汇B',
    name: '完美掌控',
    description: '对词汇的完美掌控',
    icon: '💎',
    targetWords: 10,
    difficulty: 'master',
    focusCategories: ['全部分类'],
    learningGoals: ['完美掌控', '语言艺术'],
    interactionTypes: ['精准表达', '完美演示'],
    estimatedTime: '18-20分钟'
  },
  
  33: {
    theme: '大师词汇C',
    name: '创新表达',
    description: '创新性的语言表达',
    icon: '🚀',
    targetWords: 8,
    difficulty: 'master',
    focusCategories: ['全部分类'],
    learningGoals: ['创新思维', '独特表达'],
    interactionTypes: ['创新挑战', '独创表达'],
    estimatedTime: '18-20分钟'
  },
  
  34: {
    theme: '终极大师A',
    name: '语言巅峰',
    description: '达到语言学习的巅峰',
    icon: '🏔️',
    targetWords: 6,
    difficulty: 'ultimate',
    focusCategories: ['全部分类'],
    learningGoals: ['巅峰水平', '完美境界'],
    interactionTypes: ['巅峰挑战', '完美展示'],
    estimatedTime: '20-25分钟'
  },
  
  35: {
    theme: '终极大师B',
    name: '完美收官',
    description: '完美的学习旅程收官',
    icon: '🎊',
    targetWords: 10,
    difficulty: 'ultimate',
    focusCategories: ['全部分类'],
    learningGoals: ['完美收官', '学习成就'],
    interactionTypes: ['终极庆典', '成就展示'],
    estimatedTime: '20-25分钟'
  }
};

/**
 * 获取指定关卡的统一配置
 * @param {number} level - 关卡编号
 * @returns {Object|null} 关卡配置对象
 */
function getUnifiedLevelConfig(level) {
  if (!UNIFIED_LEVEL_THEMES[level]) {
    console.warn(`关卡 ${level} 的配置不存在`);
    return null;
  }
  return UNIFIED_LEVEL_THEMES[level];
}

/**
 * 获取所有关卡主题
 * @returns {Object} 所有关卡主题配置
 */
function getAllLevelThemes() {
  return UNIFIED_LEVEL_THEMES;
}

/**
 * 获取最大关卡数
 * @returns {number} 最大关卡数
 */
function getMaxLevel() {
  return Math.max(...Object.keys(UNIFIED_LEVEL_THEMES).map(Number));
}

/**
 * 根据难度获取关卡范围
 * @param {string} difficulty - 难度级别
 * @returns {Array} 该难度的关卡编号数组
 */
function getLevelRangeByDifficulty(difficulty) {
  const levels = [];
  for (const [level, config] of Object.entries(UNIFIED_LEVEL_THEMES)) {
    if (config.difficulty === difficulty) {
      levels.push(parseInt(level));
    }
  }
  return levels.sort((a, b) => a - b);
}

/**
 * 验证关卡主题配置的完整性
 * @returns {Object} 验证结果
 */
function validateLevelThemes() {
  const results = {
    totalLevels: Object.keys(UNIFIED_LEVEL_THEMES).length,
    missingLevels: [],
    invalidConfigs: [],
    totalTargetWords: 0,
    difficultyDistribution: {}
  };

  // 检查1-35关是否都存在
  for (let i = 1; i <= 35; i++) {
    if (!UNIFIED_LEVEL_THEMES[i]) {
      results.missingLevels.push(i);
    }
  }

  // 验证每个关卡配置的完整性
  for (const [level, config] of Object.entries(UNIFIED_LEVEL_THEMES)) {
    const requiredFields = ['theme', 'name', 'description', 'icon', 'targetWords', 'difficulty'];
    const missingFields = requiredFields.filter(field => !config[field]);
    
    if (missingFields.length > 0) {
      results.invalidConfigs.push({
        level: parseInt(level),
        missingFields
      });
    }

    // 统计目标单词数
    if (config.targetWords) {
      results.totalTargetWords += config.targetWords;
    }

    // 统计难度分布
    if (config.difficulty) {
      if (!results.difficultyDistribution[config.difficulty]) {
        results.difficultyDistribution[config.difficulty] = 0;
      }
      results.difficultyDistribution[config.difficulty]++;
    }
  }

  console.log('关卡主题验证结果:', results);
  return results;
}

// 如果直接运行此文件，执行验证
if (require.main === module) {
  validateLevelThemes();
}

module.exports = {
  UNIFIED_LEVEL_THEMES,
  getUnifiedLevelConfig,
  getAllLevelThemes,
  getLevelRangeByDifficulty,
  validateLevelThemes,
  getMaxLevel
};