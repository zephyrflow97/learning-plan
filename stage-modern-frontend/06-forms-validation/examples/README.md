# Forms & Validation Examples

本目录包含表单与验证章节的完整代码示例。

## 📁 目录结构

```
examples/
├── basic-forms/              基础表单示例
│   └── LoginForm.tsx         shadcn + RHF + Zod 登录表单
│
├── validation/               Zod 验证示例
│   └── zod-schema.ts         复杂 Schema 定义(嵌套对象、数组、文件)
│
├── server-actions/           Server Actions 集成
│   └── register-with-validation.ts  双重验证(客户端+服务端)
│
└── complex-forms/            复杂表单模式
    └── dynamic-array-fields.tsx     动态字段数组 + 文件上传
```

## 🚀 使用指南

### 1. 基础表单 (LoginForm)

**文件**: `basic-forms/LoginForm.tsx`

这是一个生产级登录表单,展示了:

✅ **React Hook Form** 非受控组件(性能优化)
✅ **Zod Schema** 客户端验证
✅ **shadcn/ui Form** 组件封装
✅ **NextAuth** 集成
✅ **错误处理** 表单级 + 字段级错误

**关键技术**:

```typescript
// 1. Schema 定义
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/),
  rememberMe: z.boolean(),
});

// 2. useForm 配置
const form = useForm({
  resolver: zodResolver(loginSchema), // Zod 验证集成
});

// 3. FormField 渲染
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage /> {/* 自动显示错误 */}
    </FormItem>
  )}
/>

// 4. 提交处理
const onSubmit = async (data) => {
  const result = await signIn('credentials', {
    ...data,
    redirect: false,
  });

  if (result?.error) {
    form.setError('root', { message: 'Invalid credentials' });
  }
};
```

**性能优化**:
- 输入时不触发重渲染(非受控组件)
- 失焦时验证(`mode: 'onBlur'` 可选)
- 提交时全量验证

### 2. Zod Schema 验证

**文件**: `validation/zod-schema.ts`

包含各种复杂验证场景:

#### 基础验证
```typescript
const userSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8).regex(/[A-Z]/),
  age: z.coerce.number().int().min(18),
});
```

#### 跨字段验证
```typescript
.refine(
  (data) => data.password === data.confirmPassword,
  { message: "Passwords don't match", path: ['confirmPassword'] }
)
```

#### 条件验证
```typescript
.refine(
  (data) => {
    if (!data.useSameAddress && !data.billingAddress) {
      return false;
    }
    return true;
  },
  { message: 'Billing address required', path: ['billingAddress'] }
)
```

#### 文件验证
```typescript
const avatarSchema = z
  .instanceof(FileList)
  .transform(files => files[0])
  .refine(file => file.size <= 5MB)
  .refine(file => ACCEPTED_TYPES.includes(file.type));
```

#### 数组验证
```typescript
const skillsSchema = z.object({
  skills: z.array(z.object({
    name: z.string(),
    level: z.number().min(1).max(10),
  })).min(1).max(10),
});
```

### 3. Server Actions 集成

**文件**: `server-actions/register-with-validation.ts`

展示客户端和服务端的双重验证:

**流程图**:
```
客户端提交表单
  ↓
1️⃣ 客户端 Zod 验证
  ↓ (通过)
2️⃣ 调用 Server Action
  ↓
3️⃣ 服务端 Zod 验证(含异步 refine)
  ↓ (通过)
4️⃣ 业务逻辑(哈希密码、创建用户)
  ↓
5️⃣ 返回结果
  ↓
6️⃣ 客户端映射错误回表单
```

**关键代码**:

```typescript
// 服务端验证(带异步 refine)
const createUserServerSchema = createUserSchema.extend({
  email: z.string().email().refine(
    async (email) => {
      const user = await db.user.findUnique({ where: { email } });
      return !user; // 返回 false 表示验证失败
    },
    { message: 'Email already registered' }
  ),
});

// Server Action
export async function createUser(data: unknown) {
  const result = await createUserServerSchema.safeParseAsync(data);
  
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }
  
  // 业务逻辑...
}

// 客户端错误映射
Object.entries(result.errors).forEach(([field, messages]) => {
  form.setError(field, { message: messages[0] });
});
```

