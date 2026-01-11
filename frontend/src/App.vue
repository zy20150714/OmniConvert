<template>
  <div class="app-container">
    <!-- 侧边栏 -->
    <Sidebar 
      :active-menu="activeMenu"
      @menu-select="handleMenuSelect"
    />
    
    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 顶部导航栏 -->
      <header class="main-header">
        <div class="header-content">
          <h1 class="page-title">万能转换工坊</h1>
          <div class="header-actions">
            <el-button 
              type="primary" 
              size="small"
              plain
              @click="showAbout = true"
            >
              <el-icon><InfoFilled /></el-icon> 关于
            </el-button>
          </div>
        </div>
      </header>
      
      <!-- 内容区域 -->
      <section class="content-section">
        <!-- 转换状态队列 -->
        <div class="status-panel">
          <h3>转换队列</h3>
          <el-scrollbar height="400px">
            <div v-if="conversionTasks.length === 0" class="empty-queue">
              <el-icon class="empty-icon"><List /></el-icon>
              <p>暂无转换任务</p>
            </div>
            <el-timeline v-else>
              <el-timeline-item 
                v-for="task in conversionTasks" 
                :key="task.id"
                :timestamp="task.timestamp"
                :type="task.status === 'success' ? 'success' : task.status === 'error' ? 'danger' : 'info'"
              >
                <div class="task-item">
                  <div class="task-header">
                    <span class="task-filename">{{ task.filename }}</span>
                    <el-tag :type="getStatusType(task.status)">{{ task.statusText }}</el-tag>
                  </div>
                  <div class="task-info">
                    <span>{{ task.conversionType }}</span>
                    <span class="task-size">{{ task.size }}</span>
                  </div>
                  <div v-if="task.status === 'success'" class="task-actions">
                    <el-button 
                      type="success" 
                      size="small"
                      @click="downloadFile(task.downloadUrl)"
                    >
                      <el-icon><Download /></el-icon> 下载
                    </el-button>
                  </div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </el-scrollbar>
        </div>
        
        <!-- 文件上传区域 -->
        <div class="upload-panel">
          <FileUploader @task-added="handleTaskAdded" />
        </div>
      </section>
    </main>
    
    <!-- 关于对话框 -->
    <el-dialog
      v-model="showAbout"
      title="关于万能转换工坊"
      width="500px"
      center
    >
      <div class="about-content">
        <h3>万能转换工坊</h3>
        <p class="about-version">版本 1.0.0</p>
        <div class="about-description">
          <p>一个无广告、界面极简、转换速度极快的全格式文件转换工具。</p>
          <p>支持文档、视频、音频、图片等多种格式转换。</p>
        </div>
        <div class="about-features">
          <h4>核心功能：</h4>
          <ul>
            <li>文档办公类：PDF转换、Office互转、电子书转换</li>
            <li>视频媒体类：格式转换、音频提取、GIF处理</li>
            <li>音频处理类：格式互转、剪切合并、降噪音量调整</li>
            <li>图片处理类：格式互转、压缩裁剪、旋转水印</li>
            <li>表格数据类：Excel/CSV/JSON转换</li>
            <li>压缩与归档：ZIP/RAR/7z解压压缩</li>
          </ul>
        </div>
        <div class="about-tech">
          <h4>技术栈：</h4>
          <p>前端：Vue 3 + Vite + Element Plus</p>
          <p>后端：Node.js + Express</p>
          <p>转换内核：FFmpeg + LibreOffice + Pandoc + ImageMagick</p>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAbout = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { InfoFilled, List, Download } from '@element-plus/icons-vue';
import Sidebar from './components/Sidebar.vue';
import FileUploader from './components/FileUploader.vue';

// 状态管理
const activeMenu = ref('document');
const showAbout = ref(false);
const conversionTasks = ref([]);

// 处理菜单选择
const handleMenuSelect = (index, indexPath) => {
  activeMenu.value = index;
  console.log('菜单选择:', index, indexPath);
  // 可以根据菜单选择切换不同的转换选项
};

// 处理任务添加
const handleTaskAdded = (task) => {
  conversionTasks.value.unshift({
    id: Date.now() + Math.random().toString(36).substr(2, 9),
    ...task,
    timestamp: new Date().toLocaleString()
  });
};

// 下载文件
const downloadFile = (url) => {
  // 创建一个隐藏的a标签，设置下载属性
  const link = document.createElement('a');
  link.href = url;
  // 从URL中提取文件名
  const fileName = url.split('/').pop();
  link.download = fileName;
  // 模拟点击下载
  document.body.appendChild(link);
  link.click();
  // 清理
  document.body.removeChild(link);
};

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    'success': 'success',
    'error': 'danger',
    'pending': 'warning',
    'processing': 'info'
  };
  return statusMap[status] || 'info';
};
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f7fa;
  color: #303133;
}

/* 应用容器 */
.app-container {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* 主内容区 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 顶部导航栏 */
.main-header {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0 24px;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  color: #001529;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 内容区域 */
.content-section {
  flex: 1;
  display: flex;
  gap: 24px;
  padding: 24px;
  overflow: hidden;
}

/* 状态面板 */
.status-panel {
  width: 350px;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.status-panel h3 {
  margin: 0 0 20px 0;
  font-size: 16px;
  color: #303133;
}

.empty-queue {
  text-align: center;
  padding: 40px 0;
  color: #909399;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.task-item {
  padding: 12px;
  background-color: #fafafa;
  border-radius: 8px;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.task-filename {
  font-weight: bold;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

.task-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #606266;
  font-size: 14px;
  margin-bottom: 12px;
}

.task-size {
  font-size: 12px;
  color: #909399;
}

.task-actions {
  display: flex;
  gap: 8px;
}

/* 上传面板 */
.upload-panel {
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: auto;
}

/* 关于对话框 */
.about-content {
  text-align: center;
}

.about-version {
  color: #606266;
  margin-bottom: 20px;
}

.about-description {
  margin-bottom: 20px;
  line-height: 1.6;
}

.about-features {
  text-align: left;
  margin-bottom: 20px;
}

.about-features h4 {
  margin-bottom: 10px;
  text-align: center;
}

.about-features ul {
  padding-left: 20px;
  line-height: 1.8;
}

.about-tech {
  text-align: left;
}

.about-tech h4 {
  margin-bottom: 10px;
  text-align: center;
}

.about-tech p {
  margin-bottom: 8px;
  line-height: 1.6;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .content-section {
    flex-direction: column-reverse;
  }
  
  .status-panel {
    width: 100%;
    margin-top: 24px;
  }
  
  .upload-panel {
    flex: none;
  }
}

@media (max-width: 768px) {
  .app-container {
    flex-direction: column;
  }
  
  .content-section {
    padding: 16px;
    gap: 16px;
  }
  
  .header-content {
    padding: 0 16px;
  }
  
  .page-title {
    font-size: 18px;
  }
}
</style>
