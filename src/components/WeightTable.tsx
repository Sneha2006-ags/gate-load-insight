import { Download, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { exportCsv, weightHeaders, weightRows } from "@/lib/export";
import type { WeightLog } from "@/lib/telemetry-types";

export function WeightTable({
  logs,
  loading,
  pageSize = 8,
  title = "Weight History",
}: {
  logs: WeightLog[];
  loading?: boolean;
  pageSize?: number;
  title?: string;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return logs
      .slice()
      .reverse()
      .filter((l) => (status === "ALL" ? true : l.status === status))
      .filter((l) =>
        q ? [l.time, l.weight, l.status, l.led, l.limit].join(" ").toLowerCase().includes(q) : true,
      );
  }, [logs, query, status]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pages - 1);
  const rows = filtered.slice(current * pageSize, current * pageSize + pageSize);

  return (
    <Card className="card-industrial gap-4 rounded-2xl p-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
        <h2 className="truncate font-display text-base font-semibold">{title}</h2>
        <Button
          size="sm"
          variant="outline"
          className="shrink-0"
          onClick={() => exportCsv("weight_logs.csv", weightHeaders, weightRows(filtered))}
        >
          <Download className="size-4" /> CSV
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            placeholder="Search weight, time, LED…"
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v);
            setPage(0);
          }}
        >
          <SelectTrigger className="sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="NORMAL">Normal</SelectItem>
            <SelectItem value="OVERLOAD">Overload</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/60">
        <Table>
          <TableHeader>
            <TableRow className="bg-panel/60">
              <TableHead>Timestamp</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Buzzer</TableHead>
              <TableHead>LED</TableHead>
              <TableHead>Limit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : rows.map((l) => (
                  <TableRow key={`${l.id}-${l.time}`}>
                    <TableCell className="font-mono text-xs whitespace-nowrap">{l.time}</TableCell>
                    <TableCell className="font-mono text-xs">{l.weight.toFixed(1)} g</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          l.status === "NORMAL"
                            ? "border-success/40 bg-success/15 text-success"
                            : "border-destructive/40 bg-destructive/15 text-destructive"
                        }
                      >
                        {l.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{l.buzzer ? "ON" : "OFF"}</TableCell>
                    <TableCell className="font-mono text-xs">{l.led}</TableCell>
                    <TableCell className="font-mono text-xs">{l.limit} g</TableCell>
                  </TableRow>
                ))}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  No readings match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>
          {filtered.length} reading{filtered.length === 1 ? "" : "s"} · page {current + 1} of {pages}
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={current === 0}
            onClick={() => setPage(current - 1)}
          >
            Previous
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={current >= pages - 1}
            onClick={() => setPage(current + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
}
