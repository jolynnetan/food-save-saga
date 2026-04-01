import { useState, useEffect } from "react";
import { Calendar, ChevronRight, RotateCcw, Filter, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type HistoryEntry = {
  id: string;
  date: string;
  dateLabel: string;
  type: "meal" | "recipe" | "scan" | "challenge";
  title: string;
  emoji: string;
  detail: string;
  calories?: number;
  canRepeat?: boolean;
};

const typeConfig = {
  meal: { label: "Meal", bg: "bg-muted", color: "text-foreground" },
  recipe: { label: "Recipe", bg: "bg-primary/10", color: "text-primary" },
  scan: { label: "Scan", bg: "bg-warning/10", color: "text-warning" },
  challenge: { label: "Challenge", bg: "bg-success/10", color: "text-success" },
};

const filterOptions = ["All", "Meals", "Recipes", "Scans", "Challenges"] as const;
type FilterType = typeof filterOptions[number];

const filterMap: Record<FilterType, string | "all"> = {
  All: "all", Meals: "meal", Recipes: "recipe", Scans: "scan", Challenges: "challenge",
};

function getDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(Date.now() - 86400000);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function History() {
  const [filter, setFilter] = useState<FilterType>("All");
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const fetchActivities = async () => {
      const { data } = await supabase
        .from("user_activities")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (data) {
        setEntries(data.map((a: any) => ({
          id: a.id,
          date: a.created_at.split("T")[0],
          dateLabel: getDateLabel(a.created_at),
          type: a.type as "meal" | "recipe" | "scan" | "challenge",
          title: a.title,
          emoji: a.emoji,
          detail: a.detail,
          calories: a.calories,
          canRepeat: a.can_repeat,
        })));
      }
      setLoading(false);
    };
    fetchActivities();
  }, [user]);

  const filtered = filter === "All"
    ? entries
    : entries.filter((e) => e.type === filterMap[filter]);

  const grouped = filtered.reduce<Record<string, HistoryEntry[]>>((acc, entry) => {
    (acc[entry.dateLabel] ??= []).push(entry);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
      <div className="animate-fade-up">
        <h2 className="text-2xl font-bold text-foreground text-balance">History</h2>
        <p className="text-muted-foreground mt-1">Look back at your food journey</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 animate-fade-up" style={{ animationDelay: "80ms" }}>
        {filterOptions.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-[0.95] ${
              filter === f
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        {Object.entries(grouped).map(([dateLabel, groupEntries], gi) => (
          <section key={dateLabel} className="animate-fade-up" style={{ animationDelay: `${(gi + 2) * 80}ms` }}>
            <div className="flex items-center gap-2 mb-2.5">
              <Calendar size={14} className="text-muted-foreground" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{dateLabel}</h3>
            </div>
            <div className="space-y-2">
              {groupEntries.map((entry) => {
                const cfg = typeConfig[entry.type] || typeConfig.meal;
                return (
                  <div key={entry.id} className="flex items-center gap-3 bg-card border rounded-xl p-3 transition-all duration-200">
                    <span className="text-xl">{entry.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{entry.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{entry.detail}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      {entry.canRepeat && (
                        <Link to="/recipes" className="bg-primary/10 text-primary rounded-lg p-1.5 transition-all active:scale-[0.9]" title="Make again">
                          <RotateCcw size={14} />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <span className="text-4xl">📭</span>
          <p className="text-muted-foreground text-sm mt-3">
            {entries.length === 0 ? "No activity yet. Start using the app to see your history!" : "No entries found for this filter"}
          </p>
        </div>
      )}
    </div>
  );
}
