"use client";

import { useState } from "react";
import { Search, ShoppingBag } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartItem } from "@/types";

export default function ContactPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <Navbar 
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)} 
        onOpenCart={() => setIsCartOpen(true)} 
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />
      <main>
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
      </main>
      <Footer />
    </div>
  );
}
