import { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImagePreviewProps {
  src: string;
  alt: string;
  className?: string;
  previewClassName?: string;
}

export function ImagePreview({ src, alt, className, previewClassName }: ImagePreviewProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e: React.MouseEvent) => {
    setIsHovering(true);
    updateMousePosition(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    updateMousePosition(e);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const updateMousePosition = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div className="relative">
      <img
        src={src}
        alt={alt}
        className={cn("cursor-pointer transition-all duration-200", className)}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      
      {/* Preview Overlay */}
      {isHovering && (
        <div
          className={cn(
            "fixed z-50 pointer-events-none animate-in fade-in-0 zoom-in-95",
            previewClassName
          )}
          style={{
            left: `${mousePosition.x + 20}px`,
            top: `${mousePosition.y - 200}px`,
            transform: 'translateY(-50%)',
          }}
        >
          <div className="relative">
            <img
              src={src}
              alt={alt}
              className="w-80 h-80 object-cover rounded-lg shadow-2xl border-2 border-white"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg" />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <p className="text-sm font-medium drop-shadow-lg">Quick Preview</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}