import { Patient, getRemaining, getStatus, formatDuration } from "@/types/patient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IVBag } from "./IVBag";
import { Droplet, Clock, MapPin, RotateCcw, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PatientCardProps {
  patient: Patient;
  now: number;
  onRefill: (id: string) => void;
  onRemove: (id: string) => void;
}

export const PatientCard = ({ patient, now, onRefill, onRemove }: PatientCardProps) => {
  const { remainingMs, remainingPct, remainingVolume } = getRemaining(patient, now);
  const status = getStatus(remainingPct);

  const statusConfig = {
    normal: { label: "Normal", className: "bg-success text-success-foreground" },
    warning: { label: "Warning", className: "bg-warning text-warning-foreground" },
    critical: { label: "Critical", className: "bg-critical text-critical-foreground pulse-critical" },
    empty: { label: "Empty", className: "bg-critical text-critical-foreground pulse-critical" },
  }[status];

  const lastRefill = patient.refills[patient.refills.length - 1];

  return (
    <Card
      className={cn(
        "p-5 transition-all hover:shadow-[var(--shadow-elevated)]",
        status === "critical" || status === "empty" ? "border-critical/40" : "",
        status === "warning" ? "border-warning/40" : ""
      )}
    >
      <div className="flex gap-5">
        <IVBag fillPct={remainingPct} status={status} />

        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-base truncate">{patient.name}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                Room {patient.room}
              </div>
            </div>
            <Badge className={cn("shrink-0", statusConfig.className)}>
              {statusConfig.label}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Droplet className="h-3.5 w-3.5" />
              <span className="font-medium text-foreground">
                {Math.round(remainingVolume)}
              </span>
              <span className="text-xs">/ {patient.totalVolume}ml</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-mono font-medium text-foreground tabular-nums">
                {formatDuration(remainingMs)}
              </span>
            </div>
          </div>

          {lastRefill && (
            <p className="text-xs text-muted-foreground">
              Last refill: {new Date(lastRefill.timestamp).toLocaleTimeString()}
              {patient.refills.length > 1 && ` · ${patient.refills.length} total`}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              variant={status === "normal" ? "outline" : "default"}
              className="flex-1 gap-1.5"
              onClick={() => onRefill(patient.id)}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Refilled
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRemove(patient.id)}
              aria-label="Remove patient"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
