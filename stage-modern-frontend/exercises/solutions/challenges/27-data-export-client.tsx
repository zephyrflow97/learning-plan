'use client';

export default function ExportButton() {
  const handleExport = async (format: 'csv' | 'excel') => {
    console.log(`[导出] 下载 ${format.toUpperCase()}`);

    const response = await fetch(`/api/export/${format}`);
    const blob = await response.blob();

    // 创建下载链接
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${Date.now()}.${format === 'csv' ? 'csv' : 'xlsx'}`;
    a.click();

    window.URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      <button onClick={() => handleExport('csv')}>
        导出 CSV
      </button>
      <button onClick={() => handleExport('excel')}>
        导出 Excel
      </button>
    </div>
  );
}
