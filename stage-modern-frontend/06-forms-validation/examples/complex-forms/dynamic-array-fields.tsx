'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus } from 'lucide-react';

// Schema 定义
const memberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  role: z.enum(['admin', 'editor', 'viewer']),
});

const teamSchema = z.object({
  teamName: z.string().min(1, 'Team name is required'),
  members: z
    .array(memberSchema)
    .min(1, 'At least one member is required')
    .max(10, 'Maximum 10 members allowed'),
});

type TeamFormData = z.infer<typeof teamSchema>;

export function DynamicArrayFieldsExample() {
  const form = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      teamName: '',
      members: [
        { name: '', email: '', role: 'viewer' },
      ],
    },
  });

  const { fields, append, remove, insert } = useFieldArray({
    control: form.control,
    name: 'members',
  });

  console.log('当前成员数:', fields.length);

  const onSubmit = (data: TeamFormData) => {
    console.log('团队数据:', data);
    alert(`团队 "${data.teamName}" 创建成功,包含 ${data.members.length} 个成员`);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Create Team</h1>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* 团队名称 */}
        <div>
          <label className="block text-sm font-medium mb-1">Team Name</label>
          <Input
            {...form.register('teamName')}
            placeholder="Engineering Team"
          />
          {form.formState.errors.teamName && (
            <p className="text-sm text-red-500 mt-1">
              {form.formState.errors.teamName.message}
            </p>
          )}
        </div>

        {/* 成员列表 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Team Members</label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ name: '', email: '', role: 'viewer' })}
              disabled={fields.length >= 10}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Member
            </Button>
          </div>

          {/* 成员字段 */}
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex gap-2 items-start rounded-lg border p-4"
            >
              <div className="flex-1 space-y-2">
                <div>
                  <Input
                    {...form.register(`members.${index}.name`)}
                    placeholder="Name"
                  />
                  {form.formState.errors.members?.[index]?.name && (
                    <p className="text-xs text-red-500 mt-1">
                      {form.formState.errors.members[index]?.name?.message}
                    </p>
                  )}
                </div>

                <div>
                  <Input
                    {...form.register(`members.${index}.email`)}
                    type="email"
                    placeholder="email@example.com"
                  />
                  {form.formState.errors.members?.[index]?.email && (
                    <p className="text-xs text-red-500 mt-1">
                      {form.formState.errors.members[index]?.email?.message}
                    </p>
                  )}
                </div>

                <select
                  {...form.register(`members.${index}.role`)}
                  className="w-full rounded-md border border-gray-300 p-2"
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {/* 数组级别错误 */}
          {form.formState.errors.members && (
            <p className="text-sm text-red-500">
              {form.formState.errors.members.message}
            </p>
          )}
        </div>

        {/* 提交按钮 */}
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? 'Creating...' : 'Create Team'}
        </Button>
      </form>

      {/* 调试区域 */}
      <details className="rounded border p-4 text-xs">
        <summary className="cursor-pointer font-semibold">Form State</summary>
        <pre className="mt-2 overflow-auto">
          {JSON.stringify(
            {
              values: form.watch(),
              errors: form.formState.errors,
              isDirty: form.formState.isDirty,
            },
            null,
            2
          )}
        </pre>
      </details>
    </div>
  );
}

// 文件上传示例
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const imageUploadSchema = z.object({
  title: z.string().min(1),
  image: z
    .instanceof(FileList)
    .refine((files) => files.length === 1, 'Please select a file')
    .transform((files) => files[0])
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      'Max file size is 5MB'
    )
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Only .jpg, .jpeg, .png and .webp formats are supported'
    ),
});

type ImageUploadData = z.infer<typeof imageUploadSchema>;

export function ImageUploadExample() {
  const form = useForm<ImageUploadData>({
    resolver: zodResolver(imageUploadSchema),
  });

  const [preview, setPreview] = React.useState<string | null>(null);

  // 监听文件变化,生成预览
  const fileList = form.watch('image');
  React.useEffect(() => {
    if (fileList && fileList[0]) {
      const file = fileList[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }, [fileList]);

  const onSubmit = async (data: ImageUploadData) => {
    console.log('上传文件:', data.image.name, data.image.size, 'bytes');

    // 使用 FormData 上传文件
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('image', data.image);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    console.log('上传结果:', result);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label>Title</label>
        <Input {...form.register('title')} />
        {form.formState.errors.title && (
          <p className="text-red-500 text-sm">{form.formState.errors.title.message}</p>
        )}
      </div>

      <div>
        <label>Image</label>
        <Input
          type="file"
          accept="image/*"
          {...form.register('image')}
        />
        {form.formState.errors.image && (
          <p className="text-red-500 text-sm">{form.formState.errors.image.message}</p>
        )}
      </div>

      {/* 图片预览 */}
      {preview && (
        <div className="border rounded p-4">
          <img src={preview} alt="Preview" className="max-w-xs" />
        </div>
      )}

      <Button type="submit">Upload</Button>
    </form>
  );
}
