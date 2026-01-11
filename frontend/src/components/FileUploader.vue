<template>
  <div class="file-uploader">
    <!-- 拖拽上传区域 -->
    <div 
      class="upload-area"
      :class="{ 'dragover': isDragover }"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <input 
        ref="fileInput" 
        type="file" 
        class="file-input" 
        @change="handleFileChange"
        :accept="acceptTypes"
      />
      <div class="upload-content">
        <el-icon class="upload-icon"><UploadFilled /></el-icon>
        <h3>点击或拖拽文件到此处上传</h3>
        <p class="upload-hint">支持 {{ supportedFormats }} 等格式</p>
        <div v-if="selectedFile" class="selected-file-info">
          <el-tag type="success">{{ selectedFile.name }}</el-tag>
          <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
        </div>
      </div>
    </div>

    <!-- 转换格式选择 -->
    <div v-if="selectedFile" class="convert-options">
      <h4>选择转换格式</h4>
      <el-select 
        v-model="targetFormat" 
        placeholder="请选择目标格式"
        size="large"
        class="format-select"
        @change="onFormatChange"
      >
        <el-option 
          v-for="format in availableFormats" 
          :key="format.value" 
          :label="format.label" 
          :value="format.value"
        />
      </el-select>
    </div>

    <!-- 上传进度 -->
    <div v-if="uploadProgress > 0" class="upload-progress">
      <el-progress 
        :percentage="uploadProgress" 
        :status="uploadStatus === 'success' ? 'success' : uploadStatus === 'error' ? 'exception' : 'active'"
        :stroke-width="3"
      />
      <span class="progress-text">{{ uploadStatusText }}</span>
    </div>

    <!-- 操作按钮 -->
    <div v-if="selectedFile" class="action-buttons">
      <el-button 
        type="primary" 
        size="large"
        @click="startUpload"
        :loading="isUploading"
        :disabled="!targetFormat"
      >
        <el-icon v-if="isUploading"><Loading /></el-icon>
        {{ isUploading ? '上传中...' : '开始转换' }}
      </el-button>
      <el-button 
        size="large"
        @click="resetUpload"
      >
        重新选择
      </el-button>
    </div>

    <!-- 转换队列 -->
    <div v-if="conversionQueue.length > 0" class="conversion-queue">
      <h4>转换队列</h4>
      <el-timeline>
        <el-timeline-item 
          v-for="(item, index) in conversionQueue" 
          :key="index"
          :timestamp="item.timestamp"
          :type="item.status === 'success' ? 'success' : item.status === 'error' ? 'danger' : 'info'"
        >
          <div class="queue-item">
            <div class="item-title">{{ item.filename }}</div>
            <div class="item-status">{{ item.statusText }}</div>
            <el-button 
              v-if="item.status === 'success'" 
              type="success" 
              size="small"
              @click="downloadFile(item.downloadUrl)"
            >
              <el-icon><Download /></el-icon> 下载
            </el-button>
          </div>
        </el-timeline-item>
      </el-timeline>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { UploadFilled, Loading, Download } from '@element-plus/icons-vue';
import axios from 'axios';

// 组件状态
const isDragover = ref(false);
const selectedFile = ref(null);
const targetFormat = ref('');
const isUploading = ref(false);
const uploadProgress = ref(0);
const uploadStatus = ref('');
const uploadStatusText = ref('');
const conversionQueue = ref([]);
const fileInput = ref(null);

// 配置
const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB per chunk
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// 支持的文件格式映射
const supportedFormatsMap = {
  // 文档办公类
  'pdf': ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'jpg', 'png', 'txt'],
  'doc': ['pdf', 'txt', 'rtf'],
  'docx': ['pdf', 'txt', 'rtf'],
  'xls': ['pdf', 'csv', 'html'],
  'xlsx': ['pdf', 'csv', 'html'],
  'ppt': ['pdf', 'jpg', 'png'],
  'pptx': ['pdf', 'jpg', 'png'],
  'epub': ['pdf', 'mobi'],
  'mobi': ['pdf'],
  'azw3': ['pdf'],
  'txt': ['epub', 'pdf'],
  'rtf': ['pdf'],
  
  // 视频媒体类
  'mp4': ['avi', 'mkv', 'flv', 'webm', 'mp3', 'aac', 'wav', 'gif'],
  'avi': ['mp4', 'mkv'],
  'mkv': ['mp4', 'mp3', 'aac'],
  'mov': ['mp4'],
  'flv': ['mp4'],
  'webm': ['mp4'],
  'gif': ['mp4'],
  
  // 音频处理类
  'mp3': ['wav', 'flac', 'm4a', 'ogg'],
  'wav': ['mp3', 'flac'],
  'flac': ['mp3', 'wav'],
  'm4a': ['mp3'],
  'ogg': ['mp3'],
  
  // 图片处理类
  'heic': ['jpg', 'png'],
  'png': ['jpg', 'webp', 'bmp', 'tiff', 'pdf'],
  'jpg': ['webp', 'png', 'bmp', 'tiff', 'pdf'],
  'jpeg': ['webp', 'png', 'bmp', 'tiff', 'pdf'],
  'webp': ['jpg', 'png'],
  'bmp': ['png', 'jpg', 'webp'],
  'tiff': ['pdf', 'jpg', 'png'],
  
  // 表格数据类
  'csv': ['json', 'xlsx', 'xls'],
  
  // 压缩与归档
  'zip': [],
  'rar': [],
  '7z': []
};

