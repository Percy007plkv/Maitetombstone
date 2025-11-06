import { images } from './imageData';
import { useState, useRef } from 'react';
import { X, Download, ChevronLeft, ChevronRight, ShoppingCart, Heart, Share2, Play, Copy } from 'lucide-react';
import JSZip from 'jszip';

function App() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);

  const scrollToGallery = () => {
    galleryRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const selectedImage = selectedIndex !== null ? images[selectedIndex] : null;

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedIndex === null) return;

    if (direction === 'prev') {
      setSelectedIndex(selectedIndex > 0 ? selectedIndex - 1 : images.length - 1);
    } else {
      setSelectedIndex(selectedIndex < images.length - 1 ? selectedIndex + 1 : 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') navigateImage('prev');
    if (e.key === 'ArrowRight') navigateImage('next');
    if (e.key === 'Escape') setSelectedIndex(null);
  };

  const handleDownload = async (imageUrl: string) => {
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
  };

  const handleDownloadAll = async () => {
    setIsDownloading(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder('photos');

      for (let i = 0; i < images.length; i++) {
        try {
          const response = await fetch(images[i]);
          const blob = await response.blob();
          const filename = images[i].split('/').pop() || `image-${i + 1}.jpg`;
          folder?.file(filename, blob);
        } catch (error) {
          console.error(`Failed to download image ${i + 1}:`, error);
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'gallery-photos.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to create zip:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-[70vh] overflow-hidden">
        <img
          src={images[0]}
          alt="Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-white" />
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-48 relative z-10">
        <div className="bg-white/95 backdrop-blur-sm py-16 text-center">
          <div className="mb-3">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 flex items-center justify-center">
                <img src="/LOGO PLKV.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-xs tracking-[0.3em] text-gray-600 uppercase">Polokwane Videographer</span>
            </div>
            <p className="text-xs tracking-[0.2em] text-gray-500 uppercase mb-2">September 24th, 2023</p>
          </div>

          <p className="text-xs tracking-[0.3em] text-gray-500 uppercase mb-3">Unveiling Tombstone of</p>
          <h1 className="text-5xl md:text-6xl font-serif mb-8 text-gray-900 leading-tight">
            Maite Maria<br/>Raphasha
          </h1>

          <button
            onClick={scrollToGallery}
            className="px-8 py-3 bg-[#9CA986] text-white text-sm tracking-[0.2em] uppercase hover:bg-[#8A9876] transition-colors"
          >
            View Gallery
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16" ref={galleryRef}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-serif text-gray-900">Maite Maria Raphasha</h2>
            <p className="text-sm text-gray-500 tracking-wide mt-1">Unveiling Tombstone Ceremony</p>
          </div>

          <div className="flex items-center gap-6">
            <button className="text-gray-600 hover:text-gray-900 transition-colors">
              <ShoppingCart size={20} />
            </button>
            <button className="text-gray-600 hover:text-gray-900 transition-colors">
              <Heart size={20} />
            </button>
            <button
              onClick={handleDownloadAll}
              disabled={isDownloading}
              className="text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
            >
              <Download size={20} />
            </button>
            <button className="text-gray-600 hover:text-gray-900 transition-colors">
              <Share2 size={20} />
            </button>
            <button className="text-gray-600 hover:text-gray-900 transition-colors">
              <Play size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {images.map((src, index) => (
            <div
              key={index}
              className="group relative overflow-hidden cursor-pointer"
            >
              <img
                src={src}
                alt=""
                className="w-full h-auto transition-transform duration-500 ease-out group-hover:scale-105"
                loading="lazy"
                onClick={() => setSelectedIndex(index)}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300" />

              <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-center gap-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex(index);
                  }}
                  className="text-white/90 hover:text-white transition-colors p-2"
                  aria-label="View image"
                >
                  <Copy size={20} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="text-white/90 hover:text-white transition-colors p-2"
                  aria-label="Like"
                >
                  <Heart size={20} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(src);
                  }}
                  className="text-white/90 hover:text-white transition-colors p-2"
                  aria-label="Download"
                >
                  <Download size={20} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="text-white/90 hover:text-white transition-colors p-2"
                  aria-label="Share"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {selectedImage && selectedIndex !== null && (
          <div
            className="fixed inset-0 bg-black z-50 flex items-center justify-center"
            onClick={() => setSelectedIndex(null)}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute top-6 right-6 text-white/90 hover:text-white transition-colors p-2 z-10"
              aria-label="Close"
            >
              <X size={28} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(selectedImage);
              }}
              className="absolute top-6 right-20 text-white/90 hover:text-white transition-colors p-2 z-10"
              aria-label="Download"
            >
              <Download size={28} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateImage('prev');
              }}
              className="absolute left-6 top-1/2 -translate-y-1/2 text-white/90 hover:text-white transition-colors p-3 bg-black/30 hover:bg-black/50 rounded-full z-10"
              aria-label="Previous image"
            >
              <ChevronLeft size={32} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateImage('next');
              }}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-white/90 hover:text-white transition-colors p-3 bg-black/30 hover:bg-black/50 rounded-full z-10"
              aria-label="Next image"
            >
              <ChevronRight size={32} />
            </button>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm z-10">
              {selectedIndex + 1} / {images.length}
            </div>

            <img
              src={selectedImage}
              alt=""
              className="max-w-[90vw] max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
