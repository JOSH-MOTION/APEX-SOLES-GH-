"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, X, Plus, Minus, ArrowRight, Search, 
  LayoutDashboard, PackagePlus, History, Zap, Flame, 
  Menu, ChevronRight, Trash2, Edit, LogOut, Lock, 
  LayoutGrid, List, PlusCircle, Settings, FileText, Newspaper,
  Eye, EyeOff
} from "lucide-react";
import { googleProvider, getClientAuth, getClientDb } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User, signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { Shoe, BlogPost } from "@/types";
import Image from "next/image";

const Logo = ({ className = "", variant = 'dark', height = 40 }: { 
  className?: string, 
  variant?: 'dark' | 'light', 
  height?: number 
}) => (
  <div className={`relative ${className}`} style={{ height: `${height}px`, width: `${height * 0.7}px` }}>
    <Image
      src={variant === 'dark' ? "/Black.png" : "/White.png"}
      alt="APEX SOLES"
      fill
      sizes={`${Math.round(height * 0.7)}px`}
      className="object-contain"
      priority
      unoptimized
    />
  </div>
);

// ─── BLOG POST FORM ────────────────────────────────────────────────────────────
const BlogPostForm = ({ 
  onSaved, 
  editingPost, 
  onCancelEdit 
}: { 
  onSaved: () => void, 
  editingPost: BlogPost | null, 
  onCancelEdit: () => void 
}) => {
  const [formData, setFormData] = useState({
    title: "",
    category: "Editorial",
    excerpt: "",
    content: "",
    image: "",
    author: "",
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (editingPost) {
      setFormData({
        title: editingPost.title,
        category: editingPost.category,
        excerpt: editingPost.excerpt,
        content: editingPost.content || "",
        image: editingPost.image,
        author: editingPost.author || "",
        date: editingPost.date,
      });
    } else {
      setFormData({
        title: "",
        category: "Editorial",
        excerpt: "",
        content: "",
        image: "",
        author: "",
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      });
    }
  }, [editingPost]);

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
        if (data.url) setFormData(prev => ({ ...prev, image: data.url }));
      } catch (err) {
        alert("Image upload failed.");
      } finally {
        setUploading(false);
      }
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const firestore = getClientDb();
      if (editingPost) {
        await updateDoc(doc(firestore, "blog_posts", editingPost.id), {
          ...formData,
          updatedAt: new Date().toISOString(),
        });
        alert("Post updated!");
        onCancelEdit();
      } else {
        await addDoc(collection(firestore, "blog_posts"), {
          ...formData,
          createdAt: new Date().toISOString(),
        });
        alert("Post published!");
        setFormData({ title: "", category: "Editorial", excerpt: "", content: "", image: "", author: "", date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) });
      }
      onSaved();
    } catch (err) {
      console.error(err);
      alert("Failed to save post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 md:p-12">
      <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Title */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Post Title</label>
            <input 
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-black/5 border border-black/5 rounded-2xl px-6 py-4 text-sm text-black focus:outline-none focus:ring-2 ring-black/10 transition-all"
              placeholder="e.g. How Accra became the sneaker capital of West Africa"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</label>
            <select 
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-black/5 border border-black/5 rounded-2xl px-6 py-4 text-sm text-black focus:outline-none focus:ring-2 ring-black/10 transition-all appearance-none"
            >
              {["Editorial", "Community", "News", "Culture", "Drops", "Style Guide", "Interview"].map(c => (
                <option key={c} className="bg-white">{c}</option>
              ))}
            </select>
          </div>

          {/* Author */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Author Name</label>
            <input 
              value={formData.author}
              onChange={e => setFormData({ ...formData, author: e.target.value })}
              className="w-full bg-black/5 border border-black/5 rounded-2xl px-6 py-4 text-sm text-black focus:outline-none focus:ring-2 ring-black/10 transition-all"
              placeholder="e.g. Kofi Mensah"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Display Date</label>
            <input 
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              className="w-full bg-black/5 border border-black/5 rounded-2xl px-6 py-4 text-sm text-black focus:outline-none focus:ring-2 ring-black/10 transition-all"
              placeholder="e.g. Feb 24, 2026"
            />
          </div>
        </div>

        {/* Cover Image Upload */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cover Image</label>
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
                  <Zap className="animate-spin mx-auto mb-4 text-black" size={32} />
                ) : formData.image ? (
                  <div className="text-emerald-500">
                    <PackagePlus className="mx-auto mb-4" size={32} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Cover Image Ready ✓</span>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    <Plus className="mx-auto mb-4" size={32} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Upload Cover Image</span>
                  </div>
                )}
              </div>
            </div>
            {formData.image && (
              <div className="w-full sm:w-48 h-48 rounded-3xl overflow-hidden border border-black/5 shadow-lg">
                <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
              </div>
            )}
          </div>
          {/* Or paste image URL */}
          <input 
            type="url"
            value={formData.image}
            onChange={e => setFormData({ ...formData, image: e.target.value })}
            className="w-full bg-black/5 border border-black/5 rounded-2xl px-6 py-3 text-sm text-black focus:outline-none focus:ring-2 ring-black/10 transition-all mt-3"
            placeholder="Or paste an image URL directly..."
          />
        </div>

        {/* Excerpt */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Excerpt / Subtitle</label>
          <textarea 
            required
            rows={3}
            value={formData.excerpt}
            onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
            className="w-full bg-black/5 border border-black/5 rounded-3xl px-8 py-6 text-sm text-black focus:outline-none focus:ring-2 ring-black/10 transition-all resize-none"
            placeholder="Short teaser shown on the culture page card..."
          />
        </div>

        {/* Full Content */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Article Content</label>
          <textarea 
            rows={14}
            value={formData.content}
            onChange={e => setFormData({ ...formData, content: e.target.value })}
            className="w-full bg-black/5 border border-black/5 rounded-3xl px-8 py-6 text-sm text-black focus:outline-none focus:ring-2 ring-black/10 transition-all resize-none"
            placeholder="Write the full article here. This will appear when readers click 'Read More'..."
          />
        </div>

        <div className="flex gap-4">
          {editingPost && (
            <button 
              type="button"
              onClick={onCancelEdit}
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
            {isSubmitting ? <Zap className="animate-spin" size={16} /> : <Newspaper size={16} />}
            {isSubmitting ? "PUBLISHING..." : editingPost ? "UPDATE POST" : "PUBLISH POST"}
          </button>
        </div>
      </form>
    </div>
  );
};

// ─── ADMIN PANEL ───────────────────────────────────────────────────────────────
const AdminPanel = ({ onShoeAdded, shoes }: { onShoeAdded: () => void, shoes: Shoe[] }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'add' | 'blog' | 'new_post'>('overview');
  const [editingShoe, setEditingShoe] = useState<Shoe | null>(null);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [blogLoading, setBlogLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "", brand: "Nike", price: "", category: "Lifestyle",
    description: "", image_url: "", color: "",
    sizes: [] as string[], colors: [] as string[], additional_images: [] as string[]
  });
  const [brands, setBrands] = useState(["Nike", "Adidas", "Jordan", "New Balance", "Puma", "Reebok", "Under Armour", "APEX SOLES"]);
  const [customBrand, setCustomBrand] = useState("");
  const [showCustomBrandInput, setShowCustomBrandInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchBlogPosts = async () => {
    setBlogLoading(true);
    try {
      const firestore = getClientDb();
      const snap = await getDocs(collection(firestore, "blog_posts"));
      let data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as BlogPost[];
      data.sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db2 = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db2 - da;
      });
      setBlogPosts(data);
    } catch (err) { console.error(err); }
    setBlogLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'blog') fetchBlogPosts();
  }, [activeTab]);

  useEffect(() => {
    if (editingShoe) {
      setFormData({
        name: editingShoe.name, brand: editingShoe.brand,
        price: editingShoe.price.toString(), category: editingShoe.category,
        description: editingShoe.description, image_url: editingShoe.image_url,
        color: editingShoe.color, sizes: editingShoe.sizes || [],
        colors: editingShoe.colors || [editingShoe.color],
        additional_images: editingShoe.additional_images || []
      });
      setActiveTab('add');
    }
  }, [editingShoe]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isAdditional = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const uploadPromises = Array.from(files).map(file => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        try {
          const res = await fetch("/api/upload", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: reader.result }) });
          const data = await res.json();
          if (data.url) resolve(data.url); else reject("Upload failed");
        } catch (err) { reject(err); }
      };
    }));
    try {
      const urls = await Promise.all(uploadPromises);
      if (isAdditional) setFormData(prev => ({ ...prev, additional_images: [...prev.additional_images, ...urls] }));
      else setFormData(prev => ({ ...prev, image_url: urls[0] }));
    } catch { alert("Some images failed to upload."); }
    finally { setUploading(false); }
  };

  const toggleSize = (size: string) => setFormData(prev => ({ ...prev, sizes: prev.sizes.includes(size) ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size] }));
  const toggleColor = (color: string) => setFormData(prev => ({ ...prev, colors: prev.colors.includes(color) ? prev.colors.filter(c => c !== color) : [...prev.colors, color] }));

  const handleBrandChange = (brand: string) => {
    if (brand === "Other") {
      setShowCustomBrandInput(true);
      setFormData(prev => ({ ...prev, brand: "" }));
    } else {
      setShowCustomBrandInput(false);
      setCustomBrand("");
      setFormData(prev => ({ ...prev, brand }));
    }
  };

  const handleCustomBrandAdd = () => {
    if (customBrand.trim() && !brands.includes(customBrand.trim())) {
      const newBrand = customBrand.trim();
      setBrands(prev => [...prev, newBrand]);
      setFormData(prev => ({ ...prev, brand: newBrand }));
      setCustomBrand("");
      setShowCustomBrandInput(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image_url) { alert("Please upload an image first."); return; }
    setIsSubmitting(true);
    try {
      const firestore = getClientDb();
      if (editingShoe) {
        await updateDoc(doc(firestore, "shoes", editingShoe.id.toString()), { ...formData, price: parseFloat(formData.price), updatedAt: new Date().toISOString() });
        alert("Sneaker updated successfully!");
        setEditingShoe(null);
      } else {
        await addDoc(collection(firestore, "shoes"), { ...formData, price: parseFloat(formData.price), createdAt: new Date().toISOString() });
        alert("Sneaker added successfully!");
      }
      setFormData({ name: "", brand: "APEX SOLES", price: "", category: "Lifestyle", description: "", image_url: "", color: "", sizes: [], colors: [], additional_images: [] });
      onShoeAdded();
      setActiveTab('inventory');
    } catch (err) { console.error(err); alert("Failed to process sneaker."); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this sneaker?")) return;
    try { await deleteDoc(doc(getClientDb(), "shoes", id.toString())); alert("Sneaker deleted!"); onShoeAdded(); }
    catch { alert("Failed to delete sneaker."); }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Delete this blog post?")) return;
    try { await deleteDoc(doc(getClientDb(), "blog_posts", id)); alert("Post deleted!"); fetchBlogPosts(); }
    catch { alert("Failed to delete post."); }
  };

  const handleLogout = async () => { await signOut(getClientAuth()); sessionStorage.removeItem("admin_verified"); };

  const tabs = [
    { id: 'overview',  label: 'Overview',    icon: LayoutGrid },
    { id: 'inventory', label: 'Inventory',   icon: List },
    { id: 'add',       label: editingShoe ? 'Edit Product' : 'Add Product', icon: PlusCircle },
    { id: 'blog',      label: 'Blog Posts',  icon: FileText },
    { id: 'new_post',  label: editingPost ? 'Edit Post' : 'New Post', icon: Newspaper },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <Logo height={60} />
            <div>
              <h1 className="text-5xl font-black italic uppercase tracking-tighter text-black mb-2">Admin Dashboard</h1>
              <p className="text-gray-400 uppercase text-[10px] font-bold tracking-[0.2em]">Manage your inventory and blog.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => window.location.href = "/"} className="flex items-center gap-2 bg-white border border-black/5 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-sm">View Shop</button>
            <button onClick={handleLogout} className="flex items-center gap-2 bg-white border border-black/5 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-sm"><LogOut size={14} />Logout</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Products', value: shoes.length, icon: PackagePlus, color: 'text-blue-600' },
            { label: 'Blog Posts', value: blogPosts.length, icon: Newspaper, color: 'text-green-600' },
            { label: 'Total Value', value: `GHS ${shoes.reduce((a, s) => a + s.price, 0).toLocaleString()}`, icon: Zap, color: 'text-orange-600' },
            { label: 'Categories', value: new Set(shoes.map(s => s.category)).size, icon: LayoutGrid, color: 'text-purple-600' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-black/5 ${stat.color}`}><stat.icon size={20} /></div>
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Live</span>
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black italic tracking-tight text-black">{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl border border-black/5 w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); if (tab.id !== 'add') setEditingShoe(null); if (tab.id !== 'new_post') setEditingPost(null); }}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:bg-black/5'}`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl border border-black/5 shadow-xl overflow-hidden">

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-6 text-black"><LayoutDashboard size={40} /></div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4">Welcome back, Admin</h2>
              <p className="text-gray-400 max-w-md mx-auto text-sm leading-relaxed">Use the tabs above to manage your sneaker inventory, publish blog posts, or view current stats.</p>
              <div className="flex flex-wrap justify-center gap-4 mt-10">
                <button onClick={() => setActiveTab('add')} className="flex items-center gap-2 bg-black text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-800 transition-all">
                  <PlusCircle size={14} /> Add Sneaker
                </button>
                <button onClick={() => setActiveTab('new_post')} className="flex items-center gap-2 bg-white border border-black/5 text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black hover:text-white transition-all">
                  <Newspaper size={14} /> New Blog Post
                </button>
              </div>
            </div>
          )}

          {/* INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/5">
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Brand</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {shoes.map(shoe => (
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
                      <td className="px-8 py-6"><span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-black/5 rounded-full text-black">{shoe.brand}</span></td>
                      <td className="px-8 py-6"><span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-black/5 rounded-full text-black">{shoe.category}</span></td>
                      <td className="px-8 py-6"><p className="text-sm font-black text-black">GHS {shoe.price}</p></td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setEditingShoe(shoe)} className="p-2 text-gray-400 hover:text-black hover:bg-black/5 rounded-lg transition-all"><Edit size={16} /></button>
                          <button onClick={() => handleDelete(shoe.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ADD / EDIT SHOE */}
          {activeTab === 'add' && (
            <div className="p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Model Name</label>
                    <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-black/5 border border-black/5 rounded-2xl px-6 py-4 text-sm text-black focus:outline-none focus:ring-2 ring-black/10 transition-all" placeholder="e.g. Apex Velocity X" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Price (GHS)</label>
                    <input required type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full bg-black/5 border border-black/5 rounded-2xl px-6 py-4 text-sm text-black focus:outline-none focus:ring-2 ring-black/10 transition-all" placeholder="e.g. 1500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Brand</label>
                    <select value={formData.brand} onChange={e => handleBrandChange(e.target.value)} className="w-full bg-black/5 border border-black/5 rounded-2xl px-6 py-4 text-sm text-black focus:outline-none focus:ring-2 ring-black/10 transition-all appearance-none">
                      {brands.map(brand => <option key={brand} className="bg-white">{brand}</option>)}
                      <option value="Other" className="bg-white">+ Add New Brand</option>
                    </select>
                    {showCustomBrandInput && (
                      <div className="flex gap-2 mt-2">
                        <input 
                          type="text"
                          value={customBrand}
                          onChange={e => setCustomBrand(e.target.value)}
                          placeholder="Enter new brand name..."
                          className="flex-1 bg-black/5 border border-black/5 rounded-xl px-4 py-2 text-sm text-black focus:outline-none focus:ring-2 ring-black/10 transition-all"
                        />
                        <button 
                          type="button"
                          onClick={handleCustomBrandAdd}
                          className="bg-black text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition-all"
                        >
                          Add
                        </button>
                        <button 
                          type="button"
                          onClick={() => { setShowCustomBrandInput(false); setCustomBrand(""); setFormData(prev => ({ ...prev, brand: "Nike" })); }}
                          className="bg-white border border-black/5 text-black px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</label>
                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-black/5 border border-black/5 rounded-2xl px-6 py-4 text-sm text-black focus:outline-none focus:ring-2 ring-black/10 transition-all appearance-none">
                      {["Men", "Women", "Unisex", "Performance", "Lifestyle", "Limited"].map(c => <option key={c} className="bg-white">{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Main Colorway</label>
                    <input required value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} className="w-full bg-black/5 border border-black/5 rounded-2xl px-6 py-4 text-sm text-black focus:outline-none focus:ring-2 ring-black/10 transition-all" placeholder="e.g. Electric Volt" />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Available Sizes</label>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {["US 6","US 7","US 8","US 9","US 10","US 11","US 12","US 13","US 14","US 15"].map(size => (
                      <button key={size} type="button" onClick={() => toggleSize(size)} className={`py-3 rounded-xl text-[10px] font-black transition-all border ${formData.sizes.includes(size) ? 'bg-black text-white border-black' : 'bg-white text-black border-black/10 hover:border-black'}`}>{size}</button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Available Colors</label>
                  <div className="flex flex-wrap gap-2">
                    {["Black","White","Red","Blue","Green","Yellow","Grey","Navy","Multi"].map(color => (
                      <button key={color} type="button" onClick={() => toggleColor(color)} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${formData.colors.includes(color) ? 'bg-black text-white border-black' : 'bg-white text-black border-black/10 hover:border-black'}`}>{color}</button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Main Product Image</label>
                    <div className="flex flex-col sm:flex-row items-stretch gap-6">
                      <div className="flex-1 relative group">
                        <input type="file" accept="image/*" onChange={e => handleImageUpload(e, false)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        <div className="w-full bg-black/5 border-2 border-dashed border-black/10 rounded-3xl px-8 py-12 text-center group-hover:border-black/20 transition-all">
                          {uploading ? <Zap className="animate-spin mx-auto mb-4" size={32} /> : formData.image_url ? <div className="text-emerald-500"><PackagePlus className="mx-auto mb-4" size={32} /><span className="text-[10px] font-black uppercase tracking-widest">Main Image Ready</span></div> : <div className="text-gray-400"><Plus className="mx-auto mb-4" size={32} /><span className="text-[10px] font-black uppercase tracking-widest">Upload Main Image</span></div>}
                        </div>
                      </div>
                      {formData.image_url && <div className="w-full sm:w-48 h-48 rounded-3xl overflow-hidden border border-black/5 shadow-lg"><img src={formData.image_url} className="w-full h-full object-cover" alt="Preview" /></div>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Additional Images</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {formData.additional_images.map((url, i) => (
                        <div key={i} className="relative group aspect-square rounded-2xl overflow-hidden border border-black/5">
                          <img src={url} className="w-full h-full object-cover" alt="" />
                          <button type="button" onClick={() => setFormData(prev => ({ ...prev, additional_images: prev.additional_images.filter((_, idx) => idx !== i) }))} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                        </div>
                      ))}
                      <div className="relative group aspect-square">
                        <input type="file" multiple accept="image/*" onChange={e => handleImageUpload(e, true)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        <div className="w-full h-full bg-black/5 border-2 border-dashed border-black/10 rounded-2xl flex flex-col items-center justify-center group-hover:border-black/20 transition-all"><PlusCircle size={24} className="text-gray-400 mb-2" /><span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Add More</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</label>
                  <textarea required rows={6} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-black/5 border border-black/5 rounded-3xl px-8 py-6 text-sm text-black focus:outline-none focus:ring-2 ring-black/10 transition-all resize-none" placeholder="Tell the story behind this pair..." />
                </div>

                <div className="flex gap-4">
                  {editingShoe && (
                    <button type="button" onClick={() => { setEditingShoe(null); setFormData({ name:"",brand:"APEX SOLES",price:"",category:"Lifestyle",description:"",image_url:"",color:"",sizes:[],colors:[],additional_images:[] }); setActiveTab('inventory'); }} className="flex-1 bg-white border border-black/5 text-black py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-50 transition-all">Cancel Edit</button>
                  )}
                  <button type="submit" disabled={isSubmitting || uploading} className="flex-[2] bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-800 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3">
                    {isSubmitting ? <Zap className="animate-spin" size={16} /> : <PackagePlus size={16} />}
                    {isSubmitting ? "PROCESSING..." : editingShoe ? "UPDATE SNEAKER" : "PUBLISH SNEAKER"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* BLOG POSTS LIST */}
          {activeTab === 'blog' && (
            <div>
              <div className="flex items-center justify-between px-8 py-6 border-b border-black/5">
                <h3 className="text-lg font-black italic uppercase tracking-tighter text-black">All Blog Posts</h3>
                <button onClick={() => setActiveTab('new_post')} className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-800 transition-all">
                  <Plus size={14} /> New Post
                </button>
              </div>
              {blogLoading ? (
                <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" /></div>
              ) : blogPosts.length === 0 ? (
                <div className="text-center py-24">
                  <Newspaper size={48} className="mx-auto mb-4 text-gray-200" />
                  <p className="text-gray-400 font-black italic uppercase tracking-tighter text-xl">No posts yet.</p>
                  <p className="text-gray-300 text-xs mt-2 uppercase tracking-widest">Click "New Post" to publish your first article.</p>
                </div>
              ) : (
                <div className="divide-y divide-black/5">
                  {blogPosts.map(post => (
                    <div key={post.id} className="flex items-center gap-6 px-8 py-6 hover:bg-zinc-50 transition-colors">
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-black/5 bg-zinc-100 flex-shrink-0">
                        {post.image ? <img src={post.image} alt={post.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Newspaper size={20} className="text-gray-300" /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black italic uppercase tracking-tight text-black truncate">{post.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-black/5 rounded text-black">{post.category}</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{post.date}</span>
                          {post.author && <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">By {post.author}</span>}
                        </div>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">{post.excerpt}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => { setEditingPost(post); setActiveTab('new_post'); }} className="p-2 text-gray-400 hover:text-black hover:bg-black/5 rounded-lg transition-all"><Edit size={16} /></button>
                        <button onClick={() => handleDeletePost(post.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* NEW / EDIT POST */}
          {activeTab === 'new_post' && (
            <BlogPostForm 
              onSaved={() => { fetchBlogPosts(); setActiveTab('blog'); }} 
              editingPost={editingPost}
              onCancelEdit={() => { setEditingPost(null); setActiveTab('blog'); }}
            />
          )}

        </div>
      </div>
    </div>
  );
};

// ─── ADMIN LOGIN ───────────────────────────────────────────────────────────────
const AdminLogin = ({ onVerified }: { onVerified: () => void }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin !== "123456") { alert("Invalid Admin PIN."); return; }
    setLoading(true);
    try {
      const firebaseAuth = getClientAuth();
      if (isSignUp) {
        await createUserWithEmailAndPassword(firebaseAuth, email, password);
        alert("Admin account created! You are now signed in.");
      } else {
        await signInWithEmailAndPassword(firebaseAuth, email, password);
      }
      onVerified();
    } catch (e: any) { alert(e.message); }
    finally { setLoading(false); }
  };

  const handleGoogleLogin = async () => {
    if (pin !== "123456") { alert("Please enter the Admin PIN first."); return; }
    try { 
      const firebaseAuth = getClientAuth();
      await signInWithPopup(firebaseAuth, googleProvider); 
      onVerified(); 
    }
    catch (e: any) { alert(e.message); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl border border-black/5 shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl"><Lock className="text-white" size={24} /></div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-black">
            {isSignUp ? "Create Admin" : "Admin Access"}
          </h2>
          <p className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {isSignUp ? "Register a new admin account." : "Sign in to manage Apex Soles."}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Admin PIN (6 Digits)</label>
              <div className="relative">
                <input 
                  type={showPin ? "text" : "password"} 
                  required 
                  maxLength={6} 
                  value={pin} 
                  onChange={e => setPin(e.target.value)} 
                  className="appearance-none relative block w-full px-6 py-4 pr-12 border border-black/5 bg-black/5 placeholder-gray-400 text-black rounded-2xl focus:outline-none focus:ring-2 ring-black/10 transition-all text-sm tracking-[1em] text-center" 
                  placeholder="••••••" 
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                >
                  {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="appearance-none relative block w-full px-6 py-4 border border-black/5 bg-black/5 placeholder-gray-400 text-black rounded-2xl focus:outline-none focus:ring-2 ring-black/10 transition-all text-sm" placeholder="admin@apexsoles.com" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  minLength={6} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="appearance-none relative block w-full px-6 py-4 pr-12 border border-black/5 bg-black/5 placeholder-gray-400 text-black rounded-2xl focus:outline-none focus:ring-2 ring-black/10 transition-all text-sm" 
                  placeholder="••••••••" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>
          <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-5 px-4 border border-transparent text-[10px] font-black uppercase tracking-widest rounded-2xl text-white bg-black hover:bg-zinc-800 focus:outline-none transition-all shadow-xl disabled:opacity-50">
            {loading ? <Zap className="animate-spin" size={16} /> : isSignUp ? "Create Account" : "Authorize Access"}
          </button>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-black/5"></div></div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-white px-4 text-gray-300">Or</span></div>
          </div>
          <button type="button" onClick={handleGoogleLogin} className="w-full bg-white border border-black/5 text-black py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-50 transition-all shadow-sm flex items-center justify-center gap-3">
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
            {isSignUp ? "Sign up with Google" : "Sign in with Google"}
          </button>
        </form>
        <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          {isSignUp ? "Already have an account?" : "Need an admin account?"}{" "}
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-black hover:underline">
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
};

// ─── PAGE ──────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdminVerified, setIsAdminVerified] = useState(false);
  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      const firebaseAuth = getClientAuth();
      unsubscribe = onAuthStateChanged(firebaseAuth, user => {
        setUser(user);
        const verified = sessionStorage.getItem("admin_verified") === "true";
        setIsAdminVerified(verified);
        setLoading(false);
      });
    } catch {
      setLoading(false);
    }
    return () => unsubscribe?.();
  }, []);

  const fetchShoes = async () => {
    try {
      const firestore = getClientDb();
      const snap = await getDocs(collection(firestore, "shoes"));
      let data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as unknown as Shoe[];
      data.sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db2 = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db2 - da;
      });
      setShoes(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchShoes(); }, []);

  const handleVerified = () => { setIsAdminVerified(true); sessionStorage.setItem("admin_verified", "true"); };

  if (loading && user) return <div className="min-h-screen flex items-center justify-center bg-zinc-50"><Zap className="animate-spin text-black" size={32} /></div>;
  if (!user || !isAdminVerified) return <AdminLogin onVerified={handleVerified} />;
  return <AdminPanel onShoeAdded={fetchShoes} shoes={shoes} />;
}