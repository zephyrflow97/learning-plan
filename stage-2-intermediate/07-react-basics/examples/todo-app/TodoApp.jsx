// TodoApp.jsx - 完整 Todo 应用
import { useState, useEffect } from 'react';
import TodoInput from './TodoInput';
import TodoItem from './TodoItem';
import FilterButtons from './FilterButtons';
import Stats from './Stats';

function TodoApp() {
  console.log('[TodoApp] 组件渲染');
  
  // 从 localStorage 加载初始数据
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [
      { id: 1, text: '学习 React', completed: false },
      { id: 2, text: '写代码', completed: false }
    ];
  });
  
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  
  console.log('[TodoApp] 当前 todos:', todos);
  console.log('[TodoApp] 当前筛选:', filter);
  
  // 保存到 localStorage
  useEffect(() => {
    console.log('[useEffect] 保存 todos 到 localStorage');
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);
  
  // 添加 Todo
  const handleAdd = (text) => {
    if (text.trim() === '') {
      console.log('[TodoApp] 输入为空,忽略');
      return;
    }
    
    console.log('[TodoApp] 添加新 Todo:', text);
    
    const newTodo = {
      id: Date.now(),
      text: text.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    setTodos(prevTodos => [newTodo, ...prevTodos]);
  };
  
  // 切换完成状态
  const handleToggle = (id) => {
    console.log('[TodoApp] 切换 Todo 状态:', id);
    
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id
          ? { ...todo, completed: !todo.completed }
          : todo
      )
    );
  };
  
  // 删除 Todo
  const handleDelete = (id) => {
    console.log('[TodoApp] 删除 Todo:', id);
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  };
  
  // 开始编辑
  const handleStartEdit = (todo) => {
    console.log('[TodoApp] 开始编辑:', todo.id);
    setEditingId(todo.id);
    setEditText(todo.text);
  };
  
  // 保存编辑
  const handleSaveEdit = () => {
    if (editText.trim() === '') return;
    
    console.log('[TodoApp] 保存编辑:', editingId);
    
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === editingId ? { ...todo, text: editText.trim() } : todo
      )
    );
    
    setEditingId(null);
    setEditText('');
  };
  
  // 取消编辑
  const handleCancelEdit = () => {
    console.log('[TodoApp] 取消编辑');
    setEditingId(null);
    setEditText('');
  };
  
  // 筛选 Todos
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });
  
  // 统计
  const stats = {
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length
  };
  
  return (
    <div className="todo-app">
      <h1>Todo 列表</h1>
      
      <TodoInput onAdd={handleAdd} />
      
      <FilterButtons current={filter} onChange={setFilter} />
      
      <div className="todo-list">
        {filteredTodos.length === 0 ? (
          <p className="empty-message">暂无任务</p>
        ) : (
          filteredTodos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              isEditing={editingId === todo.id}
              editText={editText}
              onEditTextChange={setEditText}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onStartEdit={handleStartEdit}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
            />
          ))
        )}
      </div>
      
      <Stats stats={stats} />
    </div>
  );
}

export default TodoApp;
