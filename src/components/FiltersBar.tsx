import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusFilter = "all" | "normal" | "warning" | "critical";
export type AlertFilter = "all" | "alerting" | "ok";

interface FiltersBarProps {
  query: string;
  onQuery: (v: string) => void;
  status: StatusFilter;
  onStatus: (v: StatusFilter) => void;
  alert: AlertFilter;
  onAlert: (v: AlertFilter) => void;
  counts: { all: number; normal: number; warning: number; critical: number };
}

export const FiltersBar = ({
  query,
  onQuery,
  status,
  onStatus,
  alert,
  onAlert,
  counts,
}: FiltersBarProps) => {
  const statusOpts: { value: StatusFilter; label: string; dot?: string; count: number }[] = [
    { value: "all", label: "All", count: counts.all },
    { value: "normal", label: "Green", dot: "bg-success", count: counts.normal },
    { value: "warning", label: "Yellow", dot: "bg-warning", count: counts.warning },
    { value: "critical", label: "Red", dot: "bg-critical", count: counts.critical },
  ];

  const alertOpts: { value: AlertFilter; label: string }[] = [
    { value: "all", label: "Any alert state" },
    { value: "alerting", label: "Alerting only" },
    { value: "ok", label: "Acknowledged / OK" },
  ];

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search by patient name or room…"
          className="pl-9 pr-9"
        />
        {query && (
          <button
            onClick={() => onQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {statusOpts.map((o) => (
          <button
            key={o.value}
            onClick={() => onStatus(o.value)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition",
              status === o.value
                ? "bg-foreground text-background border-foreground"
                : "bg-card hover:bg-accent"
            )}
          >
            {o.dot && <span className={cn("h-2 w-2 rounded-full", o.dot)} />}
            {o.label}
            <span className={cn("tabular-nums opacity-70", status === o.value && "opacity-90")}>
              {o.count}
            </span>
          </button>
        ))}

        <div className="ml-auto flex gap-1 rounded-full border bg-card p-1">
          {alertOpts.map((o) => (
            <button
              key={o.value}
              onClick={() => onAlert(o.value)}
              className={cn(
                "rounded-full px-3 py-1 text-xs transition",
                alert === o.value
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
