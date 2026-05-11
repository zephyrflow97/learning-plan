# Forms & Validation — 输入即战场,永远不信任客户端

> *"Never trust the client."* — Every Backend Engineer, Ever
>
> 表单是 Web 应用最古老、也最被低估的交互模式。它看起来只是几个输入框和一个按钮。但在那些输入框的背后,隐藏着类型转换、格式验证、安全清洗、状态管理、错误展示、可访问性、性能优化的复杂网络。每一个生产事故的根源,都可以追溯到一个没有被正确验证的用户输入。2021 年,一个价值 10 亿美元的 DeFi 项目因为一个未验证的表单字段被黑客清空。2019 年,一家银行的转账系统因为没有验证金额字段的小数位数,被薅羊毛数百万。表单不是"简单的 UI"——它是**你的应用与敌对世界的第一道接触面**。

---

## 📖 本章内容

1. **表单的痛苦简史** — 从 jQuery 插件到 React Hook Form 的演进
2. **React Hook Form 核心** — 非受控组件的性能优势
3. **Zod Schema 验证** — 运行时验证与类型推断的完美融合
4. **RHF + Zod + shadcn 集成** — 生产级表单的黄金组合
5. **Server-Side 验证** — 双重城门的安全模型
6. **复杂表单模式** — 动态字段、嵌套对象、文件上传
7. **🧘 Zen of Code** — 输入即攻击面
8. **最佳实践与常见陷阱**
9. **章节练习**

**前置知识**: Stage 2 React Basics, shadcn/ui, Stage 5 Security Basics
**学习时间**: 2-3 天
**关键术语**: Controlled/Uncontrolled Components, Schema Validation, Server Actions, Form State Management

---

## 1. 表单的痛苦简史 — 为什么我们需要专用库

### 🎭 The Drama: 受控组件的性能噩梦

> **2015 年的最佳实践**:
> ```typescript
> function LoginForm() {
>   const [email, setEmail] = useState('');
>   const [password, setPassword] = useState('');
>   
>   return (
>     <form>
>       <input value={email} onChange={e => setEmail(e.target.value)} />
>       <input value={password} onChange={e => setPassword(e.target.value)} />
>     </form>
>   );
> }
> ```
> React 官方文档说:这是"受控组件"(Controlled Components),React 控制表单状态。完美!
>
> **2018 年的现实**: 你的注册表单有 15 个字段(姓名、邮箱、密码、确认密码、地址、城市、国家...)。用户每敲一个字,整个组件重新渲染 15 次。如果你在表单外面还有一个复杂的 UI(比如一个实时预览),每次击键都触发整个页面的重渲染。你的 60fps 变成了 20fps,用户开始抱怨输入卡顿。

这不是玩笑。让我们用数据说话:

```typescript
// ❌ 受控组件的性能陷阱
function HeavyForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    country: '',
    zipCode: '',
    phoneNumber: '',
    company: '',
    jobTitle: '',
    bio: '',
    interests: '',
    referralCode: ''
  });

  let renderCount = 0;
  console.log(`组件渲染次数: ${++renderCount}`);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(`字段 ${field} 变化,触发重渲染`);
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <form>
      <input value={formData.firstName} onChange={handleChange('firstName')} />
      {/* 15 个字段... */}
      <ExpensivePreviewComponent data={formData} /> {/* 每次都重新渲染! */}
    </form>
  );
}

// 用户在 firstName 输入 "John"
// → 触发 4 次组件渲染(J, o, h, n)
// → ExpensivePreviewComponent 重新渲染 4 次
// → 如果用户填完整个表单(假设平均每字段输入 10 个字符)
// → 150 次渲染!
```

### 🌌 The Big Picture: 表单处理的三个时代

#### 第一代 (2005-2014): jQuery 插件时代

```javascript
// jQuery Validation Plugin
$('#myForm').validate({
  rules: {
    email: { required: true, email: true },
    password: { required: true, minlength: 8 }
  },
  messages: {
    email: "请输入有效的邮箱",
    password: "密码至少 8 位"
  }
});

// ❌ 问题:
// 1. 验证规则和错误信息分离,维护困难
// 2. 没有类型安全
// 3. 直接操作 DOM,和 React 的虚拟 DOM 冲突
// 4. 全局状态管理混乱
```

#### 第二代 (2015-2019): React 受控组件 + 手工验证

```typescript
// 纯手工打造的痛苦
function Form() {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!values.email) newErrors.email = 'Email is required';
    if (values.email && !isValidEmail(values.email)) newErrors.email = 'Invalid email';
    if (!values.password) newErrors.password = 'Password is required';
    // ... 100 行验证逻辑
    setErrors(newErrors);
  };

  // ❌ 问题:
  // 1. 状态管理代码膨胀(values, errors, touched, isSubmitting...)
  // 2. 验证逻辑散落在各处
  // 3. 每次输入触发完整的组件重渲染
  // 4. 需要手动管理焦点、脏状态、提交状态
}
```

#### 第三代 (2019-现在): React Hook Form + Schema 验证

```typescript
// ✅ 现代方案
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

function Form() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  console.log('组件渲染'); // 只在首次渲染和提交时触发

  return (
    <form onSubmit={handleSubmit(data => console.log('Valid data:', data))}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      <input {...register('password')} type="password" />
      {errors.password && <span>{errors.password.message}</span>}
      <button type="submit">Submit</button>
    </form>
  );
}

// ✅ 优势:
// 1. 验证规则集中在 schema,单一数据源
// 2. TypeScript 类型自动推断
// 3. 非受控组件,性能优越(输入不触发重渲染)
// 4. 表单状态自动管理(dirty, touched, isSubmitting...)
```

> ⚛️ **The Physics: 受控 vs 非受控 — 观察者效应**
>
> 量子物理中有一个"观察者效应"——测量粒子会改变粒子的状态。受控组件就像量子测量:每次你"观察"(读取)输入框的值,你都在改变 React 的状态,触发重渲染。
>
> React Hook Form 的非受控方案就像"延迟测量"——它用 `ref` 直接读取 DOM 值,只在你真正需要时(提交、手动触发验证)才"观察"数据。**不观察,就不扰动**。这是性能优化的物理学隐喻。

---

## 2. React Hook Form 核心 — 性能与 DX 的完美平衡

### 2.1 安装与基础使用

```bash
npm install react-hook-form
```

