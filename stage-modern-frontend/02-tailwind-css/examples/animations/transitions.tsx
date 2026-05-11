// Tailwind CSS 过渡动画示例
// 展示各种过渡效果和交互动画

export default function TransitionExamples() {
  return (
    <div className="p-8 space-y-12 bg-gray-50 min-h-screen">
      <section>
        <h2 className="text-2xl font-bold mb-4">基础过渡</h2>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-md transition hover:bg-blue-700">
            Default (150ms)
          </button>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-md transition duration-300 hover:bg-blue-700">
            Slow (300ms)
          </button>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-md transition duration-75 hover:bg-blue-700">
            Fast (75ms)
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">指定过渡属性</h2>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-md transition-colors hover:bg-purple-600">
            Colors Only
          </button>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-md transition-transform hover:scale-110">
            Transform Only
          </button>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-md shadow transition-shadow hover:shadow-2xl">
            Shadow Only
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">缓动函数</h2>
        <div className="flex gap-4">
          <div className="w-32 h-32 bg-blue-500 rounded-lg transition-transform ease-linear hover:translate-x-4">
            Linear
          </div>
          <div className="w-32 h-32 bg-blue-500 rounded-lg transition-transform ease-in hover:translate-x-4">
            Ease In
          </div>
          <div className="w-32 h-32 bg-blue-500 rounded-lg transition-transform ease-out hover:translate-x-4">
            Ease Out
          </div>
          <div className="w-32 h-32 bg-blue-500 rounded-lg transition-transform ease-in-out hover:translate-x-4">
            Ease In-Out
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">交互式卡片</h2>
        <div className="max-w-md p-6 bg-white rounded-lg shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
          <div className="w-12 h-12 bg-blue-500 rounded-lg mb-4"></div>
          <h3 className="text-xl font-bold mb-2">Hover Me!</h3>
          <p className="text-gray-600">
            This card combines shadow and transform transitions for a lift effect.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">群组交互 (group)</h2>
        <div className="max-w-md group p-6 bg-white rounded-lg shadow hover:bg-blue-50 transition cursor-pointer">
          <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition">
            Card Title
          </h3>
          <p className="text-gray-600 group-hover:text-gray-900 transition">
            When you hover the card, both title and text change color.
          </p>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded opacity-0 group-hover:opacity-100 transition">
            Learn More
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">图片缩放</h2>
        <div className="max-w-md overflow-hidden rounded-lg shadow-lg">
          <div className="overflow-hidden">
            <div className="h-64 bg-gradient-to-r from-purple-500 to-pink-500 transition-transform duration-300 hover:scale-110"></div>
          </div>
          <div className="p-4">
            <h3 className="font-bold">Image Zoom Effect</h3>
            <p className="text-sm text-gray-600">Hover to see the zoom effect</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">按钮状态</h2>
        <button className="
          px-6 py-3 bg-blue-600 text-white rounded-md
          transition-all duration-200
          hover:bg-blue-700 hover:shadow-lg
          active:scale-95
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ">
          Multi-State Button
        </button>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">侧边滑入效果</h2>
        <div className="group relative overflow-hidden p-6 bg-white rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Hover for Details</h3>
          <p className="text-gray-600">Additional information slides in from the side.</p>
          <div className="
            absolute inset-0 bg-blue-600 text-white p-6
            translate-x-full group-hover:translate-x-0
            transition-transform duration-300
          ">
            <h4 className="text-xl font-bold mb-2">Detailed Info</h4>
            <p>This content slides in from the right on hover.</p>
          </div>
        </div>
      </section>

      <div className="mt-8 p-6 bg-white rounded-lg shadow">
        <h3 className="text-lg font-bold mb-2">性能提示</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>✅ <strong>高性能:</strong> opacity, transform (GPU 加速)</li>
          <li>⚠️ <strong>中性能:</strong> colors, border, shadow</li>
          <li>❌ <strong>低性能:</strong> width, height, padding (触发重排)</li>
        </ul>
      </div>
    </div>
  );
}

console.log('✅ Transition 示例完成');
console.log('⚡ 300ms 是流畅动画的甜蜜点');
