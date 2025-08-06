/**
 * 最终全覆盖解决方案
 * 目标：将单词库覆盖率从46.9%提升到90%以上
 * 策略：扩展关卡数量、优化单词分配、确保无重复
 */

const fs = require('fs');
const path = require('path');
const wordLibrary = require('./word-library.js');
const unifiedThemes = require('./unified-level-themes.js');

class FinalCoverageSolution {
    constructor() {
        this.allWords = wordLibrary.getAllPrimaryWords();
        this.usedWords = new Set();
        this.levelAllocations = new Map();
        
        console.log(`🚀 最终全覆盖解决方案启动`);
        console.log(`📊 总单词数: ${this.allWords.length}个`);
        console.log(`🎯 目标覆盖率: 90%以上`);
    }

    /**
     * 生成扩展的关卡配置
     */
    generateExtendedLevelConfig() {
        const extendedConfig = {
            // 原有关卡 1-20
            1: { theme: '英语启蒙', difficulty: 'beginner', targetWords: 12 },
            2: { theme: '日常问候', difficulty: 'beginner', targetWords: 12 },
            3: { theme: '我的家人', difficulty: 'easy', targetWords: 15 },
            4: { theme: '可爱动物', difficulty: 'easy', targetWords: 15 },
            5: { theme: '美味食物', difficulty: 'easy', targetWords: 15 },
            6: { theme: '身体部位', difficulty: 'easy', targetWords: 12 },
            7: { theme: '缤纷色彩', difficulty: 'easy', targetWords: 12 },
            8: { theme: '学习用品', difficulty: 'medium', targetWords: 18 },
            9: { theme: '自然风光', difficulty: 'medium', targetWords: 18 },
            10: { theme: '交通出行', difficulty: 'medium', targetWords: 15 },
            11: { theme: '运动健身', difficulty: 'medium', targetWords: 15 },
            12: { theme: '家居生活', difficulty: 'medium', targetWords: 20 },
            13: { theme: '情感表达', difficulty: 'medium', targetWords: 20 },
            14: { theme: '娱乐活动', difficulty: 'hard', targetWords: 20 },
            15: { theme: '职业世界', difficulty: 'hard', targetWords: 20 },
            16: { theme: '科学探索', difficulty: 'hard', targetWords: 18 },
            17: { theme: '艺术创作', difficulty: 'hard', targetWords: 15 },
            18: { theme: '世界地理', difficulty: 'expert', targetWords: 18 },
            19: { theme: '综合复习', difficulty: 'expert', targetWords: 25 },
            20: { theme: '终极挑战', difficulty: 'expert', targetWords: 30 },
            
            // 新增关卡 21-35
            21: { theme: '基础词汇强化A', difficulty: 'easy', targetWords: 25 },
            22: { theme: '基础词汇强化B', difficulty: 'easy', targetWords: 25 },
            23: { theme: '基础词汇强化C', difficulty: 'medium', targetWords: 25 },
            24: { theme: '情感表达进阶', difficulty: 'medium', targetWords: 20 },
            25: { theme: '家庭生活扩展', difficulty: 'medium', targetWords: 20 },
            26: { theme: '学习用品大全', difficulty: 'medium', targetWords: 18 },
            27: { theme: '美食世界探索', difficulty: 'medium', targetWords: 18 },
            28: { theme: '自然景观漫游', difficulty: 'medium', targetWords: 18 },
            29: { theme: '动物王国冒险', difficulty: 'medium', targetWords: 15 },
            30: { theme: '职业体验馆', difficulty: 'hard', targetWords: 15 },
            31: { theme: '娱乐活动集锦', difficulty: 'hard', targetWords: 12 },
            32: { theme: '颜色艺术坊', difficulty: 'hard', targetWords: 10 },
            33: { theme: '地理知识库', difficulty: 'hard', targetWords: 8 },
            34: { theme: '科学实验室', difficulty: 'advanced', targetWords: 6 },
            35: { theme: '高级综合', difficulty: 'advanced', targetWords: 10 }
        };
        
        return extendedConfig;
    }

