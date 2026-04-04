import { useState } from "react";
import { X, Check, GripVertical } from "lucide-react";
import { Package, MapPin, ShoppingCart, Calculator, Trophy, Clock, BarChart3, Building2, BellRing, ShoppingBag, Globe, Medal, Map, Flame, ChefHat, Camera } from "lucide-react";

export type QuickTool = {
  id: string;
  to: string;
  icon: any;
  title: string;
  desc: string;
  color: string;
  bg: string;
  border: string;
};

export const ALL_TOOLS: QuickTool[] = [
  { id: "tracker", to: "/tracker", icon: BarChart3, title: "Tracker", desc: "Waste analytics", color: "text-success", bg: "bg-success/10", border: "border-success/20" },
  { id: "pantry", to: "/pantry", icon: Package, title: "Pantry", desc: "Track expiry", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  { id: "foodbank", to: "/foodbank", icon: Building2, title: "Foodbank", desc: "NGO donations", color: "text-earth", bg: "bg-earth/10", border: "border-earth/20" },
  { id: "shopping", to: "/shopping", icon: ShoppingCart, title: "Shopping", desc: "Smart lists", color: "text-success", bg: "bg-success/10", border: "border-success/20" },
  { id: "leaderboard", to: "/leaderboard", icon: Trophy, title: "Leaderboard", desc: "Rank up", color: "text-streak", bg: "bg-streak/10", border: "border-streak/20" },
  { id: "reminders", to: "/reminders", icon: BellRing, title: "Reminders", desc: "Food checks", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  { id: "store", to: "/store", icon: ShoppingBag, title: "My Store", desc: "Redeemed rewards", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  { id: "achievements", to: "/achievements", icon: Medal, title: "Achievements", desc: "Badges & milestones", color: "text-warning", bg: "bg-warning/10", border: "border-warning/20" },
  { id: "journey", to: "/journey", icon: Map, title: "Journey Map", desc: "Progress path", color: "text-streak", bg: "bg-streak/10", border: "border-streak/20" },
  { id: "share", to: "/share", icon: MapPin, title: "Food Drop", desc: "Share food", color: "text-warning", bg: "bg-warning/10", border: "border-warning/20" },
  { id: "portions", to: "/portions", icon: Calculator, title: "Portions", desc: "Zero leftover", color: "text-earth", bg: "bg-earth/10", border: "border-earth/20" },
  { id: "history", to: "/history", icon: Clock, title: "History", desc: "Past meals", color: "text-accent", bg: "bg-accent/10", border: "border-accent/20" },
  { id: "weekly-report", to: "/weekly-report", icon: BarChart3, title: "Weekly Report", desc: "Nutrition & waste", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  { id: "national-impact", to: "/national-impact", icon: Globe, title: "National Impact", desc: "Collective stats", color: "text-success", bg: "bg-success/10", border: "border-success/20" },
];

export const DEFAULT_TOOL_IDS = ["tracker", "pantry", "foodbank", "shopping", "leaderboard", "reminders"];

export function getSelectedToolIds(): string[] {
  try {
    const saved = localStorage.getItem("sp-quick-tools");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_TOOL_IDS;
}

export function getSelectedTools(): QuickTool[] {
  const ids = getSelectedToolIds();
  return ids.map(id => ALL_TOOLS.find(t => t.id === id)).filter(Boolean) as QuickTool[];
}

export default function QuickToolsEditor({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [selected, setSelected] = useState<string[]>(getSelectedToolIds);

  if (!open) return null;

  const toggle = (id: string) => {
    setSelected(prev => {
      if (prev.includes(id)) {
        if (prev.length <= 3) return prev; // minimum 3
        return prev.filter(x => x !== id);
      }
      if (prev.length >= 9) return prev; // max 9
      return [...prev, id];
    });
  };

  const handleSave = () => {
    localStorage.setItem("sp-quick-tools", JSON.stringify(selected));
    onClose();
    // Force re-render by dispatching storage event
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card border-t rounded-t-3xl p-5 pb-8 animate-slide-up max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">Edit Quick Tools</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Select 3–9 tools to show on your home screen. Tap to toggle.</p>

        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {ALL_TOOLS.map((tool) => {
            const isSelected = selected.includes(tool.id);
            const idx = selected.indexOf(tool.id);
            return (
              <button
                key={tool.id}
                onClick={() => toggle(tool.id)}
                className={`relative flex flex-col items-center gap-1.5 rounded-2xl p-3 border-2 transition-all duration-200 btn-press ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-transparent bg-muted/50 opacity-60"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check size={12} className="text-primary-foreground" />
                  </div>
                )}
                <div className={`${tool.bg} rounded-xl p-2`}>
                  <tool.icon className={tool.color} size={18} />
                </div>
                <span className="text-[10px] font-semibold text-foreground text-center leading-tight">{tool.title}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleSave}
          className="w-full gradient-primary text-primary-foreground rounded-2xl py-3 font-bold text-sm shadow-primary-glow btn-press"
        >
          Save ({selected.length} tools)
        </button>
      </div>
    </div>
  );
}
