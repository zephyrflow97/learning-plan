'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Zod schema
const formSchema = z.object({
  tags: z
    .array(
      z.object({
        value: z.string().min(1, '标签不能为空'),
      })
    )
    .refine(
      (tags) => {
        // 检查是否有重复标签
        const values = tags.map(t => t.value);
        return values.length === new Set(values).size;
      },
      {
        message: '标签不能重复',
      }
    ),
});

type FormValues = z.infer<typeof formSchema>;

export default function DynamicTagsForm() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tags: [{ value: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tags',
  });

  const onSubmit = (data: FormValues) => {
    console.log('[表单提交]', data);
    alert(`提交的标签:\n${data.tags.map(t => t.value).join(', ')}`);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      <h1>🏷️ 标签管理</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        {fields.map((field, index) => (
          <div
            key={field.id}
            style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '10px',
            }}
          >
            <input
              {...register(`tags.${index}.value`)}
              placeholder={`标签 ${index + 1}`}
              style={{
                flex: 1,
                padding: '10px',
                fontSize: '16px',
                border: '1px solid #ccc',
              }}
            />

            <button
              type="button"
              onClick={() => {
                console.log(`[删除] 标签索引: ${index}`);
                remove(index);
              }}
              disabled={fields.length === 1}
              style={{
                padding: '10px 15px',
                backgroundColor: fields.length === 1 ? '#ccc' : '#ff4444',
                color: 'white',
                border: 'none',
                cursor: fields.length === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              删除
            </button>
          </div>
        ))}

        {/* 错误信息 */}
        {errors.tags?.root && (
          <p style={{ color: 'red', fontSize: '14px', marginBottom: '10px' }}>
            {errors.tags.root.message}
          </p>
        )}

        {/* 添加标签按钮 */}
        <button
          type="button"
          onClick={() => {
            console.log('[添加] 新标签输入框');
            append({ value: '' });
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '20px',
          }}
        >
          + 添加标签
        </button>

        {/* 提交按钮 */}
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          提交
        </button>
      </form>
    </div>
  );
}
