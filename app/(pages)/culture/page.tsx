"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Newspaper } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { getClientDb } from "@/lib/firebase";
import { BlogPost } from "@/types";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function CulturePage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(getClientDb(), "blog_posts"));
        let data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as BlogPost[];
        data.sort((a, b) => {
          const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const db2 = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return db2 - da;
        });
        setPosts(data);
      } catch (err) {
        console.error("Error fetching blog posts:", err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#c6ff00] selection:text-black">
      <Navbar />
      <main>
        <section className="py-20 px-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
            <div>
              <h2 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter text-white leading-none">Culture</h2>
              <p className="text-gray-500 uppercase text-[10px] font-bold tracking-[0.3em] mt-4">Stories, News &amp; Community Updates</p>
            </div>
            <div className="hidden md:block h-px flex-1 bg-white/10 mx-12 mb-4" />
          </div>

          {loading ? (
            <div className="flex justify-center py-24">
              <div className="w-8 h-8 border-4 border-white/20 border-t-[#c6ff00] rounded-full animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-24">
              <Newspaper size={48} className="mx-auto mb-4 text-gray-700" />
              <p className="text-gray-600 font-black italic uppercase text-3xl tracking-tighter">No posts yet.</p>
              <p className="text-gray-500 text-sm mt-2 uppercase tracking-widest">Check back soon for stories &amp; news.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {posts.map((article) => (
                <div key={article.id} className="group cursor-pointer space-y-6">
                  <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 relative bg-[#141414]">
                    <img
                      src={article.image || "https://images.unsplash.com/photo-1523398002811-999ca8dec234?q=80&w=800&auto=format&fit=crop"}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                      referrerPolicy="no-referrer"
                      alt={article.title}
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-black uppercase tracking-widest bg-[#c6ff00] px-2 py-1 rounded">{article.category}</span>
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{article.date}</span>
                    </div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white group-hover:text-[#c6ff00] transition-colors leading-tight">
                      {article.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">{article.excerpt}</p>
                    {article.content && (
                      <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white group-hover:gap-3 transition-all">
                        Read More <ArrowRight size={14} />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-32 p-12 bg-[#141414] rounded-3xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-md space-y-4">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Join the Community</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Be the first to know about exclusive events, pop-up shops, and community meetups in Accra.
              </p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                placeholder="Email Address"
                className="flex-1 md:w-64 bg-white/5 border border-white/10 rounded-md px-6 py-4 text-sm focus:outline-none focus:ring-1 ring-[#c6ff00]/30 text-white placeholder:text-gray-500"
              />
              <button className="bg-[#c6ff00] text-black px-10 py-4 rounded-md font-black uppercase tracking-widest text-xs hover:bg-[#d4ff33] transition-colors">Subscribe</button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
