"use client";

import { ChevronRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function DropsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#c6ff00] selection:text-black">
      <Navbar />
      <main>
        <section className="py-20 px-6 max-w-7xl mx-auto w-full">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2 text-white">Upcoming Drops</h2>
          <p className="text-gray-500 uppercase text-[10px] font-bold tracking-[0.2em] mb-12">Don't miss out on the latest heat.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map(i => (
              <div key={i} className="bg-[#141414] rounded-3xl border border-white/10 overflow-hidden shadow-xl group">
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={`https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=1200&auto=format&fit=crop`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 bg-[#c6ff00] text-black text-[10px] font-black uppercase px-3 py-1 rounded-md">
                    Coming Soon
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2 text-white">Apex "Phoenix"</h3>
                  <p className="text-gray-400 mb-6 text-sm leading-relaxed">The legendary Phoenix colorway returns. Limited to 100 pairs at our Osu flagship store.</p>
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-black text-xl text-white">GH¢ 2,800</span>
                    <button className="text-[#c6ff00] font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                      Notify Me <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
