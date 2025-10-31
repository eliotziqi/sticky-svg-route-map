# 粘性SVG路径地图开发计划

## 项目目标
创建一个完整的工具链，用户可以：
1. 上传轨迹数据（Strava链接/GPX文件）
2. 自动匹配地理区域并生成对应的SVG地图
3. 生成可嵌入博客的粘性动画组件
4. 提供可视化微调工具

## 开发阶段

### 第一阶段：数据处理核心 (2-3周)

#### 1.1 轨迹数据解析器
- **GPX文件解析**
  - 解析GPX格式的经纬度坐标
  - 提取海拔、时间戳等元数据
  - 支持批量坐标点处理
- **Strava API集成**
  - OAuth认证流程
  - 获取活动数据
  - 转换为标准格式

#### 1.2 地理数据处理
- **边界框计算**
  - 自动计算轨迹的最小边界矩形
  - 添加合理的边距
- **坐标系转换**
  - WGS84 (GPS) → Web Mercator
  - 支持自定义投影
- **轨迹简化**
  - Douglas-Peucker算法减少点数
  - 保持轨迹形状特征

```typescript
// 核心接口设计
interface TrackData {
  name: string;
  points: Array<{
    lat: number;
    lng: number;
    elevation?: number;
    timestamp?: Date;
  }>;
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
```

### 第二阶段：地图数据获取 (2-3周)

#### 2.1 地理区域识别
- **自动区域检测**
  - 基于轨迹边界框查询
  - 国家/州/省份边界识别
  - 自然地理特征识别（山脉、海岸线等）
- **区域数据源**
  - Natural Earth数据集
  - OpenStreetMap边界数据
  - 自定义区域库

#### 2.2 SVG生成引擎
- **地理数据转SVG**
  - GeoJSON → SVG路径转换
  - 多层级数据支持（轮廓、地形、水系）
  - 自适应细节级别
- **优化算法**
  - SVG路径简化
  - 文件大小优化
  - 渲染性能优化

```typescript
interface RegionData {
  id: string;
  name: string;
  type: 'country' | 'state' | 'province' | 'custom';
  outline: string; // SVG path
  features?: {
    coastline?: string[];
    mountains?: string[];
    rivers?: string[];
  };
  viewBox: string;
  bounds: GeoBounds;
}
```

### 第三阶段：可视化编辑器 (3-4周)

#### 3.1 地图预览界面
- **交互式地图**
  - 轨迹叠加显示
  - 区域边界预览
  - 缩放/平移控制
- **区域选择工具**
  - 自动推荐匹配区域
  - 手动选择界面
  - 自定义边界绘制

#### 3.2 SVG微调工具
- **轨迹调整**
  - 起点/终点标记
  - 路径颜色/粗细
  - 分段样式设置
- **地图样式**
  - 轮廓透明度
  - 背景色彩
  - 标注添加
- **动画设置**
  - 动画模式选择
  - 时长/延迟调整
  - 缓动函数选择

```typescript
interface StyleConfig {
  route: {
    color: string;
    width: number;
    opacity: number;
    segments?: Array<{
      start: number;
      end: number;
      color: string;
    }>;
  };
  outline: {
    color: string;
    width: number;
    opacity: number;
    fill?: string;
  };
  animation: {
    mode: 'scroll-driven' | 'entrance-effect' | 'both';
    duration: number;
    delay: number;
    easing: string;
  };
}
```

### 第四阶段：代码生成器 (2周)

#### 4.1 组件生成
- **React组件导出**
  - 自包含组件代码
  - TypeScript类型定义
  - 样式文件（CSS/Tailwind）
- **多框架支持**
  - Vue.js组件
  - 原生HTML/CSS
  - 静态SVG导出

#### 4.2 部署辅助工具
- **博客集成指南**
  - 各平台集成说明
  - 依赖安装指引
  - 常见问题解答
- **性能优化建议**
  - 懒加载配置
  - 移动端适配
  - SEO优化

### 第五阶段：Web应用界面 (2-3周)

#### 5.1 用户界面
- **文件上传界面**
  - 拖拽上传GPX
  - Strava连接授权
  - 进度显示
- **编辑工作台**
  - 左侧预览，右侧控制面板
  - 实时预览更新
  - 撤销/重做功能

#### 5.2 项目管理
- **保存/加载**
  - 本地存储
  - 云端同步（可选）
  - 项目分享功能
- **批量处理**
  - 多轨迹合并
  - 批量样式应用
  - 导出队列

## 技术栈选择

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **地图**: Leaflet.js
- **文件处理**: FileReader API

### 后端（如需要）
- **API**: Node.js + Express
- **数据库**: PostgreSQL + PostGIS
- **文件存储**: AWS S3 或本地存储

### 核心库
- **地理处理**: Turf.js
- **GPX解析**: gpx-parser
- **SVG操作**: svg.js
- **坐标转换**: proj4js

## 文件结构

```
src/
├── components/
│   ├── StickyRouteMap.tsx          # 现有组件
│   ├── TrackUploader.tsx           # 轨迹上传
│   ├── RegionSelector.tsx          # 区域选择
│   ├── StyleEditor.tsx             # 样式编辑器
│   └── CodeGenerator.tsx           # 代码生成
├── utils/
│   ├── gpx-parser.ts              # GPX解析
│   ├── coordinate-transform.ts     # 坐标转换
│   ├── svg-generator.ts           # SVG生成
│   └── region-matcher.ts          # 区域匹配
├── data/
│   ├── regions/                   # 区域数据
│   └── templates/                 # 组件模板
└── hooks/
    ├── useTrackData.ts
    ├── useRegionData.ts
    └── useSVGGeneration.ts
```

## 里程碑时间表

### 里程碑 1 (3周后)
- ✅ GPX文件解析功能
- ✅ 基础坐标转换
- ✅ 简单区域匹配

### 里程碑 2 (6周后)
- ✅ 完整SVG生成管道
- ✅ 多种地图数据源支持
- ✅ 基础可视化编辑器

### 里程碑 3 (9周后)
- ✅ 完整的Web应用界面
- ✅ Strava API集成
- ✅ 代码导出功能

### 里程碑 4 (12周后)
- ✅ 性能优化
- ✅ 移动端适配
- ✅ 文档和用户指南

## 风险评估与应对

### 技术风险
1. **地理数据复杂性**
   - 风险：坐标转换精度问题
   - 应对：使用成熟的地理库，添加验证步骤

2. **SVG性能问题**
   - 风险：复杂路径渲染慢
   - 应对：实现多级简化算法

3. **API限制**
   - 风险：Strava API调用限制
   - 应对：实现缓存机制，提供替代方案

### 产品风险
1. **用户体验复杂度**
   - 风险：工具过于复杂难用
   - 应对：实现智能默认值，渐进式揭示功能

2. **浏览器兼容性**
   - 风险：某些功能在旧浏览器不支持
   - 应对：渐进增强，提供降级方案

## 下一步行动

### 立即开始 (本周)
1. **设置项目结构** - 创建新的文件夹和基础文件
2. **GPX解析器原型** - 实现基础的GPX文件读取
3. **坐标转换测试** - 验证地理坐标到SVG坐标的转换

### 第一周目标
1. 完成GPX文件上传和解析
2. 实现基础的坐标边界计算
3. 创建简单的预览界面

这个计划提供了一个清晰的路线图，从当前的基础组件发展到完整的轨迹处理工具。每个阶段都有明确的目标和可交付成果。