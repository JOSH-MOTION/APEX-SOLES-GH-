"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Info } from "lucide-react";
import { Shoe } from "@/types";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useShoes } from "@/hooks/useShoes";
import { getLowestAsksForShoes, getSoldCountsForShoes, getFollowedShoeIds, toggleFollow } from "@/lib/market";
import { ProductCard } from "@/components/ProductCard";
import { FilterSidebar, ProductFilters, defaultFilters, applyFilters } from "@/components/FilterSidebar";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { UserAuthModal } from "@/components/UserAuthModal";

function ArchiveContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const intent = searchParams.get("intent");

  const { shoes, loading } = useShoes();
  const { user } = useAuthUser();
  const [filters, setFilters] = useState<ProductFilters>({ ...defaultFilters, brand: searchParams.get("brand") || "" });
  const [askMap, setAskMap] = useState<Record<string, number>>({});
  const [soldMap, setSoldMap] = useState<Record<string, number>>({});
  const [followed, setFollowed] = useState<Set<string>>(new Set());
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    if (shoes.length === 0) return;
    const ids = shoes.map((s) => s.id);
    getLowestAsksForShoes(ids).then(setAskMap).catch(() => {});
    getSoldCountsForShoes(ids).then(setSoldMap).catch(() => {});
  }, [shoes]);

  useEffect(() => {
    if (!user) return setFollowed(new Set());
    getFollowedShoeIds(user.uid).then(setFollowed).catch(() => {});
  }, [user]);

  const handleToggleFollow = async (shoe: Shoe) => {
    if (!user) return setIsAuthOpen(true);
    const isNowFollowed = await toggleFollow(user.uid, String(shoe.id));
    setFollowed((prev) => {
      const next = new Set(prev);
      isNowFollowed ? next.add(String(shoe.id)) : next.delete(String(shoe.id));
      return next;
    });
  };

  const searched = useMemo(() => {
    if (!query) return shoes;
    const q = query.toLowerCase();
    return shoes.filter((s) => s.name.toLowerCase().includes(q) || s.brand.toLowerCase().includes(q));
  }, [shoes, query]);

  const filteredShoes = useMemo(() => applyFilters(searched, askMap, filters), [searched, askMap, filters]);

  return (
    <main>
      <section className="py-20 px-6 max-w-[1400px] mx-auto w-full">
        <div className="mb-12">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2 text-white">
            {query ? `Results for "${query}"` : "Browse the Marketplace"}
          </h2>
          <p className="text-gray-500 uppercase text-[10px] font-bold tracking-[0.2em]">Filter by brand, size, color and price.</p>
        </div>

        {intent === "sell" && (
          <div className="mb-10 flex items-start gap-3 bg-[#c6ff00]/10 border border-[#c6ff00]/30 rounded-2xl p-5 text-sm text-[#c6ff00]">
            <Info size={18} className="flex-shrink-0 mt-0.5" />
            <p>Find the sneaker you want to sell below, open its page, and hit <strong>"Sell This Item"</strong> to list your pair.</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-10">
          <FilterSidebar shoes={searched} filters={filters} onChange={setFilters} />

          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center py-24">
                <div className="w-8 h-8 border-4 border-white/20 border-t-[#c6ff00] rounded-full animate-spin" />
              </div>
            ) : filteredShoes.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-gray-600 font-black italic uppercase text-3xl tracking-tighter">No sneakers found</p>
                <p className="text-gray-500 text-sm mt-2 uppercase tracking-widest">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
            )}
          </div>
        </div>
      </section>
      <UserAuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </main>
  );
}

export default function ArchivePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#c6ff00] selection:text-black">
      <Navbar />
      <Suspense fallback={<div className="flex justify-center py-24"><div className="w-8 h-8 border-4 border-white/20 border-t-[#c6ff00] rounded-full animate-spin" /></div>}>
        <ArchiveContent />
      </Suspense>
      <Footer />
    </div>
  );
}
