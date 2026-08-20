import { Instagram, Music2 } from "lucide-react";
import { Logo } from "./Logo";
import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="px-6 py-16 border-t border-white/10 w-full bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <Logo variant="light" height={80} className="origin-left" />
            <p className="text-gray-400 max-w-sm leading-relaxed">
              Accra's exclusive sneaker marketplace. Buy at the lowest ask, bid your price, or sell your own pairs — all backed by Apex Soles.
            </p>
            <div className="flex gap-6">
              <a href="https://www.instagram.com/apexsoles.gh?igsh=MTl2MmxmYzJ6M3l4Yg%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#c6ff00] transition-colors"><Instagram size={20} /></a>
              <a href="https://www.tiktok.com/@apexsolesgh?_r=1&_t=ZS-945IWNArlTx" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#c6ff00] transition-colors"><Music2 size={20} /></a>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-gray-500">Marketplace</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">All Sneakers</Link></li>
              <li><Link href="/drops" className="text-gray-400 hover:text-white transition-colors">New Arrivals</Link></li>
              <li><Link href="/archive" className="text-gray-400 hover:text-white transition-colors">Browse & Filter</Link></li>
              <li><Link href="/archive?intent=sell" className="text-gray-400 hover:text-white transition-colors">Sell With Us</Link></li>
              <li><Link href="/account" className="text-gray-400 hover:text-white transition-colors">My Account</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-gray-500">Support</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><a href="mailto:Apexsoles1@gmail.com" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Delivery Info</Link></li>
              <li><a href="https://wa.me/233549920071" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">WhatsApp Us</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
          <p>© 2026 APEX SOLES GH</p>
          <div className="flex gap-8">
            <a href="https://www.instagram.com/apexsoles.gh?igsh=MTl2MmxmYzJ6M3l4Yg%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
            <a href="https://www.tiktok.com/@apexsolesgh?_r=1&_t=ZS-945IWNArlTx" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">TikTok</a>
            <a href="https://snapchat.com/t/lF9kjWNu" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Snapchat</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
