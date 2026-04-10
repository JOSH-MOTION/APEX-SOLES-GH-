"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, Menu, Search, User as UserIcon, LogIn, LogOut } from "lucide-react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase";
import { Logo } from "./Logo";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Page = 'home' | 'drops' | 'culture' | 'archive' | 'men' | 'women' | 'contact';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  user: User | null;
  onOpenAuth: () => void;
}

export const Navbar = ({ cartCount, onOpenCart, user, onOpenAuth }: NavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: 'HOME', href: '/' },
    { name: 'MEN', href: '/men' },
    { name: 'WOMEN', href: '/women' },
    { name: 'CULTURE', href: '/culture' },
    { name: 'COLLECTION', href: '/archive' },
    { name: 'CONTACT US', href: '/contact' },
  ];

  const handleMobileNavigate = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
        </Link>
        
        <div className="hidden lg:flex gap-10 items-center">
          {navLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href}
              className={`text-[11px] font-bold tracking-[0.15em] transition-colors ${pathname === link.href ? 'text-black' : 'text-gray-400 hover:text-black'}`}
            >
              {link.name}
            </Link>
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
            onClick={onOpenAuth}
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
              onClick={() => signOut(getClientAuth())}
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
                <Link 
                  key={link.href}
                  href={link.href}
                  onClick={handleMobileNavigate}
                  className={`text-sm font-bold tracking-widest text-left ${pathname === link.href ? 'text-black' : 'text-gray-400'}`}
                >
                  {link.name}
                </Link>
              ))}
              {user && (
                <button 
                  onClick={() => {
                    signOut(getClientAuth());
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
