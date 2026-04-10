"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Shoe } from "@/types";

interface ProductDetailProps {
  shoe: Shoe;
  onClose: () => void;
  onAddToCart: (s: Shoe, size: string, color: string) => void;
}

export const ProductDetail = ({ shoe, onClose, onAddToCart }: ProductDetailProps) => {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>(shoe.color);
  const [mainImage, setMainImage] = useState<string>(shoe.image_url);
  
  const sizes = shoe.sizes && shoe.sizes.length > 0 ? shoe.sizes : ["US 7", "US 8", "US 9", "US 10", "US 11", "US 12"];
  const colors = shoe.colors && shoe.colors.length > 0 ? shoe.colors : [shoe.color, "Black", "White"];
  const allImages = [shoe.image_url, ...(shoe.additional_images || [])];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-white flex flex-col lg:flex-row overflow-y-auto"
    >
      <button onClick={onClose} className="absolute top-6 right-6 z-[110] p-3 bg-black/5 rounded-full text-black hover:bg-black hover:text-white transition-all">
        <X size={24} />
      </button>
      
      <div className="lg:w-1/2 h-[60vh] lg:h-screen relative bg-[#f8f8f8] flex flex-col items-center justify-center p-12">
        <AnimatePresence mode="wait">
          <motion.img 
            key={mainImage}
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            src={mainImage} 
            alt={shoe.name} 
            className="max-w-full max-h-[70%] object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.1)]" 
          />
        </AnimatePresence>

        {allImages.length > 1 && (
          <div className="flex gap-4 mt-12 overflow-x-auto pb-4 max-w-full px-4">
            {allImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setMainImage(img)}
                className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${mainImage === img ? 'border-black scale-110 shadow-lg' : 'border-black/5 hover:border-black/20'}`}
              >
                <img src={img} className="w-full h-full object-cover" alt="" />
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="lg:w-1/2 p-8 lg:p-24 flex flex-col justify-center space-y-10">
        <div className="space-y-4">
          <motion.span 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-gray-400 text-xs font-black tracking-widest uppercase"
          >
            {shoe.category}
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl lg:text-8xl font-black italic uppercase tracking-tighter text-black leading-none"
          >
            {shoe.name}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-mono font-black text-black"
          >
            GH¢ {shoe.price.toLocaleString()}
          </motion.p>
        </div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-500 text-lg leading-relaxed max-w-xl"
        >
          {shoe.description}
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-8"
        >
          <div className="space-y-3">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Color</p>
            <div className="flex flex-wrap gap-3">
              {colors.map(color => (
                <button 
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${selectedColor === color ? 'bg-black text-white border-black' : 'bg-white text-black border-black/10 hover:border-black'}`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Size</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {sizes.map(size => (
                <button 
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${selectedSize === size ? 'bg-black text-white border-black' : 'bg-white text-black border-black/10 hover:border-black'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          
          <button 
            onClick={() => {
              if (!selectedSize) {
                alert("Please select a size first");
                return;
              }
              onAddToCart(shoe, selectedSize, selectedColor);
              onClose();
            }}
            className="w-full bg-black text-white px-16 py-5 rounded-md font-black text-sm tracking-widest uppercase hover:bg-zinc-800 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.1)]"
          >
            ADD TO BAG
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};