// 计算属性：支持的文件格式列表
const supportedFormats = computed(() => {
  return Object.keys(supportedFormatsMap).join(', ').toUpperCase();
});

// 计算属性：允许的文件类型
const acceptTypes = computed(() => {
  return Object.keys(supportedFormatsMap).map(ext => `.${ext}`).join(',');
});

// 计算属性：当前文件可用的转换格式
const availableFormats = computed(() => {
  if (!selectedFile) return [];
  
  const fileExt = selectedFile.value.name.split('.').pop().toLowerCase();
  const formats = supportedFormatsMap[fileExt] || [];
  
  return formats.map(ext => {
    return {
      value: ext,
      label: `${ext.toUpperCase()} (${getFormatDescription(fileExt, ext)})`
    };
  });
});

// 获取格式描述
const getFormatDescription = (fromExt, toExt) => {
  const descriptions = {
    'pdf-docx': 'PDF转Word',
    'pdf-xlsx': 'PDF转Excel',
    'pdf-pptx': 'PDF转PPT',
    'pdf-jpg': 'PDF转图片',
    'pdf-txt': 'PDF转TXT',
    'docx-pdf': 'Word转PDF',
    'xlsx-pdf': 'Excel转PDF',
    'pptx-pdf': 'PPT转PDF',
    'mp4-avi': 'MP4转AVI',
    'mp4-mp3': 'MP4转MP3',
    'mp4-gif': '视频转GIF',
    'gif-mp4': 'GIF转视频',
    'mp3-wav': 'MP3转WAV',
    'wav-flac': 'WAV转FLAC',
    'heic-jpg': 'HEIC转JPG',
    'png-jpg': 'PNG转JPG',
    'jpg-webp': 'JPG转WEBP'
  };
  
  return descriptions[`${fromExt}-${toExt}`] || '格式转换';
};

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value.click();
};

// 处理拖拽事件
const handleDragOver = () => {
  isDragover.value = true;
};

const handleDragLeave = () => {
  isDragover.value = false;
};

// 处理文件拖放
const handleDrop = (e) => {
  isDragover.value = false;
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    processFile(files[0]);
  }
};

// 处理文件选择
const handleFileChange = (e) => {
  const files = e.target.files;
  if (files.length > 0) {
    processFile(files[0]);
  }
};

// 处理文件
const processFile = (file) => {
  const fileExt = file.name.split('.').pop().toLowerCase();
  
  // 检查文件类型是否支持
  if (!supportedFormatsMap[fileExt]) {
    ElMessage.error(`不支持的文件格式: ${fileExt}`);
    return;
  }
  
  selectedFile.value = file;
  targetFormat.value = '';
  uploadProgress.value = 0;
  uploadStatus.value = '';
  uploadStatusText.value = '';
  
  ElMessage.success(`已选择文件: ${file.name}`);
};

// 格式改变事件
const onFormatChange = () => {
  ElMessage.info(`已选择目标格式: ${targetFormat.value.toUpperCase()}`);
};

