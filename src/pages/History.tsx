import { useState, useEffect } from "react";
import { Calendar, ChevronRight, RotateCcw, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { getScanHistory, type ScanReport } from "./Scanner";

type HistoryEntry = {
  id: number | string;
  date: string;
  dateLabel: string;
  type: "meal" | "recipe" | "scan" | "challenge";
  title: string;
  emoji: string;
  detail: string;
  calories?: number;
  canRepeat?: boolean;
};

const staticHistory: HistoryEntry[] = [
  { id: 1, date: "2026-03-22", dateLabel: "Today", type: "meal", title: "Salmon with rice", emoji: "🍣", detail: "620 cal · Dinner", calories: 620 },
  { id: 2, date: "2026-03-22", dateLabel: "Today", type: "recipe", title: "Stir-fried vegetables", emoji: "🥘", detail: "Used leftover bell peppers", calories: 340, canRepeat: true },
  { id: 3, date: "2026-03-22", dateLabel: "Today", type: "challenge", title: "Finished yesterday's rice", emoji: "🍚", detail: "+10 pts earned", },
  { id: 4, date: "2026-03-21", dateLabel: "Yesterday", type: "meal", title: "Grilled chicken salad", emoji: "🥗", detail: "480 cal · Lunch", calories: 480 },
  { id: 5, date: "2026-03-21", dateLabel: "Yesterday", type: "recipe", title: "Banana smoothie", emoji: "🍌", detail: "Used overripe bananas", calories: 220, canRepeat: true },
  { id: 6, date: "2026-03-21", dateLabel: "Yesterday", type: "scan", title: "Scanned fridge leftovers", emoji: "📸", detail: "Found 3 items to use" },
  { id: 7, date: "2026-03-20", dateLabel: "Mar 20", type: "recipe", title: "Vegetable curry", emoji: "🍛", detail: "Zero waste meal!", calories: 510, canRepeat: true },
  { id: 8, date: "2026-03-20", dateLabel: "Mar 20", type: "meal", title: "Oatmeal with berries", emoji: "🥣", detail: "320 cal · Breakfast", calories: 320 },
  { id: 9, date: "2026-03-19", dateLabel: "Mar 19", type: "recipe", title: "Pasta aglio e olio", emoji: "🍝", detail: "Quick pantry recipe", calories: 450, canRepeat: true },
  { id: 10, date: "2026-03-19", dateLabel: "Mar 19", type: "challenge", title: "Used wilting vegetables", emoji: "🥬", detail: "+20 pts earned" },
  { id: 11, date: "2026-03-18", dateLabel: "Mar 18", type: "recipe", title: "Egg fried rice", emoji: "🍳", detail: "Used day-old rice", calories: 380, canRepeat: true },
  { id: 12, date: "2026-03-18", dateLabel: "Mar 18", type: "meal", title: "Tuna sandwich", emoji: "🥪", detail: "290 cal · Lunch", calories: 290 },
];

function scanReportsToEntries(reports: ScanReport[]): HistoryEntry[] {
  return reports.map(r => {
    const d = new Date(r.date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isToday = d.toDateString() === today.toDateString();
    const isYesterday = d.toDateString() === yesterday.toDateString();
    const dateLabel = isToday ? "Today" : isYesterday ? "Yesterday" : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return {
      id: r.id,
      date: r.date,
      dateLabel,
      type: "scan" as const,
      title: r.mode === "leftover" ? "Leftover Scan" : "Calorie Scan",
      emoji: r.mode === "leftover" ? "♻️" : "🔥",
      detail: `${r.items.length} items · ${r.totalCalories} kcal`,
      calories: r.totalCalories,
    };
  });
}

const typeConfig = {
  meal: { label: "Meal", bg: "bg-muted", color: "text-foreground" },
  recipe: { label: "Recipe", bg: "bg-primary/10", color: "text-primary" },
  scan: { label: "Scan", bg: "bg-warning/10", color: "text-warning" },
  challenge: { label: "Challenge", bg: "bg-success/10", color: "text-success" },
};

const filterOptions = ["All", "Meals", "Recipes", "Scans", "Challenges"] as const;
type FilterType = typeof filterOptions[number];

const filterMap: Record<FilterType, HistoryEntry["type"] | "all"> = {
  All: "all", Meals: "meal", Recipes: "recipe", Scans: "scan", Challenges: "challenge",
};

export default function History() {
  const [filter, setFilter] = useState<FilterType>("All");
  const [historyData, setHistoryData] = useState<HistoryEntry[]>(staticHistory);

  useEffect(() => {
    const scanEntries = scanReportsToEntries(getScanHistory());
    setHistoryData([...scanEntries, ...staticHistory]);
  }, []);

  const filtered = filter === "All"
    ? historyData
    : historyData.filter((e) => e.type === filterMap[filter]);

  // Group by dateLabel
  const grouped = filtered.reduce<Record<string, HistoryEntry[]>>((acc, entry) => {
    (acc[entry.dateLabel] ??= []).push(entry);
    return acc;
  }, {});

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
      <div className="animate-fade-up">
        <h2 className="text-2xl font-bold text-foreground text-balance">History</h2>
        <p className="text-muted-foreground mt-1">Look back at your food journey</p>
      </div>

      {/* Filters */}
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

      {/* Timeline */}
      <div className="space-y-5">
        {Object.entries(grouped).map(([dateLabel, entries], gi) => (
          <section
            key={dateLabel}
            className="animate-fade-up"
            style={{ animationDelay: `${(gi + 2) * 80}ms` }}
          >
            <div className="flex items-center gap-2 mb-2.5">
              <Calendar size={14} className="text-muted-foreground" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{dateLabel}</h3>
            </div>
            <div className="space-y-2">
              {entries.map((entry) => {
                const cfg = typeConfig[entry.type];
                return (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 bg-card border rounded-xl p-3 transition-all duration-200"
                  >
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
                        <Link
                          to="/recipes"
                          className="bg-primary/10 text-primary rounded-lg p-1.5 transition-all active:scale-[0.9]"
                          title="Make again"
                        >
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
          <p className="text-muted-foreground text-sm mt-3">No entries found for this filter</p>
        </div>
      )}
    </div>
  );
}
