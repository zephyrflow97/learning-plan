'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';

// ✅ 文件验证 Schema
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const profileSchema = z.object({
  name: z.string().min(1, 'Name required'),
  avatar: z
    .instanceof(FileList)
    .refine(files => files.length === 1, 'Please select a file')
    .transform(files => files[0])
    .refine(file => file.size <= MAX_FILE_SIZE, 'Max file size is 5MB')
    .refine(
      file => ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Only .jpg, .jpeg, .png and .webp formats are supported'
    ),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const [preview, setPreview] = useState<string | null>(null);
  
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const onSubmit = async (data: ProfileFormData) => {
    console.log('表单数据:', {
      name: data.name,
      avatar: {
        name: data.avatar.name,
        size: data.avatar.size,
        type: data.avatar.type,
      },
    });

    // ✅ 上传文件到服务器
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('avatar', data.avatar);

    try {
      const response = await fetch('/api/upload-profile', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      console.log('上传成功:', result);
    } catch (error) {
      console.error('上传失败:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('选择的文件:', {
        name: file.name,
        size: `${(file.size / 1024).toFixed(2)} KB`,
        type: file.type,
      });

      // 生成预览
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        console.log('预览已生成');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label>Name</label>
        <input {...form.register('name')} className="border p-2 rounded w-full" />
        {form.formState.errors.name && (
          <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div>
        <label>Avatar</label>
        <input
          type="file"
          accept="image/*"
          {...form.register('avatar')}
          onChange={e => {
            form.register('avatar').onChange(e);
            handleFileChange(e);
          }}
          className="border p-2 rounded w-full"
        />
        {form.formState.errors.avatar && (
          <p className="text-red-500 text-sm">
            {form.formState.errors.avatar.message as string}
          </p>
        )}
      </div>

      {/* 图片预览 */}
      {preview && (
        <div>
          <p className="text-sm text-gray-600 mb-2">Preview:</p>
          <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded" />
        </div>
      )}

      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Upload Profile
      </button>
    </form>
  );
}
