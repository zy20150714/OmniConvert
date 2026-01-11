const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { pdfToWord } = require('../converters/pdf2word');
const { magick } = require('../config/toolPaths');

const uploadDir = path.join(__dirname, '../../tmp/uploads');
const outputDir = path.join(__dirname, '../../tmp/outputs');

// 确保输出目录存在
fs.mkdirSync(outputDir, { recursive: true });

/**
 * 文档转换路由
 * POST /api/convert/document
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
      case 'pdf':
        conversionResult = await handlePdfConversion(inputPath, outputPath, targetFormat);
        break;
      
      case 'doc':
      case 'docx':
        conversionResult = await handleWordConversion(inputPath, outputPath, targetFormat);
        break;
      
      case 'xls':
      case 'xlsx':
        conversionResult = await handleExcelConversion(inputPath, outputPath, targetFormat);
        break;
      
      case 'ppt':
      case 'pptx':
        conversionResult = await handlePptConversion(inputPath, outputPath, targetFormat);
        break;
      
      case 'epub':
      case 'mobi':
      case 'azw3':
      case 'txt':
      case 'rtf':
        conversionResult = await handleEbookConversion(inputPath, outputPath, targetFormat);
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
    console.error('文档转换失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '转换失败', 
      error: error.message 
    });
  }
});

/**
 * 处理PDF转换
 * @param {string} inputPath - 输入PDF文件路径
 * @param {string} outputPath - 输出文件路径
 * @param {string} targetFormat - 目标格式
 */
const handlePdfConversion = async (inputPath, outputPath, targetFormat) => {
  switch (targetFormat) {
    case 'doc':
    case 'docx':
      // 使用PDF转Word转换器
      return await pdfToWord(inputPath, outputPath);
    
    case 'xls':
    case 'xlsx':
      // 使用LibreOffice转换PDF到Excel
      return await executeLibreOfficeCommand(inputPath, outputPath, targetFormat);
    
    case 'ppt':
    case 'pptx':
      // 使用LibreOffice转换PDF到PPT
      return await executeLibreOfficeCommand(inputPath, outputPath, targetFormat);
    
    case 'jpg':
    case 'png':
      // 使用ImageMagick转换PDF到图片
      return await executeImageMagickCommand(inputPath, outputPath, targetFormat);
    
    case 'txt':
      // 使用pdftotext转换PDF到TXT
      return await executePdftotextCommand(inputPath, outputPath);
    
    default:
      return { success: false, message: `不支持的PDF转换格式: ${targetFormat}` };
  }
};

/**
 * 处理Word转换
 * @param {string} inputPath - 输入Word文件路径
 * @param {string} outputPath - 输出文件路径
 * @param {string} targetFormat - 目标格式
 */
const handleWordConversion = async (inputPath, outputPath, targetFormat) => {
  switch (targetFormat) {
    case 'pdf':
      // 使用LibreOffice转换Word到PDF
      return await executeLibreOfficeCommand(inputPath, outputPath, targetFormat);
    
    case 'txt':
      // 使用LibreOffice转换Word到TXT
      return await executeLibreOfficeCommand(inputPath, outputPath, targetFormat);
    
    case 'rtf':
      // 使用LibreOffice转换Word到RTF
      return await executeLibreOfficeCommand(inputPath, outputPath, targetFormat);
    
    default:
      return { success: false, message: `不支持的Word转换格式: ${targetFormat}` };
  }
};

/**
 * 处理Excel转换
 * @param {string} inputPath - 输入Excel文件路径
 * @param {string} outputPath - 输出文件路径
 * @param {string} targetFormat - 目标格式
 */
const handleExcelConversion = async (inputPath, outputPath, targetFormat) => {
  switch (targetFormat) {
    case 'pdf':
      // 使用LibreOffice转换Excel到PDF
      return await executeLibreOfficeCommand(inputPath, outputPath, targetFormat);
    
    case 'csv':
      // 使用LibreOffice转换Excel到CSV
      return await executeLibreOfficeCommand(inputPath, outputPath, targetFormat);
    
    case 'html':
      // 使用LibreOffice转换Excel到HTML
      return await executeLibreOfficeCommand(inputPath, outputPath, targetFormat);
    
    default:
      return { success: false, message: `不支持的Excel转换格式: ${targetFormat}` };
  }
};

/**
 * 处理PPT转换
 * @param {string} inputPath - 输入PPT文件路径
 * @param {string} outputPath - 输出文件路径
 * @param {string} targetFormat - 目标格式
 */
const handlePptConversion = async (inputPath, outputPath, targetFormat) => {
  switch (targetFormat) {
    case 'pdf':
      // 使用LibreOffice转换PPT到PDF
      return await executeLibreOfficeCommand(inputPath, outputPath, targetFormat);
    
    case 'jpg':
    case 'png':
      // 使用LibreOffice转换PPT到图片
      return await executeLibreOfficeCommand(inputPath, outputPath, targetFormat);
    
    default:
      return { success: false, message: `不支持的PPT转换格式: ${targetFormat}` };
  }
};

/**
 * 处理电子书转换
 * @param {string} inputPath - 输入电子书文件路径
 * @param {string} outputPath - 输出文件路径
 * @param {string} targetFormat - 目标格式
 */
const handleEbookConversion = async (inputPath, outputPath, targetFormat) => {
  // 使用Calibre的ebook-convert工具进行电子书转换
  return await executeEbookConvertCommand(inputPath, outputPath, targetFormat);
};

/**
 * 执行LibreOffice转换命令
 * @param {string} inputPath - 输入文件路径
 * @param {string} outputPath - 输出文件路径
 * @param {string} targetFormat - 目标格式
 */
