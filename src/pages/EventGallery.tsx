import { useState, useRef, useEffect, useCallback, lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, Heart, Share2, Play, ArrowLeft } from 'lucide-react';
import { Hero } from '../components/Hero';
import { GalleryImage } from '../components/GalleryImage';
import { MasonryGrid } from '../components/MasonryGrid';
import { getImageUrl, getResponsiveUrls, supabase } from '../lib/supabase';
import type { ImageData, Event } from '../types';

const ImageViewer = lazy(() => import('../components/ImageViewer'));

export function EventGallery() {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(50);
  const galleryRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchEventAndImages() {
      setLoading(true);
      setNotFound(false);

      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (eventError || !eventData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setEvent(eventData);

      const { data: imagesData, error: imagesError } = await supabase
        .from('images')
        .select('id, title, public_id, path, bucket, cloudinary_urls, display_order, event_id')
        .eq('event_id', eventData.id)
        .order('display_order', { ascending: true });

      if (imagesError) {
        console.error('Error fetching images:', imagesError);
      } else if (imagesData) {
        setImages(imagesData);
      }
      setLoading(false);
    }

    if (slug) {
      fetchEventAndImages();
    }
  }, [slug]);

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
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const folder = zip.folder(`${event?.slug}-photos`);

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
      link.download = `${event?.slug}-gallery.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to create zip:', error);
    } finally {
      setIsDownloading(false);
    }
  }, [images, event]);

  const navigateImage = useCallback((direction: 'prev' | 'next') => {
    setSelectedIndex((current) => {
      if (current === null) return null;
      if (direction === 'prev') {
        return current > 0 ? current - 1 : images.length - 1;
      }
      return current < images.length - 1 ? current + 1 : 0;
    });
  }, [images.length]);

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

  if (notFound) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h2 className="text-3xl font-serif text-gray-900 mb-4">Event Not Found</h2>
          <p className="text-gray-600 mb-8">
            The event gallery you're looking for doesn't exist or is no longer available.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#8A9876] text-white rounded-lg hover:bg-[#737d61] transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
          >
            <ArrowLeft size={20} />
            Back to Events
          </Link>
          <div className="text-center max-w-md mx-auto">
            <h2 className="text-2xl font-serif text-gray-900 mb-4">No Images Yet</h2>
            <p className="text-gray-600">
              Photos for this event will be available soon.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const visibleImages = images.slice(0, visibleCount);
  const selectedImage = selectedIndex !== null ? images[selectedIndex] : null;

  const heroImage = images.find(img => img.id === event?.hero_image_id) || images[0];
  const heroImageUrl = heroImage
    ? (heroImage.cloudinary_urls?.w1280 || getImageUrl(heroImage.bucket!, heroImage.path!, { width: 1920, quality: 85 }))
    : '';

  const eventDate = event ? new Date(event.event_date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }) : '';

  return (
    <div className="min-h-screen bg-white">
      <Hero heroImage={heroImageUrl} onViewGallery={scrollToGallery} />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16" ref={galleryRef}>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Events
        </Link>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-1">
              {event?.title}
            </h2>
            <p className="text-sm text-gray-500 tracking-wide">
              {event?.subtitle && `${event.subtitle} • `}{eventDate} • {images.length} Photos
            </p>
          </div>

          <div className="flex items-center gap-4">
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

        <MasonryGrid columns={{ default: 2, sm: 2, lg: 3, xl: 3 }} gap={16}>
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
        <Suspense fallback={<div className="fixed inset-0 bg-black/95 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white"></div></div>}>
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
        </Suspense>
      )}
    </div>
  );
}
