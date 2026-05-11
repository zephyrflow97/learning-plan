// Tailwind CSS Alert 组件示例
// 展示不同类型的提示信息

type AlertProps = {
  type: 'info' | 'success' | 'warning' | 'error';
  children: React.ReactNode;
};

function Alert({ type, children }: AlertProps) {
  const styles = {
    info: 'bg-blue-50 border-blue-500 text-blue-900',
    success: 'bg-green-50 border-green-500 text-green-900',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-900',
    error: 'bg-red-50 border-red-500 text-red-900',
  };

  const icons = {
    info: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
    success: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
  };

  return (
    <div className={`p-4 border-l-4 ${styles[type]} flex items-start gap-3`}>
      {icons[type]}
      <div className="flex-1">{children}</div>
    </div>
  );
}

export default function AlertExamples() {
  return (
    <div className="p-8 space-y-4 bg-gray-50 min-h-screen max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Alert 组件示例</h2>

      <Alert type="success">
        <strong className="font-bold">Success!</strong>
        <p className="mt-1">Your profile has been saved successfully.</p>
      </Alert>

      <Alert type="error">
        <strong className="font-bold">Error!</strong>
        <p className="mt-1">Failed to connect to the server. Please try again later.</p>
      </Alert>

      <Alert type="warning">
        <strong className="font-bold">Warning!</strong>
        <p className="mt-1">Your session will expire in 5 minutes. Please save your work.</p>
      </Alert>

      <Alert type="info">
        <strong className="font-bold">Info</strong>
        <p className="mt-1">A new version of the app is available. Click here to update.</p>
      </Alert>

      <div className="mt-8 p-6 bg-white rounded-lg shadow">
        <h3 className="text-lg font-bold mb-2">配色策略</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li><strong>背景:</strong> *-50 (极浅，不刺眼)</li>
          <li><strong>边框:</strong> *-500 (中等，突出)</li>
          <li><strong>文字:</strong> *-900 (深色，可读性强)</li>
        </ul>
      </div>
    </div>
  );
}

console.log('✅ Alert 组件示例完成');
console.log('🎨 配色: 背景 *-50, 边框 *-500, 文字 *-900');
