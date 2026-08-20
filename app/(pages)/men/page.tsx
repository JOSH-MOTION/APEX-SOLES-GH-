"use client";

import { useEffect, useMemo, useState } from "react";
import { Shoe } from "@/types";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useShoes } from "@/hooks/useShoes";
import { getLowestAsksForShoes, getSoldCountsForShoes, getFollowedShoeIds, toggleFollow } from "@/lib/market";
import { ProductCard } from "@/components/ProductCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { UserAuthModal } from "@/components/UserAuthModal";

export default function MenPage() {
  const { shoes: allShoes, loading } = useShoes();
  const { user } = useAuthUser();
  const [askMap, setAskMap] = useState<Record<string, number>>({});
  const [soldMap, setSoldMap] = useState<Record<string, number>>({});
  const [followed, setFollowed] = useState<Set<string>>(new Set());
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const shoes = useMemo(() => allShoes.filter((s) => s.category !== "Women"), [allShoes]);

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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#c6ff00] selection:text-black">
      <Navbar />
      <main>
        <section className="px-6 py-20 max-w-[1400px] mx-auto w-full">
          <div className="mb-12">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2">Men's Collection</h2>
            <p className="text-gray-500 uppercase text-[10px] font-bold tracking-[0.2em]">Curated selection for men.</p>
          </div>
          {loading ? (
            <div className="flex justify-center py-24">
              <div className="w-8 h-8 border-4 border-white/20 border-t-[#c6ff00] rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {shoes.map((shoe) => (
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
        </section>
      </main>
      <Footer />
      <UserAuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
