# 万能转换工坊 - 项目交付总结

## 项目概述

"万能转换工坊"是一个无广告、界面极简、转换速度极快的全格式文件转换Web应用。该项目采用Vue 3（前端）+ Node.js/Express（后端）+ FFmpeg/LibreOffice/Pandoc/ImageMagick（转换内核）的技术架构。

## 已完成的功能模块

### 1. 后端核心功能

#### 1.1 服务器入口文件 ([server.js](file:///d:\OmniConvert-1\backend\server.js))
- Express服务器配置
- CORS跨域处理
- 文件上传配置（Multer）
- 分片上传和合并接口
- 自动文件清理机制（10分钟）
- 路由配置和静态文件服务
- 健康检查接口

#### 1.2 文档转换路由 ([document.js](file:///d:\OmniConvert-1\backend\routes\document.js))
- PDF转换：PDF转Word/Excel/PPT/图片/TXT
- Office转换：Word/Excel/PPT转PDF
- 电子书转换：EPUB/MOBI/AZW3/TXT互转
- 支持LibreOffice、ImageMagick、pdftotext、ebook-convert等工具

#### 1.3 视频转换路由 ([video.js](file:///d:\OmniConvert-1\backend\routes\video.js))
- 视频格式转换：MP4/AVI/MKV/MOV/FLV/WEBM互转
- 音频提取：视频转MP3/AAC/WAV
- GIF处理：视频转GIF、GIF转视频、GIF压缩
- 使用FFmpeg进行视频处理

#### 1.4 音频转换路由 ([audio.js](file:///d:\OmniConvert-1\backend\routes\audio.js))
- 音频格式转换：MP3/WAV/FLAC/M4A/OGG互转
- 音频处理：剪切、合并、降噪、调整音量
- 使用FFmpeg进行音频处理

#### 1.5 图片转换路由 ([image.js](file:///d:\OmniConvert-1\backend\routes\image.js))
- 图片格式转换：HEIC/PNG/JPG/WEBP/BMP/TIFF互转
- 图片处理：压缩、裁剪、旋转、加水印
- 特殊功能：多图合成长图、多图转PDF
- 使用ImageMagick进行图片处理

#### 1.6 表格转换路由 ([table.js](file:///d:\OmniConvert-1\backend\routes\table.js))
- 表格格式转换：XLSX/XLS/CSV互转
- 支持转换为CSV、HTML、JSON、PDF格式
- 使用LibreOffice和Python进行表格处理

#### 1.7 压缩文件路由 ([archive.js](file:///d:\OmniConvert-1\backend\routes\archive.js))
- 压缩文件解压：ZIP/RAR/7z解压
- 文件夹压缩：文件夹转ZIP
- 使用unzip、unrar、7z等工具

#### 1.8 转换处理器 ([pdf2word.js](file:///d:\OmniConvert-1\backend\converters\pdf2word.js))
- PDF转Word的核心实现
- 支持LibreOffice和pdf-lib两种实现方式
- 跨平台支持（Windows/macOS/Linux）
- 详细的错误处理和日志记录

#### 1.9 任务队列 ([queue.js](file:///d:\OmniConvert-1\backend\utils\queue.js))
- 基于EventEmitter的任务队列实现
- 并发控制（默认3个并发任务）
- 任务状态管理（pending/processing/completed/failed）
- 任务事件监听（taskAdded/taskStarted/taskCompleted/taskFailed）

#### 1.10 错误处理 ([errorHandler.js](file:///d:\OmniConvert-1\backend\utils\errorHandler.js))
- 统一的错误处理机制
- 特定工具的错误处理（FFmpeg、LibreOffice、ImageMagick）
- 友好的错误提示信息
- 安全的命令执行封装

### 2. 前端核心功能

#### 2.1 主应用组件 ([App.vue](file:///d:\OmniConvert-1\frontend\src\App.vue))
- 应用布局：侧边栏 + 主内容区
- 转换队列显示
- 关于对话框
- 响应式设计

#### 2.2 文件上传组件 ([FileUploader.vue](file:///d:\OmniConvert-1\frontend\src\components\FileUploader.vue))
- 拖拽上传支持
- 文件类型验证
- 转换格式选择
- 分片上传实现（10MB每片）
- 上传进度显示
- 转换队列管理
- 文件下载功能

