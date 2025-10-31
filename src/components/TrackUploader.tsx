import React, { useState, useCallback } from 'react';

export interface GPXPoint {
  lat: number;
  lng: number;
  elevation?: number;
  timestamp?: Date;
}

export interface TrackData {
  name: string;
  points: GPXPoint[];
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  metadata: {
    distance: number;
    duration?: number;
    elevationGain?: number;
  };
}

interface TrackUploaderProps {
  onTrackLoaded: (track: TrackData) => void;
  className?: string;
}

/**
 * TrackUploader - GPX文件上传和解析组件
 * 
 * 功能：
 * 1. 支持拖拽上传GPX文件
 * 2. 解析GPS轨迹数据
 * 3. 计算边界框和基础统计
 */
export const TrackUploader: React.FC<TrackUploaderProps> = ({
  onTrackLoaded,
  className = ""
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 计算两点间距离（haversine公式）
  const calculateDistance = useCallback((point1: GPXPoint, point2: GPXPoint): number => {
    const R = 6371000; // 地球半径（米）
    const lat1Rad = (point1.lat * Math.PI) / 180;
    const lat2Rad = (point2.lat * Math.PI) / 180;
    const deltaLatRad = ((point2.lat - point1.lat) * Math.PI) / 180;
    const deltaLngRad = ((point2.lng - point1.lng) * Math.PI) / 180;

    const a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) *
      Math.sin(deltaLngRad / 2) * Math.sin(deltaLngRad / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }, []);

  // 解析GPX文件
  const parseGPXFile = useCallback(async (file: File): Promise<TrackData> => {
    const text = await file.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');

    // 检查解析错误
    if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
      throw new Error('无效的GPX文件格式');
    }

    // 提取轨迹点
    const trackPoints = Array.from(xmlDoc.getElementsByTagName('trkpt'));
    
    if (trackPoints.length === 0) {
      throw new Error('GPX文件中没有找到轨迹点');
    }

    const points: GPXPoint[] = trackPoints.map(point => {
      const lat = parseFloat(point.getAttribute('lat') || '0');
      const lng = parseFloat(point.getAttribute('lon') || '0');
      
      const eleNode = point.querySelector('ele');
      const timeNode = point.querySelector('time');
      
      return {
        lat,
        lng,
        elevation: eleNode ? parseFloat(eleNode.textContent || '0') : undefined,
        timestamp: timeNode ? new Date(timeNode.textContent || '') : undefined
      };
    });

    // 计算边界框
    const lats = points.map(p => p.lat);
    const lngs = points.map(p => p.lng);
    const bounds = {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs)
    };

    // 计算总距离
    let totalDistance = 0;
    for (let i = 1; i < points.length; i++) {
      totalDistance += calculateDistance(points[i - 1], points[i]);
    }

    // 计算海拔增益
    let elevationGain = 0;
    if (points.some(p => p.elevation !== undefined)) {
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1].elevation || 0;
        const curr = points[i].elevation || 0;
        if (curr > prev) {
          elevationGain += curr - prev;
        }
      }
    }

    // 计算时长
    let duration: number | undefined;
    const firstTime = points.find(p => p.timestamp)?.timestamp;
    const lastTime = points.slice().reverse().find(p => p.timestamp)?.timestamp;
    if (firstTime && lastTime) {
      duration = lastTime.getTime() - firstTime.getTime();
    }

    // 提取轨迹名称
    const nameNode = xmlDoc.querySelector('trk > name');
    const name = nameNode?.textContent || file.name.replace('.gpx', '');

    return {
      name,
      points,
      bounds,
      metadata: {
        distance: totalDistance,
        duration,
        elevationGain: elevationGain > 0 ? elevationGain : undefined
      }
    };
  }, [calculateDistance]);

  // 处理文件上传
  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.gpx')) {
      setError('请上传GPX格式的文件');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const trackData = await parseGPXFile(file);
      onTrackLoaded(trackData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '文件处理失败');
    } finally {
      setIsProcessing(false);
    }
  }, [parseGPXFile, onTrackLoaded]);

  // 拖拽事件处理
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  // 文件选择处理
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isProcessing ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600">正在处理GPX文件...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 text-gray-400">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                上传GPX轨迹文件
              </p>
              <p className="text-gray-600 mt-1">
                拖拽文件到此处，或点击选择文件
              </p>
            </div>
            <div>
              <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors">
                选择文件
                <input
                  type="file"
                  accept=".gpx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-gray-500">
              支持GPX格式文件，从Strava、Garmin等设备导出
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
};