```typescript
'use client';

import { useForm } from 'react-hook-form';

type FormData = {
  username: string;
  email: string;
  age: number;
};

export default function BasicForm() {
  // useForm 返回的核心方法
  const { 
    register,      // 注册输入字段
    handleSubmit,  // 处理表单提交
    formState,     // 表单状态(errors, isDirty, isSubmitting...)
    watch,         // 监听字段变化
    setValue,      // 手动设置值
    reset          // 重置表单
  } = useForm<FormData>({
    defaultValues: {
      username: '',
      email: '',
      age: 0
    }
  });

  console.log('组件渲染 - 注意:输入时不会触发');

  const onSubmit = (data: FormData) => {
    console.log('表单提交:', data);
    // { username: 'john', email: 'john@example.com', age: 25 }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="username">用户名</label>
        <input
          id="username"
          {...register('username', {
            required: 'Username is required',
            minLength: {
              value: 3,
              message: 'Username must be at least 3 characters'
            }
          })}
          className="border p-2 rounded"
        />
        {formState.errors.username && (
          <p className="text-red-500 text-sm">
            {formState.errors.username.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email">邮箱</label>
        <input
          id="email"
          type="email"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          })}
          className="border p-2 rounded"
        />
        {formState.errors.email && (
          <p className="text-red-500 text-sm">
            {formState.errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="age">年龄</label>
        <input
          id="age"
          type="number"
          {...register('age', {
            required: 'Age is required',
            min: { value: 18, message: 'Must be at least 18' },
            max: { value: 120, message: 'Must be less than 120' },
            valueAsNumber: true // 自动转换为数字类型
          })}
          className="border p-2 rounded"
        />
        {formState.errors.age && (
          <p className="text-red-500 text-sm">
            {formState.errors.age.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={formState.isSubmitting}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {formState.isSubmitting ? 'Submitting...' : 'Submit'}
      </button>

      {/* 调试区域 */}
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h3 className="font-bold">Form State</h3>
        <pre className="text-xs">
          {JSON.stringify({
            isDirty: formState.isDirty,          // 表单是否被修改
            dirtyFields: formState.dirtyFields,  // 哪些字段被修改
            touchedFields: formState.touchedFields, // 哪些字段被触碰
            isValid: formState.isValid,          // 表单是否有效
            isSubmitting: formState.isSubmitting // 是否正在提交
          }, null, 2)}
        </pre>
      </div>
    </form>
  );
}
```

### 2.2 register 的魔法 — 展开运算符背后的秘密

```typescript
// register('email') 返回什么?
const emailProps = register('email');
console.log(emailProps);
/*
{
  name: 'email',
  ref: (instance) => { /* 存储 DOM ref */ },
  onChange: (e) => { /* 更新内部状态 */ },
  onBlur: (e) => { /* 标记为 touched */ }
}
*/

// {...register('email')} 等价于:
<input
  name="email"
  ref={emailInputRef}
  onChange={handleChange}
  onBlur={handleBlur}
/>

// ⚛️ 为什么用 ref 而不是 value?
// 因为 ref 是非受控的——React Hook Form 不把值存在 React state 里,
// 而是在需要时直接从 DOM 读取。这避免了每次输入都触发 React 重渲染。
```

### 2.3 watch — 当你确实需要监听变化时

```typescript
function ConditionalForm() {
  const { register, watch } = useForm();

  // watch 会触发组件重渲染(只重渲染依赖这个值的组件)
  const userType = watch('userType');
  console.log('当前用户类型:', userType);

  return (
    <form>
      <select {...register('userType')}>
        <option value="personal">个人用户</option>
        <option value="business">企业用户</option>
      </select>

      {/* 条件渲染:根据 userType 显示不同字段 */}
      {userType === 'business' && (
        <>
          <input {...register('companyName')} placeholder="公司名称" />
          <input {...register('taxId')} placeholder="税号" />
        </>
      )}
    </form>
  );
}

// ⚠️ watch 的性能注意事项
// 1. watch() 不传参数 → 监听所有字段 → 任何输入都触发重渲染(危险!)
// 2. watch('field') → 只监听单个字段 → 该字段变化时才重渲染(推荐)
// 3. watch(['field1', 'field2']) → 监听多个字段
```

### 2.4 setValue — 程序化更新值

```typescript
function FormWithAPI() {
  const { register, setValue } = useForm();

  const loadUserData = async () => {
    console.log('从 API 加载用户数据...');
    const user = await fetch('/api/user').then(r => r.json());
    console.log('加载到的数据:', user);

    // 批量设置值
    setValue('name', user.name);
    setValue('email', user.email);
    setValue('bio', user.bio);

    // 或者使用 reset() 一次性设置所有值
    // reset(user);
  };

  return (
    <form>
      <button type="button" onClick={loadUserData}>Load Profile</button>
      <input {...register('name')} />
      <input {...register('email')} />
      <textarea {...register('bio')} />
    </form>
  );
}
```

### 🧠 CS Master's Bridge: React Hook Form 的架构

```typescript
// React Hook Form 的简化实现原理
class FormController {
  private fields = new Map(); // 存储所有字段的 ref
  private values = {};        // 缓存值(只在需要时读取)
  
  register(name: string) {
    return {
      name,
      ref: (element: HTMLInputElement) => {
        console.log(`注册字段: ${name}`);
        this.fields.set(name, element);
      },
      onChange: () => {
        // 不更新 React state,只在内部标记字段为 dirty
        console.log(`字段 ${name} 变化,但不触发 React 重渲染`);
      },
      onBlur: () => {
        // 标记为 touched,可选触发验证
        console.log(`字段 ${name} 失焦`);
      }
    };
  }

  getValues() {
    // 只在需要时从 DOM 读取值
    const values = {};
    this.fields.forEach((element, name) => {
      values[name] = element.value;
      console.log(`从 DOM 读取 ${name}:`, element.value);
    });
    return values;
  }

  handleSubmit(callback) {
    return (e: FormEvent) => {
      e.preventDefault();
      console.log('表单提交,现在才读取所有值');
      const values = this.getValues();
      callback(values);
    };
  }
}

// 这就是为什么 React Hook Form 快的原因:
// 它用 Proxy 和 ref 把 React 的控制推迟到最后一刻
```

---

## 3. Zod Schema 验证 — 类型安全的瑞士军刀

### 🌌 The Drama: 一份代码,两重保障

> 传统的验证方式有一个致命的问题:**类型定义和验证逻辑是分离的**。
>
> ```typescript
> // ❌ 问题:类型和验证不同步
> type User = {
>   email: string;
>   age: number;
> };
>
> function validateUser(data: any): data is User {
>   if (typeof data.email !== 'string') return false;
>   if (typeof data.age !== 'number') return false;
>   if (data.age < 0) return false;
>   // 你修改了 User 类型,但忘了更新这里的验证逻辑
>   // → 运行时灾难
>   return true;
> }
> ```
>
> Zod 的天才洞察:**用同一份 Schema 同时完成运行时验证和编译时类型推断**。