    /**
     * 构建分类映射关系
     */
    buildCategoryMapping() {
        return {
            '英语启蒙': ['基础词汇'],
            '日常问候': ['基础词汇'],
            '我的家人': ['家庭成员', '基础词汇'],
            '可爱动物': ['动物世界', '基础词汇'],
            '美味食物': ['美食天地', '基础词汇'],
            '身体部位': ['身体部位', '基础词汇'],
            '缤纷色彩': ['颜色彩虹', '基础词汇'],
            '学习用品': ['学习用品', '基础词汇'],
            '自然风光': ['自然景观', '植物花卉', '基础词汇'],
            '交通出行': ['交通工具', '基础词汇'],
            '运动健身': ['运动健身', '基础词汇'],
            '家居生活': ['家庭用品', '基础词汇'],
            '情感表达': ['情感表达', '基础词汇'],
            '娱乐活动': ['娱乐活动', '音乐艺术', '基础词汇'],
            '职业世界': ['职业体验', '基础词汇'],
            '科学探索': ['科学探索', '基础词汇'],
            '艺术创作': ['艺术创作', '音乐艺术', '基础词汇'],
            '世界地理': ['世界地理', '基础词汇'],
            '综合复习': ['基础词汇'],
            '终极挑战': ['基础词汇'],
            '基础词汇强化A': ['基础词汇'],
            '基础词汇强化B': ['基础词汇'],
            '基础词汇强化C': ['基础词汇'],
            '情感表达进阶': ['情感表达'],
            '家庭生活扩展': ['家庭用品', '家庭成员'],
            '学习用品大全': ['学习用品'],
            '美食世界探索': ['美食天地'],
            '自然景观漫游': ['自然景观', '植物花卉'],
            '动物王国冒险': ['动物世界'],
            '职业体验馆': ['职业体验'],
            '娱乐活动集锦': ['娱乐活动'],
            '颜色艺术坊': ['颜色彩虹'],
            '地理知识库': ['世界地理'],
            '科学实验室': ['科学探索'],
            '高级综合': ['基础词汇']
        };
    }

    /**
     * 按难度过滤单词
     */
    filterWordsByDifficulty(words, targetDifficulty) {
        const difficultyOrder = ['beginner', 'easy', 'medium', 'hard', 'advanced', 'expert'];
        const targetIndex = difficultyOrder.indexOf(targetDifficulty);
        
        if (targetIndex === -1) return words;
        
        // 允许的难度范围
        let allowedDifficulties;
        if (targetIndex <= 1) { // beginner, easy
            allowedDifficulties = difficultyOrder.slice(0, targetIndex + 2);
        } else if (targetIndex >= 4) { // advanced, expert
            allowedDifficulties = difficultyOrder.slice(1); // easy及以上
        } else { // medium, hard
            allowedDifficulties = difficultyOrder.slice(targetIndex - 1, targetIndex + 2);
        }
        
        return words.filter(word => 
            allowedDifficulties.includes(word.difficulty || 'medium')
        );
    }

    /**
     * 为单个关卡分配单词
     */
    allocateWordsForLevel(level, config) {
        const { theme, difficulty, targetWords } = config;
        
        console.log(`\n🎯 分配第${level}关: ${theme} (${difficulty}, 目标${targetWords}个)`);
        
        // 获取可用单词
        const availableWords = this.allWords.filter(word => 
            !this.usedWords.has(word.word)
        );
        
        if (availableWords.length === 0) {
            console.log(`⚠️  第${level}关: 无可用单词`);
            return [];
        }
        
        // 按分类和难度筛选
        const categoryMapping = this.buildCategoryMapping();
        const relevantCategories = categoryMapping[theme] || ['基础词汇'];
        const difficultyFilteredWords = this.filterWordsByDifficulty(availableWords, difficulty);
        
        // 按优先级分组
        const priorityGroups = {
            high: [], // 主分类匹配
            medium: [], // 相关分类匹配
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
        
        // 合并并选择
        const candidateWords = [
            ...this.shuffleArray(priorityGroups.high),
            ...this.shuffleArray(priorityGroups.medium),
            ...this.shuffleArray(priorityGroups.low)
        ];
        
        const selectedWords = candidateWords.slice(0, targetWords);
        
        // 标记为已使用
        selectedWords.forEach(word => {
            this.usedWords.add(word.word);
        });
        
        console.log(`✅ 分配了${selectedWords.length}个单词: ${selectedWords.slice(0, 5).map(w => w.word).join(', ')}${selectedWords.length > 5 ? '...' : ''}`);
        
        return selectedWords;
    }

    /**
     * 打乱数组
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
     * 执行全面分配
     */
    executeFullAllocation() {
        console.log(`\n🚀 开始全面单词分配...`);
        
        const extendedConfig = this.generateExtendedLevelConfig();
        
        // 重置状态
        this.usedWords.clear();
        this.levelAllocations.clear();
        
        // 为每个关卡分配单词
        Object.entries(extendedConfig).forEach(([level, config]) => {
            const words = this.allocateWordsForLevel(parseInt(level), config);
            this.levelAllocations.set(parseInt(level), words);
        });
        
        return this.levelAllocations;
    }

    /**
     * 生成新的单词映射
     */
    generateNewMapping() {
        const allocations = this.executeFullAllocation();
        const newMapping = {};
        
        allocations.forEach((words, level) => {
            if (words.length > 0) {
                newMapping[level] = words.map(word => word.word);
            }
        });
        
        return newMapping;
    }

    /**
     * 更新主题配置文件
     */
    updateUnifiedThemes() {
        const extendedConfig = this.generateExtendedLevelConfig();
        const filePath = path.join(__dirname, 'unified-level-themes.js');
        let content = fs.readFileSync(filePath, 'utf8');
        
        // 生成新的主题配置
        let newThemesStr = 'const UNIFIED_LEVEL_THEMES = {\n';
        Object.entries(extendedConfig).forEach(([level, config]) => {
            newThemesStr += `    ${level}: {\n`;
            newThemesStr += `        theme: "${config.theme}",\n`;
            newThemesStr += `        difficulty: "${config.difficulty}",\n`;
            newThemesStr += `        targetWords: ${config.targetWords}\n`;
            newThemesStr += `    },\n`;
        });
        newThemesStr += '};';
        
        // 替换主题配置
        const themesStart = content.indexOf('const UNIFIED_LEVEL_THEMES = {');
        if (themesStart !== -1) {
            const themesEnd = content.indexOf('};', themesStart) + 2;
            content = content.substring(0, themesStart) + newThemesStr + content.substring(themesEnd);
        } else {
            // 如果没找到，在文件开头添加
            content = newThemesStr + '\n\n' + content;
        }
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ 已更新 unified-level-themes.js (35个关卡)`);
    }

    /**
     * 更新单词库文件
     */
    updateWordLibrary(newMapping) {
        const filePath = path.join(__dirname, 'word-library.js');
        let content = fs.readFileSync(filePath, 'utf8');
        
        // 生成新的映射字符串
        let newMappingStr = 'const OPTIMIZED_LEVEL_MAPPING = {\n';
        Object.keys(newMapping).sort((a, b) => parseInt(a) - parseInt(b)).forEach(level => {
            const words = newMapping[level];
            const wordsStr = words.map(word => `"${word}"`).join(', ');
            newMappingStr += `    ${level}: [${wordsStr}],\n`;
        });
        newMappingStr += '};';
        
        // 查找并替换映射
        let mappingStart = content.indexOf('const OPTIMIZED_LEVEL_MAPPING = {');
        
        if (mappingStart === -1) {
            // 如果没找到，在module.exports之前添加
            const moduleExportsIndex = content.lastIndexOf('module.exports');
            if (moduleExportsIndex !== -1) {
                content = content.substring(0, moduleExportsIndex) + 
                         newMappingStr + '\n\n' + 
                         content.substring(moduleExportsIndex);
            } else {
                content += '\n\n' + newMappingStr + '\n';
            }
        } else {
            // 找到了，替换现有的
            const mappingEnd = content.indexOf('};', mappingStart) + 2;
            content = content.substring(0, mappingStart) + 
                     newMappingStr + 
                     content.substring(mappingEnd);
        }
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ 已更新 word-library.js (35个关卡)`);
    }

