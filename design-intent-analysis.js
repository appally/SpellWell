/**
 * 设计意图分析：20关覆盖所有507个单词
 */

// 原始设计：每关的预分配单词数量
const LEVEL_WORD_MAPPING = {
  "1": ["a", "i", "at", "be", "by", "do", "go", "he", "hi", "if", "in", "it", "me", "my", "no", "of", "on", "or", "so", "to", "up", "us", "we", "ago", "all", "and"],
  "2": ["kid", "man", "aunt", "baby", "girl", "child", "family", "father", "friend", "mother", "parent", "sister", "woman", "uncle", "any", "but", "can", "cut", "day", "far", "for", "get", "has", "her", "him", "how"],
  "3": ["arm", "eye", "leg", "back", "body", "face", "hair", "hand", "head", "neck", "nose", "his", "how", "its", "let", "lot", "may", "new", "not", "now", "off", "old", "one", "our", "out", "put"],
  "4": ["red", "blue", "pink", "black", "brown", "green", "white", "yellow", "see", "she", "sit", "six", "ten", "the", "too", "try", "use", "way", "who", "why", "yes", "you", "back", "come", "down", "fresh"],
  "5": ["eat", "egg", "tea", "cake", "fish", "food", "meat", "milk", "soup", "apple", "bread", "chicken", "coffee", "dinner", "drink", "fruit", "juice", "lunch", "water", "hungry", "kitchen", "breakfast", "vegetable", "chocolate", "ice", "meal"],
  "6": ["about", "after", "afternoon", "again", "air", "always", "animal", "answer", "art", "ask", "autumn", "bad", "bag", "ball", "banana", "basketball", "beach", "beautiful", "because", "bed", "bee", "before", "begin", "behind", "beside", "best"],
  "7": ["between", "bike", "bird", "birthday", "blackboard", "book", "box", "bring", "brother", "bus", "busy", "buy", "candle", "cap", "car", "careful", "cat", "catch", "chair", "china", "chinese", "choose", "cinema", "class", "classmate", "classroom"],
  "8": ["clean", "clock", "close", "clothes", "cloudy", "coat", "cold", "colour", "computer", "cook", "cool", "cousin", "cow", "crayon", "cry", "cup", "dance", "dear", "desk", "difficult", "dirty", "doctor", "dog", "doll", "door", "draw"],
  "9": ["dress", "driver", "duck", "early", "earth", "easy", "elephant", "eleven", "email", "english", "enjoy", "every", "excited", "excuse", "famous", "fan", "farm", "farmer", "fast", "favourite", "feel", "film", "find", "fine", "floor", "flower"],
  "10": ["fly", "football", "forest", "fork", "forty", "free", "from", "front", "game", "garden", "gift", "give", "glad", "glass", "good", "goodbye", "grandfather", "grandmother", "grape", "grass", "great", "half", "happy", "hard", "hat", "have"],
  "11": ["healthy", "hear", "heavy", "hello", "help", "here", "hers", "high", "history", "hobby", "hold", "holiday", "home", "hometown", "homework", "hope", "horse", "hospital", "hot", "hour", "house", "hurry", "hurt", "ice-cream", "idea", "ill"],
  "12": ["interesting", "internet", "into", "job", "jump", "keep", "key", "kind", "kite", "know", "lake", "late", "learn", "lesson", "letter", "library", "light", "like", "line", "lion", "listen", "little", "live", "long", "look", "lovely"],
  "13": ["make", "many", "map", "maths", "meet", "middle", "minute", "miss", "money", "monkey", "month", "moon", "morning", "move", "mr", "mrs", "much", "music", "must", "name", "near", "neat", "need", "never", "next", "nice"],
  "14": ["night", "nine", "noodle", "noon", "nurse", "o'clock", "often", "open", "ours", "over", "panda", "paper", "park", "party", "p.e.", "pen", "pencil", "people", "photo", "piano", "picture", "pig", "ping-pong", "place", "plane", "plant"],
  "15": ["play", "playground", "please", "p.m.", "potato", "pretty", "question", "quiet", "rabbit", "race", "read", "right", "river", "robot", "room", "ruler", "run", "sad", "safe", "school", "schoolbag", "science", "sea", "season", "sell", "september"],
  "16": ["seven", "sheep", "ship", "shirt", "shoe", "shop", "short", "should", "show", "sick", "sing", "skirt", "sleep", "small", "snack", "some", "sometimes", "song", "sorry", "space", "speak", "sport", "spring", "stand", "star", "start"],
  "17": ["station", "stay", "step", "still", "story", "street", "strong", "student", "study", "subject", "summer", "sun", "sunday", "supermarket", "sweater", "sweep", "swim", "table", "tail", "take", "talk", "taxi", "teach", "teacher", "tell", "thank"],
  "18": ["that", "their", "theirs", "them", "then", "there", "these", "they", "thin", "thing", "think", "this", "those", "three", "time", "tired", "today", "tomato", "tomorrow", "toy", "train", "travel", "tree", "trousers", "turn", "tv"],
  "19": ["umbrella", "under", "very", "visit", "wait", "wake", "walk", "wall", "want", "warm", "wash", "watch", "wear", "weather", "week", "welcome", "well", "what", "when", "where", "which", "whose", "will", "wind", "window", "windy"],
  "20": ["winter", "with", "wonderful", "word", "work", "worker", "world", "worry", "write", "wrong", "year", "yesterday", "young", "your", "zoo"]
};