### 3.1 Zod 基础

```bash
npm install zod
```

```typescript
import { z } from 'zod';

// ✅ 定义 Schema
const userSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  age: z.number().min(18, 'Must be at least 18').max(120),
  newsletter: z.boolean().optional(),
  role: z.enum(['user', 'admin', 'moderator']),
});

// ✅ 自动推断 TypeScript 类型
type User = z.infer<typeof userSchema>;
// 等价于:
// type User = {
//   email: string;
//   password: string;
//   age: number;
//   newsletter?: boolean;
//   role: 'user' | 'admin' | 'moderator';
// }

console.log('推断的类型:', typeof {} as User);

// ✅ 运行时验证
const result = userSchema.safeParse({
  email: 'invalid-email',
  password: '123',
  age: 15,
  role: 'user'
});

if (!result.success) {
  console.log('验证失败:', result.error.issues);
  /*
  [
    {
      code: 'invalid_string',
      validation: 'email',
      path: ['email'],
      message: 'Invalid email format'
    },
    {
      code: 'too_small',
      minimum: 8,
      path: ['password'],
      message: 'Password must be at least 8 characters'
    },
    {
      code: 'too_small',
      minimum: 18,
      path: ['age'],
      message: 'Must be at least 18'
    }
  ]
  */
} else {
  console.log('验证成功:', result.data);
  // result.data 的类型是 User,完全类型安全
}
```

### 3.2 Zod 的常用验证器

```typescript
// ✅ 字符串验证
const stringSchema = z.string()
  .min(3, 'Too short')
  .max(100, 'Too long')
  .email('Invalid email')             // 邮箱格式
  .url('Invalid URL')                 // URL 格式
  .uuid('Invalid UUID')               // UUID 格式
  .regex(/^[A-Z]+$/, 'Must be uppercase')  // 正则
  .trim()                             // 自动去除首尾空格
  .toLowerCase();                     // 自动转小写

console.log('验证字符串:', stringSchema.parse('  HELLO  '));
// → 'hello'(经过 trim 和 toLowerCase 转换)

// ✅ 数字验证
const numberSchema = z.number()
  .int('Must be an integer')
  .positive('Must be positive')
  .min(0)
  .max(100)
  .multipleOf(5, 'Must be a multiple of 5');

console.log('验证数字:', numberSchema.parse(50));
// → 50

// ✅ 日期验证
const dateSchema = z.date()
  .min(new Date('2020-01-01'), 'Must be after 2020')
  .max(new Date('2030-12-31'), 'Must be before 2030');

// ✅ 数组验证
const tagsSchema = z.array(z.string())
  .min(1, 'At least one tag required')
  .max(10, 'Maximum 10 tags');

console.log('验证数组:', tagsSchema.parse(['react', 'nextjs']));

// ✅ 联合类型
const idSchema = z.union([
  z.string().uuid(),
  z.number().int().positive()
]);

console.log('验证联合类型:', idSchema.parse('550e8400-e29b-41d4-a716-446655440000'));
console.log('验证联合类型:', idSchema.parse(123));

// ✅ 可选字段与默认值
const configSchema = z.object({
  theme: z.enum(['light', 'dark']).default('light'),
  fontSize: z.number().optional(),
  enableNotifications: z.boolean().default(true),
});

console.log('带默认值的验证:', configSchema.parse({}));
// → { theme: 'light', enableNotifications: true }
```

### 3.3 复杂对象验证

```typescript
// ✅ 嵌套对象
const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  country: z.string(),
  zipCode: z.string().regex(/^\d{5}$/, 'Must be 5 digits'),
});

const userWithAddressSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  address: addressSchema,  // 嵌套 schema
});

console.log('验证嵌套对象:', userWithAddressSchema.parse({
  name: 'John',
  email: 'john@example.com',
  address: {
    street: '123 Main St',
    city: 'New York',
    country: 'USA',
    zipCode: '10001'
  }
}));

// ✅ 数组中的对象
const postSchema = z.object({
  title: z.string(),
  comments: z.array(
    z.object({
      author: z.string(),
      content: z.string(),
      createdAt: z.date()
    })
  )
});

// ✅ 条件验证 (refinement)
const passwordSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'], // 错误显示在哪个字段
});

console.log('验证密码匹配:');
const passwordResult = passwordSchema.safeParse({
  password: 'secret123',
  confirmPassword: 'secret456'
});
if (!passwordResult.success) {
  console.log('验证失败:', passwordResult.error.issues);
}

// ✅ 高级:superRefine (多字段联合验证)
const paymentSchema = z.object({
  paymentMethod: z.enum(['card', 'paypal', 'bank']),
  cardNumber: z.string().optional(),
  paypalEmail: z.string().optional(),
  bankAccount: z.string().optional(),
}).superRefine((data, ctx) => {
  // 根据 paymentMethod 验证对应字段
  if (data.paymentMethod === 'card' && !data.cardNumber) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['cardNumber'],
      message: 'Card number is required for card payment'
    });
  }
  if (data.paymentMethod === 'paypal' && !data.paypalEmail) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['paypalEmail'],
      message: 'PayPal email is required for PayPal payment'
    });
  }
  console.log('执行 superRefine 验证:', data);
});
```

### 🧰 The Toolbox: Zod vs 其他验证库

| 库 | 类型推断 | 运行时验证 | 包大小 | 使用场景 |
|----|---------|-----------|-------|---------|
| **Zod** | ✅ 完美 | ✅ 完整 | ~14KB | 全能选手,推荐首选 |
| **Yup** | ⚠️ 需要手动 | ✅ 完整 | ~16KB | 老牌库,社区大,但类型推断弱 |
| **Joi** | ❌ 无 | ✅ 完整 | ~150KB | 后端验证好,前端太重 |
| **io-ts** | ✅ 完美 | ✅ 完整 | ~8KB | 函数式风格,学习曲线陡 |
| **ArkType** | ✅ 完美 | ✅ 完整 | ~6KB | 新起之秀,性能最好,但生态小 |

```typescript
// 为什么选择 Zod?

// ✅ Zod: 类型推断优雅
const zodSchema = z.object({ name: z.string() });
type ZodType = z.infer<typeof zodSchema>; // 自动推断

// ⚠️ Yup: 类型推断需要手动
import * as yup from 'yup';
const yupSchema = yup.object({ name: yup.string().required() });
type YupType = yup.InferType<typeof yupSchema>; // 需要显式调用

// ❌ Joi: 无类型推断(设计用于 Node.js)
import Joi from 'joi';
const joiSchema = Joi.object({ name: Joi.string() });
// 无法自动推断类型,需要手写 interface

console.log('Zod 的优势:一份 schema,两重保障');
```

