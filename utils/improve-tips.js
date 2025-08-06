/**
 * 智能Tips生成器 - 为小学单词库生成个性化学习提示
 */

// 根据单词特点生成学习技巧
const tipsGenerator = {
  // 根据单词特征生成tips
  generateTips(word, phonetic, chinese, category) {
    const tips = [];
    
    // 发音技巧
    const pronunciationTip = this.generatePronunciationTip(word, phonetic);
    if (pronunciationTip) tips.push(pronunciationTip);
    
    // 记忆技巧
    const memoryTip = this.generateMemoryTip(word, chinese, category);
    if (memoryTip) tips.push(memoryTip);
    
    return tips.slice(0, 2); // 最多返回2个tips
  },
  
  // 生成发音技巧
  generatePronunciationTip(word, phonetic) {
    const pronunciationMap = {
      'cat': "读音像'凯特'，想象一只可爱的小猫",
      'dog': "读音像'多格'，想象一只忠诚的狗狗",
      'book': "读音像'布克'，想象翻开一本好书",
      'good': "读音像'古德'，表示好的意思",
      'water': "读作'沃特'，想象清澈的水",
      'happy': "读作'哈皮'，想象开心笑脸",
      'mother': "读作'妈泽'，想象慈爱的妈妈",
      'father': "读作'法泽'，想象温暖的爸爸",
      'family': "读作'法米丽'，想象温馨的家庭",
      'friend': "读作'弗润德'，想象好朋友",
      'school': "读作'斯库尔'，想象美丽的学校",
      'teacher': "读作'提切'，想象和蔼的老师",
      'student': "读作'斯图登特'，想象勤奋的学生",
      'house': "读作'豪斯'，想象温暖的房子",
      'car': "读作'卡'，想象快速的汽车",
      'bike': "读作'拜克'，想象骑自行车",
      'food': "读作'富德'，想象美味的食物",
      'milk': "读作'米尔克'，想象白色的牛奶",
      'bread': "读作'布瑞德'，想象香喷喷的面包",
      'cake': "读作'凯克'，想象甜美的蛋糕"
    };
    
    return pronunciationMap[word] || `注意"${word}"的正确发音`;
  },
  
  // 生成记忆技巧
  generateMemoryTip(word, chinese, category) {
    // 词汇分解记忆
    const decompositionTips = {
      'birthday': '分解：birth(出生) + day(日子) = 生日',
      'blackboard': '分解：black(黑色) + board(板子) = 黑板',
      'classroom': '分解：class(班级) + room(房间) = 教室',
      'playground': '分解：play(玩耍) + ground(地面) = 操场',
      'breakfast': '分解：break(打破) + fast(禁食) = 早餐',
      'afternoon': '分解：after(之后) + noon(中午) = 下午',
      'basketball': '分解：basket(篮子) + ball(球) = 篮球',
      'football': '分解：foot(脚) + ball(球) = 足球',
      'homework': '分解：home(家) + work(工作) = 家庭作业',
      'sunshine': '分解：sun(太阳) + shine(照耀) = 阳光'
    };
    
    if (decompositionTips[word]) {
      return decompositionTips[word];
    }
    
    // 联想记忆
    const associationTips = {
      '动物世界': `想象${chinese}的叫声和样子`,
      '颜色彩虹': `想象${chinese}的物品，比如${chinese}的花朵`,
      '家庭成员': `想象${chinese}的温暖形象`,
      '美食天地': `想象${chinese}的味道和香味`,
      '身体部位': `指着自己的${chinese}来记忆`,
      '交通工具': `想象坐着${chinese}去旅行`,
      '学习用品': `想象在学习中使用${chinese}`,
      '运动健身': `想象进行${chinese}运动的场景`,
      '娱乐活动': `想象参与${chinese}的快乐时光`,
      '自然景观': `想象美丽的${chinese}风景`,
      '科学探索': `想象${chinese}的科学原理`,
      '职业体验': `想象成为${chinese}的样子`,
      '音乐艺术': `想象${chinese}带来的美感`,
      '世界地理': `想象${chinese}的地理位置`
    };
    
    return associationTips[category] || `记住：${word}表示${chinese}`;
  }
};

// 特殊单词的定制tips
const customTips = {
  'a': [
    "发音像数字'八'的开头音",
    "这是最简单的英文字母，也是最常用的词汇之一"
  ],
  'I': [
    "大写的I像一根柱子，表示'我'",
    "记住：I am happy（我很开心）"
  ],
  'you': [
    "读作'友'，想象对朋友说话",
    "手指指向对方说'You'（你）"
  ],
  'he': [
    "读作'嘿'，指男孩或男人",
    "HE = 他（男性）"
  ],
  'she': [
    "读作'希'，指女孩或女人", 
    "SHE = 她（女性）"
  ],
  'it': [
    "读作'伊特'，指物品或动物",
    "IT技术的IT，表示'它'"
  ],
  'we': [
    "读作'威'，表示我们",
    "WE = 我们大家一起"
  ],
  'they': [
    "读作'泽伊'，表示他们/她们",
    "THEY = 他们/她们（复数）"
  ]
};

module.exports = {
  tipsGenerator,
  customTips
};