// 重置上传
const resetUpload = () => {
  selectedFile.value = null;
  targetFormat.value = '';
  uploadProgress.value = 0;
  uploadStatus.value = '';
  uploadStatusText.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

// 分片上传
const startUpload = async () => {
  if (!selectedFile.value || !targetFormat.value) {
    ElMessage.warning('请选择文件和目标格式');
    return;
  }
  
  isUploading.value = true;
  uploadProgress.value = 0;
  uploadStatus.value = 'active';
  uploadStatusText.value = '准备上传...';
  
  const file = selectedFile.value;
  const fileExt = file.name.split('.').pop().toLowerCase();
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const uploadedChunks = [];
  
  try {
    // 分片上传
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);
      
      uploadStatusText.value = `上传分片 ${chunkIndex + 1}/${totalChunks}`;
      
      const formData = new FormData();
      formData.append('file', chunk);
      formData.append('chunkIndex', chunkIndex);
      formData.append('totalChunks', totalChunks);
      formData.append('fileName', file.name);
      
      const response = await axios.post(`${API_BASE_URL}/upload/chunk`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        uploadedChunks.push(response.data.fileName);
        uploadProgress.value = Math.round(((chunkIndex + 1) / totalChunks) * 50); // 上传占50%
      } else {
        throw new Error(response.data.message || '分片上传失败');
      }
    }
    
    // 合并分片
    uploadStatusText.value = '合并分片...';
    const mergeResponse = await axios.post(`${API_BASE_URL}/upload/merge`, {
      fileName: file.name,
      chunks: uploadedChunks
    });
    
    if (!mergeResponse.data.success) {
      throw new Error(mergeResponse.data.message || '合并分片失败');
    }
    
    uploadProgress.value = 60;
    uploadStatusText.value = '正在转换...';
    
    // 调用转换API
    const convertResponse = await axios.post(`${API_BASE_URL}/convert/${getFileType(fileExt)}`, {
      fileName: mergeResponse.data.fileName,
      originalName: file.name,
      targetFormat: targetFormat.value
    });
    
    if (convertResponse.data.success) {
      uploadProgress.value = 100;
      uploadStatus.value = 'success';
      uploadStatusText.value = '转换成功！';
      
      // 添加到转换队列
      conversionQueue.value.unshift({
        filename: file.name,
        status: 'success',
        statusText: `转换成功: ${fileExt.toUpperCase()} → ${targetFormat.value.toUpperCase()}`,
        timestamp: new Date().toLocaleString(),
        downloadUrl: convertResponse.data.downloadUrl
      });
      
      ElMessage.success('文件转换成功！');
    } else {
      throw new Error(convertResponse.data.message || '转换失败');
    }
  } catch (error) {
    uploadProgress.value = 0;
    uploadStatus.value = 'error';
    uploadStatusText.value = `转换失败: ${error.message}`;
    
    // 添加到转换队列
    conversionQueue.value.unshift({
      filename: file.name,
      status: 'error',
      statusText: `转换失败: ${error.message}`,
      timestamp: new Date().toLocaleString()
    });
    
    ElMessage.error(`转换失败: ${error.message}`);
  } finally {
    isUploading.value = false;
  }
};

// 获取文件类型分类
const getFileType = (ext) => {
  const docExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'epub', 'mobi', 'azw3', 'txt', 'rtf', 'csv'];
  const videoExts = ['mp4', 'avi', 'mkv', 'mov', 'flv', 'webm', 'gif'];
  const audioExts = ['mp3', 'wav', 'flac', 'm4a', 'ogg'];
  const imageExts = ['heic', 'png', 'jpg', 'jpeg', 'webp', 'bmp', 'tiff'];
  
  if (docExts.includes(ext)) return 'document';
  if (videoExts.includes(ext)) return 'video';
  if (audioExts.includes(ext)) return 'audio';
  if (imageExts.includes(ext)) return 'image';
  return 'document';
};

// 下载文件
const downloadFile = (url) => {
  window.open(url, '_blank');
};

// 格式化文件大小
const formatFileSize = (size) => {
  if (size < 1024) return size + ' B';
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB';
  if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(2) + ' MB';
  return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
};
</script>

<style scoped>
.file-uploader {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.upload-area {
  border: 2px dashed #409eff;
  border-radius: 12px;
  padding: 60px 20px;
  text-align: center;
  background-color: #fafafa;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.upload-area.dragover {
  border-color: #67c23a;
  background-color: #f0f9eb;
  transform: scale(1.02);
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 10;
}

.upload-content {
  position: relative;
  z-index: 5;
}

.upload-icon {
  font-size: 48px;
  color: #409eff;
  margin-bottom: 20px;
}

.upload-area h3 {
  margin: 0 0 10px 0;
  font-size: 20px;
  color: #303133;
}

.upload-hint {
  color: #909399;
  margin: 0;
  font-size: 14px;
}

.selected-file-info {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.file-size {
  color: #606266;
  font-size: 14px;
}

.convert-options {
  margin-top: 30px;
  text-align: center;
}

.convert-options h4 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #303133;
}

.format-select {
  width: 300px;
}

.upload-progress {
  margin-top: 30px;
}

.progress-text {
  display: block;
  text-align: center;
  margin-top: 10px;
  color: #606266;
  font-size: 14px;
}

.action-buttons {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  gap: 15px;
}

.conversion-queue {
  margin-top: 40px;
}

.conversion-queue h4 {
  margin: 0 0 20px 0;
  font-size: 16px;
  color: #303133;
}

.queue-item {
  padding: 10px;
  background-color: #fafafa;
  border-radius: 8px;
}

.item-title {
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.item-status {
  color: #606266;
  font-size: 14px;
  margin-bottom: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .file-uploader {
    padding: 10px;
  }
  
  .upload-area {
    padding: 40px 15px;
  }
  
  .upload-area h3 {
    font-size: 18px;
  }
  
  .format-select {
    width: 100%;
    max-width: 300px;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .action-buttons .el-button {
    width: 100%;
    max-width: 200px;
  }
}
</style>
