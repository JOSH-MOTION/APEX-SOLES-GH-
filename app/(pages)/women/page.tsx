"use client";

import { useState, useEffect } from "react";
import { ProductCard } from "@/components/ProductCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Shoe, CartItem } from "@/types";
import { getClientAuth, getClientDb } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function WomenPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [selectedShoe, setSelectedShoe] = useState<Shoe | null>(null);
  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        
        // Filter for women's shoes
        const womenShoes = shoesData.filter(shoe => shoe.category === 'Women');
        setShoes(womenShoes);
      } catch (err) {
        console.error("Error fetching shoes:", err);
        setShoes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchShoes();
  }, []);

  const addToCart = (shoe: Shoe) => {
    setCart(prev => [...prev, { ...shoe, quantity: 1, selectedSize: "US 10", selectedColor: shoe.color }]);
    setIsCartOpen(true);
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
        <section className="px-6 py-20 w-full">
          <div className="mb-12">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2">Women's Collection</h2>
            <p className="text-gray-500 uppercase text-[10px] font-bold tracking-[0.2em]">Curated selection for women.</p>
          </div>
          {loading ? (
            <div className="flex justify-center py-24">
              <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {shoes.map(shoe => (
                <ProductCard key={shoe.id} shoe={shoe} onAddToCart={addToCart} onClick={setSelectedShoe} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
