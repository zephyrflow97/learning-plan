/**
 * 待办事项应用主逻辑
 * 负责应用的初始化、状态管理、事件处理和界面渲染
 */

console.log('[TodoApp] 加载 app.js');

// 应用主对象
const App = {
  // 应用数据
  todos: [],
  currentFilter: 'all', // 'all' | 'active' | 'completed'
  editingId: null,      // 正在编辑的任务 ID
  
  // DOM 元素缓存
  elements: {},
  
  /**
   * 初始化应用
   * @description 应用启动入口,执行初始化流程
   */
  init() {
    logger.info('======== 应用初始化开始 ========');
    
    try {
      // 1. 缓存 DOM 元素
      this.cacheElements();
      
      // 2. 加载数据
      this.loadData();
      
      // 3. 绑定事件
      this.bindEvents();
      
      // 4. 首次渲染
      this.render();
      
      logger.info('======== 应用初始化完成 ========');
      
    } catch (error) {
      logger.error('应用初始化失败', error);
      alert('应用启动失败,请刷新页面重试');
    }
  },
  
  /**
   * 缓存 DOM 元素
   * @description 提前获取并缓存常用的 DOM 元素,减少重复查询
   */
  cacheElements() {
    logger.info('开始缓存 DOM 元素');
    
    this.elements = {
      // 表单相关
      form: document.getElementById('todoForm'),
      input: document.getElementById('todoInput'),
      
      // 列表相关
      list: document.getElementById('todoList'),
      emptyState: document.getElementById('emptyState'),
      
      // 过滤按钮
      filterButtons: document.querySelectorAll('.btn-filter'),
      
      // 底部区域
      stats: document.getElementById('stats'),
      clearCompleted: document.getElementById('clearCompleted')
    };
    
    // 验证所有必需元素都存在
    const missingElements = [];
    for (const [key, element] of Object.entries(this.elements)) {
      if (!element || (element.length === 0 && key === 'filterButtons')) {
        missingElements.push(key);
      }
    }
    
    if (missingElements.length > 0) {
      throw new Error(`缺少必需的 DOM 元素: ${missingElements.join(', ')}`);
    }
    
    logger.log('DOM 元素缓存完成', `共 ${Object.keys(this.elements).length} 个`);
  },
  
  /**
   * 加载数据
   * @description 从 Storage 模块加载持久化数据
   */
  loadData() {
    logger.info('开始加载数据');
    
    this.todos = Storage.getTodos();
    
    logger.log('数据加载完成', {
      总数: this.todos.length,
      已完成: this.todos.filter(t => t.completed).length,
      进行中: this.todos.filter(t => !t.completed).length
    });
  },
  
  /**
   * 保存数据
   * @description 将当前数据保存到 Storage
   */
  saveData() {
    logger.info('保存数据到存储');
    Storage.saveTodos(this.todos);
  },
  
  /**
   * 绑定事件监听器
   * @description 为各个交互元素绑定事件处理函数
   */
  bindEvents() {
    logger.info('开始绑定事件监听器');
    
    // 1. 表单提交事件
    this.elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      logger.log('表单提交事件触发');
      this.handleAdd();
    });
    
    // 2. 列表事件委托(统一处理列表内的所有点击事件)
    this.elements.list.addEventListener('click', (e) => {
      const target = e.target;
      const todoItem = target.closest('.todo-item');
      
      if (!todoItem) return;
      
      const id = todoItem.dataset.id;
      logger.log('列表项点击', { id, target: target.className });
      
      // 根据点击的目标分发到不同处理函数
      if (target.classList.contains('todo-checkbox')) {
        this.handleToggle(id);
      } else if (target.classList.contains('btn-edit')) {
        this.handleEdit(id);
      } else if (target.classList.contains('btn-delete')) {
        this.handleDelete(id);
      } else if (target.classList.contains('btn-save')) {
        this.handleSave(id);
      } else if (target.classList.contains('btn-cancel')) {
        this.handleCancelEdit(id);
      }
    });
    
    // 3. 编辑输入框回车保存
    this.elements.list.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.classList.contains('todo-edit-input')) {
        const todoItem = e.target.closest('.todo-item');
        if (todoItem) {
          logger.log('编辑输入框回车', todoItem.dataset.id);
          this.handleSave(todoItem.dataset.id);
        }
      }
    });
    
    // 4. 过滤按钮事件
    this.elements.filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        logger.log('过滤按钮点击', button.dataset.filter);
        this.handleFilter(button.dataset.filter);
      });
    });
    
    // 5. 清除已完成按钮
    this.elements.clearCompleted.addEventListener('click', () => {
      logger.log('清除已完成按钮点击');
      this.handleClearCompleted();
    });
    
    logger.info('事件监听器绑定完成');
  },
  
  /**
   * 处理添加任务
   * @description 创建新任务并添加到列表
   */
  handleAdd() {
    const input = this.elements.input;
    const validation = validateInput(input.value);
    
    if (!validation.valid) {
      logger.info('输入内容为空,忽略添加操作');
      return;
    }
    
    // 创建新任务对象
    const todo = {
      id: generateId(),
      text: validation.value,
      completed: false,
      createdAt: Date.now()
    };
    
    // 添加到数组开头(最新的任务显示在最前面)
    this.todos.unshift(todo);
    
    logger.log('添加新任务', todo);
    
    // 保存数据并重新渲染
    this.saveData();
    this.render();
    
    // 清空输入框并重新聚焦
    input.value = '';
    input.focus();
  },
  
  /**
   * 处理切换完成状态
   * @param {string} id - 任务 ID
   * @description 切换任务的完成/未完成状态
   */
  handleToggle(id) {
    const todo = this.todos.find(t => t.id === id);
    
    if (!todo) {
      logger.error('未找到任务', id);
      return;
    }
    
    // 切换状态
    todo.completed = !todo.completed;
    
    logger.log('切换任务状态', { 
      id, 
      text: todo.text,
      completed: todo.completed 
    });
    
    this.saveData();
    this.render();
  },
  
  /**
   * 处理进入编辑模式
   * @param {string} id - 任务 ID
   * @description 将指定任务设置为编辑模式
   */
  handleEdit(id) {
    logger.log('进入编辑模式', id);
    
    this.editingId = id;
    this.render();
    
    // 聚焦到编辑输入框并选中文本
    const todoItem = this.elements.list.querySelector(`[data-id="${id}"]`);
    const editInput = todoItem?.querySelector('.todo-edit-input');
    
    if (editInput) {
      editInput.focus();
      editInput.select();
      logger.log('编辑输入框已聚焦');
    }
  },
  
  /**
   * 处理保存编辑
   * @param {string} id - 任务 ID
   * @description 保存编辑后的任务内容
   */
  handleSave(id) {
    const todoItem = this.elements.list.querySelector(`[data-id="${id}"]`);
    const editInput = todoItem?.querySelector('.todo-edit-input');
    
    if (!editInput) {
      logger.error('未找到编辑输入框', id);
      return;
    }
    
    const validation = validateInput(editInput.value);
    
    if (!validation.valid) {
      logger.warn('编辑内容为空', id);
      alert('任务内容不能为空!');
      editInput.focus();
      return;
    }
    
    // 更新任务文本
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      const oldText = todo.text;
      todo.text = validation.value;
      
      logger.log('保存任务编辑', { 
        id, 
        oldText, 
        newText: validation.value 
      });
      
      this.saveData();
    }
    
    // 退出编辑模式
    this.editingId = null;
    this.render();
  },
  
  /**
   * 处理取消编辑
   * @param {string} id - 任务 ID
   * @description 取消编辑,恢复原内容
   */
  handleCancelEdit(id) {
    logger.log('取消编辑', id);
    
    this.editingId = null;
    this.render();
  },
  
  /**
   * 处理删除任务
   * @param {string} id - 任务 ID
   * @description 删除指定任务(需要用户确认)
   */
  handleDelete(id) {
    const todo = this.todos.find(t => t.id === id);
    
    if (!todo) {
      logger.error('未找到任务', id);
      return;
    }
    
    // 确认删除
    if (!confirm(`确定要删除任务"${todo.text}"吗?`)) {
      logger.log('用户取消删除操作', id);
      return;
    }
    
    // 从数组中删除
    this.todos = this.todos.filter(t => t.id !== id);
    
    logger.log('删除任务', { id, text: todo.text });
    
    // 如果删除的是正在编辑的任务,退出编辑模式
    if (this.editingId === id) {
      this.editingId = null;
    }
    
    this.saveData();
    this.render();
  },
  
  /**
   * 处理过滤器切换
   * @param {string} filter - 过滤器类型 ('all' | 'active' | 'completed')
   * @description 切换任务显示过滤器
   */
  handleFilter(filter) {
    this.currentFilter = filter;
    
    // 更新过滤按钮的激活状态
    this.elements.filterButtons.forEach(button => {
      if (button.dataset.filter === filter) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
    
    logger.log('切换过滤器', filter);
    this.render();
  },
  
  /**
   * 处理清除已完成任务
   * @description 删除所有已完成的任务(需要用户确认)
   */
  handleClearCompleted() {
    const completedTodos = this.todos.filter(t => t.completed);
    const completedCount = completedTodos.length;
    
    if (completedCount === 0) {
      logger.info('没有已完成的任务');
      alert('没有已完成的任务!');
      return;
    }
    
    if (!confirm(`确定要清除 ${completedCount} 个已完成的任务吗?`)) {
      logger.log('用户取消清除操作');
      return;
    }
    
    this.todos = this.todos.filter(t => !t.completed);
    
    logger.log('清除已完成任务', `删除了 ${completedCount} 项`);
    
    this.saveData();
    this.render();
  },
  
  /**
   * 获取过滤后的任务列表
   * @returns {Array} 过滤后的任务数组
   * @description 根据当前过滤器返回相应的任务列表
   */
  getFilteredTodos() {
    let filtered;
    
    switch (this.currentFilter) {
      case 'active':
        filtered = this.todos.filter(t => !t.completed);
        break;
      case 'completed':
        filtered = this.todos.filter(t => t.completed);
        break;
      default:
        filtered = this.todos;
    }
    
    logger.log('过滤任务列表', { 
      filter: this.currentFilter, 
      count: filtered.length 
    });
    
    return filtered;
  },
  
  /**
   * 渲染单个任务项
   * @param {Object} todo - 任务对象
   * @returns {string} HTML 字符串
   * @description 根据任务状态生成相应的 HTML
   */
  renderTodoItem(todo) {
    const isEditing = this.editingId === todo.id;
    
    if (isEditing) {
      // 编辑模式
      return `
        <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
          <input 
            type="text" 
            class="todo-edit-input" 
            value="${escapeHTML(todo.text)}"
          >
          <div class="todo-actions">
            <button class="btn btn-icon btn-save">保存</button>
            <button class="btn btn-icon btn-cancel">取消</button>
          </div>
        </li>
      `;
    } else {
      // 正常模式
      return `
        <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
          <input 
            type="checkbox" 
            class="todo-checkbox" 
            ${todo.completed ? 'checked' : ''}
          >
          <span class="todo-text">${escapeHTML(todo.text)}</span>
          <div class="todo-actions">
            <button class="btn btn-icon btn-edit">✏️</button>
            <button class="btn btn-icon btn-delete">🗑️</button>
          </div>
        </li>
      `;
    }
  },
  
  /**
   * 渲染整个应用
   * @description 渲染任务列表和统计信息
   */
  render() {
    logger.info('开始渲染界面');
    
    const filteredTodos = this.getFilteredTodos();
    
    // 渲染任务列表
    if (filteredTodos.length === 0) {
      this.elements.list.innerHTML = '';
      this.elements.emptyState.classList.add('show');
      logger.log('显示空状态');
    } else {
      this.elements.emptyState.classList.remove('show');
      
      const html = filteredTodos
        .map(todo => this.renderTodoItem(todo))
        .join('');
      
      this.elements.list.innerHTML = html;
      logger.log('渲染任务列表', `${filteredTodos.length} 项`);
    }
    
    // 更新统计信息
    this.renderStats();
    
    logger.info('界面渲染完成');
  },
  
  /**
   * 渲染统计信息
   * @description 更新底部的统计数据显示
   */
  renderStats() {
    const total = this.todos.length;
    const completed = this.todos.filter(t => t.completed).length;
    const active = total - completed;
    
    let statsText = `共 ${total} 项`;
    
    if (completed > 0) {
      statsText += ` · ${completed} 项已完成`;
    }
    
    if (active > 0) {
      statsText += ` · ${active} 项进行中`;
    }
    
    this.elements.stats.textContent = statsText;
    
    // 更新清除按钮状态
    this.elements.clearCompleted.disabled = completed === 0;
    
    logger.log('更新统计信息', { total, completed, active });
  }
};

// DOM 加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
  logger.info('DOM 加载完成,准备初始化应用');
  App.init();
});

console.log('[TodoApp] app.js 加载完成');
