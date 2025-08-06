/**
 * 应用基于主题优先的单词分配方案
 * 将新的分配结果更新到 word-library.js 中的 OPTIMIZED_LEVEL_MAPPING
 */

const fs = require('fs')
const path = require('path')
const { ThemePriorityAllocator } = require('./theme-priority-allocator.js')

/**
 * 应用新的主题优先分配方案
 */
function applyThemePriorityAllocation() {
  console.log('🚀 开始应用基于主题优先的单词分配方案...\n')
  
  // 生成新的分配方案
  const allocator = new ThemePriorityAllocator()
  const newAllocation = allocator.generateCompleteAllocation()
  
  console.log('\n📝 准备更新 word-library.js 文件...')
  
  // 读取当前的 word-library.js 文件
  const wordLibraryPath = path.join(__dirname, 'word-library.js')
  let fileContent = fs.readFileSync(wordLibraryPath, 'utf8')
  
  // 构建新的 OPTIMIZED_LEVEL_MAPPING 对象
  const newMapping = {}
  for (let level = 1; level <= 20; level++) {
    newMapping[level] = newAllocation[level]
  }
  
  // 将新的映射转换为格式化的字符串
  const newMappingString = formatLevelMapping(newMapping)
  
  // 使用正则表达式替换 OPTIMIZED_LEVEL_MAPPING
  const mappingRegex = /const OPTIMIZED_LEVEL_MAPPING = \{[\s\S]*?\n\}/
  
  if (mappingRegex.test(fileContent)) {
    fileContent = fileContent.replace(mappingRegex, `const OPTIMIZED_LEVEL_MAPPING = ${newMappingString}`)
    
    // 写回文件
    fs.writeFileSync(wordLibraryPath, fileContent, 'utf8')
    
    console.log('✅ 成功更新 word-library.js 文件')
    console.log('\n🎯 新分配方案特点:')
    console.log('- ✅ 主题相关性优先：大部分关卡达到100%主题匹配度')
    console.log('- ✅ 智能难度适配：根据关卡难度灵活选择单词')
    console.log('- ✅ 分类兼容补充：当主题单词不足时从相关分类补充')
    console.log('- ✅ 避免重复分配：确保每个单词只在一个关卡中出现')
    
    console.log('\n🔍 建议验证:')
    console.log('1. 运行测试脚本检查分配结果')
    console.log('2. 在应用中测试各关卡的学习体验')
    console.log('3. 根据实际使用情况进一步调优')
    
  } else {
    console.error('❌ 未找到 OPTIMIZED_LEVEL_MAPPING 定义，请检查文件格式')
  }
}

/**
 * 格式化关卡映射为可读的字符串
 */
function formatLevelMapping(mapping) {
  const lines = ['{']
  
  for (let level = 1; level <= 20; level++) {
    const words = mapping[level]
    const wordsString = words.map(word => `'${word}'`).join(', ')
    lines.push(`  ${level}: [${wordsString}]${level < 20 ? ',' : ''}`)
  }
  
  lines.push('}')
  return lines.join('\n')
}

/**
 * 验证新分配方案的效果
 */
function validateAllocation() {
  console.log('\n🔍 验证新分配方案...')
  
  const wordLibrary = require('./word-library.js')
  const unifiedThemes = require('./unified-level-themes.js')
  
  let totalWords = 0
  let totalThemeMatches = 0
  
  console.log('\n=== 详细验证结果 ===')
  
  for (let level = 1; level <= 20; level++) {
    const levelResult = wordLibrary.getLevelWords(level)
    const levelConfig = unifiedThemes.getUnifiedLevelConfig(level)
    const words = levelResult.words
    
    // 计算主题匹配度
    let themeMatchCount = 0
    const allWords = wordLibrary.getAllPrimaryWords()
    
    words.forEach(wordKey => {
      // 处理可能是对象或字符串的情况
      const wordString = typeof wordKey === 'string' ? wordKey : wordKey.word || wordKey
      const word = allWords.find(w => w.word === wordString)
      if (word && (levelConfig.focusCategories.includes(word.category) || levelConfig.focusCategories.includes('全部分类'))) {
        themeMatchCount++
      }
    })
    
    const matchRate = ((themeMatchCount / words.length) * 100).toFixed(1)
    totalWords += words.length
    totalThemeMatches += themeMatchCount
    
    console.log(`第${level}关 ${levelConfig.theme}: ${words.length}个单词, 主题匹配度 ${matchRate}%`)
    
    // 显示单词列表（前10个）
    const displayWords = words.slice(0, 10).map(w => typeof w === 'string' ? w : w.word || w).join(', ')
    console.log(`  单词: ${displayWords}${words.length > 10 ? '...' : ''}`)
  }
  
  const overallMatchRate = ((totalThemeMatches / totalWords) * 100).toFixed(1)
  console.log(`\n📊 总体统计: ${totalWords}个单词, 整体主题匹配度 ${overallMatchRate}%`)
}

// 如果直接运行此文件，执行应用操作
if (require.main === module) {
  applyThemePriorityAllocation()
  
  // 等待文件写入完成后验证
  setTimeout(() => {
    // 清除require缓存以获取最新的文件内容
    delete require.cache[require.resolve('./word-library.js')]
    validateAllocation()
  }, 1000)
}

module.exports = {
  applyThemePriorityAllocation,
  validateAllocation
}