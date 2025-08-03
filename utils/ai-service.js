/**
 * AI服务模块 - DeepSeek API集成
 */

const app = getApp()

/**
 * 调用DeepSeek API生成单词讲解
 * @param {string} word 单词或提示文本
 * @param {Object} options 选项参数
 * @returns {Promise<string>} AI生成的内容
 */
async function generateWordExplanation(word, options = {}) {
  try {
    console.log('🤖 调用AI生成单词讲解:', word)
    
    // 先检查缓存
    if (typeof word === 'string' && word.length < 20) {
      const cached = getCachedExplanation(word)
      if (cached) {
        console.log('📦 使用缓存的AI讲解')
        return cached
      }
    }
    
            // 直接调用DeepSeek API
        try {
          console.log('🚀 尝试调用DeepSeek API获取AI讲解')
          const explanation = await callDeepSeekAPI(word, options)
          
          // 缓存结果
          if (typeof word === 'string' && word.length < 20) {
            cacheExplanation(word, explanation)
          }
          
          console.log('✅ DeepSeek API调用成功')
          return explanation
          
        } catch (apiError) {
          console.warn('⚠️ DeepSeek API不可用，自动使用本地智能内容:', apiError.message)
          
          // 降级方案：使用本地模拟数据
          const mockResponse = await generateMockExplanation(word)
          
          // 缓存结果
          if (typeof word === 'string' && word.length < 20) {
            cacheExplanation(word, mockResponse)
          }
          
          console.log('✅ 已提供本地智能讲解内容')
          return mockResponse
        }
    
    throw new Error('需要调用实际API')
    
  } catch (error) {
    console.error('AI服务调用失败:', error)
    return generateFallbackExplanation(extractWordFromPrompt(word))
  }
}

/**
 * 直接调用DeepSeek API（需要配置域名白名单）
 * @param {string} word 单词
 * @param {Object} options 选项参数
 * @returns {Promise<string>} AI生成的内容
 */
async function callDeepSeekAPI(word, options = {}) {
  // API配置 - 优化为更快的模型
  const apiConfig = {
    baseUrl: 'https://api.deepseek.com',
    apiKey: 'sk-54a9c8c533e04a678a450d5fa14d07fc', // 开发环境密钥
    model: 'deepseek-coder' // 使用更快的模型
  }
  
  // 检查是否需要快速模式
  const isQuickMode = options.quick !== false
  
  let prompt
  if (isQuickMode) {
    // 快速模式：简洁prompt，快速响应
    prompt = `为单词"${word}"生成60字内的儿童解释：
    
🎯 简单含义 + 1个例句（英文+中文）
要求：简洁有趣，用emoji，适合小学生

例如：
🐱 cat：小猫咪，喵喵叫的可爱动物
I have a cat. 我有一只猫咪。`
  } else {
    // 详细模式：完整内容
    prompt = `你是一位专业的小学英语老师，请为6-12岁的小学生生成关于单词"${word}"的趣味学习内容。

🎯 **学习目标**：让孩子轻松记住并会用这个单词

📚 **内容要求**：
**【趣味解释】** 用孩子喜欢的比喻、故事或形象描述来解释单词意思
**【生活实例】** 提供2个贴近小学生生活的简单例句（英文+中文对照）
**【记忆诀窍】** 一个有趣的记忆方法：谐音、字形联想、动作记忆等
**【小游戏】** 建议一个简单好玩的小游戏来练习这个单词

💡 **语言风格**：
- 使用儿童喜欢的词汇和表达
- 多用emoji让内容生动有趣
- 避免复杂语法术语
- 总字数控制在300字以内
- 用温暖鼓励的语气

请开始生成内容：`
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${apiConfig.baseUrl}/v1/chat/completions`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiConfig.apiKey}`
      },
      data: {
        model: apiConfig.model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: isQuickMode ? 150 : 600, // 快速模式使用更少tokens
        temperature: isQuickMode ? 0.3 : 0.7, // 快速模式降低随机性
        top_p: 0.95
      },
      timeout: 30000, // 30秒超时
      success: (response) => {
        if (response.statusCode === 200 && response.data.choices && response.data.choices[0]) {
          resolve(response.data.choices[0].message.content)
        } else {
          // 特殊处理402余额不足错误
          if (response.statusCode === 402) {
            reject(new Error(`DeepSeek API余额不足，自动切换到本地模拟数据`))
          } else {
            reject(new Error(`API响应错误: ${response.statusCode} - ${JSON.stringify(response.data)}`))
          }
        }
      },
      fail: (error) => {
        reject(new Error(`API请求失败: ${error.errMsg || '网络错误'}`))
      }
    })
  })
}

