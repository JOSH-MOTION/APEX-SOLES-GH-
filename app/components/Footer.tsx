import { Search, ShoppingBag } from "lucide-react";
import { Logo } from "./Logo";
import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="px-6 py-16 border-t border-black/5 w-full">
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
            <li><Link href="/" className="text-gray-500 hover:text-black transition-colors">All Sneakers</Link></li>
            <li><Link href="/drops" className="text-gray-500 hover:text-black transition-colors">New Arrivals</Link></li>
            <li><Link href="/archive" className="text-gray-500 hover:text-black transition-colors">Archive</Link></li>
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
  );
};
