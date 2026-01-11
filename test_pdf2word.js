const { pdfToWord } = require('./backend/converters/pdf2word');
const path = require('path');
const fs = require('fs');

// 创建一个简单的测试PDF文件路径
// 注意：你需要确保在这个路径下有一个测试用的PDF文件
const testPdfPath = path.join(__dirname, 'test.pdf');
const outputDocxPath = path.join(__dirname, 'test_output.docx');

console.log('开始测试PDF转Word功能...');
console.log('输入文件:', testPdfPath);
console.log('输出文件:', outputDocxPath);

// 检查测试PDF文件是否存在
if (!fs.existsSync(testPdfPath)) {
  console.error('错误：测试PDF文件不存在，请在项目根目录创建一个test.pdf文件');
  process.exit(1);
}

// 执行转换测试
pdfToWord(testPdfPath, outputDocxPath)
  .then(result => {
    console.log('\n转换结果:', result);
    
    if (result.success) {
      console.log('✅ PDF转Word测试成功！');
      console.log('输出文件:', result.outputPath);
      
      // 检查输出文件是否存在
      if (fs.existsSync(outputDocxPath)) {
        console.log('✅ 输出文件已生成');
      } else {
        console.error('❌ 输出文件未生成');
      }
    } else {
      console.error('❌ PDF转Word测试失败');
      console.error('错误信息:', result.error);
    }
  })
  .catch(error => {
    console.error('❌ 测试过程中发生未捕获的错误:', error);
  });
