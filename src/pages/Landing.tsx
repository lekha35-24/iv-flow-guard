import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Activity, Bell, Droplets, ShieldCheck, Volume2, Zap } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b bg-card/60 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
              <Droplets className="h-5 w-5" />
            </div>
            <span className="font-semibold">IV Monitor</span>
          </div>
          <Button asChild size="sm">
            <Link to="/dashboard">Open Dashboard</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-16 sm:py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border bg-accent/50 px-3 py-1 text-xs text-accent-foreground mb-6">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          Real-time fluid monitoring
        </div>
        <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight max-w-3xl mx-auto leading-[1.1]">
          Never miss an empty IV bag again.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          A clean, hospital-grade dashboard for nurses to track IV fluid levels,
          receive instant alerts, and refill on time — even when the screen is locked.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button asChild size="lg" className="gap-2">
            <Link to="/dashboard">
              Open Dashboard <Zap className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Preview */}
        <div className="mt-16 mx-auto max-w-3xl rounded-2xl border bg-card p-6 shadow-[var(--shadow-elevated)]">
          <div className="grid grid-cols-3 gap-4 text-left">
            {[
              { name: "Sarah J.", room: "201A", status: "Critical", color: "bg-critical" },
              { name: "Michael C.", room: "204B", status: "Normal", color: "bg-success" },
              { name: "Emma W.", room: "210", status: "Warning", color: "bg-warning" },
            ].map((p) => (
              <div key={p.name} className="rounded-xl border p-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  Room {p.room}
                  <span className={`h-2 w-2 rounded-full ${p.color}`} />
                </div>
                <div className="mt-2 font-medium text-sm">{p.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">{p.status}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { icon: Activity, title: "Live timers", desc: "Auto-updating countdowns and remaining volume for every patient." },
          { icon: Bell, title: "Instant alerts", desc: "Popups when IV drops below 20% (warning) and 10% (critical)." },
          { icon: Volume2, title: "Voice notifications", desc: "Spoken alerts plus browser notifications — even when the tab is hidden." },
          { icon: ShieldCheck, title: "Refill log", desc: "One-click 'Refilled' resets the timer and logs the timestamp." },
          { icon: Droplets, title: "Animated IV bag", desc: "See fluid level at a glance with a realistic, color-coded bag." },
          { icon: Zap, title: "Search & filter", desc: "Find any patient by name, room, status, or alert state." },
        ].map((f) => (
          <div key={f.title} className="rounded-xl border bg-card p-5">
            <div className="h-9 w-9 rounded-lg bg-accent text-accent-foreground flex items-center justify-center mb-3">
              <f.icon className="h-4 w-4" />
            </div>
            <h3 className="font-semibold">{f.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-20">
        <div className="rounded-2xl bg-primary text-primary-foreground p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold">Start monitoring in seconds</h2>
          <p className="mt-2 opacity-90">No setup. No accounts. Built for clinical workflows.</p>
          <Button asChild size="lg" variant="secondary" className="mt-6">
            <Link to="/dashboard">Open Dashboard</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} IV Monitor — Hospital Fluid Dashboard
      </footer>
    </div>
  );
};

export default Landing;
