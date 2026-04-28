import { useEffect, useMemo, useState } from "react";
import { Patient, getRemaining, getStatus } from "@/types/patient";
import { PatientCard } from "@/components/PatientCard";
import { AddPatientDialog } from "@/components/AddPatientDialog";
import { IVAlertDialog } from "@/components/AlertDialog";
import { speak } from "@/lib/voice";
import { Activity, Droplets } from "lucide-react";
import { toast } from "sonner";

const SAMPLE: Patient[] = (() => {
  const now = Date.now();
  const h = (n: number) => n * 60 * 60 * 1000;
  return [
    {
      id: "p1",
      name: "Sarah Johnson",
      room: "201A",
      totalVolume: 500,
      startTime: now - h(3.5), // ~12% remaining of 4h
      durationMs: h(4),
      refills: [],
      acknowledged: "none",
    },
    {
      id: "p2",
      name: "Michael Chen",
      room: "204B",
      totalVolume: 1000,
      startTime: now - h(1),
      durationMs: h(6),
      refills: [],
      acknowledged: "none",
    },
    {
      id: "p3",
      name: "Emma Williams",
      room: "210",
      totalVolume: 500,
      startTime: now - h(3.7), // ~7% — critical
      durationMs: h(4),
      refills: [],
      acknowledged: "none",
    },
    {
      id: "p4",
      name: "David Martinez",
      room: "215C",
      totalVolume: 750,
      startTime: now - h(0.5),
      durationMs: h(5),
      refills: [],
      acknowledged: "none",
    },
  ];
})();

const Index = () => {
  const [patients, setPatients] = useState<Patient[]>(SAMPLE);
  const [now, setNow] = useState(Date.now());
  const [activeAlert, setActiveAlert] = useState<{ patient: Patient; level: "warning" | "critical" } | null>(null);

  // Auto-update timer every second
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Alert detection
  useEffect(() => {
    setPatients((prev) => {
      let changed = false;
      const next = prev.map((p) => {
        const { remainingPct } = getRemaining(p, now);
        const status = getStatus(remainingPct);
        if (status === "critical" || status === "empty") {
          if (p.acknowledged !== "critical") {
            if (!activeAlert) {
              setActiveAlert({ patient: p, level: "critical" });
              speak(`Critical alert. Patient ${p.name} in room ${p.room} needs immediate attention.`);
              toast.error(`Critical: ${p.name} (Room ${p.room})`);
            }
            changed = true;
            return { ...p, acknowledged: "critical" as const };
          }
        } else if (status === "warning") {
          if (p.acknowledged === "none") {
            if (!activeAlert) {
              setActiveAlert({ patient: p, level: "warning" });
              speak(`Warning. Patient ${p.name} in room ${p.room} IV is running low.`);
              toast.warning(`Warning: ${p.name} (Room ${p.room})`);
            }
            changed = true;
            return { ...p, acknowledged: "warning" as const };
          }
        }
        return p;
      });
      return changed ? next : prev;
    });
  }, [now, activeAlert]);

  const stats = useMemo(() => {
    let normal = 0, warning = 0, critical = 0;
    patients.forEach((p) => {
      const s = getStatus(getRemaining(p, now).remainingPct);
      if (s === "normal") normal++;
      else if (s === "warning") warning++;
      else critical++;
    });
    return { normal, warning, critical, total: patients.length };
  }, [patients, now]);

  const handleAdd = (data: Omit<Patient, "id" | "refills" | "acknowledged">) => {
    setPatients((p) => [
      ...p,
      { ...data, id: crypto.randomUUID(), refills: [], acknowledged: "none" },
    ]);
    toast.success(`${data.name} added to Room ${data.room}`);
  };

  const handleRefill = (id: string) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              startTime: Date.now(),
              acknowledged: "none",
              refills: [...p.refills, { timestamp: Date.now(), volume: p.totalVolume }],
            }
          : p
      )
    );
    if (activeAlert?.patient.id === id) setActiveAlert(null);
    toast.success("IV refilled and timer reset");
  };

  const handleRemove = (id: string) => {
    setPatients((p) => p.filter((x) => x.id !== id));
    if (activeAlert?.patient.id === id) setActiveAlert(null);
  };

  const handleAcknowledge = () => setActiveAlert(null);

  // Sort: critical → warning → normal
  const sorted = useMemo(() => {
    const order = { critical: 0, empty: 0, warning: 1, normal: 2 };
    return [...patients].sort((a, b) => {
      const sa = getStatus(getRemaining(a, now).remainingPct);
      const sb = getStatus(getRemaining(b, now).remainingPct);
      return order[sa] - order[sb];
    });
  }, [patients, now]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
              <Droplets className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">IV Monitor</h1>
              <p className="text-xs text-muted-foreground">Hospital Fluid Dashboard</p>
            </div>
          </div>
          <AddPatientDialog onAdd={handleAdd} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total Patients" value={stats.total} icon={<Activity className="h-4 w-4" />} />
          <StatCard label="Normal" value={stats.normal} dot="bg-success" />
          <StatCard label="Warning" value={stats.warning} dot="bg-warning" />
          <StatCard label="Critical" value={stats.critical} dot="bg-critical" highlight={stats.critical > 0} />
        </section>

        {/* Grid */}
        {sorted.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Droplets className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No patients yet. Add one to start monitoring.</p>
          </div>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((p) => (
              <PatientCard
                key={p.id}
                patient={p}
                now={now}
                onRefill={handleRefill}
                onRemove={handleRemove}
              />
            ))}
          </section>
        )}
      </main>

      <IVAlertDialog
        patient={activeAlert?.patient ?? null}
        level={activeAlert?.level ?? null}
        onAcknowledge={handleAcknowledge}
        onRefill={() => activeAlert && handleRefill(activeAlert.patient.id)}
      />
    </div>
  );
};

const StatCard = ({
  label,
  value,
  icon,
  dot,
  highlight,
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
  dot?: string;
  highlight?: boolean;
}) => (
  <div
    className={`rounded-xl border bg-card p-4 ${
      highlight ? "border-critical/50 shadow-[0_0_0_1px_hsl(var(--critical)/0.2)]" : ""
    }`}
  >
    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
      {icon}
      {dot && <span className={`h-2 w-2 rounded-full ${dot}`} />}
      {label}
    </div>
    <div className="text-2xl font-semibold tabular-nums">{value}</div>
  </div>
);

export default Index;
