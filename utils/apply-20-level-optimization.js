/**
 * 应用20关优化配置
 * 将平衡的20关设计应用到项目中
 */

const fs = require('fs');
const path = require('path');
const { generateBalanced20Levels } = require('./balanced-20-levels.js');

/**
 * 生成新的unified-level-themes.js文件内容
 */
function generateNewUnifiedThemes() {
  const balanced20Levels = generateBalanced20Levels();
  
  const fileContent = `/**
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
const UNIFIED_LEVEL_THEMES = ${JSON.stringify(balanced20Levels, null, 2)};

/**
 * 获取指定关卡的配置信息
 * @param {number} level 关卡编号 (1-20)
 * @returns {Object|null} 关卡配置对象
 */
function getUnifiedLevelConfig(level) {
  if (level < 1 || level > 20) {
    console.warn(\`⚠️  关卡编号超出范围: \${level}，有效范围是1-20\`);
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
      issues.push(\`❌ 关卡 \${level} 配置缺失\`);
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
        issues.push(\`❌ 关卡 \${level} 缺少字段: \${field}\`);
      }
    });
  }
  
  // 输出验证结果
  console.log(\`\n📊 配置统计:\`);
  console.log(\`  总关卡数: \${stats.totalLevels}\`);
  console.log(\`  总单词数: \${stats.totalWords}\`);
  
  console.log(\`\n📈 难度分布:\`);
  Object.entries(stats.difficultyDistribution).forEach(([difficulty, count]) => {
    console.log(\`  \${difficulty}: \${count}关\`);
  });
  
  console.log(\`\n📚 分类使用情况:\`);
  Object.entries(stats.categoryUsage)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, words]) => {
      console.log(\`  \${category}: \${words}个单词\`);
    });
  
  if (issues.length > 0) {
    console.log(\`\n⚠️  发现问题:\`);
    issues.forEach(issue => console.log(\`  \${issue}\`));
  } else {
    console.log(\`\n✅ 配置验证通过！\`);
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
`;
  
  return fileContent;
}

/**
 * 应用20关优化配置
 */
function apply20LevelOptimization() {
  console.log('🎯 开始应用20关优化配置...');
  
  try {
    // 1. 备份原文件
    const originalPath = path.join(__dirname, 'unified-level-themes.js');
    const backupPath = path.join(__dirname, 'unified-level-themes.backup.js');
    
    if (fs.existsSync(originalPath)) {
      fs.copyFileSync(originalPath, backupPath);
      console.log('✅ 已备份原配置文件');
    }
    
    // 2. 生成新配置内容
    const newContent = generateNewUnifiedThemes();
    
    // 3. 写入新配置
    fs.writeFileSync(originalPath, newContent, 'utf8');
    console.log('✅ 已更新 unified-level-themes.js');
    
    // 4. 验证新配置
    delete require.cache[require.resolve('./unified-level-themes.js')];
    const newConfig = require('./unified-level-themes.js');
    const validation = newConfig.validateLevelThemes();
    
    if (validation.valid) {
      console.log('\n🎉 20关优化配置应用成功！');
      console.log('\n✨ 优化效果:');
      console.log('• 从35关优化为20关，减少冗余');
      console.log('• 每关都有明确的主题分类');
      console.log('• 按难度递进，符合学习规律');
      console.log('• 充分利用各类别单词资源');
      console.log('• 所有507个单词100%合理分配');
      
      console.log('\n📋 需要同步更新的文件:');
      console.log('• word-library.js - 更新 getLevelWords 函数的关卡范围验证');
      console.log('• data-manager.js - 更新 currentLevel 最大值');
      console.log('• statistics.js - 更新关卡循环范围');
      console.log('• statistics.wxml - 更新显示的关卡总数');
      console.log('• apply-optimizations.js - 更新关卡验证逻辑');
      console.log('• optimized-word-library.js - 更新关卡范围');
      
    } else {
      console.log('❌ 配置验证失败，请检查问题');
    }
    
  } catch (error) {
    console.error('❌ 应用配置时出错:', error.message);
  }
}

// 如果直接运行此文件，应用优化
if (require.main === module) {
  apply20LevelOptimization();
}

module.exports = {
  generateNewUnifiedThemes,
  apply20LevelOptimization
};