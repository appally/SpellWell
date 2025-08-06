/**
 * 系统性改进单词库tips的脚本
 * 将发音类tips替换为对小学生学习更有价值的内容
 */

const fs = require('fs');
const path = require('path');

/**
 * 完整的改进tips映射表
 * 基于小学英语教学大纲和考试要求
 */
const IMPROVED_TIPS_MAP = {
  // 发音类tips的替换规则
  "发音像数字'八'的开头音": "不定冠词，用在单数可数名词前，如：a book, a cat",
  "读作'阿-包特'，想象一个包裹的故事": "介词，表示'关于'，常用句型：talk about, think about",
  "读音像'阿夫特'，想象一个故事的'之后'": "时间介词，表示'在...之后'，与before相对",
  "读作'阿给恩'，想象再次给予": "副词，表示'再次'，常放在句末",
  "读音像'阿够'，表示时间过去了": "副词，表示'以前'，用于一般过去时",
  "读音像'爱儿'，我们都爱空气": "不可数名词，表示'空气'",
  "读音像'奥'的长音，表示全部": "限定词，表示'全部的'，后接复数名词",
  "读音像'安德'，是连接词": "并列连词，连接相同成分",
  "读作'阿尼玛尔'，想象各种可爱的小动物": "可数名词，复数形式：animals",
  "读作'安塞'，想象回答问题的声音": "动词和名词，answer the question（回答问题）",
  "读作'艾尼'，不读作'安妮'": "用于否定句和疑问句，表示'任何的'",
  "读作'阿波'，想象红色的大苹果": "可数名词，复数：apples",
  "读音像'啊姆'，想象臂膨的手臂": "可数名词，人有两只arms",
  "读音像'阿特'，想象大艺术家": "不可数名词，表示'艺术'",
  "读音像'阿斯克'，是问问题的意思": "动词，ask sb sth（问某人某事）",
  "读音像'阿特'，表示'在'某个地方": "介词，表示地点、时间",
  "读作'阿姨特'，想象温柔的姨姨": "可数名词，家庭成员词汇",
  "读作'奥德姆'，想象金黄的秋天落叶": "季节名词，也可说fall",
  "读作'贝比'，想象可爱的小宝宝": "可数名词，复数：babies（y变i加es）",
  "读作'贝克'，想象返回、后面": "名词/副词，go back（回去），at the back（在后面）",
  "读作'贝德'，表示不好的、坏的": "形容词，比较级：worse，最高级：worst",
  "读作'贝格'，想象背在身上的书包": "可数名词，schoolbag（书包）是复合词",
  "读作'鲍尔'，想象圆圆的球": "可数名词，球类运动词汇",
  "读作'巴拿拿'，想象黄色的香蕉": "可数名词，复数：bananas",
  "读作'比'，是英语中最重要的动词": "系动词，am/is/are的原形",
  "读作'比奇'，想象金黄的沙滩和蓝色的大海": "可数名词，度假话题词汇",
  "读作'比优特富尔'，表示美丽的": "形容词，比lovely更正式",
  "读作'比酷斯'，表示'因为'": "连词，引导原因状语从句",
  "读作'贝德'，想象舒适的床铺": "可数名词，go to bed（上床睡觉）",
  "读作'比'，想象小蜂蜜干勤的样子": "可数名词，昆虫类词汇",
  "读作'比得'，表示'在...之前'": "介词/连词，表示'在...之前'",
  "读作'比金'，表示开始": "动词，过去式：began，过去分词：begun",
  "读作'比海德'，表示在后面": "介词，表示'在...后面'",
  "读作'比萨德'，表示在旁边": "介词，表示'在...旁边'",
  "读作'贝斯特'，表示最好的": "形容词最高级，good的最高级形式",
  "读作'比特温'，表示在两者之间": "介词，表示'在两者之间'",
  "读作'拜克'，想象骑自行车的样子": "可数名词，bicycle的缩写",
  "读作'伯德'，想象小鸟在天空飞翔": "可数名词，动物类词汇",
  "读作'布莱克'，想象深暗的黑色": "颜色形容词，也可作名词",
  "读作'布鲁'，想象蔚蓝的天空和大海": "颜色形容词，也可作名词",
  "读作'伯迪'，想象整个身体": "可数名词，身体部位话题",
  "读作'布克'，想象打开一本有趣的书": "可数名词，学习用品",
  "读作'博克斯'，想象正方形的盒子": "可数名词，复数：boxes",
  "读作'布瑞德'，想象香喷喷的面包": "不可数名词，食物类词汇",
  "读作'布林格'，表示带来、拿来": "动词，过去式：brought",
  "读作'布罗泽'，想象和蒼的哥哥或弟弟": "可数名词，家庭成员",
  "读作'布朗'，想象棕色的树干和泥土": "颜色形容词，也可作名词",
  "读作'巴士'，想象黄色的大公共汽车": "可数名词，复数：buses",
  "读作'比兹'，表示很忙碌": "形容词，表示'忙碌的'",
  "读作'但特'，表示'但是'的意思": "转折连词，表示'但是'",
  "读作'拜'，表示买东西": "动词，过去式：bought",
  "读作'拜'，表示'通过'或'在...旁边'": "介词，表示方式、方法"
};

