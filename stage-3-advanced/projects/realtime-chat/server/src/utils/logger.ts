/**
 * 日志工具
 * 
 * 使用 Winston 实现结构化日志
 * 支持不同级别的日志输出和文件存储
 */

import winston from 'winston';
import path from 'path';

// 日志级别
const logLevel = process.env.LOG_LEVEL || 'info';

// 日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// 控制台日志格式（更易读）
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    
    // 如果有额外的元数据，添加到日志中
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    
    return msg;
  })
);

// 创建日志目录
const logsDir = path.join(process.cwd(), 'logs');

// 创建 Winston logger
const logger = winston.createLogger({
  level: logLevel,
  format: logFormat,
  transports: [
    // 错误日志文件
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // 所有日志文件
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// 开发环境添加控制台输出
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
  }));
}

/**
 * 日志工具类
 * 提供便捷的日志记录方法
 */
export class Logger {
  /**
   * 记录调试信息
   */
  static debug(message: string, meta?: any): void {
    logger.debug(message, meta);
  }

  /**
   * 记录普通信息
   */
  static info(message: string, meta?: any): void {
    logger.info(message, meta);
  }

  /**
   * 记录警告信息
   */
  static warn(message: string, meta?: any): void {
    logger.warn(message, meta);
  }

  /**
   * 记录错误信息
   */
  static error(message: string, error?: Error | any): void {
    if (error instanceof Error) {
      logger.error(message, {
        error: error.message,
        stack: error.stack,
      });
    } else {
      logger.error(message, { error });
    }
  }

  /**
   * 记录 HTTP 请求
   */
  static http(message: string, meta?: any): void {
    logger.http(message, meta);
  }
}

export default logger;
