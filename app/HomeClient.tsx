"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { onAuthStateChanged, User } from "firebase/auth";
import { getClientAuth, getClientDb } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Shoe, CartItem } from "@/types";

// Components - using new app/components structure
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { ProductDetail } from "@/components/ProductDetail";
import { Cart } from "@/components/Cart";
import { UserAuthModal } from "@/components/UserAuthModal";
import { Hero } from "@/components/Hero";
import { HorizontalGallery } from "@/components/HorizontalGallery";

export default function HomeClient() {
  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedShoe, setSelectedShoe] = useState<Shoe | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = onAuthStateChanged(getClientAuth(), (user) => {
        setUser(user);
      });
    } catch {}
    return () => unsubscribe?.();
  }, []);

  const fetchShoes = async () => {
    setLoading(true);
    try {
      const firestore = getClientDb();
      const shoesRef = collection(firestore, "shoes");
      const querySnapshot = await getDocs(shoesRef);
      let shoesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as unknown as Shoe[];
      
      shoesData.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      
      if (shoesData.length > 0) {
        setShoes(shoesData);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error("Firestore fetch error:", err);
    }

    try {
      const res = await fetch("/api/shoes");
      if (!res.ok) throw new Error("API fetch failed");
      const data = await res.json();
      setShoes(data);
    } catch (err) {
      console.error("Local API fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShoes();
  }, []);

  const addToCart = (shoe: Shoe, size?: string, color?: string) => {
    const finalSize = size || (shoe.sizes && shoe.sizes.length > 0 ? shoe.sizes[0] : "US 10");
    const finalColor = color || shoe.color;

    setCart(prev => {
      const existing = prev.find(item => 
        item.id === shoe.id && 
        item.selectedSize === finalSize && 
        item.selectedColor === finalColor
      );
      if (existing) {
        return prev.map(item => 
          (item.id === shoe.id && item.selectedSize === finalSize && item.selectedColor === finalColor) 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...shoe, quantity: 1, selectedSize: finalSize, selectedColor: finalColor }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string | number, size: string, color: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id && item.selectedSize === size && item.selectedColor === color) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const renderPage = () => {
    // Since we're using Next.js routing, this component only handles the home page
    // Other pages are now separate routes in app/(pages) folder
    return (
      <>
        <Hero />
        <HorizontalGallery shoes={shoes} />
        
        <section id="collection" className="px-6 py-20 w-full">
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
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <Navbar 
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)} 
        onOpenCart={() => setIsCartOpen(true)} 
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />
      
      <main>
        {renderPage()}
      </main>

      <Footer />

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