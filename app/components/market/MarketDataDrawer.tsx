"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Shoe, Ask, Offer, Sale } from "@/types";
import { subscribeAsks, subscribeOffers, subscribeSales } from "@/lib/market";
import { PriceChart } from "./PriceChart";

interface MarketDataDrawerProps {
  shoe: Shoe;
  sizes: string[];
  isOpen: boolean;
  onClose: () => void;
}

type Tab = "offers" | "asks" | "sales";

export const MarketDataDrawer = ({ shoe, sizes, isOpen, onClose }: MarketDataDrawerProps) => {
  const [tab, setTab] = useState<Tab>("asks");
  const [sizeFilter, setSizeFilter] = useState<string>("");
  const [asks, setAsks] = useState<Ask[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const shoeId = String(shoe.id);
    const size = sizeFilter || null;
    const unsubAsks = subscribeAsks(shoeId, size, setAsks);
    const unsubOffers = subscribeOffers(shoeId, size, setOffers);
    const unsubSales = subscribeSales(shoeId, size, setSales);
    return () => {
      unsubAsks();
      unsubOffers();
      unsubSales();
    };
  }, [isOpen, shoe.id, sizeFilter]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-[#0f0f0f] border-l border-white/10 z-[95] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-white/10 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Market Data</h2>
                <p className="text-xs text-gray-500">{shoe.name}</p>
              </div>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
                <X size={22} />
              </button>
            </div>

            <div className="p-6 border-b border-white/10">
              <PriceChart sales={sales} />
            </div>

            <div className="px-6 pt-4 flex items-center justify-between gap-4">
              <div className="flex gap-1 bg-white/5 rounded-full p-1">
                {(["asks", "offers", "sales"] as Tab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${tab === t ? "bg-[#c6ff00] text-black" : "text-gray-400 hover:text-white"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <select
                value={sizeFilter}
                onChange={(e) => setSizeFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="">All Sizes</option>
                {sizes.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {tab === "asks" && (
                <MarketTable
                  rows={asks}
                  empty="No active asks. Be the first to sell one."
                  columns={["Size", "Condition", "Seller", "Price"]}
                  render={(a: Ask) => [a.size, a.condition, a.sellerType === "admin" ? "Apex Soles" : a.sellerName, `GH¢ ${a.price.toLocaleString()}`]}
                />
              )}
              {tab === "offers" && (
                <MarketTable
                  rows={offers}
                  empty="No active bids yet."
                  columns={["Size", "Buyer", "Price"]}
                  render={(o: Offer) => [o.size, o.buyerName, `GH¢ ${o.price.toLocaleString()}`]}
                />
              )}
              {tab === "sales" && (
                <MarketTable
                  rows={sales}
                  empty="No completed sales yet."
                  columns={["Size", "Date", "Price"]}
                  render={(s: Sale) => [s.size, new Date(s.createdAt).toLocaleDateString(), `GH¢ ${s.price.toLocaleString()}`]}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

function MarketTable<T extends { id: string }>({
  rows,
  empty,
  columns,
  render,
}: {
  rows: T[];
  empty: string;
  columns: string[];
  render: (row: T) => string[];
}) {
  if (rows.length === 0) {
    return <p className="text-center text-gray-500 text-xs font-bold uppercase tracking-widest py-16">{empty}</p>;
  }
  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b border-white/10">
          {columns.map((c) => (
            <th key={c} className="pb-3 text-[9px] font-black text-gray-500 uppercase tracking-widest">{c}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-white/5">
        {rows.map((row) => (
          <tr key={row.id}>
            {render(row).map((cell, i) => (
              <td key={i} className={`py-3 text-xs ${i === render(row).length - 1 ? "font-mono font-black text-[#c6ff00]" : "text-gray-300 capitalize"}`}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
