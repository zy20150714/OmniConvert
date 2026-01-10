const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const uploadDir = path.join(__dirname, '../../tmp/uploads');
const outputDir = path.join(__dirname, '../../tmp/outputs');

// 确保输出目录存在
fs.mkdirSync(outputDir, { recursive: true });

/**
 * 视频转换路由
 * POST /api/convert/video
 * @param {string} fileName - 上传的文件名
 * @param {string} originalName - 原始文件名
 * @param {string} targetFormat - 目标格式
 */
router.post('/', async (req, res) => {
  const { fileName, originalName, targetFormat } = req.body;
  
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
    switch (inputExt) {
      case 'mp4':
      case 'avi':
      case 'mkv':
      case 'mov':
      case 'flv':
      case 'webm':
        conversionResult = await handleVideoConversion(inputPath, outputPath, targetFormat);
        break;
      
      case 'gif':
        conversionResult = await handleGifConversion(inputPath, outputPath, targetFormat);
        break;
      
      default:
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
    console.error('视频转换失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '转换失败', 
      error: error.message 
    });
  }
});

/**
 * 处理视频转换
 * @param {string} inputPath - 输入视频文件路径
 * @param {string} outputPath - 输出文件路径
 * @param {string} targetFormat - 目标格式
 */
const handleVideoConversion = async (inputPath, outputPath, targetFormat) => {
  switch (targetFormat) {
    // 通用视频格式转换
    case 'avi':
    case 'mkv':
    case 'mov':
    case 'flv':
    case 'webm':
      return await executeVideoConvertCommand(inputPath, outputPath, targetFormat);
    
    // 提取音频
    case 'mp3':
    case 'aac':
    case 'wav':
      return await executeAudioExtractCommand(inputPath, outputPath, targetFormat);
    
    // 视频转GIF
    case 'gif':
      return await executeVideoToGifCommand(inputPath, outputPath);
    
    default:
      return { success: false, message: `不支持的视频转换格式: ${targetFormat}` };
  }
};

/**
 * 处理GIF转换
 * @param {string} inputPath - 输入GIF文件路径
 * @param {string} outputPath - 输出文件路径
 * @param {string} targetFormat - 目标格式
 */
const handleGifConversion = async (inputPath, outputPath, targetFormat) => {
  switch (targetFormat) {
    // GIF转视频
    case 'mp4':
      return await executeGifToVideoCommand(inputPath, outputPath);
    
    // GIF压缩
    case 'gif':
      return await executeGifCompressCommand(inputPath, outputPath);
    
    default:
      return { success: false, message: `不支持的GIF转换格式: ${targetFormat}` };
  }
};

/**
 * 执行视频格式转换命令
 * @param {string} inputPath - 输入视频文件路径
 * @param {string} outputPath - 输出视频文件路径
 * @param {string} targetFormat - 目标格式
 */
const executeVideoConvertCommand = (inputPath, outputPath, targetFormat) => {
  return new Promise((resolve) => {
    let command = '';
    
    // 根据目标格式选择不同的编码参数
    switch (targetFormat) {
      case 'avi':
        // MP4转AVI，使用libxvid编码
        command = `ffmpeg -i "${inputPath}" -c:v libxvid -q:v 4 -c:a libmp3lame -q:a 2 "${outputPath}"`;
        break;
      
      case 'mkv':
        // 视频转MKV，保持原始编码
        command = `ffmpeg -i "${inputPath}" -c copy "${outputPath}"`;
        break;
      
      case 'mov':
        // 视频转MOV，使用H.264编码
        command = `ffmpeg -i "${inputPath}" -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k "${outputPath}"`;
        break;
      
      case 'flv':
        // 视频转FLV，使用FLV1编码
        command = `ffmpeg -i "${inputPath}" -c:v flv1 -c:a mp3 "${outputPath}"`;
        break;
      
      case 'webm':
        // 视频转WEBM，使用VP9编码
        command = `ffmpeg -i "${inputPath}" -c:v libvpx-vp9 -crf 30 -b:v 0 -c:a libopus "${outputPath}"`;
        break;
      
      default:
        // 默认使用H.264编码
        command = `ffmpeg -i "${inputPath}" -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k "${outputPath}"`;
    }
    
    console.log(`执行视频转换命令: ${command}`);
    
    exec(command, { timeout: 600000 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`视频转换失败: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        
        let errorMsg = '视频转换失败，请检查文件是否损坏或格式不支持';
        if (stderr.includes('Invalid data found when processing input')) {
          errorMsg = '文件头损坏，请重新上传';
        } else if (stderr.includes('Error while decoding stream')) {
          errorMsg = '视频流解码错误，请尝试其他文件';
        }
        
        return resolve({ success: false, message: errorMsg, error: stderr });
      }
      
      if (fs.existsSync(outputPath)) {
        return resolve({ 
          success: true, 
          message: '视频转换成功', 
          outputPath: outputPath 
        });
      } else {
        return resolve({ 
          success: false, 
          message: '视频转换成功，但未找到输出文件',
          error: 'Output file not found' 
        });
      }
    });
  });
};

/**
 * 执行音频提取命令
 * @param {string} inputPath - 输入视频文件路径
 * @param {string} outputPath - 输出音频文件路径
 * @param {string} targetFormat - 目标格式
 */
const executeAudioExtractCommand = (inputPath, outputPath, targetFormat) => {
  return new Promise((resolve) => {
    let command = '';
    
    // 根据目标格式选择不同的编码参数
    switch (targetFormat) {
      case 'mp3':
        // 提取MP3音频
        command = `ffmpeg -i "${inputPath}" -vn -c:a libmp3lame -b:a 192k "${outputPath}"`;
        break;
      
      case 'aac':
        // 提取AAC音频
        command = `ffmpeg -i "${inputPath}" -vn -c:a aac -b:a 128k "${outputPath}"`;
        break;
      
      case 'wav':
        // 提取WAV音频（无损）
        command = `ffmpeg -i "${inputPath}" -vn -c:a pcm_s16le "${outputPath}"`;
        break;
      
      default:
        return resolve({ success: false, message: `不支持的音频格式: ${targetFormat}` });
    }
    
    console.log(`执行音频提取命令: ${command}`);
    
    exec(command, { timeout: 300000 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`音频提取失败: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        return resolve({ success: false, message: '音频提取失败', error: stderr });
      }
      
      if (fs.existsSync(outputPath)) {
        return resolve({ 
          success: true, 
          message: '音频提取成功', 
          outputPath: outputPath 
        });
      } else {
        return resolve({ 
          success: false, 
          message: '音频提取成功，但未找到输出文件',
          error: 'Output file not found' 
        });
      }
    });
  });
};

