// Shared discount math so the card badge, product page, admin auto-ask, and
// pre-order deposit calculation never disagree with each other.
export interface EffectivePrice {
  original: number;
  final: number;
  hasDiscount: boolean;
  percent: number;
}

export function getEffectivePrice(price: number, discountPercent?: number): EffectivePrice {
  const percent = discountPercent && discountPercent > 0 && discountPercent < 100 ? discountPercent : 0;
  const final = percent > 0 ? Math.round(price * (1 - percent / 100)) : price;
  return { original: price, final, hasDiscount: percent > 0, percent };
}
