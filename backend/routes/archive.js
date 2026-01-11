const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const uploadDir = path.join(__dirname, '../../tmp/uploads');
const outputDir = path.join(__dirname, '../../tmp/outputs');

fs.mkdirSync(outputDir, { recursive: true });

router.post('/', async (req, res) => {
  const { fileName, originalName, targetFormat, options } = req.body;
  
  if (!fileName || !targetFormat) {
    return res.status(400).json({ success: false, message: '缺少必要参数' });
  }

  const inputPath = path.join(uploadDir, fileName);
  const baseName = path.basename(fileName, path.extname(fileName));
  const outputFileName = `${baseName}.${targetFormat}`;
  const outputPath = path.join(outputDir, outputFileName);
  
  const inputExt = path.extname(fileName).toLowerCase().replace('.', '');
  
  try {
    if (!fs.existsSync(inputPath)) {
      return res.status(404).json({ success: false, message: '输入文件不存在' });
    }

    let conversionResult;
    
    if (['zip', 'rar', '7z'].includes(inputExt)) {
      conversionResult = await handleArchiveConversion(inputPath, outputPath, targetFormat, options);
    } else {
      return res.status(400).json({ 
        success: false, 
        message: `不支持的输入格式: ${inputExt}` 
      });
    }
    
    if (conversionResult.success) {
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
    console.error('压缩文件处理失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '处理失败', 
      error: error.message 
    });
  }
});

const handleArchiveConversion = async (inputPath, outputPath, targetFormat, options = {}) => {
  switch (targetFormat) {
    case 'extract':
      return await executeArchiveExtract(inputPath, outputPath, options);
    
    case 'zip':
      return await executeArchiveCompress(inputPath, outputPath, options);
    
    default:
      return { success: false, message: `不支持的压缩操作: ${targetFormat}` };
  }
};

const executeArchiveExtract = (inputPath, outputPath, options = {}) => {
  return new Promise((resolve) => {
    const inputExt = path.extname(inputPath).toLowerCase().replace('.', '');
    let command = '';
    
    switch (inputExt) {
      case 'zip':
        command = `unzip -o "${inputPath}" -d "${outputPath}"`;
        break;
      
      case 'rar':
        command = `unrar x -o+ "${inputPath}" "${outputPath}"`;
        break;
      
      case '7z':
        command = `7z x -o"${outputPath}" -y "${inputPath}"`;
        break;
      
      default:
        return resolve({ success: false, message: `不支持的压缩格式: ${inputExt}` });
    }
    
    console.log(`执行解压命令: ${command}`);
    
    exec(command, { timeout: 600000 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`解压失败: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        
        let errorMsg = '解压失败，请检查文件是否损坏或密码保护';
        if (stderr.includes('password') || stderr.includes('Password')) {
          errorMsg = '文件需要密码，暂不支持密码保护的压缩文件';
        }
        
        return resolve({ success: false, message: errorMsg, error: stderr });
      }
      
      fs.mkdirSync(outputPath, { recursive: true });
      
      return resolve({ 
        success: true, 
        message: '解压成功', 
        outputPath: outputPath 
      });
    });
  });
};

const executeArchiveCompress = (inputPath, outputPath, options = {}) => {
  return new Promise((resolve) => {
    const command = `zip -r "${outputPath}" "${inputPath}"`;
    
    console.log(`执行压缩命令: ${command}`);
    
    exec(command, { timeout: 600000 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`压缩失败: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        return resolve({ success: false, message: '压缩失败', error: stderr });
      }
      
      if (fs.existsSync(outputPath)) {
        return resolve({ 
          success: true, 
          message: '压缩成功', 
          outputPath: outputPath 
        });
      } else {
        return resolve({ 
          success: false, 
          message: '压缩成功，但未找到输出文件',
          error: 'Output file not found' 
        });
      }
    });
  });
};

module.exports = router;
