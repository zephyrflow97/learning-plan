// Tailwind CSS 按钮组件示例
// 展示不同变体、尺寸和状态

export default function ButtonExamples() {
  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <section>
        <h2 className="text-2xl font-bold mb-4">基础按钮</h2>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
            Primary Button
          </button>
          <button className="px-6 py-3 bg-gray-200 text-gray-900 rounded-md hover:bg-gray-300 transition">
            Secondary Button
          </button>
          <button className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition">
            Outline Button
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">尺寸变体</h2>
        <div className="flex items-center gap-4">
          <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Small
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Medium
          </button>
          <button className="px-6 py-3 text-lg bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Large
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">带图标的按钮</h2>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Item
          </button>
          <button className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">状态变体</h2>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-md">
            Normal
          </button>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 active:bg-blue-800 transition">
            Hover & Active
          </button>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            Focus Ring
          </button>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-md opacity-50 cursor-not-allowed" disabled>
            Disabled
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">加载状态</h2>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-md flex items-center gap-2" disabled>
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </button>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">按钮组</h2>
        <div className="inline-flex rounded-md shadow-sm">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50">
            Left
          </button>
          <button className="px-4 py-2 bg-white border-t border-b border-gray-300 hover:bg-gray-50">
            Middle
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50">
            Right
          </button>
        </div>
      </section>
    </div>
  );
}

console.log('✅ Button 组件示例完成');
console.log('🎨 包含: 变体、尺寸、图标、状态、加载、按钮组');
