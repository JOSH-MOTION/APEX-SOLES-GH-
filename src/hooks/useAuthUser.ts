"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase";

// Every page needs the signed-in user for the Navbar/Cart/Sell/Bid actions.
// Several pages used to declare `useState<any>(null)` for `user` and never
// actually subscribe to auth state, silently showing everyone as logged out —
// use this hook everywhere instead.
export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = onAuthStateChanged(getClientAuth(), (u) => {
        setUser(u);
        setLoading(false);
      });
    } catch {
      setLoading(false);
    }
    return () => unsubscribe?.();
  }, []);

  return { user, loading };
}
