# WXML语法错误修复记录

## 问题描述

在单词学习页面集成OCR功能后，遇到了小程序编译错误：

### 错误信息
```
Bad value with message: unexpected token '.'
127 | <view class="confidence-bar" wx:if="{{recognitionConfidence > 0}}">
128 | <view class="confidence-fill" style="width: {{recognitionConfidence * 100}};"></view>
129 | <view class="confidence-text text-xs">置信度: {{(recognitionConfidence * 100).toFixed(1)}}%</view>
100).toFixed(1)}}%</view>
```

### 错误原因
小程序的WXML模板不支持在数据绑定中直接调用JavaScript方法，如`.toFixed(1)`。

## 解决方案

### 1. JavaScript层面修改

**添加新的数据字段**：
```javascript
data: {
  // 原有字段...
  recognitionConfidence: 0,
  confidencePercentage: 0,  // 新增：预计算的百分比
}
```

**在所有设置置信度的地方同时更新百分比**：
```javascript
// OCR识别结果更新
this.setData({
  ocrResult: recognizedText,
  ocrConfidence: finalConfidence,
  recognitionResult: recognizedText,
  recognitionConfidence: finalConfidence,
  confidencePercentage: Math.round(finalConfidence * 100), // 新增
  recognitionMethod: 'OCR云函数'
})

// 本地识别结果更新
this.setData({ 
  recognitionResult: result.result,
  recognitionConfidence: result.confidence,
  confidencePercentage: Math.round(result.confidence * 100), // 新增
  recognitionMethod: result.method,
  // 其他字段...
})

// 清空识别结果时
this.setData({ 
  recognitionResult: '',
  recognitionConfidence: 0,
  confidencePercentage: 0, // 新增
  intelligentHints: [],
  progressiveHints: []
})
```

### 2. WXML模板修改

**修改前（错误语法）**：
```xml
<view class="confidence-bar" wx:if="{{recognitionConfidence > 0}}">
  <view class="confidence-fill" style="width: {{recognitionConfidence * 100}}%;"></view>
  <view class="confidence-text text-xs">置信度: {{(recognitionConfidence * 100).toFixed(1)}}%</view>
</view>
```

**修改后（正确语法）**：
```xml
<view class="confidence-bar" wx:if="{{recognitionConfidence > 0}}">
  <view class="confidence-fill" style="width: {{confidencePercentage}}%;"></view>
  <view class="confidence-text text-xs">置信度: {{confidencePercentage}}%</view>
</view>
```

## 修改文件列表

1. **pages/word-learning/word-learning.js**
   - 添加`confidencePercentage`数据字段
   - 在所有设置`recognitionConfidence`的地方同时设置`confidencePercentage`
   - 涉及方法：
     - `performOCRRecognition()`
     - `performHandwritingRecognition()`  
     - `performSimpleRecognition()`

2. **pages/word-learning/word-learning.wxml**
   - 修改置信度显示的数据绑定语法
   - 使用预计算的百分比值而非模板内计算

## 经验总结

### 小程序WXML语法限制
- ❌ 不支持在模板中调用JavaScript方法
- ❌ 不支持复杂的表达式计算
- ✅ 支持简单的数学运算（如乘法）
- ✅ 支持预计算值的数据绑定

### 最佳实践
1. **数据预处理**：在JavaScript中完成所有复杂计算
2. **简化模板**：WXML中只进行简单的数据展示
3. **一致性维护**：所有相关数据更新时保持同步
4. **性能考虑**：预计算比模板内计算更高效

## 测试验证

修复后应验证：
1. ✅ WXML编译无错误
2. ✅ 置信度百分比正确显示
3. ✅ 置信度条宽度正确渲染
4. ✅ OCR和本地识别都能正常工作

## 相关文档

- [小程序WXML语法参考](https://developers.weixin.qq.com/miniprogram/dev/reference/wxml/)
- [数据绑定最佳实践](https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxml/data.html) 