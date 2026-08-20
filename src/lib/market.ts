// Client-side bid/ask matching engine for the Apex Soles marketplace.
// There is no backend here (no Cloud Functions) — Firestore transactions are the
// only concurrency primitive available. Matching re-checks a small batch of
// candidate resting orders (not just one) inside a transaction so a lost race
// against another buyer/seller falls through to the next candidate instead of
// silently failing to match. This is optimistic/best-effort, not a full
// serializable order book — acceptable at this business's real scale.
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { getClientDb } from "./firebase";
import { Ask, Offer, Sale, FulfillmentStatus, Follow } from "@/types";

const CANDIDATE_LIMIT = 8;
const STALE_CANDIDATE = "STALE_CANDIDATE";

function nowIso() {
  return new Date().toISOString();
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// ─── PLACE ASK / OFFER / BUY NOW ────────────────────────────────────────────

export async function placeAsk(input: {
  shoeId: string;
  size: string;
  condition: "new" | "used";
  price: number;
  sellerId: string;
  sellerName: string;
  sellerType: "admin" | "user";
}): Promise<{ matched: boolean; saleId?: string; askId?: string }> {
  const db = getClientDb();
  const { shoeId, size, condition, price, sellerId, sellerName, sellerType } = input;

  const candidatesSnap = await getDocs(
    query(
      collection(db, "offers"),
      where("shoeId", "==", shoeId),
      where("size", "==", size),
      where("status", "==", "active"),
      where("price", ">=", price),
      orderBy("price", "desc"),
      orderBy("createdAt", "asc"),
      limit(CANDIDATE_LIMIT)
    )
  );

  for (const candidate of candidatesSnap.docs) {
    try {
      const saleId = await runTransaction(db, async (tx) => {
        const offerRef = doc(db, "offers", candidate.id);
        const offerSnap = await tx.get(offerRef);
        if (!offerSnap.exists() || offerSnap.data().status !== "active") {
          throw new Error(STALE_CANDIDATE);
        }
        const offerData = offerSnap.data() as Omit<Offer, "id">;
        tx.update(offerRef, { status: "matched" });
        const saleRef = doc(collection(db, "sales"));
        const sale: Omit<Sale, "id"> = {
          shoeId,
          size,
          condition,
          price: offerData.price,
          buyerId: offerData.buyerId,
          buyerName: offerData.buyerName,
          sellerId,
          sellerName,
          askId: null,
          offerId: offerRef.id,
          fulfillmentStatus: "pending",
          createdAt: nowIso(),
        };
        tx.set(saleRef, sale);
        return saleRef.id;
      });
      return { matched: true, saleId };
    } catch (err: any) {
      if (err?.message === STALE_CANDIDATE) continue;
      throw err;
    }
  }

  const askRef = await addDoc(collection(db, "asks"), {
    shoeId,
    size,
    condition,
    price,
    sellerId,
    sellerName,
    sellerType,
    status: "active",
    createdAt: nowIso(),
  });
  return { matched: false, askId: askRef.id };
}

export async function placeOffer(input: {
  shoeId: string;
  size: string;
  price: number;
  buyerId: string;
  buyerName: string;
}): Promise<{ matched: boolean; saleId?: string; offerId?: string; price?: number; condition?: "new" | "used" }> {
  const db = getClientDb();
  const { shoeId, size, price, buyerId, buyerName } = input;

  const candidatesSnap = await getDocs(
    query(
      collection(db, "asks"),
      where("shoeId", "==", shoeId),
      where("size", "==", size),
      where("status", "==", "active"),
      where("price", "<=", price),
      orderBy("price", "asc"),
      orderBy("createdAt", "asc"),
      limit(CANDIDATE_LIMIT)
    )
  );

  for (const candidate of candidatesSnap.docs) {
    try {
      const result = await runTransaction(db, async (tx) => {
        const askRef = doc(db, "asks", candidate.id);
        const askSnap = await tx.get(askRef);
        if (!askSnap.exists() || askSnap.data().status !== "active") {
          throw new Error(STALE_CANDIDATE);
        }
        const askData = askSnap.data() as Omit<Ask, "id">;
        tx.update(askRef, { status: "sold" });
        const saleRef = doc(collection(db, "sales"));
        const sale: Omit<Sale, "id"> = {
          shoeId,
          size,
          condition: askData.condition,
          price: askData.price,
          buyerId,
          buyerName,
          sellerId: askData.sellerId,
          sellerName: askData.sellerName,
          askId: askRef.id,
          offerId: null,
          fulfillmentStatus: "pending",
          createdAt: nowIso(),
        };
        tx.set(saleRef, sale);
        return { saleId: saleRef.id, price: askData.price, condition: askData.condition };
      });
      return { matched: true, ...result };
    } catch (err: any) {
      if (err?.message === STALE_CANDIDATE) continue;
      throw err;
    }
  }

  const offerRef = await addDoc(collection(db, "offers"), {
    shoeId,
    size,
    price,
    buyerId,
    buyerName,
    status: "active",
    createdAt: nowIso(),
  });
  return { matched: false, offerId: offerRef.id };
}

// Instant purchase at the current lowest ask. Returns null if nobody is selling
// that size right now (caller should prompt the buyer to place a bid instead).
export async function buyNow(input: {
  shoeId: string;
  size: string;
  buyerId: string;
  buyerName: string;
}): Promise<{ saleId: string; price: number; condition: "new" | "used" } | null> {
  const db = getClientDb();
  const { shoeId, size, buyerId, buyerName } = input;

  const candidatesSnap = await getDocs(
    query(
      collection(db, "asks"),
      where("shoeId", "==", shoeId),
      where("size", "==", size),
      where("status", "==", "active"),
      orderBy("price", "asc"),
      orderBy("createdAt", "asc"),
      limit(CANDIDATE_LIMIT)
    )
  );

  for (const candidate of candidatesSnap.docs) {
    try {
      return await runTransaction(db, async (tx) => {
        const askRef = doc(db, "asks", candidate.id);
        const askSnap = await tx.get(askRef);
        if (!askSnap.exists() || askSnap.data().status !== "active") {
          throw new Error(STALE_CANDIDATE);
        }
        const askData = askSnap.data() as Omit<Ask, "id">;
        tx.update(askRef, { status: "sold" });
        const saleRef = doc(collection(db, "sales"));
        const sale: Omit<Sale, "id"> = {
          shoeId,
          size,
          condition: askData.condition,
          price: askData.price,
          buyerId,
          buyerName,
          sellerId: askData.sellerId,
          sellerName: askData.sellerName,
          askId: askRef.id,
          offerId: null,
          fulfillmentStatus: "pending",
          createdAt: nowIso(),
        };
        tx.set(saleRef, sale);
        return { saleId: saleRef.id, price: askData.price, condition: askData.condition };
      });
    } catch (err: any) {
      if (err?.message === STALE_CANDIDATE) continue;
      throw err;
    }
  }

  return null;
}

// Admin fulfills an offer directly from store inventory, without needing a
// pre-existing ask — Apex Soles has real physical stock and can act as
// counterparty on demand.
export async function adminAcceptOffer(input: {
  offerId: string;
  sellerId: string;
  sellerName: string;
  condition?: "new" | "used";
}): Promise<{ saleId: string }> {
  const db = getClientDb();
  const { offerId, sellerId, sellerName, condition = "new" } = input;
  const saleId = await runTransaction(db, async (tx) => {
    const offerRef = doc(db, "offers", offerId);
    const offerSnap = await tx.get(offerRef);
    if (!offerSnap.exists() || offerSnap.data().status !== "active") {
      throw new Error("OFFER_NOT_ACTIVE");
    }
    const offerData = offerSnap.data() as Omit<Offer, "id">;
    tx.update(offerRef, { status: "matched" });
    const saleRef = doc(collection(db, "sales"));
    const sale: Omit<Sale, "id"> = {
      shoeId: offerData.shoeId,
      size: offerData.size,
      condition,
      price: offerData.price,
      buyerId: offerData.buyerId,
      buyerName: offerData.buyerName,
      sellerId,
      sellerName,
      askId: null,
      offerId: offerRef.id,
      fulfillmentStatus: "pending",
      createdAt: nowIso(),
    };
    tx.set(saleRef, sale);
    return saleRef.id;
  });
  return { saleId };
}

export async function cancelAsk(askId: string) {
  await updateDoc(doc(getClientDb(), "asks", askId), { status: "cancelled" });
}

export async function cancelOffer(offerId: string) {
  await updateDoc(doc(getClientDb(), "offers", offerId), { status: "cancelled" });
}

export async function updateSaleFulfillment(saleId: string, status: FulfillmentStatus) {
  await updateDoc(doc(getClientDb(), "sales", saleId), { fulfillmentStatus: status });
}

// ─── REALTIME (product page + market data drawer only — never grid pages) ──

// Firestore logs onSnapshot errors to console by default when no error
// handler is passed — every subscribe here passes one (falling back to an
// empty list) so a denied-permission project (e.g. rules not deployed yet,
// see firestore.rules) degrades quietly instead of spamming the console.
export function subscribeAsks(shoeId: string, size: string | null, cb: (asks: Ask[]) => void): Unsubscribe {
  const db = getClientDb();
  const constraints = [where("shoeId", "==", shoeId), where("status", "==", "active")];
  if (size) constraints.push(where("size", "==", size));
  const q = query(collection(db, "asks"), ...constraints, orderBy("price", "asc"));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Ask))),
    () => cb([])
  );
}

