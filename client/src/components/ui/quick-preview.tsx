import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface QuickPreviewProps {
  src: string;
  alt: string;
  triggerClassName?: string;
  previewClassName?: string;
  delay?: number;
}

export function QuickPreview({ 
  src, 
  alt, 
  triggerClassName,
  previewClassName,
  delay = 300 
}: QuickPreviewProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [previewPosition, setPreviewPosition] = useState<'right' | 'left' | 'top' | 'bottom'>('right');
  const timeoutRef = useRef<NodeJS.Timeout>();
  const triggerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (e: React.MouseEvent) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      updatePosition(e);
    }, delay);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isVisible) {
      updatePosition(e);
    }
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const updatePosition = (e: React.MouseEvent) => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Preview dimensions
    const previewWidth = 320;
    const previewHeight = 320;
    const offset = 20;

    // Calculate initial position (to the right of cursor)
    let x = e.clientX + offset;
    let y = e.clientY - previewHeight / 2;
    let position: 'right' | 'left' | 'top' | 'bottom' = 'right';

    // Check if preview would go off the right edge
    if (x + previewWidth > viewportWidth) {
      x = e.clientX - previewWidth - offset;
      position = 'left';
    }

    // Check if preview would go off the bottom edge
    if (y + previewHeight > viewportHeight) {
      y = viewportHeight - previewHeight - offset;
    }

    // Check if preview would go off the top edge
    if (y < offset) {
      y = offset;
    }

    // If still doesn't fit, try above or below
    if (x < 0 || x + previewWidth > viewportWidth) {
      x = triggerRect.left + (triggerRect.width - previewWidth) / 2;
      if (e.clientY > viewportHeight / 2) {
        y = triggerRect.top - previewHeight - offset;
        position = 'top';
      } else {
        y = triggerRect.bottom + offset;
        position = 'bottom';
      }
    }

    setPosition({ x, y });
    setPreviewPosition(position);
  };

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        className={triggerClassName}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      
      {isVisible && (
        <div
          ref={previewRef}
          className={cn(
            "fixed z-[100] pointer-events-none animate-in fade-in-0 zoom-in-95 duration-200",
            previewClassName
          )}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
        >
          <div className="relative">
            {/* Main preview image */}
            <div className="relative overflow-hidden rounded-xl shadow-2xl">
              <img
                src={src}
                alt={alt}
                className="w-80 h-80 object-cover"
              />
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              
              {/* Preview label */}
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <p className="text-sm font-semibold text-charcoal">Quick Preview</p>
              </div>
              
              {/* Jewelry details overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-white text-sm font-medium mb-1">Uploaded Jewelry Image</p>
                <p className="text-white/80 text-xs">Click to view full size</p>
              </div>
            </div>
            
            {/* Decorative border */}
            <div className="absolute inset-0 rounded-xl ring-1 ring-white/20" />
          </div>
        </div>
      )}
    </>
  );
}

// Export as default for convenience
export default QuickPreview;