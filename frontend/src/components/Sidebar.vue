<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h2 class="sidebar-title">万能转换工坊</h2>
    </div>
    
    <el-scrollbar class="sidebar-scroll">
      <el-menu 
        :default-active="activeMenu"
        class="sidebar-menu"
        :unique-opened="true"
        @select="handleMenuSelect"
      >
        <!-- 文档办公类 -->
        <el-sub-menu index="document">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>文档办公类</span>
          </template>
          
          <!-- PDF专区 -->
          <el-sub-menu index="document-pdf">
            <template #title>
              <span>PDF专区</span>
            </template>
            <el-menu-item index="pdf-to-word">PDF转Word</el-menu-item>
            <el-menu-item index="pdf-to-excel">PDF转Excel</el-menu-item>
            <el-menu-item index="pdf-to-ppt">PDF转PPT</el-menu-item>
            <el-menu-item index="pdf-to-image">PDF转图片</el-menu-item>
            <el-menu-item index="pdf-to-txt">PDF转TXT</el-menu-item>
            <el-menu-item index="word-to-pdf">Word转PDF</el-menu-item>
            <el-menu-item index="excel-to-pdf">Excel转PDF</el-menu-item>
            <el-menu-item index="ppt-to-pdf">PPT转PDF</el-menu-item>
          </el-sub-menu>
          
          <!-- Office互转 -->
          <el-sub-menu index="document-office">
            <template #title>
              <span>Office互转</span>
            </template>
            <el-menu-item index="word-to-txt">Word转TXT</el-menu-item>
            <el-menu-item index="word-to-rtf">Word转RTF</el-menu-item>
            <el-menu-item index="ppt-to-image">PPT转图片</el-menu-item>
          </el-sub-menu>
          
          <!-- 电子书 -->
          <el-sub-menu index="document-ebook">
            <template #title>
              <span>电子书</span>
            </template>
            <el-menu-item index="epub-to-pdf">EPUB转PDF</el-menu-item>
            <el-menu-item index="epub-to-mobi">EPUB转MOBI</el-menu-item>
            <el-menu-item index="azw3-to-pdf">AZW3转PDF</el-menu-item>
            <el-menu-item index="txt-to-epub">TXT转EPUB</el-menu-item>
          </el-sub-menu>
        </el-sub-menu>
        
        <!-- 视频媒体类 -->
        <el-sub-menu index="video">
          <template #title>
            <el-icon><VideoPlay /></el-icon>
            <span>视频媒体类</span>
          </template>
          
          <!-- 通用转换 -->
          <el-sub-menu index="video-convert">
            <template #title>
              <span>通用转换</span>
            </template>
            <el-menu-item index="mp4-to-avi">MP4转AVI</el-menu-item>
            <el-menu-item index="mp4-to-mkv">MP4转MKV</el-menu-item>
            <el-menu-item index="mov-to-mp4">MOV转MP4</el-menu-item>
            <el-menu-item index="flv-to-mp4">FLV转MP4</el-menu-item>
            <el-menu-item index="webm-to-mp4">WEBM转MP4</el-menu-item>
          </el-sub-menu>
          
          <!-- 提取音频 -->
          <el-sub-menu index="video-audio">
            <template #title>
              <span>提取音频</span>
            </template>
            <el-menu-item index="mp4-to-mp3">MP4转MP3</el-menu-item>
            <el-menu-item index="mkv-to-aac">MKV转AAC</el-menu-item>
            <el-menu-item index="video-to-wav">视频转WAV</el-menu-item>
          </el-sub-menu>
          
          <!-- GIF相关 -->
          <el-sub-menu index="video-gif">
            <template #title>
              <span>GIF相关</span>
            </template>
            <el-menu-item index="video-to-gif">视频转GIF</el-menu-item>
            <el-menu-item index="gif-to-video">GIF转视频</el-menu-item>
            <el-menu-item index="gif-compress">GIF压缩</el-menu-item>
          </el-sub-menu>
        </el-sub-menu>
        
        <!-- 音频处理类 -->
        <el-sub-menu index="audio">
          <template #title>
            <el-icon><Headset /></el-icon>
            <span>音频处理类</span>
          </template>
          
          <!-- 格式互转 -->
          <el-sub-menu index="audio-convert">
            <template #title>
              <span>格式互转</span>
            </template>
            <el-menu-item index="mp3-to-wav">MP3转WAV</el-menu-item>
            <el-menu-item index="wav-to-flac">WAV转FLAC</el-menu-item>
            <el-menu-item index="flac-to-mp3">FLAC转MP3</el-menu-item>
            <el-menu-item index="m4a-to-mp3">M4A转MP3</el-menu-item>
            <el-menu-item index="ogg-to-mp3">OGG转MP3</el-menu-item>
          </el-sub-menu>
          
          <!-- 简单处理 -->
          <el-sub-menu index="audio-process">
            <template #title>
              <span>简单处理</span>
            </template>
            <el-menu-item index="audio-cut">音频剪切</el-menu-item>
            <el-menu-item index="audio-merge">音频合并</el-menu-item>
            <el-menu-item index="audio-denoise">音频降噪</el-menu-item>
            <el-menu-item index="audio-volume">调整音量</el-menu-item>
          </el-sub-menu>
        </el-sub-menu>
        
        <!-- 图片处理类 -->
        <el-sub-menu index="image">
          <template #title>
            <el-icon><Picture /></el-icon>
            <span>图片处理类</span>
          </template>
          
          <!-- 格式互转 -->
          <el-sub-menu index="image-convert">
            <template #title>
              <span>格式互转</span>
            </template>
            <el-menu-item index="heic-to-jpg">HEIC转JPG</el-menu-item>
            <el-menu-item index="png-to-jpg">PNG转JPG</el-menu-item>
            <el-menu-item index="jpg-to-webp">JPG转WEBP</el-menu-item>
            <el-menu-item index="bmp-to-png">BMP转PNG</el-menu-item>
            <el-menu-item index="tiff-to-pdf">TIFF转PDF</el-menu-item>
          </el-sub-menu>
          
          <!-- 操作 -->
          <el-sub-menu index="image-operation">
            <template #title>
              <span>操作</span>
            </template>
            <el-menu-item index="image-compress">图片压缩</el-menu-item>
            <el-menu-item index="image-crop">图片裁剪</el-menu-item>
            <el-menu-item index="image-rotate">图片旋转</el-menu-item>
            <el-menu-item index="image-watermark">图片加水印</el-menu-item>
          </el-sub-menu>
          
          <!-- 特殊 -->
          <el-sub-menu index="image-special">
            <template #title>
              <span>特殊</span>
            </template>
            <el-menu-item index="image-to-long">多图合成长图</el-menu-item>
            <el-menu-item index="images-to-pdf">多图转PDF</el-menu-item>
          </el-sub-menu>
        </el-sub-menu>
        
        <!-- 表格数据类 -->
        <el-sub-menu index="table">
          <template #title>
            <el-icon><Grid /></el-icon>
            <span>表格数据类</span>
          </template>
          <el-menu-item index="xlsx-to-csv">XLSX转CSV</el-menu-item>
          <el-menu-item index="xls-to-html">XLS转HTML</el-menu-item>
          <el-menu-item index="csv-to-json">CSV转JSON</el-menu-item>
          <el-menu-item index="excel-to-pdf">Excel转PDF</el-menu-item>
        </el-sub-menu>
        
        <!-- 压缩与归档 -->
        <el-sub-menu index="compress">
          <template #title>
            <el-icon><FolderOpened /></el-icon>
            <span>压缩与归档</span>
          </template>
          <el-menu-item index="zip-extract">ZIP解压</el-menu-item>
          <el-menu-item index="rar-extract">RAR解压</el-menu-item>
          <el-menu-item index="7z-extract">7z解压</el-menu-item>
          <el-menu-item index="folder-to-zip">文件夹转ZIP</el-menu-item>
          <el-menu-item index="files-to-zip">多文件合并为ZIP</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import {
  Document,
  VideoPlay,
  Headset,
  Picture,
  Grid,
  FolderOpened
} from '@element-plus/icons-vue';

