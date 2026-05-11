import { getTodos, addTodo } from './actions';
import AddTodoForm from './AddTodoForm';

export default async function HomePage() {
  const todos = await getTodos();

  console.log('[Server Component] 渲染待办列表,数量:', todos.length);

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>
        📝 待办事项
      </h1>

      {/* 添加表单 */}
      <AddTodoForm addTodoAction={addTodo} />

      {/* 待办列表 */}
      <ul style={{ listStyle: 'none', padding: 0, marginTop: '30px' }}>
        {todos.map((todo, index) => (
          <li
            key={index}
            style={{
              padding: '15px',
              borderBottom: '1px solid #eee',
              fontSize: '18px',
            }}
          >
            {todo}
          </li>
        ))}
      </ul>
    </div>
  );
}