export function subscribeOffers(shoeId: string, size: string | null, cb: (offers: Offer[]) => void): Unsubscribe {
  const db = getClientDb();
  const constraints = [where("shoeId", "==", shoeId), where("status", "==", "active")];
  if (size) constraints.push(where("size", "==", size));
  const q = query(collection(db, "offers"), ...constraints, orderBy("price", "desc"));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Offer))),
    () => cb([])
  );
}

export function subscribeSales(shoeId: string, size: string | null, cb: (sales: Sale[]) => void): Unsubscribe {
  const db = getClientDb();
  const constraints = [where("shoeId", "==", shoeId)];
  if (size) constraints.push(where("size", "==", size));
  const q = query(collection(db, "sales"), ...constraints, orderBy("createdAt", "desc"), limit(50));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Sale))),
    () => cb([])
  );
}

// ─── ONE-TIME BATCHED READS (grid/card badges — never realtime here) ───────

export async function getLowestAsksForShoes(shoeIds: (string | number)[]): Promise<Record<string, number>> {
  const unique = Array.from(new Set(shoeIds.map(String)));
  if (unique.length === 0) return {};
  const db = getClientDb();
  const result: Record<string, number> = {};
  await Promise.all(
    chunk(unique, 10).map(async (ids) => {
      const snap = await getDocs(
        query(collection(db, "asks"), where("shoeId", "in", ids), where("status", "==", "active"))
      );
      snap.docs.forEach((d) => {
        const data = d.data() as Ask;
        const key = String(data.shoeId);
        if (result[key] === undefined || data.price < result[key]) result[key] = data.price;
      });
    })
  );
  return result;
}