/**
 * 从提示文本中提取单词（用于降级处理）
 */
function extractWordFromPrompt(text) {
  if (typeof text === 'string' && text.length < 20) {
    return text
  }
  const match = text.match(/单词"([^"]+)"/)
  return match ? match[1] : 'word'
}

/**
 * 生成模拟AI响应（用于开发测试）
 * @param {string} prompt 提示文本
 * @returns {Promise<string>} 模拟响应
 */
function generateMockExplanation(prompt) {
  return new Promise((resolve) => {
    // 模拟网络延迟
    setTimeout(() => {
      const word = extractWordFromPrompt(prompt)
      const explanations = getMockExplanations()
      
      const explanation = explanations[word.toLowerCase()] || generateFallbackExplanation(word)
      resolve(explanation)
    }, 1000 + Math.random() * 1000) // 1-2秒随机延迟
  })
}



/**
 * 获取预设的模拟讲解数据
 * @returns {Object} 单词讲解映射
 */
function getMockExplanations() {
  return {
    'a': `🌟【趣味解释】"A"是英语字母表的第一个字母，也是最常用的小词！它就像一个小助手，帮助我们介绍新朋友：一个苹果、一只猫咪、一本书...

🏠【生活实例】
• I have a cat. - 我有一只猫咪。
• This is a book. - 这是一本书。

🧠【记忆诀窍】"A"的读音像"诶"，想象你指着东西说"诶，这是一个..."

🎮【小游戏】在房间里找东西，用"This is a..."来介绍：This is a chair, this is a table！`,

    'apple': `🍎【趣味解释】Apple是大自然的糖果盒！它圆圆的、脆脆的，咬一口"咔嚓"响，甜甜的汁水就流出来了！

🏠【生活实例】
• I eat an apple every day. - 我每天都吃一个苹果。
• The apple is red and sweet. - 苹果又红又甜。

🧠【记忆诀窍】Apple读音像"爱泡"，苹果爱泡在果汁里游泳！

🎮【小游戏】画苹果树：画一棵树，上面挂满苹果，边画边说"Apple, apple, on the tree"！`,

    'cat': `🐱【趣味解释】Cat是世界上最会撒娇的小精灵！它们有超能力：会爬树、会钻箱子，还会用"喵喵"语和人类对话呢！

🏠【生活实例】
• My cat likes fish. - 我的猫咪喜欢吃鱼。
• The cat is sleeping. - 小猫在睡觉。

🧠【记忆诀窍】Cat读音像"开特"，小猫咪开着特殊的眼睛看世界！

🎮【小游戏】学小猫走路：踮起脚尖，轻轻地走，边走边说"I am a cat"！`,

    'dog': `🐕【趣味解释】Dog是地球上最忠诚的好朋友！它们有一颗超大的爱心，会保护主人，还是最棒的玩伴哦！

🏠【生活实例】
• My dog can run fast. - 我的小狗能跑得很快。
• The dog is very friendly. - 这只狗很友好。

🧠【记忆诀窍】Dog像"豆格"，小狗爱吃豆豆，吃完在格子里睡觉！

🎮【小游戏】模仿小狗：四肢着地爬一爬，发出"汪汪"声，说"I am a dog"！`,

    'house': `含义：房子是我们居住的地方，有门、窗户和屋顶。
例句：I live in a big house. - 我住在一座大房子里。
记忆：House读音像"好死"，好的房子让人舍不得离开！`,

    'fish': `含义：鱼是生活在水里的动物，用鳃呼吸，有鳞片。
例句：Fish can swim very fast. - 鱼能游得很快。
记忆：Fish听起来像"费时"，钓鱼确实很费时间！`,

    'moon': `含义：月亮是夜空中明亮的天体，形状会变化。
例句：The moon is bright tonight. - 今晚月亮很亮。
记忆：Moon像"木恩"，月亮像木头一样安静地挂在天空！`,

    'water': `含义：水是无色透明的液体，是生命必需的。
例句：Please drink more water. - 请多喝水。
记忆：Water像"我特"，我特别需要水！`,

    'lion': `含义：狮子是草原之王，有金色的鬃毛，叫声很威武。
例句：The lion is very strong. - 狮子非常强壮。
记忆：Lion像"来昂"，狮子来了，昂首挺胸！`,

    'plane': `含义：飞机可以在天空中飞行，载着人们去远方。
例句：The plane flies in the sky. - 飞机在天空中飞行。
记忆：Plane像"普兰"，普通的飞机都很蓝（天空色）！`
  }
}

