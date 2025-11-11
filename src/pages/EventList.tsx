import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Image as ImageIcon } from 'lucide-react';
import { supabase, getImageUrl } from '../lib/supabase';
import type { Event, ImageData } from '../types';

interface EventWithImageCount extends Event {
  image_count: number;
  first_image?: ImageData;
}

export function EventList() {
  const [events, setEvents] = useState<EventWithImageCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);

      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .order('event_date', { ascending: false });

      if (eventsError) {
        console.error('Error fetching events:', eventsError);
        setLoading(false);
        return;
      }

      const eventsWithImages = await Promise.all(
        eventsData.map(async (event) => {
          const { count } = await supabase
            .from('images')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id);

          const { data: firstImage } = await supabase
            .from('images')
            .select('*')
            .eq('event_id', event.id)
            .order('display_order', { ascending: true })
            .limit(1)
            .single();

          return {
            ...event,
            image_count: count || 0,
            first_image: firstImage || undefined,
          };
        })
      );

      setEvents(eventsWithImages);
      setLoading(false);
    }

    fetchEvents();
  }, []);

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
          <p className="text-gray-600 mt-6 text-sm tracking-wide">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="text-center mb-16">
          <img
            src="/LOGO PLKV with shadow.png"
            alt="PLKV Logo"
            className="w-24 h-24 mx-auto mb-6 object-contain"
          />
          <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-3">
            POLOKWANE VIDEOGRAPHER
          </h1>
          <p className="text-lg text-gray-600 tracking-wide">
            Event Photo Galleries
          </p>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="mx-auto w-16 h-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-serif text-gray-900 mb-2">No Events Yet</h2>
            <p className="text-gray-600">Check back soon for event galleries</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => {
              const eventDate = new Date(event.event_date);
              const formattedDate = eventDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              });

              let thumbnailUrl = '';
              if (event.first_image) {
                if (event.first_image.cloudinary_urls) {
                  thumbnailUrl = event.first_image.cloudinary_urls.w960;
                } else if (event.first_image.bucket && event.first_image.path) {
                  thumbnailUrl = getImageUrl(event.first_image.bucket, event.first_image.path, {
                    width: 800,
                    quality: 80
                  });
                }
              }

              return (
                <Link
                  key={event.id}
                  to={`/${event.slug}`}
                  className="group bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="aspect-[4/3] bg-gray-200 overflow-hidden">
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h2 className="text-2xl font-serif text-gray-900 mb-2 group-hover:text-[#8A9876] transition-colors">
                      {event.title}
                    </h2>
                    {event.subtitle && (
                      <p className="text-sm text-gray-600 mb-3">{event.subtitle}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={16} />
                        <span>{formattedDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ImageIcon size={16} />
                        <span>{event.image_count} photos</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