#### 2.3 侧边栏导航 ([Sidebar.vue](file:///d:\OmniConvert-1\frontend\src\components\Sidebar.vue))
- 分类导航菜单
- 文档办公类、视频媒体类、音频处理类、图片处理类、表格数据类、压缩与归档
- 菜单选择事件处理
- 响应式设计

#### 2.4 应用入口 ([main.js](file:///d:\OmniConvert-1\frontend\src\main.js))
- Vue应用初始化
- Element Plus集成
- Element Plus图标注册

#### 2.5 前端配置文件
- [index.html](file:///d:\OmniConvert-1\frontend\index.html)：HTML模板
- [vite.config.js](file:///d:\OmniConvert-1\frontend\vite.config.js)：Vite配置，包含开发服务器代理
- [jsconfig.json](file:///d:\OmniConvert-1\frontend\jsconfig.json)：JavaScript配置

### 3. 项目配置文件

#### 3.1 后端配置
- [package.json](file:///d:\OmniConvert-1\backend\package.json)：后端依赖和脚本
- 依赖：express、cors、multer、uuid、axios

#### 3.2 前端配置
- [package.json](file:///d:\OmniConvert-1\frontend\package.json)：前端依赖和脚本
- 依赖：vue、element-plus、@element-plus/icons-vue、axios

#### 3.3 项目配置
- [.gitignore](file:///d:\OmniConvert-1\.gitignore)：Git忽略文件配置
- [.env.example](file:///d:\OmniConvert-1\.env.example)：环境变量示例
- [README.md](file:///d:\OmniConvert-1\README.md)：项目文档

## 技术架构

### 前端技术栈
- **框架**：Vue 3（Composition API）
- **构建工具**：Vite
- **UI组件库**：Element Plus
- **HTTP客户端**：Axios
- **图标库**：Element Plus Icons

### 后端技术栈
- **运行时**：Node.js
- **Web框架**：Express
- **文件上传**：Multer
- **任务队列**：自定义EventEmitter实现
- **错误处理**：自定义ErrorHandler类

### 转换内核
- **视频/音频**：FFmpeg
- **文档**：LibreOffice
- **电子书**：Pandoc
- **图片**：ImageMagick
- **表格**：LibreOffice + Python

## 核心特性

### 1. 分片上传
- 支持大文件分片上传（每片10MB）
- 上传进度实时显示
- 自动合并分片
- 提高上传稳定性和速度

### 2. 任务队列
- 并发控制（默认3个并发任务）
- 任务状态实时更新
- 错误处理和重试机制
- 任务事件监听

### 3. 自动清理
- 自动删除10分钟前的临时文件
- 防止服务器存储空间不足
- 定时清理机制

### 4. 错误处理
- 详细的错误信息提示
- 特定错误的友好提示
- 转换工具错误的统一处理
- 安全的命令执行

### 5. 跨平台支持
- Windows、macOS、Linux支持
- 自动检测操作系统
- 使用相应的转换工具路径

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
├── .gitignore              # Git忽略文件
├── .env.example            # 环境变量示例
└── README.md               # 项目文档
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

## 注意事项

1. 确保系统已安装FFmpeg、LibreOffice、Pandoc和ImageMagick
2. Windows系统需要将转换工具添加到系统PATH环境变量
3. 大文件转换可能需要较长时间，请耐心等待
4. 密码保护的文件暂不支持转换
5. 临时文件会在10分钟后自动删除

## 项目亮点

1. **完整的转换功能**：支持文档、视频、音频、图片、表格、压缩文件等多种格式转换
2. **高性能架构**：分片上传、任务队列、并发控制确保转换速度
3. **优秀的用户体验**：拖拽上传、实时进度、友好提示
4. **完善的错误处理**：详细的错误信息和友好的提示
5. **跨平台支持**：Windows、macOS、Linux全平台支持
6. **自动清理机制**：防止服务器存储空间不足
7. **响应式设计**：适配不同屏幕尺寸

## 许可证

MIT License
