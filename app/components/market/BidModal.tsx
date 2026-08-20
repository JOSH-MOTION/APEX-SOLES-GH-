"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, TrendingUp } from "lucide-react";
import { User } from "firebase/auth";
import { Shoe } from "@/types";
import { placeOffer } from "@/lib/market";

interface BidModalProps {
  shoe: Shoe;
  sizes: string[];
  defaultSize?: string;
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onRequireAuth: () => void;
  onMatched: (saleId: string, price: number, size: string, condition: "new" | "used") => void;
}

export const BidModal = ({ shoe, sizes, defaultSize, isOpen, onClose, user, onRequireAuth, onMatched }: BidModalProps) => {
  const [size, setSize] = useState(defaultSize || sizes[0] || "");
  const [price, setPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<"matched" | "placed" | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onRequireAuth();
      return;
    }
    const numericPrice = parseFloat(price);
    if (!size || !numericPrice || numericPrice <= 0) return;
    setSubmitting(true);
    try {
      const res = await placeOffer({
        shoeId: String(shoe.id),
        size,
        price: numericPrice,
        buyerId: user.uid,
        buyerName: user.displayName || user.email || "Buyer",
      });
      if (res.matched && res.saleId) {
        setResult("matched");
        onMatched(res.saleId, res.price ?? numericPrice, size, res.condition ?? "new");
      } else {
        setResult("placed");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to place bid. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    setPrice("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-[#141414] border border-white/10 w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl p-8"
          >
            <button onClick={handleClose} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
              <X size={22} />
            </button>

            {result ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-[#c6ff00]/10 flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="text-[#c6ff00]" size={28} />
                </div>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-2">
                  {result === "matched" ? "Bid Matched!" : "Bid Placed"}
                </h3>
                <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                  {result === "matched"
                    ? "A seller's ask matched your price instantly. Your order is ready to check out."
                    : "We'll match your bid the moment a seller lists at or below your price. Track it anytime in My Account."}
                </p>
                <button
                  onClick={handleClose}
                  className="w-full bg-white/5 border border-white/10 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Place a Bid</p>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-tight">{shoe.name}</h3>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Size</label>
                  <div className="grid grid-cols-4 gap-2">
                    {sizes.map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setSize(s)}
                        className={`py-3 rounded-xl text-[10px] font-black transition-all border ${size === s ? "bg-[#c6ff00] text-black border-[#c6ff00]" : "bg-white/5 text-white border-white/10 hover:border-white/30"}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Your Bid (GH¢)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 400"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-lg font-mono font-black text-white focus:outline-none focus:ring-2 ring-[#c6ff00]/30 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !size || !price}
                  className="w-full bg-[#c6ff00] text-black py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#d4ff33] transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Zap className="animate-spin" size={16} /> : "Place Bid"}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
