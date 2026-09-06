import { CheckCircle2, Timer, CalendarClock, type LucideIcon } from "lucide-react";
import { StockStatus } from "@/types";

// Shared so the card badge and the product page box never drift apart.
// A product with no stockStatus set (every pre-rebuild product) reads as
// 'in_stock' — that's the historical default, not a deliberate choice.
export function resolveStockStatus(stockStatus: StockStatus | undefined): StockStatus {
  return stockStatus || "in_stock";
}

export const STOCK_STATUS_CONFIG: Record<StockStatus, { label: string; Icon: LucideIcon; badgeClass: string }> = {
  in_stock: {
    label: "In Stock",
    Icon: CheckCircle2,
    badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  pre_order: {
    label: "Pre-Order",
    Icon: Timer,
    badgeClass: "bg-[#c6ff00]/15 text-[#c6ff00] border-[#c6ff00]/30",
  },
  coming_soon: {
    label: "Coming Soon",
    Icon: CalendarClock,
    badgeClass: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  },
};
