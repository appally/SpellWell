/**
 * AI服务模块 - Qwen-Plus API集成
 */

const app = getApp()

/**
 * 调用Qwen-Plus API生成单词讲解
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
    
            // 直接调用Qwen-Plus API
        try {
          console.log('🚀 尝试调用Qwen-Plus API获取AI讲解，单词:', word)
          const explanation = await callAPIWithRetry(word, options)
          
          // 验证返回内容
          if (!explanation || explanation.trim().length === 0) {
            throw new Error('API返回内容为空')
          }
          
          // 缓存结果
          if (typeof word === 'string' && word.length < 20) {
            cacheExplanation(word, explanation)
          }
          
          console.log('✅ Qwen-Plus API调用成功，内容长度:', explanation.length)
          return explanation
          
        } catch (apiError) {
          console.warn('⚠️ Qwen-Plus API不可用，自动使用本地智能内容:', apiError.message)
          
          // 降级方案：使用本地模拟数据
          const mockResponse = await generateMockExplanation(word)
          
          // 在本地内容前添加友好提示
          const enhancedResponse = `🌟【魔法老师小贴士】当前为您提供精心准备的本地学习内容，同样精彩有趣哦！\n\n${mockResponse}`
          
          // 缓存结果
          if (typeof word === 'string' && word.length < 20) {
            cacheExplanation(word, enhancedResponse)
          }
          
          console.log('✅ 已提供本地智能讲解内容')
          return enhancedResponse
        }
    
  } catch (error) {
    console.error('AI服务调用失败:', error)
    return generateFallbackExplanation(extractWordFromPrompt(word))
  }
}

/**
 * 带重试机制的API调用
 * @param {string} word 单词
 * @param {Object} options 选项参数
 * @param {number} retryCount 当前重试次数
 * @returns {Promise<string>} AI生成的内容
 */
async function callAPIWithRetry(word, options = {}, retryCount = 0) {
  try {
    return await callQwenPlusAPI(word, options)
  } catch (error) {
    console.warn(`🔄 API调用失败，重试次数: ${retryCount + 1}/3`, error.message)
    
    if (retryCount < 2) { // 最多重试2次，总共3次尝试
      const delay = Math.pow(2, retryCount) * 1000 // 指数退避：1s, 2s
      console.log(`⏳ 等待 ${delay}ms 后重试...`)
      
      await new Promise(resolve => setTimeout(resolve, delay))
      return callAPIWithRetry(word, options, retryCount + 1)
    }
    
    // 重试次数用完，抛出错误
    throw error
  }
}

/**
 * 直接调用Qwen-Plus API（需要配置域名白名单）
 * @param {string} word 单词
 * @param {Object} options 选项参数
 * @returns {Promise<string>} AI生成的内容
 */