/**
 * 通用的学习价值tips生成器
 */
function generateEducationalTip(word, category, difficulty) {
  const tips = [];
  
  // 根据难度等级添加学习建议
  if (difficulty === 'easy') {
    tips.push('基础词汇，小学必掌握，多练习拼写和发音');
  } else if (difficulty === 'medium') {
    tips.push('中等难度词汇，注意词汇搭配和用法');
  } else if (difficulty === 'advanced' || difficulty === 'hard') {
    tips.push('较难词汇，重点掌握词义和语法用法');
  }
  
  // 根据分类添加学习建议
  const categoryTips = {
    '基础词汇': '基础词汇，是构建英语能力的重要基石',
    '家庭成员': '家庭话题常用词，可以介绍自己的家人',
    '动物世界': '动物类词汇，可以描述动物的特征和习性',
    '美食天地': '食物类词汇，健康饮食话题的重要词汇',
    '学习用品': '学习用品词汇，校园生活必备词汇',
    '运动健身': '运动类词汇，描述体育活动和健康生活',
    '颜色彩虹': '颜色词汇，可以描述物品的外观特征',
    '交通工具': '交通工具词汇，出行和旅游话题常用',
    '自然景观': '自然类词汇，环保和地理话题重要词汇',
    '身体部位': '身体部位词汇，健康话题和日常描述必备',
    '情感表达': '情感类词汇，表达感受和情绪的重要词汇',
    '音乐艺术': '艺术类词汇，文化和兴趣话题相关',
    '娱乐活动': '娱乐活动词汇，描述休闲和娱乐生活',
    '家庭用品': '家居用品词汇，日常生活场景常用'
  };
  
  if (categoryTips[category]) {
    tips.push(categoryTips[category]);
  }
  
  return tips;
}

/**
 * 主处理函数 - 系统性替换所有发音类tips
 */
function improveTipsSystematically() {
  const filePath = path.join(__dirname, 'word-library.js');
  
  try {
    console.log('开始处理word-library.js文件...');
    
    // 读取原文件
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 统计替换次数
    let replacementCount = 0;
    
    // 替换所有映射表中的发音类tips
    for (const [oldTip, newTip] of Object.entries(IMPROVED_TIPS_MAP)) {
      const regex = new RegExp(`"${oldTip.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, `"${newTip}"`);
        replacementCount += matches.length;
        console.log(`替换了 ${matches.length} 个 "${oldTip.substring(0, 20)}..."`);
      }
    }
    
    // 替换其他通用的发音类tips模式
    const pronunciationPatterns = [
      /"读作'[^']*'[^"]*"/g,
      /"读音像'[^']*'[^"]*"/g,
      /"发音像[^"]*"/g
    ];
    
    pronunciationPatterns.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, '"重要词汇，建议多练习拼写和用法"');
        replacementCount += matches.length;
        console.log(`通过模式${index + 1}替换了 ${matches.length} 个发音类tips`);
      }
    });
    
    // 写入改进后的文件
    const outputPath = path.join(__dirname, 'word-library-improved.js');
    fs.writeFileSync(outputPath, content, 'utf8');
    
    console.log(`\n=== Tips改进完成 ===`);
    console.log(`总共替换了 ${replacementCount} 个发音类tips`);
    console.log(`改进后的文件保存为: ${outputPath}`);
    console.log('\n主要改进内容:');
    console.log('1. 将发音描述替换为语法要点和用法说明');
    console.log('2. 增加了词汇搭配和考试重点');
    console.log('3. 提供了记忆技巧和学习建议');
    console.log('4. 强调了词汇的实际应用场景');
    
  } catch (error) {
    console.error('处理文件时出错:', error);
  }
}

/**
 * 验证改进效果
 */
function validateImprovement() {
  const improvedFilePath = path.join(__dirname, 'word-library-improved.js');
  
  try {
    const content = fs.readFileSync(improvedFilePath, 'utf8');
    
    // 检查是否还有发音类tips
    const remainingPronunciationTips = [
      ...content.match(/"读作'[^']*'/g) || [],
      ...content.match(/"读音像'[^']*'/g) || [],
      ...content.match(/"发音像[^"]*"/g) || []
    ];
    
    console.log('\n=== 验证结果 ===');
    if (remainingPronunciationTips.length === 0) {
      console.log('✅ 所有发音类tips已成功替换！');
    } else {
      console.log(`⚠️  还有 ${remainingPronunciationTips.length} 个发音类tips未替换:`);
      remainingPronunciationTips.slice(0, 5).forEach(tip => {
        console.log(`   ${tip}...`);
      });
    }
    
  } catch (error) {
    console.error('验证时出错:', error);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  improveTipsSystematically();
  validateImprovement();
}

module.exports = {
  improveTipsSystematically,
  validateImprovement,
  IMPROVED_TIPS_MAP
};