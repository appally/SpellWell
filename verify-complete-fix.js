/**
 * 完整验证修复效果
 */

const wordLibrary = require('./utils/word-library.js');

function verifyFix() {
  console.log('🔧 验证修复效果：第3关单词数量');
  console.log('=' .repeat(50));
  
  try {
    // 测试第3关
    const level3Data = wordLibrary.getLevelWords(3);
    
    console.log('\n📊 第3关实际数据：');
    console.log(`• 单词数量: ${level3Data.words ? level3Data.words.length : 0}个`);
    
    if (level3Data.words && level3Data.words.length > 0) {
      const wordList = level3Data.words.map(w => w.word);
      console.log(`• 单词列表: [${wordList.slice(0, 10).join(', ')}${wordList.length > 10 ? '...' : ''}]`);
      
      // 分析身体部位单词
      const bodyParts = ["arm", "eye", "leg", "back", "body", "face", "hair", "hand", "head", "neck", "nose"];
      const bodyPartWords = wordList.filter(word => bodyParts.includes(word));
      const otherWords = wordList.filter(word => !bodyParts.includes(word));
      
      console.log(`\n🎯 内容分析:`);
      console.log(`• 身体部位单词: ${bodyPartWords.length}个 [${bodyPartWords.join(', ')}]`);
      console.log(`• 其他单词: ${otherWords.length}个 [${otherWords.slice(0, 5).join(', ')}${otherWords.length > 5 ? '...' : ''}]`);
      
      console.log(`\n✅ 修复验证:`);
      console.log(`• 是否达到26个单词? ${wordList.length === 26 ? '✅ 是' : '❌ 否 (' + wordList.length + '个)'}`);
      console.log(`• 是否包含11个身体部位单词? ${bodyPartWords.length === 11 ? '✅ 是' : '❌ 否 (' + bodyPartWords.length + '个)'}`);
      console.log(`• 是否符合设计意图? ${wordList.length === 26 && bodyPartWords.length === 11 ? '✅ 是' : '❌ 否'}`);
      
      if (wordList.length === 26) {
        console.log('\n🎉 修复成功！第3关现在返回完整的26个单词');
      } else {
        console.log('\n⚠️  修复可能需要重启应用或清除缓存');
      }
    } else {
      console.log('❌ 无法获取第3关数据');
    }
    
    // 测试其他几关验证整体效果
    console.log('\n📋 其他关卡验证：');
    for (let level of [1, 2, 4, 5]) {
      const levelData = wordLibrary.getLevelWords(level);
      const wordCount = levelData.words ? levelData.words.length : 0;
      console.log(`• 第${level}关: ${wordCount}个单词`);
    }
    
  } catch (error) {
    console.error('❌ 验证过程中出现错误:', error.message);
    console.log('\n💡 可能需要重启应用以使修改生效');
  }
}

// 执行验证
verifyFix();