import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";

/**
 * Utility hook to detect if user prefers reduced motion
 */
const usePrefersReducedMotion = (): boolean => {
  const query = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)");
  }, []);
  
  const [reduced, setReduced] = useState<boolean>(query?.matches ?? false);
  
  useEffect(() => {
    if (!query) return;
    
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    query.addEventListener?.("change", handler);
    return () => query.removeEventListener?.("change", handler);
  }, [query]);
  
  return reduced;
};

export interface StickyRouteMapProps {
  /** ViewBox for the SVG */
  viewBox?: string;
  /** CSS width/height of the SVG element */
  width?: number | string;
  height?: number | string;
  /** Sticky offset from top in px */
  stickyTop?: number;
  /** Optional CSS transform */
  transform?: string;
  /** Path data for state/region outline */
  outlinePath: string;
  /** Path data for the animated route */
  routePaths: string | string[];
  /** Outline styling */
  outlineColor?: string;
  outlineWidth?: number;
  outlineOpacity?: number;
  /** Route styling */
  routeColor?: string;
  routeWidth?: number;
  routeLinecap?: "butt" | "round" | "square";
  /** Animation mode */
  mode?: 'scroll-driven' | 'entrance-effect' | 'both';
  /** Entrance effect settings */
  entranceEffectDuration?: number;
  entranceEffectDelay?: number;
  /** Additional CSS class */
  className?: string;
}

/**
 * StickyRouteMap - 粘性SVG路径地图
 * 
 * 支持两种动画模式：
 * 1. scroll-driven: 路径绘制跟随滚动进度
 * 2. entrance-effect: 入场时自动播放动画
 * 3. both: 两种效果结合
 */
