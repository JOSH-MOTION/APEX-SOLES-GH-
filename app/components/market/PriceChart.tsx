"use client";

import { Sale } from "@/types";

interface PriceChartProps {
  sales: Sale[];
  height?: number;
}

// Hand-rolled SVG sparkline — no charting library in this project, and the
// sales history starts empty for a new marketplace, so this stays intentionally
// simple rather than pulling in a dependency for a chart that's often sparse.
export const PriceChart = ({ sales, height = 120 }: PriceChartProps) => {
  if (sales.length < 2) {
    return (
      <div
        className="flex items-center justify-center bg-white/5 rounded-xl border border-white/10 text-gray-500 text-[10px] font-black uppercase tracking-widest"
        style={{ height }}
      >
        {sales.length === 0 ? "No Sales Yet" : "Not Enough Data Yet"}
      </div>
    );
  }

  const chronological = [...sales].reverse();
  const prices = chronological.map((s) => s.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const width = 400;
  const padding = 8;

  const points = chronological.map((s, i) => {
    const x = (i / (chronological.length - 1)) * (width - padding * 2) + padding;
    const y = height - padding - ((s.price - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const areaPoints = `${padding},${height - padding} ${points.join(" ")} ${width - padding},${height - padding}`;

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
        <polygon points={areaPoints} fill="#c6ff00" fillOpacity="0.08" />
        <polyline points={points.join(" ")} fill="none" stroke="#c6ff00" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <div className="flex justify-between mt-2 text-[9px] font-black uppercase tracking-widest text-gray-500">
        <span>GH¢ {min.toLocaleString()}</span>
        <span>{chronological.length} Trades</span>
        <span>GH¢ {max.toLocaleString()}</span>
      </div>
    </div>
  );
};