---

## 4. RHF + Zod + shadcn 集成 — 生产级表单的黄金组合

### 🎭 The Drama: 从混乱到秩序

> 你可以手动把 React Hook Form、Zod、shadcn 组件拼在一起——每个表单字段写 30 行模板代码(label、input、error message、validation...)。或者,你可以用 shadcn 的 `Form` 组件——一个在 RHF 和 Zod 之上的**薄抽象层**,把 80% 的模板代码消灭掉。

### 4.1 shadcn Form 组件安装

```bash
npx shadcn@latest add form
```

这会安装:
- `@hookform/resolvers` (连接 RHF 和 Zod)
- `react-hook-form`
- shadcn 的 `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` 组件

### 4.2 完整的登录表单示例

**完整代码**: [examples/basic-forms/LoginForm.tsx](./examples/basic-forms/LoginForm.tsx)

> 💡 **查看完整实现**: 包含 shadcn/ui 组件集成、NextAuth 登录、错误处理的完整登录表单请查看 [examples/basic-forms/LoginForm.tsx](./examples/basic-forms/LoginForm.tsx)

关键要点:
- 使用 `zodResolver` 集成 Zod 验证
- `FormField` 组件自动处理错误显示
- `form.setError('root')` 设置全局错误(来自 API)
- `isSubmitting` 状态自动管理

核心 Schema:

```typescript
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain number'),
  rememberMe: z.boolean().default(false),
});
```

### 4.3 注册表单示例(更复杂的验证)

关键要点:
- **密码复杂度验证**: 多个 `regex` 规则确保强密码
- **类型转换**: `z.coerce.number()` 自动将字符串转数字
- **跨字段验证**: `refine()` 检查密码匹配
- **shadcn Select**: 与 RHF 的集成方式
- **布尔值验证**: `refine(val => val === true)` 强制接受条款

> 💡 **查看完整 Schema**: 包含所有验证规则的 Zod Schema 定义请查看 [examples/validation/zod-schema.ts](./examples/validation/zod-schema.ts)

核心技巧:

```typescript
// ✅ 跨字段验证
.refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'], // 错误显示在 confirmPassword 字段
});

// ✅ 自动类型转换
age: z.coerce.number().int().min(18).max(120)
```

---

## 5. Server-Side 验证 — 双重验证的城门

### ⚛️ The Drama: 客户端验证是外城门,服务端验证是内城门

> **客户端验证的作用**: 提升用户体验——立即反馈错误,避免无效提交。
>
> **客户端验证的局限**: **任何人都可以绕过它**。打开浏览器开发者工具,禁用 JavaScript,或者直接用 `curl` 发 POST 请求,客户端验证就不存在了。
>
> **服务端验证的铁律**: 永远不信任来自客户端的任何数据。即使你的前端做了完美的验证,也要在服务器上重新验证一遍。

```typescript
// ❌ 危险:只在客户端验证
'use client';

const schema = z.object({ amount: z.number().max(1000) });

function TransferForm() {
  const form = useForm({ resolver: zodResolver(schema) });
  
  const onSubmit = async (data) => {
    // 直接发送到服务器,假设数据是安全的
    await fetch('/api/transfer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  };
}

// 攻击者:
// fetch('/api/transfer', {
//   method: 'POST',
//   body: JSON.stringify({ amount: 1000000 }) // 绕过客户端验证
// });
```

### 5.1 使用 Server Actions + Zod 实现双重验证

**完整代码**: [examples/server-actions/register-with-validation.ts](./examples/server-actions/register-with-validation.ts)

> 💡 **查看完整实现**: 包含客户端表单、Server Action、错误映射的完整双重验证流程请查看 [examples/server-actions/register-with-validation.ts](./examples/server-actions/register-with-validation.ts)

**双重验证流程**:

```
┌──────────────┐     1. 客户端验证        ┌──────────────┐
│   浏览器     │  ──────────────────────► │  Zod Schema  │
│ (Client)     │         (第一道城门)      │ (Client)     │
└──────┬───────┘                          └──────────────┘
       │ 2. 调用 Server Action
       ▼
┌──────────────┐     3. 服务端验证        ┌──────────────┐
│   Server     │  ──────────────────────► │  Zod Schema  │
│   Action     │         (第二道城门)      │ (Server)     │
└──────────────┘                          └──────────────┘
```

关键要点:
- **相同的 Schema**: 客户端和服务端使用同一个 `loginSchema`
- **错误映射**: `result.error.flatten().fieldErrors` 格式化错误
- **永远重新验证**: 即使客户端验证通过,服务端也要重新验证

核心代码片段:

```typescript
// Server Action
const result = loginSchema.safeParse(formData);
if (!result.success) {
  return { success: false, errors: result.error.flatten().fieldErrors };
}

// Client: 映射服务器错误回表单
Object.entries(result.errors).forEach(([field, messages]) => {
  form.setError(field as any, { type: 'server', message: messages?.[0] });
});
```

### 5.2 复用 Schema 的最佳实践

**完整代码**: [examples/validation/zod-schema.ts](./examples/validation/zod-schema.ts)

**架构模式**:

```
lib/schemas/user.ts (共享)
  ├─ createUserSchema       → 客户端使用
  ├─ createUserServerSchema → 服务端使用(extends 基础 schema)
  └─ CreateUserInput        → TypeScript 类型

app/register/page.tsx
  └─ 使用 createUserSchema + zodResolver

app/actions/user.ts
  └─ 使用 createUserServerSchema.safeParseAsync()
```

关键要点:
- **Schema 复用**: 避免客户端/服务端验证规则不一致
- **扩展 Schema**: 服务端用 `.extend()` 添加额外验证(如数据库唯一性检查)
- **异步验证**: `safeParseAsync()` 支持异步 `refine`(如查询数据库)

### 🧘 Zen of Code: 输入即攻击面

> **安全第一定律**: 所有外部输入都是不可信的。用户输入、URL 参数、Cookie、请求头——一切来自客户端的东西。
>
> **验证的层次**:
> 1. **类型验证**: 这是字符串还是数字?(TypeScript 编译时 + Zod 运行时)
> 2. **格式验证**: 这是有效的邮箱/URL/UUID 吗?(Zod)
> 3. **业务规则验证**: 金额是否在允许范围?用户是否有权限?(Zod + 自定义逻辑)
> 4. **安全清洗**: 去除 SQL 注入、XSS 攻击向量(Prisma 自动转义 + DOMPurify)
>
> Zod 覆盖了前 3 层。第 4 层需要配合其他工具(Prisma、DOMPurify、Content Security Policy)。

