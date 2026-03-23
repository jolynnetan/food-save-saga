import { useState } from "react";
import { Bell, BellRing, CheckCircle2, Snowflake, Thermometer, Lightbulb, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

type Reminder = {
  id: number;
  title: string;
  description: string;
  frequency: "daily" | "weekly" | "biweekly";
  enabled: boolean;
  lastTriggered: string | null;
  nextDue: string;
};

const storageTips = [
  {
    category: "Refrigeration (1–4°C)",
    icon: Thermometer,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    tips: [
      { item: "Leafy greens", tip: "Wrap in damp paper towel inside a sealed container. Lasts 5–7 days." },
      { item: "Cooked rice/pasta", tip: "Store in airtight container. Consume within 3 days to avoid bacteria." },
      { item: "Fresh herbs", tip: "Trim stems and place upright in a glass of water, cover loosely with a bag." },
      { item: "Dairy (milk, yogurt)", tip: "Keep at the back of the fridge where it's coldest. Check sell-by dates." },
      { item: "Cut fruits", tip: "Squeeze lemon juice to prevent browning. Store in airtight container." },
    ],
  },
  {
    category: "Freezing (-18°C)",
    icon: Snowflake,
    color: "text-sky-400",
    bg: "bg-sky-400/10",
    tips: [
      { item: "Bread", tip: "Slice before freezing so you can thaw only what you need. Lasts 3 months." },
      { item: "Bananas", tip: "Peel and freeze in bags for smoothies. They'll last 2–3 months." },
      { item: "Cooked meals", tip: "Portion into containers, label with date. Most last 2–3 months." },
      { item: "Raw meat", tip: "Wrap tightly in cling film, then foil. Label with date. Lasts 3–6 months." },
      { item: "Fresh berries", tip: "Spread on a tray to freeze individually, then transfer to a bag." },
    ],
  },
  {
    category: "Pantry / Room Temp",
    icon: Lightbulb,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    tips: [
      { item: "Potatoes & onions", tip: "Store in a cool, dark place. Keep them separate — they speed each other's decay." },
      { item: "Tomatoes", tip: "Keep on counter until ripe, then refrigerate. Cold kills flavor if unripe." },
      { item: "Canned goods", tip: "Once opened, transfer to a glass container and refrigerate within 2 hours." },
      { item: "Garlic", tip: "Keep whole bulbs in a dry, ventilated spot. Don't refrigerate until peeled." },
    ],
  },
];

const initialReminders: Reminder[] = [
  {
    id: 1,
    title: "Weekly Leftover Check",
    description: "Review your fridge for items nearing expiry and plan meals around them.",
    frequency: "weekly",
    enabled: true,
    lastTriggered: "2026-03-15",
    nextDue: "2026-03-22",
  },
  {
    id: 2,
    title: "Freezer Audit",
    description: "Check frozen items for freezer burn and update labels. Rotate older items forward.",
    frequency: "biweekly",
    enabled: true,
    lastTriggered: "2026-03-08",
    nextDue: "2026-03-22",
  },
  {
    id: 3,
    title: "Meal Prep Reminder",
    description: "Plan your meals for the week using items already in your pantry and fridge.",
    frequency: "weekly",
    enabled: false,
    lastTriggered: null,
    nextDue: "2026-03-29",
  },
  {
    id: 4,
    title: "Compost Check",
    description: "Empty compost bin and review what food scraps could have been avoided.",
    frequency: "weekly",
    enabled: false,
    lastTriggered: null,
    nextDue: "2026-03-29",
  },
];

function isDueToday(dateStr: string) {
  const today = new Date().toISOString().split("T")[0];
  return dateStr <= today;
}

function frequencyLabel(f: string) {
  if (f === "daily") return "Every day";
  if (f === "weekly") return "Every week";
  return "Every 2 weeks";
}

export default function Reminders() {
  const [reminders, setReminders] = useState(initialReminders);
  const [expandedTip, setExpandedTip] = useState<number | null>(0);
  const [completedToday, setCompletedToday] = useState<Set<number>>(new Set());

  const toggleReminder = (id: number) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const markComplete = (id: number) => {
    setCompletedToday((prev) => new Set(prev).add(id));
  };

  const dueReminders = reminders.filter((r) => r.enabled && isDueToday(r.nextDue) && !completedToday.has(r.id));
  const activeReminders = reminders.filter((r) => r.enabled);

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-6 pb-28">
      {/* Header */}
      <div className="animate-fade-up">
        <h2 className="text-2xl font-bold text-foreground text-balance">Reminders</h2>
        <p className="text-muted-foreground mt-1">Stay on top of your food, reduce waste</p>
      </div>

      {/* Due Now */}
      {dueReminders.length > 0 && (
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: "60ms" }}>
          <div className="flex items-center gap-2">
            <BellRing className="text-destructive" size={18} />
            <h3 className="font-semibold text-foreground">Due Today</h3>
          </div>
          {dueReminders.map((r) => (
            <div
              key={r.id}
              className="bg-destructive/5 border border-destructive/20 rounded-2xl p-4 space-y-2"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-foreground">{r.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>
                </div>
                <button
                  onClick={() => markComplete(r.id)}
                  className="shrink-0 bg-primary text-primary-foreground rounded-xl px-3 py-1.5 text-xs font-medium active:scale-95 transition-transform"
                >
                  Done ✓
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {completedToday.size > 0 && (
        <div className="flex items-center gap-2 bg-success/10 border border-success/20 rounded-2xl p-3 animate-fade-up">
          <CheckCircle2 className="text-success" size={18} />
          <p className="text-sm text-success font-medium">
            {completedToday.size} reminder{completedToday.size > 1 ? "s" : ""} completed today!
          </p>
        </div>
      )}

      {/* All Reminders */}
      <div className="space-y-3 animate-fade-up" style={{ animationDelay: "120ms" }}>
        <div className="flex items-center gap-2">
          <Bell className="text-primary" size={18} />
          <h3 className="font-semibold text-foreground">Your Reminders</h3>
        </div>
        {reminders.map((r) => (
          <div
            key={r.id}
            className={`bg-card border rounded-2xl p-4 transition-all duration-200 ${
              !r.enabled ? "opacity-50" : ""
            }`}
          >
            <div className="flex justify-between items-center">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">{r.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                  <RefreshCw size={10} />
                  {frequencyLabel(r.frequency)}
                </p>
              </div>
              <button
                onClick={() => toggleReminder(r.id)}
                className={`w-11 h-6 rounded-full transition-colors duration-200 relative ${
                  r.enabled ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                    r.enabled ? "left-auto right-0.5" : "left-0.5 right-auto"
                  }`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Food Storage Tips */}
      <div className="space-y-3 animate-fade-up" style={{ animationDelay: "180ms" }}>
        <h3 className="font-semibold text-foreground">🧊 Food Storage Tips</h3>
        <p className="text-xs text-muted-foreground -mt-1">Keep your food fresh longer with these tips</p>

        {storageTips.map((cat, idx) => {
          const Icon = cat.icon;
          const isOpen = expandedTip === idx;
          return (
            <div key={idx} className="bg-card border rounded-2xl overflow-hidden">
              <button
                onClick={() => setExpandedTip(isOpen ? null : idx)}
                className="w-full flex items-center gap-3 p-4 text-left active:scale-[0.98] transition-transform"
              >
                <div className={`${cat.bg} rounded-xl p-2.5`}>
                  <Icon className={cat.color} size={20} />
                </div>
                <span className="font-semibold text-sm text-foreground flex-1">{cat.category}</span>
                {isOpen ? (
                  <ChevronUp className="text-muted-foreground" size={16} />
                ) : (
                  <ChevronDown className="text-muted-foreground" size={16} />
                )}
              </button>
              {isOpen && (
                <div className="px-4 pb-4 space-y-3 animate-fade-up">
                  {cat.tips.map((t, ti) => (
                    <div key={ti} className="bg-muted/50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-foreground">{t.item}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{t.tip}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
