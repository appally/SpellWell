/**
 * 统一关卡主题配置系统
 * 为SpellWell应用提供完整的20个关卡配置
 * 优化版本：基于实际单词分类数量进行合理分配
 */

const enhancedDifficulty = require('./enhanced-difficulty-system.js');
const wordLibrary = require('./word-library.js');

/**
 * 统一关卡主题配置对象
 * 包含20个关卡的完整配置信息
 */
const UNIFIED_LEVEL_THEMES = {
  "1": {
    "theme": "英语启蒙",
    "name": "第一次相遇",
    "description": "最简单的英语单词，开始英语之旅",
    "icon": "🌟",
    "targetWords": 25,
    "difficulty": "beginner",
    "focusCategories": [
      "基础词汇"
    ],
    "learningGoals": [
      "认识英语字母组合",
      "学会基础发音",
      "建立学习信心"
    ]
  },
  "2": {
    "theme": "我的家人",
    "name": "温馨家庭",
    "description": "认识家庭成员，学习亲情表达",
    "icon": "👨‍👩‍👧‍👦",
    "targetWords": 18,
    "difficulty": "beginner",
    "focusCategories": [
      "家庭成员"
    ],
    "learningGoals": [
      "认识家庭成员",
      "学会称呼",
      "表达家庭关系"
    ]
  },
  "3": {
    "theme": "身体认知",
    "name": "认识自己",
    "description": "学习身体各部位名称，关爱自己的身体",
    "icon": "👤",
    "targetWords": 11,
    "difficulty": "beginner",
    "focusCategories": [
      "身体部位"
    ],
    "learningGoals": [
      "认识身体部位",
      "学会保护身体",
      "表达身体感受"
    ]
  },
  "4": {
    "theme": "缤纷色彩",
    "name": "彩虹世界",
    "description": "探索色彩奥秘，发现生活中的美",
    "icon": "🌈",
    "targetWords": 9,
    "difficulty": "beginner",
    "focusCategories": [
      "颜色彩虹"
    ],
    "learningGoals": [
      "识别基本颜色",
      "描述物体颜色",
      "培养审美能力"
    ]
  },
  "5": {
    "theme": "美味食物",
    "name": "美食探索",
    "description": "认识各种食物，培养健康饮食观念",
    "icon": "🍎",
    "targetWords": 31,
    "difficulty": "easy",
    "focusCategories": [
      "美食天地"
    ],
    "learningGoals": [
      "识别食物种类",
      "表达喜好",
      "学习营养知识"
    ]
  },
  "6": {
    "theme": "学习用品",
    "name": "学习好帮手",
    "description": "认识各种学习用品，培养学习兴趣",
    "icon": "📚",
    "targetWords": 31,
    "difficulty": "easy",
    "focusCategories": [
      "学习用品"
    ],
    "learningGoals": [
      "熟悉学习工具",
      "养成学习习惯",
      "提高学习效率"
    ]
  },
  "7": {
    "theme": "家居生活",
    "name": "温馨的家",
    "description": "认识家居用品，学会整理家务",
    "icon": "🏠",
    "targetWords": 33,
    "difficulty": "easy",
    "focusCategories": [
      "家庭用品"
    ],
    "learningGoals": [
      "熟悉家具用品",
      "学会做家务",
      "培养责任感"
    ]
  },
  "8": {
    "theme": "自然风光",
    "name": "大自然的礼物",
    "description": "欣赏自然美景，培养环保意识",
    "icon": "🌳",
    "targetWords": 24,
    "difficulty": "easy",
    "focusCategories": [
      "自然景观"
    ],
    "learningGoals": [
      "认识自然事物",
      "热爱大自然",
      "学会环保"
    ]
  },
  "9": {
    "theme": "可爱动物",
    "name": "动物朋友",
    "description": "探索动物世界，学习动物名称",
    "icon": "🐾",
    "targetWords": 19,
    "difficulty": "medium",
    "focusCategories": [
      "动物世界"
    ],
    "learningGoals": [
      "认识常见动物",
      "模仿动物声音",
      "了解动物习性"
    ]
  },
  "10": {
    "theme": "娱乐活动",
    "name": "快乐时光",
    "description": "学习各种娱乐活动，培养兴趣爱好",
    "icon": "🎮",
    "targetWords": 20,
    "difficulty": "medium",
    "focusCategories": [
      "娱乐活动"
    ],
    "learningGoals": [
      "了解娱乐方式",
      "培养兴趣爱好",
      "平衡学习与娱乐"
    ]
  },
  "11": {
    "theme": "职业世界",
    "name": "未来梦想",
    "description": "认识各种职业，树立职业理想",
    "icon": "💼",
    "targetWords": 18,
    "difficulty": "medium",
    "focusCategories": [
      "职业体验"
    ],
    "learningGoals": [
      "了解职业特点",
      "树立理想目标",
      "培养职业素养"
    ]
  },
  "12": {
    "theme": "运动健身",
    "name": "运动小达人",
    "description": "学习运动项目，培养健康体魄",
    "icon": "⚽",
    "targetWords": 12,
    "difficulty": "medium",
    "focusCategories": [
      "运动健身"
    ],
    "learningGoals": [
      "了解运动项目",
      "养成运动习惯",
      "团队合作精神"
    ]
  },
  "13": {
    "theme": "交通出行",
    "name": "出行小能手",
    "description": "学习各种交通工具，掌握出行知识",
    "icon": "🚗",
    "targetWords": 8,
    "difficulty": "hard",
    "focusCategories": [
      "交通工具"
    ],
    "learningGoals": [
      "认识交通工具",
      "学习交通规则",
      "培养安全意识"
    ]
  },
  "14": {
    "theme": "世界地理",
    "name": "环游世界",
    "description": "了解世界各地，开拓国际视野",
    "icon": "🌍",
    "targetWords": 7,
    "difficulty": "hard",
    "focusCategories": [
      "世界地理"
    ],
    "learningGoals": [
      "了解世界文化",
      "培养国际视野",
      "增强文化自信"
    ]
  },
  "15": {
    "theme": "艺术创作",
    "name": "创意天地",
    "description": "体验艺术创作，培养创造力",
    "icon": "🎨",
    "targetWords": 7,
    "difficulty": "hard",
    "focusCategories": [
      "音乐艺术"
    ],
    "learningGoals": [
      "培养艺术感知",
      "体验创作乐趣",
      "提升审美能力"
    ]
  },
  "16": {
    "theme": "科学探索",
    "name": "小小科学家",
    "description": "探索科学奥秘，激发求知欲",
    "icon": "🔬",
    "targetWords": 5,
    "difficulty": "hard",
    "focusCategories": [
      "科学探索"
    ],
    "learningGoals": [
      "培养科学思维",
      "学会观察实验",
      "激发创新精神"
    ]
  },
  "17": {
    "theme": "植物花卉",
    "name": "花园小达人",
    "description": "认识美丽的植物花卉，热爱自然",
    "icon": "🌸",
    "targetWords": 4,
    "difficulty": "hard",
    "focusCategories": [
      "植物花卉"
    ],
    "learningGoals": [
      "认识植物花卉",
      "培养观察能力",
      "热爱自然生活"
    ]
  },
  "18": {
    "theme": "艺术创作",
    "name": "小小艺术家",
    "description": "体验艺术创作的乐趣",
    "icon": "🖌️",
    "targetWords": 4,
    "difficulty": "hard",
    "focusCategories": [
      "艺术创作"
    ],
    "learningGoals": [
      "了解艺术创作",
      "培养创造力",
      "提升审美情趣"
    ]
  },
  "19": {
    "theme": "情感表达",
    "name": "我的心情",
    "description": "学会表达情感，理解他人感受",
    "icon": "😊",
    "targetWords": 46,
    "difficulty": "expert",
    "focusCategories": [
      "情感表达"
    ],
    "learningGoals": [
      "识别情感状态",
      "正确表达情感",
      "培养同理心"
    ]
  },
  "20": {
    "theme": "基础词汇强化",
    "name": "英语小达人",
    "description": "最高难度的综合挑战，成为英语小达人",
    "icon": "👑",
    "targetWords": 175,
    "difficulty": "expert",
    "focusCategories": [
      "基础词汇"
    ],
    "learningGoals": [
      "达到学习目标",
      "建立学习自信",
      "为进阶学习做准备"
    ]
  }
};

