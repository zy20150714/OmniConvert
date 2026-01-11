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
    
    if (['xlsx', 'xls', 'csv'].includes(inputExt)) {
      conversionResult = await handleTableConversion(inputPath, outputPath, targetFormat, options);
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
    console.error('表格转换失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '转换失败', 
      error: error.message 
    });
  }
});

const handleTableConversion = async (inputPath, outputPath, targetFormat, options = {}) => {
  switch (targetFormat) {
    case 'csv':
      return await executeTableConvert(inputPath, outputPath, 'csv');
    
    case 'html':
      return await executeTableConvert(inputPath, outputPath, 'html');
    
    case 'json':
      return await executeCsvToJson(inputPath, outputPath);
    
    case 'pdf':
      return await executeTableConvert(inputPath, outputPath, 'pdf');
    
    default:
      return { success: false, message: `不支持的表格转换格式: ${targetFormat}` };
  }
};

const executeTableConvert = (inputPath, outputPath, targetFormat) => {
  return new Promise((resolve) => {
    let command = '';
    
    switch (targetFormat) {
      case 'csv':
        command = `libreoffice --headless --convert-to csv "${inputPath}" --outdir "${path.dirname(outputPath)}"`;
        break;
      
      case 'html':
        command = `libreoffice --headless --convert-to html "${inputPath}" --outdir "${path.dirname(outputPath)}"`;
        break;
      
      case 'pdf':
        command = `libreoffice --headless --convert-to pdf "${inputPath}" --outdir "${path.dirname(outputPath)}"`;
        break;
      
      default:
        return resolve({ success: false, message: `不支持的表格格式: ${targetFormat}` });
    }
    
    console.log(`执行表格转换命令: ${command}`);
    
    exec(command, { timeout: 300000 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`表格转换失败: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        return resolve({ success: false, message: '表格转换失败', error: stderr });
      }
      
      const generatedOutputPath = path.join(path.dirname(outputPath), `${path.basename(inputPath, path.extname(inputPath))}.${targetFormat}`);
      
      if (fs.existsSync(generatedOutputPath)) {
        if (generatedOutputPath !== outputPath) {
          fs.renameSync(generatedOutputPath, outputPath);
        }
        
        return resolve({ 
          success: true, 
          message: '表格转换成功', 
          outputPath: outputPath 
        });
      } else {
        return resolve({ 
          success: false, 
          message: '表格转换成功，但未找到输出文件',
          error: 'Output file not found' 
        });
      }
    });
  });
};

const executeCsvToJson = (inputPath, outputPath) => {
  return new Promise((resolve) => {
    const command = `python3 -c "import csv, json; data = list(csv.DictReader(open('${inputPath}', 'r', encoding='utf-8'))); json.dump(data, open('${outputPath}', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)"`;
    
    console.log(`执行CSV转JSON命令: ${command}`);
    
    exec(command, { timeout: 300000 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`CSV转JSON失败: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        return resolve({ success: false, message: 'CSV转JSON失败', error: stderr });
      }
      
      if (fs.existsSync(outputPath)) {
        return resolve({ 
          success: true, 
          message: 'CSV转JSON成功', 
          outputPath: outputPath 
        });
      } else {
        return resolve({ 
          success: false, 
          message: 'CSV转JSON成功，但未找到输出文件',
          error: 'Output file not found' 
        });
      }
    });
  });
};

module.exports = router;
