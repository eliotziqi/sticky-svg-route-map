import React, { useState } from 'react';
import { TrackUploader, TrackData } from './components/TrackUploader';
import { TrackInfo } from './components/TrackInfo';
import { StickyRouteMap } from './StickyRouteMap';
import { TrackToSVGConverter, SVGTrackData } from './utils/coordinate-transform';

/**
 * GPXDemo - GPX文件上传和SVG生成演示
 */
export const GPXDemo: React.FC = () => {
  const [trackData, setTrackData] = useState<TrackData | null>(null);
  const [svgData, setSvgData] = useState<SVGTrackData | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const handleTrackLoaded = async (track: TrackData) => {
    setTrackData(track);
    setIsConverting(true);

    try {
      // 模拟转换延迟（实际处理时间）
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const svgTrack = TrackToSVGConverter.convert(track, {
        maxWidth: 400,
        maxHeight: 500,
        padding: 0.05,
        simplify: true,
        simplifyTolerance: 1 // SVG坐标系下的像素容忍度
      });
      
      setSvgData(svgTrack);
    } catch (error) {
      console.error('SVG转换失败:', error);
    } finally {
      setIsConverting(false);
    }
  };

  const handleReset = () => {
    setTrackData(null);
    setSvgData(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            GPX轨迹转SVG动画
          </h1>
          <p className="text-gray-600">
            上传GPX文件，自动生成可嵌入的粘性SVG路径动画
          </p>
        </div>

        {!trackData ? (
          // 上传界面
          <div className="max-w-2xl mx-auto">
            <TrackUploader onTrackLoaded={handleTrackLoaded} />
            
            <div className="mt-8 text-center text-sm text-gray-500">
              <p>提示：您可以从以下平台导出GPX文件</p>
              <div className="flex justify-center space-x-6 mt-2">
                <span>🏃 Strava</span>
                <span>⌚ Garmin Connect</span>
                <span>🚴 Komoot</span>
                <span>🥾 AllTrails</span>
              </div>
            </div>
          </div>
        ) : (
          // 结果展示界面
          <div className="space-y-8">
            {/* 控制按钮 */}
            <div className="flex justify-between items-center">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← 返回上传新文件
              </button>
              
              {svgData && (
                <div className="text-sm text-gray-500">
                  SVG尺寸: {svgData.width} × {svgData.height}
                </div>
              )}
            </div>

            {/* 轨迹信息 */}
            <TrackInfo track={trackData} />

            {isConverting ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">正在生成SVG动画...</p>
              </div>
            ) : svgData ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* SVG预览 */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">SVG预览</h3>
                  
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <svg
                      viewBox={svgData.viewBox}
                      className="w-full h-auto max-w-md mx-auto"
                      style={{ maxHeight: '400px' }}
                    >
                      <path
                        d={svgData.svgPath}
                        fill="none"
                        stroke="rgb(14,116,119)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  
                  <div className="mt-4 text-xs text-gray-500 space-y-1">
                    <div>ViewBox: {svgData.viewBox}</div>
                    <div>路径长度: {svgData.svgPath.length} 字符</div>
                  </div>
                </div>

                {/* 动画演示 */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">动画演示</h3>
                  
                  {/* 粘性动画组件 */}
                  <div className="space-y-6">
                    {/* 入场效果演示 */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">入场效果</h4>
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <StickyRouteMap
                          outlinePath=""
                          routePaths={svgData.svgPath}
                          viewBox={svgData.viewBox}
                          width={svgData.width * 0.8}
                          height={svgData.height * 0.8}
                          mode="entrance-effect"
                          entranceEffectDuration={2000}
                          entranceEffectDelay={200}
                          routeColor="rgb(220,38,127)"
                          routeWidth={3}
                          className="mx-auto"
                        />
                      </div>
                    </div>

                    {/* 滚动驱动演示 */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">滚动驱动</h4>
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <StickyRouteMap
                          outlinePath=""
                          routePaths={svgData.svgPath}
                          viewBox={svgData.viewBox}
                          width={svgData.width * 0.8}
                          height={svgData.height * 0.8}
                          mode="scroll-driven"
                          routeColor="rgb(5,150,105)"
                          routeWidth={3}
                          className="mx-auto"
                        />
                        <div className="h-96 bg-gradient-to-b from-green-50 to-teal-50 rounded mt-4 p-4">
                          <p className="text-center text-green-600 text-sm">
                            滚动此区域查看路径绘制效果
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* 代码生成区域 */}
            {svgData && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">生成的代码</h3>
                
                <div className="space-y-4">
                  {/* React组件代码 */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">React组件使用</h4>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`<StickyRouteMap
  outlinePath=""
  routePaths="${svgData.svgPath}"
  viewBox="${svgData.viewBox}"
  width={${svgData.width}}
  height={${svgData.height}}
  mode="both"
  routeColor="rgb(14,116,119)"
  routeWidth={3}
  className="rounded-lg border"
/>`}
                    </pre>
                  </div>

                  {/* 纯SVG代码 */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">纯SVG代码</h4>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`<svg viewBox="${svgData.viewBox}" width="${svgData.width}" height="${svgData.height}">
  <path 
    d="${svgData.svgPath}"
    fill="none"
    stroke="rgb(14,116,119)"
    stroke-width="3"
    stroke-linecap="round"
  />
</svg>`}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};