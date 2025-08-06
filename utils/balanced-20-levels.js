/**
 * 平衡的20关关卡配置
 * 基于实际单词数量调整，确保合理分配
 */

/**
 * 生成平衡的20关配置
 * 基于实际单词分类数量进行合理分配
 */
function generateBalanced20Levels() {
  // 实际单词分类统计（基于之前的分析结果）
  const actualWordCounts = {
    '基础词汇': 200,
    '情感表达': 46,
    '家庭用品': 33,
    '学习用品': 31,
    '美食天地': 31,
    '自然景观': 24,
    '娱乐活动': 20,
    '动物世界': 19,
    '家庭成员': 18,
    '职业体验': 18,
    '运动健身': 12,
    '身体部位': 11,
    '颜色彩虹': 9,
    '交通工具': 8,
    '世界地理': 7,
    '音乐艺术': 7,
    '科学探索': 5,
    '艺术创作': 4,
    '植物花卉': 4
  };
  
  const balanced20Levels = {
    1: {
      theme: '英语启蒙',
      name: '第一次相遇',
      description: '最简单的英语单词，开始英语之旅',
      icon: '🌟',
      targetWords: 25,
      difficulty: 'beginner',
      focusCategories: ['基础词汇'],
      learningGoals: ['认识英语字母组合', '学会基础发音', '建立学习信心']
    },
    
    2: {
      theme: '我的家人',
      name: '温馨家庭',
      description: '认识家庭成员，学习亲情表达',
      icon: '👨‍👩‍👧‍👦',
      targetWords: 18,
      difficulty: 'beginner',
      focusCategories: ['家庭成员'],
      learningGoals: ['认识家庭成员', '学会称呼', '表达家庭关系']
    },
    
    3: {
      theme: '身体认知',
      name: '认识自己',
      description: '学习身体各部位名称，关爱自己的身体',
      icon: '👤',
      targetWords: 11,
      difficulty: 'beginner',
      focusCategories: ['身体部位'],
      learningGoals: ['认识身体部位', '学会保护身体', '表达身体感受']
    },
    
    4: {
      theme: '缤纷色彩',
      name: '彩虹世界',
      description: '探索色彩奥秘，发现生活中的美',
      icon: '🌈',
      targetWords: 9,
      difficulty: 'beginner',
      focusCategories: ['颜色彩虹'],
      learningGoals: ['识别基本颜色', '描述物体颜色', '培养审美能力']
    },
    
    5: {
      theme: '美味食物',
      name: '美食探索',
      description: '认识各种食物，培养健康饮食观念',
      icon: '🍎',
      targetWords: 31,
      difficulty: 'easy',
      focusCategories: ['美食天地'],
      learningGoals: ['识别食物种类', '表达喜好', '学习营养知识']
    },
    
    6: {
      theme: '学习用品',
      name: '学习好帮手',
      description: '认识各种学习用品，培养学习兴趣',
      icon: '📚',
      targetWords: 31,
      difficulty: 'easy',
      focusCategories: ['学习用品'],
      learningGoals: ['熟悉学习工具', '养成学习习惯', '提高学习效率']
    },
    
    7: {
      theme: '家居生活',
      name: '温馨的家',
      description: '认识家居用品，学会整理家务',
      icon: '🏠',
      targetWords: 33,
      difficulty: 'easy',
      focusCategories: ['家庭用品'],
      learningGoals: ['熟悉家具用品', '学会做家务', '培养责任感']
    },
    
    8: {
      theme: '自然风光',
      name: '大自然的礼物',
      description: '欣赏自然美景，培养环保意识',
      icon: '🌳',
      targetWords: 24,
      difficulty: 'easy',
      focusCategories: ['自然景观'],
      learningGoals: ['认识自然事物', '热爱大自然', '学会环保']
    },
    
    9: {
      theme: '可爱动物',
      name: '动物朋友',
      description: '探索动物世界，学习动物名称',
      icon: '🐾',
      targetWords: 19,
      difficulty: 'medium',
      focusCategories: ['动物世界'],
      learningGoals: ['认识常见动物', '模仿动物声音', '了解动物习性']
    },
    
    10: {
      theme: '娱乐活动',
      name: '快乐时光',
      description: '学习各种娱乐活动，培养兴趣爱好',
      icon: '🎮',
      targetWords: 20,
      difficulty: 'medium',
      focusCategories: ['娱乐活动'],
      learningGoals: ['了解娱乐方式', '培养兴趣爱好', '平衡学习与娱乐']
    },
    
    11: {
      theme: '职业世界',
      name: '未来梦想',
      description: '认识各种职业，树立职业理想',
      icon: '💼',
      targetWords: 18,
      difficulty: 'medium',
      focusCategories: ['职业体验'],
      learningGoals: ['了解职业特点', '树立理想目标', '培养职业素养']
    },
    
    12: {
      theme: '运动健身',
      name: '运动小达人',
      description: '学习运动项目，培养健康体魄',
      icon: '⚽',
      targetWords: 12,
      difficulty: 'medium',
      focusCategories: ['运动健身'],
      learningGoals: ['了解运动项目', '养成运动习惯', '团队合作精神']
    },
    
    13: {
      theme: '交通出行',
      name: '出行小能手',
      description: '学习各种交通工具，掌握出行知识',
      icon: '🚗',
      targetWords: 8,
      difficulty: 'hard',
      focusCategories: ['交通工具'],
      learningGoals: ['认识交通工具', '学习交通规则', '培养安全意识']
    },
    
    14: {
      theme: '世界地理',
      name: '环游世界',
      description: '了解世界各地，开拓国际视野',
      icon: '🌍',
      targetWords: 7,
      difficulty: 'hard',
      focusCategories: ['世界地理'],
      learningGoals: ['了解世界文化', '培养国际视野', '增强文化自信']
    },
    
    15: {
      theme: '艺术创作',
      name: '创意天地',
      description: '体验艺术创作，培养创造力',
      icon: '🎨',
      targetWords: 7, // 只使用音乐艺术7个
      difficulty: 'hard',
      focusCategories: ['音乐艺术'],
      learningGoals: ['培养艺术感知', '体验创作乐趣', '提升审美能力']
    },
    
    16: {
      theme: '科学探索',
      name: '小小科学家',
      description: '探索科学奥秘，激发求知欲',
      icon: '🔬',
      targetWords: 5, // 只使用科学探索5个
      difficulty: 'hard',
      focusCategories: ['科学探索'],
      learningGoals: ['培养科学思维', '学会观察实验', '激发创新精神']
    },
    
    17: {
      theme: '植物花卉',
      name: '花园小达人',
      description: '认识美丽的植物花卉，热爱自然',
      icon: '🌸',
      targetWords: 4,
      difficulty: 'hard',
      focusCategories: ['植物花卉'],
      learningGoals: ['认识植物花卉', '培养观察能力', '热爱自然生活']
    },
    
    18: {
      theme: '艺术创作',
      name: '小小艺术家',
      description: '体验艺术创作的乐趣',
      icon: '🖌️',
      targetWords: 4,
      difficulty: 'hard',
      focusCategories: ['艺术创作'],
      learningGoals: ['了解艺术创作', '培养创造力', '提升审美情趣']
    },
    
    19: {
      theme: '情感表达',
      name: '我的心情',
      description: '学会表达情感，理解他人感受',
      icon: '😊',
      targetWords: 46,
      difficulty: 'expert',
      focusCategories: ['情感表达'],
      learningGoals: ['识别情感状态', '正确表达情感', '培养同理心']
    },
    
    20: {
      theme: '基础词汇强化',
      name: '英语小达人',
      description: '最高难度的综合挑战，成为英语小达人',
      icon: '👑',
      targetWords: 175,
      difficulty: 'expert',
      focusCategories: ['基础词汇'],
      learningGoals: ['达到学习目标', '建立学习自信', '为进阶学习做准备']
    }
  };
  
  return balanced20Levels;
}

