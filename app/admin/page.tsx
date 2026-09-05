"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Plus,
  LayoutDashboard, PackagePlus, Zap,
  Trash2, Edit, LogOut, Lock,
  LayoutGrid, List, PlusCircle, FileText, Newspaper,
  Eye, EyeOff, Tag, Handshake, Receipt, CheckCircle2, Clock
} from "lucide-react";
import { googleProvider, getClientAuth, getClientDb } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User, signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { Shoe, BlogPost, Ask, Offer, Sale, FulfillmentStatus, StockStatus, PreorderStatus, Preorder } from "@/types";
import { placeAsk, cancelAsk, getAllActiveAsks, getAllActiveOffers, getAllSales, adminAcceptOffer, updateSaleFulfillment, getAllPreorders, updatePreorderStatus, PREORDER_DEPOSIT_PERCENT } from "@/lib/market";
import { STOCK_STATUS_CONFIG, resolveStockStatus } from "@/lib/stockStatus";
import Image from "next/image";

const Logo = ({ className = "", variant = 'light', height = 40 }: {
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

const inputClass = "w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:ring-2 ring-[#c6ff00]/30 transition-all";
const labelClass = "text-[10px] font-black text-gray-500 uppercase tracking-widest";

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
        title: "", category: "Editorial", excerpt: "", content: "", image: "", author: "",
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
      } catch {
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
          <div className="md:col-span-2 space-y-2">
            <label className={labelClass}>Post Title</label>
            <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className={inputClass} placeholder="e.g. How Accra became the sneaker capital of West Africa" />
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Category</label>
            <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className={inputClass + " appearance-none"}>
              {["Editorial", "Community", "News", "Culture", "Drops", "Style Guide", "Interview"].map(c => (
                <option key={c} className="bg-[#141414]">{c}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Author Name</label>
            <input value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} className={inputClass} placeholder="e.g. Kofi Mensah" />
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Display Date</label>
            <input value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className={inputClass} placeholder="e.g. Feb 24, 2026" />
          </div>
        </div>

        <div className="space-y-2">
          <label className={labelClass}>Cover Image</label>
          <div className="flex flex-col sm:flex-row items-stretch gap-6">
            <div className="flex-1 relative group">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
              <div className="w-full bg-white/5 border-2 border-dashed border-white/10 rounded-3xl px-8 py-12 text-center group-hover:border-white/20 transition-all">
                {uploading ? (
                  <Zap className="animate-spin mx-auto mb-4 text-white" size={32} />
                ) : formData.image ? (
                  <div className="text-[#c6ff00]">
                    <PackagePlus className="mx-auto mb-4" size={32} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Cover Image Ready ✓</span>
                  </div>
                ) : (
                  <div className="text-gray-500">
                    <Plus className="mx-auto mb-4" size={32} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Upload Cover Image</span>
                  </div>
                )}
              </div>
            </div>
            {formData.image && (
              <div className="w-full sm:w-48 h-48 rounded-3xl overflow-hidden border border-white/10 shadow-lg">
                <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
              </div>
            )}
          </div>
          <input type="url" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} className={inputClass + " mt-3"} placeholder="Or paste an image URL directly..." />
        </div>

        <div className="space-y-2">
          <label className={labelClass}>Excerpt / Subtitle</label>
          <textarea required rows={3} value={formData.excerpt} onChange={e => setFormData({ ...formData, excerpt: e.target.value })} className={inputClass + " rounded-3xl resize-none"} placeholder="Short teaser shown on the culture page card..." />
        </div>

        <div className="space-y-2">
          <label className={labelClass}>Full Article Content</label>
          <textarea rows={14} value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} className={inputClass + " rounded-3xl resize-none"} placeholder="Write the full article here. This will appear when readers click 'Read More'..." />
        </div>

        <div className="flex gap-4">
          {editingPost && (
            <button type="button" onClick={onCancelEdit} className="flex-1 bg-white/5 border border-white/10 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all">
              Cancel Edit
            </button>
          )}
          <button type="submit" disabled={isSubmitting || uploading} className="flex-[2] bg-[#c6ff00] text-black py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#d4ff33] transition-all disabled:opacity-50 flex items-center justify-center gap-3">
            {isSubmitting ? <Zap className="animate-spin" size={16} /> : <Newspaper size={16} />}
            {isSubmitting ? "PUBLISHING..." : editingPost ? "UPDATE POST" : "PUBLISH POST"}
          </button>
        </div>
      </form>
    </div>
  );
};

