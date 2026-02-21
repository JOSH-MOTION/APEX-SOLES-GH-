"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Sparkles, X, Plus, Minus, ArrowRight, Search, LayoutDashboard, PackagePlus, History, Zap, Flame, Menu } from "lucide-react";
import React, { useState, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import { Shoe, CartItem } from "@/types";

type Page = 'home' | 'drops' | 'culture' | 'archive' | 'admin';

// --- Components ---

const Navbar = ({ cartCount, onOpenCart, onNavigate, currentPage }: { 
  cartCount: number, 
  onOpenCart: () => void,
  onNavigate: (page: Page) => void,
  currentPage: Page
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: 'Drops', id: 'drops' as Page },
    { name: 'Culture', id: 'culture' as Page },
    { name: 'Archive', id: 'archive' as Page },
    { name: 'Admin', id: 'admin' as Page, icon: LayoutDashboard },
  ];

  const handleMobileNavigate = (page: Page) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled || isMobileMenuOpen ? 'py-4 bg-white/80 backdrop-blur-md border-b border-black/5 shadow-sm' : 'py-8 bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleMobileNavigate('home')}
        >
          <span className="font-serif italic text-2xl font-bold tracking-tighter">APEX SOLES GH</span>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-4 md:gap-8 items-center"
        >
          <div className="hidden md:flex gap-8 items-center mr-4">
            {navLinks.map((link) => (
              <button 
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`text-[10px] uppercase tracking-[0.2em] font-bold transition-opacity flex items-center gap-1 ${currentPage === link.id ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}
              >
                {link.icon && <link.icon size={12} />}
                {link.name}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <button className="p-2 opacity-50 hover:opacity-100 transition-opacity">
              <Search size={18} />
            </button>
            <button 
              onClick={onOpenCart}
              className="relative p-2 glass-panel rounded-full hover:bg-black hover:text-white transition-all duration-300"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 opacity-50 hover:opacity-100 transition-opacity"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-lg border-t border-black/5 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-6">
              {navLinks.map((link) => (
                <button 
                  key={link.id}
                  onClick={() => handleMobileNavigate(link.id)}
                  className={`text-sm uppercase tracking-[0.2em] font-bold text-left flex items-center gap-3 ${currentPage === link.id ? 'opacity-100' : 'opacity-50'}`}
                >
                  {link.icon && <link.icon size={16} />}
                  {link.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => (
  <section className="min-h-screen flex flex-col justify-center px-6 pt-20 relative overflow-hidden">
    {/* Creative Background Image */}
    <div className="absolute inset-0 z-0">
      <img 
        src="https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=2070&auto=format&fit=crop" 
        alt="Sneaker Background" 
        className="w-full h-full object-cover opacity-[0.15]"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#F5F5F0]/50 via-transparent to-[#F5F5F0]" />
      
      {/* Floating Decorative Elements */}
      <div className="absolute top-1/4 left-10 w-64 h-64 bg-black/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-black/5 rounded-full blur-3xl animate-pulse delay-1000" />
    </div>

    <div className="relative z-10">
      <motion.p 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-xs uppercase tracking-[0.3em] font-bold mb-4 opacity-60"
      >
        Accra / Ghana / Worldwide
      </motion.p>
      <motion.h1 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="editorial-title mb-8"
      >
        Apex <br />
        <span className="ml-[0.1em]">Culture</span>
      </motion.h1>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="max-w-md"
      >
        <p className="text-lg opacity-70 leading-relaxed mb-8">
          The ultimate destination for exclusive sneakers in Ghana. Elevate your sole game with APEX SOLES GH.
        </p>
        <button className="flex items-center gap-4 group">
          <span className="text-sm uppercase tracking-widest font-bold">Shop Latest Drops</span>
          <div className="w-10 h-10 rounded-full border border-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
            <ArrowRight size={16} />
          </div>
        </button>
      </motion.div>
    </div>
    
    <motion.div 
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="absolute right-[-5%] top-1/2 -translate-y-1/2 w-[45%] aspect-square pointer-events-none z-10"
    >
      <img 
        src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1974&auto=format&fit=crop" 
        alt="Featured Sneaker" 
        className="w-full h-full object-contain rotate-[-10deg] drop-shadow-2xl"
        referrerPolicy="no-referrer"
      />
    </motion.div>
  </section>
);

const ProductCard = ({ shoe, onAddToCart }: { shoe: Shoe, onAddToCart: (s: Shoe) => void }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="group"
  >
    <div className="aspect-[4/5] bg-white overflow-hidden relative mb-4 rounded-2xl">
      <img 
        src={shoe.image_url} 
        alt={shoe.name} 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
      <button 
        onClick={() => onAddToCart(shoe)}
        className="absolute bottom-4 right-4 bg-white text-black p-4 rounded-full shadow-xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-black hover:text-white"
      >
        <Plus size={20} />
      </button>
      <div className="absolute top-4 left-4">
        <span className="text-[10px] uppercase tracking-widest font-bold bg-black text-white px-2 py-1 rounded">
          {shoe.category}
        </span>
      </div>
    </div>
    <div className="flex justify-between items-start">
      <div>
        <h3 className="font-medium text-lg">{shoe.name}</h3>
        <p className="text-sm opacity-50">{shoe.color}</p>
      </div>
      <p className="font-mono text-sm font-bold">GH₵ {shoe.price.toLocaleString()}</p>
    </div>
  </motion.div>
);

const AdminPanel = ({ onShoeAdded }: { onShoeAdded: () => void }) => {
  const [formData, setFormData] = useState({
    name: "",
    brand: "APEX SOLES",
    price: "",
    category: "Lifestyle",
    description: "",
    image_url: "",
    color: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/shoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, price: parseFloat(formData.price) })
      });
      if (response.ok) {
        alert("Sneaker added successfully!");
        setFormData({
          name: "",
          brand: "APEX SOLES",
          price: "",
          category: "Lifestyle",
          description: "",
          image_url: "",
          color: ""
        });
        onShoeAdded();
      }
    } catch (error) {
      console.error(error);
      alert("Failed to add sneaker.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen pt-32 px-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-12">
        <div className="p-3 bg-black text-white rounded-2xl">
          <PackagePlus size={24} />
        </div>
        <div>
          <h2 className="font-serif italic text-4xl">Post New Kicks</h2>
          <p className="text-xs uppercase tracking-widest font-bold opacity-50">Admin Inventory Management</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 glass-panel p-8 rounded-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Model Name</label>
            <input 
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-[#F5F5F0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 ring-black/10"
              placeholder="e.g. Apex Velocity X"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Price (GHS)</label>
            <input 
              required
              type="number"
              value={formData.price}
              onChange={e => setFormData({...formData, price: e.target.value})}
              className="w-full bg-[#F5F5F0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 ring-black/10"
              placeholder="e.g. 1500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Category</label>
            <select 
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
              className="w-full bg-[#F5F5F0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 ring-black/10"
            >
              <option>Performance</option>
              <option>Lifestyle</option>
              <option>Basketball</option>
              <option>Outdoor</option>
              <option>Limited</option>
              <option>Classic</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Colorway</label>
            <input 
              required
              value={formData.color}
              onChange={e => setFormData({...formData, color: e.target.value})}
              className="w-full bg-[#F5F5F0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 ring-black/10"
              placeholder="e.g. Electric Volt"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Image URL (Unsplash preferred)</label>
          <input 
            required
            value={formData.image_url}
            onChange={e => setFormData({...formData, image_url: e.target.value})}
            className="w-full bg-[#F5F5F0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 ring-black/10"
            placeholder="https://images.unsplash.com/..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Description</label>
          <textarea 
            required
            rows={4}
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full bg-[#F5F5F0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 ring-black/10 resize-none"
            placeholder="Tell the story behind this pair..."
          />
        </div>

        <button 
          disabled={isSubmitting}
          className="w-full bg-black text-white py-4 rounded-xl uppercase tracking-[0.2em] text-xs font-bold hover:bg-zinc-800 transition-all disabled:opacity-50"
        >
          {isSubmitting ? "Posting..." : "Post Sneaker"}
        </button>
      </form>
    </section>
  );
};

const DropsPage = () => (
  <section className="min-h-screen pt-32 px-6 max-w-7xl mx-auto">
    <div className="flex items-center gap-4 mb-12">
      <div className="p-3 bg-orange-500 text-white rounded-2xl">
        <Zap size={24} />
      </div>
      <div>
        <h2 className="font-serif italic text-5xl">Upcoming Drops</h2>
        <p className="text-xs uppercase tracking-widest font-bold opacity-50">Accra's Most Anticipated Releases</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {[1, 2].map(i => (
        <div key={i} className="relative aspect-[16/9] rounded-3xl overflow-hidden group">
          <img 
            src={`https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=1200&auto=format&fit=crop`} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 flex flex-col justify-end">
            <span className="text-[10px] uppercase tracking-widest font-bold text-orange-500 mb-2">Dropping in 2 Days</span>
            <h3 className="text-white text-3xl font-serif italic mb-2">Apex "Phoenix" GHS 2,800</h3>
            <p className="text-white/60 text-sm max-w-md">The legendary Phoenix colorway returns. Limited to 100 pairs at our Osu flagship store.</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

const CulturePage = () => (
  <section className="min-h-screen pt-32 px-6 max-w-7xl mx-auto">
    <div className="flex items-center gap-4 mb-12">
      <div className="p-3 bg-indigo-600 text-white rounded-2xl">
        <Flame size={24} />
      </div>
      <div>
        <h2 className="font-serif italic text-5xl">Street Culture</h2>
        <p className="text-xs uppercase tracking-widest font-bold opacity-50">Stories from the GH Sneaker Scene</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[1, 2, 3].map(i => (
        <div key={i} className="space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden">
            <img 
              src={`https://images.unsplash.com/photo-1523398002811-999ca8dec234?q=80&w=800&auto=format&fit=crop`} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">Editorial / Feb 2026</span>
          <h3 className="text-2xl font-serif italic">How Accra became the sneaker capital of West Africa</h3>
          <button className="text-xs uppercase tracking-widest font-bold border-b border-black pb-1">Read Story</button>
        </div>
      ))}
    </div>
  </section>
);

