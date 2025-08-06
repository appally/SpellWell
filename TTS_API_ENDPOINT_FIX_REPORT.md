# TTS API端点配置修复报告

## 问题描述

在微信小程序中调用Qwen-TTS生成语音时，出现404错误：

```
POST https://dashscope.aliyuncs.com/compatible-mode/v1/audio/speech 404
```

### 错误现象
- API请求返回404状态码
- 语音合成功能完全失效
- 用户无法听到单词发音

## 问题分析

### 根本原因
API端点配置错误，使用了错误的API路径：

**错误的配置：**
- baseUrl: `https://dashscope.aliyuncs.com/compatible-mode/v1`
- endpoint: `/audio/speech`
- 完整URL: `https://dashscope.aliyuncs.com/compatible-mode/v1/audio/speech`

**正确的配置（根据官方API文档）：**
- baseUrl: `https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation`
- endpoint: `/generation`
- 完整URL: `https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation`

### 技术分析
1. **API文档对比**：官方文档显示正确端点为 `/api/v1/services/aigc/multimodal-generation/generation`
2. **请求格式差异**：新API要求voice参数在input对象内，而非根级别
3. **兼容性问题**：之前使用的compatible-mode端点可能已废弃或不支持TTS功能

## 解决方案

### 修复步骤
1. 更新配置文件中的baseUrl
2. 修改API调用端点
3. 调整请求数据格式
4. 验证修复效果

### 具体修改

#### 1. 配置文件修改
**文件：** `utils/config.js`

**修改前：**
```javascript
baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1"
```

**修改后：**
```javascript
baseUrl: "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation"
```

#### 2. API端点修改
**文件：** `utils/audio-service.js`

**修改前：**
```javascript
const response = await this.makeApiRequest('/audio/speech', requestData)
```

**修改后：**
```javascript
const response = await this.makeApiRequest('/generation', requestData)
```

#### 3. 请求格式调整
**文件：** `utils/audio-service.js`

**修改前：**
```javascript
const requestData = {
  model: this.ttsConfig.model,
  input: {
    text: text.trim()
  },
  voice: options.voice || 'samantha',
  response_format: options.format || 'wav',
  speed: options.speed || 1.0,
  volume: options.volume || 1.0
}
```

**修改后：**
```javascript
const requestData = {
  model: this.ttsConfig.model,
  input: {
    text: text.trim(),
    voice: options.voice || 'Chelsie'
  }
}
```

## 修复验证

### 测试结果
运行 `test-tts.js` 测试脚本，所有测试通过：

```
✅ 通过 TTS API调用
✅ 通过 音频播放功能
✅ 通过 缓存功能
✅ 通过 预加载功能
✅ 通过 错误处理
✅ 通过 资源清理

📈 测试通过率: 6/6 (100%)
🎉 所有测试通过！TTS功能集成成功！
```

### 功能验证
- [x] API请求成功发送
- [x] 语音合成正常工作
- [x] 音频缓存功能正常
- [x] 错误处理机制有效
- [x] 资源清理功能正常

## 技术细节

### 新API规范
根据阿里云Qwen-TTS官方文档：

```bash
curl -X POST 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation' \
-H "Authorization: Bearer $DASHSCOPE_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
    "model": "qwen-tts",
    "input": {
        "text": "Hello, world!",
        "voice": "Chelsie"
    }
}'
```

### API配置结构
```javascript
// config.js
tts: {
  enabled: true,
  apiKey: "sk-d8fa10db341a41f189d582a7486841c7",
  baseUrl: "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation",
  model: "qwen-tts",
  timeout: 10000,
  retryTimes: 1,
  voice: "samantha",
  format: "wav",
  speed: 1.0,
  volume: 1.0
}
```

### 请求/响应格式
**请求格式：**
```javascript
{
  "model": "qwen-tts",
  "input": {
    "text": "要合成的文本",
    "voice": "Chelsie"
  }
}
```

**响应格式：**
```javascript
{
  "output": {
    "audio_url": "https://..."
  }
}
```

## 相关配置

### 微信小程序配置
确保在微信小程序后台配置以下合法域名：
```
https://dashscope.aliyuncs.com
```

### 支持的声音选项
根据API文档，支持的voice选项包括：
- Chelsie（推荐）
- 其他官方支持的声音

## 注意事项

### 开发环境
- 测试通过，功能正常
- 需要在微信小程序真机环境中进一步验证

### 生产环境
- 确保API密钥安全性
- 监控API调用频率和成功率
- 配置适当的错误处理和重试机制

### 性能考虑
- 新API响应时间可能有所不同
- 建议实现音频预加载机制
- 合理使用缓存减少API调用

## 经验总结

### 问题排查方法
1. **查阅最新API文档**：确认当前使用的API版本和端点
2. **对比官方示例**：检查请求格式是否符合规范
3. **逐步调试验证**：从配置到请求的完整流程
4. **监控API响应**：分析错误码和响应内容

### 预防措施
1. **定期更新API文档**：跟踪官方API变更
2. **版本管理**：记录API版本和配置变更
3. **完善测试覆盖**：包含端到端的API调用测试
4. **监控告警**：设置API调用失败告警

## 后续优化

### 短期优化
- [ ] 添加API版本检测机制
- [ ] 完善错误日志记录
- [ ] 优化重试策略
- [ ] 测试更多voice选项

### 长期优化
- [ ] 实现API配置热更新
- [ ] 添加API性能监控
- [ ] 优化缓存策略
- [ ] 实现多API端点支持

---

**修复时间：** 2024年12月19日  
**修复状态：** ✅ 已完成  
**测试状态：** ✅ 全部通过  
**部署状态：** 🟡 待部署验证