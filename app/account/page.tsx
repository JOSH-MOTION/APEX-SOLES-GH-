"use client";

import { useEffect, useState } from "react";
import { Lock, X, ShoppingBag, Tag, Receipt, Clock } from "lucide-react";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useShoes } from "@/hooks/useShoes";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Ask, Offer, Sale, Preorder } from "@/types";
import { getMyAsks, getMyOffers, getMySales, getMyPreorders, cancelAsk, cancelOffer } from "@/lib/market";

type Tab = "offers" | "listings" | "sales" | "preorders";

export default function AccountPage() {
  const { user, loading: authLoading } = useAuthUser();
  const { shoes } = useShoes();
  const [tab, setTab] = useState<Tab>("offers");
  const [offers, setOffers] = useState<Offer[]>([]);
  const [asks, setAsks] = useState<Ask[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [preorders, setPreorders] = useState<Preorder[]>([]);
  const [loading, setLoading] = useState(true);

  const shoeName = (shoeId: string) => shoes.find((s) => String(s.id) === shoeId)?.name || "Unknown Sneaker";
  const shoeImage = (shoeId: string) => shoes.find((s) => String(s.id) === shoeId)?.image_url;

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const [o, a, s, p] = await Promise.all([getMyOffers(user.uid), getMyAsks(user.uid), getMySales(user.uid), getMyPreorders(user.uid)]);
    setOffers(o);
    setAsks(a);
    setSales(s);
    setPreorders(p);
    setLoading(false);
  };

  useEffect(() => {
    if (user) load();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleCancelOffer = async (id: string) => {
    await cancelOffer(id);
    load();
  };
  const handleCancelAsk = async (id: string) => {
    await cancelAsk(id);
    load();
  };

  const tabs: { id: Tab; label: string; icon: any; count: number }[] = [
    { id: "offers", label: "My Bids", icon: ShoppingBag, count: offers.length },
    { id: "listings", label: "My Listings", icon: Tag, count: asks.length },
    { id: "sales", label: "My Sales", icon: Receipt, count: sales.length },
    { id: "preorders", label: "My Pre-Orders", icon: Clock, count: preorders.length },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">My Account</h1>
        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-12">Track your bids, listings, pre-orders and completed trades.</p>

        {authLoading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-4 border-white/20 border-t-[#c6ff00] rounded-full animate-spin" />
          </div>
        ) : !user ? (
          <div className="text-center py-24 bg-[#141414] border border-white/10 rounded-3xl">
            <Lock size={40} className="mx-auto mb-4 text-gray-600" />
            <p className="text-2xl font-black italic uppercase tracking-tighter text-white mb-2">Sign In Required</p>
            <p className="text-gray-500 text-sm">Log in from the account icon in the navbar to view your activity.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-8 bg-[#141414] p-2 rounded-2xl border border-white/10 w-fit">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === t.id ? "bg-[#c6ff00] text-black" : "text-gray-400 hover:bg-white/5"}`}
                >
                  <t.icon size={14} /> {t.label} ({t.count})
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-24">
                <div className="w-8 h-8 border-4 border-white/20 border-t-[#c6ff00] rounded-full animate-spin" />
              </div>
            ) : (
              <div className="bg-[#141414] border border-white/10 rounded-3xl overflow-hidden">
                {tab === "offers" && (
                  offers.length === 0 ? <EmptyState text="No bids placed yet." /> : (
                    <div className="divide-y divide-white/5">
                      {offers.map((o) => (
                        <Row key={o.id} image={shoeImage(o.shoeId)} title={shoeName(o.shoeId)} subtitle={`Size ${o.size}`} price={o.price} status={o.status}>
                          {o.status === "active" && (
                            <button onClick={() => handleCancelOffer(o.id)} className="p-2 text-gray-500 hover:text-red-500 transition-colors"><X size={16} /></button>
                          )}
                        </Row>
                      ))}
                    </div>
                  )
                )}
                {tab === "listings" && (
                  asks.length === 0 ? <EmptyState text="No items listed for sale yet." /> : (
                    <div className="divide-y divide-white/5">
                      {asks.map((a) => (
                        <Row key={a.id} image={shoeImage(a.shoeId)} title={shoeName(a.shoeId)} subtitle={`Size ${a.size} · ${a.condition}`} price={a.price} status={a.status}>
                          {a.status === "active" && (
                            <button onClick={() => handleCancelAsk(a.id)} className="p-2 text-gray-500 hover:text-red-500 transition-colors"><X size={16} /></button>
                          )}
                        </Row>
                      ))}
                    </div>
                  )
                )}
                {tab === "sales" && (
                  sales.length === 0 ? <EmptyState text="No completed trades yet." /> : (
                    <div className="divide-y divide-white/5">
                      {sales.map((s) => (
                        <Row
                          key={s.id}
                          image={shoeImage(s.shoeId)}
                          title={shoeName(s.shoeId)}
                          subtitle={`Size ${s.size} · You ${s.buyerId === user.uid ? "bought" : "sold"}`}
                          price={s.price}
                          status={s.fulfillmentStatus}
                        />
                      ))}
                    </div>
                  )
                )}
                {tab === "preorders" && (
                  preorders.length === 0 ? <EmptyState text="No pre-order requests yet." /> : (
                    <div className="divide-y divide-white/5">
                      {preorders.map((p) => (
                        <Row
                          key={p.id}
                          image={shoeImage(p.shoeId)}
                          title={p.shoeName}
                          subtitle={`Size ${p.size} · Deposit GH¢ ${p.depositAmount.toLocaleString()} · ETA ${p.eta}`}
                          price={p.price}
                          status={p.status.replace("_", " ")}
                        />
                      ))}
                    </div>
                  )
                )}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="text-center text-gray-500 text-xs font-bold uppercase tracking-widest py-16">{text}</p>;
}

function Row({
  image,
  title,
  subtitle,
  price,
  status,
  children,
}: {
  image?: string;
  title: string;
  subtitle: string;
  price: number;
  status: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 px-6 py-4">
      <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
        {image && <img src={image} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black italic uppercase tracking-tight text-white truncate">{title}</p>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{subtitle}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-mono font-black text-[#c6ff00]">GH¢ {price.toLocaleString()}</p>
        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest capitalize">{status}</p>
      </div>
      {children}
    </div>
  );
}