/**
 * 获取指定关卡的配置信息
 * @param {number} level 关卡编号 (1-20)
 * @returns {Object|null} 关卡配置对象
 */
function getUnifiedLevelConfig(level) {
  if (level < 1 || level > 20) {
    console.warn(`⚠️  关卡编号超出范围: ${level}，有效范围是1-20`);
    return null;
  }
  return UNIFIED_LEVEL_THEMES[level] || null;
}

/**
 * 获取所有关卡主题列表
 * @returns {Array} 关卡主题数组
 */
function getAllLevelThemes() {
  return Object.values(UNIFIED_LEVEL_THEMES);
}

/**
 * 获取最大关卡数
 * @returns {number} 最大关卡数 (20)
 */
function getMaxLevel() {
  return 20;
}

/**
 * 根据难度获取关卡范围
 * @param {string} difficulty 难度级别
 * @returns {Array} 关卡编号数组
 */
function getLevelRangeByDifficulty(difficulty) {
  const levels = [];
  for (let i = 1; i <= 20; i++) {
    const config = UNIFIED_LEVEL_THEMES[i];
    if (config && config.difficulty === difficulty) {
      levels.push(i);
    }
  }
  return levels;
}

/**
 * 验证关卡主题配置的完整性
 * @returns {Object} 验证结果
 */
