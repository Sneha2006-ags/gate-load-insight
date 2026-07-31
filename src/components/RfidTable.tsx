import { Download, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { exportCsv, rfidHeaders, rfidRows } from "@/lib/export";
import { prettyUid, prettyVehicle, type RfidLog } from "@/lib/telemetry-types";

export function RfidTable({
  logs,
  loading,
  pageSize = 8,
  title = "RFID Scan History",
}: {
  logs: RfidLog[];
  loading?: boolean;
  pageSize?: number;
  title?: string;
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter((l) =>
      [l.uid, l.vehicle, l.gate, l.time, l.authorized ? "authorized" : "unauthorized"]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [logs, query]);

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
          onClick={() => exportCsv("rfid_logs.csv", rfidHeaders, rfidRows(filtered))}
        >
          <Download className="size-4" /> CSV
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          placeholder="Search UID, vehicle, gate status…"
          className="pl-9"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/60">
        <Table>
          <TableHeader>
            <TableRow className="bg-panel/60">
              <TableHead>Time</TableHead>
              <TableHead>RFID UID</TableHead>
              <TableHead>Vehicle Number</TableHead>
              <TableHead>Authorized</TableHead>
              <TableHead>Gate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : rows.map((l) => (
                  <TableRow key={`${l.id}-${l.time}`}>
                    <TableCell className="font-mono text-xs whitespace-nowrap">{l.time}</TableCell>
                    <TableCell className="font-mono text-xs">{prettyUid(l.uid)}</TableCell>
                    <TableCell className="font-mono text-xs">{prettyVehicle(l.vehicle)}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          l.authorized
                            ? "bg-success/15 text-success border-success/40"
                            : "bg-destructive/15 text-destructive border-destructive/40"
                        }
                        variant="outline"
                      >
                        {l.authorized ? "Authorized" : "Unauthorized"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          l.gate === "OPEN"
                            ? "font-mono text-xs text-success"
                            : "font-mono text-xs text-destructive"
                        }
                      >
                        {l.gate}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                  No scans match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>
          {filtered.length} record{filtered.length === 1 ? "" : "s"} · page {current + 1} of {pages}
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
