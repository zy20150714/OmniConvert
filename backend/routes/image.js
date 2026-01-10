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
 * 图片转换路由
 * POST /api/convert/image
 * @param {string} fileName - 上传的文件名
 * @param {string} originalName - 原始文件名
 * @param {string} targetFormat - 目标格式
 * @param {object} options - 转换选项
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
    if (['heic', 'png', 'jpg', 'jpeg', 'webp', 'bmp', 'tiff'].includes(inputExt)) {
      conversionResult = await handleImageConversion(inputPath, outputPath, targetFormat, options);
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
    console.error('图片转换失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '转换失败', 
      error: error.message 
    });
  }
});

/**
 * 处理图片转换
 * @param {string} inputPath - 输入图片文件路径
 * @param {string} outputPath - 输出文件路径
 * @param {string} targetFormat - 目标格式
 * @param {object} options - 转换选项
 */
const handleImageConversion = async (inputPath, outputPath, targetFormat, options = {}) => {
  // 检查是否是格式互转
  const formatConvert = ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tiff', 'pdf'].includes(targetFormat);
  
  if (formatConvert) {
    // 图片格式互转
    return await executeImageFormatConvert(inputPath, outputPath, targetFormat);
  } else {
    // 图片操作
    switch (targetFormat) {
      case 'compress':
        // 图片压缩
        return await executeImageCompress(inputPath, outputPath, options);
      
      case 'crop':
        // 图片裁剪
        return await executeImageCrop(inputPath, outputPath, options);
      
      case 'rotate':
        // 图片旋转
        return await executeImageRotate(inputPath, outputPath, options);
      
      case 'watermark':
        // 图片加水印
        return await executeImageWatermark(inputPath, outputPath, options);
      
      default:
        return { success: false, message: `不支持的图片操作: ${targetFormat}` };
    }
  }
};

/**
 * 执行图片格式转换
 * @param {string} inputPath - 输入图片文件路径
 * @param {string} outputPath - 输出图片文件路径
 * @param {string} targetFormat - 目标格式
 */
const executeImageFormatConvert = (inputPath, outputPath, targetFormat) => {
  return new Promise((resolve) => {
    let command = '';
    
    // 根据目标格式选择不同的转换参数
    switch (targetFormat) {
      case 'jpg':
      case 'jpeg':
        // 转换为JPG格式，质量85
        command = `convert "${inputPath}" -quality 85 "${outputPath}"`;
        break;
      
      case 'png':
        // 转换为PNG格式
        command = `convert "${inputPath}" -quality 90 "${outputPath}"`;
        break;
      
      case 'webp':
        // 转换为WEBP格式，质量80
        command = `convert "${inputPath}" -quality 80 "${outputPath}"`;
        break;
      
      case 'bmp':
        // 转换为BMP格式
        command = `convert "${inputPath}" "${outputPath}"`;
        break;
      
      case 'tiff':
        // 转换为TIFF格式
        command = `convert "${inputPath}" "${outputPath}"`;
        break;
      
      case 'pdf':
        // 转换为PDF格式
        command = `convert "${inputPath}" "${outputPath}"`;
        break;
      
      default:
        return resolve({ success: false, message: `不支持的图片格式: ${targetFormat}` });
    }
    
    console.log(`执行图片格式转换命令: ${command}`);
    
    exec(command, { timeout: 300000 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`图片格式转换失败: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        
        let errorMsg = '图片格式转换失败，请检查文件是否损坏或格式不支持';
        if (stderr.includes('unrecognized image format')) {
          errorMsg = '无法识别的图片格式';
        } else if (stderr.includes('no decode delegate for this image format')) {
          errorMsg = '缺少相应的图片解码器';
        }
        
        return resolve({ success: false, message: errorMsg, error: stderr });
      }
      
      if (fs.existsSync(outputPath)) {
        return resolve({ 
          success: true, 
          message: '图片格式转换成功', 
          outputPath: outputPath 
        });
      } else {
        return resolve({ 
          success: false, 
          message: '图片格式转换成功，但未找到输出文件',
          error: 'Output file not found' 
        });
      }
    });
  });
};

/**
 * 执行图片压缩
 * @param {string} inputPath - 输入图片文件路径
 * @param {string} outputPath - 输出图片文件路径
 * @param {object} options - 压缩选项
 */
const executeImageCompress = (inputPath, outputPath, options) => {
  return new Promise((resolve) => {
    const { quality = 80, type = 'lossy' } = options;
    
    let command = '';
    
    if (type === 'lossless') {
      // 无损压缩
      command = `convert "${inputPath}" -strip -define png:compression-level=9 "${outputPath}"`;
    } else {
      // 有损压缩
      command = `convert "${inputPath}" -quality ${quality} -strip "${outputPath}"`;
    }
    
    console.log(`执行图片压缩命令: ${command}`);
    
    exec(command, { timeout: 300000 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`图片压缩失败: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        return resolve({ success: false, message: '图片压缩失败', error: stderr });
      }
      
      if (fs.existsSync(outputPath)) {
        return resolve({ 
          success: true, 
          message: '图片压缩成功', 
          outputPath: outputPath 
        });
      } else {
        return resolve({ 
          success: false, 
          message: '图片压缩成功，但未找到输出文件',
          error: 'Output file not found' 
        });
      }
    });
  });
};

