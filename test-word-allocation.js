// 测试新的单词分配系统
const fs = require('fs');
const path = require('path');

// 读取 word-library.js 文件内容
const wordLibraryPath = path.join(__dirname, 'utils', 'word-library.js');
const wordLibraryContent = fs.readFileSync(wordLibraryPath, 'utf8');

// 执行文件内容以获取函数和数据
eval(wordLibraryContent);

// 关卡配置
const levelConfigs = [
    { level: 1, theme: "基础字母与简单词汇", categories: ["基础词汇"], difficulty: "简单", targetWords: 26 },
    { level: 2, theme: "家庭成员", categories: ["家庭成员"], difficulty: "简单", targetWords: 26 },
    { level: 3, theme: "身体部位", categories: ["身体部位"], difficulty: "简单", targetWords: 26 },
    { level: 4, theme: "颜色世界", categories: ["颜色"], difficulty: "简单", targetWords: 26 },
    { level: 5, theme: "美味食物", categories: ["食物"], difficulty: "简单", targetWords: 26 }
];

console.log('🧪 测试新的单词分配系统\n');

// 测试前5个关卡
levelConfigs.forEach(config => {
    try {
        console.log(`\n📚 第 ${config.level} 关 - ${config.theme}`);
        console.log(`目标分类: ${config.categories.join(', ')}`);
        console.log(`目标难度: ${config.difficulty}`);
        console.log(`目标单词数: ${config.targetWords}`);
        
        // 调用新的单词选择函数
        const selectedWords = selectWordsForLevel(config.level, config);
        
        console.log(`\n实际获得单词数: ${selectedWords.length}`);
        console.log(`单词列表: ${selectedWords.join(', ')}`);
        
        // 分析单词特征
        const wordDetails = selectedWords.map(wordKey => {
            const word = PRIMARY_WORD_DATABASE[wordKey];
            return {
                word: wordKey,
                category: word ? word.category : '未知',
                difficulty: word ? word.difficulty : '未知'
            };
        });
        
        // 统计分类分布
        const categoryStats = {};
        wordDetails.forEach(detail => {
            categoryStats[detail.category] = (categoryStats[detail.category] || 0) + 1;
        });
        
        // 统计难度分布
        const difficultyStats = {};
        wordDetails.forEach(detail => {
            difficultyStats[detail.difficulty] = (difficultyStats[detail.difficulty] || 0) + 1;
        });
        
        console.log(`\n📊 分类分布:`);
        Object.entries(categoryStats).forEach(([category, count]) => {
            console.log(`  ${category}: ${count}`);
        });
        
        console.log(`\n📈 难度分布:`);
        Object.entries(difficultyStats).forEach(([difficulty, count]) => {
            console.log(`  ${difficulty}: ${count}`);
        });
        
        // 检查是否符合主题
        const themeRelevantCount = wordDetails.filter(detail => 
            config.categories.includes(detail.category)
        ).length;
        
        console.log(`\n✅ 主题相关单词: ${themeRelevantCount}/${selectedWords.length} (${((themeRelevantCount/selectedWords.length)*100).toFixed(1)}%)`);
        
        // 检查首字母分布
        const firstLetters = {};
        selectedWords.forEach(word => {
            const firstLetter = word.charAt(0).toLowerCase();
            firstLetters[firstLetter] = (firstLetters[firstLetter] || 0) + 1;
        });
        
        console.log(`\n🔤 首字母分布:`);
        Object.entries(firstLetters)
            .sort(([a], [b]) => a.localeCompare(b))
            .forEach(([letter, count]) => {
                console.log(`  ${letter}: ${count}`);
            });
        
        console.log('\n' + '='.repeat(60));
        
    } catch (error) {
        console.error(`❌ 第 ${config.level} 关测试失败:`, error.message);
    }
});

console.log('\n🎉 测试完成！');

// 检查是否还是按字母顺序分配
console.log('\n🔍 检查字母顺序分配问题:');
const level1Words = selectWordsForLevel(1, levelConfigs[0]);
const level2Words = selectWordsForLevel(2, levelConfigs[1]);
const level3Words = selectWordsForLevel(3, levelConfigs[2]);

console.log(`第1关前10个单词: ${level1Words.slice(0, 10).join(', ')}`);
console.log(`第2关前10个单词: ${level2Words.slice(0, 10).join(', ')}`);
console.log(`第3关前10个单词: ${level3Words.slice(0, 10).join(', ')}`);

// 检查第2关是否包含家庭成员相关单词
const familyWords = level2Words.filter(word => {
    const wordData = PRIMARY_WORD_DATABASE[word];
    return wordData && wordData.category === '家庭成员';
});

console.log(`\n👨‍👩‍👧‍👦 第2关家庭成员单词: ${familyWords.join(', ')} (${familyWords.length}个)`);

// 检查第3关是否包含身体部位相关单词
const bodyWords = level3Words.filter(word => {
    const wordData = PRIMARY_WORD_DATABASE[word];
    return wordData && wordData.category === '身体部位';
});

console.log(`🫀 第3关身体部位单词: ${bodyWords.join(', ')} (${bodyWords.length}个)`);

if (familyWords.length > 0 && bodyWords.length > 0) {
    console.log('\n✅ 新的主题分配系统工作正常！');
} else {
    console.log('\n❌ 仍然存在主题分配问题，需要进一步检查。');
}