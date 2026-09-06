"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { ChevronDown, Heart, Tag, Bell } from "lucide-react";
import { getClientDb } from "@/lib/firebase";
import { Shoe, Ask, Offer, Sale } from "@/types";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useShoes } from "@/hooks/useShoes";
import { useCart } from "../../CartProvider";
import {
  subscribeAsks,
  subscribeOffers,
  getLastSale,
  buyNow,
  toggleFollow,
  getFollowedShoeIds,
  createPreorderRequest,
  PREORDER_DEPOSIT_PERCENT,
} from "@/lib/market";
import { resolveStockStatus, STOCK_STATUS_CONFIG } from "@/lib/stockStatus";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { UserAuthModal } from "@/components/UserAuthModal";
import { BidModal } from "@/components/market/BidModal";
import { AskModal } from "@/components/market/AskModal";
import { MarketDataDrawer } from "@/components/market/MarketDataDrawer";

const FALLBACK_SIZES = ["US 7", "US 8", "US 9", "US 10", "US 11", "US 12"];

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-4 text-left">
        <span className="text-xs font-black uppercase tracking-widest text-white">{title}</span>
        <ChevronDown size={16} className={`text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="pb-4 text-sm text-gray-400 leading-relaxed">{children}</div>}
    </div>
  );
}

export default function ProductPage() {
  const params = useParams();
  const id = String(params.id);
  const { user } = useAuthUser();
  const { addTrade } = useCart();
  const { shoes: allShoes } = useShoes();

  const [shoe, setShoe] = useState<Shoe | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [asks, setAsks] = useState<Ask[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [isFollowed, setIsFollowed] = useState(false);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isBidOpen, setIsBidOpen] = useState(false);
  const [isAskOpen, setIsAskOpen] = useState(false);
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [buying, setBuying] = useState(false);
  const [preordering, setPreordering] = useState(false);
  const [preorderConfirmed, setPreorderConfirmed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(getClientDb(), "shoes", id));
        if (!cancelled && snap.exists()) {
          const data = { id: snap.id, ...snap.data() } as Shoe;
          setShoe(data);
          setMainImage(data.image_url);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    const unsubAsks = subscribeAsks(id, null, setAsks);
    const unsubOffers = subscribeOffers(id, null, setOffers);
    return () => {
      unsubAsks();
      unsubOffers();
    };
  }, [id]);

  const refreshLastSale = () => {
    getLastSale(id).then(setLastSale).catch(() => {});
  };
  useEffect(refreshLastSale, [id]);

  useEffect(() => {
    if (!user) {
      setIsFollowed(false);
      return;
    }
    getFollowedShoeIds(user.uid).then((set) => setIsFollowed(set.has(id))).catch(() => {});
  }, [user, id]);

  const sizes = useMemo(() => (shoe?.sizes && shoe.sizes.length > 0 ? shoe.sizes : FALLBACK_SIZES), [shoe]);
  const status = resolveStockStatus(shoe?.stockStatus);
  const statusConfig = STOCK_STATUS_CONFIG[status];

  useEffect(() => {
    if (sizes.length > 0 && !selectedSize) setSelectedSize(sizes[0]);
  }, [sizes, selectedSize]);

  const lowestAskForSize = useMemo(() => {
    const forSize = asks.filter((a) => a.size === selectedSize);
    if (forSize.length === 0) return null;
    return forSize.reduce((min, a) => (a.price < min.price ? a : min), forSize[0]);
  }, [asks, selectedSize]);

  const relatedShoes = useMemo(
    () => allShoes.filter((s) => String(s.id) !== id && s.brand === shoe?.brand).slice(0, 4),
    [allShoes, id, shoe]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/20 border-t-[#c6ff00] rounded-full animate-spin" />
      </div>
    );
  }

  if (!shoe) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <p className="text-3xl font-black italic uppercase tracking-tighter">Not Found</p>
          <p className="text-gray-500 text-sm mt-2">This sneaker doesn't exist or was removed.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const allImages = [shoe.image_url, ...(shoe.additional_images || [])];

  const handleBuyNow = async () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    if (!selectedSize) {
      alert("Please select a size first.");
      return;
    }
    if (!lowestAskForSize) {
      setIsBidOpen(true);
      return;
    }
    setBuying(true);
    try {
      const result = await buyNow({
        shoeId: id,
        size: selectedSize,
        buyerId: user.uid,
        buyerName: user.displayName || user.email || "Buyer",
      });
      if (!result) {
        alert("That ask was just taken by someone else — try again or place a bid.");
        return;
      }
      addTrade({
        saleId: result.saleId,
        shoeId: id,
        name: shoe.name,
        image_url: shoe.image_url,
        size: selectedSize,
        condition: result.condition,
        price: result.price,
      });
      refreshLastSale();
    } catch (err) {
      console.error(err);
      alert("Buy Now failed. Please try again.");
    } finally {
      setBuying(false);
    }
  };

  const handlePreorderRequest = async () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    if (!selectedSize) {
      alert("Please select a size first.");
      return;
    }
    setPreordering(true);
    try {
      const eta = shoe.preOrderEta || "7-14 days";
      const { preorderId, depositAmount } = await createPreorderRequest({
        shoeId: id,
        shoeName: shoe.name,
        size: selectedSize,
        price: shoe.price,
        eta,
        buyerId: user.uid,
        buyerName: user.displayName || user.email || "Buyer",
      });

      let message = "🟡 *PRE-ORDER REQUEST — APEX SOLES*\n\n";
      message += `👟 *Sneaker:* ${shoe.name}\n`;
      message += `📏 *Size:* ${selectedSize}\n`;
      message += `💰 *Price:* GH¢ ${shoe.price.toLocaleString()}\n`;
      message += `💵 *Deposit Required (${PREORDER_DEPOSIT_PERCENT}%):* GH¢ ${depositAmount.toLocaleString()}\n`;
      message += `📦 *Estimated Arrival:* ${eta}\n`;
      message += `🧾 *Request Ref:* ${preorderId}\n\n`;
      message += "Please confirm to proceed with your deposit. Thank you for choosing Apex Soles! 🙌";

      window.open(`https://wa.me/233549920071?text=${encodeURIComponent(message)}`, "_blank");
      setPreorderConfirmed(true);
    } catch (err) {
      console.error(err);
      alert("Failed to submit pre-order request. Please try again.");
    } finally {
      setPreordering(false);
    }
  };

  const handleToggleFollow = async () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    const followed = await toggleFollow(user.uid, id);
    setIsFollowed(followed);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />

      <main className="max-w-[1400px] mx-auto px-6 py-10">
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-8">
          <a href="/archive" className="hover:text-white">Sneakers</a> / {shoe.category} / {shoe.brand}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Gallery */}
          <div>
            <div className="aspect-square bg-[#141414] rounded-3xl border border-white/10 overflow-hidden flex items-center justify-center p-10">
              <img src={mainImage} alt={shoe.name} className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setMainImage(img)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${mainImage === img ? "border-[#c6ff00]" : "border-white/10 hover:border-white/30"}`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info + trading box */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <p className="text-gray-500 text-xs font-black tracking-widest uppercase">{shoe.brand}</p>
                  <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${statusConfig.badgeClass}`}>
                    <statusConfig.Icon size={12} strokeWidth={2.5} /> {statusConfig.label}
                  </span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter leading-none mt-1">{shoe.name}</h1>
              </div>
              <button
                onClick={handleToggleFollow}
                className="p-3 rounded-full border border-white/10 text-white hover:border-[#c6ff00]/50 transition-colors flex-shrink-0"
              >
                <Heart size={20} fill={isFollowed ? "#c6ff00" : "none"} className={isFollowed ? "text-[#c6ff00]" : ""} />
              </button>
            </div>
            <p className="text-gray-400 text-sm mt-4 leading-relaxed max-w-xl">{shoe.description}</p>

            <div className="mt-8 space-y-3">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Select Size</p>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${selectedSize === size ? "bg-[#c6ff00] text-black border-[#c6ff00]" : "bg-white/5 text-white border-white/10 hover:border-white/30"}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {status === "in_stock" && (
              <>
                <div className="mt-8 bg-[#141414] border border-white/10 rounded-3xl p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{lowestAskForSize ? "Lowest Ask" : "No Active Asks"}</p>
                      <p className="text-3xl font-black font-mono text-white">
                        {lowestAskForSize ? `GH¢ ${lowestAskForSize.price.toLocaleString()}` : "—"}
                      </p>
                    </div>
                    {lastSale && (
                      <div className="text-right">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Last Sale</p>
                        <p className="text-lg font-black font-mono text-gray-300">GH¢ {lastSale.price.toLocaleString()}</p>
                      </div>
                    )}
                  </div>

                  {!lowestAskForSize && (
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Nobody's selling this size right now — place a bid and we'll match you the moment a seller lists at your price.
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleBuyNow}
                      disabled={buying}
                      className="flex-1 bg-[#c6ff00] text-black py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#d4ff33] transition-all disabled:opacity-50"
                    >
                      {buying ? "Processing..." : lowestAskForSize ? "Buy Now" : "Place a Bid"}
                    </button>
                    {lowestAskForSize && (
                      <button
                        onClick={() => (user ? setIsBidOpen(true) : setIsAuthOpen(true))}
                        className="flex-1 border border-white/10 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:border-[#c6ff00]/50 hover:text-[#c6ff00] transition-all"
                      >
                        Make Offer
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => setIsMarketOpen(true)}
                    className="w-full text-center text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors py-1"
                  >
                    View Market Data
                  </button>
                </div>

                <button
                  onClick={() => (user ? setIsAskOpen(true) : setIsAuthOpen(true))}
                  className="mt-4 w-full flex items-center justify-center gap-2 border border-dashed border-white/20 text-gray-300 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:border-[#c6ff00]/50 hover:text-[#c6ff00] transition-all"
                >
                  <Tag size={14} /> Sell This Item
                </button>

                <div className="mt-8">
                  <Accordion title="Condition &amp; Handoff">
                    Every ask lists the seller's disclosed condition (deadstock/new or used). Apex Soles coordinates the handoff and payment for every matched trade over WhatsApp — we're the counterparty for every transaction on this marketplace.
                  </Accordion>
                  <Accordion title="Buyer Promise">
                    If something's materially wrong with your order versus what was disclosed, we'll make it right — reach out on WhatsApp and we'll sort it out.
                  </Accordion>
                  <Accordion title="Delivery">
                    Delivery is arranged region-by-region across Ghana after checkout, coordinated directly with you on WhatsApp.
                  </Accordion>
                </div>
              </>
            )}

            {status === "pre_order" && (
              <>
                <div className="mt-8 bg-[#141414] border border-[#c6ff00]/20 rounded-3xl p-6 space-y-5">
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Pre-Order Price</p>
                    <p className="text-3xl font-black font-mono text-white">GH¢ {shoe.price.toLocaleString()}</p>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    This pair isn't sitting in our physical stock — it's sourced specifically for you. Secure it with a{" "}
                    <span className="text-[#c6ff00] font-bold">{PREORDER_DEPOSIT_PERCENT}% deposit</span> (GH¢{" "}
                    {Math.round((shoe.price * PREORDER_DEPOSIT_PERCENT) / 100).toLocaleString()}), balance on arrival.
                    Estimated arrival: <span className="text-white font-bold">{shoe.preOrderEta || "7-14 days"}</span>.
                  </p>

                  {preorderConfirmed ? (
                    <div className="text-center py-2">
                      <p className="text-sm font-black text-[#c6ff00] uppercase tracking-widest">Request Sent ✓</p>
                      <p className="text-xs text-gray-500 mt-1">Confirm your deposit on WhatsApp to lock in sourcing.</p>
                    </div>
                  ) : (
                    <button
                      onClick={handlePreorderRequest}
                      disabled={preordering}
                      className="w-full bg-[#c6ff00] text-black py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#d4ff33] transition-all disabled:opacity-50"
                    >
                      {preordering ? "Processing..." : "Secure Your Pre-Order"}
                    </button>
                  )}
                </div>

                <div className="mt-8">
                  <Accordion title="How Pre-Order Works">
                    1. Choose your sneaker &amp; size · 2. Pay your deposit · 3. Apex sources your pair · 4. Your sneaker arrives · 5. Balance is paid · 6. Delivered in Ghana 🇬🇭
                  </Accordion>
                  <Accordion title="Buyer Promise">
                    If something's materially wrong with your order, we'll make it right — reach out on WhatsApp and we'll sort it out.
                  </Accordion>
                </div>
              </>
            )}

            {status === "coming_soon" && (
              <div className="mt-8 bg-[#141414] border border-sky-500/20 rounded-3xl p-6 space-y-5">
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Est. Price</p>
                  <p className="text-3xl font-black font-mono text-white">GH¢ {shoe.price.toLocaleString()}</p>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Apex is planning to bring this pair in — it's not open for pre-order yet. Follow it and we'll notify you the moment it is.
                </p>
                <button
                  onClick={handleToggleFollow}
                  className="w-full flex items-center justify-center gap-2 bg-sky-500/15 text-sky-400 border border-sky-500/30 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-sky-500/25 transition-all"
                >
                  <Bell size={14} fill={isFollowed ? "currentColor" : "none"} /> {isFollowed ? "Following" : "Notify Me"}
                </button>
              </div>
            )}

            <div className="mt-8 grid grid-cols-2 gap-4 text-xs">
              {shoe.styleCode && (
                <div>
                  <p className="text-gray-500 uppercase text-[10px] font-black tracking-widest">Style</p>
                  <p className="text-white mt-1">{shoe.styleCode}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500 uppercase text-[10px] font-black tracking-widest">Colorway</p>
                <p className="text-white mt-1">{shoe.color}</p>
              </div>
              {shoe.retailPrice && (
                <div>
                  <p className="text-gray-500 uppercase text-[10px] font-black tracking-widest">Retail Price</p>
                  <p className="text-white mt-1">GH¢ {shoe.retailPrice.toLocaleString()}</p>
                </div>
              )}
              {shoe.releaseDate && (
                <div>
                  <p className="text-gray-500 uppercase text-[10px] font-black tracking-widest">Release Date</p>
                  <p className="text-white mt-1">{shoe.releaseDate}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {relatedShoes.length > 0 && (
          <section className="mt-24">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-6">More {shoe.brand}</h2>
            <div className="flex gap-6 overflow-x-auto pb-4">
              {relatedShoes.map((s) => (
                <div key={s.id} className="w-44 flex-shrink-0">
                  <ProductCard shoe={s} />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />

      <BidModal
        shoe={shoe}
        sizes={sizes}
        defaultSize={selectedSize}
        isOpen={isBidOpen}
        onClose={() => setIsBidOpen(false)}
        user={user}
        onRequireAuth={() => setIsAuthOpen(true)}
        onMatched={(saleId, price, size, condition) => {
          addTrade({ saleId, shoeId: id, name: shoe.name, image_url: shoe.image_url, size, condition, price });
          refreshLastSale();
        }}
      />
      <AskModal
        shoe={shoe}
        sizes={sizes}
        defaultSize={selectedSize}
        isOpen={isAskOpen}
        onClose={() => setIsAskOpen(false)}
        user={user}
        onRequireAuth={() => setIsAuthOpen(true)}
        onListed={refreshLastSale}
      />
      <MarketDataDrawer shoe={shoe} sizes={sizes} isOpen={isMarketOpen} onClose={() => setIsMarketOpen(false)} />
      <UserAuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
