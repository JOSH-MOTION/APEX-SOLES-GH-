"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronRight, ArrowRight } from "lucide-react";

export const Hero = () => {
  const slides = [
    {
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1600&auto=format&fit=crop",
      title: "ELEVATE",
      subtitle: "YOUR SOLE",
      description: "Accra's most exclusive sneaker destination",
      cta: "SHOP NOW"
    },
    {
      image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1600&auto=format&fit=crop",
      title: "PREMIUM",
      subtitle: "SELECTION 2026",
      description: "Limited edition drops and exclusive grails",
      cta: "EXPLORE"
    },
    {
      image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=1600&auto=format&fit=crop",
      title: "EXCLUSIVE",
      subtitle: "COLLECTION",
      description: "We source the grails, you wear the heat",
      cta: "DISCOVER"
    },
    {
      image: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?q=80&w=1600&auto=format&fit=crop",
      title: "LATEST",
      subtitle: "DROPS",
      description: "Fresh arrivals hitting the streets of Accra",
      cta: "SHOP LATEST"
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative h-screen overflow-hidden">
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: index === currentSlide ? 1 : 0,
              scale: index === currentSlide ? 1 : 1.05
            }}
            transition={{ 
              duration: 0.8, 
              ease: [0.4, 0, 0.2, 1] 
            }}
            className="absolute inset-0"
          >
            <img 
              src={slide.image} 
              alt={`Slide ${index + 1}`} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="text-center text-white px-6 max-w-4xl mx-auto">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-white text-[10px] font-black tracking-[0.3em] uppercase">PREMIUM SELECTION 2026</span>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white leading-[0.8] uppercase italic tracking-tighter">
                {slides[currentSlide].title}
              </h1>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white/80 leading-[0.8] uppercase italic tracking-tighter">
                {slides[currentSlide].subtitle}
              </h2>
            </div>
            
            <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium uppercase tracking-wide">
              {slides[currentSlide].description}
            </p>

            <motion.button 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              onClick={() => {
                const el = document.getElementById('collection');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-[#c6ff00] text-black px-12 py-5 rounded-md font-black text-xs tracking-widest uppercase hover:bg-[#d4ff33] transition-all shadow-[0_20px_40px_rgba(0,0,0,0.3)] group inline-flex items-center gap-3"
            >
              {slides[currentSlide].cta} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </div>
      </div>

      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
      >
        <ChevronRight size={20} className="rotate-180" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
      >
        <ChevronRight size={20} />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              currentSlide === index 
                ? 'bg-white w-12' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </section>
  );
};
