import { useEffect, useMemo, useState } from "react";
import { Patient, getRemaining, getStatus, Status } from "@/types/patient";
import { PatientCard } from "@/components/PatientCard";
import { AddPatientDialog } from "@/components/AddPatientDialog";
import { IVAlertDialog } from "@/components/AlertDialog";
import { FiltersBar, StatusFilter, AlertFilter } from "@/components/FiltersBar";
import { speak, notify, requestNotificationPermission } from "@/lib/voice";
import { Activity, Bell, BellOff, Droplets } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const SAMPLE: Patient[] = (() => {
  const now = Date.now();
  const h = (n: number) => n * 60 * 60 * 1000;
  return [
    { id: "p1", name: "Sarah Johnson", room: "201A", totalVolume: 500, startTime: now - h(3.5), durationMs: h(4), refills: [], acknowledged: "none" },
    { id: "p2", name: "Michael Chen", room: "204B", totalVolume: 1000, startTime: now - h(1), durationMs: h(6), refills: [], acknowledged: "none" },
    { id: "p3", name: "Emma Williams", room: "210", totalVolume: 500, startTime: now - h(3.7), durationMs: h(4), refills: [], acknowledged: "none" },
    { id: "p4", name: "David Martinez", room: "215C", totalVolume: 750, startTime: now - h(0.5), durationMs: h(5), refills: [], acknowledged: "none" },
  ];
})();

