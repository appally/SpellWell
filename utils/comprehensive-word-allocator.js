/**
 * 全面单词分配器 - 确保所有单词都被分配且不重复
 * 解决当前覆盖率低和重复分配的问题
 */

const fs = require('fs');
const path = require('path');

// 导入现有模块
const wordLibrary = require('./word-library.js');
const unifiedThemes = require('./unified-level-themes.js');

class ComprehensiveWordAllocator {
    constructor() {
        this.allWords = wordLibrary.getAllPrimaryWords();
        this.usedWords = new Set();
        this.levelAllocations = new Map();
        this.categoryMapping = this.buildCategoryMapping();
        
        console.log(`🚀 全面单词分配器初始化`);
        console.log(`📊 总单词数: ${this.allWords.length}个`);
    }

    /**
     * 构建分类映射关系
     */
    buildCategoryMapping() {
        return {
            '日常生活': ['基础词汇', '家庭生活', '日常用品', '食物饮料'],
            '学习成长': ['学习用品', '数字概念', '时间概念', '基础词汇'],
            '自然世界': ['动物世界', '植物花卉', '自然现象', '颜色形状'],
            '身体健康': ['身体部位', '健康医疗', '运动健身', '情感表达'],
            '社交互动': ['情感表达', '社交礼仪', '人际关系', '基础词汇'],
            '交通出行': ['交通工具', '地理位置', '旅行探索', '基础词汇'],
            '娱乐活动': ['娱乐游戏', '音乐艺术', '节日庆典', '基础词汇'],
            '职业世界': ['职业工作', '商业贸易', '科技数码', '基础词汇'],
            '艺术创作': ['音乐艺术', '艺术创作', '文化传统', '基础词汇'],
            '科学探索': ['科技数码', '科学研究', '基础词汇', '数字概念'],
            '进阶词汇A': ['基础词汇', '学习用品', '日常用品', '动物世界'],
            '进阶词汇B': ['食物饮料', '身体部位', '颜色形状', '时间概念'],
            '进阶词汇C': ['情感表达', '家庭生活', '自然现象', '社交礼仪'],
            '高级词汇A': ['职业工作', '科技数码', '商业贸易', '健康医疗'],
            '高级词汇B': ['音乐艺术', '旅行探索', '运动健身', '节日庆典'],
            '专家词汇A': ['科学研究', '艺术创作', '文化传统', '人际关系']
        };
    }

    /**
     * 按分类分组单词
     */
    groupWordsByCategory() {
        const groups = {};
        
        this.allWords.forEach(wordObj => {
            const category = wordObj.category || '基础词汇';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(wordObj);
        });
        
        return groups;
    }

    /**
     * 获取指定难度范围的单词
     */
    getWordsByDifficulty(words, targetDifficulty) {
        const difficultyOrder = ['beginner', 'easy', 'medium', 'hard', 'advanced'];
        const targetIndex = difficultyOrder.indexOf(targetDifficulty);
        
        if (targetIndex === -1) return words;
        
        // 对于高难度关卡，允许更宽泛的难度范围
        const allowedDifficulties = targetIndex >= 3 ? 
            difficultyOrder.slice(1) : // hard/advanced 允许 easy 及以上
            difficultyOrder.slice(Math.max(0, targetIndex - 1), targetIndex + 2); // 其他允许 ±1 级
        
        return words.filter(word => 
            allowedDifficulties.includes(word.difficulty || 'medium')
        );
    }

    /**
     * 为单个关卡分配单词
     */
    allocateWordsForLevel(level) {
        try {
            const config = unifiedThemes.getUnifiedLevelConfig(level);
            const theme = config.theme;
            const targetCount = config.targetWords;
            const difficulty = config.difficulty;
            
            console.log(`\n🎯 分配第${level}关: ${theme} (${difficulty}, 目标${targetCount}个)`);
            
            // 获取可用单词（未被使用的）
            const availableWords = this.allWords.filter(word => 
                !this.usedWords.has(word.word)
            );
            
            if (availableWords.length === 0) {
                console.log(`⚠️  第${level}关: 无可用单词`);
                return [];
            }
            
            // 按优先级获取单词
            const prioritizedWords = this.getPrioritizedWords(
                availableWords, theme, difficulty
            );
            
            // 选择最佳单词
            const selectedWords = prioritizedWords.slice(0, targetCount);
            
            // 标记为已使用
            selectedWords.forEach(word => {
                this.usedWords.add(word.word);
            });
            
            console.log(`✅ 分配了${selectedWords.length}个单词: ${selectedWords.slice(0, 5).map(w => w.word).join(', ')}${selectedWords.length > 5 ? '...' : ''}`);
            
            return selectedWords;
            
        } catch (error) {
            console.log(`❌ 第${level}关配置错误: ${error.message}`);
            return [];
        }
    }

    /**
     * 获取优先级排序的单词
     */
    getPrioritizedWords(availableWords, theme, difficulty) {
        const relevantCategories = this.categoryMapping[theme] || ['基础词汇'];
        const difficultyFilteredWords = this.getWordsByDifficulty(availableWords, difficulty);
        
        // 按优先级分组
        const priorityGroups = {
            high: [], // 主题完全匹配
            medium: [], // 兼容分类
            low: [] // 其他单词
        };
        
        difficultyFilteredWords.forEach(word => {
            const category = word.category || '基础词汇';
            
            if (relevantCategories[0] === category) {
                priorityGroups.high.push(word);
            } else if (relevantCategories.includes(category)) {
                priorityGroups.medium.push(word);
            } else {
                priorityGroups.low.push(word);
            }
        });
        
        // 合并并返回
        return [
            ...this.shuffleArray(priorityGroups.high),
            ...this.shuffleArray(priorityGroups.medium),
            ...this.shuffleArray(priorityGroups.low)
        ];
    }

