import { motion } from "motion/react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  icon,
  children,
  loading,
  className,
  delay = 0,
}: {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
  loading?: boolean;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
    >
      <Card className={cn("card-industrial gap-3 rounded-2xl p-5", className)}>
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </p>
          {icon && <span className="shrink-0 text-primary">{icon}</span>}
        </div>
        {loading ? <Skeleton className="h-9 w-3/4" /> : children}
      </Card>
    </motion.div>
  );
}