const Index = () => {
  const [patients, setPatients] = useState<Patient[]>(SAMPLE);
  const [now, setNow] = useState(Date.now());
  const [activeAlert, setActiveAlert] = useState<{ patient: Patient; level: "warning" | "critical" } | null>(null);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [alertFilter, setAlertFilter] = useState<AlertFilter>("all");

  const [notifPerm, setNotifPerm] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );

  // Tick every second
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Ask for notification permission on first load
  useEffect(() => {
    requestNotificationPermission().then(setNotifPerm);
  }, []);

  // Alert detection — popup + voice + notification ALWAYS fire together for the SAME patient
  useEffect(() => {
    if (activeAlert) return; // wait until current alert is acknowledged

    // Find first un-acknowledged critical, then warning
    let target: { patient: Patient; level: "warning" | "critical" } | null = null;
    for (const p of patients) {
      const status = getStatus(getRemaining(p, now).remainingPct);
      if ((status === "critical" || status === "empty") && p.acknowledged !== "critical") {
        target = { patient: p, level: "critical" };
        break;
      }
    }
    if (!target) {
      for (const p of patients) {
        const status = getStatus(getRemaining(p, now).remainingPct);
        if (status === "warning" && p.acknowledged === "none") {
          target = { patient: p, level: "warning" };
          break;
        }
      }
    }
    if (!target) return;

    const { patient: p, level } = target;
    if (level === "critical") {
      speak(`Critical alert. Patient ${p.name} in room ${p.room} needs immediate attention.`);
      notify("🚨 Critical IV Level", `${p.name} — Room ${p.room}: below 10%`, true);
      toast.error(`Critical: ${p.name} (Room ${p.room})`);
    } else {
      speak(`Warning. Patient ${p.name} in room ${p.room} IV is running low.`);
      notify("⚠️ IV Warning", `${p.name} — Room ${p.room}: below 20%`, false);
      toast.warning(`Warning: ${p.name} (Room ${p.room})`);
    }
    setActiveAlert(target);
    setPatients((prev) =>
      prev.map((x) => (x.id === p.id ? { ...x, acknowledged: level } : x))
    );
  }, [now, activeAlert, patients]);

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

  // Apply filters + search
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const order: Record<Status, number> = { critical: 0, empty: 0, warning: 1, normal: 2 };
    return patients
      .map((p) => ({ p, status: getStatus(getRemaining(p, now).remainingPct) }))
      .filter(({ p, status }) => {
        if (q && !p.name.toLowerCase().includes(q) && !p.room.toLowerCase().includes(q)) return false;
        if (statusFilter !== "all") {
          if (statusFilter === "critical" && status !== "critical" && status !== "empty") return false;
          if (statusFilter === "warning" && status !== "warning") return false;
          if (statusFilter === "normal" && status !== "normal") return false;
        }
        if (alertFilter === "alerting" && p.acknowledged === "none" && status === "normal") return false;
        if (alertFilter === "alerting" && status === "normal") return false;
        if (alertFilter === "ok" && (status === "warning" || status === "critical" || status === "empty")) return false;
        return true;
      })
      .sort((a, b) => order[a.status] - order[b.status])
      .map(({ p }) => p);
  }, [patients, now, query, statusFilter, alertFilter]);

  const handleAdd = (data: Omit<Patient, "id" | "refills" | "acknowledged">) => {
    setPatients((p) => [...p, { ...data, id: crypto.randomUUID(), refills: [], acknowledged: "none" }]);
    toast.success(`${data.name} added to Room ${data.room}`);
  };

  const handleRefill = (id: string) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, startTime: Date.now(), acknowledged: "none", refills: [...p.refills, { timestamp: Date.now(), volume: p.totalVolume }] }
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

  const enableNotifications = async () => {
    const perm = await requestNotificationPermission();
    setNotifPerm(perm);
    if (perm === "granted") {
      toast.success("Background alerts enabled");
      notify("IV Monitor", "You'll receive alerts even when this tab is hidden.");
    } else {
      toast.error("Notifications blocked. Enable them in browser settings.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
              <Droplets className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">IV Monitor</h1>
              <p className="text-xs text-muted-foreground">Hospital Fluid Dashboard</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            {notifPerm !== "granted" && (
              <Button variant="outline" size="sm" onClick={enableNotifications} className="gap-1.5">
                {notifPerm === "denied" ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                <span className="hidden sm:inline">Enable alerts</span>
              </Button>
            )}
            <AddPatientDialog onAdd={handleAdd} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total Patients" value={stats.total} icon={<Activity className="h-4 w-4" />} />
          <StatCard label="Normal" value={stats.normal} dot="bg-success" />
          <StatCard label="Warning" value={stats.warning} dot="bg-warning" />
          <StatCard label="Critical" value={stats.critical} dot="bg-critical" highlight={stats.critical > 0} />
        </section>

        <FiltersBar
          query={query}
          onQuery={setQuery}
          status={statusFilter}
          onStatus={setStatusFilter}
          alert={alertFilter}
          onAlert={setAlertFilter}
          counts={{ all: stats.total, normal: stats.normal, warning: stats.warning, critical: stats.critical }}
        />

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Droplets className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>{patients.length === 0 ? "No patients yet. Add one to start monitoring." : "No patients match these filters."}</p>
          </div>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <PatientCard key={p.id} patient={p} now={now} onRefill={handleRefill} onRemove={handleRemove} />
            ))}
          </section>
        )}
      </main>

      <IVAlertDialog
        patient={activeAlert?.patient ?? null}
        level={activeAlert?.level ?? null}
        onAcknowledge={() => setActiveAlert(null)}
        onRefill={() => activeAlert && handleRefill(activeAlert.patient.id)}
      />
    </div>
  );
};

const StatCard = ({
  label, value, icon, dot, highlight,
}: { label: string; value: number; icon?: React.ReactNode; dot?: string; highlight?: boolean }) => (
  <div className={`rounded-xl border bg-card p-4 ${highlight ? "border-critical/50 shadow-[0_0_0_1px_hsl(var(--critical)/0.2)]" : ""}`}>
    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
      {icon}
      {dot && <span className={`h-2 w-2 rounded-full ${dot}`} />}
      {label}
    </div>
    <div className="text-2xl font-semibold tabular-nums">{value}</div>
  </div>
);

export default Index;