```typescript
// ✅ 安全清洗示例
import DOMPurify from 'isomorphic-dompurify';

const bioSchema = z.string()
  .max(500)
  .transform(val => {
    // 清洗 HTML,防止 XSS
    const sanitized = DOMPurify.sanitize(val);
    console.log('原始输入:', val);
    console.log('清洗后:', sanitized);
    return sanitized;
  });

// 攻击尝试:
const maliciousInput = '<script>alert("XSS")</script>Hello';
const result = bioSchema.parse(maliciousInput);
console.log('最终存储:', result);
// → "Hello" (script 标签被移除)
```

---

## 6. 复杂表单模式 — 动态字段、嵌套对象、文件上传

### 6.1 动态字段数组 — useFieldArray

**完整代码**: [examples/complex-forms/dynamic-array-fields.tsx](./examples/complex-forms/dynamic-array-fields.tsx)

> 💡 **查看完整实现**: 包含团队成员管理、文件上传的完整动态表单请查看 [examples/complex-forms/dynamic-array-fields.tsx](./examples/complex-forms/dynamic-array-fields.tsx)

**useFieldArray API**:

```typescript
const { fields, append, remove, insert, update } = useFieldArray({
  control: form.control,
  name: 'members', // 数组字段名
});

// fields: 渲染用的字段数组(每个元素有 `id` 属性)
// append: 添加新元素
// remove: 删除元素
// insert: 在指定位置插入元素
// update: 更新元素
```

关键要点:
- **Key 管理**: 必须用 `field.id` 作为 `key`,不能用 `index`
- **注册路径**: `register(\`members.${index}.name\`)`
- **错误访问**: `errors.members?.[index]?.name?.message`
- **最小长度**: `z.array().min(1)` 防止空数组提交

### 6.2 文件上传验证

> 💡 **查看完整实现**: 文件上传示例包含在动态表单文件中,请查看 [examples/complex-forms/dynamic-array-fields.tsx](./examples/complex-forms/dynamic-array-fields.tsx) 的 `ImageUploadExample` 组件

**文件验证的关键步骤**:

```typescript
// ✅ 1. FileList → File 转换
z.instanceof(FileList)
  .refine(files => files.length === 1, 'Please select a file')
  .transform(files => files[0]) // 转换为 File 对象

// ✅ 2. 文件大小验证
  .refine(file => file.size <= MAX_FILE_SIZE, 'Max file size is 5MB')

// ✅ 3. 文件类型验证
  .refine(
    file => ACCEPTED_IMAGE_TYPES.includes(file.type),
    'Only .jpg, .jpeg, .png and .webp formats are supported'
  )
```

关键要点:
- **FileList vs File**: `input[type=file]` 返回 `FileList`,需要用 `.transform()` 转换
- **图片预览**: 使用 `FileReader.readAsDataURL()`
- **上传格式**: 用 `FormData` 而不是 JSON(文件无法 JSON 序列化)

### 6.3 嵌套对象与条件验证

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// ✅ 复杂嵌套 Schema
const addressSchema = z.object({
  street: z.string().min(1, 'Street required'),
  city: z.string().min(1, 'City required'),
  state: z.string().min(2, 'State required'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
});

const orderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(1),
      price: z.number().min(0),
    })
  ).min(1, 'At least one item required'),
  
  shippingAddress: addressSchema,
  
  useSameAddressForBilling: z.boolean(),
  
  billingAddress: addressSchema.optional(),
  
  paymentMethod: z.enum(['credit_card', 'paypal', 'bank_transfer']),
  
  creditCard: z.object({
    number: z.string().regex(/^\d{16}$/, 'Invalid card number'),
    expiry: z.string().regex(/^\d{2}\/\d{2}$/, 'Format: MM/YY'),
    cvv: z.string().regex(/^\d{3,4}$/, 'Invalid CVV'),
  }).optional(),
  
}).refine(data => {
  // ✅ 条件验证:如果不使用相同地址,必须提供账单地址
  if (!data.useSameAddressForBilling && !data.billingAddress) {
    return false;
  }
  return true;
}, {
  message: 'Billing address is required',
  path: ['billingAddress'],
}).refine(data => {
  // ✅ 条件验证:如果选择信用卡支付,必须提供卡信息
  if (data.paymentMethod === 'credit_card' && !data.creditCard) {
    return false;
  }
  return true;
}, {
  message: 'Credit card information is required',
  path: ['creditCard'],
});

type OrderFormData = z.infer<typeof orderSchema>;

export function OrderForm() {
  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      items: [{ productId: 'prod_1', quantity: 1, price: 29.99 }],
      useSameAddressForBilling: true,
      paymentMethod: 'credit_card',
    },
  });

  const useSameAddress = form.watch('useSameAddressForBilling');
  const paymentMethod = form.watch('paymentMethod');

  console.log('表单状态:', {
    useSameAddress,
    paymentMethod,
    errors: form.formState.errors,
  });

  const onSubmit = (data: OrderFormData) => {
    console.log('订单数据:', data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* 配送地址 */}
      <div className="border p-4 rounded">
        <h3 className="font-bold mb-2">Shipping Address</h3>
        <input {...form.register('shippingAddress.street')} placeholder="Street" className="border p-2 rounded w-full mb-2" />
        <input {...form.register('shippingAddress.city')} placeholder="City" className="border p-2 rounded w-full mb-2" />
        {/* ... 其他地址字段 ... */}
      </div>

      {/* 账单地址开关 */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          {...form.register('useSameAddressForBilling')}
          className="h-4 w-4"
        />
        <label>Use same address for billing</label>
      </div>

      {/* 条件渲染账单地址 */}
      {!useSameAddress && (
        <div className="border p-4 rounded">
          <h3 className="font-bold mb-2">Billing Address</h3>
          <input {...form.register('billingAddress.street')} placeholder="Street" className="border p-2 rounded w-full mb-2" />
          {/* ... */}
        </div>
      )}

      {/* 支付方式 */}
      <div>
        <label>Payment Method</label>
        <select {...form.register('paymentMethod')} className="border p-2 rounded w-full">
          <option value="credit_card">Credit Card</option>
          <option value="paypal">PayPal</option>
          <option value="bank_transfer">Bank Transfer</option>
        </select>
      </div>

      {/* 条件渲染信用卡信息 */}
      {paymentMethod === 'credit_card' && (
        <div className="border p-4 rounded">
          <h3 className="font-bold mb-2">Credit Card</h3>
          <input {...form.register('creditCard.number')} placeholder="Card Number" className="border p-2 rounded w-full mb-2" />
          <input {...form.register('creditCard.expiry')} placeholder="MM/YY" className="border p-2 rounded w-full mb-2" />
          <input {...form.register('creditCard.cvv')} placeholder="CVV" className="border p-2 rounded w-full mb-2" />
        </div>
      )}

      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Place Order
      </button>
    </form>
  );
}
```

---

## 7. 🧘 Zen of Code — 表单即信任边界

> 表单是用户和系统之间的接口。在这个接口上,发生着一场无声的战争:
> - **用户期望**:我输入合法数据,系统应该接受。
> - **系统要求**:我必须验证每一个字节,因为下一个输入可能是攻击。
>
> 好的表单设计在这两个极端之间找到平衡:
> - **对诚实用户友好**:即时反馈、清晰的错误信息、智能的默认值。
> - **对攻击者严防死守**:双重验证、输入清洗、最小权限原则。
>
> 这不仅是技术问题,这是**信任的工程学**。

### 表单设计的哲学原则

1. **最小惊讶原则 (Principle of Least Astonishment)**
   - 用户不应该被表单的行为吓到。
   - 例子:密码强度指示器应该在输入时实时更新,而不是提交后才说"密码太弱"。

2. **渐进式披露 (Progressive Disclosure)**
   - 不要一次展示 50 个字段。根据用户的选择逐步展示相关字段。
   - 例子:选择"企业用户"后才显示"公司名称"字段。

3. **容错性 (Fault Tolerance)**
   - 用户会犯错。表单应该尽可能宽容。
   - 例子:邮箱字段自动去除首尾空格、自动转小写。

4. **安全左移 (Shift-Left Security)**
   - 在开发早期就考虑安全,而不是上线后打补丁。
   - 例子:用 Zod schema 同时定义类型和验证,消灭"类型安全但运行时不安全"的问题。

---

## 8. 最佳实践与常见陷阱

### ✅ 最佳实践

#### 1. 单一数据源的验证规则

```typescript
// ✅ 好:Schema 是唯一的验证规则源
const schema = z.object({
  email: z.string().email(),
});

