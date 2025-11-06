import { images } from './imageData';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Download, ShoppingCart, Heart, Share2, Play } from 'lucide-react';
import JSZip from 'jszip';
import { Hero } from './components/Hero';
import { GalleryImage } from './components/GalleryImage';
import { ImageViewer } from './components/ImageViewer';
import { getImageUrl } from './lib/supabase';
import type { ImageData } from './types';

function App() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(24);
  const galleryRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < images.length) {
          setVisibleCount((prev) => Math.min(prev + 24, images.length));
        }
      },
      { rootMargin: '200px' }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [visibleCount]);

  const scrollToGallery = useCallback(() => {
    galleryRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleDownload = useCallback(async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = imageUrl.split('/').pop() || 'image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, []);

  const handleDownloadAll = useCallback(async () => {
    setIsDownloading(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder('maite-maria-raphasha-photos');

      for (let i = 0; i < images.length; i++) {
        try {
          const img = images[i] as ImageData;
          const url = getImageUrl(img.bucket, img.path, { format: 'origin' });
          const response = await fetch(url);
          const blob = await response.blob();
          const filename = img.path.split('/').pop() || `image-${i + 1}.jpg`;
          folder?.file(filename, blob);
        } catch (error) {
          console.error(`Failed to download image ${i + 1}:`, error);
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'maite-maria-raphasha-gallery.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to create zip:', error);
    } finally {
      setIsDownloading(false);
    }
  }, []);

  const navigateImage = useCallback((direction: 'prev' | 'next') => {
    setSelectedIndex((current) => {
      if (current === null) return null;
      if (direction === 'prev') {
        return current > 0 ? current - 1 : images.length - 1;
      }
      return current < images.length - 1 ? current + 1 : 0;
    });
  }, []);

  const visibleImages = (images as ImageData[]).slice(0, visibleCount);
  const selectedImage = selectedIndex !== null ? images[selectedIndex] : null;

  const firstImageUrl = images[0]
    ? getImageUrl((images[0] as ImageData).bucket, (images[0] as ImageData).path, { width: 1920, quality: 85 })
    : '';

  return (
    <div className="min-h-screen bg-white">
      <Hero heroImage={firstImageUrl} onViewGallery={scrollToGallery} />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16" ref={galleryRef}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-1">
              Maite Maria Raphasha
            </h2>
            <p className="text-sm text-gray-500 tracking-wide">
              Unveiling Tombstone Ceremony • {images.length} Photos
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
              aria-label="Shopping cart"
            >
              <ShoppingCart size={20} />
            </button>
            <button
              className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
              aria-label="Favorites"
            >
              <Heart size={20} />
            </button>
            <button
              onClick={handleDownloadAll}
              disabled={isDownloading}
              className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Download all"
            >
              <Download size={20} />
            </button>
            <button
              className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
              aria-label="Share gallery"
            >
              <Share2 size={20} />
            </button>
            <button
              className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
              aria-label="Slideshow"
            >
              <Play size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {visibleImages.map((img, index) => {
            const thumbUrl = getImageUrl(img.bucket, img.path, { width: 480, quality: 75 });
            const mediumUrl = getImageUrl(img.bucket, img.path, { width: 960, quality: 75 });
            const largeUrl = getImageUrl(img.bucket, img.path, { width: 1280, quality: 75 });
            const originalUrl = getImageUrl(img.bucket, img.path, { format: 'origin' });

            return (
              <GalleryImage
                key={img.id}
                thumbUrl={thumbUrl}
                mediumUrl={mediumUrl}
                largeUrl={largeUrl}
                title={img.title || ''}
                index={index}
                onView={() => setSelectedIndex(index)}
                onDownload={() => handleDownload(originalUrl)}
              />
            );
          })}
        </div>

        {visibleCount < images.length && (
          <div ref={loadMoreRef} className="h-24 flex items-center justify-center mt-8">
            <div className="text-gray-400 text-sm tracking-wider animate-pulse">
              Loading more images...
            </div>
          </div>
        )}

        {isDownloading && (
          <div className="fixed bottom-6 right-6 bg-black/90 text-white px-6 py-3 rounded-lg shadow-xl">
            Preparing download...
          </div>
        )}
      </div>

      {selectedImage !== null && selectedIndex !== null && (
        <ImageViewer
          image={getImageUrl((selectedImage as ImageData).bucket, (selectedImage as ImageData).path, { width: 1920, quality: 85 })}
          currentIndex={selectedIndex}
          totalImages={images.length}
          onClose={() => setSelectedIndex(null)}
          onNext={() => navigateImage('next')}
          onPrev={() => navigateImage('prev')}
          onDownload={() => handleDownload(getImageUrl((selectedImage as ImageData).bucket, (selectedImage as ImageData).path, { format: 'origin' }))}
        />
      )}
    </div>
  );
}

export default App;