/**
 * 执行图片裁剪
 * @param {string} inputPath - 输入图片文件路径
 * @param {string} outputPath - 输出图片文件路径
 * @param {object} options - 裁剪选项
 */
const executeImageCrop = (inputPath, outputPath, options) => {
  return new Promise((resolve) => {
    const { width, height, x = 0, y = 0 } = options;
    
    if (!width || !height) {
      return resolve({ success: false, message: '裁剪需要指定宽度和高度' });
    }
    
    // 图片裁剪命令
    const command = `convert "${inputPath}" -crop ${width}x${height}+${x}+${y} "${outputPath}"`;
    
    console.log(`执行图片裁剪命令: ${command}`);
    
    exec(command, { timeout: 300000 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`图片裁剪失败: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        return resolve({ success: false, message: '图片裁剪失败', error: stderr });
      }
      
      if (fs.existsSync(outputPath)) {
        return resolve({ 
          success: true, 
          message: '图片裁剪成功', 
          outputPath: outputPath 
        });
      } else {
        return resolve({ 
          success: false, 
          message: '图片裁剪成功，但未找到输出文件',
          error: 'Output file not found' 
        });
      }
    });
  });
};

/**
 * 执行图片旋转
 * @param {string} inputPath - 输入图片文件路径
 * @param {string} outputPath - 输出图片文件路径
 * @param {object} options - 旋转选项
 */
const executeImageRotate = (inputPath, outputPath, options) => {
  return new Promise((resolve) => {
    const { angle = 90 } = options;
    
    // 图片旋转命令
    const command = `convert "${inputPath}" -rotate ${angle} "${outputPath}"`;
    
    console.log(`执行图片旋转命令: ${command}`);
    
    exec(command, { timeout: 300000 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`图片旋转失败: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        return resolve({ success: false, message: '图片旋转失败', error: stderr });
      }
      
      if (fs.existsSync(outputPath)) {
        return resolve({ 
          success: true, 
          message: '图片旋转成功', 
          outputPath: outputPath 
        });
      } else {
        return resolve({ 
          success: false, 
          message: '图片旋转成功，但未找到输出文件',
          error: 'Output file not found' 
        });
      }
    });
  });
};

/**
 * 执行图片加水印
 * @param {string} inputPath - 输入图片文件路径
 * @param {string} outputPath - 输出图片文件路径
 * @param {object} options - 水印选项
 */
const executeImageWatermark = (inputPath, outputPath, options) => {
  return new Promise((resolve) => {
    const { text = 'Watermark', position = 'bottom-right', color = 'white', opacity = 0.5, size = 24 } = options;
    
    // 位置映射
    const positionMap = {
      'top-left': '+10+10',
      'top-right': '-10+10',
      'bottom-left': '+10-10',
      'bottom-right': '-10-10',
      'center': '-gravity center'
    };
    
    const gravity = positionMap[position] || positionMap['bottom-right'];
    
    // 图片加水印命令
    const command = `convert "${inputPath}" -font Arial -pointsize ${size} -fill "rgba(255,255,255,${opacity})" -gravity ${position} -annotate +10+10 "${text}" "${outputPath}"`;
    
    console.log(`执行图片加水印命令: ${command}`);
    
    exec(command, { timeout: 300000 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`图片加水印失败: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        return resolve({ success: false, message: '图片加水印失败', error: stderr });
      }
      
      if (fs.existsSync(outputPath)) {
        return resolve({ 
          success: true, 
          message: '图片加水印成功', 
          outputPath: outputPath 
        });
      } else {
        return resolve({ 
          success: false, 
          message: '图片加水印成功，但未找到输出文件',
          error: 'Output file not found' 
        });
      }
    });
  });
};

module.exports = router;