/**
 * 执行视频转GIF命令
 * @param {string} inputPath - 输入视频文件路径
 * @param {string} outputPath - 输出GIF文件路径
 */
const executeVideoToGifCommand = (inputPath, outputPath) => {
  return new Promise((resolve) => {
    // 视频转GIF命令，限制帧率和尺寸以控制文件大小
    const command = `ffmpeg -i "${inputPath}" -vf "fps=15,scale=640:-1:flags=lanczos" -c:v gif "${outputPath}"`;
    
    console.log(`执行视频转GIF命令: ${command}`);
    
    exec(command, { timeout: 600000 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`视频转GIF失败: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        return resolve({ success: false, message: '视频转GIF失败', error: stderr });
      }
      
      if (fs.existsSync(outputPath)) {
        return resolve({ 
          success: true, 
          message: '视频转GIF成功', 
          outputPath: outputPath 
        });
      } else {
        return resolve({ 
          success: false, 
          message: '视频转GIF成功，但未找到输出文件',
          error: 'Output file not found' 
        });
      }
    });
  });
};

/**
 * 执行GIF转视频命令
 * @param {string} inputPath - 输入GIF文件路径
 * @param {string} outputPath - 输出视频文件路径
 */
const executeGifToVideoCommand = (inputPath, outputPath) => {
  return new Promise((resolve) => {
    // GIF转MP4命令
    const command = `ffmpeg -i "${inputPath}" -c:v libx264 -crf 23 -pix_fmt yuv420p "${outputPath}"`;
    
    console.log(`执行GIF转视频命令: ${command}`);
    
    exec(command, { timeout: 300000 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`GIF转视频失败: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        return resolve({ success: false, message: 'GIF转视频失败', error: stderr });
      }
      
      if (fs.existsSync(outputPath)) {
        return resolve({ 
          success: true, 
          message: 'GIF转视频成功', 
          outputPath: outputPath 
        });
      } else {
        return resolve({ 
          success: false, 
          message: 'GIF转视频成功，但未找到输出文件',
          error: 'Output file not found' 
        });
      }
    });
  });
};

/**
 * 执行GIF压缩命令
 * @param {string} inputPath - 输入GIF文件路径
 * @param {string} outputPath - 输出压缩后的GIF文件路径
 */
const executeGifCompressCommand = (inputPath, outputPath) => {
  return new Promise((resolve) => {
    // 使用gifsicle工具压缩GIF
    const command = `gifsicle --optimize=3 "${inputPath}" -o "${outputPath}"`;
    
    console.log(`执行GIF压缩命令: ${command}`);
    
    exec(command, { timeout: 300000 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`GIF压缩失败: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        return resolve({ success: false, message: 'GIF压缩失败', error: stderr });
      }
      
      if (fs.existsSync(outputPath)) {
        return resolve({ 
          success: true, 
          message: 'GIF压缩成功', 
          outputPath: outputPath 
        });
      } else {
        return resolve({ 
          success: false, 
          message: 'GIF压缩成功，但未找到输出文件',
          error: 'Output file not found' 
        });
      }
    });
  });
};

module.exports = router;
