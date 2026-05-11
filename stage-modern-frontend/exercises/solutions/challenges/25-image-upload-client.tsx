'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';

export default function ImageUploader() {
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      console.log('[上传] 文件:', file.name, file.size);

      // 预览
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // 上传
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('[上传] 成功,URL:', data.url);

      setIsUploading(false);
    },
  });

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', padding: '20px' }}>
      <div
        {...getRootProps()}
        style={{
          border: '2px dashed #ccc',
          borderRadius: '8px',
          padding: '40px',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: '#f9f9f9',
        }}
      >
        <input {...getInputProps()} />
        <p>拖拽图片到这里,或点击选择文件</p>
      </div>

      {preview && (
        <div style={{ marginTop: '20px' }}>
          <img
            src={preview}
            alt="Preview"
            style={{ maxWidth: '100%', borderRadius: '8px' }}
          />
        </div>
      )}

      {isUploading && <p>上传中...</p>}
    </div>
  );
}
