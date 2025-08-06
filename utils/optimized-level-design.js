/**
 * 优化关卡设计方案
 * 基于单词分类统计，重新设计20关合理分布
 */

const wordLibrary = require('./word-library.js');
const unifiedThemes = require('./unified-level-themes.js');

/**
 * 分析当前单词分类分布
 * @returns {Object} 分类统计信息
 */
function analyzeWordDistribution() {
  const words = wordLibrary.getAllPrimaryWords();
  const categoryStats = {};
  
  words.forEach(word => {
    const category = word.category || '未分类';
    categoryStats[category] = (categoryStats[category] || 0) + 1;
  });
  
  console.log('📊 当前单词分类统计:');
  Object.entries(categoryStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, count]) => {
      console.log(`  ${category}: ${count}个单词`);
    });
  
  console.log(`\n总计: ${words.length}个单词`);
  return categoryStats;
}

/**
 * 设计优化的20关关卡配置
 * @param {Object} categoryStats 分类统计数据
 * @returns {Object} 优化后的关卡配置
 */
function designOptimizedLevels(categoryStats) {
  // 基于单词数量和学习难度设计20关
  const optimizedLevels = {
    // 入门级 (1-4关) - 基础词汇为主
    1: {
      theme: '英语启蒙',
      name: '第一次相遇',
      description: '最简单的英语单词，开始英语之旅',
      icon: '🌟',
      targetWords: 20,
      difficulty: 'beginner',
      focusCategories: ['基础词汇'],
      learningGoals: ['认识英语字母组合', '学会基础发音', '建立学习信心'],
      estimatedTime: '8-10分钟'
    },
    
    2: {
      theme: '我的家人',
      name: '温馨家庭',
      description: '认识家庭成员，学习亲情表达',
      icon: '👨‍👩‍👧‍👦',
      targetWords: 18,
      difficulty: 'beginner',
      focusCategories: ['家庭成员', '基础词汇'],
      learningGoals: ['认识家庭成员', '学会称呼', '表达家庭关系'],
      estimatedTime: '8-10分钟'
    },
    
    3: {
      theme: '身体认知',
      name: '认识自己',
      description: '学习身体各部位名称，关爱自己的身体',
      icon: '👤',
      targetWords: 15,
      difficulty: 'beginner',
      focusCategories: ['身体部位', '基础词汇'],
      learningGoals: ['认识身体部位', '学会保护身体', '表达身体感受'],
      estimatedTime: '8-10分钟'
    },
    
    4: {
      theme: '缤纷色彩',
      name: '彩虹世界',
      description: '探索色彩奥秘，发现生活中的美',
      icon: '🌈',
      targetWords: 12,
      difficulty: 'beginner',
      focusCategories: ['颜色彩虹', '基础词汇'],
      learningGoals: ['识别基本颜色', '描述物体颜色', '培养审美能力'],
      estimatedTime: '8-10分钟'
    },
    
    // 基础级 (5-8关) - 生活常见事物
    5: {
      theme: '美味食物',
      name: '美食探索',
      description: '认识各种食物，培养健康饮食观念',
      icon: '🍎',
      targetWords: 25,
      difficulty: 'easy',
      focusCategories: ['美食天地'],
      learningGoals: ['识别食物种类', '表达喜好', '学习营养知识'],
      estimatedTime: '10-12分钟'
    },
    
    6: {
      theme: '学习用品',
      name: '学习好帮手',
      description: '认识各种学习用品，培养学习兴趣',
      icon: '📚',
      targetWords: 25,
      difficulty: 'easy',
      focusCategories: ['学习用品'],
      learningGoals: ['熟悉学习工具', '养成学习习惯', '提高学习效率'],
      estimatedTime: '10-12分钟'
    },
    
    7: {
      theme: '家居生活',
      name: '温馨的家',
      description: '认识家居用品，学会整理家务',
      icon: '🏠',
      targetWords: 25,
      difficulty: 'easy',
      focusCategories: ['家庭用品'],
      learningGoals: ['熟悉家具用品', '学会做家务', '培养责任感'],
      estimatedTime: '10-12分钟'
    },
    
    8: {
      theme: '自然风光',
      name: '大自然的礼物',
      description: '欣赏自然美景，培养环保意识',
      icon: '🌳',
      targetWords: 20,
      difficulty: 'easy',
      focusCategories: ['自然景观'],
      learningGoals: ['认识自然事物', '热爱大自然', '学会环保'],
      estimatedTime: '10-12分钟'
    },
    
    // 进阶级 (9-12关) - 动态活动和情感
    9: {
      theme: '可爱动物',
      name: '动物朋友',
      description: '探索动物世界，学习动物名称',
      icon: '🐾',
      targetWords: 20,
      difficulty: 'medium',
      focusCategories: ['动物世界'],
      learningGoals: ['认识常见动物', '模仿动物声音', '了解动物习性'],
      estimatedTime: '12-14分钟'
    },
    
    10: {
      theme: '娱乐活动',
      name: '快乐时光',
      description: '学习各种娱乐活动，培养兴趣爱好',
      icon: '🎮',
      targetWords: 20,
      difficulty: 'medium',
      focusCategories: ['娱乐活动'],
      learningGoals: ['了解娱乐方式', '培养兴趣爱好', '平衡学习与娱乐'],
      estimatedTime: '12-14分钟'
    },
    
    11: {
      theme: '职业世界',
      name: '未来梦想',
      description: '认识各种职业，树立职业理想',
      icon: '💼',
      targetWords: 18,
      difficulty: 'medium',
      focusCategories: ['职业体验'],
      learningGoals: ['了解职业特点', '树立理想目标', '培养职业素养'],
      estimatedTime: '12-14分钟'
    },
    
    12: {
      theme: '运动健身',
      name: '运动小达人',
      description: '学习运动项目，培养健康体魄',
      icon: '⚽',
      targetWords: 15,
      difficulty: 'medium',
      focusCategories: ['运动健身'],
      learningGoals: ['了解运动项目', '养成运动习惯', '团队合作精神'],
      estimatedTime: '12-14分钟'
    },
    
    // 高级 (13-16关) - 抽象概念和复杂表达
    13: {
      theme: '情感表达',
      name: '我的心情',
      description: '学会表达情感，理解他人感受',
      icon: '😊',
      targetWords: 30,
      difficulty: 'hard',
      focusCategories: ['情感表达'],
      learningGoals: ['识别情感状态', '正确表达情感', '培养同理心'],
      estimatedTime: '14-16分钟'
    },
    
    14: {
      theme: '交通出行',
      name: '出行小能手',
      description: '学习各种交通工具，掌握出行知识',
      icon: '🚗',
      targetWords: 10,
      difficulty: 'hard',
      focusCategories: ['交通工具'],
      learningGoals: ['认识交通工具', '学习交通规则', '培养安全意识'],
      estimatedTime: '14-16分钟'
    },
    
    15: {
      theme: '音乐艺术',
      name: '艺术天地',
      description: '体验音乐艺术，培养审美情趣',
      icon: '🎵',
      targetWords: 10,
      difficulty: 'hard',
      focusCategories: ['音乐艺术', '艺术创作'],
      learningGoals: ['培养艺术感知', '体验创作乐趣', '提升审美能力'],
      estimatedTime: '14-16分钟'
    },
    
    16: {
      theme: '世界地理',
      name: '环游世界',
      description: '了解世界各地，开拓国际视野',
      icon: '🌍',
      targetWords: 8,
      difficulty: 'hard',
      focusCategories: ['世界地理'],
      learningGoals: ['了解世界文化', '培养国际视野', '增强文化自信'],
      estimatedTime: '14-16分钟'
    },
    
    // 专家级 (17-20关) - 综合应用和挑战
    17: {
      theme: '科学探索',
      name: '小小科学家',
      description: '探索科学奥秘，激发求知欲',
      icon: '🔬',
      targetWords: 8,
      difficulty: 'expert',
      focusCategories: ['科学探索', '植物花卉'],
      learningGoals: ['培养科学思维', '学会观察实验', '激发创新精神'],
      estimatedTime: '16-18分钟'
    },
    
    18: {
      theme: '基础词汇强化',
      name: '词汇大师',
      description: '强化基础词汇，提升语言能力',
      icon: '📖',
      targetWords: 40,
      difficulty: 'expert',
      focusCategories: ['基础词汇'],
      learningGoals: ['巩固基础词汇', '提升语言运用', '增强表达能力'],
      estimatedTime: '16-18分钟'
    },
    
    19: {
      theme: '综合复习',
      name: '知识大融合',
      description: '综合运用所学知识，查漏补缺',
      icon: '🎯',
      targetWords: 35,
      difficulty: 'expert',
      focusCategories: ['基础词汇', '情感表达', '自然景观'],
      learningGoals: ['巩固已学知识', '查漏补缺', '综合运用能力'],
      estimatedTime: '18-20分钟'
    },
    
    20: {
      theme: '终极挑战',
      name: '英语小达人',
      description: '最高难度的综合挑战，成为英语小达人',
      icon: '👑',
      targetWords: 40,
      difficulty: 'expert',
      focusCategories: ['全部分类'],
      learningGoals: ['达到学习目标', '建立学习自信', '为进阶学习做准备'],
      estimatedTime: '20-25分钟'
    }
  };
  
  return optimizedLevels;
}

