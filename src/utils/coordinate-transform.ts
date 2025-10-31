import { TrackData, GPXPoint } from '../components/TrackUploader';

export interface SVGTrackData {
  name: string;
  svgPath: string;
  viewBox: string;
  width: number;
  height: number;
  originalBounds: TrackData['bounds'];
}

/**
 * 坐标转换工具
 * 将GPS坐标转换为SVG坐标系统
 */
export class CoordinateTransform {
  private bounds: TrackData['bounds'];
  private padding: number;
  private width: number;
  private height: number;

  constructor(bounds: TrackData['bounds'], width = 800, height = 600, padding = 0.1) {
    this.bounds = bounds;
    this.width = width;
    this.height = height;
    this.padding = padding;
  }

  /**
   * 将GPS坐标转换为SVG坐标
   */
  gpsToSVG(lat: number, lng: number): { x: number; y: number } {
    // 添加边距
    const latRange = this.bounds.north - this.bounds.south;
    const lngRange = this.bounds.east - this.bounds.west;
    
    const paddedLatRange = latRange * (1 + this.padding * 2);
    const paddedLngRange = lngRange * (1 + this.padding * 2);
    
    const paddedSouth = this.bounds.south - latRange * this.padding;
    const paddedWest = this.bounds.west - lngRange * this.padding;

    // 转换为0-1范围
    const normalizedX = (lng - paddedWest) / paddedLngRange;
    const normalizedY = (lat - paddedSouth) / paddedLatRange;

    // 转换为SVG坐标（注意Y轴翻转）
    const x = normalizedX * this.width;
    const y = (1 - normalizedY) * this.height;

    return { x, y };
  }

  /**
   * 创建SVG viewBox字符串
   */
  getViewBox(): string {
    return `0 0 ${this.width} ${this.height}`;
  }

  /**
   * 计算最佳的宽高比
   */
  static calculateOptimalDimensions(bounds: TrackData['bounds'], maxWidth = 800, maxHeight = 600): { width: number; height: number } {
    const latRange = bounds.north - bounds.south;
    const lngRange = bounds.east - bounds.west;
    
    // 考虑纬度对经度的压缩效应（粗略估算）
    const centerLat = (bounds.north + bounds.south) / 2;
    const latCompressionFactor = Math.cos((centerLat * Math.PI) / 180);
    const adjustedLngRange = lngRange * latCompressionFactor;
    
    const aspectRatio = adjustedLngRange / latRange;
    
    let width = maxWidth;
    let height = maxWidth / aspectRatio;
    
    // 限制最大高度
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }
    
    return {
      width: Math.round(width),
      height: Math.round(height)
    };
  }
}

/**
 * 轨迹数据转SVG转换器
 */
export class TrackToSVGConverter {
  /**
   * 将轨迹数据转换为SVG路径
   */
  static convert(trackData: TrackData, options?: {
    maxWidth?: number;
    maxHeight?: number;
    padding?: number;
    simplify?: boolean;
    simplifyTolerance?: number;
  }): SVGTrackData {
    const {
      maxWidth = 800,
      maxHeight = 600,
      padding = 0.1,
      simplify = true,
      simplifyTolerance = 0.001
    } = options || {};

    // 计算最佳尺寸
    const optimalDimensions = CoordinateTransform.calculateOptimalDimensions(trackData.bounds, maxWidth, maxHeight);
    
    const transform = new CoordinateTransform(
      trackData.bounds,
      optimalDimensions.width,
      optimalDimensions.height,
      padding
    );

    // 转换坐标点
    let points = trackData.points.map(point => {
      const svgCoord = transform.gpsToSVG(point.lat, point.lng);
      return {
        x: svgCoord.x,
        y: svgCoord.y,
        original: point
      };
    });

    // 简化路径（可选）
    if (simplify && points.length > 100) {
      points = this.simplifyPath(points, simplifyTolerance);
    }

    // 生成SVG路径字符串
    let pathData = '';
    if (points.length > 0) {
      pathData = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
      
      for (let i = 1; i < points.length; i++) {
        pathData += ` L ${points[i].x.toFixed(2)} ${points[i].y.toFixed(2)}`;
      }
    }

    return {
      name: trackData.name,
      svgPath: pathData,
      viewBox: transform.getViewBox(),
      width: optimalDimensions.width,
      height: optimalDimensions.height,
      originalBounds: trackData.bounds
    };
  }

  /**
   * 使用Douglas-Peucker算法简化路径
   */
  private static simplifyPath(
    points: Array<{ x: number; y: number; original: GPXPoint }>,
    tolerance: number
  ): Array<{ x: number; y: number; original: GPXPoint }> {
    if (points.length <= 2) return points;

    // 找到距离起点-终点连线最远的点
    let maxDistance = 0;
    let maxIndex = 0;
    
    const start = points[0];
    const end = points[points.length - 1];
    
    for (let i = 1; i < points.length - 1; i++) {
      const distance = this.pointToLineDistance(points[i], start, end);
      if (distance > maxDistance) {
        maxDistance = distance;
        maxIndex = i;
      }
    }

    // 如果最大距离大于容忍度，递归处理
    if (maxDistance > tolerance) {
      const leftPart = this.simplifyPath(points.slice(0, maxIndex + 1), tolerance);
      const rightPart = this.simplifyPath(points.slice(maxIndex), tolerance);
      
      // 合并结果，避免重复中间点
      return [...leftPart.slice(0, -1), ...rightPart];
    } else {
      // 距离在容忍范围内，只保留起点和终点
      return [start, end];
    }
  }

  /**
   * 计算点到直线的距离
   */
  private static pointToLineDistance(
    point: { x: number; y: number },
    lineStart: { x: number; y: number },
    lineEnd: { x: number; y: number }
  ): number {
    const A = lineEnd.x - lineStart.x;
    const B = lineEnd.y - lineStart.y;
    const C = lineStart.x - point.x;
    const D = lineStart.y - point.y;
    
    const dot = A * C + B * D;
    const lenSq = A * A + B * B;
    
    let param = -1;
    if (lenSq !== 0) {
      param = dot / lenSq;
    }
    
    let xx: number;
    let yy: number;
    
    if (param < 0) {
      xx = lineStart.x;
      yy = lineStart.y;
    } else if (param > 1) {
      xx = lineEnd.x;
      yy = lineEnd.y;
    } else {
      xx = lineStart.x + param * A;
      yy = lineStart.y + param * B;
    }
    
    const dx = point.x - xx;
    const dy = point.y - yy;
    
    return Math.sqrt(dx * dx + dy * dy);
  }
}