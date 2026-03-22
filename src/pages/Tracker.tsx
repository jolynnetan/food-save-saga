import { useState } from "react";
import { Plus, TrendingDown, Apple, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";

type FoodEntry = {
  id: number;
  name: string;
  emoji: string;
  amount: string;
  status: "consumed" | "wasted" | "saved";
  date: string;
};

const weekData = [
  { day: "Mon", saved: 0.6, wasted: 0.1 },
  { day: "Tue", saved: 0.8, wasted: 0.0 },
  { day: "Wed", saved: 0.4, wasted: 0.3 },
  { day: "Thu", saved: 0.9, wasted: 0.1 },
  { day: "Fri", saved: 0.5, wasted: 0.2 },
  { day: "Sat", saved: 0.7, wasted: 0.0 },
  { day: "Sun", saved: 0.3, wasted: 0.0 },
];

const initialEntries: FoodEntry[] = [
  { id: 1, name: "Chicken curry", emoji: "🍛", amount: "250g", status: "consumed", date: "Today" },
  { id: 2, name: "Brown rice", emoji: "🍚", amount: "150g", status: "saved", date: "Today" },
  { id: 3, name: "Salad greens", emoji: "🥗", amount: "80g", status: "wasted", date: "Yesterday" },
  { id: 4, name: "Banana bread", emoji: "🍞", amount: "200g", status: "consumed", date: "Yesterday" },
  { id: 5, name: "Leftover pasta", emoji: "🍝", amount: "180g", status: "saved", date: "Yesterday" },
];

const statusConfig = {
  consumed: { label: "Consumed", color: "text-foreground", bg: "bg-muted" },
  saved: { label: "Saved", color: "text-success", bg: "bg-success/10" },
  wasted: { label: "Wasted", color: "text-destructive", bg: "bg-destructive/10" },
};

export default function Tracker() {
  const [entries] = useState(initialEntries);
  const [showAdd, setShowAdd] = useState(false);

  const totalSaved = weekData.reduce((s, d) => s + d.saved, 0).toFixed(1);
  const totalWasted = weekData.reduce((s, d) => s + d.wasted, 0).toFixed(1);

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h2 className="text-2xl font-bold text-foreground text-balance">Food Tracker</h2>
          <p className="text-muted-foreground mt-1">Monitor your food habits</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-primary text-primary-foreground rounded-full p-2.5 shadow-lg shadow-primary/20 transition-all duration-200 active:scale-[0.9]"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 animate-fade-up" style={{ animationDelay: "80ms" }}>
        <div className="bg-success/10 rounded-2xl p-4">
          <Apple className="text-success mb-2" size={20} />
          <p className="text-2xl font-bold text-foreground tabular-nums">{totalSaved} kg</p>
          <p className="text-xs text-muted-foreground">Food saved this week</p>
        </div>
        <div className="bg-destructive/10 rounded-2xl p-4">
          <Trash2 className="text-destructive mb-2" size={20} />
          <p className="text-2xl font-bold text-foreground tabular-nums">{totalWasted} kg</p>
          <p className="text-xs text-muted-foreground">Food wasted this week</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-card border rounded-2xl p-4 animate-fade-up" style={{ animationDelay: "160ms" }}>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <TrendingDown size={16} className="text-primary" /> Weekly Overview
        </h3>
        <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" /> Saved
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-destructive" /> Wasted
          </span>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={weekData} barGap={2}>
            <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(150 10% 42%)" }} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: 12 }}
              formatter={(value: number, name: string) => [`${value} kg`, name === "saved" ? "Saved" : "Wasted"]}
            />
            <Bar dataKey="saved" radius={[6, 6, 0, 0]} maxBarSize={24}>
              {weekData.map((_, i) => (
                <Cell key={i} fill="hsl(153 47% 30%)" />
              ))}
            </Bar>
            <Bar dataKey="wasted" radius={[6, 6, 0, 0]} maxBarSize={24}>
              {weekData.map((_, i) => (
                <Cell key={i} fill="hsl(0 72% 51%)" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Add form (simple) */}
      {showAdd && (
        <div className="bg-card border rounded-2xl p-4 animate-scale-in space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Log food item</h3>
          <input
            type="text"
            placeholder="What did you eat/save/waste?"
            className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <div className="flex gap-2">
            {(["consumed", "saved", "wasted"] as const).map((s) => (
              <button
                key={s}
                className={`flex-1 text-xs font-medium py-2 rounded-lg transition-colors ${statusConfig[s].bg} ${statusConfig[s].color}`}
              >
                {statusConfig[s].label}
              </button>
            ))}
          </div>
          <button className="w-full bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold transition-all active:scale-[0.97]">
            Add Entry
          </button>
        </div>
      )}

      {/* Recent entries */}
      <section className="animate-fade-up" style={{ animationDelay: "240ms" }}>
        <h3 className="text-sm font-semibold text-foreground mb-3">Recent Entries</h3>
        <div className="space-y-2">
          {entries.map((entry) => {
            const cfg = statusConfig[entry.status];
            return (
              <div key={entry.id} className="flex items-center gap-3 bg-card border rounded-xl p-3">
                <span className="text-xl">{entry.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{entry.name}</p>
                  <p className="text-xs text-muted-foreground">{entry.amount} · {entry.date}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                  {cfg.label}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