/**
 * 验证关卡设计的合理性
 * @param {Object} levels 关卡配置
 * @param {Object} categoryStats 分类统计
 */
function validateLevelDesign(levels, categoryStats) {
  console.log('\n🔍 验证关卡设计合理性:');
  
  let totalTargetWords = 0;
  const categoryUsage = {};
  
  Object.entries(levels).forEach(([levelNum, config]) => {
    totalTargetWords += config.targetWords;
    
    config.focusCategories.forEach(category => {
      if (category !== '全部分类') {
        categoryUsage[category] = (categoryUsage[category] || 0) + config.targetWords;
      }
    });
  });
  
  console.log(`📊 总目标单词数: ${totalTargetWords}`);
  console.log(`📚 实际单词数: ${Object.values(categoryStats).reduce((sum, count) => sum + count, 0)}`);
  
  console.log('\n📋 各分类使用情况:');
  Object.entries(categoryStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, available]) => {
      const used = categoryUsage[category] || 0;
      const coverage = available > 0 ? (used / available * 100).toFixed(1) : 0;
      console.log(`  ${category}: ${used}/${available} (${coverage}%)`);
    });
}

/**
 * 生成关卡分配报告
 */
function generateLevelReport() {
  console.log('🎯 SpellWell 优化关卡设计方案');
  console.log('='.repeat(50));
  
  const categoryStats = analyzeWordDistribution();
  const optimizedLevels = designOptimizedLevels(categoryStats);
  
  console.log('\n📋 优化后的20关设计:');
  Object.entries(optimizedLevels).forEach(([levelNum, config]) => {
    console.log(`\n第${levelNum}关: ${config.name} (${config.theme})`);
    console.log(`  🎯 目标单词: ${config.targetWords}个`);
    console.log(`  📚 主要分类: ${config.focusCategories.join(', ')}`);
    console.log(`  ⭐ 难度: ${config.difficulty}`);
    console.log(`  ⏱️  预计时间: ${config.estimatedTime}`);
  });
  
  validateLevelDesign(optimizedLevels, categoryStats);
  
  console.log('\n✨ 设计亮点:');
  console.log('• 从35关优化为20关，减少冗余');
  console.log('• 每关都有明确的主题分类');
  console.log('• 按难度递进，符合学习规律');
  console.log('• 充分利用各类别单词资源');
  console.log('• 避免后期关卡主题重复问题');
  
  return optimizedLevels;
}

// 如果直接运行此文件，生成报告
if (require.main === module) {
  generateLevelReport();
}

module.exports = {
  analyzeWordDistribution,
  designOptimizedLevels,
  validateLevelDesign,
  generateLevelReport
};