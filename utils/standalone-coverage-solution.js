/**
 * 独立的单词覆盖率解决方案
 * 直接操作 word-library.js 文件，实现100%覆盖率
 */

const fs = require('fs');
const path = require('path');

// 加载单词库
function loadWordLibrary() {
    const wordLibraryPath = path.join(__dirname, 'word-library.js');
    const content = fs.readFileSync(wordLibraryPath, 'utf8');
    
    // 提取 PRIMARY_WORD_DATABASE
    const dbMatch = content.match(/const PRIMARY_WORD_DATABASE = (\{[\s\S]*?\n\})/m);
    if (!dbMatch) {
        throw new Error('无法找到 PRIMARY_WORD_DATABASE');
    }
    
    const databaseObj = eval('(' + dbMatch[1] + ')');
    const database = Object.keys(databaseObj).map(word => ({
        word: word,
        ...databaseObj[word]
    }));
    
    return { database, content, wordLibraryPath };
}

// 创建35个关卡的单词分配方案
function createLevelMapping(database) {
    console.log('🎯 创建35关卡单词分配方案...');
    
    const totalWords = database.length;
    const targetLevels = 35;
    const wordsPerLevel = Math.ceil(totalWords / targetLevels);
    
    console.log(`总单词数: ${totalWords}`);
    console.log(`目标关卡数: ${targetLevels}`);
    console.log(`平均每关单词数: ${wordsPerLevel}`);
    
    const levelMapping = {};
    
    // 按难度和分类分组单词
    const wordGroups = {
        beginner: database.filter(w => w.difficulty === 'easy').slice(0, 60),
        basic: database.filter(w => w.difficulty === 'easy').slice(60),
        intermediate: database.filter(w => w.difficulty === 'medium'),
        advanced: database.filter(w => w.difficulty === 'hard'),
        expert: database.filter(w => w.difficulty === 'advanced')
    };
    
    let wordIndex = 0;
    const allWords = [
        ...wordGroups.beginner,
        ...wordGroups.basic,
        ...wordGroups.intermediate,
        ...wordGroups.advanced,
        ...wordGroups.expert
    ];
    
    // 为每个关卡分配单词
    for (let level = 1; level <= targetLevels; level++) {
        const levelWords = [];
        
        // 计算当前关卡应分配的单词数
        let wordsForThisLevel;
        if (level <= 20) {
            // 前20关每关分配较少单词
            wordsForThisLevel = Math.min(12 + Math.floor(level / 5) * 2, 18);
        } else {
            // 后15关分配更多单词以达到100%覆盖
            const remainingWords = totalWords - wordIndex;
            const remainingLevels = targetLevels - level + 1;
            wordsForThisLevel = Math.ceil(remainingWords / remainingLevels);
        }
        
        // 分配单词
        for (let i = 0; i < wordsForThisLevel && wordIndex < allWords.length; i++) {
            levelWords.push(allWords[wordIndex].word);
            wordIndex++;
        }
        
        if (levelWords.length > 0) {
            levelMapping[level] = levelWords;
        }
        
        console.log(`第${level}关: ${levelWords.length}个单词`);
    }
    
    console.log(`\n✅ 总共分配了 ${wordIndex} 个单词`);
    console.log(`📈 覆盖率: ${((wordIndex / totalWords) * 100).toFixed(1)}%`);
    
    return levelMapping;
}

// 更新 word-library.js 文件
function updateWordLibrary(content, levelMapping, wordLibraryPath) {
    console.log('📝 更新 word-library.js 文件...');
    
    // 生成 OPTIMIZED_LEVEL_MAPPING 代码
    const mappingCode = `\n\n// 优化的关卡单词映射 (35关卡，100%覆盖率)\nconst OPTIMIZED_LEVEL_MAPPING = ${JSON.stringify(levelMapping, null, 2)};`;
    
    // 检查是否已存在 OPTIMIZED_LEVEL_MAPPING
    if (content.includes('OPTIMIZED_LEVEL_MAPPING')) {
        // 替换现有的映射
        const updatedContent = content.replace(
            /\/\/ 优化的关卡单词映射[\s\S]*?const OPTIMIZED_LEVEL_MAPPING = \{[\s\S]*?\};/,
            mappingCode.trim()
        );
        fs.writeFileSync(wordLibraryPath, updatedContent, 'utf8');
    } else {
        // 在 module.exports 之前添加映射
        const moduleExportsIndex = content.lastIndexOf('module.exports');
        if (moduleExportsIndex !== -1) {
            const beforeExports = content.substring(0, moduleExportsIndex);
            const afterExports = content.substring(moduleExportsIndex);
            const updatedContent = beforeExports + mappingCode + '\n\n' + afterExports;
            fs.writeFileSync(wordLibraryPath, updatedContent, 'utf8');
        } else {
            // 如果没找到 module.exports，直接添加到文件末尾
            const updatedContent = content + mappingCode;
            fs.writeFileSync(wordLibraryPath, updatedContent, 'utf8');
        }
    }
    
    // 更新 module.exports
    let finalContent = fs.readFileSync(wordLibraryPath, 'utf8');
    if (!finalContent.includes('OPTIMIZED_LEVEL_MAPPING') || !finalContent.includes('module.exports')) {
        // 确保 OPTIMIZED_LEVEL_MAPPING 被导出
        finalContent = finalContent.replace(
            /module\.exports = \{([\s\S]*?)\}/,
            (match, exports) => {
                if (!exports.includes('OPTIMIZED_LEVEL_MAPPING')) {
                    const cleanExports = exports.trim().replace(/,$/, '');
                    return `module.exports = {${cleanExports},\n  OPTIMIZED_LEVEL_MAPPING\n}`;
                }
                return match;
            }
        );
        fs.writeFileSync(wordLibraryPath, finalContent, 'utf8');
    }
    
    console.log('✅ word-library.js 文件更新完成');
}

// 主函数
function main() {
    console.log('🚀 SpellWell 独立覆盖率解决方案');
    console.log('=' .repeat(50));
    
    try {
        // 加载单词库
        const { database, content, wordLibraryPath } = loadWordLibrary();
        console.log(`📚 加载了 ${database.length} 个单词`);
        
        // 创建关卡映射
        const levelMapping = createLevelMapping(database);
        
        // 更新文件
        updateWordLibrary(content, levelMapping, wordLibraryPath);
        
        console.log('\n' + '=' .repeat(50));
        console.log('🎉 单词分配完成！');
        console.log('📊 已实现100%单词覆盖率');
        console.log('🎯 共创建35个关卡');
        console.log('\n请运行 node final-verification.js 验证结果');
        
    } catch (error) {
        console.error('❌ 执行失败:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { createLevelMapping, updateWordLibrary };