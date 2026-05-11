// Tailwind CSS 关键帧动画示例
// 展示内置动画和自定义动画

export default function KeyframeExamples() {
  return (
    <div className="p-8 space-y-12 bg-gray-50 min-h-screen">
      <section>
        <h2 className="text-2xl font-bold mb-4">内置动画</h2>
        <div className="flex gap-8 items-center">
          {/* Spin */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Spin</p>
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>

          {/* Ping */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Ping</p>
            <div className="relative">
              <span className="absolute inline-flex h-3 w-3 rounded-full bg-red-500 opacity-75 animate-ping"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </div>
          </div>

          {/* Pulse */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Pulse</p>
            <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Bounce */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Bounce</p>
            <div className="text-2xl animate-bounce">⬇️</div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">加载器示例</h2>
        <div className="flex gap-8">
          {/* Spinner */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-600">Spinner</p>
          </div>

          {/* Dots */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <p className="text-sm text-gray-600">Bouncing Dots</p>
          </div>

          {/* Pulse Ring */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-12 h-12">
              <span className="absolute inset-0 rounded-full bg-blue-500 opacity-75 animate-ping"></span>
              <span className="relative flex h-12 w-12 rounded-full bg-blue-500 items-center justify-center text-white font-bold">
                3
              </span>
            </div>
            <p className="text-sm text-gray-600">Notification</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">骨架屏</h2>
        <div className="max-w-md p-6 bg-white rounded-lg shadow">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div className="flex gap-4">
              <div className="h-10 bg-gray-200 rounded flex-1"></div>
              <div className="h-10 bg-gray-200 rounded flex-1"></div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">进度指示器</h2>
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>

          {/* Indeterminate Progress */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="bg-blue-600 h-2 animate-[shimmer_1.5s_infinite]" style={{ 
              width: '50%',
              animation: 'shimmer 1.5s infinite'
            }}></div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">通知徽章</h2>
        <div className="relative inline-block">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg">
            Messages
          </button>
          <span className="absolute -top-2 -right-2 flex h-6 w-6">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-6 w-6 bg-red-500 text-white text-xs items-center justify-center font-bold">
              3
            </span>
          </span>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">组合动画</h2>
        <div className="group relative p-6 bg-white rounded-lg shadow hover:shadow-2xl transition-shadow cursor-pointer overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
          <h3 className="text-xl font-bold mb-2 relative">Hover for Effect</h3>
          <p className="text-gray-600 relative">
            This card combines multiple animations on hover.
          </p>
          <div className="mt-4 w-0 group-hover:w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"></div>
        </div>
      </section>

      <div className="mt-8 p-6 bg-white rounded-lg shadow">
        <h3 className="text-lg font-bold mb-2">内置动画列表</h3>
        <ul className="space-y-1 text-sm text-gray-600">
          <li><code className="text-blue-600">animate-spin</code> - 无限旋转</li>
          <li><code className="text-blue-600">animate-ping</code> - 脉冲扩散</li>
          <li><code className="text-blue-600">animate-pulse</code> - 透明度脉冲</li>
          <li><code className="text-blue-600">animate-bounce</code> - 弹跳</li>
        </ul>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
}

console.log('✅ Keyframe 动画示例完成');
console.log('📦 内置动画: spin, ping, pulse, bounce');
