interface HeroProps {
  heroImage: string;
  onViewGallery: () => void;
}

export function Hero({ heroImage, onViewGallery }: HeroProps) {
  return (
    <div className="relative">
      <div className="relative h-[75vh] overflow-hidden">
        <img
          src={heroImage}
          alt="Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-white/90" />
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 -mt-56 relative z-10">
        <div className="bg-white/95 backdrop-blur-sm py-12 md:py-16 px-6 md:px-12 text-center shadow-2xl">
          <div className="mb-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 flex items-center justify-center">
                <img src="/LOGO PLKV.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-xs tracking-[0.3em] text-gray-600 uppercase">
                Polokwane Videographer
              </span>
            </div>
            <p className="text-xs tracking-[0.2em] text-gray-500 uppercase mb-2">
              September 24th, 2023
            </p>
          </div>

          <p className="text-xs tracking-[0.3em] text-gray-500 uppercase mb-4">
            Unveiling Tombstone of
          </p>
          <h1 className="text-4xl md:text-6xl font-serif mb-8 text-gray-900 leading-tight">
            Maite Maria<br />Raphasha
          </h1>

          <button
            onClick={onViewGallery}
            className="px-8 py-3.5 bg-[#8A9876] text-white text-sm tracking-[0.2em] uppercase hover:bg-[#7A8866] transition-all duration-300 hover:shadow-lg"
          >
            View Gallery
          </button>
        </div>
      </div>
    </div>
  );
}
