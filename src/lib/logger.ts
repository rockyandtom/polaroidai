/**
 * 日志工具
 * 用于在整个应用程序中统一记录日志
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// 根据环境确定日志详细程度
const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * 格式化日志消息
 */
const formatMessage = (level: LogLevel, message: string, data?: any): string => {
  const timestamp = new Date().toISOString();
  let formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  if (data) {
    try {
      const dataString = typeof data === 'object' 
        ? JSON.stringify(data, null, 2) 
        : String(data);
      formattedMessage += `\nData: ${dataString}`;
    } catch (err) {
      formattedMessage += `\nData: [无法序列化]`;
    }
  }
  
  return formattedMessage;
};

/**
 * 日志记录器
 */
const logger = {
  /**
   * 调试级别日志，仅在开发环境中输出
   */
  debug: (message: string, data?: any) => {
    if (isDevelopment) {
      console.debug(formatMessage('debug', message, data));
    }
  },
  
  /**
   * 信息级别日志
   */
  info: (message: string, data?: any) => {
    console.info(formatMessage('info', message, data));
  },
  
  /**
   * 警告级别日志
   */
  warn: (message: string, data?: any) => {
    console.warn(formatMessage('warn', message, data));
  },
  
  /**
   * 错误级别日志，总是记录
   */
  error: (message: string, error?: any) => {
    const errorData = error instanceof Error 
      ? { 
          message: error.message, 
          stack: error.stack,
          ...(error as any)
        } 
      : error;
    
    console.error(formatMessage('error', message, errorData));
  },
  
  /**
   * API请求日志
   */
  apiRequest: (method: string, url: string, params?: any) => {
    logger.info(`API请求: ${method} ${url}`, params);
  },
  
  /**
   * API响应日志
   */
  apiResponse: (method: string, url: string, status: number, data?: any) => {
    const message = `API响应: ${method} ${url} (状态码: ${status})`;
    if (status >= 400) {
      logger.error(message, data);
    } else {
      logger.info(message, data);
    }
  },
  
  /**
   * 业务操作日志
   */
  operation: (operation: string, result: 'success' | 'failure', details?: any) => {
    const message = `操作: ${operation} (${result})`;
    if (result === 'failure') {
      logger.error(message, details);
    } else {
      logger.info(message, details);
    }
  }
};

export default logger; 