async function callQwenPlusAPI(word, options = {}) {
  // API配置 - 使用Qwen-Plus模型
  const apiConfig = {
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    apiKey: 'sk-d8fa10db341a41f189d582a7486841c7', // 阿里云API密钥
    model: 'qwen-plus', // 使用qwen-plus模型
    timeout: 45000, // 增加超时时间到45秒
    retryTimes: 3 // 重试次数
  }
  
  // 检查是否需要快速模式
  const isQuickMode = options.quick !== false
  
  let prompt
  if (isQuickMode) {
    // 快速模式：简洁prompt，快速响应
    prompt = `为单词"${word}"生成120字内的儿童解释：
    
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
**🌟【趣味解释】** 用生动的比喻、有趣的故事或形象的描述来解释单词含义，让孩子产生深刻印象
**🏠【生活实例】** 提供3-4个贴近小学生日常生活的简单例句（英文+中文对照），涵盖不同使用场景
**🧠【记忆诀窍】** 提供创意记忆方法：谐音联想、字形记忆、动作记忆、故事记忆等多种技巧
**🎮【小游戏】** 设计一个简单有趣的互动游戏或活动来练习这个单词
**✨【小贴士】** 补充相关的词汇扩展、语法小知识或文化背景（如适用）

💡 **语言风格要求**：
- 使用儿童喜欢的词汇和表达方式
- 大量使用emoji让内容生动活泼
- 避免复杂的语法术语
- 内容丰富但易懂，总字数控制在350字以内
- 用温暖鼓励的语气，激发学习兴趣
- 每个部分都要有具体的内容，不能过于简单

请开始生成内容：`
  }

  return new Promise((resolve, reject) => {
    console.log('📡 发起API请求，URL:', `${apiConfig.baseUrl}/chat/completions`)
    console.log('📝 请求参数:', { word, isQuickMode, promptLength: prompt.length })
    
    wx.request({
      url: `${apiConfig.baseUrl}/chat/completions`,
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
      timeout: apiConfig.timeout, // 使用配置的超时时间
      success: (response) => {
        console.log('📨 API响应状态码:', response.statusCode)
        console.log('📨 API响应数据:', response.data)
        
        if (response.statusCode === 200 && response.data.choices && response.data.choices[0]) {
          const content = response.data.choices[0].message.content
          console.log('✅ API调用成功，返回内容长度:', content.length)
          resolve(content)
        } else {
          // 特殊处理402余额不足错误
          if (response.statusCode === 402) {
            console.warn('💰 API余额不足')
            reject(new Error(`Qwen-Plus API余额不足，自动切换到本地模拟数据`))
          } else {
            console.error('❌ API响应异常:', response.statusCode, response.data)
            reject(new Error(`API响应错误: ${response.statusCode} - ${JSON.stringify(response.data)}`))
          }
        }
      },
      fail: (error) => {
        console.error('❌ API请求失败:', error)
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
    'a': `🌟【趣味解释】"A"是英语字母表的第一个字母，也是最常用的小词！它就像一个小助手，帮助我们介绍新朋友：一个苹果、一只猫咪、一本书...在英语中，"a"表示"一个"的意思，是单数名词前最常见的小伙伴！

🏠【生活实例】
• I have a cat. - 我有一只猫咪。
• This is a book. - 这是一本书。
• I want a cookie. - 我想要一块饼干。
• She has a red bag. - 她有一个红色的包。

🧠【记忆诀窍】"A"的读音像"诶"，想象你指着东西说"诶，这是一个..."记住：看到单数的东西，就用"a"来介绍！

🎮【小游戏】在房间里找东西，用"This is a..."来介绍：This is a chair, this is a table！每找到一样东西就大声说出来，看谁说得最多！

✨【小贴士】"a"和"an"是好朋友，遇到元音字母开头的单词时要用"an"哦！比如：an apple, an egg。`,

    'apple': `🍎【趣味解释】Apple是大自然的糖果盒！它圆圆的、脆脆的，咬一口"咔嚓"响，甜甜的汁水就流出来了！苹果有很多颜色：红的像小朋友的脸蛋，绿的像春天的叶子，黄的像温暖的阳光。

🏠【生活实例】
• I eat an apple every day. - 我每天都吃一个苹果。
• The apple is red and sweet. - 苹果又红又甜。
• Mom bought five apples. - 妈妈买了五个苹果。
• Apple pie is delicious. - 苹果派很好吃。

🧠【记忆诀窍】Apple读音像"爱泡"，苹果爱泡在果汁里游泳！还可以想象：A-P-P-L-E，A是苹果的第一个字母，很好记！

🎮【小游戏】画苹果树：画一棵树，上面挂满苹果，边画边说"Apple, apple, on the tree"！还可以数苹果：one apple, two apples, three apples！

🌈【颜色学习】苹果教我们颜色：red apple（红苹果）、green apple（青苹果）、yellow apple（黄苹果）。`,

    'cat': `🐱【趣味解释】Cat是世界上最会撒娇的小精灵！它们有超能力：会爬树、会钻箱子，还会用"喵喵"语和人类对话呢！猫咪的眼睛在黑暗中会发光，像两颗小星星，它们的胡须能感知周围的一切变化。

🏠【生活实例】
• My cat likes fish. - 我的猫咪喜欢吃鱼。
• The cat is sleeping. - 小猫在睡觉。
• A black cat is sitting there. - 一只黑猫坐在那里。
• Cats can climb trees. - 猫咪会爬树。

🧠【记忆诀窍】Cat读音像"开特"，小猫咪开着特殊的眼睛看世界！还可以记住：C像猫咪弯弯的身体，A像猫咪竖起的耳朵，T像猫咪的尾巴！

🎮【小游戏】学小猫走路：踮起脚尖，轻轻地走，边走边说"I am a cat"！还可以模仿猫咪洗脸、伸懒腰的动作。

🎵【小儿歌】"Cat, cat, meow meow meow, soft and cute, I love you!"（小猫小猫喵喵叫，又软又萌我爱你！）`,

    'dog': `🐕【趣味解释】Dog是地球上最忠诚的好朋友！它们有一颗超大的爱心，会保护主人，还是最棒的玩伴哦！狗狗有敏锐的嗅觉，能闻到很远的味道，它们摇尾巴表示开心，是最会表达情感的动物朋友。

🏠【生活实例】
• My dog can run fast. - 我的小狗能跑得很快。
• The dog is barking loudly. - 小狗在大声叫。
• I walk my dog every morning. - 我每天早上遛狗。
• Dogs love to play with balls. - 狗狗喜欢玩球。

🧠【记忆诀窍】Dog读音像"到格"，小狗狗到处跑格外活泼！还可以记住：D像狗狗竖起的耳朵，O像狗狗圆圆的眼睛，G像狗狗弯弯的尾巴！

🎮【小游戏】学小狗走路：四肢着地爬行，边爬边说"Woof! Woof! I am a dog!"还可以玩"狗狗听指令"：坐下(sit)、趴下(lie down)、握手(shake hands)！

✨【小贴士】不同的狗狗叫声：big dog说"Woof!"，small dog说"Yip!"，记住这些声音帮助理解英语拟声词哦！`,

    'book': `📚【趣味解释】Book是知识的宝藏盒！每一本书都像一扇神奇的门，打开它就能进入不同的世界：有童话王国、科学实验室、历史时光机...书本是最好的老师，永远不会生气，随时准备教你新知识！

🏠【生活实例】
• I read a book every night. - 我每晚都读一本书。
• This book is very interesting. - 这本书很有趣。
• Please open your book to page 10. - 请把书翻到第10页。
• The library has many books. - 图书馆有很多书。

🧠【记忆诀窍】Book读音像"布克"，布满知识的克星！还可以想象：B像书本的书脊，两个O像翻开的书页，K像书签夹在中间！

🎮【小游戏】"书本变变变"：用手做成书本的样子，一边翻页一边说"I love reading books!"还可以扮演小图书管理员整理书籍！

✨【小贴士】书的种类：story book(故事书)、picture book(图画书)、textbook(教科书)，每种书都有不同的用途哦！`,

    'house': `🏠【趣味解释】House是我们温暖的家！它有坚固的墙壁保护我们，有明亮的窗户让阳光进来，有结实的屋顶为我们遮风挡雨。每个房子都有自己的故事和温暖的回忆。

🏠【生活实例】
• I live in a big house. - 我住在一座大房子里。
• Our house has a red door. - 我们的房子有一扇红门。
• There are many rooms in the house. - 房子里有很多房间。
• Welcome to my house! - 欢迎来我家！

🧠【记忆诀窍】House读音像"好死"，好的房子让人舍不得离开！还可以想象：H像房子的柱子，O像圆圆的窗户，U像房子的墙壁，S像弯弯的烟囱，E像房子的地基！

🎮【小游戏】画房子：画一个正方形做墙壁，上面画三角形做屋顶，再画门和窗户，边画边说"This is my house"！

✨【小贴士】房子的部分：door(门)、window(窗户)、roof(屋顶)、wall(墙壁)，每个部分都很重要！`,

    'hello': `👋【趣味解释】Hello是世界上最温暖的魔法词！无论走到哪里，说一声"Hello"能打开友谊的大门，让陌生人变成朋友。它就像阳光一样，能瞬间照亮别人的心情，是每个人都应该学会的第一个英语单词！

🏠【生活实例】
• Hello, nice to meet you! - 你好，很高兴见到你！
• Hello, how are you today? - 你好，你今天怎么样？
• Say hello to your teacher. - 向你的老师问好。
• Hello everyone, welcome! - 大家好，欢迎！

🧠【记忆诀窍】Hello读音像"哈喽"，就像中文的"哈喽"一样友好！还可以想象：H像人挥手，E像笑眯眯的眼睛，两个L像张开的双臂拥抱，O像张开的嘴巴说话！

🎮【小游戏】"问候接龙"：见到不同的人说不同的hello：Hello teacher! Hello mom! Hello friend! 看谁说得最多最有礼貌！

✨【小贴士】不同时间的问候：Good morning(早上好)、Good afternoon(下午好)、Good evening(晚上好)，但Hello任何时候都可以用！`,

    'school': `🏫【趣味解释】School是知识的游乐园！这里有亲爱的老师、可爱的同学，还有无数有趣的课程等着你探索。学校就像一个大家庭，每个人都在这里成长、学习、交朋友，创造美好的回忆！

🏠【生活实例】
• I go to school by bus. - 我坐公交车上学。
• Our school is very beautiful. - 我们的学校很漂亮。
• School starts at 8 o'clock. - 学校8点开始上课。
• I love my school and teachers. - 我爱我的学校和老师。

🧠【记忆诀窍】School读音像"思酷"，在学校思考很酷！还可以想象：S像弯弯的小路通向学校，C像教室的形状，H像黑板，O像圆圆的时钟，两个L像排列整齐的课桌！

🎮【小游戏】"我的学校"：画出梦想中的学校，包括教室、操场、图书馆，边画边说"This is my school!"还可以扮演小老师给玩具上课！

✨【小贴士】学校设施：classroom(教室)、playground(操场)、library(图书馆)、cafeteria(食堂)，每个地方都有特殊的用途！`,

    'water': `💧【趣味解释】Water是生命的源泉！它透明无色却充满魔力：可以变成冰块、蒸汽、雨滴...水是地球上最珍贵的宝贝，没有它就没有美丽的花朵、绿色的树木，也没有我们人类！

🏠【生活实例】
• I drink water every day. - 我每天都喝水。
• The water is very clean. - 这水很干净。
• Fish live in the water. - 鱼儿生活在水中。
• Please save water! - 请节约用水！

🧠【记忆诀窍】Water读音像"沃特"，沃土需要特别多的水！还可以想象：W像水波纹，A像水滴的形状，T像水龙头，E像水流，R像雨滴！

🎮【小游戏】"水的变化"：用手势表演水的三种状态：液体(流动)、固体(结冰)、气体(蒸发)，边做边说"Water can change!"！

✨【小贴士】水的形态：ice(冰)、steam(蒸汽)、rain(雨)、snow(雪)，都是水的不同样子！`,

    'fish': `🐠【趣味解释】Fish是水中的游泳冠军！它们有流线型的身体，像小小的潜水艇在水中自由穿梭。鱼儿用鳃呼吸，身上有美丽的鳞片，就像穿着闪闪发光的盔甲！

🏠【生活实例】
• Fish can swim very fast. - 鱼能游得很快。
• I like to watch colorful fish. - 我喜欢看彩色的鱼。
• Fish live in the water. - 鱼生活在水里。
• My dad likes to eat fish. - 我爸爸喜欢吃鱼。

🧠【记忆诀窍】Fish听起来像"费时"，钓鱼确实很费时间！还可以想象：F像鱼的尾巴，I像鱼的身体，S像鱼游泳的波浪，H像鱼的头！

🎮【小游戏】学鱼游泳：双手合拢放在胸前，左右摆动身体，边游边说"I am a fish, swimming in the sea"！

🌊【小贴士】鱼儿有很多种：big fish（大鱼）、small fish（小鱼）、goldfish（金鱼）、colorful fish（彩色鱼）。`,

    'moon': `🌙【趣味解释】Moon是夜空中最温柔的小夜灯！它每天都会换不同的"发型"：有时是弯弯的小船，有时是圆圆的大饼，有时还会害羞地躲起来。月亮是地球的好朋友，一直陪伴着我们，给夜晚带来银色的光芒。

🏠【生活实例】
• The moon is bright tonight. - 今晚月亮很亮。
• I can see the moon in the sky. - 我能看到天空中的月亮。
• The moon looks like a banana. - 月亮看起来像香蕉。
• We watch the moon together. - 我们一起看月亮。

🧠【记忆诀窍】Moon听起来像"木"，想象月亮是一块发光的木头挂在天空！还可以记住：M像两座山，oo像两个圆圆的眼睛，n像鼻子，月亮就像一张笑脸！

🎮【小游戏】月亮变化：用手做不同形状表示月亮的变化 - 弯月（手指弯曲）、满月（双手圆圈）、新月（手指细缝），边做边说"Moon changes every day"！

🌟【小贴士】月亮的朋友：sun（太阳）、star（星星）、night（夜晚）、sky（天空）。`,

    'sun': `☀️【趣味解释】Sun是天空中最大的火球，是地球的超级大暖炉！它每天早上从东边升起，给我们带来温暖的阳光和明亮的白天。没有太阳，地球就会变成一个大冰球，所有的植物都无法生长。

🏠【生活实例】
• The sun is shining today. - 今天阳光明媚。
• I like to play in the sun. - 我喜欢在阳光下玩耍。
• The sun makes me warm. - 太阳让我感到温暖。
• Plants need sun to grow. - 植物需要阳光才能生长。

🧠【记忆诀窍】Sun听起来像"三"，太阳有三个特点：热、亮、圆！还可以想象：S像太阳的光芒，U像太阳的笑脸，N像太阳的鼻子！

🎮【小游戏】太阳体操：张开双臂转圈圈，模仿太阳发光发热，边转边说"I am the bright sun"！

☀️【小贴士】太阳家族：sunrise（日出）、sunset（日落）、sunshine（阳光）、sunny（晴朗的）。`,

    'tree': `🌳【趣味解释】Tree是大自然的绿色巨人！它们有粗壮的树干做身体，茂密的树叶做头发，深深的树根做脚。树木是地球的肺，帮我们制造新鲜空气，还给小鸟提供温暖的家。

🏠【生活实例】
• The tree is very tall. - 这棵树很高。
• Birds live in the tree. - 鸟儿住在树上。
• I like to sit under the tree. - 我喜欢坐在树下。
• Trees give us fresh air. - 树木给我们新鲜空气。

🧠【记忆诀窍】Tree听起来像"吹"，风一吹树叶就摇摆！还可以想象：T像树干，r像树枝，ee像两片叶子！

🎮【小游戏】我是小树：双脚站稳当树根，身体挺直当树干，双臂摇摆当树枝，边摇边说"I am a big tree"！

🍃【小贴士】树的部分：leaf（叶子）、branch（树枝）、root（树根）、trunk（树干）。`,

    'water': `💧【趣味解释】Water是生命的魔法药水！它透明无色，却能变成各种形状：在杯子里是杯子的形状，在瓶子里是瓶子的形状。水还会变身：热了变成蒸汽飞上天，冷了变成冰块硬邦邦，真是个神奇的变身大师！

🏠【生活实例】
• Please drink more water. - 请多喝水。
• Water is very important. - 水非常重要。
• I like to play with water. - 我喜欢玩水。
• Fish live in the water. - 鱼生活在水里。

🧠【记忆诀窍】Water读音像"我特"，我特别需要水！还可以想象：W像水波的形状，A像水滴，T像水龙头，E像水流，R像河流！

🎮【小游戏】水的三态变化：用手势表演水（流动）、冰（僵硬）、蒸汽（飘散），边做边说"water, ice, steam"！

💦【水的用途】水有很多用处：drink water（喝水）、wash hands（洗手）、water plants（浇花）。`,

    'lion': `🦁【趣味解释】Lion是动物王国的国王！它有金色的鬃毛像皇冠一样威风，叫声"吼"一声能传到很远很远的地方。狮子虽然看起来很威武，但其实也很爱家庭，狮子爸爸会保护狮子妈妈和小狮子们。

🏠【生活实例】
• The lion is very strong. - 狮子非常强壮。
• Lions live in Africa. - 狮子生活在非洲。
• The lion has a big mane. - 狮子有大大的鬃毛。
• Baby lions are called cubs. - 小狮子叫做幼崽。

🧠【记忆诀窍】Lion读音像"来昂"，狮子来了，昂首挺胸很威风！还可以想象：L像狮子站立的身体，I像狮子的尾巴，O像狮子圆圆的头，N像狮子的鬃毛！

🎮【小游戏】学狮子吼叫：双手放在嘴边做喇叭状，大声说"Roar! I am a lion!"还可以学狮子走路，昂首挺胸，很有王者风范！

👑【小贴士】狮子家族：male lion（雄狮）、female lion（雌狮）、lion cub（小狮子）、lion pride（狮群）。`,

    'apple': `🍎【趣味解释】Apple是大自然的红色小灯笼！它圆圆的，红红的，咬一口甜甜脆脆，"咔嚓"一声特别好听。苹果里面有小小的种子，就像苹果的小宝宝，种在土里就能长成大苹果树！

🏠【生活实例】
• I like to eat apples. - 我喜欢吃苹果。
• The apple is red and sweet. - 苹果又红又甜。
• An apple a day keeps the doctor away. - 一天一苹果，医生远离我。
• Mom bought some apples. - 妈妈买了一些苹果。

🧠【记忆诀窍】Apple读音像"阿婆"，阿婆最爱吃苹果！还可以想象：A像苹果的形状，pp像两个苹果，le像苹果的叶子！

🎮【小游戏】苹果数数：拿着苹果数"one apple, two apples, three apples"，还可以学苹果从树上掉下来的声音"plop"！

🍏【小贴士】苹果颜色：red apple（红苹果）、green apple（青苹果）、yellow apple（黄苹果）。`,

    'bird': `🐦【趣味解释】Bird是天空中的小飞行员！它们有美丽的羽毛做衣服，尖尖的嘴巴，还有一双神奇的翅膀可以在天空中自由飞翔。鸟儿会唱歌，"叽叽喳喳"就像在开音乐会！

🏠【生活实例】
• Birds can fly in the sky. - 鸟儿能在天空中飞翔。
• I hear birds singing. - 我听到鸟儿在唱歌。
• The bird has beautiful feathers. - 鸟儿有美丽的羽毛。
• Birds build nests in trees. - 鸟儿在树上筑巢。

🧠【记忆诀窍】Bird读音像"伯德"，伯德叔叔最爱看鸟！还可以想象：B像鸟儿的身体，I像鸟儿的脖子，R像鸟儿的翅膀，D像鸟儿的尾巴！

🎮【小游戏】学鸟飞翔：张开双臂当翅膀，轻轻摆动，边飞边说"Tweet tweet, I can fly!"还可以学不同鸟儿的叫声！

🪶【小贴士】鸟儿种类：big bird（大鸟）、small bird（小鸟）、colorful bird（彩色鸟）、singing bird（会唱歌的鸟）。`,

    'plane': `✈️【趣味解释】Plane是天空中的大鸟！它有长长的翅膀但不会扇动，靠强大的引擎推动自己在蓝天中飞翔。飞机就像一个会飞的大巴士，载着人们去世界各地探险，让我们能够飞越高山大海，实现飞行的梦想！

🏠【生活实例】
• The plane flies in the sky. - 飞机在天空中飞行。
• I want to take a plane trip. - 我想坐飞机旅行。
• The plane is very fast. - 飞机非常快。
• Planes can fly very high. - 飞机能飞得很高。

🧠【记忆诀窍】Plane读音像"普兰"，普通的飞机都很蓝（像天空的颜色）！还可以想象：P像飞机的机头，L像飞机的机身，A像飞机的翅膀，N像飞机的尾翼，E像飞机的引擎！

🎮【小游戏】做纸飞机：折一架纸飞机，边飞边说"My plane is flying!"还可以张开双臂模仿飞机飞行，发出"嗡嗡"的引擎声。

🌍【飞机知识】飞机的种类：big plane（大飞机）、small plane（小飞机）、jet plane（喷气式飞机）。`
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
  callQwenPlusAPI,
  getCachedExplanation,
  generateMockExplanation,
  generateFallbackExplanation,
  batchGenerateExplanations,
  checkNetworkConnection,
  cacheExplanation,
  getCachedExplanation
}