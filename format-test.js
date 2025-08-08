/**
 * 格式测试脚本
 * 验证AI内容格式化是否正常工作
 */

// 模拟格式化函数
function formatAIExplanation(text) {
  if (!text) return '暂无讲解内容'
  
  // 清理和格式化文本
  let formatted = text
    .replace(/\*\*(.*?)\*\*/g, '$1') // 移除markdown粗体标记
    .replace(/\*(.*?)\*/g, '$1')     // 移除markdown斜体标记
    .replace(/【/g, '【')            // 统一中文括号
    .replace(/】/g, '】')
    .trim()
  
  // 确保段落间有适当的间距
  formatted = formatted
    .replace(/\n\n+/g, '\n\n')      // 规范化段落间距
    .replace(/([📖🏠🎯🧩✨💡])/g, '\n\n$1') // 在emoji标题前添加换行
    .replace(/^[\n\s]+/, '')        // 移除开头的空白
    .replace(/[\n\s]+$/, '')        // 移除结尾的空白
  
  // 优化例句格式
  formatted = formatted.replace(
    /•\s*([^-\n]+)\s*-\s*([^\n]+)/g, 
    '• $1\n  $2'
  )
  
  // 确保内容结构清晰
  const sections = formatted.split(/\n\n+/)
  const cleanSections = sections
    .filter(section => section.trim().length > 0)
    .map(section => section.trim())
  
  return cleanSections.join('\n\n')
}

// 测试数据
const testContent = `📖【核心含义】Cat是猫咪，家里常见的宠物动物🏠【实用例句】• I have a cat. - 我有一只猫咪。• The cat is sleeping. - 猫咪在睡觉。🎯【记忆方法】做猫爪手势来记忆✨【词汇扩展】cats（复数）`

console.log('🧪 格式化测试')
console.log('=' .repeat(40))

console.log('📄 原始内容:')
console.log(testContent)

console.log('\n✨ 格式化后:')
const formatted = formatAIExplanation(testContent)
console.log(formatted)

console.log('\n📊 格式化分析:')
console.log(`- 原始长度: ${testContent.length}字符`)
console.log(`- 格式化后长度: ${formatted.length}字符`)
console.log(`- 包含换行: ${formatted.includes('\n') ? '✅' : '❌'}`)
console.log(`- 结构清晰: ${/📖.*🏠.*🎯.*✨/.test(formatted) ? '✅' : '❌'}`)

// 测试预设内容格式
const presetContent = {
  'cat': `📖【核心含义】
Cat是猫咪，家里常见的宠物动物，会"喵喵"叫

🏠【实用例句】
• I have a cat. 
  我有一只猫咪。
• The cat is sleeping. 
  猫咪在睡觉。
• My cat likes fish. 
  我的猫咪喜欢吃鱼。

🎯【记忆方法】
做猫爪手势：双手弯曲放在脸旁，学猫叫"meow meow"，边做边说"cat"

✨【词汇扩展】
• 词形变化：cats（很多猫咪）
• 近义词：pet（宠物）
• 相关词：dog（狗）、fish（鱼）`
}

console.log('\n📝 预设内容测试:')
console.log(presetContent.cat)

console.log('\n✅ 格式测试完成')