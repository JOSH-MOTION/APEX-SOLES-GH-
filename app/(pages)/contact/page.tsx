"use client";

import { Mail, MapPin, Instagram, Music2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#c6ff00] selection:text-black">
      <Navbar />
      <main>
        <section className="py-20 px-6 max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4 text-white">Get In Touch</h2>
            <p className="text-gray-500 uppercase text-[10px] font-bold tracking-[0.2em]">We're here to help with your sneaker needs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="bg-[#141414] p-8 rounded-3xl border border-white/10">
                <h3 className="text-xl font-black italic uppercase tracking-tighter mb-6 text-white">Contact Info</h3>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#c6ff00]">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Email</p>
                      <p className="text-sm font-bold text-white">Apexsoles1@gmail.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#c6ff00]">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Location</p>
                      <p className="text-sm font-bold text-white">Osu, Accra, Ghana</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#141414] p-8 rounded-3xl border border-white/10">
                <h3 className="text-xl font-black italic uppercase tracking-tighter mb-6 text-white">Socials</h3>
                <div className="flex gap-4">
                  <a href="https://www.instagram.com/apexsoles.gh?igsh=MTl2MmxmYzJ6M3l4Yg%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#c6ff00] hover:text-black transition-all">
                    <Instagram size={20} />
                  </a>
                  <a href="https://www.tiktok.com/@apexsolesgh?_r=1&_t=ZS-945IWNArlTx" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#c6ff00] hover:text-black transition-all">
                    <Music2 size={20} />
                  </a>
                </div>
              </div>
            </div>

            <form className="space-y-6 bg-[#141414] p-8 rounded-3xl border border-white/10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Full Name</label>
                <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 ring-[#c6ff00]/30" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Email Address</label>
                <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 ring-[#c6ff00]/30" placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Message</label>
                <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 ring-[#c6ff00]/30 resize-none" placeholder="How can we help?" />
              </div>
              <button type="button" className="w-full bg-[#c6ff00] text-black py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#d4ff33] transition-all">
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