export const StickyRouteMap: React.FC<StickyRouteMapProps> = ({
  viewBox = "0 0 300 450",
  width = 300,
  height = 450,
  stickyTop = 120,
  transform,
  outlinePath,
  routePaths,
  outlineColor = "#111827",
  outlineWidth = 1.5,
  outlineOpacity = 0.7,
  routeColor = "rgb(14,116,119)",
  routeWidth = 2,
  routeLinecap = "round",
  mode = 'both',
  entranceEffectDuration = 3000,
  entranceEffectDelay = 500,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const routeRefs = useRef<SVGPathElement[]>([]);
  const prefersReducedMotion = usePrefersReducedMotion();
  
  // State
  const [isVisible, setIsVisible] = useState(false);
  const [entranceEffectCompleted, setEntranceEffectCompleted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [pathLengths, setPathLengths] = useState<number[]>([]);

  // Convert routePaths to array
  const pathsArray = useMemo(() => 
    Array.isArray(routePaths) ? routePaths : [routePaths], 
    [routePaths]
  );

  // Calculate total path length
  const totalPathLength = useMemo(() => 
    pathLengths.reduce((sum, length) => sum + length, 0), 
    [pathLengths]
  );

  // Initialize path lengths
  useEffect(() => {
    const lengths: number[] = [];
    routeRefs.current.forEach((pathElement) => {
      if (pathElement) {
        lengths.push(pathElement.getTotalLength());
      }
    });
    setPathLengths(lengths);
  }, [pathsArray.length]);

  // Update path drawing based on progress (0-1)
  const updatePathDrawing = useCallback((progress: number) => {
    if (prefersReducedMotion) return;
    
    let currentProgress = Math.max(0, Math.min(1, progress));
    let remainingDistance = currentProgress * totalPathLength;
    
    routeRefs.current.forEach((pathElement, index) => {
      if (!pathElement || !pathLengths[index]) return;
      
      const pathLength = pathLengths[index];
      
      if (remainingDistance <= 0) {
        // Path not reached yet - completely hidden
        pathElement.style.strokeDasharray = `${pathLength}`;
        pathElement.style.strokeDashoffset = `${pathLength}`;
      } else if (remainingDistance >= pathLength) {
        // Path completely drawn
        pathElement.style.strokeDasharray = `${pathLength}`;
        pathElement.style.strokeDashoffset = '0';
        remainingDistance -= pathLength;
      } else {
        // Path partially drawn
        const offset = pathLength - remainingDistance;
        pathElement.style.strokeDasharray = `${pathLength}`;
        pathElement.style.strokeDashoffset = `${offset}`;
        remainingDistance = 0;
      }
    });
  }, [pathLengths, totalPathLength, prefersReducedMotion]);

  // Entrance effect animation
  const playEntranceEffect = useCallback(async () => {
    if (prefersReducedMotion || entranceEffectCompleted) return;
    
    // Wait for delay
    await new Promise(resolve => setTimeout(resolve, entranceEffectDelay));
    
    // Animate from 0 to 1 (drawing)
    const duration = entranceEffectDuration;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      updatePathDrawing(progress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Wait a bit, then animate backwards (erasing)
        setTimeout(() => {
          const eraseStartTime = Date.now();
          const eraseAnimate = () => {
            const eraseElapsed = Date.now() - eraseStartTime;
            const eraseProgress = Math.min(eraseElapsed / duration, 1);
            
            updatePathDrawing(1 - eraseProgress);
            
            if (eraseProgress < 1) {
              requestAnimationFrame(eraseAnimate);
            } else {
              setEntranceEffectCompleted(true);
            }
          };
          eraseAnimate();
        }, 1000); // Pause for 1 second at full draw
      }
    };
    
    animate();
  }, [updatePathDrawing, entranceEffectDelay, entranceEffectDuration, prefersReducedMotion, entranceEffectCompleted]);

  // Handle scroll-driven animation
  useEffect(() => {
    // For scroll-driven mode, always handle scroll
    // For both mode, only handle scroll after entrance effect is complete
    if (mode === 'entrance-effect') return;
    if (mode === 'both' && !entranceEffectCompleted) return;
    
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const windowHeight = window.innerHeight;
      
      // Get the section that contains this sticky map
      const section = container.closest('section');
      if (!section) return;
      
      const sectionRect = section.getBoundingClientRect();
      const sectionHeight = section.offsetHeight;
      
      // Calculate how much of the section has been scrolled past
      // Start animation when section enters viewport
      // Complete animation when section exits viewport
      const sectionTop = sectionRect.top;
      const sectionBottom = sectionRect.bottom;
      
      let progress = 0;
      
      if (sectionBottom > 0 && sectionTop < windowHeight) {
        // Section is in viewport
        if (sectionTop <= 0) {
          // Section top has passed viewport top
          const scrolledDistance = Math.abs(sectionTop);
          const totalScrollDistance = sectionHeight - windowHeight;
          progress = Math.min(1, scrolledDistance / Math.max(1, totalScrollDistance));
        }
      }
      
      setScrollProgress(progress);
      updatePathDrawing(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mode, entranceEffectCompleted, updatePathDrawing]);

  // Intersection Observer for visibility
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            
            if ((mode === 'entrance-effect' || mode === 'both') && !entranceEffectCompleted) {
              playEntranceEffect();
            }
          } else {
            setIsVisible(false);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [mode, entranceEffectCompleted, playEntranceEffect]);

  // Initialize paths
  useEffect(() => {
    routeRefs.current.forEach((pathElement) => {
      if (!pathElement) return;
      
      if (prefersReducedMotion) {
        pathElement.style.strokeDasharray = 'none';
        pathElement.style.strokeDashoffset = '0';
      } else {
        const pathLength = pathElement.getTotalLength();
        pathElement.style.strokeDasharray = `${pathLength}`;
        pathElement.style.strokeDashoffset = `${pathLength}`;
        pathElement.style.transition = 'none';
      }
    });
  }, [pathsArray.length, prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      className={`[--sticky-top:${stickyTop}px] md:sticky md:top-[var(--sticky-top)] md:self-start ${className}`}
      style={{ height: "fit-content" }}
    >
      <svg
        viewBox={viewBox}
        width={width}
        height={height}
        className="select-none"
        style={transform ? { transform } : undefined}
        aria-hidden="true"
      >
        {/* State/Region Outline */}
        <path
          d={outlinePath}
          fill="none"
          stroke={outlineColor}
          strokeWidth={outlineWidth}
          opacity={outlineOpacity}
        />

        {/* Animated Route Segments */}
        {pathsArray.map((pathData, index) => (
          <path
            key={index}
            ref={(element) => {
              if (element) {
                routeRefs.current[index] = element;
              }
            }}
            d={pathData}
            fill="none"
            stroke={routeColor}
            strokeWidth={routeWidth}
            strokeLinecap={routeLinecap}
          />
        ))}
      </svg>
      
      {/* Debug info */}
      <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-100 rounded">
        <div>模式: {mode}</div>
        <div>可见: {isVisible ? '是' : '否'}</div>
        <div>入场效果完成: {entranceEffectCompleted ? '是' : '否'}</div>
        <div>滚动进度: {Math.round(scrollProgress * 100)}%</div>
        <div>路径总长度: {Math.round(totalPathLength)}</div>
        <div>减少动画: {prefersReducedMotion ? '是' : '否'}</div>
      </div>
    </div>
  );
};

export default StickyRouteMap;