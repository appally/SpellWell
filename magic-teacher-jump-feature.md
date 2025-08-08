# 魔法老师跳转功能说明

## 功能概述

当用户在单词默写界面连续拼写错误同一个单词第3次时，系统会提示用户进一步学习该单词，用户同意后跳转到魔法老师页面（AI讲解页面）。

## 功能特点

### 1. 智能错误检测
- **默写模式**：跟踪用户在文本输入框中的错误次数
- **字母拼写模式**：跟踪用户在字母拼写游戏中的错误次数
- **统一计数**：两种模式共享错误计数器，确保准确跟踪

### 2. 友好的用户提示
- **提示时机**：第3次错误后立即显示确认对话框
- **提示内容**：`单词"[word]"似乎有点难度，要不要让魔法老师来帮助你更好地理解这个单词？`
- **用户选择**：
  - **好的**：跳转到魔法老师页面
  - **跳过/继续尝试**：根据模式不同有不同处理

### 3. 特殊的魔法老师页面体验
- **特殊标题**：从默写跳转时显示"魔法老师来帮忙[word]"
- **特殊加载文案**：显示"魔法老师来帮你攻克这个单词..."
- **鼓励提示**：显示"别担心，每个人学习都会遇到困难，让我来帮你更好地理解这个单词！"
- **视觉标识**：使用🧙‍♂️图标替代普通的🤖图标

## 技术实现

### 1. 错误计数逻辑

#### 默写模式 (`onSubmitDictation`)
```javascript
if (newAttempts >= maxAttempts) {
  // 显示确认对话框
  wx.showModal({
    title: '需要帮助吗？',
    content: `单词"${this.data.currentWord.word}"似乎有点难度，要不要让魔法老师来帮助你更好地理解这个单词？`,
    confirmText: '好的',
    cancelText: '跳过',
    success: (res) => {
      if (res.confirm) {
        this.jumpToMagicTeacher()
      } else {
        this.handleWordCompletion(false)
      }
    }
  })
}
```

#### 字母拼写模式 (`onLetterTap`)
```javascript
if (!isCorrect) {
  const newAttempts = this.data.dictationAttempts + 1
  
  this.setData({
    dictationAttempts: newAttempts
  })
  
  if (newAttempts >= this.data.maxAttempts) {
    setTimeout(() => {
      this.showMagicTeacherPrompt()
    }, 1000)
  }
  
  this.triggerExplodeAnimation()
}
```

### 2. 跳转逻辑 (`jumpToMagicTeacher`)
```javascript
jumpToMagicTeacher() {
  const wordData = {
    word: this.data.currentWord.word,
    phonetic: this.data.currentWord.phonetic,
    chinese: this.data.currentWord.chinese,
    image: this.data.currentWord.image,
    sentence: this.data.currentWord.sentence,
    tips: this.data.currentWord.tips
  }
  
  wx.navigateTo({
    url: `/pages/ai-explanation/ai-explanation?word=${encodeURIComponent(this.data.currentWord.word)}&wordData=${encodeURIComponent(JSON.stringify(wordData))}&from=dictation`
  })
}
```

### 3. AI讲解页面特殊处理
```javascript
onLoad(options) {
  const { word, wordData, from } = options
  const fromDictation = from === 'dictation'
  
  this.setData({
    word: word,
    wordData: parsedWordData,
    fromDictation: fromDictation
  })
  
  const titlePrefix = fromDictation ? '魔法老师来帮忙' : '魔法老师讲'
  wx.setNavigationBarTitle({
    title: `${titlePrefix}${word}`
  })
}
```

## 用户体验流程

### 场景1：默写模式错误3次
1. 用户在默写输入框输入错误单词
2. 系统显示"还有X次机会"
3. 第3次错误后显示确认对话框
4. 用户选择"好的"→跳转到魔法老师页面
5. 用户选择"跳过"→进入下一个单词

### 场景2：字母拼写模式错误3次
1. 用户点击错误字母
2. 触发爆炸动画，字母重置
3. 第3次错误后延迟1秒显示确认对话框
4. 用户选择"好的"→跳转到魔法老师页面
5. 用户选择"继续尝试"→重置错误计数，继续游戏

### 场景3：魔法老师页面体验
1. 显示特殊的加载界面和鼓励文案
2. 生成针对性的AI讲解内容
3. 用户可以点击"返回"按钮回到单词学习页面

## 错误处理

### 1. 跳转失败处理
```javascript
fail: (error) => {
  wx.showModal({
    title: '跳转失败',
    content: '无法打开魔法老师页面，是否重试？',
    confirmText: '重试',
    cancelText: '跳过',
    success: (retryRes) => {
      if (retryRes.confirm) {
        this.jumpToMagicTeacher()
      } else {
        this.handleWordCompletion(false)
      }
    }
  })
}
```

### 2. 对话框显示失败处理
```javascript
fail: () => {
  // 对话框显示失败，默认跳转到魔法老师页面
  this.jumpToMagicTeacher()
}
```

## 测试方法

### 1. 使用测试脚本
```javascript
// 在浏览器控制台中运行
testMagicTeacher.quickTest()  // 快速测试
testMagicTeacher.run()        // 完整测试
testMagicTeacher.reset()      // 重置测试环境
```

### 2. 手动测试步骤
1. 进入单词学习页面
2. 点击"开始默写"进入默写模式
3. 连续输入3次错误答案
4. 验证是否显示确认对话框
5. 选择"好的"验证是否跳转到魔法老师页面
6. 验证魔法老师页面的特殊显示效果

## 配置参数

- `maxAttempts`: 最大错误次数，默认为3
- `dictationAttempts`: 当前错误次数计数器
- `fromDictation`: 标识是否从默写页面跳转

## 注意事项

1. **错误计数共享**：默写模式和字母拼写模式共享同一个错误计数器
2. **状态重置**：每个新单词开始时会重置错误计数
3. **用户选择**：始终尊重用户的选择，提供跳过选项
4. **错误恢复**：提供重试机制，确保功能的可靠性
5. **视觉反馈**：通过动画和提示文案提供清晰的用户反馈

## 未来优化方向

1. **个性化提示**：根据用户的学习历史调整提示内容
2. **学习分析**：分析用户的错误模式，提供更精准的帮助
3. **多样化反馈**：提供更多样的鼓励和帮助方式
4. **学习路径**：根据错误情况推荐相关的学习内容