**安全原则**:
- ✅ 客户端验证提升 UX
- ✅ 服务端验证保证安全
- ❌ **永远不信任客户端数据**

### 4. 复杂表单模式

**文件**: `complex-forms/dynamic-array-fields.tsx`

#### 动态字段数组

使用 `useFieldArray` 管理成员列表:

```typescript
const { fields, append, remove, insert } = useFieldArray({
  control: form.control,
  name: 'members',
});

// 渲染
{fields.map((field, index) => (
  <div key={field.id}> {/* 必须用 field.id,不能用 index */}
    <Input {...form.register(`members.${index}.name`)} />
    <Input {...form.register(`members.${index}.email`)} />
    <Button onClick={() => remove(index)}>Delete</Button>
  </div>
))}

// 添加新成员
<Button onClick={() => append({ name: '', email: '' })}>
  Add Member
</Button>
```

**关键要点**:
- **Key 管理**: 必须用 `field.id`,不能用 `index`
- **注册路径**: `members.${index}.name`
- **错误访问**: `errors.members?.[index]?.name?.message`
- **最小长度**: `z.array().min(1)` 防止空数组

#### 文件上传

```typescript
// Schema
const imageSchema = z
  .instanceof(FileList)
  .refine(files => files.length === 1)
  .transform(files => files[0])
  .refine(file => file.size <= 5MB)
  .refine(file => ACCEPTED_TYPES.includes(file.type));

// 预览
const fileList = form.watch('image');
useEffect(() => {
  if (fileList?.[0]) {
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(fileList[0]);
  }
}, [fileList]);

// 上传(使用 FormData)
const onSubmit = async (data) => {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('image', data.image);
  
  await fetch('/api/upload', {
    method: 'POST',
    body: formData, // 不要 JSON.stringify!
  });
};
```

## 🧪 测试与调试

### 调试表单状态

所有示例都包含调试区域:

```tsx
<details>
  <summary>Debug Info</summary>
  <pre>
    {JSON.stringify({
      values: form.watch(),
      errors: form.formState.errors,
      isDirty: form.formState.isDirty,
      isSubmitting: form.formState.isSubmitting,
      isValid: form.formState.isValid,
    }, null, 2)}
  </pre>
</details>
```

### 常见问题排查

**问题 1**: 输入时表单重渲染

```typescript
// ❌ 不要用受控组件
const [email, setEmail] = useState('');
<Input value={email} onChange={e => setEmail(e.target.value)} />

// ✅ 使用 register
<Input {...form.register('email')} />
```

**问题 2**: 文件上传验证失败

```typescript
// ❌ 错误的文件验证
z.instanceof(File) // 不对! register 返回 FileList

// ✅ 正确的文件验证
z.instanceof(FileList)
  .transform(files => files[0])
  .refine(file => file instanceof File)
```

**问题 3**: 数组字段 key 警告

```typescript
// ❌ 使用 index 作为 key
{fields.map((field, index) => (
  <div key={index}>...</div>
))}

// ✅ 使用 field.id
{fields.map((field, index) => (
  <div key={field.id}>...</div>
))}
```

## 📖 学习路径

1. **先读** `basic-forms/LoginForm.tsx` 理解基础流程
2. **再看** `validation/zod-schema.ts` 学习各种验证模式
3. **然后** `server-actions/register-with-validation.ts` 理解双重验证
4. **最后** `complex-forms/dynamic-array-fields.tsx` 掌握高级技巧

## 🔗 相关章节

- **主章节**: `../README.md`
- **Authentication 章节**: `../../07-authentication/`(实际登录流程)
- **Server Actions**: Next.js 文档

---

**最后更新**: 2026-02-08
