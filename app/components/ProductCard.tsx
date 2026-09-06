"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { Shoe } from "@/types";
import { resolveStockStatus, STOCK_STATUS_CONFIG } from "@/lib/stockStatus";

interface ProductCardProps {
  shoe: Shoe;
  lowestAsk?: number;
  soldCount?: number;
  isFollowed?: boolean;
  onToggleFollow?: (shoe: Shoe) => void;
}

export const ProductCard = ({ shoe, lowestAsk, soldCount, isFollowed, onToggleFollow }: ProductCardProps) => {
  const status = resolveStockStatus(shoe.stockStatus);
  const statusConfig = STOCK_STATUS_CONFIG[status];
  const hasAsk = status === "in_stock" && typeof lowestAsk === "number";
  const displayPrice = hasAsk ? lowestAsk : shoe.price;
  const priceLabel = status === "pre_order" ? "Pre-Order Price" : status === "coming_soon" ? "Est. Price" : hasAsk ? "Lowest Ask" : "From";

  return (
    <Link
      href={`/product/${shoe.id}`}
      className="group block bg-[#141414] rounded-lg border border-white/10 overflow-hidden hover:border-white/20 hover:shadow-[0_10px_20px_rgba(0,0,0,0.4)] transition-all duration-500"
    >
      <div className="aspect-square bg-[#1c1c1c] relative overflow-hidden">
        <img
          src={shoe.image_url}
          alt={shoe.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
          <span className={`flex items-center gap-1 text-[7px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded-full border backdrop-blur-sm ${statusConfig.badgeClass}`}>
            <statusConfig.Icon size={8} strokeWidth={3} /> {statusConfig.label}
          </span>
          {shoe.colors && shoe.colors.length > 1 && (
            <span className="text-[7px] font-black uppercase tracking-wide bg-black/70 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-full border border-white/10">
              +{shoe.colors.length - 1}
            </span>
          )}
          {!!soldCount && soldCount > 0 && (
            <span className="text-[7px] font-black uppercase tracking-wide bg-[#c6ff00] text-black px-1.5 py-0.5 rounded-full">
              {soldCount} Sold
            </span>
          )}
        </div>
        {onToggleFollow && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFollow(shoe);
            }}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-white hover:text-[#c6ff00] transition-colors z-10"
          >
            <Heart size={12} fill={isFollowed ? "#c6ff00" : "none"} className={isFollowed ? "text-[#c6ff00]" : ""} />
          </button>
        )}
      </div>
      <div className="p-2.5">
        <h3 className="text-xs font-bold text-white group-hover:text-[#c6ff00] transition-colors truncate leading-tight">{shoe.name}</h3>
        <p className="text-[10px] text-gray-500 mb-1.5 truncate">{shoe.brand}</p>
        <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">
          {priceLabel}
        </p>
        <span className="font-mono font-black text-sm text-white">GH¢ {displayPrice?.toLocaleString()}</span>
      </div>
    </Link>
  );
};
