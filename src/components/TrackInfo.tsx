import React from 'react';
import { TrackData } from './TrackUploader';

interface TrackInfoProps {
  track: TrackData;
  className?: string;
}

/**
 * TrackInfo - 显示轨迹数据统计信息
 */
export const TrackInfo: React.FC<TrackInfoProps> = ({
  track,
  className = ""
}) => {
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatDuration = (milliseconds: number): string => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatElevation = (meters: number): string => {
    return `${Math.round(meters)}m`;
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {track.name}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {formatDistance(track.metadata.distance)}
          </div>
          <div className="text-sm text-gray-600">距离</div>
        </div>
        
        {track.metadata.duration && (
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatDuration(track.metadata.duration)}
            </div>
            <div className="text-sm text-gray-600">时长</div>
          </div>
        )}
        
        {track.metadata.elevationGain && (
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {formatElevation(track.metadata.elevationGain)}
            </div>
            <div className="text-sm text-gray-600">爬升</div>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">轨迹点数：</span>
          <span className="font-medium">{track.points.length}</span>
        </div>
        <div>
          <span className="text-gray-600">数据范围：</span>
          <span className="font-medium">
            {track.bounds.south.toFixed(3)}° - {track.bounds.north.toFixed(3)}°N
          </span>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-600">
        <strong>边界框:</strong> 
        {track.bounds.west.toFixed(4)}, {track.bounds.south.toFixed(4)} 到{' '}
        {track.bounds.east.toFixed(4)}, {track.bounds.north.toFixed(4)}
      </div>
    </div>
  );
};