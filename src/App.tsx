import { useState, useRef, useEffect, useCallback } from 'react';
import { Download, ShoppingCart, Heart, Share2, Play } from 'lucide-react';
import JSZip from 'jszip';
import { Hero } from './components/Hero';
import { GalleryImage } from './components/GalleryImage';
import { ImageViewer } from './components/ImageViewer';
import { MasonryGrid } from './components/MasonryGrid';
import { getImageUrl, getResponsiveUrls, supabase } from './lib/supabase';
import type { ImageData } from './types';

function App() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(50);
  const galleryRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchImages() {
      setLoading(true);
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching images:', error);
      } else if (data) {
        setImages(data);
      }
      setLoading(false);
    }

    fetchImages();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < images.length) {
          setVisibleCount((prev) => Math.min(prev + 50, images.length));
        }
      },
      { rootMargin: '400px' }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [visibleCount, images.length]);

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
          const img = images[i];
          const urls = getResponsiveUrls(img);
          const response = await fetch(urls.original);
          const blob = await response.blob();
          const filename = img.public_id?.split('/').pop() || img.path?.split('/').pop() || `image-${i + 1}.jpg`;
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
  }, [images]);

  const navigateImage = useCallback((direction: 'prev' | 'next') => {
    setSelectedIndex((current) => {
      if (current === null) return null;
      if (direction === 'prev') {
        return current > 0 ? current - 1 : images.length - 1;
      }
      return current < images.length - 1 ? current + 1 : 0;
    });
  }, [images.length]);

  const visibleImages = images.slice(0, visibleCount);
  const selectedImage = selectedIndex !== null ? images[selectedIndex] : null;

  const heroImage = images.find(img => img.public_id?.includes('P1167526'));
  const heroImageUrl = heroImage
    ? (heroImage.cloudinary_urls?.w1280 || getImageUrl(heroImage.bucket!, heroImage.path!, { width: 1920, quality: 85 }))
    : (images[0] ? (images[0].cloudinary_urls?.w1280 || getImageUrl(images[0].bucket!, images[0].path!, { width: 1920, quality: 85 })) : '');

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="animate-spin rounded-full h-24 w-24 border-4 border-gray-200 border-t-[#8A9876] mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <img src="/LOGO PLKV with shadow.png" alt="Loading" className="w-12 h-12 object-contain" />
            </div>
          </div>
          <p className="text-gray-600 mt-6 text-sm tracking-wide">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h2 className="text-2xl font-serif text-gray-900 mb-4">No Images Yet</h2>
          <p className="text-gray-600 mb-6">
            Upload your images to Supabase Storage to get started.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-left text-sm">
            <p className="font-medium mb-2">Quick setup:</p>
            <code className="block bg-gray-900 text-green-400 p-2 rounded">
              npm run upload-images
            </code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Hero heroImage={heroImageUrl} onViewGallery={scrollToGallery} />

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

        <MasonryGrid columns={{ default: 1, sm: 2, lg: 3, xl: 3 }} gap={16}>
          {visibleImages.map((img, index) => {
            const urls = getResponsiveUrls(img);

            return (
              <GalleryImage
                key={img.id}
                thumbUrl={urls.thumb}
                mediumUrl={urls.medium}
                largeUrl={urls.large}
                title={img.title || ''}
                index={index}
                onView={() => setSelectedIndex(index)}
                onDownload={() => handleDownload(urls.original)}
              />
            );
          })}
        </MasonryGrid>

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
          image={getResponsiveUrls(selectedImage).large}
          currentIndex={selectedIndex}
          totalImages={images.length}
          nextImage={
            selectedIndex < images.length - 1
              ? getResponsiveUrls(images[selectedIndex + 1]).large
              : getResponsiveUrls(images[0]).large
          }
          prevImage={
            selectedIndex > 0
              ? getResponsiveUrls(images[selectedIndex - 1]).large
              : getResponsiveUrls(images[images.length - 1]).large
          }
          onClose={() => setSelectedIndex(null)}
          onNext={() => navigateImage('next')}
          onPrev={() => navigateImage('prev')}
          onDownload={() => handleDownload(getResponsiveUrls(selectedImage).original)}
        />
      )}
    </div>
  );
}

export default App;
