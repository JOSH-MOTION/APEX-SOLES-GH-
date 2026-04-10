import { Shoe } from "@/types";

interface HorizontalGalleryProps {
  shoes: Shoe[];
}

export const HorizontalGallery = ({ shoes }: HorizontalGalleryProps) => {
  const fallbackImages = [
    "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1523398002811-999ca8dec234?q=80&w=800&auto=format&fit=crop",
  ];

  const displayImages = shoes.length > 0 ? shoes.map(s => s.image_url) : fallbackImages;

  return (
    <section className="py-12 overflow-hidden bg-white">
      <div className="flex gap-4 animate-marquee whitespace-nowrap">
        {[...displayImages, ...displayImages, ...displayImages].map((src, i) => (
          <div key={i} className="inline-block w-64 h-80 flex-shrink-0 rounded-2xl overflow-hidden border border-black/5">
            <img src={src} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt="Gallery" referrerPolicy="no-referrer" />
          </div>
        ))}
      </div>
    </section>
  );
};
