import { Status } from "@/types/patient";
import { cn } from "@/lib/utils";

interface IVBagProps {
  fillPct: number; // 0-1
  status: Status;
  className?: string;
}

export const IVBag = ({ fillPct, status, className }: IVBagProps) => {
  const fillHeight = Math.max(0, Math.min(100, fillPct * 100));

  const fluidColor =
    status === "critical" || status === "empty"
      ? "hsl(var(--iv-fluid-critical))"
      : status === "warning"
      ? "hsl(var(--iv-fluid-warning))"
      : "hsl(var(--iv-fluid))";

  const fluidColorTop =
    status === "critical" || status === "empty"
      ? "hsl(var(--iv-fluid-critical) / 0.6)"
      : status === "warning"
      ? "hsl(var(--iv-fluid-warning) / 0.6)"
      : "hsl(var(--iv-fluid) / 0.6)";

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      {/* Hanger */}
      <div className="h-3 w-6 rounded-t-md border-2 border-b-0 border-muted-foreground/40" />
      {/* Bag */}
      <div className="relative w-20 h-32 rounded-2xl border-2 border-muted-foreground/30 bg-secondary/40 overflow-hidden shadow-inner">
        {/* Fluid */}
        <div
          className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-linear"
          style={{
            height: `${fillHeight}%`,
            background: `linear-gradient(180deg, ${fluidColorTop}, ${fluidColor})`,
          }}
        >
          {/* Wave */}
          <div
            className="absolute -top-1 left-0 right-0 h-2 fluid-wave"
            style={{
              background: `radial-gradient(circle at 25% 100%, transparent 6px, ${fluidColorTop} 7px), radial-gradient(circle at 75% 100%, transparent 6px, ${fluidColorTop} 7px)`,
            }}
          />
        </div>
        {/* Markings */}
        <div className="absolute inset-y-2 right-1.5 flex flex-col justify-between">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-px w-2 bg-muted-foreground/40" />
          ))}
        </div>
        {/* Label */}
        <div className="absolute top-1.5 left-1.5 text-[8px] font-bold tracking-widest text-muted-foreground/70">
          IV
        </div>
      </div>
      {/* Drip chamber */}
      <div className="w-3 h-4 border-2 border-t-0 border-muted-foreground/30 rounded-b-md bg-card" />
      {/* Tube */}
      <div className="w-0.5 h-4 bg-muted-foreground/30" />
    </div>
  );
};
