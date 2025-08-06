# SpellWell - 智能英语拼写学习小程序

<div align="center">

![SpellWell Logo](images/logo.png)

**一个专为儿童设计的智能英语拼写学习微信小程序**

[![微信小程序](https://img.shields.io/badge/微信-小程序-green.svg)](https://developers.weixin.qq.com/miniprogram/dev/framework/)
[![腾讯云开发](https://img.shields.io/badge/腾讯云-CloudBase-blue.svg)](https://cloud.tencent.com/product/tcb)

</div>

## 📱 产品简介

SpellWell是一款专为小学生设计的英语拼写学习小程序，采用游戏化的冒险地图模式，让孩子在轻松愉快的氛围中掌握英语单词拼写技能。

### ✨ 核心特色

- 🎮 **冒险地图模式** - 20个精心设计的关卡，循序渐进
- 🤖 **AI智能解释** - 个性化单词学习解释和发音指导
- 🎵 **真人语音** - 标准美式发音，支持单词和句子朗读
- 📊 **学习统计** - 详细的学习进度和成绩分析
- 🎨 **儿童友好界面** - 可爱的设计风格，符合儿童审美
- 🔄 **智能复习** - 根据掌握程度自动安排复习内容

## 🏗️ 技术架构

### 前端技术栈
- **框架**: 微信小程序原生开发
- **样式**: WXSS + Neo-Brutalism设计系统
- **状态管理**: 原生数据绑定 + 本地存储

### 后端服务
- **云开发**: 腾讯云CloudBase
- **云函数**: Node.js
- **数据库**: 云数据库
- **存储**: 云存储 + 静态网站托管

### AI服务集成
- **语音合成**: 讯飞TTS + 降级方案
- **智能解释**: 自研AI服务
- **语音识别**: 微信小程序原生能力

## 📂 项目结构

```
SpellWell/
├── pages/                  # 页面文件
│   ├── welcome/           # 欢迎页
│   ├── adventure-map/     # 冒险地图
│   ├── word-learning/     # 单词学习
│   ├── ai-explanation/    # AI解释页
│   └── statistics/        # 学习统计
├── utils/                 # 工具库
│   ├── word-library.js    # 核心词库
│   ├── ai-service.js      # AI服务
│   ├── audio-service.js   # 音频服务
│   ├── data-manager.js    # 数据管理
│   └── ...               # 其他工具
├── components/            # 组件库
├── cloudbase/            # 云开发配置
├── images/               # 图片资源
├── styles/               # 全局样式
├── app.js                # 应用入口
├── app.json             # 应用配置
└── app.wxss             # 全局样式
```

## 🚀 快速开始

### 环境要求
- 微信开发者工具 >= 1.05.0
- Node.js >= 14.0.0
- 腾讯云账号（用于云开发）

### 安装步骤

1. **克隆项目**
```bash
git clone [repository-url]
cd SpellWell
```

2. **配置云开发**
- 在腾讯云控制台创建云开发环境
- 在 `utils/config.js` 中配置环境ID
- 部署云函数到云开发环境

3. **导入小程序**
- 使用微信开发者工具导入项目
- 配置AppID
- 运行项目

### 本地开发

```bash
# 在微信开发者工具中打开项目
# 编译并预览
```

## 🎯 功能模块

### 1. 欢迎页面 (`pages/welcome/`)
- 应用介绍和启动引导
- 用户初始化设置

### 2. 冒险地图 (`pages/adventure-map/`)
- 20个关卡的游戏化展示
- 学习进度可视化
- 关卡解锁机制

### 3. 单词学习 (`pages/word-learning/`)
- 交互式拼写练习
- 实时语音反馈
- 错误提示和纠正

### 4. AI智能解释 (`pages/ai-explanation/`)
- 个性化单词解释
- 发音技巧指导
- 记忆方法推荐

### 5. 学习统计 (`pages/statistics/`)
- 学习进度统计
- 成绩分析图表
- 掌握度评估

## 🔧 核心工具库

### 词库系统 (`utils/word-library.js`)
- 包含小学阶段核心英语单词
- 按难度和主题分类
- 支持动态词汇分配

### AI服务 (`utils/ai-service.js`)
- 智能单词解释生成
- 学习建议推荐
- 缓存优化机制

### 音频服务 (`utils/audio-service.js`)
- 多重TTS服务支持
- 智能降级机制
- 缓存管理

### 数据管理 (`utils/data-manager.js`)
- 用户数据持久化
- 学习进度跟踪
- 统计数据分析

## 📊 学习体系

### 关卡设计
- **关卡1-5**: 基础字母和简单单词
- **关卡6-10**: 常用词汇和短语
- **关卡11-15**: 进阶词汇和语法
- **关卡16-20**: 综合应用和复习

### 难度系统
- 自适应难度调整
- 基于掌握度的个性化推荐
- 智能复习机制

## 🛠️ 开发工具

### 调试和测试
项目包含完整的测试工具（已移至temp_deleted/目录）：
- 单元测试文件
- 功能测试页面
- 性能测试工具

### 代码规范
- ESLint配置
- WXSS规范
- 组件化开发标准

## 📈 性能优化

- **资源压缩**: 图片和音频资源优化
- **缓存策略**: 多层缓存机制
- **懒加载**: 按需加载资源
- **代码分割**: 合理的代码组织

## 🔒 安全特性

- **数据加密**: 用户数据本地加密存储
- **权限控制**: 基于角色的访问控制
- **安全传输**: HTTPS + 数据签名验证

## 📋 部署指南

### 云开发部署
1. 配置云开发环境
2. 部署云函数
3. 配置数据库权限
4. 部署静态资源

### 小程序发布
1. 代码审核和测试
2. 版本管理
3. 提交审核
4. 正式发布

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

### 开发流程
1. Fork项目
2. 创建特性分支
3. 提交更改
4. 创建Pull Request

### 代码风格
- 遵循ESLint规则
- 使用语义化命名
- 添加必要注释

## 📄 许可证

本项目采用 [MIT License](LICENSE)

## 📞 联系我们

- **问题反馈**: [GitHub Issues](https://github.com/[username]/SpellWell/issues)
- **功能建议**: [GitHub Discussions](https://github.com/[username]/SpellWell/discussions)

---

<div align="center">

**让每个孩子都能轻松掌握英语拼写！** 🌟

Made with ❤️ for children's education

</div>
