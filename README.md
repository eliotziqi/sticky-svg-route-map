# Sticky SVG Route Map

A reusable React component for creating animated SVG route maps with sticky positioning. Perfect for travel blogs, hiking guides, or any application that needs to show a route being drawn as the user scrolls.

## Features

- ✨ **Smooth animation**: Routes draw themselves using SVG stroke-dasharray animation
- 📱 **Responsive design**: Works on mobile and desktop with sticky positioning  
- ♿ **Accessible**: Respects user's reduced-motion preferences
- 🎨 **Customizable**: Full control over colors, timing, and styling
- 🔄 **Flexible**: Supports single or multiple route segments
- 🎯 **TypeScript**: Full type safety and IntelliSense support

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Basic Example

```tsx
import { StickyRouteMap } from './src/StickyRouteMap';

function App() {
  return (
    <StickyRouteMap
      outlinePath="M10 10 L80 10 L80 130 L10 130 Z"
      routePaths="M20 120 C 30 40, 60 40, 70 120"
      viewBox="0 0 200 200"
      stickyTop={120}
    />
  );
}
```

### Multiple Route Segments

```tsx
<StickyRouteMap
  outlinePath={californiaOutline}
  routePaths={[
    "M50 300 L100 250 L150 200", // Segment 1
    "M150 200 L200 150 L250 100", // Segment 2  
    "M250 100 L300 50"             // Segment 3
  ]}
  viewBox="0 0 400 350"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `outlinePath` | `string` | **required** | SVG path data for the outline (state, region, etc.) |
| `routePaths` | `string \| string[]` | **required** | SVG path data for the route(s) |
| `viewBox` | `string` | `"0 0 300 450"` | SVG viewBox attribute |
| `width` | `number \| string` | `300` | SVG width |
| `height` | `number \| string` | `450` | SVG height |
| `stickyTop` | `number` | `120` | Sticky positioning offset from top (px) |
| `transform` | `string` | `undefined` | CSS transform for the SVG |
| `outlineColor` | `string` | `"#111827"` | Outline stroke color |
| `outlineWidth` | `number` | `1.5` | Outline stroke width |
| `outlineOpacity` | `number` | `0.7` | Outline opacity |
| `routeColor` | `string` | `"rgb(14,116,119)"` | Route stroke color |
| `routeWidth` | `number` | `2` | Route stroke width |
| `routeLinecap` | `"butt" \| "round" \| "square"` | `"round"` | Route line cap style |
| `animateOnce` | `boolean` | `true` | Only animate on first scroll into view |
| `durationMs` | `number` | `2200` | Animation duration in milliseconds |
| `delayMs` | `number` | `200` | Animation delay in milliseconds |
| `threshold` | `number` | `0.25` | Intersection observer threshold (0-1) |
| `className` | `string` | `""` | Additional CSS classes |

## Development

### Running the Demo

```bash
npm run dev
```

This starts the development server with a demo page showing the component in action.

### Building

```bash
npm run build
```

### Type Checking

```bash
npm run type-check
```

## How It Works

1. **SVG Setup**: The component renders an SVG with an outline path and route path(s)
2. **Animation Preparation**: Route paths are initially hidden using `stroke-dasharray` and `stroke-dashoffset`
3. **Intersection Observer**: Watches when the SVG enters the viewport
4. **Animation Trigger**: Animates `stroke-dashoffset` to 0, creating the drawing effect
5. **Accessibility**: Respects `prefers-reduced-motion` by showing routes immediately

## Browser Support

- Modern browsers with IntersectionObserver support
- CSS custom properties support
- SVG animation support

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.