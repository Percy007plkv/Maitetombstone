import { useEffect } from 'react';
import { X, Download, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageViewerProps {
  image: string;
  currentIndex: number;
  totalImages: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onDownload: () => void;
}

export function ImageViewer({
  image,
  currentIndex,
  totalImages,
  onClose,
  onNext,
  onPrev,
  onDownload,
}: ImageViewerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev]);

  return (
    <div
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 md:top-6 md:right-6 text-white/90 hover:text-white transition-colors p-2 z-10 bg-black/30 hover:bg-black/50 rounded-full"
        aria-label="Close"
      >
        <X size={24} />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDownload();
        }}
        className="absolute top-4 right-16 md:top-6 md:right-20 text-white/90 hover:text-white transition-colors p-2 z-10 bg-black/30 hover:bg-black/50 rounded-full"
        aria-label="Download"
      >
        <Download size={24} />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 text-white/90 hover:text-white transition-colors p-3 bg-black/30 hover:bg-black/50 rounded-full z-10"
        aria-label="Previous image"
      >
        <ChevronLeft size={28} />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 text-white/90 hover:text-white transition-colors p-3 bg-black/30 hover:bg-black/50 rounded-full z-10"
        aria-label="Next image"
      >
        <ChevronRight size={28} />
      </button>

      <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 text-white/90 text-sm bg-black/30 px-4 py-2 rounded-full z-10">
        {currentIndex + 1} / {totalImages}
      </div>

      <img
        src={image}
        alt={`Image ${currentIndex + 1}`}
        className="max-w-[95vw] max-h-[95vh] object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
