const { EventEmitter } = require('events');

class TaskQueue extends EventEmitter {
  constructor(maxConcurrent = 3) {
    super();
    this.queue = [];
    this.activeTasks = 0;
    this.maxConcurrent = maxConcurrent;
  }

  add(task) {
    return new Promise((resolve, reject) => {
      const taskWithCallbacks = {
        ...task,
        resolve,
        reject,
        id: task.id || Date.now() + Math.random().toString(36).substr(2, 9),
        status: 'pending',
        createdAt: new Date(),
        startedAt: null,
        completedAt: null
      };
      
      this.queue.push(taskWithCallbacks);
      this.emit('taskAdded', taskWithCallbacks);
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.activeTasks >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const task = this.queue.shift();
    this.activeTasks++;
    task.status = 'processing';
    task.startedAt = new Date();
    
    this.emit('taskStarted', task);

    try {
      const result = await task.execute(task);
      task.status = 'completed';
      task.completedAt = new Date();
      task.result = result;
      this.activeTasks--;
      this.emit('taskCompleted', task);
      task.resolve(result);
    } catch (error) {
      task.status = 'failed';
      task.completedAt = new Date();
      task.error = error;
      this.activeTasks--;
      this.emit('taskFailed', task);
      task.reject(error);
    }

    this.processQueue();
  }

  getQueueStatus() {
    return {
      total: this.queue.length + this.activeTasks,
      pending: this.queue.length,
      processing: this.activeTasks,
      maxConcurrent: this.maxConcurrent
    };
  }

  getActiveTasks() {
    return this.queue.filter(task => task.status === 'processing');
  }

  clear() {
    const cancelledTasks = this.queue.map(task => {
      task.status = 'cancelled';
      task.reject(new Error('Task cancelled'));
      return task;
    });
    this.queue = [];
    this.emit('queueCleared', cancelledTasks);
    return cancelledTasks;
  }
}

const taskQueue = new TaskQueue(3);

const createConversionTask = (fileName, originalName, targetFormat, fileType) => {
  return {
    fileName,
    originalName,
    targetFormat,
    fileType,
    execute: async (task) => {
      const axios = require('axios');
      const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
      
      const response = await axios.post(`${API_BASE_URL}/api/convert/${task.fileType}`, {
        fileName: task.fileName,
        originalName: task.originalName,
        targetFormat: task.targetFormat
      });
      
      return response.data;
    }
  };
};

module.exports = {
  TaskQueue,
  taskQueue,
  createConversionTask
};
