export interface Shoe {
  id: string | number;
  name: string;
  brand: string;
  price: number;
  category: string;
  description: string;
  image_url: string;
  color: string;
  sizes: string[];
  colors: string[];
  additional_images?: string[];
  styleCode?: string;
  releaseDate?: string;
  retailPrice?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem extends Shoe {
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

// A trade that has already been matched (via Buy Now or an accepted offer) and is
// waiting to be handed off to Apex Soles over WhatsApp for payment/delivery.
// This is intentionally NOT a CartItem: the price is a locked-in trade price
// (not the catalog price) and quantity is always 1 (a resale trade is one pair).
export interface TradeCartItem {
  saleId: string;
  shoeId: string | number;
  name: string;
  image_url: string;
  size: string;
  condition: 'new' | 'used';
  price: number;
}

export interface Brand {
  id: string | number;
  name: string;
  logo: string;
  description: string;
  founded_year?: number;
  country?: string;
  website?: string;
  featured: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  category: string;
  date: string;
  image: string;
  excerpt: string;
  content: string;
  author: string;
  createdAt?: string;
  updatedAt?: string;
}

export type AskStatus = 'active' | 'sold' | 'cancelled';
export type OfferStatus = 'active' | 'matched' | 'cancelled' | 'expired';
export type FulfillmentStatus = 'pending' | 'contacted' | 'shipped' | 'completed' | 'cancelled';

// A live sell listing for one shoe/size. sellerName is a point-in-time snapshot
// of the seller's display name at the moment they listed — not a live reference.
export interface Ask {
  id: string;
  shoeId: string;
  size: string;
  condition: 'new' | 'used';
  price: number;
  sellerId: string;
  sellerName: string;
  sellerType: 'admin' | 'user';
  status: AskStatus;
  createdAt: string;
}

// A live buy bid for one shoe/size. buyerName is a point-in-time snapshot,
// same caveat as Ask.sellerName.
export interface Offer {
  id: string;
  shoeId: string;
  size: string;
  price: number;
  buyerId: string;
  buyerName: string;
  status: OfferStatus;
  createdAt: string;
}

// A closed trade (either instantly via Buy Now, or a matched bid/ask).
// askId/offerId reference whichever side was the "resting" order that got
// filled — one of them may be null (e.g. Buy Now has no offer).
export interface Sale {
  id: string;
  shoeId: string;
  size: string;
  condition: 'new' | 'used';
  price: number;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  askId: string | null;
  offerId: string | null;
  fulfillmentStatus: FulfillmentStatus;
  createdAt: string;
}

export interface Follow {
  id: string;
  userId: string;
  shoeId: string;
  createdAt: string;
}
