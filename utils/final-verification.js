/**
 * 最终单词覆盖率验证脚本
 * 验证当前单词库的覆盖率情况
 */

const fs = require('fs');
const path = require('path');

// 读取单词库文件
function loadWordLibrary() {
    try {
        const wordLibraryPath = path.join(__dirname, 'word-library.js');
        const content = fs.readFileSync(wordLibraryPath, 'utf8');
        
        // 提取 PRIMARY_WORD_DATABASE (对象格式)
        const dbMatch = content.match(/const PRIMARY_WORD_DATABASE = (\{[\s\S]*?\n\})/m);
        if (!dbMatch) {
            throw new Error('无法找到 PRIMARY_WORD_DATABASE');
        }
        
        const databaseObj = eval('(' + dbMatch[1] + ')');
        const database = Object.keys(databaseObj).map(word => ({
            word: word,
            ...databaseObj[word]
        }));
        
        // 提取 OPTIMIZED_LEVEL_MAPPING
        const mappingMatch = content.match(/const OPTIMIZED_LEVEL_MAPPING = (\{[\s\S]*?\});/);
        let mapping = {};
        if (mappingMatch) {
            mapping = eval('(' + mappingMatch[1] + ')');
        }
        
        return { database, mapping };
    } catch (error) {
        console.error('❌ 加载单词库失败:', error.message);
        process.exit(1);
    }
}

// 分析覆盖率
function analyzeCoverage() {
    console.log('🔍 开始分析单词库覆盖率...');
    
    const { database, mapping } = loadWordLibrary();
    
    console.log(`📚 总单词数: ${database.length}`);
    
    // 统计已分配的单词
    const assignedWords = new Set();
    let totalAssignments = 0;
    
    Object.keys(mapping).forEach(level => {
        const words = mapping[level] || [];
        totalAssignments += words.length;
        words.forEach(word => assignedWords.add(word));
    });
    
    const assignedCount = assignedWords.size;
    const unassignedCount = database.length - assignedCount;
    const coverageRate = ((assignedCount / database.length) * 100).toFixed(1);
    
    console.log(`\n📊 覆盖率统计:`);
    console.log(`✅ 已分配单词: ${assignedCount}`);
    console.log(`❌ 未分配单词: ${unassignedCount}`);
    console.log(`📈 覆盖率: ${coverageRate}%`);
    console.log(`🔢 总分配次数: ${totalAssignments}`);
    
    // 显示关卡分配情况
    console.log(`\n🎯 关卡分配详情:`);
    const levels = Object.keys(mapping).map(Number).sort((a, b) => a - b);
    levels.forEach(level => {
        const words = mapping[level] || [];
        console.log(`第${level}关: ${words.length}个单词`);
    });
    
    // 分析未分配单词
    if (unassignedCount > 0) {
        console.log(`\n🔍 未分配单词分析:`);
        const unassignedWords = database.filter(wordObj => 
            !assignedWords.has(wordObj.word)
        );
        
        // 按分类统计
        const categoryStats = {};
        const difficultyStats = {};
        
        unassignedWords.forEach(wordObj => {
            const category = wordObj.category || '未分类';
            const difficulty = wordObj.difficulty || '未知';
            
            categoryStats[category] = (categoryStats[category] || 0) + 1;
            difficultyStats[difficulty] = (difficultyStats[difficulty] || 0) + 1;
        });
        
        console.log('按分类统计:');
        Object.entries(categoryStats)
            .sort(([,a], [,b]) => b - a)
            .forEach(([category, count]) => {
                console.log(`  ${category}: ${count}个`);
            });
        
        console.log('按难度统计:');
        Object.entries(difficultyStats)
            .sort(([,a], [,b]) => b - a)
            .forEach(([difficulty, count]) => {
                console.log(`  ${difficulty}: ${count}个`);
            });
    }
    
    return {
        totalWords: database.length,
        assignedWords: assignedCount,
        unassignedWords: unassignedCount,
        coverageRate: parseFloat(coverageRate),
        totalAssignments,
        levelCount: levels.length
    };
}

// 主函数
function main() {
    console.log('🎯 SpellWell 单词库最终覆盖率验证');
    console.log('=' .repeat(50));
    
    const stats = analyzeCoverage();
    
    console.log('\n' + '=' .repeat(50));
    if (stats.coverageRate >= 90) {
        console.log('🎉 恭喜！已达到90%以上的覆盖率目标！');
    } else if (stats.coverageRate >= 75) {
        console.log('👍 覆盖率良好，接近目标！');
    } else {
        console.log('⚠️  覆盖率仍需提升');
    }
    
    console.log(`最终覆盖率: ${stats.coverageRate}%`);
    console.log(`关卡数量: ${stats.levelCount}个`);
}

if (require.main === module) {
    main();
}

module.exports = { analyzeCoverage };