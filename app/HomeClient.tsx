"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Shoe } from "@/types";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useShoes } from "@/hooks/useShoes";
import { getLowestAsksForShoes, getSoldCountsForShoes, getTrendingShoeIds, toggleFollow, getFollowedShoeIds } from "@/lib/market";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Hero } from "@/components/Hero";
import { HorizontalGallery } from "@/components/HorizontalGallery";
import { UserAuthModal } from "@/components/UserAuthModal";

export default function HomeClient() {
  const { shoes, loading } = useShoes();
  const { user } = useAuthUser();
  const [askMap, setAskMap] = useState<Record<string, number>>({});
  const [soldMap, setSoldMap] = useState<Record<string, number>>({});
  const [trendingIds, setTrendingIds] = useState<string[]>([]);
  const [followed, setFollowed] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState("All");
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    if (shoes.length === 0) return;
    const ids = shoes.map((s) => s.id);
    getLowestAsksForShoes(ids).then(setAskMap).catch(() => {});
    getSoldCountsForShoes(ids).then(setSoldMap).catch(() => {});
    getTrendingShoeIds(8).then(setTrendingIds).catch(() => {});
  }, [shoes]);

  useEffect(() => {
    if (!user) {
      setFollowed(new Set());
      return;
    }
    getFollowedShoeIds(user.uid).then(setFollowed).catch(() => {});
  }, [user]);

  const handleToggleFollow = async (shoe: Shoe) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    const isNowFollowed = await toggleFollow(user.uid, String(shoe.id));
    setFollowed((prev) => {
      const next = new Set(prev);
      if (isNowFollowed) next.add(String(shoe.id));
      else next.delete(String(shoe.id));
      return next;
    });
  };

  const popularBrands = useMemo(() => {
    const byBrand = new Map<string, Shoe[]>();
    shoes.forEach((s) => {
      if (!byBrand.has(s.brand)) byBrand.set(s.brand, []);
      byBrand.get(s.brand)!.push(s);
    });
    // Only worth a "Popular Brands" row once the catalog actually spans more
    // than one brand — right now most existing products are tagged "APEX
    // SOLES" regardless of the real manufacturer, so this stays empty until
    // that's cleaned up or new products use distinct brands.
    if (byBrand.size < 2) return [];
    return Array.from(byBrand.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 6)
      .map(([brand, items]) => ({ brand, count: items.length, image: items[0].image_url }));
  }, [shoes]);

  const trendingShoes = useMemo(() => {
    if (trendingIds.length > 0) {
      const byId = new Map(shoes.map((s) => [String(s.id), s]));
      const found = trendingIds.map((id) => byId.get(id)).filter(Boolean) as Shoe[];
      if (found.length > 0) return found;
    }
    return shoes.slice(0, 8);
  }, [trendingIds, shoes]);

  // Extra curated rows, mirroring how stockx.com stacks several distinct
  // horizontal-scroll shelves on its homepage rather than one flat grid —
  // built from real category counts, not fabricated content.
  const categoryRows = useMemo(() => {
    const byCategory = new Map<string, Shoe[]>();
    shoes.forEach((s) => {
      if (!byCategory.has(s.category)) byCategory.set(s.category, []);
      byCategory.get(s.category)!.push(s);
    });
    return Array.from(byCategory.entries())
      .filter(([, items]) => items.length >= 3)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 3)
      .map(([category, items]) => ({ category, items: items.slice(0, 8) }));
  }, [shoes]);

  const categories = useMemo(() => ["All", ...Array.from(new Set(shoes.map((s) => s.category))).sort()], [shoes]);

  const filteredShoes = useMemo(() => {
    if (activeCategory === "All") return shoes;
    return shoes.filter((s) => s.category === activeCategory);
  }, [shoes, activeCategory]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="w-8 h-8 border-4 border-white/20 border-t-[#c6ff00] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#c6ff00] selection:text-black">
      <Navbar />

      <main>
        <Hero />
        <HorizontalGallery shoes={trendingShoes} />

        {popularBrands.length > 0 && (
          <section className="px-6 pt-16 max-w-[1400px] mx-auto w-full">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">Popular Brands</h2>
              <Link href="/archive" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#c6ff00] transition-colors">See All</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {popularBrands.map(({ brand, count, image }) => (
                <Link
                  key={brand}
                  href={`/archive?brand=${encodeURIComponent(brand)}`}
                  className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-[#141414]"
                >
                  <img src={image} alt={brand} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="font-black italic uppercase tracking-tighter text-white text-lg leading-none">{brand}</p>
                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mt-1">{count} {count === 1 ? "Pair" : "Pairs"}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {trendingShoes.length > 0 && (
          <section className="px-6 py-16 max-w-[1400px] mx-auto w-full">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-8">Trending Now</h2>
            <div className="flex gap-6 overflow-x-auto pb-4">
              {trendingShoes.map((shoe) => (
                <div key={shoe.id} className="w-44 flex-shrink-0">
                  <ProductCard
                    shoe={shoe}
                    lowestAsk={askMap[String(shoe.id)]}
                    soldCount={soldMap[String(shoe.id)]}
                    isFollowed={followed.has(String(shoe.id))}
                    onToggleFollow={handleToggleFollow}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {categoryRows.map(({ category, items }) => (
          <section key={category} className="px-6 py-16 max-w-[1400px] mx-auto w-full border-t border-white/5">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">{category}</h2>
              <button
                onClick={() => { setActiveCategory(category); document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#c6ff00] transition-colors"
              >
                See All
              </button>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4">
              {items.map((shoe) => (
                <div key={shoe.id} className="w-44 flex-shrink-0">
                  <ProductCard
                    shoe={shoe}
                    lowestAsk={askMap[String(shoe.id)]}
                    soldCount={soldMap[String(shoe.id)]}
                    isFollowed={followed.has(String(shoe.id))}
                    onToggleFollow={handleToggleFollow}
                  />
                </div>
              ))}
            </div>
          </section>
        ))}

        <section id="collection" className="px-6 py-20 max-w-[1400px] mx-auto w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2 text-white">The Collection</h2>
              <p className="text-gray-500 uppercase text-[10px] font-bold tracking-[0.2em]">Buy at the lowest ask, or bid your price.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-md border transition-all ${activeCategory === cat ? "bg-[#c6ff00] text-black border-[#c6ff00]" : "border-white/10 text-white hover:border-white/30"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredShoes.map((shoe) => (
              <ProductCard
                key={shoe.id}
                shoe={shoe}
                lowestAsk={askMap[String(shoe.id)]}
                soldCount={soldMap[String(shoe.id)]}
                isFollowed={followed.has(String(shoe.id))}
                onToggleFollow={handleToggleFollow}
              />
            ))}
          </div>
        </section>

        <section className="bg-[#141414] py-32 px-6 border-y border-white/10">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4 text-white">Stay in the Loop</h2>
            <p className="text-gray-500 mb-10 text-sm">Get notified about upcoming drops and exclusive events in Accra.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email Address"
                className="flex-1 bg-white/5 border border-white/10 rounded-md px-6 py-4 text-sm focus:outline-none focus:ring-1 ring-[#c6ff00]/30 text-white placeholder:text-gray-500"
              />
              <button className="bg-[#c6ff00] text-black px-10 py-4 rounded-md font-black uppercase tracking-widest text-xs hover:bg-[#d4ff33] transition-colors">Join</button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <UserAuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
