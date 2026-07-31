import { motion } from "motion/react";
import { WEIGHT_MAX } from "@/lib/telemetry-types";

const R = 88;
const CX = 110;
const CY = 110;

function polar(angleDeg: number, r: number) {
  const a = ((angleDeg - 180) * Math.PI) / 180;
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
}

function arc(fromPct: number, toPct: number, r: number) {
  const a1 = fromPct * 180;
  const a2 = toPct * 180;
  const p1 = polar(a1, r);
  const p2 = polar(a2, r);
  return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${a2 - a1 > 180 ? 1 : 0} 1 ${p2.x} ${p2.y}`;
}

export function WeightGauge({ weight, limit }: { weight: number; limit: number }) {
  const pct = Math.max(0, Math.min(1, weight / WEIGHT_MAX));
  const limitPct = Math.max(0, Math.min(1, limit / WEIGHT_MAX));
  const warnPct = limitPct * 0.85;
  const angle = pct * 180;
  const tone =
    weight > limit ? "var(--destructive)" : weight >= limit * 0.85 ? "var(--warning)" : "var(--success)";

  return (
    <div className="relative mx-auto w-full max-w-[280px]">
      <svg viewBox="0 0 220 132" className="w-full">
        <path d={arc(0, 1, R)} stroke="var(--muted)" strokeWidth="16" fill="none" strokeLinecap="round" />
        <path d={arc(0, warnPct, R)} stroke="var(--success)" strokeWidth="16" fill="none" strokeLinecap="round" />
        <path d={arc(warnPct, limitPct, R)} stroke="var(--warning)" strokeWidth="16" fill="none" />
        <path d={arc(limitPct, 1, R)} stroke="var(--destructive)" strokeWidth="16" fill="none" strokeLinecap="round" />
        <motion.g
          animate={{ rotate: angle }}
          transition={{ type: "spring", stiffness: 60, damping: 14 }}
          style={{ originX: `${CX}px`, originY: `${CY}px` }}
        >
          <line x1={CX} y1={CY} x2={CX - R + 12} y2={CY} stroke={tone} strokeWidth="4" strokeLinecap="round" />
        </motion.g>
        <circle cx={CX} cy={CY} r="9" fill="var(--card)" stroke={tone} strokeWidth="3" />
      </svg>
      <div className="mt-1 flex justify-between font-mono text-[11px] text-muted-foreground">
        <span>0 g</span>
        <span>{WEIGHT_MAX} g</span>
      </div>
    </div>
  );
}
