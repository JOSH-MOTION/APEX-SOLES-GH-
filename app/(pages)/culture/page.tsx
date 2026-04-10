"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartItem } from "@/types";

export default function CulturePage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const posts = [
    {
      id: 1,
      title: "The Rise of Sneaker Culture in Ghana",
      excerpt: "How Accra became the epicenter of sneaker enthusiasm in West Africa, from local collectors to global influencers.",
      image: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?q=80&w=800&auto=format&fit=crop",
      category: "Culture",
      date: "March 15, 2026"
    },
    {
      id: 2,
      title: "Limited Drops: The Psychology of Hype",
      excerpt: "Understanding the marketing strategies behind exclusive sneaker releases and why we can't resist them.",
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop",
      category: "Business",
      date: "March 10, 2026"
    },
    {
      id: 3,
      title: "Osu Streets: Where Style Meets Substance",
      excerpt: "A photo essay capturing the vibrant sneaker scene in Accra's most fashionable neighborhood.",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b79c4f?q=80&w=800&auto=format&fit=crop",
      category: "Street Style",
      date: "March 5, 2026"
    }
  ];

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <Navbar 
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)} 
        onOpenCart={() => setIsCartOpen(true)} 
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />
      <main>
        <section className="py-20 px-6 w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
            <div>
              <h2 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter text-black leading-none">Culture</h2>
              <p className="text-gray-400 uppercase text-[10px] font-bold tracking-[0.3em] mt-4">Stories, News & Community Updates</p>
            </div>
            <div className="hidden md:block h-px flex-1 bg-black/5 mx-12 mb-4" />
            <div className="text-right">
              <p className="text-[10px] font-black text-black uppercase tracking-widest">Issue No. 04</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Spring 2026</p>
            </div>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-gray-300 font-black italic uppercase text-3xl tracking-tighter">No posts yet.</p>
              <p className="text-gray-400 text-sm mt-2 uppercase tracking-widest">Check back soon for stories & news.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {posts.map((article: any, i: number) => (
                <div key={article.id} className="group cursor-pointer space-y-6">
                  <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-black/5 relative">
                    <img 
                      src={article.image || "https://images.unsplash.com/photo-1523398002811-999ca8dec234?q=80&w=800&auto=format&fit=crop"} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                      referrerPolicy="no-referrer"
                      alt={article.title}
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-black uppercase tracking-widest bg-black/5 px-2 py-1 rounded">{article.category}</span>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{article.date}</span>
                    </div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-black group-hover:text-gray-600 transition-colors leading-tight">
                      {article.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                      {article.excerpt}
                    </p>
                    <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black group-hover:gap-3 transition-all">
                      Read More <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-32 p-12 bg-[#f8f8f8] rounded-3xl border border-black/5 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-md space-y-4">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter text-black">Join the Community</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Be the first to know about exclusive events, pop-up shops, and community meetups in Accra.
              </p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="flex-1 md:w-64 bg-white border border-black/5 rounded-md px-6 py-4 text-sm focus:outline-none focus:ring-1 ring-black/20 text-black"
              />
              <button className="bg-black text-white px-10 py-4 rounded-md font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-colors">Subscribe</button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
