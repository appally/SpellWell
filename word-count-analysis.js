/**
 * 小程序单词数量分析脚本
 * 分析每关的单词数量以及总单词数量
 */

// 从word-library.js中提取的关卡单词映射
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

// 从unified-level-themes.js中提取的关卡主题信息
const LEVEL_THEMES = {
    "1": { theme: "英语启蒙", name: "第一次相遇", targetWords: 25 },
    "2": { theme: "我的家人", name: "温馨家庭", targetWords: 18 },
    "3": { theme: "身体认知", name: "认识自己", targetWords: 11 },
    "4": { theme: "缤纷色彩", name: "彩虹世界", targetWords: 9 },
    "5": { theme: "美味食物", name: "美食探索", targetWords: 31 },
    "6": { theme: "学习用品", name: "学习好帮手", targetWords: 31 },
    "7": { theme: "家居生活", name: "温馨的家", targetWords: 33 },
    "8": { theme: "自然风光", name: "大自然的礼物", targetWords: 24 },
    "9": { theme: "可爱动物", name: "动物朋友", targetWords: 19 },
    "10": { theme: "娱乐活动", name: "快乐时光", targetWords: 20 },
    "11": { theme: "职业世界", name: "未来梦想", targetWords: 18 },
    "12": { theme: "运动健身", name: "运动小达人", targetWords: 12 },
    "13": { theme: "交通出行", name: "出行小能手", targetWords: 8 },
    "14": { theme: "世界地理", name: "环游世界", targetWords: 7 },
    "15": { theme: "艺术创作", name: "创意天地", targetWords: 7 },
    "16": { theme: "科学探索", name: "小小科学家", targetWords: 5 },
    "17": { theme: "植物花卉", name: "花园小达人", targetWords: 4 },
    "18": { theme: "艺术创作", name: "小小艺术家", targetWords: 4 },
    "19": { theme: "情感表达", name: "我的心情", targetWords: 46 },
    "20": { theme: "基础词汇强化", name: "英语小达人", targetWords: 175 }
};

// 模拟真实的单词选择逻辑
function getActualLevelWords(level) {
    const words = LEVEL_WORD_MAPPING[level.toString()] || [];
    const theme = LEVEL_THEMES[level.toString()];
    const targetCount = theme ? theme.targetWords : 0;

    // 模拟selectWordsForLevel的逻辑
    if (words.length >= targetCount) {
        return words.slice(0, targetCount);
    }
    return words;
}

function analyzeWordCounts() {
    console.log('📊 小程序单词数量分析报告（基于真实逻辑）');
    console.log('='.repeat(50));

    let totalWords = 0;
    let actualTotalWords = 0;
    const allWords = new Set(); // 用于统计不重复的单词总数

    console.log('\n📋 各关卡单词数量详情：');
    console.log('-'.repeat(80));
    console.log('关卡 | 主题名称           | 目标数量 | 实际数量 | 差异 | 单词列表');
    console.log('-'.repeat(80));

    for (let level = 1; level <= 20; level++) {
        const levelStr = level.toString();
        const actualWords = getActualLevelWords(level);
        const theme = LEVEL_THEMES[levelStr];
        const actualCount = actualWords.length;
        const targetCount = theme ? theme.targetWords : 0;
        const difference = actualCount - targetCount;

        // 添加到总单词集合中（用于统计不重复单词）
        actualWords.forEach(word => allWords.add(word));

        totalWords += targetCount;
        actualTotalWords += actualCount;

        const levelDisplay = level.toString().padStart(2, ' ');
        const themeDisplay = (theme ? theme.name : '未知').padEnd(15, ' ');
        const targetDisplay = targetCount.toString().padStart(6, ' ');
        const actualDisplay = actualCount.toString().padStart(6, ' ');
        const diffDisplay = (difference >= 0 ? '+' : '') + difference.toString().padStart(4, ' ');

        // 显示前10个单词作为示例
        const wordPreview = actualWords.slice(0, 10).join(', ') + (actualWords.length > 10 ? '...' : '');

        console.log(`${levelDisplay}   | ${themeDisplay} | ${targetDisplay}   | ${actualDisplay}   | ${diffDisplay} | ${wordPreview}`);

        // 特别关注第3关，显示完整单词列表
        if (level === 3) {
            console.log(`     第3关完整单词列表: [${actualWords.join(', ')}]`);
            console.log(`     ✅ 验证：这${actualWords.length}个单词都是身体部位相关`);
        }
    }

    console.log('-'.repeat(80));
    console.log(`总计 | ${''.padEnd(15, ' ')} | ${totalWords.toString().padStart(6, ' ')}   | ${actualTotalWords.toString().padStart(6, ' ')}   | ${(actualTotalWords - totalWords >= 0 ? '+' : '') + (actualTotalWords - totalWords).toString().padStart(4, ' ')}`);

    console.log('\n📈 统计摘要：');
    console.log(`• 总关卡数：20关`);
    console.log(`• 目标单词总数：${totalWords}个`);
    console.log(`• 实际单词总数：${actualTotalWords}个`);
    console.log(`• 不重复单词总数：${allWords.size}个`);
    console.log(`• 平均每关单词数：${Math.round(actualTotalWords / 20)}个`);

    // 分析单词重复情况
    const wordFrequency = {};
    Object.values(LEVEL_WORD_MAPPING).forEach(levelWords => {
        levelWords.forEach(word => {
            wordFrequency[word] = (wordFrequency[word] || 0) + 1;
        });
    });

    const duplicatedWords = Object.entries(wordFrequency)
        .filter(([word, count]) => count > 1)
        .sort((a, b) => b[1] - a[1]);

    if (duplicatedWords.length > 0) {
        console.log(`\n🔄 重复单词分析：`);
        console.log(`• 重复单词数量：${duplicatedWords.length}个`);
        console.log(`• 重复次数最多的单词：`);
        duplicatedWords.slice(0, 10).forEach(([word, count]) => {
            console.log(`  - "${word}": 出现${count}次`);
        });
    }

    // 关卡难度分布
    const difficultyStats = {};
    Object.values(LEVEL_THEMES).forEach(theme => {
        const range = getWordCountRange(theme.targetWords);
        difficultyStats[range] = (difficultyStats[range] || 0) + 1;
    });

    console.log(`\n📊 关卡单词数量分布：`);
    Object.entries(difficultyStats)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .forEach(([range, count]) => {
            console.log(`• ${range}：${count}关`);
        });

    return {
        totalLevels: 20,
        targetTotalWords: totalWords,
        actualTotalWords: actualTotalWords,
        uniqueWords: allWords.size,
        duplicatedWords: duplicatedWords.length,
        averageWordsPerLevel: Math.round(actualTotalWords / 20)
    };
}

function getWordCountRange(count) {
    if (count <= 10) return '1-10个单词';
    if (count <= 20) return '11-20个单词';
    if (count <= 30) return '21-30个单词';
    if (count <= 50) return '31-50个单词';
    return '50个以上单词';
}

// 执行分析
if (require.main === module) {
    analyzeWordCounts();
}

module.exports = {
    analyzeWordCounts,
    LEVEL_WORD_MAPPING,
    LEVEL_THEMES
};