"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartItem, Shoe, Brand } from "@/types";
import { getClientAuth, getClientDb } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Search, Filter, Plus, Edit, Trash2 } from "lucide-react";

export default function ArchivePage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Sample brands data (in real app, this would come from Firestore)
  const sampleBrands: Brand[] = [
    {
      id: 1,
      name: "Nike",
      logo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=200&auto=format&fit=crop",
      description: "Global sportswear giant known for innovation and iconic sneakers",
      founded_year: 1964,
      country: "USA",
      website: "https://nike.com",
      featured: true
    },
    {
      id: 2,
      name: "Adidas",
      logo: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=200&auto=format&fit=crop",
      description: "German multinational corporation that designs and manufactures sports shoes",
      founded_year: 1949,
      country: "Germany",
      website: "https://adidas.com",
      featured: true
    },
    {
      id: 3,
      name: "Jordan",
      logo: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=200&auto=format&fit=crop",
      description: "Brand of basketball shoes, athletic and casual clothing produced by Nike",
      founded_year: 1984,
      country: "USA",
      website: "https://jordan.com",
      featured: true
    },
    {
      id: 4,
      name: "New Balance",
      logo: "https://images.unsplash.com/photo-1515886657613-9f3515b79c4f?q=80&w=200&auto=format&fit=crop",
      description: "American sports footwear and apparel brand",
      founded_year: 1906,
      country: "USA",
      website: "https://newbalance.com",
      featured: false
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch shoes
        const firestore = getClientDb();
        const shoesRef = collection(firestore, "shoes");
        const querySnapshot = await getDocs(shoesRef);
        let shoesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as unknown as Shoe[];
        
        setShoes(shoesData);
        
        // For now, use sample brands (in real app, fetch from Firestore)
        setBrands(sampleBrands);
        
        // Check if user is admin (simple check - in real app, use proper auth roles)
        setIsAdmin(user?.email === "admin@apexsoles.com");
      } catch (err) {
        console.error("Error fetching data:", err);
        setShoes([]);
        setBrands(sampleBrands);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const addToCart = (shoe: Shoe) => {
    setCart(prev => [...prev, { ...shoe, quantity: 1, selectedSize: "US 10", selectedColor: shoe.color }]);
    setIsCartOpen(true);
  };

  // Filter shoes by brand and search term
  const filteredShoes = shoes.filter(shoe => {
    const matchesBrand = !selectedBrand || shoe.brand === selectedBrand;
    const matchesSearch = !searchTerm || 
      shoe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shoe.brand.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesBrand && matchesSearch;
  });

  // Get unique brands from shoes
  const availableBrands = Array.from(new Set(shoes.map(shoe => shoe.brand)));

  const filteredBrands = brands.filter(brand => 
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <Navbar 
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)} 
        onOpenCart={() => setIsCartOpen(true)} 
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />
      <main>
        <section className="py-20 px-6 w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2 text-black">Brand Archive</h2>
              <p className="text-gray-400 uppercase text-[10px] font-bold tracking-[0.2em]">Discover sneaker brands and their collections.</p>
            </div>
            {isAdmin && (
              <button 
                onClick={() => setShowAddBrand(true)}
                className="bg-black text-white px-6 py-3 rounded-md font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-colors flex items-center gap-2"
              >
                <Plus size={16} /> Add Brand
              </button>
            )}
          </div>

          {/* Search and Filter Section */}
          <div className="mb-12 space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search brands or sneakers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black/5 border border-black/5 rounded-xl pl-12 pr-6 py-4 text-sm focus:outline-none focus:ring-1 ring-black/20 text-black"
                />
              </div>
              <select 
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="bg-black/5 border border-black/5 rounded-xl px-6 py-4 text-sm focus:outline-none focus:ring-1 ring-black/20 text-black min-w-[200px]"
              >
                <option value="">All Brands</option>
                {availableBrands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-24">
              <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-16">
              {/* Brands Section */}
              <div>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-8 text-black">Featured Brands</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredBrands.map(brand => (
                    <div key={brand.id} className="group cursor-pointer">
                      <div className="aspect-square bg-[#f8f8f8] rounded-2xl overflow-hidden relative border border-black/5 mb-6">
                        <img 
                          src={brand.logo} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                          alt={brand.name}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                          {isAdmin && (
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="bg-white text-black p-2 rounded-full hover:bg-zinc-100 transition-colors">
                                <Edit size={16} />
                              </button>
                              <button className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xl font-black text-black">{brand.name}</h4>
                        <p className="text-gray-500 text-sm line-clamp-2">{brand.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          {brand.founded_year && <span>Est. {brand.founded_year}</span>}
                          {brand.country && <span>{brand.country}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shoes Section */}
              <div>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-8 text-black">
                  {selectedBrand ? `${selectedBrand} Collection` : 'All Sneakers'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredShoes.length > 0 ? filteredShoes.map(shoe => (
                    <div key={shoe.id} className="group">
                      <div className="aspect-square bg-[#f8f8f8] rounded-2xl overflow-hidden relative border border-black/5 mb-4">
                        <img 
                          src={shoe.image_url} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                          alt={shoe.name}
                        />
                        <div className="absolute top-4 left-4 bg-black text-white text-[10px] font-black uppercase px-3 py-1 rounded-md">
                          {shoe.brand}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-lg font-black text-black">{shoe.name}</h4>
                        <p className="text-gray-500 text-sm">{shoe.brand}</p>
                        <p className="font-mono font-black text-lg text-black">GH¢ {shoe.price}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-full text-center py-24">
                      <p className="text-gray-300 font-black italic uppercase text-3xl tracking-tighter">No sneakers found</p>
                      <p className="text-gray-400 text-sm mt-2 uppercase tracking-widest">Try adjusting your search or filters</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
