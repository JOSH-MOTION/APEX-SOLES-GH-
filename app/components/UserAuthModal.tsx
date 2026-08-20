"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, Zap } from "lucide-react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { getClientAuth, googleProvider } from "@/lib/firebase";

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserAuthModal = ({ isOpen, onClose }: UserAuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const firebaseAuth = getClientAuth();
      if (isLogin) {
        await signInWithEmailAndPassword(firebaseAuth, email, password);
      } else {
        await createUserWithEmailAndPassword(firebaseAuth, email, password);
      }
      onClose();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await signInWithPopup(getClientAuth(), googleProvider);
      onClose();
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-[#141414] border border-white/10 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            <div className="p-10">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                    {isLogin ? "Welcome Back" : "Join the Club"}
                  </h2>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                    {isLogin ? "Sign in to your account" : "Create your Apex Soles account"}
                  </p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:ring-2 ring-[#c6ff00]/30 transition-all"
                    placeholder="your@email.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:ring-2 ring-[#c6ff00]/30 transition-all pr-12"
                      placeholder="????????"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#c6ff00] text-black py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#d4ff33] transition-all shadow-xl disabled:opacity-50"
                >
                  {loading ? <Zap className="animate-spin mx-auto" size={16} /> : (isLogin ? "Sign In" : "Create Account")}
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                  <span className="bg-[#141414] px-4 text-gray-500">Or continue with</span>
                </div>
              </div>

              <button
                onClick={handleGoogleAuth}
                className="w-full bg-white/5 border border-white/10 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all flex items-center justify-center gap-3"
              >
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                Google
              </button>

              <p className="mt-8 text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-[#c6ff00] hover:underline"
                >
                  {isLogin ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
