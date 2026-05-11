# Forms + Validation 练习题答案

本目录包含表单处理和验证相关练习题的答案。

## 📋 练习题列表

### 9. React Hook Form 基础表单
- **文件**: `09-login-form.tsx`
- **技术点**: React Hook Form、基本验证
- **关键概念**:
  - `useForm` hook 初始化表单
  - `register` 注册字段
  - `handleSubmit` 处理提交
  - 内置验证规则: required、pattern、minLength 等

### 16. 动态表单
- **文件**: `16-dynamic-tags-form.tsx`
- **技术点**: 动态字段、useFieldArray、复杂验证
- **关键概念**:
  - `useFieldArray` 管理动态字段数组
  - `append()` 添加新字段
  - `remove(index)` 删除字段
  - Zod `refine()` 自定义验证规则(检查重复)

---

## 🎯 学习要点

### React Hook Form 核心概念

#### 1. 基础用法
```tsx
import { useForm } from 'react-hook-form';

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const onSubmit = (data) => {
    console.log(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email', { required: true })} />
      {errors.email && <span>必填</span>}
      
      <button type="submit">提交</button>
    </form>
  );
}
```

#### 2. 验证规则

**内置规则**:
```tsx
<input
  {...register('email', {
    required: '邮箱必填',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: '邮箱格式不正确',
    },
    minLength: {
      value: 3,
      message: '至少3个字符',
    },
    maxLength: 50,
    validate: (value) => value !== 'admin' || '不能使用 admin',
  })}
/>
```

**Zod 集成**:
```tsx
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6位'),
});

const { register, handleSubmit } = useForm({
  resolver: zodResolver(schema),
});
```

#### 3. 动态字段 (useFieldArray)
```tsx
const { control } = useForm();
const { fields, append, remove } = useFieldArray({
  control,
  name: 'items',
});

return (
  <>
    {fields.map((field, index) => (
      <input key={field.id} {...register(`items.${index}.name`)} />
    ))}
    <button onClick={() => append({ name: '' })}>添加</button>
  </>
);
```

### 表单状态管理

```tsx
const {
  formState: {
    errors,        // 错误信息
    isValid,       // 是否有效
    isDirty,       // 是否修改过
    isSubmitting,  // 是否提交中
    touchedFields, // 被触摸的字段
    dirtyFields,   // 被修改的字段
  },
} = useForm();
```

### 性能优化

#### 1. 非受控组件(默认)
React Hook Form 默认使用非受控组件,性能更好:

```tsx
// ✅ 默认:非受控,使用 ref
<input {...register('email')} />

// ❌ 受控:每次输入都重渲染
const [email, setEmail] = useState('');
<input value={email} onChange={(e) => setEmail(e.target.value)} />
```

#### 2. 隔离重渲染
```tsx
// 使用 Controller 或单独组件隔离重渲染
function EmailField() {
  const { register } = useFormContext();
  return <input {...register('email')} />;
}
```

### 常用模式

#### 重置表单
```tsx
const { reset } = useForm();

// 重置为默认值
reset();

// 重置为新值
reset({ email: 'new@example.com' });
```

#### 设置值
```tsx
const { setValue } = useForm();

setValue('email', 'test@example.com');
setValue('email', 'test@example.com', {
  shouldValidate: true,  // 触发验证
  shouldDirty: true,     // 标记为 dirty
});
```

#### 获取值
```tsx
const { getValues, watch } = useForm();

// 获取所有值(不触发重渲染)
const values = getValues();

// 获取单个值(不触发重渲染)
const email = getValues('email');

// 监听值变化(会触发重渲染)
const email = watch('email');
```

#### 手动触发验证
```tsx
const { trigger } = useForm();

// 验证所有字段
await trigger();

// 验证特定字段
await trigger('email');
await trigger(['email', 'password']);
```

### Zod 高级验证

#### 自定义验证
```tsx
const schema = z.object({
  password: z.string(),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '密码不一致',
  path: ['confirmPassword'],  // 错误显示在哪个字段
});
```

#### 条件验证
```tsx
const schema = z.object({
  type: z.enum(['email', 'phone']),
  contact: z.string(),
}).refine((data) => {
  if (data.type === 'email') {
    return z.string().email().safeParse(data.contact).success;
  }
  return z.string().regex(/^\d{11}$/).safeParse(data.contact).success;
}, {
  message: '联系方式格式不正确',
  path: ['contact'],
});
```

#### 异步验证
```tsx
const schema = z.object({
  username: z.string().refine(
    async (username) => {
      const exists = await checkUsernameExists(username);
      return !exists;
    },
    { message: '用户名已存在' }
  ),
});
```

---

## 🔗 相关资源

- [React Hook Form 官方文档](https://react-hook-form.com/)
- [Zod 验证库](https://zod.dev/)
- [Form Validation Best Practices](https://react-hook-form.com/advanced-usage#SmartFormComponent)
- [TypeScript Support](https://react-hook-form.com/ts)
