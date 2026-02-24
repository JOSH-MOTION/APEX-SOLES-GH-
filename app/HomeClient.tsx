"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, Plus, Minus, ArrowRight, Search, Flame, Menu, ChevronRight, User as UserIcon, LogIn, LogOut, Zap } from "lucide-react";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { onAuthStateChanged, signOut, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { Shoe, CartItem } from "@/types";
import { googleProvider } from "@/lib/firebase";

type Page = 'home' | 'drops' | 'culture' | 'archive' | 'men' | 'women' | 'contact';

// --- Components ---

// ✅ After
const Logo = ({ className = "", variant = 'dark', height = 40 }: { 
  className?: string, 
  variant?: 'dark' | 'light', 
  height?: number 
}) => (
  <div className={`relative ${className}`} style={{ height: `${height}px`, width: `${height * 0.7}px` }}>
    <Image
      src={variant === 'dark' ? "/Black.png" : "/White.png"}
      alt="APEX SOLES"
      fill
      sizes={`${Math.round(height * 0.7)}px`}
      className="object-contain"
      priority
      unoptimized  
    />
  </div>
);

const Navbar = ({ cartCount, onOpenCart, onNavigate, currentPage, user, onOpenAuth }: { 
  cartCount: number, 
  onOpenCart: () => void,
  onNavigate: (page: Page) => void,
  currentPage: Page,
  user: User | null,
  onOpenAuth: () => void
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'HOME', id: 'home' as Page },
    { name: 'MEN', id: 'men' as Page },
    { name: 'WOMEN', id: 'women' as Page },
    { name: 'CULTURE', id: 'culture' as Page },
    { name: 'COLLECTION', id: 'archive' as Page },
    { name: 'CONTACT US', id: 'contact' as Page },
  ];

  const handleMobileNavigate = (page: Page) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex justify-between items-center">
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleMobileNavigate('home')}
        >
          <Logo />
        </div>
        
        <div className="hidden lg:flex gap-10 items-center">
          {navLinks.map((link) => (
            <button 
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`text-[11px] font-bold tracking-[0.15em] transition-colors ${currentPage === link.id ? 'text-black' : 'text-gray-400 hover:text-black'}`}
            >
              {link.name}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center bg-black/5 rounded-full px-4 py-2 border border-black/5">
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent text-xs text-black outline-none w-32"
            />
            <Search size={14} className="text-gray-400" />
          </div>
          <button 
            onClick={onOpenCart}
            className="relative p-2 text-gray-400 hover:text-black transition-colors"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-black text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>
          <button 
            onClick={user ? () => onNavigate('home') : onOpenAuth}
            className="p-2 text-gray-400 hover:text-black transition-colors flex items-center gap-2"
          >
            {user ? (
              <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center border border-black/5 overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={16} className="text-black" />
                )}
              </div>
            ) : (
              <LogIn size={20} />
            )}
          </button>
          {user && (
            <button 
              onClick={() => signOut(auth)}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          )}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-gray-400 hover:text-black transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-black/5 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-6">
              {navLinks.map((link) => (
                <button 
                  key={link.id}
                  onClick={() => handleMobileNavigate(link.id)}
                  className={`text-sm font-bold tracking-widest text-left ${currentPage === link.id ? 'text-black' : 'text-gray-400'}`}
                >
                  {link.name}
                </button>
              ))}
              {user && (
                <button 
                  onClick={() => {
                    signOut(auth);
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-sm font-bold tracking-widest text-left text-red-500"
                >
                  LOGOUT
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => {
  const thumbnails = [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?q=80&w=1600&auto=format&fit=crop",
  ];
  const [activeImage, setActiveImage] = useState(thumbnails[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImage(prev => {
        const currentIndex = thumbnails.indexOf(prev);
        const nextIndex = (currentIndex + 1) % thumbnails.length;
        return thumbnails[nextIndex];
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [thumbnails]);

  return (
    <section className="relative min-h-screen flex items-center px-6 md:px-12 lg:px-24 overflow-hidden">
      {/* Base Background */}
      <div className="absolute inset-0 bg-white z-0" />

      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeImage}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <img 
              src={activeImage} 
              alt="Background Sneaker" 
              className="w-full h-full object-cover grayscale brightness-110 contrast-75"
              referrerPolicy="no-referrer"
            />
            {/* White overlay to maintain the "sleek white" theme while showing the image */}
            <div className="absolute inset-0 bg-white/70" />
          </motion.div>
        </AnimatePresence>
        
        {/* Overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/20 to-transparent z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white z-[1]" />
      </div>

      {/* Decorative Text */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <motion.h2 
          key={activeImage}
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 0.05, y: 0 }}
          transition={{ duration: 1 }}
          className="text-[30vw] font-black text-black uppercase tracking-tighter select-none whitespace-nowrap"
        >
          APEX SOLES
        </motion.h2>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Content */}
          <div className="lg:col-span-7 space-y-10">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-3 px-4 py-1.5 bg-black/5 border border-black/10 rounded-full"
            >
              <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
              <span className="text-black text-[10px] font-black tracking-[0.3em] uppercase">PREMIUM SELECTION 2026</span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-black leading-[0.8] uppercase italic tracking-tighter">
                ELEVATE <br />
                <span className="text-gray-300">YOUR</span> <br />
                SOLE
              </h1>
              <p className="text-gray-500 text-sm md:text-lg max-w-lg leading-relaxed font-medium uppercase tracking-wide">
                Accra's most exclusive sneaker destination. <br />
                We source the grails, you wear the heat.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center gap-8"
            >
              <button 
                onClick={() => {
                  const el = document.getElementById('collection');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-black text-white px-12 py-5 rounded-md font-black text-xs tracking-widest uppercase hover:bg-zinc-800 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.1)] group flex items-center gap-3"
              >
                SHOP NOW <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">SWITCH STYLE:</span>
                <div className="flex gap-3">
                  {thumbnails.map((thumb, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(thumb)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${activeImage === thumb ? 'border-black scale-110 shadow-lg' : 'border-black/5 hover:border-black/20'}`}
                    >
                      <img src={thumb} className="w-full h-full object-cover" alt="" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ProductDetail = ({ shoe, onClose, onAddToCart }: { shoe: Shoe, onClose: () => void, onAddToCart: (s: Shoe) => void }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] bg-white flex flex-col lg:flex-row overflow-y-auto"
  >
    <button onClick={onClose} className="absolute top-6 right-6 z-[110] p-3 bg-black/5 rounded-full text-black hover:bg-black hover:text-white transition-all">
      <X size={24} />
    </button>
    
    <div className="lg:w-1/2 h-[50vh] lg:h-screen relative bg-[#f8f8f8] flex items-center justify-center p-12">
      <motion.img 
        initial={{ scale: 0.8, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        src={shoe.image_url} 
        alt={shoe.name} 
        className="max-w-full max-h-full object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.1)]" 
      />
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
          GH₵ {shoe.price.toLocaleString()}
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
        className="space-y-6"
      >
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Colorway</p>
          <p className="text-black font-bold">{shoe.color}</p>
        </div>
        
        <button 
          onClick={() => {
            onAddToCart(shoe);
            onClose();
          }}
          className="w-full lg:w-fit bg-black text-white px-16 py-5 rounded-md font-black text-sm tracking-widest uppercase hover:bg-zinc-800 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.1)]"
        >
          ADD TO BAG
        </button>
      </motion.div>
    </div>
  </motion.div>
);

const ProductCard = ({ shoe, onAddToCart, onClick }: { shoe: Shoe, onAddToCart: (s: Shoe) => void, onClick: (s: Shoe) => void }) => (
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
        <span className="font-mono font-bold text-sm text-black">GH₵ {shoe.price.toLocaleString()}</span>
      </div>
      <p className="text-xs text-gray-400 mb-3">{shoe.color}</p>
      <span className="text-[10px] font-black uppercase tracking-widest text-black/20 bg-black/5 px-2 py-1 rounded">
        {shoe.category}
      </span>
    </div>
  </div>
);


const DropsPage = () => (
  <section className="py-20 px-6 max-w-7xl mx-auto">
    <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2 text-black">Upcoming Drops</h2>
    <p className="text-gray-400 uppercase text-[10px] font-bold tracking-[0.2em] mb-12">Don't miss out on the latest heat.</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {[1, 2].map(i => (
        <div key={i} className="bg-white rounded-3xl border border-black/5 overflow-hidden shadow-xl group">
          <div className="aspect-video relative overflow-hidden">
            <img 
              src={`https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=1200&auto=format&fit=crop`} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-4 left-4 bg-black text-white text-[10px] font-black uppercase px-3 py-1 rounded-md">
              Coming Soon
            </div>
          </div>
          <div className="p-8">
            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2 text-black">Apex "Phoenix"</h3>
            <p className="text-gray-500 mb-6 text-sm leading-relaxed">The legendary Phoenix colorway returns. Limited to 100 pairs at our Osu flagship store.</p>
            <div className="flex justify-between items-center">
              <span className="font-mono font-black text-xl text-black">GH₵ 2,800</span>
              <button className="text-black font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                Notify Me <ChevronRight size={18} className="text-black" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

const CulturePage = () => {
  const articles = [
    {
      title: "How Accra became the sneaker capital of West Africa",
      category: "Editorial",
      date: "Feb 24, 2026",
      image: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?q=80&w=800&auto=format&fit=crop",
      excerpt: "From the bustling markets of Makola to the high-end boutiques of Osu, sneaker culture is taking over the city."
    },
    {
      title: "The Rise of Local Customizers in Ghana",
      category: "Community",
      date: "Feb 20, 2026",
      image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=800&auto=format&fit=crop",
      excerpt: "Meet the artists who are turning standard kicks into one-of-a-kind masterpieces."
    },
    {
      title: "Upcoming Drop: Apex 'Phoenix' Limited Edition",
      category: "News",
      date: "Feb 15, 2026",
      image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop",
      excerpt: "Everything you need to know about the most anticipated release of the year."
    }
  ];

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
        <div>
          <h2 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter text-black leading-none">Culture</h2>
          <p className="text-gray-400 uppercase text-[10px] font-bold tracking-[0.3em] mt-4">Stories, News & Community Updates</p>
        </div>
        <div className="hidden md:block h-px flex-1 bg-black/5 mx-12 mb-4" />
        <div className="text-right">
          <p className="text-[10px] font-black text-black uppercase tracking-widest">Issue No. 04</p>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Spring 2026</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {articles.map((article, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group cursor-pointer space-y-6"
          >
            <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-black/5 relative">
              <img 
                src={article.image} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                referrerPolicy="no-referrer"
                alt={article.title}
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-black uppercase tracking-widest bg-black/5 px-2 py-1 rounded">{article.category}</span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{article.date}</span>
              </div>
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-black group-hover:text-gray-600 transition-colors leading-tight">
                {article.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                {article.excerpt}
              </p>
              <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black group-hover:gap-3 transition-all">
                Read More <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-32 p-12 bg-[#f8f8f8] rounded-3xl border border-black/5 flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="max-w-md space-y-4">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-black">Join the Community</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Be the first to know about exclusive events, pop-up shops, and community meetups in Accra.
          </p>
        </div>
        <div className="flex w-full md:w-auto gap-2">
          <input 
            type="email" 
            placeholder="Email Address" 
            className="flex-1 md:w-64 bg-white border border-black/5 rounded-md px-6 py-4 text-sm focus:outline-none focus:ring-1 ring-black/20 text-black"
          />
          <button className="bg-black text-white px-10 py-4 rounded-md font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-colors">Subscribe</button>
        </div>
      </div>
    </section>
  );
};

const ArchivePage = () => (
  <section className="py-20 px-6 max-w-7xl mx-auto">
    <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2 text-black">The Archive</h2>
    <p className="text-gray-400 uppercase text-[10px] font-bold tracking-[0.2em] mb-12">Past grails and sold out classics.</p>
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
        <div key={i} className="aspect-square bg-[#f8f8f8] rounded-xl overflow-hidden relative group border border-black/5">
          <img 
            src={`https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=400&auto=format&fit=crop`} 
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 opacity-50 group-hover:opacity-100"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-black text-[10px] font-black uppercase tracking-widest border border-black/50 px-2 py-1 rounded">Sold Out</span>
          </div>
        </div>
      ))}
    </div>
  </section>
);

const ContactPage = () => (
  <section className="py-20 px-6 max-w-4xl mx-auto">
    <div className="text-center mb-16">
      <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4 text-black">Get In Touch</h2>
      <p className="text-gray-400 uppercase text-[10px] font-bold tracking-[0.2em]">We're here to help with your sneaker needs.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div className="space-y-8">
        <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm">
          <h3 className="text-xl font-black italic uppercase tracking-tighter mb-6 text-black">Contact Info</h3>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-black">
                <Search size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</p>
                <p className="text-sm font-bold text-black">Apexsoles1@gmail.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-black">
                <ShoppingBag size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</p>
                <p className="text-sm font-bold text-black">Osu, Accra, Ghana</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm">
          <h3 className="text-xl font-black italic uppercase tracking-tighter mb-6 text-black">Socials</h3>
          <div className="flex gap-4">
            <a href="https://www.instagram.com/apexsoles.gh?igsh=MTl2MmxmYzJ6M3l4Yg%3D%3D&utm_source=qr" target="_blank" className="w-12 h-12 rounded-xl bg-black/5 border border-black/5 flex items-center justify-center hover:bg-black hover:text-white transition-all">
              <Search size={20} />
            </a>
            <a href="https://www.tiktok.com/@apexsolesgh?_r=1&_t=ZS-945IWNArlTx" target="_blank" className="w-12 h-12 rounded-xl bg-black/5 border border-black/5 flex items-center justify-center hover:bg-black hover:text-white transition-all">
              <ShoppingBag size={20} />
            </a>
          </div>
        </div>
      </div>

      <form className="space-y-6 bg-white p-8 rounded-3xl border border-black/5 shadow-xl">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
          <input className="w-full bg-black/5 border border-black/5 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:ring-1 ring-black/20" placeholder="John Doe" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</label>
          <input className="w-full bg-black/5 border border-black/5 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:ring-1 ring-black/20" placeholder="john@example.com" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Message</label>
          <textarea rows={4} className="w-full bg-black/5 border border-black/5 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:ring-1 ring-black/20 resize-none" placeholder="How can we help?" />
        </div>
        <button className="w-full bg-black text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.1)]">
          Send Message
        </button>
      </form>
    </div>
  </section>
);

const Cart = ({ isOpen, onClose, items, onUpdateQuantity }: { 
  isOpen: boolean, 
  onClose: () => void, 
  items: CartItem[],
  onUpdateQuantity: (id: string | number, delta: number) => void
}) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]" 
              onClick={onClose} 
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col border-l border-black/5"
            >
              <div className="p-6 flex justify-between items-center border-b border-black/5 bg-[#f8f8f8]">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-black">Shopping Bag</h2>
                <button onClick={onClose} className="p-2 text-gray-400 hover:text-black transition-colors"><X size={24} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <ShoppingBag size={48} className="mb-4 opacity-20" />
                    <p className="font-black uppercase tracking-widest text-xs">Your bag is empty</p>
                  </div>
                ) : (
                  items.map(item => (
                    <div key={item.id} className="flex gap-4 group">
                      <div className="w-24 h-24 bg-[#f8f8f8] rounded-xl overflow-hidden flex-shrink-0 border border-black/5">
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <h4 className="font-black italic uppercase tracking-tighter text-black">{item.name}</h4>
                          <p className="font-mono font-black text-black text-sm">GH₵ {(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{item.color}</p>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="w-7 h-7 rounded-md border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-xs font-black text-black">{item.quantity}</span>
                          <button 
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="w-7 h-7 rounded-md border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-6 border-t border-black/5 bg-[#f8f8f8]">
                <div className="flex justify-between mb-6">
                  <span className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Subtotal</span>
                  <span className="text-2xl font-black italic uppercase tracking-tighter text-black">GH₵ {total.toLocaleString()}</span>
                </div>
                <button 
                  disabled={items.length === 0}
                  className="w-full bg-black text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Checkout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

// --- Main App ---

const UserAuthModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            <div className="p-10">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter text-black">
                    {isLogin ? "Welcome Back" : "Join the Club"}
                  </h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                    {isLogin ? "Sign in to your account" : "Create your Apex Soles account"}
                  </p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-black/5 border border-black/5 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 ring-black/10 transition-all"
                    placeholder="your@email.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                  <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-black/5 border border-black/5 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 ring-black/10 transition-all"
                    placeholder="••••••••"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-800 transition-all shadow-xl disabled:opacity-50"
                >
                  {loading ? <Zap className="animate-spin mx-auto" size={16} /> : (isLogin ? "Sign In" : "Create Account")}
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-black/5"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                  <span className="bg-white px-4 text-gray-300">Or continue with</span>
                </div>
              </div>

              <button 
                onClick={handleGoogleAuth}
                className="w-full bg-white border border-black/5 text-black py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-50 transition-all shadow-sm flex items-center justify-center gap-3"
              >
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                Google
              </button>

              <p className="mt-8 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-black hover:underline"
                >
                  {isLogin ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};


export default function HomeClient() {
  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedShoe, setSelectedShoe] = useState<Shoe | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const fetchShoes = async () => {
    if (!db) {
      // Fallback to API if Firebase is not initialized
      fetch("/api/shoes")
        .then(res => res.json())
        .then(data => {
          setShoes(data);
          setLoading(false);
        });
      return;
    }
    try {
      const q = query(collection(db, "shoes"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const shoesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as unknown as Shoe[];
      
      if (shoesData.length === 0) {
        // Fallback to API if Firestore is empty (initial setup)
        const res = await fetch("/api/shoes");
        const data = await res.json();
        setShoes(data);
      } else {
        setShoes(shoesData);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      // Fallback to API on error
      fetch("/api/shoes")
        .then(res => res.json())
        .then(data => {
          setShoes(data);
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    fetchShoes();
  }, []);

  const addToCart = (shoe: Shoe) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === shoe.id);
      if (existing) {
        return prev.map(item => item.id === shoe.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...shoe, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string | number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const renderPage = () => {
    switch(currentPage) {
      case 'drops': return <DropsPage />;
      case 'culture': return <CulturePage />;
      case 'archive': return <ArchivePage />;
      case 'contact': return <ContactPage />;
      case 'men':
      case 'women':
        return (
          <section className="px-6 py-20 max-w-7xl mx-auto">
            <div className="mb-12">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2">{currentPage === 'men' ? "Men's" : "Women's"} Collection</h2>
              <p className="text-gray-500 uppercase text-[10px] font-bold tracking-[0.2em]">Curated selection for {currentPage}.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {shoes.filter(s => currentPage === 'men' ? s.category !== 'Women' : s.category === 'Women').map(shoe => (
                <ProductCard key={shoe.id} shoe={shoe} onAddToCart={addToCart} onClick={setSelectedShoe} />
              ))}
            </div>
          </section>
        );
      default: return (
        <>
          <Hero />
          
          <section id="collection" className="px-6 py-20 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
              <div>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2 text-black">The Collection</h2>
                <p className="text-gray-400 uppercase text-[10px] font-bold tracking-[0.2em]">Curated sneakers for the modern rotation.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["All", "Performance", "Lifestyle", "Limited"].map(cat => (
                  <button key={cat} className="px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-md border border-black/5 hover:bg-black hover:text-white transition-all text-black">
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {shoes.map(shoe => (
                <ProductCard key={shoe.id} shoe={shoe} onAddToCart={addToCart} onClick={setSelectedShoe} />
              ))}
            </div>
          </section>

          <section className="bg-[#f8f8f8] py-32 px-6 border-y border-black/5">
            <div className="max-w-xl mx-auto text-center">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4 text-black">Stay in the Loop</h2>
              <p className="text-gray-400 mb-10 text-sm">Get notified about upcoming drops and exclusive events in Accra.</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="flex-1 bg-white border border-black/5 rounded-md px-6 py-4 text-sm focus:outline-none focus:ring-1 ring-black/20 text-black"
                />
                <button className="bg-black text-white px-10 py-4 rounded-md font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-colors">Join</button>
              </div>
            </div>
          </section>
        </>
      );
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <Navbar 
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)} 
        onOpenCart={() => setIsCartOpen(true)} 
        onNavigate={handleNavigate}
        currentPage={currentPage}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />
      
      <main>
        {renderPage()}
      </main>

      <footer className="px-6 py-16 border-t border-black/5 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <Logo height={80} className="origin-left" />
            <p className="text-gray-400 max-w-sm leading-relaxed">
              The premium sneaker destination in Ghana. We bring the heat to your feet with curated collections and exclusive drops.
            </p>
            <div className="flex gap-6">
              <a href="https://www.instagram.com/apexsoles.gh?igsh=MTl2MmxmYzJ6M3l4Yg%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-black transition-colors"><Search size={20} /></a>
              <a href="https://www.tiktok.com/@apexsolesgh?_r=1&_t=ZS-945IWNArlTx" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-black transition-colors"><ShoppingBag size={20} /></a>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-gray-400">Shop</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><button onClick={() => handleNavigate('home')} className="text-gray-500 hover:text-black transition-colors">All Sneakers</button></li>
              <li><button onClick={() => handleNavigate('drops')} className="text-gray-500 hover:text-black transition-colors">New Arrivals</button></li>
              <li><button onClick={() => handleNavigate('archive')} className="text-gray-500 hover:text-black transition-colors">Archive</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-gray-400">Support</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><a href="mailto:Apexsoles1@gmail.com" className="text-gray-500 hover:text-black transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-gray-500 hover:text-black transition-colors">Shipping</a></li>
              <li><a href="#" className="text-gray-500 hover:text-black transition-colors">Returns</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
          <p>© 2026 APEX SOLES GH</p>
          <div className="flex gap-8">
            <a href="https://www.instagram.com/apexsoles.gh?igsh=MTl2MmxmYzJ6M3l4Yg%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">Instagram</a>
            <a href="https://www.tiktok.com/@apexsolesgh?_r=1&_t=ZS-945IWNArlTx" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">TikTok</a>
            <a href="https://snapchat.com/t/lF9kjWNu" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">Snapchat</a>
          </div>
        </div>
      </footer>

      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart} 
        onUpdateQuantity={updateQuantity}
      />

      <UserAuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
      
      <AnimatePresence>
        {selectedShoe && (
          <ProductDetail 
            shoe={selectedShoe} 
            onClose={() => setSelectedShoe(null)} 
            onAddToCart={addToCart} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
