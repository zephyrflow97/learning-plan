// TodoInput.jsx - Todo 输入组件
import { useState } from 'react';

function TodoInput({ onAdd }) {
  const [text, setText] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('[TodoInput] 提交:', text);
    onAdd(text);
    setText('');
  };
  
  return (
    <form onSubmit={handleSubmit} className="todo-input">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="输入新任务..."
        className="input"
      />
      <button type="submit" className="btn-add">
        添加
      </button>
    </form>
  );
}

export default TodoInput;
