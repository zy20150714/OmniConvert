class ErrorHandler {
  static handle(error, context = {}) {
    console.error('Error occurred:', {
      message: error.message,
      stack: error.stack,
      context
    });

    const errorResponse = {
      success: false,
      message: 'An error occurred',
      error: error.message
    };

    if (error.message.includes('ENOENT')) {
      errorResponse.message = '文件不存在或已被删除';
    } else if (error.message.includes('EACCES')) {
      errorResponse.message = '文件访问权限不足';
    } else if (error.message.includes('Timeout')) {
      errorResponse.message = '操作超时，请稍后重试';
    } else if (error.message.includes('Invalid data')) {
      errorResponse.message = '文件格式不正确或已损坏';
    } else if (error.message.includes('password') || error.message.includes('Password')) {
      errorResponse.message = '文件需要密码，暂不支持密码保护的文件';
    } else if (error.message.includes('Out of memory')) {
      errorResponse.message = '内存不足，请尝试较小的文件';
    } else if (error.code === 'LIMIT_FILE_SIZE') {
      errorResponse.message = '文件大小超过限制';
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      errorResponse.message = '不支持的文件类型';
    }

    return errorResponse;
  }

  static handleFFmpegError(stderr) {
    if (stderr.includes('Invalid data found when processing input')) {
      return '文件头损坏，请重新上传';
    } else if (stderr.includes('Error while decoding stream')) {
      return '视频流解码错误，请尝试其他文件';
    } else if (stderr.includes('Conversion failed')) {
      return '转换失败，请检查文件格式';
    } else if (stderr.includes('No such file or directory')) {
      return '文件不存在';
    } else if (stderr.includes('Permission denied')) {
      return '文件访问权限不足';
    } else if (stderr.includes('Timeout')) {
      return '转换超时，请尝试较小的文件';
    }
    return '转换失败，请检查文件是否损坏或格式不支持';
  }

  static handleLibreOfficeError(stderr) {
    if (stderr.includes('Error loading document')) {
      return '文件头损坏，请重新上传';
    } else if (stderr.includes('Timeout')) {
      return '转换超时，请尝试较小的文件';
    } else if (stderr.includes('Unsupported format')) {
      return '不支持的文件格式';
    } else if (stderr.includes('Password')) {
      return '文件需要密码，暂不支持密码保护的文件';
    }
    return '转换失败，请检查文件是否损坏或格式不支持';
  }

  static handleImageMagickError(stderr) {
    if (stderr.includes('unrecognized image format')) {
      return '无法识别的图片格式';
    } else if (stderr.includes('no decode delegate for this image format')) {
      return '缺少相应的图片解码器';
    } else if (stderr.includes('corrupt image')) {
      return '图片文件损坏';
    } else if (stderr.includes('No such file or directory')) {
      return '文件不存在';
    }
    return '图片处理失败，请检查文件是否损坏';
  }

  static async safeExecute(promise, context = {}) {
    try {
      return await promise;
    } catch (error) {
      return ErrorHandler.handle(error, context);
    }
  }

  static async safeExec(command, options = {}) {
    const { exec } = require('child_process');
    const { timeout = 300000 } = options;

    return new Promise((resolve, reject) => {
      exec(command, { timeout }, (error, stdout, stderr) => {
        if (error) {
          reject({
            error,
            stdout,
            stderr,
            command
          });
        } else {
          resolve({ stdout, stderr, command });
        }
      });
    });
  }
}

module.exports = ErrorHandler;
