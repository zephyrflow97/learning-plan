// Tailwind CSS 营销页面布局
// Hero Section + Features + CTA

export default function MarketingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - 全屏居中 */}
      <section className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
            Build Amazing Products
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            The fastest way to ship your next project with modern tools.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition">
              Get Started
            </button>
            <button className="px-8 py-4 bg-transparent border-2 border-white rounded-lg font-semibold hover:bg-white/10 transition">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section - 响应式网格 */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-6 bg-gray-50 rounded-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-blue-500 rounded-lg mb-4"></div>
                <h3 className="text-xl font-bold mb-2">Feature {i}</h3>
                <p className="text-gray-600">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-xl mb-8 text-gray-300">
            Join thousands of developers building with our platform.
          </p>
          <button className="px-8 py-4 bg-blue-500 rounded-lg font-semibold hover:bg-blue-600 transition">
            Start Free Trial
          </button>
        </div>
      </section>
    </div>
  );
}

console.log('✅ 营销页面布局完成');
console.log('📐 响应式: 1列(手机) → 2列(平板) → 3列(桌面)');