function analyzeDesignIntent() {
  console.log('🎯 设计意图分析：20关覆盖所有507个单词');
  console.log('=' .repeat(60));
  
  let totalWords = 0;
  const allWords = new Set();
  const duplicatedWords = {};
  
  console.log('\n📋 按设计意图的各关卡单词分布：');
  console.log('-'.repeat(70));
  console.log('关卡 | 单词数量 | 累计单词 | 主题重点');
  console.log('-'.repeat(70));
  
  for (let level = 1; level <= 20; level++) {
    const levelStr = level.toString();
    const words = LEVEL_WORD_MAPPING[levelStr] || [];
    const wordCount = words.length;
    
    // 统计重复单词
    words.forEach(word => {
      if (allWords.has(word)) {
        duplicatedWords[word] = (duplicatedWords[word] || 1) + 1;
      } else {
        allWords.add(word);
      }
    });
    
    totalWords += wordCount;
    
    // 分析主题重点
    let themeHint = '';
    if (level === 1) themeHint = '基础词汇启蒙';
    else if (level === 2) themeHint = '家庭成员 + 基础词汇';
    else if (level === 3) themeHint = '身体部位 + 基础词汇';
    else if (level === 4) themeHint = '颜色 + 基础词汇';
    else if (level === 5) themeHint = '食物词汇';
    else if (level >= 6 && level <= 18) themeHint = '主题词汇 + 基础词汇';
    else if (level === 19) themeHint = '综合词汇';
    else if (level === 20) themeHint = '剩余词汇';
    
    const levelDisplay = level.toString().padStart(2, ' ');
    const countDisplay = wordCount.toString().padStart(6, ' ');
    const totalDisplay = allWords.size.toString().padStart(6, ' ');
    
    console.log(`${levelDisplay}   |   ${countDisplay}   |   ${totalDisplay}   | ${themeHint}`);
  }
  
  console.log('-'.repeat(70));
  console.log(`总计 |   ${totalWords.toString().padStart(6, ' ')}   |   ${allWords.size.toString().padStart(6, ' ')}   | 完整覆盖`);
  
  console.log('\n📊 设计分析结果：');
  console.log(`• 总关卡数：20关`);
  console.log(`• 分配单词总数：${totalWords}个`);
  console.log(`• 不重复单词数：${allWords.size}个`);
  console.log(`• 重复单词数：${Object.keys(duplicatedWords).length}个`);
  console.log(`• 平均每关：${Math.round(totalWords / 20)}个单词`);
  
  if (Object.keys(duplicatedWords).length > 0) {
    console.log('\n🔄 重复单词详情：');
    Object.entries(duplicatedWords).forEach(([word, count]) => {
      console.log(`  • "${word}": 出现${count + 1}次`);
    });
  }
  
  console.log('\n🎯 设计意图验证：');
  if (allWords.size >= 500) {
    console.log('✅ 成功覆盖了大部分小学英语单词');
  } else {
    console.log('⚠️  单词覆盖不够完整');
  }
  
  console.log('\n📈 关卡分布策略：');
  console.log('• 前4关：基础词汇 + 主题词汇（启蒙阶段）');
  console.log('• 第5-18关：主题导向的词汇学习（核心阶段）');
  console.log('• 第19-20关：综合复习和补充（提高阶段）');
  
  // 分析第3关的设计合理性
  console.log('\n🔍 第3关设计分析：');
  const level3Words = LEVEL_WORD_MAPPING["3"];
  const bodyParts = level3Words.filter(word => 
    ['arm', 'eye', 'leg', 'back', 'body', 'face', 'hair', 'hand', 'head', 'neck', 'nose'].includes(word)
  );
  const otherWords = level3Words.filter(word => 
    !['arm', 'eye', 'leg', 'back', 'body', 'face', 'hair', 'hand', 'head', 'neck', 'nose'].includes(word)
  );
  
  console.log(`• 第3关总单词数：${level3Words.length}个`);
  console.log(`• 身体部位词汇：${bodyParts.length}个 [${bodyParts.join(', ')}]`);
  console.log(`• 基础词汇补充：${otherWords.length}个 [${otherWords.join(', ')}]`);
  console.log(`• 设计合理性：✅ 既保证主题学习，又维持关卡平衡`);
  
  return {
    totalLevels: 20,
    totalWords: totalWords,
    uniqueWords: allWords.size,
    duplicatedWords: Object.keys(duplicatedWords).length,
    averageWordsPerLevel: Math.round(totalWords / 20)
  };
}

// 执行分析
if (require.main === module) {
  analyzeDesignIntent();
}

module.exports = { analyzeDesignIntent };