// TodoItem.jsx - Todo 项组件
function TodoItem({
  todo,
  isEditing,
  editText,
  onEditTextChange,
  onToggle,
  onDelete,
  onStartEdit,
  onSaveEdit,
  onCancelEdit
}) {
  // 编辑模式
  if (isEditing) {
    return (
      <div className="todo-item editing">
        <input
          type="text"
          value={editText}
          onChange={(e) => onEditTextChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSaveEdit();
            if (e.key === 'Escape') onCancelEdit();
          }}
          className="edit-input"
          autoFocus
        />
        <div className="edit-actions">
          <button onClick={onSaveEdit} className="btn-save">
            保存
          </button>
          <button onClick={onCancelEdit} className="btn-cancel">
            取消
          </button>
        </div>
      </div>
    );
  }
  
  // 正常显示模式
  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="checkbox"
      />
      
      <span
        className="text"
        onDoubleClick={() => onStartEdit(todo)}
        title="双击编辑"
      >
        {todo.text}
      </span>
      
      <div className="actions">
        <button
          onClick={() => onStartEdit(todo)}
          className="btn-edit"
        >
          编辑
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          className="btn-delete"
        >
          删除
        </button>
      </div>
    </div>
  );
}

export default TodoItem;
