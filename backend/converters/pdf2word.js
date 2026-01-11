const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { soffice } = require('../config/toolPaths');

/**
 * PDF转Word转换器
 * @param {string} inputPath - 输入PDF文件路径
 * @param {string} outputPath - 输出Word文件路径
 * @returns {Promise<{success: boolean, message: string, outputPath?: string, error?: string}>}
 */
const pdfToWord = async (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    // 检查输入文件是否存在
    if (!fs.existsSync(inputPath)) {
      return resolve({ success: false, message: '输入文件不存在' });
    }

    // 检查输出目录是否存在
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 使用LibreOffice进行PDF转Word转换
    // 命令格式：libreoffice --headless --convert-to docx:"MS Word 2007 XML" input.pdf --outdir output_dir
    const outputDirPath = path.dirname(outputPath);
    const baseOutputName = path.basename(outputPath, path.extname(outputPath));
    
    // 使用中央配置的soffice路径
    const command = `"${soffice}" --headless --convert-to docx:"MS Word 2007 XML" "${inputPath}" --outdir "${outputDirPath}"`;

    console.log(`执行PDF转Word命令: ${command}`);

    exec(command, { timeout: 300000 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`PDF转Word失败: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        
        // 解析错误信息
        let errorMsg = '转换失败，请检查文件是否损坏或格式不支持';
        if (stderr.includes('Error loading document')) {
          errorMsg = '文件头损坏，请重新上传';
        } else if (stderr.includes('Timeout')) {
          errorMsg = '转换超时，请尝试较小的文件';
        }
        
        return resolve({ success: false, message: errorMsg, error: stderr });
      }

      console.log(`PDF转Word成功，stdout: ${stdout}`);
      
      // LibreOffice会将文件输出到指定目录，文件名与输入文件相同，后缀为.docx
      const inputFileName = path.basename(inputPath);
      const inputBaseName = inputFileName.substring(0, inputFileName.lastIndexOf('.'));
      const generatedOutputPath = path.join(outputDirPath, `${inputBaseName}.docx`);
      
      // 检查生成的文件是否存在
      if (fs.existsSync(generatedOutputPath)) {
        // 如果用户指定了不同的输出文件名，则重命名
        if (generatedOutputPath !== outputPath) {
          fs.renameSync(generatedOutputPath, outputPath);
        }
        
        return resolve({ 
          success: true, 
          message: 'PDF转Word成功', 
          outputPath: outputPath 
        });
      } else {
        console.error('PDF转Word成功，但未找到输出文件');
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
 * 使用pdf-lib库的PDF转Word实现（备选方案）
 * 注意：pdf-lib主要用于PDF操作，不直接支持转Word，此为演示用
 * @param {string} inputPath - 输入PDF文件路径
 * @param {string} outputPath - 输出Word文件路径
 * @returns {Promise<{success: boolean, message: string, outputPath?: string, error?: string}>}
 */
const pdfToWordWithPdfLib = async (inputPath, outputPath) => {
  return new Promise((resolve) => {
    // pdf-lib不直接支持PDF转Word，这里只是演示如何使用pdf-lib读取PDF
    // 实际生产环境中建议使用LibreOffice或专门的PDF转Word工具
    
    console.log('使用pdf-lib读取PDF文件:', inputPath);
    
    // 这里可以添加pdf-lib的代码来读取PDF内容
    // 例如：
    // const { PDFDocument } = require('pdf-lib');
    // const pdfBytes = fs.readFileSync(inputPath);
    // const pdfDoc = await PDFDocument.load(pdfBytes);
    // const pageCount = pdfDoc.getPageCount();
    // console.log(`PDF包含 ${pageCount} 页`);
    
    resolve({
      success: false,
      message: 'pdf-lib不直接支持PDF转Word，建议使用LibreOffice方案',
      error: 'Unsupported operation with pdf-lib'
    });
  });
};

module.exports = {
  pdfToWord,
  pdfToWordWithPdfLib
};