    /**
     * 分析最终结果
     */
    analyzeResults() {
        const totalWords = this.allWords.length;
        const usedWords = this.usedWords.size;
        const coverageRate = (usedWords / totalWords * 100).toFixed(1);
        const improvement = (coverageRate - 46.9).toFixed(1);
        
        console.log(`\n📊 最终分配结果:`);
        console.log(`- 总单词数: ${totalWords}个`);
        console.log(`- 已分配: ${usedWords}个`);
        console.log(`- 未分配: ${totalWords - usedWords}个`);
        console.log(`- 覆盖率: ${coverageRate}%`);
        console.log(`- 提升幅度: +${improvement}%`);
        
        // 分析各关卡分配情况
        console.log(`\n📋 关卡分配摘要:`);
        let totalAllocated = 0;
        this.levelAllocations.forEach((words, level) => {
            if (words.length > 0) {
                totalAllocated += words.length;
                if (level <= 5 || level % 5 === 0 || level > 30) {
                    console.log(`第${level}关: ${words.length}个单词`);
                }
            }
        });
        console.log(`...`);
        console.log(`总计: ${this.levelAllocations.size}个关卡，${totalAllocated}个单词分配`);
        
        return {
            totalWords,
            usedWords,
            coverageRate: parseFloat(coverageRate),
            improvement: parseFloat(improvement),
            totalLevels: this.levelAllocations.size
        };
    }
}

// 主执行函数
function main() {
    try {
        const solution = new FinalCoverageSolution();
        
        // 更新主题配置
        solution.updateUnifiedThemes();
        
        // 生成新的分配方案
        const newMapping = solution.generateNewMapping();
        
        // 更新单词库
        solution.updateWordLibrary(newMapping);
        
        // 分析结果
        const results = solution.analyzeResults();
        
        console.log(`\n🎉 最终全覆盖解决方案完成！`);
        console.log(`📈 覆盖率达到: ${results.coverageRate}%`);
        console.log(`🚀 关卡数量: ${results.totalLevels}个`);
        
        if (results.coverageRate >= 90) {
            console.log(`\n🏆 恭喜！已达成90%覆盖率目标！`);
        } else {
            console.log(`\n💡 还需努力，距离90%目标还差${(90 - results.coverageRate).toFixed(1)}%`);
        }
        
        console.log(`\n📋 后续建议:`);
        console.log(`1. 测试新关卡的学习体验`);
        console.log(`2. 根据用户反馈调整难度`);
        console.log(`3. 监控学习数据，持续优化`);
        
    } catch (error) {
        console.error(`❌ 执行过程出错: ${error.message}`);
        console.error(error.stack);
    }
}

// 如果直接运行此文件
if (require.main === module) {
    main();
}

module.exports = FinalCoverageSolution;