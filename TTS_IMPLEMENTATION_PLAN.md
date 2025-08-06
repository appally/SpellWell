# 阿里云Qwen-TTS音频合成集成实施方案

## 项目概述

本方案旨在为SpellWell单词学习小程序集成阿里云Qwen-TTS语音合成功能，实现单词发音播放，提升用户学习体验。

## 技术架构

### 1. 核心组件

- **音频服务模块** (`utils/audio-service.js`)
  - 封装Qwen-TTS API调用
  - 管理音频缓存和播放
  - 提供降级方案

- **配置管理** (`utils/config.js`)
  - TTS API配置
  - 缓存策略配置
  - 环境变量管理

- **UI集成** (`pages/word-learning/`)
  - 发音按钮组件
  - 音频播放交互
  - 用户反馈处理

### 2. API集成方案

```javascript
// TTS API调用示例
const response = await wx.request({
  url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/audio/speech',
  method: 'POST',
  header: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer sk-d8fa10db341a41f189d582a7486841c7'
  },
  data: {
    model: 'qwen-tts',
    input: { text: 'hello' },
    voice: 'samantha',
    response_format: 'wav'
  }
})
```

## 已完成的开发任务

### ✅ 核心功能实现

1. **音频服务模块创建**
   - [x] `AudioService` 类实现
   - [x] Qwen-TTS API集成
   - [x] 音频缓存管理
   - [x] 微信小程序音频播放适配
   - [x] 错误处理和降级方案

2. **配置管理更新**
   - [x] TTS API配置项
   - [x] 音频缓存配置
   - [x] 环境变量管理

3. **UI界面集成**
   - [x] 发音按钮添加（学习模式）
   - [x] 发音按钮添加（默写模式）
   - [x] Neo-Brutalism风格样式
   - [x] 响应式交互效果

4. **页面逻辑集成**
   - [x] 音频服务引入
   - [x] 发音播放方法
   - [x] 预加载逻辑
   - [x] 资源清理机制

## 待完成的开发任务

### 🔄 测试和优化

1. **功能测试**
   - [ ] API连接测试
   - [ ] 音频播放测试
   - [ ] 缓存机制测试
   - [ ] 错误处理测试

2. **性能优化**
   - [ ] 预加载策略调优
   - [ ] 缓存大小优化
   - [ ] 网络请求优化

3. **用户体验优化**
   - [ ] 加载状态提示
   - [ ] 播放状态反馈
   - [ ] 网络异常处理

### 🚀 部署准备

1. **域名配置**
   - [ ] 微信小程序后台添加 `dashscope.aliyuncs.com` 到request合法域名
   - [ ] 测试域名访问权限

2. **安全配置**
   - [ ] 生产环境API Key管理
   - [ ] 后端代理服务（可选）
   - [ ] 请求频率限制

## 技术特性

### 1. 音频合成能力

- **支持格式**: WAV (24kHz采样率)
- **语音质量**: 高质量英文发音
- **响应速度**: 流式输出，快速响应
- **缓存策略**: 20小时有效期，智能缓存管理

### 2. 微信小程序适配

- **音频播放**: `wx.createInnerAudioContext()`
- **网络请求**: `wx.request()` API
- **缓存管理**: 内存缓存 + 本地存储
- **资源管理**: 自动清理，防止内存泄漏

### 3. 用户体验设计

- **即点即播**: 点击发音按钮立即播放
- **预加载**: 智能预加载后续单词发音
- **降级方案**: 网络异常时使用震动反馈
- **视觉反馈**: Neo-Brutalism风格按钮交互

## 配置说明

### 1. API配置

```javascript
// config.js 中的TTS配置
tts: {
  enabled: true,
  apiKey: "sk-d8fa10db341a41f189d582a7486841c7",
  baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  model: "qwen-tts",
  timeout: 10000,
  voice: "samantha", // 英文女声
  format: "wav",
  speed: 1.0,
  volume: 1.0
}
```

### 2. 缓存配置

