import { Patient } from "@/types/patient";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, AlertOctagon } from "lucide-react";
import { cn } from "@/lib/utils";

interface IVAlertDialogProps {
  patient: Patient | null;
  level: "warning" | "critical" | null;
  onAcknowledge: () => void;
  onRefill: () => void;
}

export const IVAlertDialog = ({ patient, level, onAcknowledge, onRefill }: IVAlertDialogProps) => {
  const isCritical = level === "critical";
  const Icon = isCritical ? AlertOctagon : AlertTriangle;

  return (
    <Dialog open={!!patient} onOpenChange={(o) => !o && onAcknowledge()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div
            className={cn(
              "mx-auto h-14 w-14 rounded-full flex items-center justify-center mb-2",
              isCritical ? "bg-critical/10 text-critical pulse-critical" : "bg-warning/10 text-warning"
            )}
          >
            <Icon className="h-7 w-7" />
          </div>
          <DialogTitle className="text-center text-xl">
            {isCritical ? "Critical IV Level" : "IV Warning"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {patient && (
              <>
                <span className="font-semibold text-foreground">{patient.name}</span> in
                Room <span className="font-semibold text-foreground">{patient.room}</span>
                <br />
                IV fluid is {isCritical ? "below 10%" : "below 20%"} — please attend immediately.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button variant="outline" onClick={onAcknowledge} className="w-full sm:w-auto">
            Acknowledge
          </Button>
          <Button onClick={onRefill} className="w-full sm:w-auto">
            Mark as Refilled
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
