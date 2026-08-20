"use client";

import { Shoe } from "@/types";

export interface ProductFilters {
  brand: string;
  size: string;
  color: string;
  minPrice: string;
  maxPrice: string;
  sort: "featured" | "price-asc" | "price-desc" | "newest";
}

export const defaultFilters: ProductFilters = {
  brand: "",
  size: "",
  color: "",
  minPrice: "",
  maxPrice: "",
  sort: "featured",
};

export function applyFilters(shoes: Shoe[], priceMap: Record<string, number>, filters: ProductFilters): Shoe[] {
  let result = shoes.filter((shoe) => {
    if (filters.brand && shoe.brand !== filters.brand) return false;
    if (filters.size && !(shoe.sizes || []).includes(filters.size)) return false;
    if (filters.color && shoe.color !== filters.color && !(shoe.colors || []).includes(filters.color)) return false;
    const price = priceMap[String(shoe.id)] ?? shoe.price;
    if (filters.minPrice && price < parseFloat(filters.minPrice)) return false;
    if (filters.maxPrice && price > parseFloat(filters.maxPrice)) return false;
    return true;
  });

  if (filters.sort === "price-asc") {
    result = [...result].sort((a, b) => (priceMap[String(a.id)] ?? a.price) - (priceMap[String(b.id)] ?? b.price));
  } else if (filters.sort === "price-desc") {
    result = [...result].sort((a, b) => (priceMap[String(b.id)] ?? b.price) - (priceMap[String(a.id)] ?? a.price));
  } else if (filters.sort === "newest") {
    result = [...result].sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db - da;
    });
  }
  return result;
}

interface FilterSidebarProps {
  shoes: Shoe[];
  filters: ProductFilters;
  onChange: (filters: ProductFilters) => void;
}

export const FilterSidebar = ({ shoes, filters, onChange }: FilterSidebarProps) => {
  const brands = Array.from(new Set(shoes.map((s) => s.brand))).sort();
  const sizes = Array.from(new Set(shoes.flatMap((s) => s.sizes || []))).sort();
  const colors = Array.from(new Set(shoes.flatMap((s) => [s.color, ...(s.colors || [])]).filter(Boolean))).sort();

  const set = (patch: Partial<ProductFilters>) => onChange({ ...filters, ...patch });

  return (
    <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
      <div>
        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Sort By</label>
        <select
          value={filters.sort}
          onChange={(e) => set({ sort: e.target.value as ProductFilters["sort"] })}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
        >
          <option value="featured">Featured</option>
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      <div>
        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Brand</label>
        <select
          value={filters.brand}
          onChange={(e) => set({ brand: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Size</label>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => (
            <button
              key={s}
              onClick={() => set({ size: filters.size === s ? "" : s })}
              className={`px-3 py-2 rounded-lg text-[10px] font-black border transition-all ${filters.size === s ? "bg-[#c6ff00] text-black border-[#c6ff00]" : "bg-white/5 text-white border-white/10 hover:border-white/30"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Color</label>
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => set({ color: filters.color === c ? "" : c })}
              className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase border transition-all ${filters.color === c ? "bg-[#c6ff00] text-black border-[#c6ff00]" : "bg-white/5 text-white border-white/10 hover:border-white/30"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Price (GH¢)</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => set({ minPrice: e.target.value })}
            className="w-1/2 bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => set({ maxPrice: e.target.value })}
            className="w-1/2 bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none"
          />
        </div>
      </div>

      {(filters.brand || filters.size || filters.color || filters.minPrice || filters.maxPrice) && (
        <button
          onClick={() => onChange(defaultFilters)}
          className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#c6ff00] transition-colors"
        >
          Clear All Filters
        </button>
      )}
    </aside>
  );
};