function validateLevelThemes() {
  console.log('🔍 验证20关主题配置...');
  
  const issues = [];
  const stats = {
    totalLevels: 0,
    totalWords: 0,
    difficultyDistribution: {},
    categoryUsage: {}
  };
  
  // 检查每个关卡
  for (let level = 1; level <= 20; level++) {
    const config = UNIFIED_LEVEL_THEMES[level];
    
    if (!config) {
      issues.push(`❌ 关卡 ${level} 配置缺失`);
      continue;
    }
    
    stats.totalLevels++;
    stats.totalWords += config.targetWords || 0;
    
    // 统计难度分布
    const difficulty = config.difficulty || 'unknown';
    stats.difficultyDistribution[difficulty] = (stats.difficultyDistribution[difficulty] || 0) + 1;
    
    // 统计分类使用
    if (config.focusCategories) {
      config.focusCategories.forEach(category => {
        stats.categoryUsage[category] = (stats.categoryUsage[category] || 0) + (config.targetWords || 0);
      });
    }
    
    // 检查必需字段
    const requiredFields = ['theme', 'name', 'description', 'icon', 'targetWords', 'difficulty'];
    requiredFields.forEach(field => {
      if (!config[field]) {
        issues.push(`❌ 关卡 ${level} 缺少字段: ${field}`);
      }
    });
  }
  
  // 输出验证结果
  console.log(`
📊 配置统计:`);
  console.log(`  总关卡数: ${stats.totalLevels}`);
  console.log(`  总单词数: ${stats.totalWords}`);
  
  console.log(`
📈 难度分布:`);
  Object.entries(stats.difficultyDistribution).forEach(([difficulty, count]) => {
    console.log(`  ${difficulty}: ${count}关`);
  });
  
  console.log(`
📚 分类使用情况:`);
  Object.entries(stats.categoryUsage)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, words]) => {
      console.log(`  ${category}: ${words}个单词`);
    });
  
  if (issues.length > 0) {
    console.log(`
⚠️  发现问题:`);
    issues.forEach(issue => console.log(`  ${issue}`));
  } else {
    console.log(`
✅ 配置验证通过！`);
  }
  
  return {
    valid: issues.length === 0,
    issues,
    stats
  };
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
