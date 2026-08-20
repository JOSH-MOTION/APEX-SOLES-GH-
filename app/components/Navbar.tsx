"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, Menu, Search, User as UserIcon, LogOut, ClipboardList, LayoutGrid } from "lucide-react";
import { signOut } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase";
import { Logo } from "./Logo";
import { Cart } from "./Cart";
import { UserAuthModal } from "./UserAuthModal";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useCart } from "../CartProvider";

// Self-contained: every page just renders <Navbar /> with no props. It owns
// auth state, the auth modal, and the shared cart (via CartProvider) so pages
// no longer each re-implement the same cart/auth boilerplate.
//
// Structurally mirrors stockx.com's real header: a top row (logo, a wide
// prominent search bar, Sell / Sign Up-Login / cart) sitting above a full-width
// category strip — not a single flat row of links.
export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthUser();
  const { items, isOpen, openCart, closeCart, removeTrade, clearCart } = useCart();

  const categoryLinks = [
    { name: 'Home', href: '/' },
    { name: 'Men', href: '/men' },
    { name: 'Women', href: '/women' },
    { name: 'Archive', href: '/archive' },
    { name: 'Culture', href: '/culture' },
    { name: 'Drops', href: '/drops' },
    { name: 'Contact', href: '/contact' },
  ];

  const handleMobileNavigate = () => setIsMobileMenuOpen(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    router.push(`/archive?q=${encodeURIComponent(searchTerm.trim())}`);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/10">
        {/* Row 1: logo, search, account — full-width like stockx.com's own header, not centered/capped */}
        <div className="w-full px-4 sm:px-8 h-18 py-3 flex items-center gap-4 sm:gap-6">
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <Logo variant="light" height={48} />
            <span className="hidden sm:block text-xl font-black italic uppercase tracking-tighter text-white leading-none">Apex Soles</span>
          </Link>

          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-2xl items-center bg-white/5 rounded-lg px-5 py-3 border border-white/10 focus-within:border-[#c6ff00]/50 transition-colors">
            <Search size={18} className="text-gray-500 mr-3 flex-shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for brand, model, color..."
              className="bg-transparent text-[15px] text-white placeholder:text-gray-500 outline-none w-full"
            />
          </form>

          <div className="flex items-center gap-5 sm:gap-6 flex-shrink-0 ml-auto">
            <Link
              href="/archive?intent=sell"
              className="hidden md:block text-[15px] text-gray-300 hover:text-white transition-colors"
            >
              Sell
            </Link>
            {user && (
              <Link
                href="/account"
                className="hidden md:block text-[15px] text-gray-300 hover:text-white transition-colors"
              >
                My Account
              </Link>
            )}

            <button onClick={openCart} className="relative p-2 text-gray-300 hover:text-white transition-colors">
              <ShoppingBag size={20} />
              {items.length > 0 && (
                <span className="absolute top-0 right-0 bg-[#c6ff00] text-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black">
                  {items.length}
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <button onClick={() => setIsAuthOpen(true)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10 overflow-hidden">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={16} className="text-white" />
                  )}
                </button>
                <button
                  onClick={() => signOut(getClientAuth())}
                  className="hidden sm:block p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="bg-white text-black px-5 py-2.5 rounded-full text-[13px] font-bold hover:bg-gray-200 transition-colors whitespace-nowrap"
              >
                Sign Up | Login
              </button>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-300 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Row 2: category strip — also full-width */}
        <div className="hidden lg:block border-t border-white/5">
          <div className="w-full px-2 sm:px-6 flex items-center overflow-x-auto">
            <button className="flex items-center gap-2 text-[16px] font-medium text-gray-300 hover:text-white transition-colors flex-shrink-0 px-3 py-3.5">
              <LayoutGrid size={17} /> All
            </button>
            {categoryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[16px] font-medium transition-colors flex-shrink-0 px-3 py-3.5 ${pathname === link.href ? 'text-[#c6ff00]' : 'text-gray-300 hover:text-white'}`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile search + menu */}
        <div className="sm:hidden px-4 pb-3">
          <form onSubmit={handleSearch} className="flex items-center bg-white/5 rounded-lg px-4 py-2.5 border border-white/10">
            <Search size={16} className="text-gray-500 mr-3 flex-shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for brand, model..."
              className="bg-transparent text-sm text-white placeholder:text-gray-500 outline-none w-full"
            />
          </form>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-[#0a0a0a] border-t border-white/10 overflow-hidden"
            >
              <div className="flex flex-col p-6 gap-6">
                {categoryLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={handleMobileNavigate}
                    className={`text-sm font-bold tracking-widest text-left uppercase ${pathname === link.href ? 'text-[#c6ff00]' : 'text-gray-400'}`}
                  >
                    {link.name}
                  </Link>
                ))}
                <Link href="/archive?intent=sell" onClick={handleMobileNavigate} className="text-sm font-bold tracking-widest text-left uppercase text-gray-400">Sell</Link>
                <Link href="/account" onClick={handleMobileNavigate} className="text-sm font-bold tracking-widest text-left uppercase text-gray-400 flex items-center gap-2"><ClipboardList size={16} /> My Account</Link>
                {user && (
                  <button
                    onClick={() => {
                      signOut(getClientAuth());
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-sm font-bold tracking-widest text-left uppercase text-red-500"
                  >
                    Logout
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <Cart isOpen={isOpen} onClose={closeCart} items={items} onRemove={removeTrade} onCheckoutComplete={clearCart} />
      <UserAuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};