export async function getSoldCountsForShoes(shoeIds: (string | number)[]): Promise<Record<string, number>> {
  const unique = Array.from(new Set(shoeIds.map(String)));
  if (unique.length === 0) return {};
  const db = getClientDb();
  const result: Record<string, number> = {};
  await Promise.all(
    chunk(unique, 10).map(async (ids) => {
      const snap = await getDocs(query(collection(db, "sales"), where("shoeId", "in", ids)));
      snap.docs.forEach((d) => {
        const key = String((d.data() as Sale).shoeId);
        result[key] = (result[key] || 0) + 1;
      });
    })
  );
  return result;
}

export async function getLastSale(shoeId: string): Promise<Sale | null> {
  const db = getClientDb();
  const snap = await getDocs(
    query(collection(db, "sales"), where("shoeId", "==", shoeId), orderBy("createdAt", "desc"), limit(1))
  );
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Sale;
}

// Trending = most-sold shoes among the last 200 trades, falls back to an empty
// list (never fabricated) when the marketplace has no sales history yet.
export async function getTrendingShoeIds(max = 8): Promise<string[]> {
  const db = getClientDb();
  const snap = await getDocs(query(collection(db, "sales"), orderBy("createdAt", "desc"), limit(200)));
  const counts = new Map<string, number>();
  snap.docs.forEach((d) => {
    const key = String((d.data() as Sale).shoeId);
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([id]) => id);
}

// ─── ACCOUNT / ADMIN LISTS ──────────────────────────────────────────────────

export async function getMyOffers(buyerId: string): Promise<Offer[]> {
  const db = getClientDb();
  const snap = await getDocs(
    query(collection(db, "offers"), where("buyerId", "==", buyerId), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Offer));
}

export async function getMyAsks(sellerId: string): Promise<Ask[]> {
  const db = getClientDb();
  const snap = await getDocs(
    query(collection(db, "asks"), where("sellerId", "==", sellerId), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Ask));
}

export async function getMySales(uid: string): Promise<Sale[]> {
  const db = getClientDb();
  const [asBuyer, asSeller] = await Promise.all([
    getDocs(query(collection(db, "sales"), where("buyerId", "==", uid), orderBy("createdAt", "desc"))),
    getDocs(query(collection(db, "sales"), where("sellerId", "==", uid), orderBy("createdAt", "desc"))),
  ]);
  const map = new Map<string, Sale>();
  [...asBuyer.docs, ...asSeller.docs].forEach((d) => map.set(d.id, { id: d.id, ...d.data() } as Sale));
  return Array.from(map.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getAllActiveAsks(): Promise<Ask[]> {
  const db = getClientDb();
  const snap = await getDocs(
    query(collection(db, "asks"), where("status", "==", "active"), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Ask));
}

export async function getAllActiveOffers(): Promise<Offer[]> {
  const db = getClientDb();
  const snap = await getDocs(
    query(collection(db, "offers"), where("status", "==", "active"), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Offer));
}

export async function getAllSales(): Promise<Sale[]> {
  const db = getClientDb();
  const snap = await getDocs(query(collection(db, "sales"), orderBy("createdAt", "desc"), limit(200)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Sale));
}

// ─── FOLLOW / WISHLIST ──────────────────────────────────────────────────────

export async function toggleFollow(userId: string, shoeId: string): Promise<boolean> {
  const db = getClientDb();
  const snap = await getDocs(
    query(collection(db, "follows"), where("userId", "==", userId), where("shoeId", "==", shoeId), limit(1))
  );
  if (!snap.empty) {
    await deleteDoc(doc(db, "follows", snap.docs[0].id));
    return false;
  }
  await addDoc(collection(db, "follows"), { userId, shoeId, createdAt: nowIso() });
  return true;
}

export async function getFollowedShoeIds(userId: string): Promise<Set<string>> {
  const db = getClientDb();
  const snap = await getDocs(query(collection(db, "follows"), where("userId", "==", userId)));
  return new Set(snap.docs.map((d) => (d.data() as Follow).shoeId));
}