const ArchivePage = () => (
  <section className="min-h-screen pt-32 px-6 max-w-7xl mx-auto">
    <div className="flex items-center gap-4 mb-12">
      <div className="p-3 bg-zinc-800 text-white rounded-2xl">
        <History size={24} />
      </div>
      <div>
        <h2 className="font-serif italic text-5xl">The Archive</h2>
        <p className="text-xs uppercase tracking-widest font-bold opacity-50">Past Grails & Sold Out Classics</p>
      </div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
      {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
        <div key={i} className="space-y-2">
          <div className="aspect-square bg-white rounded-2xl overflow-hidden">
            <img 
              src={`https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=400&auto=format&fit=crop`} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <p className="text-[10px] uppercase tracking-widest font-bold">Sold Out / 2025</p>
        </div>
      ))}
    </div>
  </section>
);

const StyleAssistant = ({ shoes, geminiApiKey }: { shoes: Shoe[], geminiApiKey: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || !geminiApiKey) return;
    
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
      const model = "gemini-3-flash-preview";
      
      const prompt = `You are a street culture and sneaker expert for "APEX SOLES GH" in Ghana. 
      Here is our current inventory: ${JSON.stringify(shoes.map(s => ({ name: s.name, category: s.category, description: s.description, price: s.price })))}.
      The user is asking for advice: "${userMsg}".
      Provide a concise, hype-focused recommendation from our inventory. Use a bit of street slang but stay professional and helpful. Represent the APEX SOLES brand with high energy!`;

      const result = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      setMessages(prev => [...prev, { role: 'assistant', content: result.text || "I'm sorry, I couldn't find the perfect match. Could you tell me more about your style?" }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting to my style database. Please try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-40 bg-black text-white p-4 rounded-full shadow-2xl flex items-center gap-2 hover:scale-105 transition-transform"
      >
        <Sparkles size={20} />
        <span className="text-xs uppercase tracking-widest font-bold pr-2">Style Assistant</span>
      </button>

      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="fixed bottom-24 right-8 z-50 w-80 h-[450px] glass-panel rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="p-4 border-b border-black/5 flex justify-between items-center bg-white">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-600" />
              <span className="text-xs uppercase tracking-widest font-bold">Stylist</span>
            </div>
            <button onClick={() => setIsOpen(false)}><X size={16} /></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.length === 0 && (
              <p className="text-sm opacity-50 italic text-center mt-10">
                "I'm looking for something formal but modern..."
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-black text-white' : 'bg-white border border-black/5'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isTyping && <div className="text-[10px] uppercase tracking-widest font-bold opacity-30 animate-pulse">Stylist is thinking...</div>}
          </div>

          <div className="p-4 bg-white border-t border-black/5">
            <div className="flex gap-2">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask for recommendations..."
                className="flex-1 bg-[#F5F5F0] rounded-full px-4 py-2 text-sm focus:outline-none"
              />
              <button 
                onClick={handleSend}
                className="bg-black text-white p-2 rounded-full"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
};

const Cart = ({ isOpen, onClose, items, onUpdateQuantity }: { 
  isOpen: boolean, 
  onClose: () => void, 
  items: CartItem[],
  onUpdateQuantity: (id: number, delta: number) => void
}) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]" onClick={onClose} />}
      <motion.div 
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
      >
        <div className="p-6 flex justify-between items-center border-b border-black/5">
          <h2 className="font-serif italic text-2xl">Your Kicks</h2>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-30">
              <ShoppingBag size={48} className="mb-4" />
              <p className="uppercase tracking-widest text-xs font-bold">No kicks in the box</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex gap-4">
                <div className="w-24 h-24 bg-[#F5F5F0] rounded-xl overflow-hidden">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="font-mono text-sm">GH₵ {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                  <p className="text-xs opacity-50 mb-3">{item.color}</p>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="w-6 h-6 rounded-full border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-mono">{item.quantity}</span>
                    <button 
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="w-6 h-6 rounded-full border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-black/5 bg-[#F5F5F0]">
          <div className="flex justify-between mb-6">
            <span className="uppercase tracking-widest text-xs font-bold opacity-50">Total</span>
            <span className="font-mono text-xl font-bold">GH₵ {total.toLocaleString()}</span>
          </div>
          <button 
            disabled={items.length === 0}
            className="w-full bg-black text-white py-4 rounded-full uppercase tracking-[0.2em] text-xs font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Checkout
          </button>
        </div>
      </motion.div>
    </>
  );
};

// --- Main App ---

export default function HomeClient({ geminiApiKey }: { geminiApiKey: string }) {
  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const fetchShoes = () => {
    fetch("/api/shoes")
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        setShoes(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false); // Stop loading even on error to show empty state or error UI
      });
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

  const updateQuantity = (id: number, delta: number) => {
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
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-2 border-black border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const renderPage = () => {
    switch(currentPage) {
      case 'drops': return <DropsPage />;
      case 'culture': return <CulturePage />;
      case 'archive': return <ArchivePage />;
      case 'admin': return <AdminPanel onShoeAdded={fetchShoes} />;
      default: return (
        <>
          <Hero />
          
          <section className="px-6 py-24 max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="font-serif italic text-5xl mb-2">The Rotation</h2>
                <p className="opacity-50 uppercase tracking-widest text-xs font-bold">Fresh drops for your collection</p>
              </div>
              <div className="flex gap-4">
                {["All", "Performance", "Lifestyle", "Limited"].map(cat => (
                  <button key={cat} className="text-xs uppercase tracking-widest font-bold opacity-40 hover:opacity-100 transition-opacity">
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {shoes.map(shoe => (
                <ProductCard key={shoe.id} shoe={shoe} onAddToCart={addToCart} />
              ))}
            </div>
          </section>

          <section className="bg-black text-white py-32 px-6 overflow-hidden relative">
            <div className="max-w-4xl mx-auto text-center relative z-10">
              <h2 className="editorial-title text-white mb-12">Join the Club</h2>
              <p className="text-xl opacity-60 mb-12">Get early access to limited releases and exclusive events.</p>
              <div className="flex max-w-md mx-auto gap-4">
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="flex-1 bg-white/10 border border-white/20 rounded-full px-6 py-4 focus:outline-none focus:border-white/40"
                />
                <button className="bg-white text-black px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs">Join</button>
              </div>
            </div>
            <div className="absolute inset-0 opacity-20 pointer-events-none">
               <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
            </div>
          </section>
        </>
      );
    }
  };

  return (
    <div className="relative">
      <Navbar 
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)} 
        onOpenCart={() => setIsCartOpen(true)} 
        onNavigate={handleNavigate}
        currentPage={currentPage}
      />
      
      <main>
        {renderPage()}
      </main>

      <footer className="px-6 py-12 border-t border-black/5 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
        <div className="space-y-4">
          <span className="font-serif italic text-3xl font-bold">APEX SOLES GH</span>
          <p className="text-xs opacity-50 max-w-xs">The premium sneaker destination in Ghana. We bring the heat to your feet.</p>
          <div className="flex gap-4">
            <a href="https://www.instagram.com/apexsoles.gh?igsh=MTl2MmxmYzJ6M3l4Yg%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase tracking-widest font-bold hover:underline">Instagram</a>
            <a href="https://www.tiktok.com/@apexsolesgh?_r=1&_t=ZS-945IWNArlTx" target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase tracking-widest font-bold hover:underline">TikTok</a>
            <a href="https://snapchat.com/t/lF9kjWNu" target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase tracking-widest font-bold hover:underline">Snapchat</a>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-[10px] uppercase tracking-widest font-bold opacity-30">Contact Us</span>
          <a href="mailto:Apexsoles1@gmail.com" className="text-sm font-medium hover:underline">Apexsoles1@gmail.com</a>
        </div>
        <div className="flex flex-col gap-4 text-right items-end">
          <div className="flex gap-8 text-[10px] uppercase tracking-widest font-bold opacity-50">
            <a href="#" className="hover:opacity-100">Shipping</a>
            <a href="#" className="hover:opacity-100">Returns</a>
            <a href="#" className="hover:opacity-100">FAQ</a>
          </div>
          <p className="text-[10px] uppercase tracking-widest font-bold opacity-30">© 2026 APEX SOLES GH</p>
        </div>
      </footer>

      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart} 
        onUpdateQuantity={updateQuantity}
      />
      
      <StyleAssistant shoes={shoes} geminiApiKey={geminiApiKey} />
    </div>
  );
}
