const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { ffmpeg } = require('../config/toolPaths');

const uploadDir = path.join(__dirname, '../../tmp/uploads');
const outputDir = path.join(__dirname, '../../tmp/outputs');

// 确保输出目录存在
fs.mkdirSync(outputDir, { recursive: true });

/**
 * 音频转换路由
 * POST /api/convert/audio
 * @param {string} fileName - 上传的文件名
 * @param {string} originalName - 原始文件名
 * @param {string} targetFormat - 目标格式
 */
router.post('/', async (req, res) => {
  const { fileName, originalName, targetFormat, options } = req.body;
  
  if (!fileName || !targetFormat) {
    return res.status(400).json({ success: false, message: '缺少必要参数' });
  }

  const inputPath = path.join(uploadDir, fileName);
  const baseName = path.basename(fileName, path.extname(fileName));
  const outputFileName = `${baseName}.${targetFormat}`;
  const outputPath = path.join(outputDir, outputFileName);
  
  // 获取输入文件扩展名
  const inputExt = path.extname(fileName).toLowerCase().replace('.', '');
  
  try {
    // 检查输入文件是否存在
    if (!fs.existsSync(inputPath)) {
      return res.status(404).json({ success: false, message: '输入文件不存在' });
    }

    let conversionResult;
    
    // 根据输入格式和目标格式选择转换方式
    if (inputExt === 'mp3' || inputExt === 'wav' || inputExt === 'flac' || inputExt === 'm4a' || inputExt === 'ogg') {
      conversionResult = await handleAudioConversion(inputPath, outputPath, targetFormat, options);
    } else {
      return res.status(400).json({ 
        success: false, 
        message: `不支持的输入格式: ${inputExt}` 
      });
    }
    
    if (conversionResult.success) {
      // 生成下载链接
      const downloadUrl = `${req.protocol}://${req.get('host')}/outputs/${outputFileName}`;
      
      res.json({
        success: true,
        message: '转换成功',
        outputPath: conversionResult.outputPath,
        downloadUrl: downloadUrl,
        fileName: outputFileName
      });
    } else {
      res.status(500).json({
        success: false,
        message: conversionResult.message,
        error: conversionResult.error
      });
    }
  } catch (error) {
    console.error('音频转换失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '转换失败', 
      error: error.message 
    });
  }
});

/**
 * 处理音频转换
 * @param {string} inputPath - 输入音频文件路径
 * @param {string} outputPath - 输出文件路径
 * @param {string} targetFormat - 目标格式
 * @param {object} options - 转换选项
 */
const handleAudioConversion = async (inputPath, outputPath, targetFormat, options = {}) => {
  // 检查是否是格式互转
  const formatConvert = ['mp3', 'wav', 'flac', 'm4a', 'ogg'].includes(targetFormat);
  
  if (formatConvert) {
    // 音频格式互转
    return await executeAudioFormatConvert(inputPath, outputPath, targetFormat);
  } else {
    // 音频处理操作
    switch (targetFormat) {
      case 'cut':
        // 音频剪切
        return await executeAudioCut(inputPath, outputPath, options);
      
      case 'merge':
        // 音频合并（暂不支持，需要多个文件）
        return { success: false, message: '音频合并功能暂未实现' };
      
      case 'denoise':
        // 音频降噪
        return await executeAudioDenoise(inputPath, outputPath);
      
      case 'volume':
        // 调整音量
        return await executeAudioVolume(inputPath, outputPath, options);
      
      default:
        return { success: false, message: `不支持的音频操作: ${targetFormat}` };
    }
  }
};

/**
 * 执行音频格式转换
 * @param {string} inputPath - 输入音频文件路径
 * @param {string} outputPath - 输出音频文件路径
 * @param {string} targetFormat - 目标格式
 */
