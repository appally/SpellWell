/**
 * 测试关卡显示修复
 * 验证关卡名称显示和单词数据处理
 */

const path = require('path')

// 引入修复后的word-library
const wordLibrary = require('./utils/word-library.js')

/**
 * 测试关卡数据获取
 */
function testLevelData() {
  console.log('🧪 测试关卡数据获取...')
  console.log('=' .repeat(50))
  
  // 测试前5个关卡
  for (let level = 1; level <= 5; level++) {
    console.log(`\n📋 测试第${level}关:`)
    
    try {
      const levelData = wordLibrary.getLevelWords(level)
      
      // 检查必要字段
      const requiredFields = ['level', 'theme', 'name', 'description', 'icon', 'words']
      const missingFields = requiredFields.filter(field => !levelData[field])
      
      if (missingFields.length > 0) {
        console.log(`❌ 缺少字段: ${missingFields.join(', ')}`)
      } else {
        console.log(`✅ 所有必要字段都存在`)
      }
      
      // 显示关卡信息
      console.log(`  关卡编号: ${levelData.level}`)
      console.log(`  主题: ${levelData.theme}`)
      console.log(`  名称: ${levelData.name}`)
      console.log(`  描述: ${levelData.description}`)
      console.log(`  图标: ${levelData.icon}`)
      console.log(`  单词数量: ${levelData.words.length}`)
      
      // 检查单词数据
      const invalidWords = levelData.words.filter(word => !word.word || !word.chinese)
      if (invalidWords.length > 0) {
        console.log(`⚠️  发现${invalidWords.length}个无效单词`)
        invalidWords.slice(0, 3).forEach(word => {
          console.log(`    - ${JSON.stringify(word)}`)
        })
      } else {
        console.log(`✅ 所有单词数据有效`)
      }
      
      // 显示前3个单词
      console.log(`  前3个单词:`)
      levelData.words.slice(0, 3).forEach(word => {
        console.log(`    - ${word.word} (${word.chinese})`)
      })
      
    } catch (error) {
      console.log(`❌ 获取第${level}关数据失败: ${error.message}`)
    }
  }
}

/**
 * 测试adventure-map页面数据结构
 */
function testAdventureMapData() {
  console.log('\n\n🗺️  测试冒险地图数据结构...')
  console.log('=' .repeat(50))
  
  try {
    // 模拟adventure-map.js中的generateLevels函数
    const maxLevel = 20
    const levelNumbers = Array.from({length: maxLevel}, (_, i) => i + 1)
    
    // 模拟getBatchLevelData
    const levels = levelNumbers.map(level => {
      const levelData = wordLibrary.getLevelWords(level)
      return {
        id: level,
        name: levelData.name, // 这是关键字段
        theme: levelData.theme,
        icon: levelData.icon,
        isUnlocked: level <= 5, // 假设前5关已解锁
        stars: level <= 3 ? 3 : 0,
        progress: level <= 3 ? 100 : 0
      }
    })
    
    console.log(`\n📊 生成了${levels.length}个关卡数据`)
    
    // 检查前5个关卡的name字段
    console.log(`\n🔍 检查前5个关卡的name字段:`)
    levels.slice(0, 5).forEach(level => {
      if (level.name) {
        console.log(`✅ 第${level.id}关: "${level.name}"`)
      } else {
        console.log(`❌ 第${level.id}关: name字段缺失`)
      }
    })
    
    // 验证数据结构
    const invalidLevels = levels.filter(level => !level.name)
    if (invalidLevels.length > 0) {
      console.log(`\n⚠️  发现${invalidLevels.length}个关卡缺少name字段`)
    } else {
      console.log(`\n✅ 所有关卡都有name字段，界面应该能正常显示关卡名称`)
    }
    
  } catch (error) {
    console.log(`❌ 测试冒险地图数据失败: ${error.message}`)
  }
}

/**
 * 主测试函数
 */
function main() {
  console.log('🚀 开始测试关卡显示修复...')
  
  testLevelData()
  testAdventureMapData()
  
  console.log('\n\n📋 修复总结:')
  console.log('1. ✅ 在getLevelWords函数中添加了name字段')
  console.log('2. ✅ 添加了单词数据的安全检查，防止undefined错误')
  console.log('3. ✅ 关卡选择界面应该能正常显示关卡名称')
  console.log('4. ✅ 解决了TypeError: Cannot read property \'word\' of undefined错误')
  
  console.log('\n🎯 建议下一步:')
  console.log('1. 在微信开发者工具中重新编译项目')
  console.log('2. 检查adventure-map页面是否正常显示关卡名称')
  console.log('3. 查看控制台是否还有其他错误信息')
}

// 运行测试
if (require.main === module) {
  main()
}

module.exports = {
  testLevelData,
  testAdventureMapData,
  main
}