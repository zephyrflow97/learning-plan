'use client';

import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        padding: '10px 20px',
        fontSize: '16px',
        backgroundColor: pending ? '#ccc' : '#0070f3',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: pending ? 'not-allowed' : 'pointer',
      }}
    >
      {pending ? '提交中...' : '添加'}
    </button>
  );
}

export default function AddTodoForm({
  addTodoAction,
}: {
  addTodoAction: (formData: FormData) => Promise<any>;
}) {
  return (
    <form action={addTodoAction} style={{ display: 'flex', gap: '10px' }}>
      <input
        type="text"
        name="text"
        placeholder="输入待办事项..."
        required
        style={{
          flex: 1,
          padding: '10px',
          fontSize: '16px',
          border: '1px solid #ccc',
          borderRadius: '4px',
        }}
      />
      <SubmitButton />
    </form>
  );
}
