import { Link } from "react-router-dom";
import { Package, MapPin, ShoppingCart, Calculator, Trophy, Clock, BarChart3, Building2, BellRing, Flame } from "lucide-react";

const features = [
  { to: "/calories", icon: Flame, title: "Calories", desc: "Track daily intake", color: "text-primary", bg: "bg-primary/10" },
  { to: "/tracker", icon: BarChart3, title: "Tracker", desc: "Waste analytics", color: "text-success", bg: "bg-success/10" },
  { to: "/pantry", icon: Package, title: "Smart Pantry", desc: "Track expiry dates", color: "text-primary", bg: "bg-primary/10" },
  { to: "/share", icon: MapPin, title: "Food Drop", desc: "Share with neighbors", color: "text-warning", bg: "bg-warning/10" },
  { to: "/foodbank", icon: Building2, title: "Foodbank", desc: "NGO donations", color: "text-earth", bg: "bg-earth/10" },
  { to: "/shopping", icon: ShoppingCart, title: "Smart Shopping", desc: "Waste-aware lists", color: "text-success", bg: "bg-success/10" },
  { to: "/portions", icon: Calculator, title: "Portions", desc: "Zero leftover calc", color: "text-earth", bg: "bg-earth/10" },
  { to: "/history", icon: Clock, title: "History", desc: "Past meals & recipes", color: "text-accent", bg: "bg-accent/10" },
  { to: "/reminders", icon: BellRing, title: "Reminders", desc: "Weekly food checks", color: "text-blue-500", bg: "bg-blue-500/10" },
  { to: "/leaderboard", icon: Trophy, title: "Leaderboard", desc: "Rank among savers", color: "text-streak", bg: "bg-streak/10" },
  { to: "/weekly-report", icon: BarChart3, title: "Weekly Report", desc: "Nutrition & waste", color: "text-primary", bg: "bg-primary/10" },
];

export default function More() {
  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
      <div className="animate-fade-up">
        <h2 className="text-2xl font-bold text-foreground text-balance">More Tools</h2>
        <p className="text-muted-foreground mt-1">Everything to fight food waste</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {features.map((f, i) => (
          <Link
            key={f.to}
            to={f.to}
            className="flex flex-col items-center gap-2 bg-card border rounded-2xl p-4 transition-all duration-200 active:scale-[0.95] hover:shadow-md animate-fade-up"
            style={{ animationDelay: `${(i + 1) * 60}ms` }}
          >
            <div className={`${f.bg} rounded-2xl p-4`}>
              <f.icon className={f.color} size={28} />
            </div>
            <span className="text-xs font-semibold text-foreground text-center leading-tight">{f.title}</span>
            <span className="text-[10px] text-muted-foreground text-center leading-tight">{f.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