// 客户端
const form = useForm({ resolver: zodResolver(schema) });

// 服务器端
export async function action(data: unknown) {
  const result = schema.safeParse(data);
  // 使用同一个 schema
}
```

#### 2. 清晰的错误信息

```typescript
// ✅ 好:用户能理解的错误信息
const schema = z.object({
  age: z.number()
    .min(18, 'You must be at least 18 years old to register')
    .max(120, 'Please enter a valid age'),
});

// ❌ 差:技术术语
const schema = z.object({
  age: z.number().min(18).max(120), // 默认错误:"Number must be greater than or equal to 18"
});
```

#### 3. 及时反馈

```typescript
// ✅ 好:字段失焦时验证
const form = useForm({
  resolver: zodResolver(schema),
  mode: 'onBlur', // 失焦时验证,不会在每次输入时都触发
});

// ⚠️ 小心:每次输入都验证可能很烦人
const form = useForm({
  mode: 'onChange', // 输入时验证,适合特殊场景(如密码强度实时显示)
});
```

#### 4. 禁用状态管理

```typescript
// ✅ 好:提交时禁用按钮,防止重复提交
<Button 
  type="submit"
  disabled={form.formState.isSubmitting || !form.formState.isValid}
>
  {form.formState.isSubmitting ? 'Submitting...' : 'Submit'}
</Button>
```

### ❌ 常见陷阱

#### 陷阱 1: 忘记服务器端验证

```typescript
// ❌ 致命错误:只在客户端验证
'use client';
function Form() {
  const form = useForm({ resolver: zodResolver(schema) });
  
  const onSubmit = async (data) => {
    // 直接发送,假设数据安全
    await fetch('/api/endpoint', { method: 'POST', body: JSON.stringify(data) });
  };
}

// 攻击者:
// fetch('/api/endpoint', { 
//   method: 'POST', 
//   body: JSON.stringify({ evilData: true }) 
// });
```

#### 陷阱 2: 在受控组件中使用 React Hook Form

```typescript
// ⚠️ 性能问题:混用受控组件和 React Hook Form
function Form() {
  const [email, setEmail] = useState(''); // 不需要!
  const form = useForm();
  
  return (
    <input
      value={email}  // ❌ 不要这样做
      onChange={e => {
        setEmail(e.target.value);
        form.setValue('email', e.target.value);
      }}
    />
  );
}

// ✅ 正确:直接用 register
function Form() {
  const form = useForm();
  
  return <input {...form.register('email')} />;
}
```

#### 陷阱 3: watch() 导致的过度渲染

```typescript
// ❌ 性能灾难:监听所有字段
function Form() {
  const form = useForm();
  const allValues = form.watch(); // 任何字段变化都触发重渲染
  
  console.log('组件重渲染'); // 每次输入都打印
}

// ✅ 只监听需要的字段
function Form() {
  const form = useForm();
  const userType = form.watch('userType'); // 只监听一个字段
}
```

#### 陷阱 4: 文件上传的类型错误

```typescript
// ❌ 常见错误:直接用 z.instanceof(File)
const schema = z.object({
  avatar: z.instanceof(File), // 不work!因为 register 返回 FileList
});

// ✅ 正确:先检查 FileList,再转换为 File
const schema = z.object({
  avatar: z
    .instanceof(FileList)
    .transform(files => files[0])
    .refine(file => file instanceof File, 'File required'),
});
```

### ☠️ 危险区域

#### 1. SQL 注入风险(即使用了 Prisma)

```typescript
// ☠️ 危险:永远不要拼接 SQL
const email = formData.email;
await db.$queryRaw(`SELECT * FROM users WHERE email = '${email}'`);
// 攻击者输入:' OR '1'='1

// ✅ 安全:用参数化查询或 Prisma 的类型安全 API
await db.user.findUnique({ where: { email } }); // Prisma 自动转义
await db.$queryRaw`SELECT * FROM users WHERE email = ${email}`; // 模板字面量自动参数化
```

#### 2. XSS 攻击

```typescript
// ☠️ 危险:直接渲染用户输入的 HTML
function UserBio({ bio }: { bio: string }) {
  return <div dangerouslySetInnerHTML={{ __html: bio }} />;
}
// 攻击者的 bio: '<script>document.cookie</script>'

// ✅ 安全:清洗 HTML 或纯文本显示
import DOMPurify from 'isomorphic-dompurify';

function UserBio({ bio }: { bio: string }) {
  const cleanBio = DOMPurify.sanitize(bio);
  return <div dangerouslySetInnerHTML={{ __html: cleanBio }} />;
}
```

#### 3. 敏感数据泄露

```typescript
// ☠️ 危险:密码明文存储
await db.user.create({
  data: {
    email: data.email,
    password: data.password, // ❌ 明文密码!
  },
});