const executeLibreOfficeCommand = (inputPath, outputPath, targetFormat) => {
  return new Promise((resolve) => {
    const outputDirPath = path.dirname(outputPath);
    let command = '';
    
    // 根据操作系统选择不同的命令
    if (process.platform === 'win32') {
      // Windows系统
      command = `libreoffice --headless --convert-to ${targetFormat} "${inputPath}" --outdir "${outputDirPath}"`;
    } else if (process.platform === 'darwin') {
      // macOS系统
      command = `/Applications/LibreOffice.app/Contents/MacOS/soffice --headless --convert-to ${targetFormat} "${inputPath}" --outdir "${outputDirPath}"`;
    } else {
      // Linux系统
      command = `libreoffice --headless --convert-to ${targetFormat} "${inputPath}" --outdir "${outputDirPath}"`;
    }
    
    console.log(`执行LibreOffice命令: ${command}`);
    
    exec(command, { timeout: 300000 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`LibreOffice转换失败: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        
        let errorMsg = '转换失败，请检查文件是否损坏或格式不支持';
        if (stderr.includes('Error loading document')) {
          errorMsg = '文件头损坏，请重新上传';
        } else if (stderr.includes('Timeout')) {
          errorMsg = '转换超时，请尝试较小的文件';
        }
        
        return resolve({ success: false, message: errorMsg, error: stderr });
      }
      
      // LibreOffice会生成与输入文件同名的输出文件
      const generatedOutputPath = path.join(outputDirPath, `${path.basename(inputPath, path.extname(inputPath))}.${targetFormat}`);
      
      if (fs.existsSync(generatedOutputPath)) {
        // 如果生成的文件名与目标文件名不同，则重命名
        if (generatedOutputPath !== outputPath) {
          fs.renameSync(generatedOutputPath, outputPath);
        }
        
        return resolve({ 
          success: true, 
          message: '转换成功', 
          outputPath: outputPath 
        });
      } else {
        return resolve({ 
          success: false, 
          message: '转换成功，但未找到输出文件',
          error: 'Output file not found' 
        });
      }
    });
  });
};

/**
 * 执行ImageMagick转换命令
 * @param {string} inputPath - 输入文件路径
 * @param {string} outputPath - 输出文件路径
 * @param {string} targetFormat - 目标格式
 */
const executeImageMagickCommand = (inputPath, outputPath, targetFormat) => {
  return new Promise((resolve) => {
    // 使用magick命令将PDF转换为图片（Windows系统上convert是内置命令，容易冲突）
    // 注意：PDF转图片会生成多个文件，这里只处理第一页
    const tempOutputPath = `${outputPath.replace('.', '-%d.')}`;
    const command = `"${magick}" -density 300 "${inputPath}" -quality 90 "${tempOutputPath}"`;
    
    console.log(`执行ImageMagick命令: ${command}`);
    
    exec(command, { timeout: 300000 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`ImageMagick转换失败: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        return resolve({ success: false, message: '图片转换失败', error: stderr });
      }
      
      // 检查生成的文件是否存在（第一页）
      const firstPagePath = outputPath.replace('.', '-0.');
      if (fs.existsSync(firstPagePath)) {
        // 将第一页重命名为目标文件名
        fs.renameSync(firstPagePath, outputPath);
        
        return resolve({ 
          success: true, 
          message: '图片转换成功', 
          outputPath: outputPath 
        });
      } else {
        return resolve({ 
          success: false, 
          message: '图片转换成功，但未找到输出文件',
          error: 'Output file not found' 
        });
      }
    });
  });
};

/**
 * 执行pdftotext转换命令
 * @param {string} inputPath - 输入PDF文件路径
 * @param {string} outputPath - 输出TXT文件路径
 */
const executePdftotextCommand = (inputPath, outputPath) => {
  return new Promise((resolve) => {
    const command = `pdftotext "${inputPath}" "${outputPath}"`;
    
    console.log(`执行pdftotext命令: ${command}`);
    
    exec(command, { timeout: 300000 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`pdftotext转换失败: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        return resolve({ success: false, message: 'PDF转TXT失败', error: stderr });
      }
      
      if (fs.existsSync(outputPath)) {
        return resolve({ 
          success: true, 
          message: 'PDF转TXT成功', 
          outputPath: outputPath 
        });
      } else {
        return resolve({ 
          success: false, 
          message: 'PDF转TXT成功，但未找到输出文件',
          error: 'Output file not found' 
        });
      }
    });
  });
};

/**
 * 执行ebook-convert转换命令（Calibre）
 * @param {string} inputPath - 输入电子书文件路径
 * @param {string} outputPath - 输出电子书文件路径
 * @param {string} targetFormat - 目标格式
 */
const executeEbookConvertCommand = (inputPath, outputPath, targetFormat) => {
  return new Promise((resolve) => {
    const command = `ebook-convert "${inputPath}" "${outputPath}"`;
    
    console.log(`执行ebook-convert命令: ${command}`);
    
    exec(command, { timeout: 300000 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`ebook-convert转换失败: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        return resolve({ success: false, message: '电子书转换失败', error: stderr });
      }
      
      if (fs.existsSync(outputPath)) {
        return resolve({ 
          success: true, 
          message: '电子书转换成功', 
          outputPath: outputPath 
        });
      } else {
        return resolve({ 
          success: false, 
          message: '电子书转换成功，但未找到输出文件',
          error: 'Output file not found' 
        });
      }
    });
  });
};

module.exports = router;