```javascript
// 音频缓存策略
audio: {
  storage: {
    enabled: true,
    maxAge: 20 * 60 * 60 * 1000, // 20小时
    maxCacheSize: 50, // 最大50个文件
    keyPrefix: 'spellwell_audio_'
  },
  preload: {
    enabled: true,
    maxPreloadWords: 5,
    preloadOnLevelStart: true
  }
}
```

## 使用方法

### 1. 基础用法

```javascript
// 播放单词发音
const { playWordPronunciation } = require('../../utils/audio-service.js')

// 在页面中调用
onPlayPronunciation() {
  const word = this.data.currentWord.word
  playWordPronunciation(word)
}
```

### 2. 预加载用法

```javascript
// 预加载多个单词发音
const { preloadPronunciations } = require('../../utils/audio-service.js')

// 预加载单词列表
preloadPronunciations(['hello', 'world', 'apple'])
```

### 3. 资源清理

```javascript
// 页面卸载时清理资源
const { cleanupAudio } = require('../../utils/audio-service.js')

onUnload() {
  cleanupAudio()
}
```

## 注意事项

### 1. 域名配置要求

⚠️ **重要**: 必须在微信小程序后台配置以下域名为request合法域名：
- `https://dashscope.aliyuncs.com`

### 2. API使用限制

- **频率限制**: 建议控制在每小时50次以内
- **文本长度**: 单词发音，通常不超过20字符
- **并发请求**: 避免同时发起多个TTS请求

### 3. 缓存策略

- **URL有效期**: 阿里云返回的音频URL有效期为24小时
- **缓存时间**: 设置为20小时，留有安全边际
- **缓存大小**: 限制最大50个文件，避免内存溢出

### 4. 错误处理

- **网络异常**: 自动降级为震动反馈
- **API异常**: 显示友好提示信息
- **播放失败**: 提供重试机制

### 5. 性能优化

- **预加载策略**: 仅预加载当前和后续2个单词
- **资源清理**: 页面卸载时自动清理音频资源
- **内存管理**: 限制同时存在的音频实例数量

## 测试清单

### 功能测试

- [ ] 单词发音播放正常
- [ ] 音频缓存机制工作
- [ ] 预加载功能正常
- [ ] 网络异常降级方案
- [ ] 资源清理机制

### 兼容性测试

- [ ] iOS设备音频播放
- [ ] Android设备音频播放
- [ ] 不同网络环境测试
- [ ] 低内存设备测试

### 性能测试

- [ ] 音频加载速度
- [ ] 缓存命中率
- [ ] 内存使用情况
- [ ] 网络请求频率

## 部署步骤

### 1. 开发环境测试

1. 确保所有代码文件已更新
2. 在微信开发者工具中测试基础功能
3. 检查控制台日志，确认API调用正常

### 2. 域名配置

1. 登录微信小程序后台
2. 进入「开发管理」→「开发设置」
3. 在「服务器域名」中添加request合法域名：
   - `https://dashscope.aliyuncs.com`

### 3. 真机测试

1. 使用真机预览功能测试
2. 验证音频播放功能
3. 测试网络异常情况

### 4. 生产发布

1. 确认所有测试通过
2. 提交代码审核
3. 发布正式版本

## 监控和维护

### 1. 关键指标

- API调用成功率
- 音频播放成功率
- 缓存命中率
- 用户使用频率

### 2. 日志监控

- TTS API调用日志
- 音频播放错误日志
- 缓存性能日志
- 用户行为日志

### 3. 优化建议

- 根据使用数据调整缓存策略
- 优化预加载算法
- 改进错误处理机制
- 提升用户体验

## 总结

本实施方案已完成核心功能开发，包括音频服务模块、配置管理、UI集成等。主要特点：

1. **完整的技术架构**: 从API调用到UI展示的完整链路
2. **智能缓存策略**: 提升性能，减少API调用
3. **优雅的降级方案**: 确保在各种网络环境下的用户体验
4. **Neo-Brutalism设计**: 符合应用整体设计风格

接下来需要进行功能测试、域名配置和真机验证，确保功能稳定可靠后即可发布使用。