const props = defineProps({
  activeMenu: {
    type: String,
    default: 'document'
  }
});

const activeMenu = ref(props.activeMenu);

// 监听外部activeMenu变化
watch(() => props.activeMenu, (newVal) => {
  activeMenu.value = newVal;
});

// 菜单选择事件
const emit = defineEmits(['menu-select']);
const handleMenuSelect = (index, indexPath) => {
  emit('menu-select', index, indexPath);
};
</script>

<style scoped>
.sidebar {
  width: 280px;
  height: 100vh;
  background-color: #001529;
  color: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #1890ff;
  background-color: #001529;
}

.sidebar-title {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  text-align: center;
}

.sidebar-scroll {
  flex: 1;
  overflow: hidden;
}

.sidebar-menu {
  background-color: #001529;
  border-right: none;
}

.sidebar-menu :deep(.el-menu-item),
.sidebar-menu :deep(.el-sub-menu__title) {
  color: rgba(255, 255, 255, 0.85);
  height: 48px;
  line-height: 48px;
  font-size: 14px;
}

.sidebar-menu :deep(.el-menu-item:hover),
.sidebar-menu :deep(.el-sub-menu__title:hover) {
  background-color: #1890ff;
  color: #fff;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: #1890ff;
  color: #fff;
}

.sidebar-menu :deep(.el-sub-menu .el-menu) {
  background-color: #000c17;
}

.sidebar-menu :deep(.el-sub-menu .el-menu-item) {
  padding-left: 60px !important;
}

.sidebar-menu :deep(.el-sub-menu .el-sub-menu .el-menu-item) {
  padding-left: 80px !important;
}

.sidebar-menu :deep(.el-icon) {
  color: rgba(255, 255, 255, 0.85);
  margin-right: 8px;
}

.sidebar-menu :deep(.el-menu-item:hover .el-icon),
.sidebar-menu :deep(.el-sub-menu__title:hover .el-icon),
.sidebar-menu :deep(.el-menu-item.is-active .el-icon) {
  color: #fff;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .sidebar {
    width: 240px;
  }
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -280px;
    top: 0;
    z-index: 1000;
    transition: left 0.3s ease;
  }
  
  .sidebar.open {
    left: 0;
  }
}
</style>