const executeAudioFormatConvert = (inputPath, outputPath, targetFormat) => {
  return new Promise((resolve) => {
    let command = '';
    
    // 根据目标格式选择不同的编码参数
    switch (targetFormat) {
      case 'mp3':
        // 转换为MP3格式
        command = `"${ffmpeg}" -i "${inputPath}" -codec:a libmp3lame -qscale:a 2 "${outputPath}"`;
        break;
      
      case 'wav':
        // 转换为WAV格式
        command = `"${ffmpeg}" -i "${inputPath}" -codec:a pcm_s16le "${outputPath}"`;
        break;
      
      case 'flac':
        // 转换为FLAC格式
        command = `"${ffmpeg}" -i "${inputPath}" -codec:a flac "${outputPath}"`;
        break;
      
      case 'm4a':
        // 转换为M4A格式
        command = `"${ffmpeg}" -i "${inputPath}" -codec:a aac -b:a 128k "${outputPath}"`;
        break;
      
      case 'ogg':
        // 转换为OGG格式
        command = `"${ffmpeg}" -i "${inputPath}" -codec:a libvorbis -qscale:a 6 "${outputPath}"`;
        break;
      
      default:
        return resolve({ success: false, message: `不支持的音频格式: ${targetFormat}` });
    }
    
    console.log(`执行音频格式转换命令: ${command}`);
    
    exec(command, { timeout: 300000 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`音频格式转换失败: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        
        let errorMsg = '音频格式转换失败，请检查文件是否损坏或格式不支持';
        if (stderr.includes('Invalid data found when processing input')) {
          errorMsg = '文件头损坏，请重新上传';
        }
        
        return resolve({ success: false, message: errorMsg, error: stderr });
      }
      
      if (fs.existsSync(outputPath)) {
        return resolve({ 
          success: true, 
          message: '音频格式转换成功', 
          outputPath: outputPath 
        });
      } else {
        return resolve({ 
          success: false, 
          message: '音频格式转换成功，但未找到输出文件',
          error: 'Output file not found' 
        });
      }
    });
  });
};

/**
 * 执行音频剪切
 * @param {string} inputPath - 输入音频文件路径
 * @param {string} outputPath - 输出音频文件路径
 * @param {object} options - 剪切选项，包含start和duration
 */
const executeAudioCut = (inputPath, outputPath, options) => {
  return new Promise((resolve) => {
    const { start = 0, duration } = options;
    
    let command = `"${ffmpeg}" -i "${inputPath}" -ss ${start}`;
    
    if (duration) {
      command += ` -t ${duration}`;
    }
    
    command += ` -acodec copy "${outputPath}"`;
    
    console.log(`执行音频剪切命令: ${command}`);
    
    exec(command, { timeout: 300000 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`音频剪切失败: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        return resolve({ success: false, message: '音频剪切失败', error: stderr });
      }
      
      if (fs.existsSync(outputPath)) {
        return resolve({ 
          success: true, 
          message: '音频剪切成功', 
          outputPath: outputPath 
        });
      } else {
        return resolve({ 
          success: false, 
          message: '音频剪切成功，但未找到输出文件',
          error: 'Output file not found' 
        });
      }
    });
  });
};

/**
 * 执行音频降噪
 * @param {string} inputPath - 输入音频文件路径
 * @param {string} outputPath - 输出音频文件路径
 */
const executeAudioDenoise = (inputPath, outputPath) => {
  return new Promise((resolve) => {
    // 使用FFmpeg的afftdn滤镜进行基础降噪
    const command = `"${ffmpeg}" -i "${inputPath}" -af afftdn=nf=-25 "${outputPath}"`;
    
    console.log(`执行音频降噪命令: ${command}`);
    
    exec(command, { timeout: 300000 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`音频降噪失败: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        return resolve({ success: false, message: '音频降噪失败', error: stderr });
      }
      
      if (fs.existsSync(outputPath)) {
        return resolve({ 
          success: true, 
          message: '音频降噪成功', 
          outputPath: outputPath 
        });
      } else {
        return resolve({ 
          success: false, 
          message: '音频降噪成功，但未找到输出文件',
          error: 'Output file not found' 
        });
      }
    });
  });
};

/**
 * 执行音量调整
 * @param {string} inputPath - 输入音频文件路径
 * @param {string} outputPath - 输出音频文件路径
 * @param {object} options - 音量选项，包含volume（倍数）
 */
const executeAudioVolume = (inputPath, outputPath, options) => {
  return new Promise((resolve) => {
    const { volume = 1.0 } = options;
    
    // 使用FFmpeg调整音量
    const command = `"${ffmpeg}" -i "${inputPath}" -af "volume=${volume}" "${outputPath}"`;
    
    console.log(`执行音量调整命令: ${command}`);
    
    exec(command, { timeout: 300000 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`音量调整失败: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        return resolve({ success: false, message: '音量调整失败', error: stderr });
      }
      
      if (fs.existsSync(outputPath)) {
        return resolve({ 
          success: true, 
          message: '音量调整成功', 
          outputPath: outputPath 
        });
      } else {
        return resolve({ 
          success: false, 
          message: '音量调整成功，但未找到输出文件',
          error: 'Output file not found' 
        });
      }
    });
  });
};

module.exports = router;
