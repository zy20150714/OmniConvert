const express = require('express');
const cors = require('cors');
const multer = require('multer');
const uuid = require('uuid');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const documentRoutes = require('./routes/document');
const videoRoutes = require('./routes/video');
const audioRoutes = require('./routes/audio');
const imageRoutes = require('./routes/image');

const app = express();
const PORT = process.env.PORT || 3000;

// 配置CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 配置文件上传
const uploadDir = path.join(__dirname, '../tmp/uploads');
const outputDir = path.join(__dirname, '../tmp/outputs');

// 确保临时目录存在
fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(outputDir, { recursive: true });

// 自动删除10分钟前的文件
setInterval(() => {
  const now = Date.now();
  const tenMinutesAgo = now - 10 * 60 * 1000;
  
  // 删除上传文件
  fs.readdirSync(uploadDir).forEach(file => {
    const filePath = path.join(uploadDir, file);
    const stat = fs.statSync(filePath);
    if (stat.mtimeMs < tenMinutesAgo) {
      fs.unlinkSync(filePath);
    }
  });
  
  // 删除输出文件
  fs.readdirSync(outputDir).forEach(file => {
    const filePath = path.join(outputDir, file);
    const stat = fs.statSync(filePath);
    if (stat.mtimeMs < tenMinutesAgo) {
      fs.unlinkSync(filePath);
    }
  });
}, 60 * 1000); // 每分钟检查一次

// 配置multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    const uniqueFilename = `${uuid.v4()}${fileExtension}`;
    cb(null, uniqueFilename);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // 允许所有文件类型，后续在路由中进行具体校验
    cb(null, true);
  }
});

// 暴露上传和输出目录
app.use('/uploads', express.static(uploadDir));
app.use('/outputs', express.static(outputDir));

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '万能转换工坊服务运行正常' });
});

// 分片上传接口
app.post('/api/upload/chunk', upload.single('file'), (req, res) => {
  const { chunkIndex, totalChunks, fileName } = req.body;
  const uploadedFile = req.file;
  
  res.json({
    success: true,
    chunkIndex: parseInt(chunkIndex),
    message: '分片上传成功',
    fileName: uploadedFile.filename
  });
});

// 合并分片接口
app.post('/api/upload/merge', (req, res) => {
  const { fileName, chunks } = req.body;
  const fileExtension = path.extname(fileName);
  const finalFileName = `${uuid.v4()}${fileExtension}`;
  const finalPath = path.join(uploadDir, finalFileName);
  
  try {
    // 创建可写流
    const writeStream = fs.createWriteStream(finalPath);
    
    // 按顺序写入分片
    let currentChunk = 0;
    
    const writeNextChunk = () => {
      if (currentChunk < chunks.length) {
        const chunkPath = path.join(uploadDir, chunks[currentChunk]);
        const readStream = fs.createReadStream(chunkPath);
        
        readStream.pipe(writeStream, { end: false });
        readStream.on('end', () => {
          // 删除已合并的分片
          fs.unlinkSync(chunkPath);
          currentChunk++;
          writeNextChunk();
        });
      } else {
        writeStream.end();
      }
    };
    
    writeStream.on('finish', () => {
      res.json({
        success: true,
        fileName: finalFileName,
        originalName: fileName,
        path: finalPath
      });
    });
    
    writeNextChunk();
  } catch (error) {
    res.status(500).json({ success: false, message: '合并分片失败', error: error.message });
  }
});

// 路由配置
app.use('/api/convert/document', documentRoutes);
app.use('/api/convert/video', videoRoutes);
app.use('/api/convert/audio', audioRoutes);
app.use('/api/convert/image', imageRoutes);

// 下载接口
app.get('/api/download/:fileName', (req, res) => {
  const { fileName } = req.params;
  const filePath = path.join(outputDir, fileName);
  
  if (fs.existsSync(filePath)) {
    res.download(filePath, (err) => {
      if (err) {
        res.status(500).json({ success: false, message: '下载失败' });
      }
    });
  } else {
    res.status(404).json({ success: false, message: '文件不存在' });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`万能转换工坊服务启动成功，监听端口 ${PORT}`);
  console.log(`健康检查地址: http://localhost:${PORT}/api/health`);
});