    /**
     * 打乱数组顺序
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * 为所有关卡分配单词
     */
    allocateAllLevels() {
        console.log(`\n🚀 开始全面单词分配...`);
        
        // 重置状态
        this.usedWords.clear();
        this.levelAllocations.clear();
        
        // 为每个关卡分配单词
        for (let level = 1; level <= 26; level++) {
            const words = this.allocateWordsForLevel(level);
            this.levelAllocations.set(level, words);
        }
        
        return this.levelAllocations;
    }

    /**
     * 生成新的单词映射
     */
    generateNewMapping() {
        const allocations = this.allocateAllLevels();
        const newMapping = {};
        
        allocations.forEach((words, level) => {
            if (words.length > 0) {
                newMapping[level] = words.map(word => word.word);
            }
        });
        
        return newMapping;
    }

    /**
     * 更新 word-library.js 文件
     */
    updateWordLibrary(newMapping) {
        const filePath = path.join(__dirname, 'word-library.js');
        let content = fs.readFileSync(filePath, 'utf8');
        
        // 查找 OPTIMIZED_LEVEL_MAPPING 的位置
        let mappingStart = content.indexOf('const OPTIMIZED_LEVEL_MAPPING = {');
        
        if (mappingStart === -1) {
            // 如果没找到，在文件末尾添加
            const newMappingStr = this.formatMapping(newMapping);
            const moduleExportsIndex = content.lastIndexOf('module.exports');
            
            if (moduleExportsIndex === -1) {
                // 如果没有module.exports，直接在末尾添加
                content += '\n\n' + newMappingStr + '\n';
            } else {
                // 在module.exports之前添加
                content = content.substring(0, moduleExportsIndex) + 
                         newMappingStr + '\n\n' + 
                         content.substring(moduleExportsIndex);
            }
        } else {
            // 找到了，替换现有的
            const mappingEnd = content.indexOf('};', mappingStart) + 2;
            const newMappingStr = this.formatMapping(newMapping);
            
            content = content.substring(0, mappingStart) + 
                     newMappingStr + 
                     content.substring(mappingEnd);
        }
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ 已更新 word-library.js`);
    }

    /**
     * 格式化映射对象为字符串
     */
    formatMapping(mapping) {
        let result = 'const OPTIMIZED_LEVEL_MAPPING = {\n';
        
        Object.keys(mapping).sort((a, b) => parseInt(a) - parseInt(b)).forEach(level => {
            const words = mapping[level];
            const wordsStr = words.map(word => `"${word}"`).join(', ');
            result += `    ${level}: [${wordsStr}],\n`;
        });
        
        result += '}';
        return result;
    }

    /**
     * 分析分配结果
     */
    analyzeResults() {
        const totalWords = this.allWords.length;
        const usedWords = this.usedWords.size;
        const coverageRate = (usedWords / totalWords * 100).toFixed(1);
        
        console.log(`\n📊 分配结果分析:`);
        console.log(`- 总单词数: ${totalWords}个`);
        console.log(`- 已分配: ${usedWords}个`);
        console.log(`- 未分配: ${totalWords - usedWords}个`);
        console.log(`- 覆盖率: ${coverageRate}%`);
        
        // 分析各关卡分配情况
        console.log(`\n📋 各关卡分配详情:`);
        this.levelAllocations.forEach((words, level) => {
            if (words.length > 0) {
                try {
                    const config = unifiedThemes.getUnifiedLevelConfig(level);
                    console.log(`第${level}关 ${config.theme}: ${words.length}个单词`);
                } catch (e) {
                    console.log(`第${level}关: ${words.length}个单词`);
                }
            }
        });
        
        return {
            totalWords,
            usedWords,
            coverageRate: parseFloat(coverageRate),
            unallocatedWords: totalWords - usedWords
        };
    }
}

// 主执行函数
function main() {
    try {
        const allocator = new ComprehensiveWordAllocator();
        
        // 生成新的分配方案
        const newMapping = allocator.generateNewMapping();
        
        // 更新文件
        allocator.updateWordLibrary(newMapping);
        
        // 分析结果
        const results = allocator.analyzeResults();
        
        console.log(`\n🎉 全面单词分配完成！`);
        console.log(`📈 覆盖率提升到: ${results.coverageRate}%`);
        
        if (results.unallocatedWords > 0) {
            console.log(`\n💡 建议: 还有${results.unallocatedWords}个单词未分配，可考虑:`);
            console.log(`1. 增加更多关卡`);
            console.log(`2. 增加现有关卡的单词数量`);
            console.log(`3. 创建专门的复习关卡`);
        }
        
    } catch (error) {
        console.error(`❌ 分配过程出错: ${error.message}`);
        console.error(error.stack);
    }
}

// 如果直接运行此文件
if (require.main === module) {
    main();
}

module.exports = ComprehensiveWordAllocator;