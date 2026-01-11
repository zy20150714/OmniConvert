# 万能转换工坊

一个无广告、界面极简、转换速度极快的全格式文件转换工具。

## 功能特性

### 文档办公类
- **PDF专区**: PDF转Word/Excel/PPT/图片/TXT，Word/Excel/PPT转PDF
- **Office互转**: Word转TXT/RTF，PPT转图片
- **电子书**: EPUB转PDF/MOBI，AZW3转PDF，TXT转EPUB

### 视频媒体类
- **通用转换**: MP4/AVI/MKV/MOV/FLV/WEBM互转
- **提取音频**: 视频转MP3/AAC/WAV
- **GIF相关**: 视频转GIF，GIF转视频，GIF压缩

### 音频处理类
- **格式互转**: MP3/WAV/FLAC/M4A/OGG互转
- **简单处理**: 音频剪切、合并、降噪、调整音量

### 图片处理类
- **格式互转**: HEIC/PNG/JPG/WEBP/BMP/TIFF互转
- **操作**: 图片压缩、裁剪、旋转、加水印
- **特殊**: 多图合成长图，多图转PDF

### 表格数据类
- XLSX转CSV，XLS转HTML，CSV转JSON，Excel转PDF

### 压缩与归档
- ZIP/RAR/7z解压，文件夹转ZIP，多文件合并为ZIP

## 技术栈

### 前端
- Vue 3
- Vite
- Element Plus
- Axios

### 后端
- Node.js
- Express
- Multer (文件上传)

### 转换内核
- FFmpeg (视频/音频处理)
- LibreOffice (文档转换)
- Pandoc (电子书转换)
- ImageMagick (图片处理)

## 项目结构

```
OmniConvert-1/
├── backend/                 # 后端服务
│   ├── routes/             # 路由处理
│   │   ├── document.js     # 文档转换路由
│   │   ├── video.js        # 视频转换路由
│   │   ├── audio.js        # 音频转换路由
│   │   ├── image.js        # 图片转换路由
│   │   ├── table.js        # 表格转换路由
│   │   └── archive.js      # 压缩文件路由
│   ├── converters/         # 转换处理器
│   │   └── pdf2word.js     # PDF转Word处理器
│   ├── utils/              # 工具函数
│   │   ├── queue.js        # 任务队列
│   │   └── errorHandler.js # 错误处理
│   ├── tmp/                # 临时文件目录
│   │   ├── uploads/        # 上传文件
│   │   └── outputs/        # 输出文件
│   ├── server.js           # 服务器入口
│   └── package.json        # 后端依赖
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── components/     # 组件
│   │   │   ├── FileUploader.vue  # 文件上传组件
│   │   │   └── Sidebar.vue       # 侧边栏组件
│   │   ├── App.vue         # 主应用组件
│   │   └── main.js         # 应用入口
│   ├── index.html          # HTML模板
│   ├── vite.config.js      # Vite配置
│   ├── jsconfig.json       # JS配置
│   └── package.json        # 前端依赖
└── .gitignore              # Git忽略文件
```

## 安装和运行

### 前置要求

- Node.js 18+
- FFmpeg
- LibreOffice
- Pandoc
- ImageMagick

### 安装依赖

#### 后端
```bash
cd backend
npm install
```

#### 前端
```bash
cd frontend
npm install
```

### 运行项目

#### 启动后端服务
```bash
cd backend
npm run dev
```

#### 启动前端开发服务器
```bash
cd frontend
npm run dev
```

### 构建生产版本

#### 前端构建
```bash
cd frontend
npm run build
```

#### 后端生产运行
```bash
cd backend
npm start
```

## API 接口

### 健康检查
```
GET /api/health
```

### 文件上传
```
POST /api/upload/chunk
POST /api/upload/merge
```

### 文件转换
```
POST /api/convert/document
POST /api/convert/video
POST /api/convert/audio
POST /api/convert/image
POST /api/convert/table
POST /api/convert/archive
```

### 文件下载
```
GET /api/download/:fileName
```

## 核心功能说明

### 分片上传
- 支持大文件分片上传（每片10MB）
- 上传进度实时显示
- 自动合并分片

### 任务队列
- 并发控制（默认3个并发任务）
- 任务状态实时更新
- 错误处理和重试机制

### 自动清理
- 自动删除10分钟前的临时文件
- 防止服务器存储空间不足

### 错误处理
- 详细的错误信息提示
- 特定错误的友好提示
- 转换工具错误的统一处理

## 注意事项

1. 确保系统已安装FFmpeg、LibreOffice、Pandoc和ImageMagick
2. Windows系统需要将转换工具添加到系统PATH环境变量
3. 大文件转换可能需要较长时间，请耐心等待
4. 密码保护的文件暂不支持转换

## 许可证

MIT License