/**
 * 生成备用讲解（当AI服务不可用时）
 * @param {string} word 单词
 * @returns {string} 备用讲解
 */
function generateFallbackExplanation(word) {
  return `含义：${word}是一个英语单词，让我们一起学习它！
例句：This is ${word}. - 这是${word}。
记忆：多读几遍，多写几遍，就能记住啦！`
}

/**
 * 检查网络连接状态
 * @returns {Promise<boolean>} 网络是否可用
 */
function checkNetworkConnection() {
  return new Promise((resolve) => {
    wx.getNetworkType({
      success: (res) => {
        resolve(res.networkType !== 'none')
      },
      fail: () => {
        resolve(false)
      }
    })
  })
}

/**
 * 批量生成多个单词的讲解
 * @param {Array} words 单词数组
 * @returns {Promise<Array>} 讲解数组
 */
async function batchGenerateExplanations(words) {
  const explanations = []
  
  for (const word of words) {
    try {
      const prompt = `请为小学生生成关于单词"${word.word}"的学习内容。要求：
1. 用简单易懂的中文解释单词含义："${word.chinese}"
2. 提供1-2个简单的英文例句，并翻译成中文
3. 给出记忆小技巧或联想方法
4. 语言要生动有趣，适合6-12岁儿童
5. 总字数控制在150字以内`

      const explanation = await generateWordExplanation(prompt)
      explanations.push({
        ...word,
        explanation
      })
      
      // 添加延迟避免频率限制
      await new Promise(resolve => setTimeout(resolve, 500))
      
    } catch (error) {
      console.error(`生成${word.word}讲解失败:`, error)
      explanations.push({
        ...word,
        explanation: generateFallbackExplanation(word.word)
      })
    }
  }
  
  return explanations
}

/**
 * 缓存AI响应到本地存储
 * @param {string} word 单词
 * @param {string} explanation 讲解内容
 */
function cacheExplanation(word, explanation) {
  try {
    const cacheKey = `ai_explanation_${word.toLowerCase()}`
    wx.setStorageSync(cacheKey, {
      word,
      explanation,
      timestamp: Date.now(),
      version: '1.0'
    })
  } catch (error) {
    console.error('缓存AI讲解失败:', error)
  }
}

/**
 * 从缓存获取AI讲解
 * @param {string} word 单词
 * @returns {string|null} 缓存的讲解或null
 */
function getCachedExplanation(word) {
  try {
    const cacheKey = `ai_explanation_${word.toLowerCase()}`
    const cached = wx.getStorageSync(cacheKey)
    
    if (cached && cached.explanation) {
      // 检查缓存是否过期（7天）
      const sevenDays = 7 * 24 * 60 * 60 * 1000
      if (Date.now() - cached.timestamp < sevenDays) {
        return cached.explanation
      }
    }
    
    return null
  } catch (error) {
    console.error('获取缓存AI讲解失败:', error)
    return null
  }
}

module.exports = {
  generateWordExplanation,
  callDeepSeekAPI,
  getCachedExplanation,
  generateMockExplanation,
  generateFallbackExplanation,
  batchGenerateExplanations,
  checkNetworkConnection,
  cacheExplanation,
  getCachedExplanation
}