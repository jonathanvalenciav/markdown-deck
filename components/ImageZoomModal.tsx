import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CloseIcon, ZoomInIcon, ZoomOutIcon, ResetZoomIcon } from './Icons';

interface ImageZoomModalProps {
  src: string;
  onClose: () => void;
}

const MIN_SCALE = 0.5;
const MAX_SCALE = 8;
const ZOOM_SENSITIVITY = 0.005;

const ImageZoomModal: React.FC<ImageZoomModalProps> = ({ src, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const isDraggingRef = useRef(false);
  const startDragPosRef = useRef({ x: 0, y: 0 });

  // Reset view when src changes or component mounts
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [src]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const clampPosition = useCallback((pos: {x: number, y: number}, currentScale: number) => {
    const containerEl = containerRef.current;
    const imageEl = imageRef.current;
    if (!containerEl || !imageEl) return pos;

    const containerWidth = containerEl.offsetWidth;
    const containerHeight = containerEl.offsetHeight;
    
    const imageWidth = imageEl.offsetWidth;
    const imageHeight = imageEl.offsetHeight;

    const overhangX = Math.max(0, (imageWidth * currentScale - containerWidth) / 2);
    const overhangY = Math.max(0, (imageHeight * currentScale - containerHeight) / 2);
    
    return {
      x: Math.max(-overhangX, Math.min(overhangX, pos.x)),
      y: Math.max(-overhangY, Math.min(overhangY, pos.y)),
    };
  }, []);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const zoomFactor = 1 - e.deltaY * ZOOM_SENSITIVITY;
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * zoomFactor));

    const mouseX = e.clientX - containerRect.left;
    const mouseY = e.clientY - containerRect.top;

    const newPosX = mouseX - ((mouseX - position.x) / scale) * newScale;
    const newPosY = mouseY - ((mouseY - position.y) / scale) * newScale;
    
    setScale(newScale);
    setPosition(clampPosition({ x: newPosX, y: newPosY }, newScale));
  };
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (scale <= 1 && e.button === 0) return; // Only allow dragging when zoomed
    isDraggingRef.current = true;
    startDragPosRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    const newPos = {
      x: e.clientX - startDragPosRef.current.x,
      y: e.clientY - startDragPosRef.current.y,
    };
    setPosition(clampPosition(newPos, scale));
  };

  const handleMouseUpOrLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    isDraggingRef.current = false;
  };
  
  const handleZoom = (direction: 'in' | 'out') => {
    const zoomFactor = direction === 'in' ? 1.25 : 0.8;
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * zoomFactor));
    
    if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const centerX = containerRect.width / 2;
        const centerY = containerRect.height / 2;
        
        const newPosX = centerX - ((centerX - position.x) / scale) * newScale;
        const newPosY = centerY - ((centerY - position.y) / scale) * newScale;

        setScale(newScale);
        setPosition(clampPosition({ x: newPosX, y: newPosY }, newScale));
    }
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };
  
  const cursorClass = scale > 1 ? (isDraggingRef.current ? 'cursor-grabbing' : 'cursor-grab') : '';
  
  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
        <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-opacity z-20"
            aria-label="Close image zoom view"
        >
            <CloseIcon className="w-8 h-8" />
        </button>

        <div
            ref={containerRef}
            className={`relative w-full h-full flex items-center justify-center overflow-hidden ${cursorClass}`}
            onClick={(e) => e.stopPropagation()}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
        >
            <img
                ref={imageRef}
                src={src}
                alt="Zoomed view"
                className="block max-w-[90vw] max-h-[90vh] object-contain rounded-lg select-none shadow-2xl"
                style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`, touchAction: 'none' }}
                draggable={false}
            />
        </div>
        
        <div 
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 backdrop-blur-sm text-white p-2 rounded-full shadow-lg z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={() => handleZoom('out')} className="p-2 hover:bg-white/20 rounded-full transition-colors" aria-label="Zoom out" title="Zoom out">
            <ZoomOutIcon className="w-6 h-6" />
          </button>
          <button onClick={handleReset} className="p-2 hover:bg-white/20 rounded-full transition-colors" aria-label="Reset zoom" title="Reset zoom">
            <ResetZoomIcon className="w-6 h-6" />
          </button>
          <button onClick={() => handleZoom('in')} className="p-2 hover:bg-white/20 rounded-full transition-colors" aria-label="Zoom in" title="Zoom in">
            <ZoomInIcon className="w-6 h-6" />
          </button>
        </div>
    </div>
  );
};

export default ImageZoomModal;