// ✅ 安全:哈希后存储
import bcrypt from 'bcryptjs';

const passwordHash = await bcrypt.hash(data.password, 10);
await db.user.create({
  data: {
    email: data.email,
    passwordHash,
  },
});
```

---

## 9. 章节练习

### 练习 1: 基础表单

创建一个联系表单,包含:
- 姓名(必填,3-50 字符)
- 邮箱(必填,有效邮箱格式)
- 主题(下拉选择:"技术支持", "销售咨询", "反馈建议")
- 消息(必填,10-500 字符)

要求:
- 使用 React Hook Form + Zod
- 失焦时验证
- 提交时打印表单数据到控制台
- 显示验证错误

<details>
<summary>点击查看答案</summary>

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(50, 'Name too long'),
  email: z.string().email('Invalid email address'),
  subject: z.enum(['support', 'sales', 'feedback']),
  message: z.string().min(10, 'Message must be at least 10 characters').max(500, 'Message too long'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactForm() {
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      email: '',
      subject: 'support',
      message: '',
    },
  });

  const onSubmit = (data: ContactFormData) => {
    console.log('表单提交:', data);
    alert('Message sent!');
    form.reset();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <div>
        <label className="block mb-1">Name</label>
        <input {...form.register('name')} className="border p-2 rounded w-full" />
        {form.formState.errors.name && (
          <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block mb-1">Email</label>
        <input {...form.register('email')} type="email" className="border p-2 rounded w-full" />
        {form.formState.errors.email && (
          <p className="text-red-500 text-sm">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block mb-1">Subject</label>
        <select {...form.register('subject')} className="border p-2 rounded w-full">
          <option value="support">技术支持</option>
          <option value="sales">销售咨询</option>
          <option value="feedback">反馈建议</option>
        </select>
      </div>

      <div>
        <label className="block mb-1">Message</label>
        <textarea {...form.register('message')} rows={4} className="border p-2 rounded w-full" />
        {form.formState.errors.message && (
          <p className="text-red-500 text-sm">{form.formState.errors.message.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        Send Message
      </button>
    </form>
  );
}
```

</details>

### 练习 2: 动态字段数组

创建一个"技能列表"表单:
- 可以添加/删除多个技能
- 每个技能包含:名称(必填)、熟练度(1-10 的数字)
- 至少需要一个技能
- 提交时打印所有技能

<details>
<summary>点击查看答案</summary>

```typescript
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const skillsSchema = z.object({
  skills: z.array(
    z.object({
      name: z.string().min(1, 'Skill name required'),
      level: z.coerce.number().min(1, 'Min 1').max(10, 'Max 10'),
    })
  ).min(1, 'At least one skill required'),
});

type SkillsFormData = z.infer<typeof skillsSchema>;

export default function SkillsForm() {
  const form = useForm<SkillsFormData>({
    resolver: zodResolver(skillsSchema),
    defaultValues: {
      skills: [{ name: '', level: 5 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'skills',
  });

  const onSubmit = (data: SkillsFormData) => {
    console.log('技能列表:', data.skills);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <h2 className="font-bold text-xl">My Skills</h2>

      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-2 items-start">
          <div className="flex-1">
            <input
              {...form.register(`skills.${index}.name`)}
              placeholder="Skill name"
              className="border p-2 rounded w-full"
            />
            {form.formState.errors.skills?.[index]?.name && (
              <p className="text-red-500 text-xs">
                {form.formState.errors.skills[index]?.name?.message}
              </p>
            )}
          </div>

          <div className="w-20">
            <input
              {...form.register(`skills.${index}.level`)}
              type="number"
              min="1"
              max="10"
              className="border p-2 rounded w-full"
            />
            {form.formState.errors.skills?.[index]?.level && (
              <p className="text-red-500 text-xs">
                {form.formState.errors.skills[index]?.level?.message}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => remove(index)}
            disabled={fields.length === 1}
            className="bg-red-500 text-white px-2 py-2 rounded disabled:opacity-50"
          >
            ✕
          </button>
        </div>
      ))}

      {form.formState.errors.skills && (
        <p className="text-red-500 text-sm">{form.formState.errors.skills.message}</p>
      )}

      <button
        type="button"
        onClick={() => append({ name: '', level: 5 })}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        + Add Skill
      </button>

      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">
        Submit
      </button>
    </form>
  );
}
```

</details>

### 练习 3: Server Action 集成

创建一个注册表单,包含客户端和服务器端双重验证:
- 用户名、邮箱、密码
- 客户端验证格式
- 服务器端验证 + 检查用户名是否已存在(模拟)
- 密码哈希后打印

<details>
<summary>点击查看答案</summary>

```typescript
// lib/schemas/auth.ts
import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8),
});

export type RegisterInput = z.infer<typeof registerSchema>;
```

```typescript
// app/actions/auth.ts
'use server';

import { registerSchema, RegisterInput } from '@/lib/schemas/auth';
import bcrypt from 'bcryptjs';

const existingUsernames = ['admin', 'test', 'user']; // 模拟数据库

export async function registerAction(data: RegisterInput) {
  console.log('[Server] 收到注册请求:', data.username);

  // 服务器端验证
  const result = registerSchema.safeParse(data);
  if (!result.success) {
    console.log('[Server] 验证失败:', result.error.issues);
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  // 检查用户名是否存在
  if (existingUsernames.includes(result.data.username)) {
    console.log('[Server] 用户名已存在');
    return {
      success: false,
      errors: { username: ['Username already taken'] },
    };
  }

  // 哈希密码
  const passwordHash = await bcrypt.hash(result.data.password, 10);
  console.log('[Server] 密码已哈希:', passwordHash);

  // 模拟创建用户
  console.log('[Server] 用户创建成功:', {
    username: result.data.username,
    email: result.data.email,
    passwordHash,
  });

  return { success: true };
}
```

```typescript
// app/register/page.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput } from '@/lib/schemas/auth';
import { registerAction } from '@/app/actions/auth';

export default function RegisterPage() {
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    console.log('[Client] 提交注册:', data);

    const result = await registerAction(data);

    if (!result.success) {
      console.log('[Client] 服务器返回错误:', result.errors);
      
      Object.entries(result.errors || {}).forEach(([field, messages]) => {
        form.setError(field as any, {
          type: 'server',
          message: messages?.[0],
        });
      });
    } else {
      console.log('[Client] 注册成功!');
      alert('Registration successful!');
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold">Register</h1>

      <div>
        <label className="block mb-1">Username</label>
        <input {...form.register('username')} className="border p-2 rounded w-full" />
        {form.formState.errors.username && (
          <p className="text-red-500 text-sm">{form.formState.errors.username.message}</p>
        )}
      </div>

      <div>
        <label className="block mb-1">Email</label>
        <input {...form.register('email')} type="email" className="border p-2 rounded w-full" />
        {form.formState.errors.email && (
          <p className="text-red-500 text-sm">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block mb-1">Password</label>
        <input {...form.register('password')} type="password" className="border p-2 rounded w-full" />
        {form.formState.errors.password && (
          <p className="text-red-500 text-sm">{form.formState.errors.password.message}</p>
        )}
      </div>

      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">
        Register
      </button>
    </form>
  );
}
```

