import { useState } from 'react';
import { Download, Heart, Share2, Maximize2 } from 'lucide-react';

interface GalleryImageProps {
  thumbUrl: string;
  mediumUrl: string;
  largeUrl: string;
  title: string;
  index: number;
  onView: () => void;
  onDownload: () => void;
}

export function GalleryImage({
  thumbUrl,
  mediumUrl,
  largeUrl,
  title,
  index,
  onView,
  onDownload
}: GalleryImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className="group relative overflow-hidden bg-gray-100 rounded-sm cursor-pointer"
      onDoubleClick={onView}
    >
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 animate-pulse bg-gray-200" />
      )}

      {hasError ? (
        <div className="aspect-[3/4] flex items-center justify-center text-gray-400 text-sm">
          Failed to load
        </div>
      ) : (
        <img
          src={thumbUrl}
          srcSet={`${thumbUrl} 480w, ${mediumUrl} 960w`}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
          alt={title || `Gallery image ${index + 1}`}
          className={`w-full h-auto transition-all duration-300 ${
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          } group-hover:scale-105`}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-center gap-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          className="p-2.5 bg-white/90 hover:bg-white text-gray-800 rounded-full transition-all hover:scale-110"
          aria-label="View full size"
        >
          <Maximize2 size={18} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="p-2.5 bg-white/90 hover:bg-white text-gray-800 rounded-full transition-all hover:scale-110"
          aria-label="Like"
        >
          <Heart size={18} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDownload();
          }}
          className="p-2.5 bg-white/90 hover:bg-white text-gray-800 rounded-full transition-all hover:scale-110"
          aria-label="Download"
        >
          <Download size={18} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="p-2.5 bg-white/90 hover:bg-white text-gray-800 rounded-full transition-all hover:scale-110"
          aria-label="Share"
        >
          <Share2 size={18} />
        </button>
      </div>
    </div>
  );
}
