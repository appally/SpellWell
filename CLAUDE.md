# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

SpellWell（单词小超人）是一个微信小程序，专为6-12岁小学生设计的英语单词学习应用。核心功能包括：
- 单词卡学习
- AI动态讲解
- 冒险地图进度追踪

## 开发环境

### 必需工具
- 微信开发者工具 (WeChat Developer Tools)
- 微信小程序开发环境

### 常用命令
由于这是微信小程序项目，主要通过微信开发者工具进行开发和调试：
- 在微信开发者工具中打开项目
- 使用工具内置的编译、预览、调试功能
- 真机调试需要扫码预览



## 项目架构

### 核心页面
- `pages/welcome/` - 欢迎页面，用户首次进入时展示
- `pages/adventure-map/` - 冒险地图，显示学习进度和关卡
- `pages/word-learning/` - 单词学习页面，包含AI讲解
- `pages/statistics/` - 学习统计页面，展示学习数据

### 核心服务架构
- **数据管理中心** (`utils/data-manager.js`): 统一管理用户数据、关卡进度、缓存机制
- **AI服务** (`utils/ai-service.js`): DeepSeek API集成，生成适合小学生的单词讲解
- **配置管理** (`utils/config.js`): 环境分离，开发/生产配置

### 数据存储与缓存
- **本地存储**: `wx.getStorageSync/setStorageSync` 用于用户档案、学习进度
- **内存缓存**: 5分钟缓存机制(数据管理器)，7天AI响应缓存
- **用户数据**: 存储在 `globalData.userProfile`，包含版本迁移机制(V1→V2)
- **云端存储**: 微信云开发数据库和存储

### API配置
- **DeepSeek API**: 生成单词讲解内容 (`sk-54a9c8c533e04a678a450d5fa14d07fc`)
- **Gemini API**: 备用AI服务 (`AIzaSyCpLYj6Z-tu2hEQc4QWeAlhmbFylQ4Mm1M`)

## 开发约定

### 代码风格
- 使用2空格缩进（参考project.config.json中的editorSetting）
- 遵循微信小程序开发规范
- 页面文件使用Page()构造器
- 工具函数使用module.exports导出

### 文件命名
- 页面文件夹名与页面路由一致
- 样式文件使用.wxss后缀
- 模板文件使用.wxml后缀
- 逻辑文件使用.js后缀

### 重要注意事项
- 项目包含API密钥，开发时注意保护敏感信息
- 核心学习功能基于AI讲解和简单交互
- 产品需求详见 `_readme/prd.md`

## 产品特色功能

### 核心学习流程
1. 用户在冒险地图上遇到单词关卡
2. 点击关卡展示单词卡片
3. AI动态生成适合儿童的讲解内容
4. 用户确认学习完成后在地图上前进

### 技术实现要点
- **AI讲解**: 已优化儿童语言特点，开发环境有模拟响应
- **游戏化**: 基于VDS设计系统，支持动画和交互
- **数据备份**: 实现原子性保存和版本迁移机制

## 重要开发指导

### 环境配置
- 开发环境会使用模拟AI响应
- 生产环境需要配置域名白名单和API密钥
- **云开发环境配置**:
  - 确保在微信开发者工具中创建了云开发环境
  - 环境ID需要在 `project.config.json` 和 `app.js` 中保持一致

### 服务依赖关系
所有服务都实现了渐进式降级策略：
- AI服务 → 预设讲解内容


### 性能优化
- 使用多层缓存减少API调用
- 预加载和批处理机制
- 5分钟内存缓存避免重复读取

### 用户体验
- 针对小学生的简化交互设计
- 渐进式学习追踪
- 成就系统支持