</details>

### 练习 4: 挑战 — 多步骤表单

创建一个三步注册向导:
1. 第一步:个人信息(姓名、邮箱)
2. 第二步:账户信息(用户名、密码)
3. 第三步:偏好设置(主题、语言)

要求:
- 每一步独立验证
- 可以前后导航
- 最后一步提交所有数据
- 显示进度指示器

<details>
<summary>点击查看答案</summary>

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';

// 每一步的 schema
const step1Schema = z.object({
  firstName: z.string().min(1, 'First name required'),
  lastName: z.string().min(1, 'Last name required'),
  email: z.string().email(),
});

const step2Schema = z.object({
  username: z.string().min(3),
  password: z.string().min(8),
});

const step3Schema = z.object({
  theme: z.enum(['light', 'dark']),
  language: z.enum(['en', 'zh', 'es']),
});

// 完整 schema
const fullSchema = step1Schema.merge(step2Schema).merge(step3Schema);

type FormData = z.infer<typeof fullSchema>;

export default function MultiStepForm() {
  const [step, setStep] = useState(1);

  const form = useForm<FormData>({
    resolver: zodResolver(
      step === 1 ? step1Schema : step === 2 ? step2Schema : step3Schema
    ),
    defaultValues: {
      theme: 'light',
      language: 'en',
    },
  });

  const onSubmit = async (data: FormData) => {
    if (step < 3) {
      console.log(`第 ${step} 步验证通过,进入下一步`);
      setStep(step + 1);
    } else {
      console.log('所有步骤完成,提交数据:', data);
      alert('Registration complete!');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      {/* 进度指示器 */}
      <div className="flex mb-8">
        {[1, 2, 3].map(s => (
          <div
            key={s}
            className={`flex-1 h-2 ${
              s <= step ? 'bg-blue-500' : 'bg-gray-200'
            } ${s < 3 ? 'mr-2' : ''}`}
          />
        ))}
      </div>

      <h2 className="text-xl font-bold mb-4">
        Step {step}/3:{' '}
        {step === 1 ? 'Personal Info' : step === 2 ? 'Account' : 'Preferences'}
      </h2>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* 第一步 */}
        {step === 1 && (
          <>
            <div>
              <label className="block mb-1">First Name</label>
              <input {...form.register('firstName')} className="border p-2 rounded w-full" />
              {form.formState.errors.firstName && (
                <p className="text-red-500 text-sm">{form.formState.errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className="block mb-1">Last Name</label>
              <input {...form.register('lastName')} className="border p-2 rounded w-full" />
              {form.formState.errors.lastName && (
                <p className="text-red-500 text-sm">{form.formState.errors.lastName.message}</p>
              )}
            </div>
            <div>
              <label className="block mb-1">Email</label>
              <input {...form.register('email')} type="email" className="border p-2 rounded w-full" />
              {form.formState.errors.email && (
                <p className="text-red-500 text-sm">{form.formState.errors.email.message}</p>
              )}
            </div>
          </>
        )}

        {/* 第二步 */}
        {step === 2 && (
          <>
            <div>
              <label className="block mb-1">Username</label>
              <input {...form.register('username')} className="border p-2 rounded w-full" />
              {form.formState.errors.username && (
                <p className="text-red-500 text-sm">{form.formState.errors.username.message}</p>
              )}
            </div>
            <div>
              <label className="block mb-1">Password</label>
              <input {...form.register('password')} type="password" className="border p-2 rounded w-full" />
              {form.formState.errors.password && (
                <p className="text-red-500 text-sm">{form.formState.errors.password.message}</p>
              )}
            </div>
          </>
        )}

        {/* 第三步 */}
        {step === 3 && (
          <>
            <div>
              <label className="block mb-1">Theme</label>
              <select {...form.register('theme')} className="border p-2 rounded w-full">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div>
              <label className="block mb-1">Language</label>
              <select {...form.register('language')} className="border p-2 rounded w-full">
                <option value="en">English</option>
                <option value="zh">中文</option>
                <option value="es">Español</option>
              </select>
            </div>
          </>
        )}

        {/* 导航按钮 */}
        <div className="flex gap-2">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Back
            </button>
          )}
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded flex-1">
            {step === 3 ? 'Submit' : 'Next'}
          </button>
        </div>
      </form>

      {/* 调试 */}
      <details className="mt-4 text-xs">
        <summary>Current Data</summary>
        <pre className="bg-gray-100 p-2 mt-2">{JSON.stringify(form.watch(), null, 2)}</pre>
      </details>
    </div>
  );
}
```

</details>

---

## 总结

这一章我们深入学习了现代表单处理的完整体系:

1. **React Hook Form** — 非受控组件的性能优势,避免过度渲染
2. **Zod** — 一份 Schema 两重保障(运行时验证 + TypeScript 类型推断)
3. **shadcn Form** — 在 RHF + Zod 之上的优雅抽象
4. **Server-Side 验证** — 永远不信任客户端,双重城门模型
5. **复杂表单** — 动态字段、文件上传、嵌套对象的实战技巧

**核心洞察**:
- 表单不是"简单的 UI",它是信任边界、攻击面、用户体验的综合体。
- 客户端验证提升体验,服务器端验证保证安全——缺一不可。
- Zod 的"单一数据源"消灭了类型与验证不同步的问题。
- React Hook Form 的非受控模式证明:有时候,不观察就是最好的性能优化。

**向前连接**:
- Stage 2 React Basics — 受控 vs 非受控组件的哲学根源
- Stage 5 Security — 输入即攻击面的深层原理

**向后连接**:
- 下一章 Authentication — 登录/注册表单是本章技巧的实战演练
- Project: TeamPulse — 项目中会用到本章所有技术

---

> 🧘 **最后的禅**:
>
> "表单是人与机器对话的界面。在这个界面上,你看到的每一个错误提示、每一个验证规则,都是一种关怀——既关怀诚实用户的时间,也关怀系统的安全。好的表单设计不是技术炫技,而是**移情的工程学**。"
>
> — 现在,去构建你的表单吧。记住:输入框是战场,但不要让用户感觉到战争。
