/**
 * 工具函数模块
 * 提供通用的辅助函数,确保代码可复用性和可维护性
 */

console.log('[TodoApp] 加载 utils.js');

/**
 * 生成唯一 ID
 * @returns {string} 唯一标识符
 * @description 使用时间戳和随机字符串组合生成唯一 ID,确保每个任务都有唯一标识
 */
function generateId() {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substr(2, 9);
  const id = `${timestamp}-${randomStr}`;
  
  console.log(`[TodoApp] 生成唯一 ID: ${id}`);
  return id;
}

/**
 * 转义 HTML 特殊字符(防止 XSS 攻击)
 * @param {string} text - 需要转义的文本
 * @returns {string} 转义后的安全文本
 * @description 将用户输入的文本转义,防止恶意脚本注入
 */
function escapeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  const escaped = div.innerHTML;
  
  console.log(`[TodoApp] HTML 转义: "${text}" -> "${escaped}"`);
  return escaped;
}

/**
 * 格式化日期为相对时间
 * @param {number} timestamp - 时间戳
 * @returns {string} 格式化后的时间字符串
 * @description 将时间戳转换为人类可读的相对时间(如"5分钟前")
 */
function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  let result;
  if (diffMins < 1) {
    result = '刚刚';
  } else if (diffMins < 60) {
    result = `${diffMins} 分钟前`;
  } else if (diffHours < 24) {
    result = `${diffHours} 小时前`;
  } else if (diffDays < 7) {
    result = `${diffDays} 天前`;
  } else {
    result = date.toLocaleDateString('zh-CN');
  }
  
  console.log(`[TodoApp] 格式化日期: ${timestamp} -> ${result}`);
  return result;
}

/**
 * 验证输入内容
 * @param {string} text - 待验证的文本
 * @returns {{valid: boolean, value: string}} 验证结果和处理后的值
 * @description 去除首尾空格并验证内容是否为空
 */
function validateInput(text) {
  const trimmed = text.trim();
  const valid = trimmed.length > 0;
  
  console.log(`[TodoApp] 输入验证: "${text}" -> valid=${valid}, value="${trimmed}"`);
  
  return {
    valid,
    value: trimmed
  };
}

/**
 * 日志工具对象
 * @description 统一的日志管理工具,方便追踪应用运行状态
 */
const logger = {
  /**
   * 记录普通日志
   * @param {string} message - 日志消息
   * @param {*} data - 附加数据(可选)
   */
  log(message, data) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}][TodoApp] ${message}`, data !== undefined ? data : '');
  },
  
  /**
   * 记录错误日志
   * @param {string} message - 错误消息
   * @param {Error} error - 错误对象(可选)
   */
  error(message, error) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}][TodoApp Error] ${message}`, error || '');
  },
  
  /**
   * 记录信息日志
   * @param {string} message - 信息消息
   */
  info(message) {
    const timestamp = new Date().toISOString();
    console.info(`[${timestamp}][TodoApp Info] ${message}`);
  },
  
  /**
   * 记录警告日志
   * @param {string} message - 警告消息
   */
  warn(message) {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}][TodoApp Warning] ${message}`);
  }
};

console.log('[TodoApp] utils.js 加载完成');
