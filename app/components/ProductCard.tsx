import { Plus } from "lucide-react";
import { Shoe } from "@/types";

interface ProductCardProps {
  shoe: Shoe;
  onAddToCart: (s: Shoe) => void;
  onClick: (s: Shoe) => void;
}

export const ProductCard = ({ shoe, onAddToCart, onClick }: ProductCardProps) => (
  <div 
    onClick={() => onClick(shoe)}
    className="group bg-white rounded-2xl border border-black/5 overflow-hidden hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] transition-all duration-500 cursor-pointer"
  >
    <div className="aspect-square bg-[#f8f8f8] relative overflow-hidden">
      <img 
        src={shoe.image_url} 
        alt={shoe.name} 
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        referrerPolicy="no-referrer"
      />
      {shoe.colors && shoe.colors.length > 1 && (
        <div className="absolute top-4 right-4 flex gap-1">
           <span className="text-[8px] font-black uppercase tracking-widest bg-white/80 backdrop-blur-sm text-black px-2 py-1 rounded-full border border-black/5">
             +{shoe.colors.length - 1} Colors
           </span>
        </div>
      )}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onAddToCart(shoe);
        }}
        className="absolute bottom-4 right-4 bg-black text-white p-3 rounded-full shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all hover:bg-zinc-800 z-10"
      >
        <Plus size={20} />
      </button>
    </div>
    <div className="p-5">
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-bold text-black group-hover:text-gray-600 transition-colors">{shoe.name}</h3>
        <span className="font-mono font-bold text-sm text-black">GH¢ {shoe.price.toLocaleString()}</span>
      </div>
      <p className="text-xs text-gray-400 mb-3">{shoe.color}</p>
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-black/20 bg-black/5 px-2 py-1 rounded">
          {shoe.category}
        </span>
        {shoe.sizes && shoe.sizes.length > 0 && (
          <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">
            {shoe.sizes.length} Sizes
          </span>
        )}
      </div>
    </div>
  </div>
);
