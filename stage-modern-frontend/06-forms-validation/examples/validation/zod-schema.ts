// lib/schemas/user.ts - Zod Schema 复用示例
import { z } from 'zod';

// 基础用户 Schema
export const createUserSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),

  confirmPassword: z.string(),

  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be less than 50 characters')
    .trim(),

  age: z.coerce
    .number()
    .int('Age must be an integer')
    .min(18, 'You must be at least 18 years old')
    .max(120, 'Please enter a valid age'),

  country: z.enum(['US', 'UK', 'CN', 'JP', 'OTHER'], {
    errorMap: () => ({ message: 'Please select a country' }),
  }),

  termsAccepted: z
    .boolean()
    .refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
}).refine(
  // 跨字段验证:密码匹配
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ['confirmPassword'], // 错误显示在 confirmPassword 字段
  }
);

// 服务端扩展的 Schema(添加异步验证)
export const createUserServerSchema = createUserSchema.extend({
  email: z
    .string()
    .email()
    .refine(
      async (email) => {
        // 检查邮箱是否已存在
        const existingUser = await db.user.findUnique({
          where: { email },
        });
        return !existingUser;
      },
      {
        message: 'Email already registered',
      }
    ),
});

// 推断 TypeScript 类型
export type CreateUserInput = z.infer<typeof createUserSchema>;

// 示例:使用 Schema 验证
const exampleValidation = () => {
  const result = createUserSchema.safeParse({
    email: 'test@example.com',
    password: 'Abc123!@#',
    confirmPassword: 'Abc123!@#',
    name: 'John Doe',
    age: 25,
    country: 'US',
    termsAccepted: true,
  });

  if (!result.success) {
    console.log('验证失败:', result.error.issues);
    return;
  }

  console.log('验证成功:', result.data);
  // result.data 的类型自动推断为 CreateUserInput
};

// 复杂对象验证示例
export const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  country: z.string().min(1, 'Country is required'),
});

export const userWithAddressSchema = createUserSchema.extend({
  address: addressSchema,
  billingAddress: addressSchema.optional(),
  useSameAddress: z.boolean().default(false),
}).refine(
  // 条件验证:如果不使用相同地址,必须提供账单地址
  (data) => {
    if (!data.useSameAddress && !data.billingAddress) {
      return false;
    }
    return true;
  },
  {
    message: 'Billing address is required when not using the same address',
    path: ['billingAddress'],
  }
);

// 数组验证示例
export const skillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  level: z.number().int().min(1).max(10),
  yearsOfExperience: z.number().min(0).optional(),
});

export const userWithSkillsSchema = createUserSchema.extend({
  skills: z
    .array(skillSchema)
    .min(1, 'At least one skill is required')
    .max(10, 'Maximum 10 skills allowed'),
});

// 文件验证示例
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const avatarUploadSchema = z.object({
  avatar: z
    .instanceof(FileList)
    .refine((files) => files.length === 1, 'Please select a file')
    .transform((files) => files[0])
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      'File size must be less than 5MB'
    )
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Only .jpg, .jpeg, .png and .webp formats are supported'
    ),
});

// 嵌套对象验证示例
export const commentSchema = z.object({
  author: z.string(),
  content: z.string().min(1).max(500),
  createdAt: z.date(),
});

export const postSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(10).max(5000),
  tags: z.array(z.string()).min(1).max(5),
  comments: z.array(commentSchema),
  publishedAt: z.date().optional(),
  status: z.enum(['draft', 'published', 'archived']),
});
