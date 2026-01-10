# 万能转换工坊

一个无广告、界面极简、转换速度极快的全格式文件转换工具。

## 功能特性

### 1. 文档办公类
- **PDF专区**：PDF转Word、PDF转Excel、PDF转PPT、PDF转图片(JPG/PNG)、PDF转TXT、Word转PDF、Excel转PDF、PPT转PDF
- **Office互转**：Word转TXT、Word转RTF、PPT转PDF、PPT转图片
- **电子书**：EPUB转PDF、EPUB转MOBI、AZW3转PDF、TXT转EPUB

### 2. 视频媒体类
- **通用转换**：MP4转AVI、MP4转MKV、MOV转MP4、FLV转MP4、WEBM转MP4
- **提取音频**：MP4转MP3、MKV转AAC、视频转WAV
- **GIF相关**：视频转GIF、GIF转视频(MP4)、GIF压缩

### 3. 音频处理类
- **格式互转**：MP3转WAV、WAV转FLAC、FLAC转MP3、M4A转MP3、OGG转MP3
- **简单处理**：音频剪切、音频合并、音频降噪（基础版）、调整音量

### 4. 图片处理类
- **格式互转**：HEIC转JPG、PNG转JPG、JPG转WEBP、BMP转PNG、TIFF转PDF
- **操作**：图片压缩（无损/有损）、图片裁剪、图片旋转、图片加水印
- **特殊**：多图合成长图、多图转PDF（电子发票归档专用）

### 5. 表格数据类
- **转换**：XLSX转CSV、XLS转HTML、CSV转JSON、Excel转PDF（保留基础表格线）

### 6. 压缩与归档
- **解压**：ZIP解压、RAR解压、7z解压
- **压缩**：文件夹转ZIP、多文件合并为ZIP

## 技术栈

### 前端
- Vue 3 + Vite
- Element Plus
- Axios

### 后端
- Node.js + Express
- FFmpeg（视频/音频处理）
- LibreOffice（文档转换）
- ImageMagick（图片处理）

## 项目结构

```
OmniConvert/
├── backend/                 # 后端服务
│   ├── routes/             # 路由模块
│   │   ├── document.js     # 文档转换路由
│   │   ├── video.js        # 视频转换路由
│   │   ├── audio.js        # 音频转换路由
│   │   └── image.js        # 图片转换路由
│   ├── converters/         # 转换核心逻辑
│   │   └── pdf2word.js     # PDF转Word转换器
│   ├── middleware/         # 中间件
│   ├── utils/              # 工具函数
│   ├── package.json        # 后端依赖
│   └── server.js           # 后端入口文件
├── frontend/               # 前端应用
│   ├── src/                # 源代码
│   │   ├── components/     # 组件
│   │   │   ├── FileUploader.vue  # 文件上传组件
│   │   │   └── Sidebar.vue       # 侧边栏组件
│   │   ├── views/          # 页面
│   │   ├── utils/          # 工具函数
│   │   ├── App.vue         # 应用根组件
│   │   └── main.js         # 应用入口
│   ├── public/             # 静态资源
│   ├── index.html          # HTML模板
│   ├── vite.config.js      # Vite配置
│   └── package.json        # 前端依赖
├── tmp/                    # 临时文件目录
│   ├── uploads/            # 上传文件
│   └── outputs/            # 转换输出文件
└── README.md               # 项目说明
```

## 快速开始

### 后端启动

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 启动服务
npm start

# 开发模式（热重载）
npm run dev
```

后端服务默认监听3000端口，健康检查地址：http://localhost:3000/api/health

### 前端启动

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 核心功能说明

### 文件上传
- 支持拖拽上传
- 支持分片上传（10MB/片）
- 显示真实进度条
- 自动识别文件类型

### 转换逻辑
- 根据文件扩展名自动匹配可用转换格式
- 使用系统命令行工具进行转换，确保转换速度和质量
- 支持错误捕获和友好提示
- 转换完成后10分钟自动清理临时文件

### 转换队列
- 显示转换历史记录
- 支持下载转换结果
- 显示转换状态和进度

## 系统要求

### 后端依赖
- Node.js >= 16.x
- FFmpeg >= 4.x
- LibreOffice >= 7.x
- ImageMagick >= 7.x
- pdftotext (poppler-utils)
- gifsicle
- ebook-convert (Calibre)

### 前端依赖
- 现代浏览器（支持ES6+）

## 配置说明

### 环境变量

后端支持以下环境变量：
- `PORT`：服务端口，默认3000
- `UPLOAD_DIR`：上传文件目录，默认`../tmp/uploads`
- `OUTPUT_DIR`：输出文件目录，默认`../tmp/outputs`

### 前端配置

前端通过`.env`文件配置：
- `VITE_API_BASE_URL`：后端API地址，默认`http://localhost:3000/api`

## 开发说明

### 代码风格
- 后端：使用JavaScript Standard Style
- 前端：使用ESLint + Prettier

### 测试
- 后端：使用Jest进行单元测试
- 前端：使用Vitest进行单元测试

## 许可证

MIT License
