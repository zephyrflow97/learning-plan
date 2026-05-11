// Tailwind CSS 卡片组件示例
// 展示不同卡片布局和交互效果

export default function CardExamples() {
  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <section>
        <h2 className="text-2xl font-bold mb-4">基础卡片</h2>
        <div className="max-w-md p-6 bg-white rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Card Title</h3>
          <p className="text-gray-600">
            This is a basic card with shadow, rounded corners, and proper padding.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">带图片的卡片</h2>
        <div className="max-w-md bg-white rounded-lg shadow overflow-hidden">
          <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-500"></div>
          <div className="p-6">
            <h3 className="text-xl font-bold mb-2">Beautiful Gradient</h3>
            <p className="text-gray-600 mb-4">
              Cards can include images or gradient backgrounds.
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Learn More
            </button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">交互式卡片</h2>
        <div className="max-w-md p-6 bg-white rounded-lg shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
          <h3 className="text-xl font-bold mb-2">Hover Me!</h3>
          <p className="text-gray-600">
            This card lifts up and casts a larger shadow on hover.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">水平卡片</h2>
        <div className="max-w-2xl bg-white rounded-lg shadow overflow-hidden flex">
          <div className="w-48 bg-gradient-to-br from-pink-500 to-orange-500 flex-shrink-0"></div>
          <div className="p-6">
            <h3 className="text-xl font-bold mb-2">Horizontal Layout</h3>
            <p className="text-gray-600 mb-4">
              Use flexbox to create horizontal card layouts.
            </p>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Tag1</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Tag2</span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">卡片网格</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-6 bg-white rounded-lg shadow hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-500 rounded-lg mb-4"></div>
              <h3 className="text-lg font-bold mb-2">Card {i}</h3>
              <p className="text-gray-600 text-sm">
                Responsive grid that adapts to screen size.
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">产品卡片</h2>
        <div className="max-w-sm bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="relative">
            <div className="h-64 bg-gradient-to-br from-purple-500 to-pink-500"></div>
            <span className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
              SALE
            </span>
          </div>
          <div className="p-6">
            <h3 className="text-2xl font-bold mb-2">Product Name</h3>
            <p className="text-gray-600 mb-4">
              High-quality product description goes here.
            </p>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-bold text-blue-600">$99</span>
                <span className="text-gray-400 line-through ml-2">$149</span>
              </div>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

console.log('✅ Card 组件示例完成');
console.log('🎨 包含: 基础卡片、图片卡片、交互卡片、网格布局');
