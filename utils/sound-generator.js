// utils/sound-generator.js
// 声音生成器 - 生成各种音效

/**
 * 生成成功音效 - 清脆的"叮"声
 * 使用Web Audio API动态生成，避免依赖外部音频文件
 */
function generateSuccessSound(audioContext) {
  if (!audioContext) {
    console.warn('AudioContext not available')
    return null
  }

  try {
    // 创建音频缓冲区（0.5秒）
    const sampleRate = audioContext.sampleRate
    const duration = 0.5
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate)
    const channelData = buffer.getChannelData(0)

    // 生成"叮"声波形
    for (let i = 0; i < channelData.length; i++) {
      const t = i / sampleRate
      
      // 主音调：800Hz的正弦波
      const mainTone = Math.sin(2 * Math.PI * 800 * t) * 0.6
      
      // 高频泛音：1600Hz的正弦波
      const overtone = Math.sin(2 * Math.PI * 1600 * t) * 0.3
      
      // 更高频泛音：2400Hz的正弦波
      const highOvertone = Math.sin(2 * Math.PI * 2400 * t) * 0.1
      
      // 指数衰减包络
      const envelope = Math.exp(-t * 8)
      
      // 合成最终波形
      channelData[i] = (mainTone + overtone + highOvertone) * envelope
    }

    return buffer
  } catch (error) {
    console.error('生成成功音效失败:', error)
    return null
  }
}

/**
 * 生成错误音效 - 低沉的"咚"声
 */
function generateErrorSound(audioContext) {
  if (!audioContext) {
    console.warn('AudioContext not available')
    return null
  }

  try {
    const sampleRate = audioContext.sampleRate
    const duration = 0.3
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate)
    const channelData = buffer.getChannelData(0)

    for (let i = 0; i < channelData.length; i++) {
      const t = i / sampleRate
      
      // 低频主音：200Hz
      const mainTone = Math.sin(2 * Math.PI * 200 * t) * 0.8
      
      // 轻微的噪音效果
      const noise = (Math.random() - 0.5) * 0.1
      
      // 快速衰减包络
      const envelope = Math.exp(-t * 12)
      
      channelData[i] = (mainTone + noise) * envelope
    }

    return buffer
  } catch (error) {
    console.error('生成错误音效失败:', error)
    return null
  }
}

/**
 * 生成按钮点击音效 - 轻快的"咔"声
 */
function generateClickSound(audioContext) {
  if (!audioContext) {
    console.warn('AudioContext not available')
    return null
  }

  try {
    const sampleRate = audioContext.sampleRate
    const duration = 0.1
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate)
    const channelData = buffer.getChannelData(0)

    for (let i = 0; i < channelData.length; i++) {
      const t = i / sampleRate
      
      // 高频短促声：1000Hz
      const tone = Math.sin(2 * Math.PI * 1000 * t) * 0.4
      
      // 急速衰减
      const envelope = Math.exp(-t * 50)
      
      channelData[i] = tone * envelope
    }

    return buffer
  } catch (error) {
    console.error('生成点击音效失败:', error)
    return null
  }
}

module.exports = {
  generateSuccessSound,
  generateErrorSound,
  generateClickSound
}