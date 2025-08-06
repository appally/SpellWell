/**
 * 最终清理脚本 - 处理剩余的发音类tips
 */

const fs = require('fs');
const path = require('path');

// 文件路径
const WORD_LIBRARY_PATH = path.join(__dirname, 'word-library.js');

/**
 * 剩余需要替换的发音类tips映射
 */
const REMAINING_TIPS_MAP = {
  "注意/aɪ/双元音，读作'来恩'": "注意/aɪ/双元音，发音要饱满",
  "t不发音，读作'利森'，重音在第一音节": "t不发音，重音在第一音节",
  "注意/ʌ/音和/tʃ/音，ch读作'吃'": "注意/ʌ/音和/tʃ/音的发音",
  "Mister的缩写，读作'米斯特'": "Mister的缩写，用于称呼男性",
  "Missus的缩写，读作'米西斯'": "Missus的缩写，用于称呼已婚女性"
};

/**
 * 主处理函数
 */
function finalCleanup() {
  try {
    console.log('开始最终清理...');
    
    // 读取文件内容
    let content = fs.readFileSync(WORD_LIBRARY_PATH, 'utf8');
    
    let replacementCount = 0;
    
    // 替换剩余的发音类tips
    for (const [oldTip, newTip] of Object.entries(REMAINING_TIPS_MAP)) {
      const regex = new RegExp(oldTip.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, newTip);
        replacementCount += matches.length;
        console.log(`替换了 ${matches.length} 个: "${oldTip}" -> "${newTip}"`);
      }
    }
    
    // 写回文件
    fs.writeFileSync(WORD_LIBRARY_PATH, content, 'utf8');
    
    console.log(`\n最终清理完成！总共替换了 ${replacementCount} 个发音类tips`);
    
    // 验证是否还有剩余的发音类tips
    const remainingMatches = content.match(/读作'[^']*'/g);
    if (remainingMatches) {
      console.log(`\n警告：仍有 ${remainingMatches.length} 个发音类tips未处理:`);
      remainingMatches.forEach((match, index) => {
        console.log(`${index + 1}. ${match}`);
      });
    } else {
      console.log('\n✅ 所有发音类tips已成功清理！');
    }
    
  } catch (error) {
    console.error('处理过程中出现错误:', error);
  }
};

// 执行清理
finalCleanup();