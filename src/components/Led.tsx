import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function Led({
  on,
  color,
  label,
  size = "md",
}: {
  on: boolean;
  color: "green" | "red";
  label?: string;
  size?: "sm" | "md" | "lg";
}) {
  const dim = size === "lg" ? "size-16" : size === "md" ? "size-10" : "size-4";
  const tone = color === "green" ? "var(--success)" : "var(--destructive)";

  return (
    <div className="flex items-center gap-3">
      <motion.span
        className={cn("relative grid shrink-0 place-items-center rounded-full", dim)}
        style={{ background: on ? tone : "var(--muted)" }}
        animate={
          on
            ? { boxShadow: [`0 0 8px ${tone}`, `0 0 32px ${tone}`, `0 0 8px ${tone}`], opacity: 1 }
            : { boxShadow: "0 0 0px transparent", opacity: 0.45 }
        }
        transition={{ duration: 1.4, repeat: on ? Infinity : 0 }}
      >
        <span className="absolute inset-[18%] rounded-full bg-white/25 blur-[2px]" />
      </motion.span>
      {label && (
        <span className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      )}
    </div>
  );
}