/**
 * 验证平衡性
 */
function validateBalance() {
  const levels = generateBalanced20Levels();
  const actualWordCounts = {
    '基础词汇': 200,
    '情感表达': 46,
    '家庭用品': 33,
    '学习用品': 31,
    '美食天地': 31,
    '自然景观': 24,
    '娱乐活动': 20,
    '动物世界': 19,
    '家庭成员': 18,
    '职业体验': 18,
    '运动健身': 12,
    '身体部位': 11,
    '颜色彩虹': 9,
    '交通工具': 8,
    '世界地理': 7,
    '音乐艺术': 7,
    '科学探索': 5,
    '艺术创作': 4,
    '植物花卉': 4
  };
  
  console.log('🎯 平衡的20关设计方案');
  console.log('='.repeat(50));
  
  let totalTargetWords = 0;
  const categoryUsage = {};
  
  Object.entries(levels).forEach(([levelNum, config]) => {
    totalTargetWords += config.targetWords;
    console.log(`第${levelNum}关: ${config.name} - ${config.targetWords}个单词 (${config.focusCategories.join(', ')})`);
    
    config.focusCategories.forEach(category => {
      categoryUsage[category] = (categoryUsage[category] || 0) + config.targetWords;
    });
  });
  
  console.log(`\n📊 总目标单词数: ${totalTargetWords}`);
  console.log(`📚 实际单词数: ${Object.values(actualWordCounts).reduce((sum, count) => sum + count, 0)}`);
  
  console.log('\n📋 各分类使用情况:');
  Object.entries(actualWordCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, available]) => {
      const used = categoryUsage[category] || 0;
      const coverage = available > 0 ? (used / available * 100).toFixed(1) : 0;
      const status = used <= available ? '✅' : '❌';
      console.log(`  ${status} ${category}: ${used}/${available} (${coverage}%)`);
    });
  
  console.log('\n✨ 优化亮点:');
  console.log('• 每个分类的使用率都不超过100%');
  console.log('• 基础词汇分散在多个关卡中');
  console.log('• 小分类单独成关，避免浪费');
  console.log('• 难度递进合理，符合学习规律');
  console.log('• 总计507个单词全部合理分配');
  
  return levels;
}

// 如果直接运行此文件，生成报告
if (require.main === module) {
  validateBalance();
}

module.exports = {
  generateBalanced20Levels,
  validateBalance
};