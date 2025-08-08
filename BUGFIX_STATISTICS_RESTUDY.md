# 统计页面错误单词重新学习功能修复

## 问题描述
在学习统计页面，点击错误单词进行重新学习时，不能进入该单词的学习页面。

## 问题分析

### 根本原因
1. **缺少关卡查找功能**: 原代码试图通过 `wordData.level` 获取单词所属关卡，但单词数据结构中并没有 `level` 字段
2. **进度恢复冲突**: 当跳转到学习页面时，如果该关卡有未完成进度，系统会询问是否恢复进度，可能导致无法直接跳转到目标单词

### 技术细节
- `word-library.js` 中的 `getWordByEnglish()` 函数返回的单词数据不包含关卡信息
- 需要通过遍历所有关卡来查找包含特定单词的关卡
- `word-learning.js` 中的进度恢复机制与 `focusWord` 参数存在冲突

## 解决方案

### 1. 添加单词关卡查找功能
在 `pages/statistics/statistics.js` 中添加了 `findWordLevel()` 函数：

```javascript
/**
 * 查找包含指定单词的关卡
 * @param {string} word - 要查找的单词
 * @returns {number|null} 关卡编号，如果未找到则返回null
 */
findWordLevel(word) {
  try {
    // 遍历所有关卡（1-35）查找包含该单词的关卡
    for (let level = 1; level <= 35; level++) {
      try {
        const levelData = wordLibrary.getLevelWords(level)
        if (levelData && levelData.words) {
          const foundWord = levelData.words.find(w => 
            w.word && w.word.toLowerCase() === word.toLowerCase()
          )
          if (foundWord) {
            console.log(`找到单词 ${word} 在第${level}关`)
            return level
          }
        }
      } catch (levelError) {
        // 某个关卡数据获取失败，继续查找下一个关卡
        console.warn(`获取第${level}关数据失败:`, levelError)
        continue
      }
    }
    
    console.warn(`未在任何关卡中找到单词: ${word}`)
    return null
  } catch (error) {
    console.error('查找单词关卡失败:', error)
    return null
  }
}
```

### 2. 修复重新学习功能
更新了 `restudyErrorWord()` 函数：

```javascript
/**
 * 重新学习错误单词
 */
restudyErrorWord(word) {
  try {
    console.log(`开始查找单词 ${word} 的关卡信息...`)
    
    // 查找包含该单词的关卡
    const levelId = this.findWordLevel(word)
    
    if (levelId) {
      console.log(`重新学习单词 ${word}，跳转到第${levelId}关`)
      
      wx.navigateTo({
        url: `/pages/word-learning/word-learning?level=${levelId}&focusWord=${word}`,
        success: () => {
          console.log(`成功跳转到第${levelId}关学习单词 ${word}`)
        },
        fail: (error) => {
          console.error('跳转到学习页面失败:', error)
          wx.showToast({
            title: '跳转失败',
            icon: 'none'
          })
        }
      })
    } else {
      console.warn(`未找到单词 ${word} 的关卡信息`)
      wx.showToast({
        title: '未找到该单词的关卡信息',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('重新学习单词失败:', error)
    wx.showToast({
      title: '操作失败',
      icon: 'none'
    })
  }
}
```

### 3. 优化学习页面进度处理
在 `pages/word-learning/word-learning.js` 中：

1. **保存 focusWord 参数**:
```javascript
// 保存关卡ID和focusWord用于进度保存
this.levelId = options.levelId || options.level
this.focusWord = options.focusWord // 保存focusWord参数
```

2. **跳过进度恢复**:
```javascript
checkAndRestoreProgress() {
  return new Promise((resolve) => {
    if (!this.levelId) {
      resolve(false)
      return
    }
    
    // 如果有focusWord参数，说明是从统计页面跳转过来重新学习特定单词
    // 此时应该跳过进度恢复，直接开始学习目标单词
    if (this.focusWord) {
      console.log(`🎯 检测到focusWord参数: ${this.focusWord}，跳过进度恢复`)
      resolve(false)
      return
    }
    
    // ... 其余进度恢复逻辑
  })
}
```

## 修复效果

### 修复前
- 点击错误单词时显示"未找到该单词的关卡信息"
- 无法跳转到学习页面

### 修复后
- 能够正确查找到单词所属的关卡
- 成功跳转到学习页面并定位到目标单词
- 跳过进度恢复询问，直接开始学习目标单词
- 提供详细的日志信息便于调试

## 测试步骤

1. **准备测试数据**:
   - 确保有一些错误单词记录
   - 可以通过故意拼错单词来创建错误记录

2. **测试重新学习功能**:
   - 进入统计页面
   - 查看"最容易出错的单词"列表
   - 点击任意错误单词
   - 在弹出的详情对话框中点击"重新学习"

3. **验证预期行为**:
   - 应该能够成功跳转到学习页面
   - 学习页面应该直接显示目标单词
   - 不应该出现进度恢复的询问对话框
   - 控制台应该显示相关的调试日志

## 注意事项

1. **性能考虑**: `findWordLevel()` 函数需要遍历所有关卡，对于大量单词可能有性能影响，但考虑到关卡数量有限（35个），影响可接受

2. **错误处理**: 添加了完善的错误处理机制，确保即使某个关卡数据获取失败也不会影响整体功能

3. **兼容性**: 修改保持了向后兼容性，不会影响现有的学习流程

4. **日志记录**: 添加了详细的日志记录，便于后续调试和维护

## 相关文件

- `pages/statistics/statistics.js` - 主要修复文件
- `pages/word-learning/word-learning.js` - 进度处理优化
- `utils/word-library.js` - 单词库（查看数据结构）
- `utils/data-manager.js` - 数据管理（查看关卡数据获取）