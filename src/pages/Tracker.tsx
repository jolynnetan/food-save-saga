import { useState, useEffect } from "react";
import { Plus, TrendingDown, Apple, Trash2, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type FoodEntry = {
  id: string;
  name: string;
  emoji: string;
  amount: string;
  status: "consumed" | "wasted" | "saved";
  date: string;
};

const statusConfig = {
  consumed: { label: "Consumed", color: "text-foreground", bg: "bg-muted" },
  saved: { label: "Saved", color: "text-success", bg: "bg-success/10" },
  wasted: { label: "Wasted", color: "text-destructive", bg: "bg-destructive/10" },
};

export default function Tracker() {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [weekData, setWeekData] = useState<{ day: string; saved: number; wasted: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newStatus, setNewStatus] = useState<"consumed" | "saved" | "wasted">("consumed");
  const { user } = useAuth();

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const fetchEntries = async () => {
      const { data } = await supabase
        .from("food_tracker_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) {
        setEntries(data.map((e: any) => ({
          id: e.id,
          name: e.name,
          emoji: e.emoji,
          amount: e.amount,
          status: e.status as "consumed" | "saved" | "wasted",
          date: new Date(e.created_at).toLocaleDateString() === new Date().toLocaleDateString() ? "Today" : 
                new Date(e.created_at).toLocaleDateString() === new Date(Date.now() - 86400000).toLocaleDateString() ? "Yesterday" :
                new Date(e.created_at).toLocaleDateString(),
        })));
      }

      // Build weekly data
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 6);
      const { data: weekEntries } = await supabase
        .from("food_tracker_entries")
        .select("*")
        .eq("user_id", user.id)
        .gte("logged_date", weekAgo.toISOString().split("T")[0]);

      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const grouped: Record<string, { saved: number; wasted: number }> = {};
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - 6 + i);
        grouped[d.toISOString().split("T")[0]] = { saved: 0, wasted: 0 };
      }
      if (weekEntries) {
        for (const e of weekEntries) {
          const key = e.logged_date;
          if (grouped[key]) {
            const amountKg = parseFloat(e.amount) / 1000 || 0.2;
            if (e.status === "saved") grouped[key].saved += amountKg;
            if (e.status === "wasted") grouped[key].wasted += amountKg;
          }
        }
      }
      setWeekData(Object.entries(grouped).map(([date, vals]) => ({
        day: dayNames[new Date(date + "T12:00:00").getDay()],
        saved: Math.round(vals.saved * 10) / 10,
        wasted: Math.round(vals.wasted * 10) / 10,
      })));
      setLoading(false);
    };
    fetchEntries();
  }, [user]);

  const totalSaved = weekData.reduce((s, d) => s + d.saved, 0).toFixed(1);
  const totalWasted = weekData.reduce((s, d) => s + d.wasted, 0).toFixed(1);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const today = new Date().toISOString().split("T")[0];
    if (user) {
      const { data } = await supabase.from("food_tracker_entries").insert({
        user_id: user.id,
        name: newName,
        emoji: newStatus === "saved" ? "♻️" : newStatus === "wasted" ? "🗑️" : "🍽️",
        amount: newAmount || "100g",
        status: newStatus,
        logged_date: today,
      }).select().single();

      if (data) {
        setEntries(prev => [{
          id: data.id, name: newName,
          emoji: newStatus === "saved" ? "♻️" : newStatus === "wasted" ? "🗑️" : "🍽️",
          amount: newAmount || "100g", status: newStatus, date: "Today",
        }, ...prev]);
      }

      // Log activity
      await supabase.from("user_activities").insert({
        user_id: user.id,
        type: "meal",
        title: newName,
        emoji: newStatus === "saved" ? "♻️" : newStatus === "wasted" ? "🗑️" : "🍽️",
        detail: `${newAmount || "100g"} · ${statusConfig[newStatus].label}`,
      });
    }
    toast.success(`Entry logged: ${newName}`);
    setNewName(""); setNewAmount(""); setNewStatus("consumed"); setShowAdd(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

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
      {weekData.some(d => d.saved > 0 || d.wasted > 0) && (
        <div className="bg-card border rounded-2xl p-4 animate-fade-up" style={{ animationDelay: "160ms" }}>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <TrendingDown size={16} className="text-primary" /> Weekly Overview
          </h3>
          <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary" /> Saved</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-destructive" /> Wasted</span>
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
                {weekData.map((_, i) => <Cell key={i} fill="hsl(153 47% 30%)" />)}
              </Bar>
              <Bar dataKey="wasted" radius={[6, 6, 0, 0]} maxBarSize={24}>
                {weekData.map((_, i) => <Cell key={i} fill="hsl(0 72% 51%)" />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <div className="bg-card border rounded-2xl p-4 animate-scale-in space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Log food item</h3>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="What did you eat/save/waste?"
            className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <input
            type="text"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            placeholder="Amount (e.g. 200g)"
            className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <div className="flex gap-2">
            {(["consumed", "saved", "wasted"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setNewStatus(s)}
                className={`flex-1 text-xs font-medium py-2 rounded-lg transition-colors ${
                  newStatus === s ? "ring-2 ring-primary " : ""
                }${statusConfig[s].bg} ${statusConfig[s].color}`}
              >
                {statusConfig[s].label}
              </button>
            ))}
          </div>
          <button
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="w-full bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-50"
          >
            Add Entry
          </button>
        </div>
      )}

      {/* Recent entries */}
      <section className="animate-fade-up" style={{ animationDelay: "240ms" }}>
        <h3 className="text-sm font-semibold text-foreground mb-3">Recent Entries</h3>
        {entries.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-4xl">📊</span>
            <p className="text-muted-foreground text-sm mt-3">No entries yet. Start tracking your food!</p>
          </div>
        ) : (
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
        )}
      </section>
    </div>
  );
}
