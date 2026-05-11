/**
 * 存储管理模块
 * 负责数据的持久化存储,使用 localStorage API
 * 提供完整的错误处理和数据验证
 */

console.log('[TodoApp] 加载 storage.js');

const Storage = {
  // 存储键名常量
  STORAGE_KEY: 'todos',
  
  /**
   * 获取所有待办事项
   * @returns {Array} 待办事项数组
   * @description 从 localStorage 读取数据,解析并返回。如果读取失败返回空数组
   */
  getTodos() {
    logger.info('开始从 localStorage 加载数据');
    
    try {
      const todosJSON = localStorage.getItem(this.STORAGE_KEY);
      
      if (!todosJSON) {
        logger.info('localStorage 中没有数据,返回空数组');
        return [];
      }
      
      const todos = JSON.parse(todosJSON);
      
      // 验证数据格式
      if (!Array.isArray(todos)) {
        logger.error('数据格式错误:不是数组类型', todos);
        return [];
      }
      
      logger.log('从存储加载数据成功', `共 ${todos.length} 项`);
      return todos;
      
    } catch (error) {
      logger.error('加载数据失败', error);
      
      // 如果是 JSON 解析错误,清除损坏的数据
      if (error instanceof SyntaxError) {
        logger.warn('检测到损坏的数据,已清除');
        localStorage.removeItem(this.STORAGE_KEY);
      }
      
      return [];
    }
  },
  
  /**
   * 保存所有待办事项
   * @param {Array} todos - 待办事项数组
   * @description 将数据序列化并保存到 localStorage。处理配额超出等异常情况
   */
  saveTodos(todos) {
    logger.info(`准备保存数据,共 ${todos.length} 项`);
    
    try {
      // 验证输入
      if (!Array.isArray(todos)) {
        logger.error('保存失败:数据不是数组类型', todos);
        throw new Error('数据格式错误:必须是数组');
      }
      
      // 序列化数据
      const todosJSON = JSON.stringify(todos);
      
      // 记录数据大小
      const sizeInKB = (todosJSON.length / 1024).toFixed(2);
      logger.log('数据大小', `${sizeInKB} KB`);
      
      // 保存到 localStorage
      localStorage.setItem(this.STORAGE_KEY, todosJSON);
      
      logger.log('保存数据成功', `共 ${todos.length} 项`);
      
    } catch (error) {
      logger.error('保存数据失败', error);
      
      // 如果是配额超出错误,提示用户
      if (error.name === 'QuotaExceededError') {
        logger.error('存储空间不足', '已达到 localStorage 配额限制');
        alert('存储空间不足,请清理一些数据!');
      } else {
        alert('保存失败,请查看控制台了解详情');
      }
      
      throw error;
    }
  },
  
  /**
   * 清空所有数据
   * @description 从 localStorage 中删除所有待办事项数据
   */
  clearAll() {
    logger.info('准备清空所有数据');
    
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      logger.info('已清空所有数据');
      
    } catch (error) {
      logger.error('清空数据失败', error);
      throw error;
    }
  },
  
  /**
   * 导出数据(JSON 格式)
   * @returns {string} JSON 字符串(格式化)
   * @description 导出当前所有数据为格式化的 JSON 字符串,方便备份
   */
  exportData() {
    logger.info('导出数据');
    
    try {
      const todos = this.getTodos();
      const exportJSON = JSON.stringify(todos, null, 2);
      
      logger.log('导出数据成功', `共 ${todos.length} 项`);
      return exportJSON;
      
    } catch (error) {
      logger.error('导出数据失败', error);
      throw error;
    }
  },
  
  /**
   * 导入数据
   * @param {string} jsonData - JSON 字符串
   * @returns {boolean} 是否成功
   * @description 从 JSON 字符串导入数据,会验证数据格式
   */
  importData(jsonData) {
    logger.info('准备导入数据');
    
    try {
      // 解析 JSON
      const todos = JSON.parse(jsonData);
      
      // 验证数据格式
      if (!Array.isArray(todos)) {
        throw new Error('数据格式错误:不是数组');
      }
      
      // 验证每个项的结构
      const isValid = todos.every(todo => {
        return todo.id && 
               typeof todo.text === 'string' && 
               typeof todo.completed === 'boolean';
      });
      
      if (!isValid) {
        throw new Error('数据格式错误:项目结构不正确');
      }
      
      // 保存数据
      this.saveTodos(todos);
      
      logger.log('导入数据成功', `共 ${todos.length} 项`);
      return true;
      
    } catch (error) {
      logger.error('导入数据失败', error);
      alert('导入失败:数据格式错误\n' + error.message);
      return false;
    }
  },
  
  /**
   * 获取存储使用情况
   * @returns {{used: number, total: number, percentage: number}} 存储使用情况
   * @description 计算当前存储使用的空间(仅支持部分浏览器)
   */
  getStorageInfo() {
    try {
      const data = this.exportData();
      const used = new Blob([data]).size;
      
      // 大多数浏览器的 localStorage 限制是 5-10MB
      const total = 5 * 1024 * 1024; // 假设 5MB
      const percentage = ((used / total) * 100).toFixed(2);
      
      const info = { 
        used: used, 
        total: total, 
        percentage: parseFloat(percentage)
      };
      
      logger.log('存储使用情况', info);
      return info;
      
    } catch (error) {
      logger.error('获取存储信息失败', error);
      return { used: 0, total: 0, percentage: 0 };
    }
  }
};

console.log('[TodoApp] storage.js 加载完成');
