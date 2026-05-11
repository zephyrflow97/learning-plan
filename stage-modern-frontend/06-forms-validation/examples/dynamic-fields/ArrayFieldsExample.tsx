'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ✅ Schema 定义数组字段
const projectSchema = z.object({
  projectName: z.string().min(1, 'Project name required'),
  members: z.array(
    z.object({
      name: z.string().min(1, 'Name required'),
      email: z.string().email('Invalid email'),
      role: z.enum(['developer', 'designer', 'manager']),
    })
  ).min(1, 'At least one member required'),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export function ProjectForm() {
  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      projectName: '',
      members: [{ name: '', email: '', role: 'developer' }],
    },
  });

  // ✅ useFieldArray 管理动态数组
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'members',
  });

  console.log('当前成员数量:', fields.length);

  const onSubmit = (data: ProjectFormData) => {
    console.log('项目数据:', data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label>Project Name</label>
        <Input {...form.register('projectName')} />
        {form.formState.errors.projectName && (
          <p className="text-red-500 text-sm">
            {form.formState.errors.projectName.message}
          </p>
        )}
      </div>

      <div className="border p-4 rounded">
        <h3 className="font-bold mb-2">Team Members</h3>
        
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2 mb-2 items-start">
            <div className="flex-1">
              <Input
                placeholder="Name"
                {...form.register(`members.${index}.name`)}
              />
              {form.formState.errors.members?.[index]?.name && (
                <p className="text-red-500 text-xs">
                  {form.formState.errors.members[index]?.name?.message}
                </p>
              )}
            </div>

            <div className="flex-1">
              <Input
                placeholder="Email"
                {...form.register(`members.${index}.email`)}
              />
              {form.formState.errors.members?.[index]?.email && (
                <p className="text-red-500 text-xs">
                  {form.formState.errors.members[index]?.email?.message}
                </p>
              )}
            </div>

            <div className="flex-1">
              <select {...form.register(`members.${index}.role`)} className="border p-2 rounded w-full">
                <option value="developer">Developer</option>
                <option value="designer">Designer</option>
                <option value="manager">Manager</option>
              </select>
            </div>

            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                console.log(`删除成员 ${index}`);
                remove(index);
              }}
              disabled={fields.length === 1}
            >
              Remove
            </Button>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            console.log('添加新成员');
            append({ name: '', email: '', role: 'developer' });
          }}
        >
          Add Member
        </Button>

        {form.formState.errors.members && (
          <p className="text-red-500 text-sm mt-2">
            {form.formState.errors.members.message}
          </p>
        )}
      </div>

      <Button type="submit">Create Project</Button>

      {/* 调试 */}
      <details className="text-xs">
        <summary>Current Values</summary>
        <pre className="bg-gray-100 p-2 mt-2">
          {JSON.stringify(form.watch(), null, 2)}
        </pre>
      </details>
    </form>
  );
}
