"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, X, Plus, Minus, ArrowRight, Search, 
  LayoutDashboard, PackagePlus, History, Zap, Flame, 
  Menu, ChevronRight, Trash2, Edit, LogOut, Lock, 
  LayoutGrid, List, PlusCircle, Settings 
} from "lucide-react";
import { db, auth, googleProvider } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User, signInWithPopup } from "firebase/auth";
import { Shoe } from "@/types";
import Image from "next/image";

const Logo = ({ className = "", variant = 'dark', height = 40 }: { className?: string, variant?: 'dark' | 'light', height?: number }) => (
  <div className={`relative ${className}`} style={{ height: `${height}px`, width: `${height * 0.7}px` }}>
    <Image
      src={variant === 'dark' ? "/logo-black.png" : "/logo-white.png"}
      alt="APEX SOLES"
      fill
      className="object-contain"
      referrerPolicy="no-referrer"
      priority
    />
  </div>
);

const AdminPanel = ({ onShoeAdded, shoes }: { onShoeAdded: () => void, shoes: Shoe[] }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'add'>('overview');
  const [editingShoe, setEditingShoe] = useState<Shoe | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    brand: "APEX SOLES",
    price: "",
    category: "Lifestyle",
    description: "",
    image_url: "",
    color: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (editingShoe) {
      setFormData({
        name: editingShoe.name,
        brand: editingShoe.brand,
        price: editingShoe.price.toString(),
        category: editingShoe.category,
        description: editingShoe.description,
        image_url: editingShoe.image_url,
        color: editingShoe.color
      });
      setActiveTab('add');
    }
  }, [editingShoe]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: reader.result }),
        });
        const data = await response.json();
        if (data.url) {
          setFormData(prev => ({ ...prev, image_url: data.url }));
        }
      } catch (error) {
        console.error("Upload error:", error);
        alert("Image upload failed.");
      } finally {
        setUploading(false);
      }
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) {
      alert("Firebase is not configured. Please check your environment variables.");
      return;
    }
    if (!formData.image_url) {
      alert("Please upload an image first.");
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingShoe) {
        await updateDoc(doc(db, "shoes", editingShoe.id.toString()), {
          ...formData,
          price: parseFloat(formData.price),
          updatedAt: new Date().toISOString()
        });
        alert("Sneaker updated successfully!");
        setEditingShoe(null);
      } else {
        await addDoc(collection(db, "shoes"), {
          ...formData,
          price: parseFloat(formData.price),
          createdAt: new Date().toISOString()
        });
        alert("Sneaker added successfully!");
      }
      
      setFormData({
        name: "",
        brand: "APEX SOLES",
        price: "",
        category: "Lifestyle",
        description: "",
        image_url: "",
        color: ""
      });
      onShoeAdded();
      setActiveTab('inventory');
    } catch (error) {
      console.error(error);
      alert("Failed to process sneaker.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this sneaker?")) return;
    try {
      await deleteDoc(doc(db!, "shoes", id.toString()));
      alert("Sneaker deleted successfully!");
      onShoeAdded();
    } catch (error) {
      console.error(error);
      alert("Failed to delete sneaker.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    sessionStorage.removeItem("admin_verified");
  };

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <Logo height={60} />
            <div>
              <h1 className="text-5xl font-black italic uppercase tracking-tighter text-black mb-2">Admin Dashboard</h1>
              <p className="text-gray-400 uppercase text-[10px] font-bold tracking-[0.2em]">Manage your inventory and shop settings.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => window.location.href = "/"}
              className="flex items-center gap-2 bg-white border border-black/5 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-sm"
            >
              View Shop
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white border border-black/5 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-sm"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Products', value: shoes.length, icon: PackagePlus, color: 'text-blue-600' },
            { label: 'Categories', value: new Set(shoes.map(s => s.category)).size, icon: LayoutGrid, color: 'text-emerald-600' },
            { label: 'Total Value', value: `GHS ${shoes.reduce((acc, s) => acc + s.price, 0).toLocaleString()}`, icon: Zap, color: 'text-orange-600' },
            { label: 'Last Update', value: 'Just now', icon: History, color: 'text-purple-600' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-black/5 ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Live</span>
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black italic tracking-tight text-black">{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white p-2 rounded-2xl border border-black/5 w-fit">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutGrid },
            { id: 'inventory', label: 'Inventory', icon: List },
            { id: 'add', label: editingShoe ? 'Edit Product' : 'Add Product', icon: PlusCircle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id !== 'add') setEditingShoe(null);
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:bg-black/5'}`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl border border-black/5 shadow-xl overflow-hidden">
          {activeTab === 'overview' && (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-6 text-black">
                <LayoutDashboard size={40} />
              </div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4">Welcome back, Admin</h2>
              <p className="text-gray-400 max-w-md mx-auto text-sm leading-relaxed">
                Use the tabs above to manage your sneaker inventory, add new drops, or view your current collection stats.
              </p>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/5">
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {shoes.map((shoe) => (
                    <tr key={shoe.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl overflow-hidden border border-black/5 bg-zinc-100">
                            <img src={shoe.image_url} alt={shoe.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-sm font-black italic uppercase tracking-tight text-black">{shoe.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{shoe.color}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-black/5 rounded-full text-black">
                          {shoe.category}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-black text-black">GHS {shoe.price}</p>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setEditingShoe(shoe)}
                            className="p-2 text-gray-400 hover:text-black hover:bg-black/5 rounded-lg transition-all"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(shoe.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'add' && (
            <div className="p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Model Name</label>
                    <input 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-black/5 border border-black/5 rounded-2xl px-6 py-4 text-sm text-black focus:outline-none focus:ring-2 ring-black/10 transition-all"
                      placeholder="e.g. Apex Velocity X"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Price (GHS)</label>
                    <input 
                      required
                      type="number"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      className="w-full bg-black/5 border border-black/5 rounded-2xl px-6 py-4 text-sm text-black focus:outline-none focus:ring-2 ring-black/10 transition-all"
                      placeholder="e.g. 1500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</label>
                    <select 
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-black/5 border border-black/5 rounded-2xl px-6 py-4 text-sm text-black focus:outline-none focus:ring-2 ring-black/10 transition-all appearance-none"
                    >
                      <option className="bg-white">Men</option>
                      <option className="bg-white">Women</option>
                      <option className="bg-white">Unisex</option>
                      <option className="bg-white">Performance</option>
                      <option className="bg-white">Lifestyle</option>
                      <option className="bg-white">Limited</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Colorway</label>
                    <input 
                      required
                      value={formData.color}
                      onChange={e => setFormData({...formData, color: e.target.value})}
                      className="w-full bg-black/5 border border-black/5 rounded-2xl px-6 py-4 text-sm text-black focus:outline-none focus:ring-2 ring-black/10 transition-all"
                      placeholder="e.g. Electric Volt"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Image</label>
                  <div className="flex flex-col sm:flex-row items-stretch gap-6">
                    <div className="flex-1 relative group">
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-full bg-black/5 border-2 border-dashed border-black/10 rounded-3xl px-8 py-12 text-center group-hover:border-black/20 transition-all">
                        {uploading ? (
                          <div className="flex flex-col items-center gap-4 text-black">
                            <Zap className="animate-spin" size={32} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Uploading to Cloudinary...</span>
                          </div>
                        ) : formData.image_url ? (
                          <div className="flex flex-col items-center gap-4 text-emerald-500">
                            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
                              <PackagePlus size={24} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">Image Ready</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-4 text-gray-400">
                            <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center">
                              <Plus size={24} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">Click or drag to upload</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {formData.image_url && (
                      <div className="w-full sm:w-48 h-48 rounded-3xl overflow-hidden border border-black/5 shadow-lg">
                        <img src={formData.image_url} className="w-full h-full object-cover" alt="Preview" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</label>
                  <textarea 
                    required
                    rows={6}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-black/5 border border-black/5 rounded-3xl px-8 py-6 text-sm text-black focus:outline-none focus:ring-2 ring-black/10 transition-all resize-none"
                    placeholder="Tell the story behind this pair..."
                  />
                </div>

                <div className="flex gap-4">
                  {editingShoe && (
                    <button 
                      type="button"
                      onClick={() => {
                        setEditingShoe(null);
                        setFormData({
                          name: "",
                          brand: "APEX SOLES",
                          price: "",
                          category: "Lifestyle",
                          description: "",
                          image_url: "",
                          color: ""
                        });
                        setActiveTab('inventory');
                      }}
                      className="flex-1 bg-white border border-black/5 text-black py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-50 transition-all"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button 
                    type="submit"
                    disabled={isSubmitting || uploading}
                    className="flex-[2] bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-800 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? <Zap className="animate-spin" size={16} /> : <PackagePlus size={16} />}
                    {isSubmitting ? "PROCESSING..." : editingShoe ? "UPDATE SNEAKER" : "PUBLISH SNEAKER"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminLogin = ({ onVerified }: { onVerified: () => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin !== "123456") {
      alert("Invalid Admin PIN.");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onVerified();
    } catch (error) {
      console.error(error);
      alert("Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (pin !== "123456") {
      alert("Please enter the Admin PIN first.");
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
      onVerified();
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl border border-black/5 shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Lock className="text-white" size={24} />
          </div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-black">Admin Access</h2>
          <p className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Please sign in to manage Apex Soles.</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Admin PIN (6 Digits)</label>
              <input
                type="password"
                required
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="appearance-none relative block w-full px-6 py-4 border border-black/5 bg-black/5 placeholder-gray-400 text-black rounded-2xl focus:outline-none focus:ring-2 ring-black/10 transition-all text-sm tracking-[1em] text-center"
                placeholder="••••••"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-6 py-4 border border-black/5 bg-black/5 placeholder-gray-400 text-black rounded-2xl focus:outline-none focus:ring-2 ring-black/10 transition-all text-sm"
                placeholder="admin@apexsoles.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-6 py-4 border border-black/5 bg-black/5 placeholder-gray-400 text-black rounded-2xl focus:outline-none focus:ring-2 ring-black/10 transition-all text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-5 px-4 border border-transparent text-[10px] font-black uppercase tracking-widest rounded-2xl text-white bg-black hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all shadow-xl disabled:opacity-50"
          >
            {loading ? <Zap className="animate-spin" size={16} /> : "Authorize Access"}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-black/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
              <span className="bg-white px-4 text-gray-300">Or</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-white border border-black/5 text-black py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-50 transition-all shadow-sm flex items-center justify-center gap-3"
          >
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
            Sign in with Google
          </button>
        </form>
      </div>
    </div>
  );
};

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdminVerified, setIsAdminVerified] = useState(false);
  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      const verified = sessionStorage.getItem("admin_verified") === "true";
      setIsAdminVerified(verified);
    });
    return () => unsubscribe();
  }, []);

  const fetchShoes = async () => {
    if (!db) return;
    try {
      const q = query(collection(db, "shoes"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const shoesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as unknown as Shoe[];
      setShoes(shoesData);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchShoes();
  }, []);

  const handleVerified = () => {
    setIsAdminVerified(true);
    sessionStorage.setItem("admin_verified", "true");
  };

  if (loading && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Zap className="animate-spin text-black" size={32} />
      </div>
    );
  }

  if (!user || !isAdminVerified) {
    return <AdminLogin onVerified={handleVerified} />;
  }

  return <AdminPanel onShoeAdded={fetchShoes} shoes={shoes} />;
}
