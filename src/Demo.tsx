import React, { useState } from 'react';
import { StickyRouteMap } from './StickyRouteMap';
import { GPXDemo } from './GPXDemo';

// 示例数据
const SAMPLE_OUTLINE = "M50,50 L250,50 L250,400 L50,400 Z";
const SAMPLE_ROUTE = [
  "M75,100 Q150,80 225,120 T200,200 Q180,280 120,350 L100,380"
];

export const Demo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'examples' | 'gpx'>('examples');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航标签 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('examples')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'examples'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              动画模式演示
            </button>
            <button
              onClick={() => setActiveTab('gpx')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'gpx'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              GPX轨迹上传
            </button>
          </nav>
        </div>
      </div>

      {/* 内容区域 */}
      {activeTab === 'examples' ? (
        <div className="mx-auto max-w-6xl space-y-16 px-4 md:px-6 pt-16">
          
          {/* 第一个示例：入场效果模式 */}
          <section className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6">
            <StickyRouteMap
              outlinePath={SAMPLE_OUTLINE}
              routePaths={SAMPLE_ROUTE}
              viewBox="0 0 300 450"
              width={300}
              height={450}
              stickyTop={120}
              mode="entrance-effect"
              entranceEffectDuration={2000}
              entranceEffectDelay={300}
              outlineOpacity={0.3}
              routeColor="rgb(14,116,119)"
              routeWidth={4}
              className="rounded-lg border border-gray-200"
            />

            <main className="prose prose-zinc max-w-none">
              <h1 className="mb-2">入场效果演示</h1>
              <p className="text-zinc-600">
                这个SVG会在进入视口时自动播放入场动画：先从头到尾绘制路径，然后从尾到头消失。
              </p>
              
              <div className="h-40"></div>
              
              <section>
                <h2>入场效果特点</h2>
                <ul>
                  <li>进入视口时自动触发</li>
                  <li>完整的绘制→暂停→消失循环</li>
                  <li>适合作为引人注目的展示效果</li>
                  <li>不依赖用户滚动行为</li>
                </ul>
              </section>

              <div className="h-96 bg-gradient-to-b from-white to-zinc-50 rounded-xl p-6">
                <p className="text-center text-zinc-500 mt-20">
                  向下滚动查看滚动驱动的动画...
                </p>
              </div>
            </main>
          </section>

          {/* 第二个示例：滚动驱动模式 */}
          <section className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6">
            <StickyRouteMap
              outlinePath={SAMPLE_OUTLINE}
              routePaths={SAMPLE_ROUTE}
              viewBox="0 0 300 450"
              width={300}
              height={450}
              stickyTop={120}
              mode="scroll-driven"
              outlineOpacity={0.3}
              routeColor="rgb(220,38,127)"
              routeWidth={4}
              className="rounded-lg border border-gray-200"
            />

            <main className="prose prose-zinc max-w-none">
              <h1 className="mb-2">滚动驱动演示</h1>
              <p className="text-zinc-600">
                这个SVG的路径绘制完全跟随您的滚动进度。向下滚动绘制，向上滚动消失。
              </p>
              
              <div className="h-40"></div>
              
              <section>
                <h2>滚动驱动特点</h2>
                <ul>
                  <li>路径绘制进度与滚动位置同步</li>
                  <li>可以双向控制（向上/向下滚动）</li>
                  <li>提供连续、流畅的交互体验</li>
                  <li>用户完全控制动画进度</li>
                </ul>
              </section>

              <div className="h-[1200px] bg-gradient-to-b from-pink-50 to-purple-50 rounded-xl p-6">
                <p className="text-center text-purple-600 mt-20">
                  继续滚动查看路径逐渐绘制...
                </p>
                <div className="mt-60 text-center">
                  <p className="text-purple-500">25% - 路径开始绘制</p>
                </div>
                <div className="mt-60 text-center">
                  <p className="text-purple-500">50% - 路径绘制中...</p>
                </div>
                <div className="mt-60 text-center">
                  <p className="text-purple-500">75% - 接近完成</p>
                </div>
                <div className="mt-60 text-center">
                  <p className="text-purple-500">100% - 路径完全绘制完成</p>
                </div>
              </div>

              <div className="h-96">
                <p className="text-center text-gray-500 mt-20">
                  向下滚动查看组合效果...
                </p>
              </div>
            </main>
          </section>

          {/* 第三个示例：组合模式 */}
          <section className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6">
            <StickyRouteMap
              outlinePath={SAMPLE_OUTLINE}
              routePaths={SAMPLE_ROUTE}
              viewBox="0 0 300 450"
              width={300}
              height={450}
              stickyTop={120}
              mode="both"
              entranceEffectDuration={1500}
              entranceEffectDelay={200}
              outlineOpacity={0.3}
              routeColor="rgb(5,150,105)"
              routeWidth={4}
              className="rounded-lg border border-gray-200"
            />

            <main className="prose prose-zinc max-w-none">
              <h1 className="mb-2">组合模式演示</h1>
              <p className="text-zinc-600">
                这个SVG结合了两种效果：首先播放入场动画，完成后切换到滚动驱动模式。
              </p>
              
              <div className="h-40"></div>
              
              <section>
                <h2>组合模式特点</h2>
                <ul>
                  <li>先播放吸引眼球的入场效果</li>
                  <li>然后切换到用户可控的滚动驱动</li>
                  <li>最佳的视觉效果和交互体验</li>
                  <li>适合重要的展示内容</li>
                </ul>
              </section>

              <div className="h-[1400px] bg-gradient-to-b from-green-50 to-teal-50 rounded-xl p-6">
                <p className="text-center text-green-600 mt-20">
                  入场动画完成后，继续滚动测试滚动驱动效果...
                </p>
                <div className="mt-80 text-center">
                  <p className="text-teal-600">25% - 滚动控制开始</p>
                </div>
                <div className="mt-80 text-center">
                  <p className="text-teal-600">50% - 路径绘制中...</p>
                </div>
                <div className="mt-80 text-center">
                  <p className="text-teal-600">75% - 接近完成</p>
                </div>
                <div className="mt-80 text-center">
                  <p className="text-teal-600">100% - 完全绘制</p>
                </div>
              </div>

              <section>
                <h2>使用建议</h2>
                <ul>
                  <li><strong>entrance-effect:</strong> 适合Hero区域、重要展示</li>
                  <li><strong>scroll-driven:</strong> 适合长内容、故事叙述</li>
                  <li><strong>both:</strong> 适合重要且内容丰富的页面</li>
                </ul>
              </section>

              <div className="h-96 bg-gradient-to-b from-teal-50 to-white rounded-xl"></div>
              
              <p className="text-center text-zinc-600">演示完成！</p>
            </main>
          </section>
        </div>
      ) : (
        <GPXDemo />
      )}
    </div>
  );
};