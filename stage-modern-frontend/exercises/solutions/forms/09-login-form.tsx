import { useForm } from 'react-hook-form';

type LoginForm = {
  email: string;
  password: string;
};

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = (data: LoginForm) => {
    console.log('[表单提交]', data);
    alert(`登录成功!\n邮箱: ${data.email}`);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px' }}>
      <h1>🔐 登录</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* 邮箱字段 */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            邮箱
          </label>
          <input
            type="email"
            {...register('email', {
              required: '请输入邮箱',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: '邮箱格式不正确',
              },
            })}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: errors.email ? '1px solid red' : '1px solid #ccc',
            }}
          />
          {errors.email && (
            <p style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* 密码字段 */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            密码
          </label>
          <input
            type="password"
            {...register('password', {
              required: '请输入密码',
              minLength: {
                value: 6,
                message: '密码至少 6 位',
              },
            })}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: errors.password ? '1px solid red' : '1px solid #ccc',
            }}
          />
          {errors.password && (
            <p style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
              {errors.password.message}
            </p>
          )}
        </div>

        {/* 提交按钮 */}
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          登录
        </button>
      </form>
    </div>
  );
}

export default LoginForm;
