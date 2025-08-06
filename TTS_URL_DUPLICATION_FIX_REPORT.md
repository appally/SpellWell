# TTS API URL重复问题修复报告

## 问题描述

在微信小程序中调用Qwen-TTS生成语音时，出现404错误：

```
POST https://dashscope.aliyuncs.com/compatible-mode/v1/v1/audio/speech 404
```

### 错误现象
- API请求返回404状态码
- 语音合成功能完全失效
- 用户无法听到单词发音

## 问题分析

### 根本原因
URL路径中出现重复的 `/v1`，导致API端点错误：

**错误的URL：**
```
https://dashscope.aliyuncs.com/compatible-mode/v1/v1/audio/speech
```

**正确的URL：**
```
https://dashscope.aliyuncs.com/compatible-mode/v1/audio/speech
```

### 技术分析
1. **配置层面**：`config.js` 中 `baseUrl` 设置为 `https://dashscope.aliyuncs.com/compatible-mode/v1`
2. **代码层面**：`audio-service.js` 中API调用使用 `/v1/audio/speech` 端点
3. **结果**：两者拼接后产生重复的 `/v1` 路径

## 解决方案

### 修复步骤
1. 定位问题文件：`utils/audio-service.js`
2. 修改API端点路径：从 `/v1/audio/speech` 改为 `/audio/speech`
3. 验证修复效果

### 具体修改

**文件：** `utils/audio-service.js`

**修改前：**
```javascript
const response = await this.makeApiRequest('/v1/audio/speech', requestData)
```

**修改后：**
```javascript
const response = await this.makeApiRequest('/audio/speech', requestData)
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

### API配置结构
```javascript
// config.js
tts: {
  baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  // 其他配置...
}
```

### API调用流程
1. 获取配置中的 `baseUrl`
2. 拼接API端点路径
3. 发送HTTP请求
4. 处理响应数据

### 阿里云Qwen-TTS API规范
- **基础URL：** `https://dashscope.aliyuncs.com/compatible-mode/v1`
- **语音合成端点：** `/audio/speech`
- **完整URL：** `https://dashscope.aliyuncs.com/compatible-mode/v1/audio/speech`

## 相关配置

### 微信小程序配置
确保在微信小程序后台配置以下合法域名：
```
https://dashscope.aliyuncs.com
```

### API配置
```javascript
// utils/config.js
api: {
  tts: {
    enabled: true,
    apiKey: "sk-d8fa10db341a41f189d582a7486841c7",
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    model: "qwen-tts",
    voice: "samantha",
    format: "wav",
    speed: 1.0,
    volume: 1.0
  }
}
```

## 注意事项

### 开发环境
- 测试通过，功能正常
- 需要在微信小程序真机环境中进一步验证

### 生产环境
- 确保API密钥安全性
- 监控API调用频率和成功率
- 配置适当的错误处理和重试机制

### 性能考虑
- API响应时间通常在1-3秒
- 建议实现音频预加载机制
- 合理使用缓存减少API调用

## 经验总结

### 问题排查方法
1. **检查网络请求URL**：确认完整的请求地址
2. **分析配置拼接逻辑**：检查baseUrl和endpoint的组合
3. **对比API文档**：确认正确的端点路径
4. **逐步调试验证**：从配置到请求的完整流程

### 预防措施
1. **统一API配置管理**：避免路径拼接错误
2. **完善测试覆盖**：包含端到端的API调用测试
3. **文档同步更新**：确保配置文档与代码一致
4. **代码审查机制**：重点检查API相关修改

## 后续优化

### 短期优化
- [ ] 添加API URL验证机制
- [ ] 完善错误日志记录
- [ ] 优化重试策略

### 长期优化
- [ ] 实现API配置热更新
- [ ] 添加API性能监控
- [ ] 优化缓存策略
- [ ] 实现离线降级方案

---

**修复时间：** 2024年12月19日  
**修复状态：** ✅ 已完成  
**测试状态：** ✅ 全部通过  
**部署状态：** 🟡 待部署验证