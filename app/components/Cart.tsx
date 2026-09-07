"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, Trash2 } from "lucide-react";
import { TradeCartItem } from "@/types";
import { GhanaLocationPicker } from "./GhanaLocationPicker";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: TradeCartItem[];
  onRemove: (saleId: string) => void;
  onCheckoutComplete: () => void;
}

export const Cart = ({ isOpen, onClose, items, onRemove, onCheckoutComplete }: CartProps) => {
  const total = items.reduce((sum, item) => sum + item.price, 0);
  const [region, setRegion] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const handleCheckout = () => {
    if (items.length === 0) return;

    if (!region) {
      alert("Please select your location before checkout");
      return;
    }
    if (!phone.trim()) {
      alert("Please provide a phone number before checkout");
      return;
    }

    let message = "🔥 *NEW ORDER - APEX SOLES*\n\n";
    message += "*ORDER DETAILS:*\n";
    message += "----------------------\n\n";

    items.forEach((item, index) => {
      message += `*Item ${index + 1}:*\n`;
      message += `👟 *Name:* ${item.name}\n`;
      message += `📏 *Size:* ${item.size}\n`;
      message += `🏷️ *Condition:* ${item.condition === "new" ? "Deadstock / New" : "Used"}\n`;
      message += `💰 *Matched Price:* GH¢ ${item.price.toLocaleString()}\n`;
      message += `🧾 *Order Ref:* ${item.saleId}\n`;
      message += "----------------------\n\n";
    });

    message += `*TOTAL AMOUNT:* GH¢ ${total.toLocaleString()}\n\n`;
    message += "*DELIVERY INFORMATION:*\n";
    message += `📍 *Region:* ${region}\n`;
    if (address) {
      message += `🏠 *Detailed Address:* ${address}\n`;
    }
    message += `📞 *Phone:* ${phone}\n\n`;
    message += "*QUESTION:* How much is the delivery fee to " + region + (address ? ` (${address})` : "") + "?\n\n";
    message += "*Thank you for trading with APEX SOLES!* 🙌";

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/233549920071?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
    onCheckoutComplete();
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
              onClick={onClose}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#0f0f0f] z-[70] shadow-2xl flex flex-col border-l border-white/10"
            >
              <div className="p-6 flex justify-between items-center border-b border-white/10">
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Checkout</h2>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Matched trades ready to finalize</p>
                </div>
                <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors"><X size={24} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <ShoppingBag size={48} className="mb-4 opacity-20" />
                    <p className="font-black uppercase tracking-widest text-xs">No matched trades yet</p>
                    <p className="text-[10px] text-gray-600 mt-2 text-center max-w-[220px]">Buy Now or an accepted bid will land here, ready to check out.</p>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.saleId} className="flex gap-4 group">
                      <div className="w-24 h-24 bg-white/5 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1 gap-2">
                          <h4 className="font-black italic uppercase tracking-tighter text-white text-sm leading-tight">{item.name}</h4>
                          <p className="font-mono font-black text-[#c6ff00] text-sm flex-shrink-0">GH¢ {item.price.toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2 mb-3">
                          <span className="text-[9px] font-black text-black bg-[#c6ff00] px-1.5 py-0.5 rounded uppercase tracking-widest">{item.size}</span>
                          <span className="text-[9px] font-black text-gray-400 border border-white/10 px-1.5 py-0.5 rounded uppercase tracking-widest">{item.condition}</span>
                        </div>
                        <button
                          onClick={() => onRemove(item.saleId)}
                          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-6 border-t border-white/10 space-y-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Total</span>
                  <span className="text-2xl font-black italic uppercase tracking-tighter text-white">GH¢ {total.toLocaleString()}</span>
                </div>

                {items.length > 0 && (
                  <GhanaLocationPicker
                    region={region}
                    address={address}
                    phone={phone}
                    onRegionChange={setRegion}
                    onAddressChange={setAddress}
                    onPhoneChange={setPhone}
                  />
                )}

                <button
                  onClick={handleCheckout}
                  disabled={items.length === 0 || !region || !phone.trim()}
                  className="w-full bg-[#c6ff00] text-black py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#d4ff33] transition-all shadow-[0_20px_40px_rgba(0,0,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Finalize via WhatsApp
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