// ─── ADMIN PANEL ───────────────────────────────────────────────────────────────
const AdminPanel = ({ onShoeAdded, shoes, user }: { onShoeAdded: () => void, shoes: Shoe[], user: User }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'add' | 'blog' | 'new_post' | 'listings' | 'offers' | 'sales' | 'preorders'>('overview');
  const [editingShoe, setEditingShoe] = useState<Shoe | null>(null);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [blogLoading, setBlogLoading] = useState(false);

  const [asks, setAsks] = useState<Ask[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [preorders, setPreorders] = useState<Preorder[]>([]);
  const [marketLoading, setMarketLoading] = useState(false);
  const [listStockShoe, setListStockShoe] = useState<Shoe | null>(null);
  const [listStockSize, setListStockSize] = useState("");
  const [listStockPrice, setListStockPrice] = useState("");

  const [formData, setFormData] = useState({
    name: "", brand: "Nike", price: "", category: "Lifestyle",
    description: "", image_url: "", color: "", styleCode: "", releaseDate: "", retailPrice: "",
    stockStatus: "in_stock" as StockStatus, preOrderEta: "",
    sizes: [] as string[], colors: [] as string[], additional_images: [] as string[]
  });
  const [brands, setBrands] = useState(["Nike", "Adidas", "Jordan", "New Balance", "Puma", "Reebok", "Under Armour", "APEX SOLES"]);
  const [customBrand, setCustomBrand] = useState("");
  const [showCustomBrandInput, setShowCustomBrandInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const shoeName = (shoeId: string) => shoes.find(s => String(s.id) === shoeId)?.name || "Unknown Sneaker";

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

  const fetchMarketData = async () => {
    setMarketLoading(true);
    try {
      const [a, o, s, p] = await Promise.all([getAllActiveAsks(), getAllActiveOffers(), getAllSales(), getAllPreorders()]);
      setAsks(a);
      setOffers(o);
      setSales(s);
      setPreorders(p);
    } catch (err) { console.error(err); }
    setMarketLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'blog') fetchBlogPosts();
    if (['listings', 'offers', 'sales', 'preorders', 'overview'].includes(activeTab)) fetchMarketData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    if (editingShoe) {
      setFormData({
        name: editingShoe.name, brand: editingShoe.brand,
        price: editingShoe.price.toString(), category: editingShoe.category,
        description: editingShoe.description, image_url: editingShoe.image_url,
        color: editingShoe.color,
        styleCode: editingShoe.styleCode || "", releaseDate: editingShoe.releaseDate || "",
        retailPrice: editingShoe.retailPrice?.toString() || "",
        stockStatus: editingShoe.stockStatus || "in_stock",
        preOrderEta: editingShoe.preOrderEta || "",
        sizes: editingShoe.sizes || [],
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

  const resetForm = () => setFormData({ name: "", brand: "APEX SOLES", price: "", category: "Lifestyle", description: "", image_url: "", color: "", styleCode: "", releaseDate: "", retailPrice: "", stockStatus: "in_stock", preOrderEta: "", sizes: [], colors: [], additional_images: [] });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image_url) { alert("Please upload an image first."); return; }
    setIsSubmitting(true);
    try {
      const firestore = getClientDb();
      const payload = {
        name: formData.name, brand: formData.brand, price: parseFloat(formData.price),
        category: formData.category, description: formData.description, image_url: formData.image_url,
        color: formData.color, sizes: formData.sizes, colors: formData.colors,
        additional_images: formData.additional_images,
        styleCode: formData.styleCode || null,
        releaseDate: formData.releaseDate || null,
        retailPrice: formData.retailPrice ? parseFloat(formData.retailPrice) : null,
        stockStatus: formData.stockStatus,
        preOrderEta: formData.stockStatus === "pre_order" ? (formData.preOrderEta || "7-14 days") : null,
      };
      if (editingShoe) {
        await updateDoc(doc(firestore, "shoes", editingShoe.id.toString()), { ...payload, updatedAt: new Date().toISOString() });
        alert("Sneaker updated successfully!");
        setEditingShoe(null);
      } else {
        const docRef = await addDoc(collection(firestore, "shoes"), { ...payload, createdAt: new Date().toISOString() });
        // Give the new product instant marketplace liquidity: list it as an
        // active ask at the price the admin just set, for every size selected.
        // Only for real in-stock inventory — PRE-ORDER/COMING SOON products
        // have no physical pair behind them to list as an ask.
        if (formData.stockStatus === "in_stock" && formData.sizes.length > 0 && formData.price) {
          await Promise.all(formData.sizes.map(size => placeAsk({
            shoeId: docRef.id,
            size,
            condition: "new",
            price: parseFloat(formData.price),
            sellerId: user.uid,
            sellerName: "Apex Soles",
            sellerType: "admin",
          })));
        }
        alert(formData.stockStatus === "in_stock" ? "Sneaker added and listed for sale!" : "Sneaker added to catalogue!");
      }
      resetForm();
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

  const handleListStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listStockShoe || !listStockSize || !listStockPrice) return;
    try {
      await placeAsk({
        shoeId: String(listStockShoe.id), size: listStockSize, condition: "new",
        price: parseFloat(listStockPrice), sellerId: user.uid, sellerName: "Apex Soles", sellerType: "admin",
      });
      alert("Listed!");
      setListStockShoe(null); setListStockSize(""); setListStockPrice("");
      fetchMarketData();
    } catch { alert("Failed to list stock."); }
  };

  const handleCancelAsk = async (id: string) => { await cancelAsk(id); fetchMarketData(); };
  const handleAcceptOffer = async (offerId: string) => {
    if (!confirm("Fulfill this offer from Apex Soles' own stock?")) return;
    try { await adminAcceptOffer({ offerId, sellerId: user.uid, sellerName: "Apex Soles" }); alert("Offer accepted — sale created."); fetchMarketData(); }
    catch { alert("Failed to accept offer (it may have already been matched or cancelled)."); }
  };
  const handleFulfillmentChange = async (saleId: string, status: FulfillmentStatus) => {
    await updateSaleFulfillment(saleId, status);
    fetchMarketData();
  };

  const handlePreorderStatusChange = async (preorderId: string, status: PreorderStatus) => {
    await updatePreorderStatus(preorderId, status);
    fetchMarketData();
  };

  const handleLogout = async () => { await signOut(getClientAuth()); sessionStorage.removeItem("admin_verified"); };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'inventory', label: 'Inventory', icon: List },
    { id: 'add', label: editingShoe ? 'Edit Product' : 'Add Product', icon: PlusCircle },
    { id: 'listings', label: 'Listings', icon: Tag },
    { id: 'offers', label: 'Offers', icon: Handshake },
    { id: 'sales', label: 'Sales', icon: Receipt },
    { id: 'preorders', label: 'Pre-Orders', icon: Clock },
    { id: 'blog', label: 'Blog Posts', icon: FileText },
    { id: 'new_post', label: editingPost ? 'Edit Post' : 'New Post', icon: Newspaper },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <Logo height={60} />
            <div>
              <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white mb-2">Admin Dashboard</h1>
              <p className="text-gray-500 uppercase text-[10px] font-bold tracking-[0.2em]">Manage inventory, marketplace &amp; blog.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => window.location.href = "/"} className="flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">View Shop</button>
            <button onClick={handleLogout} className="flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"><LogOut size={14} />Logout</button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {[
            { label: 'Total Products', value: shoes.length, icon: PackagePlus },
            { label: 'Active Listings', value: asks.length, icon: Tag },
            { label: 'Pending Offers', value: offers.length, icon: Handshake },
            { label: 'Total Sales', value: sales.length, icon: Receipt },
            { label: 'Pre-Orders', value: preorders.length, icon: Clock },
          ].map((stat, i) => (
            <div key={i} className="bg-[#141414] p-6 rounded-3xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-white/5 text-[#c6ff00]"><stat.icon size={20} /></div>
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Live</span>
              </div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black italic tracking-tight text-white">{stat.value}</h3>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-8 bg-[#141414] p-2 rounded-2xl border border-white/10 w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); if (tab.id !== 'add') setEditingShoe(null); if (tab.id !== 'new_post') setEditingPost(null); }}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-[#c6ff00] text-black' : 'text-gray-400 hover:bg-white/5'}`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-[#141414] rounded-3xl border border-white/10 overflow-hidden">

          {activeTab === 'overview' && (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-[#c6ff00]"><LayoutDashboard size={40} /></div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4 text-white">Welcome back, Admin</h2>
              <p className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed">Use the tabs above to manage inventory, moderate the marketplace, or publish blog posts.</p>
              <div className="flex flex-wrap justify-center gap-4 mt-10">
                <button onClick={() => setActiveTab('add')} className="flex items-center gap-2 bg-[#c6ff00] text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#d4ff33] transition-all">
                  <PlusCircle size={14} /> Add Sneaker
                </button>
                <button onClick={() => setActiveTab('new_post')} className="flex items-center gap-2 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all">
                  <Newspaper size={14} /> New Blog Post
                </button>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Product</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Brand</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Category</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Price</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {shoes.map(shoe => (
                    <tr key={shoe.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 bg-white/5">
                            <img src={shoe.image_url} alt={shoe.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-sm font-black italic uppercase tracking-tight text-white">{shoe.name}</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{shoe.color}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6"><span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-white/5 rounded-full text-white">{shoe.brand}</span></td>
                      <td className="px-8 py-6"><span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-white/5 rounded-full text-white">{shoe.category}</span></td>
                      <td className="px-8 py-6">
                        {(() => { const st = resolveStockStatus(shoe.stockStatus); return (
                          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${STOCK_STATUS_CONFIG[st].badgeClass}`}>
                            {STOCK_STATUS_CONFIG[st].dot} {STOCK_STATUS_CONFIG[st].label}
                          </span>
                        ); })()}
                      </td>
                      <td className="px-8 py-6"><p className="text-sm font-black text-white">GHS {shoe.price}</p></td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => { setListStockShoe(shoe); setListStockSize(shoe.sizes?.[0] || ""); setListStockPrice(shoe.price.toString()); }} className="p-2 text-gray-500 hover:text-[#c6ff00] hover:bg-white/5 rounded-lg transition-all" title="List Stock"><Tag size={16} /></button>
                          <button onClick={() => setEditingShoe(shoe)} className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"><Edit size={16} /></button>
                          <button onClick={() => handleDelete(shoe.id)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={16} /></button>
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
                    <label className={labelClass}>Model Name</label>
                    <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={inputClass} placeholder="e.g. Apex Velocity X" />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>Price (GHS)</label>
                    <input required type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className={inputClass} placeholder="e.g. 1500" />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>Brand</label>
                    <select value={formData.brand} onChange={e => handleBrandChange(e.target.value)} className={inputClass + " appearance-none"}>
                      {brands.map(brand => <option key={brand} className="bg-[#141414]">{brand}</option>)}
                      <option value="Other" className="bg-[#141414]">+ Add New Brand</option>
                    </select>
                    {showCustomBrandInput && (
                      <div className="flex gap-2 mt-2">
                        <input type="text" value={customBrand} onChange={e => setCustomBrand(e.target.value)} placeholder="Enter new brand name..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 ring-[#c6ff00]/30 transition-all" />
                        <button type="button" onClick={handleCustomBrandAdd} className="bg-[#c6ff00] text-black px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#d4ff33] transition-all">Add</button>
                        <button type="button" onClick={() => { setShowCustomBrandInput(false); setCustomBrand(""); setFormData(prev => ({ ...prev, brand: "Nike" })); }} className="bg-white/5 border border-white/10 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">Cancel</button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>Category</label>
                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className={inputClass + " appearance-none"}>
                      {["Men", "Women", "Unisex", "Performance", "Lifestyle", "Limited"].map(c => <option key={c} className="bg-[#141414]">{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>Main Colorway</label>
                    <input required value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} className={inputClass} placeholder="e.g. Electric Volt" />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>Style Code (optional)</label>
                    <input value={formData.styleCode} onChange={e => setFormData({ ...formData, styleCode: e.target.value })} className={inputClass} placeholder="e.g. FQ8138-600" />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>Retail Price (optional)</label>
                    <input type="number" value={formData.retailPrice} onChange={e => setFormData({ ...formData, retailPrice: e.target.value })} className={inputClass} placeholder="e.g. 900" />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>Release Date (optional)</label>
                    <input value={formData.releaseDate} onChange={e => setFormData({ ...formData, releaseDate: e.target.value })} className={inputClass} placeholder="e.g. 05/30/2026" />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className={labelClass}>Stock Status</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {(["in_stock", "pre_order", "coming_soon"] as StockStatus[]).map(st => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setFormData({ ...formData, stockStatus: st })}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${formData.stockStatus === st ? 'bg-[#c6ff00] text-black border-[#c6ff00]' : 'bg-white/5 text-white border-white/10 hover:border-white/30'}`}
                      >
                        {STOCK_STATUS_CONFIG[st].dot} {STOCK_STATUS_CONFIG[st].label}
                      </button>
                    ))}
                  </div>
                  {formData.stockStatus === "pre_order" && (
                    <input
                      value={formData.preOrderEta}
                      onChange={e => setFormData({ ...formData, preOrderEta: e.target.value })}
                      className={inputClass}
                      placeholder="Estimated arrival, e.g. 7-14 days"
                    />
                  )}
                  {formData.stockStatus === "in_stock" ? (
                    <p className="text-[10px] text-gray-500">Selected sizes are auto-listed as active asks at the price above.</p>
                  ) : (
                    <p className="text-[10px] text-gray-500">No asks are created for {STOCK_STATUS_CONFIG[formData.stockStatus].label.toLowerCase()} items — customers {formData.stockStatus === "pre_order" ? "request a pre-order" : "follow for a notification"} instead.</p>
                  )}
                </div>

                <div className="space-y-4">
                  <label className={labelClass}>Available Sizes</label>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {["US 6", "US 7", "US 8", "US 9", "US 10", "US 11", "US 12", "US 13", "US 14", "US 15"].map(size => (
                      <button key={size} type="button" onClick={() => toggleSize(size)} className={`py-3 rounded-xl text-[10px] font-black transition-all border ${formData.sizes.includes(size) ? 'bg-[#c6ff00] text-black border-[#c6ff00]' : 'bg-white/5 text-white border-white/10 hover:border-white/30'}`}>{size}</button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className={labelClass}>Available Colors</label>
                  <div className="flex flex-wrap gap-2">
                    {["Black", "White", "Red", "Blue", "Green", "Yellow", "Grey", "Navy", "Multi"].map(color => (
                      <button key={color} type="button" onClick={() => toggleColor(color)} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${formData.colors.includes(color) ? 'bg-[#c6ff00] text-black border-[#c6ff00]' : 'bg-white/5 text-white border-white/10 hover:border-white/30'}`}>{color}</button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className={labelClass}>Main Product Image</label>
                    <div className="flex flex-col sm:flex-row items-stretch gap-6">
                      <div className="flex-1 relative group">
                        <input type="file" accept="image/*" onChange={e => handleImageUpload(e, false)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        <div className="w-full bg-white/5 border-2 border-dashed border-white/10 rounded-3xl px-8 py-12 text-center group-hover:border-white/20 transition-all">
                          {uploading ? <Zap className="animate-spin mx-auto mb-4" size={32} /> : formData.image_url ? <div className="text-[#c6ff00]"><PackagePlus className="mx-auto mb-4" size={32} /><span className="text-[10px] font-black uppercase tracking-widest">Main Image Ready</span></div> : <div className="text-gray-500"><Plus className="mx-auto mb-4" size={32} /><span className="text-[10px] font-black uppercase tracking-widest">Upload Main Image</span></div>}
                        </div>
                      </div>
                      {formData.image_url && <div className="w-full sm:w-48 h-48 rounded-3xl overflow-hidden border border-white/10 shadow-lg"><img src={formData.image_url} className="w-full h-full object-cover" alt="Preview" /></div>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className={labelClass}>Additional Images</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {formData.additional_images.map((url, i) => (
                        <div key={i} className="relative group aspect-square rounded-2xl overflow-hidden border border-white/10">
                          <img src={url} className="w-full h-full object-cover" alt="" />
                          <button type="button" onClick={() => setFormData(prev => ({ ...prev, additional_images: prev.additional_images.filter((_, idx) => idx !== i) }))} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                        </div>
                      ))}
                      <div className="relative group aspect-square">
                        <input type="file" multiple accept="image/*" onChange={e => handleImageUpload(e, true)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        <div className="w-full h-full bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center group-hover:border-white/20 transition-all"><PlusCircle size={24} className="text-gray-500 mb-2" /><span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Add More</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Description</label>
                  <textarea required rows={6} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className={inputClass + " rounded-3xl resize-none"} placeholder="Tell the story behind this pair..." />
                </div>

                <div className="flex gap-4">
                  {editingShoe && (
                    <button type="button" onClick={() => { setEditingShoe(null); resetForm(); setActiveTab('inventory'); }} className="flex-1 bg-white/5 border border-white/10 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all">Cancel Edit</button>
                  )}
                  <button type="submit" disabled={isSubmitting || uploading} className="flex-[2] bg-[#c6ff00] text-black py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#d4ff33] transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                    {isSubmitting ? <Zap className="animate-spin" size={16} /> : <PackagePlus size={16} />}
                    {isSubmitting ? "PROCESSING..." : editingShoe ? "UPDATE SNEAKER" : "PUBLISH & LIST SNEAKER"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'listings' && (
            <div>
              <div className="flex items-center justify-between px-8 py-6 border-b border-white/10">
                <h3 className="text-lg font-black italic uppercase tracking-tighter text-white">Active Listings (Asks)</h3>
              </div>
              {marketLoading ? (
                <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-white/20 border-t-[#c6ff00] rounded-full animate-spin" /></div>
              ) : asks.length === 0 ? (
                <p className="text-center text-gray-500 text-xs font-bold uppercase tracking-widest py-16">No active listings.</p>
              ) : (
                <div className="divide-y divide-white/5">
                  {asks.map(a => (
                    <div key={a.id} className="flex items-center gap-6 px-8 py-5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black italic uppercase tracking-tight text-white truncate">{shoeName(a.shoeId)}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Size {a.size} · {a.condition} · {a.sellerType === 'admin' ? 'Apex Soles' : a.sellerName}</p>
                      </div>
                      <p className="font-mono font-black text-[#c6ff00]">GH¢ {a.price.toLocaleString()}</p>
                      <button onClick={() => handleCancelAsk(a.id)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'offers' && (
            <div>
              <div className="flex items-center justify-between px-8 py-6 border-b border-white/10">
                <h3 className="text-lg font-black italic uppercase tracking-tighter text-white">Active Offers (Bids)</h3>
              </div>
              {marketLoading ? (
                <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-white/20 border-t-[#c6ff00] rounded-full animate-spin" /></div>
              ) : offers.length === 0 ? (
                <p className="text-center text-gray-500 text-xs font-bold uppercase tracking-widest py-16">No active offers.</p>
              ) : (
                <div className="divide-y divide-white/5">
                  {offers.map(o => (
                    <div key={o.id} className="flex items-center gap-6 px-8 py-5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black italic uppercase tracking-tight text-white truncate">{shoeName(o.shoeId)}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Size {o.size} · {o.buyerName}</p>
                      </div>
                      <p className="font-mono font-black text-[#c6ff00]">GH¢ {o.price.toLocaleString()}</p>
                      <button onClick={() => handleAcceptOffer(o.id)} className="flex items-center gap-2 bg-[#c6ff00] text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#d4ff33] transition-all">
                        <CheckCircle2 size={14} /> Accept
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'sales' && (
            <div>
              <div className="flex items-center justify-between px-8 py-6 border-b border-white/10">
                <h3 className="text-lg font-black italic uppercase tracking-tighter text-white">Sales Ledger</h3>
              </div>
              {marketLoading ? (
                <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-white/20 border-t-[#c6ff00] rounded-full animate-spin" /></div>
              ) : sales.length === 0 ? (
                <p className="text-center text-gray-500 text-xs font-bold uppercase tracking-widest py-16">No sales yet.</p>
              ) : (
                <div className="divide-y divide-white/5">
                  {sales.map(s => (
                    <div key={s.id} className="flex items-center gap-6 px-8 py-5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black italic uppercase tracking-tight text-white truncate">{shoeName(s.shoeId)}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Size {s.size} · {s.buyerName} ← {s.sellerName} · {new Date(s.createdAt).toLocaleDateString()}</p>
                      </div>
                      <p className="font-mono font-black text-[#c6ff00]">GH¢ {s.price.toLocaleString()}</p>
                      <select
                        value={s.fulfillmentStatus}
                        onChange={e => handleFulfillmentChange(s.id, e.target.value as FulfillmentStatus)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none"
                      >
                        {(["pending", "contacted", "shipped", "completed", "cancelled"] as FulfillmentStatus[]).map(st => (
                          <option key={st} value={st} className="bg-[#141414]">{st}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'preorders' && (
            <div>
              <div className="flex items-center justify-between px-8 py-6 border-b border-white/10">
                <h3 className="text-lg font-black italic uppercase tracking-tighter text-white">Pre-Order Requests</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{PREORDER_DEPOSIT_PERCENT}% deposit required on all</p>
              </div>
              {marketLoading ? (
                <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-white/20 border-t-[#c6ff00] rounded-full animate-spin" /></div>
              ) : preorders.length === 0 ? (
                <p className="text-center text-gray-500 text-xs font-bold uppercase tracking-widest py-16">No pre-order requests yet.</p>
              ) : (
                <div className="divide-y divide-white/5">
                  {preorders.map(p => (
                    <div key={p.id} className="flex items-center gap-6 px-8 py-5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black italic uppercase tracking-tight text-white truncate">{p.shoeName}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Size {p.size} · {p.buyerName} · ETA {p.eta} · {new Date(p.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-mono font-black text-[#c6ff00]">GH¢ {p.price.toLocaleString()}</p>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Deposit GH¢ {p.depositAmount.toLocaleString()}</p>
                      </div>
                      <select
                        value={p.status}
                        onChange={e => handlePreorderStatusChange(p.id, e.target.value as PreorderStatus)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none"
                      >
                        {(["requested", "deposit_paid", "sourcing", "arrived", "completed", "cancelled"] as PreorderStatus[]).map(st => (
                          <option key={st} value={st} className="bg-[#141414]">{st.replace("_", " ")}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'blog' && (
            <div>
              <div className="flex items-center justify-between px-8 py-6 border-b border-white/10">
                <h3 className="text-lg font-black italic uppercase tracking-tighter text-white">All Blog Posts</h3>
                <button onClick={() => setActiveTab('new_post')} className="flex items-center gap-2 bg-[#c6ff00] text-black px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-[#d4ff33] transition-all">
                  <Plus size={14} /> New Post
                </button>
              </div>
              {blogLoading ? (
                <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-white/20 border-t-[#c6ff00] rounded-full animate-spin" /></div>
              ) : blogPosts.length === 0 ? (
                <div className="text-center py-24">
                  <Newspaper size={48} className="mx-auto mb-4 text-gray-700" />
                  <p className="text-gray-500 font-black italic uppercase tracking-tighter text-xl">No posts yet.</p>
                  <p className="text-gray-600 text-xs mt-2 uppercase tracking-widest">Click "New Post" to publish your first article.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {blogPosts.map(post => (
                    <div key={post.id} className="flex items-center gap-6 px-8 py-6 hover:bg-white/5 transition-colors">
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-white/5 flex-shrink-0">
                        {post.image ? <img src={post.image} alt={post.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Newspaper size={20} className="text-gray-600" /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black italic uppercase tracking-tight text-white truncate">{post.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-white/5 rounded text-white">{post.category}</span>
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{post.date}</span>
                          {post.author && <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">By {post.author}</span>}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{post.excerpt}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => { setEditingPost(post); setActiveTab('new_post'); }} className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"><Edit size={16} /></button>
                        <button onClick={() => handleDeletePost(post.id)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'new_post' && (
            <BlogPostForm
              onSaved={() => { fetchBlogPosts(); setActiveTab('blog'); }}
              editingPost={editingPost}
              onCancelEdit={() => { setEditingPost(null); setActiveTab('blog'); }}
            />
          )}

        </div>
      </div>

      {/* List Stock quick-action modal */}
      <AnimatePresence>
        {listStockShoe && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setListStockShoe(null)} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-[#141414] border border-white/10 w-full max-w-sm rounded-[2rem] p-8">
              <h3 className="text-xl font-black italic uppercase tracking-tighter text-white mb-6">List Stock — {listStockShoe.name}</h3>
              <form onSubmit={handleListStock} className="space-y-4">
                <div className="space-y-2">
                  <label className={labelClass}>Size</label>
                  <select value={listStockSize} onChange={e => setListStockSize(e.target.value)} className={inputClass}>
                    {(listStockShoe.sizes && listStockShoe.sizes.length > 0 ? listStockShoe.sizes : ["US 7", "US 8", "US 9", "US 10", "US 11", "US 12"]).map(s => (
                      <option key={s} value={s} className="bg-[#141414]">{s}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Price (GH¢)</label>
                  <input type="number" required value={listStockPrice} onChange={e => setListStockPrice(e.target.value)} className={inputClass} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setListStockShoe(null)} className="flex-1 bg-white/5 border border-white/10 text-white py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all">Cancel</button>
                  <button type="submit" className="flex-[2] bg-[#c6ff00] text-black py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-[#d4ff33] transition-all">List It</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
      <div className="max-w-md w-full space-y-8 bg-[#141414] p-10 rounded-3xl border border-white/10">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#c6ff00] rounded-2xl flex items-center justify-center mx-auto mb-6"><Lock className="text-black" size={24} /></div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
            {isSignUp ? "Create Admin" : "Admin Access"}
          </h2>
          <p className="mt-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            {isSignUp ? "Register a new admin account." : "Sign in to manage Apex Soles."}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Admin PIN (6 Digits)</label>
              <div className="relative">
                <input
                  type={showPin ? "text" : "password"}
                  required
                  maxLength={6}
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  className="appearance-none relative block w-full px-6 py-4 pr-12 border border-white/10 bg-white/5 placeholder-gray-500 text-white rounded-2xl focus:outline-none focus:ring-2 ring-[#c6ff00]/30 transition-all text-sm tracking-[1em] text-center"
                  placeholder="••••••"
                />
                <button type="button" onClick={() => setShowPin(!showPin)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                  {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="appearance-none relative block w-full px-6 py-4 border border-white/10 bg-white/5 placeholder-gray-500 text-white rounded-2xl focus:outline-none focus:ring-2 ring-[#c6ff00]/30 transition-all text-sm" placeholder="admin@apexsoles.com" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-6 py-4 pr-12 border border-white/10 bg-white/5 placeholder-gray-500 text-white rounded-2xl focus:outline-none focus:ring-2 ring-[#c6ff00]/30 transition-all text-sm"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>
          <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-5 px-4 border border-transparent text-[10px] font-black uppercase tracking-widest rounded-2xl text-black bg-[#c6ff00] hover:bg-[#d4ff33] focus:outline-none transition-all disabled:opacity-50">
            {loading ? <Zap className="animate-spin" size={16} /> : isSignUp ? "Create Account" : "Authorize Access"}
          </button>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-[#141414] px-4 text-gray-500">Or</span></div>
          </div>
          <button type="button" onClick={handleGoogleLogin} className="w-full bg-white/5 border border-white/10 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all flex items-center justify-center gap-3">
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
            {isSignUp ? "Sign up with Google" : "Sign in with Google"}
          </button>
        </form>
        <p className="text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          {isSignUp ? "Already have an account?" : "Need an admin account?"}{" "}
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-[#c6ff00] hover:underline">
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

  if (loading && user) return <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]"><Zap className="animate-spin text-[#c6ff00]" size={32} /></div>;
  if (!user || !isAdminVerified) return <AdminLogin onVerified={handleVerified} />;
  return <AdminPanel onShoeAdded={fetchShoes} shoes={shoes} user={user} />;
}
