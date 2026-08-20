"use client";

import { useEffect, useState, useCallback } from "react";
import { collection, getDocs } from "firebase/firestore";
import { getClientDb } from "@/lib/firebase";
import { Shoe } from "@/types";

// Centralizes the Firestore-first, local-API-fallback fetch that HomeClient.tsx
// used to do inline (and that men/women/archive/drops each re-implemented
// slightly differently). Firestore is the system of record; /api/shoes (a local
// sqlite fallback) only kicks in if Firestore is empty or unreachable.
export function useShoes() {
  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShoes = useCallback(async () => {
    setLoading(true);
    try {
      const firestore = getClientDb();
      const snap = await getDocs(collection(firestore, "shoes"));
      let data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as unknown as Shoe[];
      data.sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db2 = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db2 - da;
      });
      if (data.length > 0) {
        setShoes(data);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error("Firestore fetch error:", err);
    }

    try {
      const res = await fetch("/api/shoes");
      if (!res.ok) throw new Error("API fetch failed");
      const data = await res.json();
      setShoes(data);
    } catch (err) {
      console.error("Local API fetch error:", err);
      setShoes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShoes();
  }, [fetchShoes]);

  return { shoes, loading, refetch: fetchShoes };
}
