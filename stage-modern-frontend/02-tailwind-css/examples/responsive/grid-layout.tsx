// Tailwind CSS 响应式网格布局
// 手机 1 列 → 平板 2 列 → 桌面 3-4 列

const products = [
  { id: 1, title: 'Product 1', price: '$99', description: 'High-quality product description' },
  { id: 2, title: 'Product 2', price: '$149', description: 'Amazing features included' },
  { id: 3, title: 'Product 3', price: '$199', description: 'Best value for money' },
  { id: 4, title: 'Product 4', price: '$249', description: 'Premium quality guaranteed' },
  { id: 5, title: 'Product 5', price: '$299', description: 'Limited edition item' },
  { id: 6, title: 'Product 6', price: '$349', description: 'Exclusive design' },
  { id: 7, title: 'Product 7', price: '$399', description: 'Professional grade' },
  { id: 8, title: 'Product 8', price: '$449', description: 'Industry leading' },
];

export default function ResponsiveGridLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      {/* Hero Section - 响应式文字 */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4">
          Responsive Grid Layout
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          This grid automatically adapts to different screen sizes
        </p>
      </div>

      {/* 响应式网格: 1列 → 2列 → 3列 → 4列 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="
              p-4 sm:p-6
              bg-white dark:bg-gray-800
              rounded-lg
              shadow-md hover:shadow-xl
              transition-all duration-300
              cursor-pointer
              hover:-translate-y-2
            "
          >
            {/* 产品图片占位符 */}
            <div className="
              h-40 sm:h-48
              bg-gradient-to-br from-blue-500 to-purple-500
              rounded-lg
              mb-4
            "></div>
            
            {/* 产品信息 */}
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
              {product.title}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
              {product.description}
            </p>
            
            {/* 价格和按钮 */}
            <div className="flex items-center justify-between">
              <span className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                {product.price}
              </span>
              <button className="
                px-3 py-1.5 sm:px-4 sm:py-2
                text-sm sm:text-base
                bg-blue-600 text-white
                rounded-md
                hover:bg-blue-700
                transition
              ">
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 断点说明 */}
      <div className="mt-12 max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          响应式断点
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <strong className="text-gray-900 dark:text-white">默认 (&lt; 640px)</strong>
            <p className="text-gray-600 dark:text-gray-400">1 列布局 - 手机</p>
          </div>
          <div>
            <strong className="text-gray-900 dark:text-white">sm (≥ 640px)</strong>
            <p className="text-gray-600 dark:text-gray-400">2 列布局 - 大手机/小平板</p>
          </div>
          <div>
            <strong className="text-gray-900 dark:text-white">md (≥ 768px)</strong>
            <p className="text-gray-600 dark:text-gray-400">继续 2 列 - 平板</p>
          </div>
          <div>
            <strong className="text-gray-900 dark:text-white">lg (≥ 1024px)</strong>
            <p className="text-gray-600 dark:text-gray-400">3 列布局 - 笔记本</p>
          </div>
          <div>
            <strong className="text-gray-900 dark:text-white">xl (≥ 1280px)</strong>
            <p className="text-gray-600 dark:text-gray-400">4 列布局 - 桌面</p>
          </div>
          <div>
            <strong className="text-gray-900 dark:text-white">2xl (≥ 1536px)</strong>
            <p className="text-gray-600 dark:text-gray-400">继续 4 列 - 大屏</p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-200">
            💡 <strong>移动优先策略:</strong> 默认样式针对手机，使用 <code>sm:</code>、<code>md:</code>、<code>lg:</code> 前缀向上覆盖
          </p>
        </div>
      </div>
    </div>
  );
}

console.log('✅ 响应式网格完成');
console.log('📐 断点: 1列 → 2列(sm) → 3列(lg) → 4列(xl)');
console.log('🎨 交互: 悬停阴影 + 向上移动');
