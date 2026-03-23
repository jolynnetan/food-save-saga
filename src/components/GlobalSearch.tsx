import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const searchableFeatures = [
  { name: "Dashboard", path: "/", keywords: ["home", "stats", "overview", "main"], emoji: "🏠" },
  { name: "Challenges", path: "/challenges", keywords: ["tasks", "daily", "points", "rewards", "redeem"], emoji: "🔥" },
  { name: "Scanner", path: "/scanner", keywords: ["camera", "scan", "food", "barcode", "photo"], emoji: "📷" },
  { name: "Recipes", path: "/recipes", keywords: ["cook", "meal", "guide", "recipe", "food"], emoji: "👨‍🍳" },
  { name: "Calorie Tracker", path: "/calories", keywords: ["calories", "nutrition", "diet", "health", "track"], emoji: "🍎" },
  { name: "Tracker", path: "/tracker", keywords: ["waste", "analytics", "data", "chart"], emoji: "📊" },
  { name: "Smart Pantry", path: "/pantry", keywords: ["expiry", "fridge", "storage", "ingredients"], emoji: "📦" },
  { name: "Foodbank", path: "/foodbank", keywords: ["donate", "ngo", "charity", "collect", "restock"], emoji: "🏛️" },
  { name: "Smart Shopping", path: "/shopping", keywords: ["list", "buy", "groceries", "shop"], emoji: "🛒" },
  
  { name: "Portions", path: "/portions", keywords: ["calculator", "serving", "size"], emoji: "🧮" },
  { name: "Leaderboard", path: "/leaderboard", keywords: ["rank", "score", "compete", "friends"], emoji: "🏆" },
  { name: "Reminders", path: "/reminders", keywords: ["notify", "alert", "weekly", "check"], emoji: "🔔" },
  { name: "My Store", path: "/store", keywords: ["redeemed", "voucher", "rewards"], emoji: "🛍️" },
  { name: "History", path: "/history", keywords: ["past", "log", "record"], emoji: "🕐" },
  { name: "Settings", path: "/settings", keywords: ["preferences", "language", "theme", "dark", "font"], emoji: "⚙️" },
  { name: "AI Assistant", path: "/ai-assistant", keywords: ["ai", "chat", "help", "question", "ask"], emoji: "✨" },
  { name: "Food Drop", path: "/share", keywords: ["share", "neighbor", "community"], emoji: "📍" },
  { name: "Weekly Report", path: "/weekly-report", keywords: ["report", "summary", "nutrition"], emoji: "📈" },
  { name: "Friends", path: "/friends", keywords: ["social", "buddy", "connect"], emoji: "👥" },
];

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const results = query.trim()
    ? searchableFeatures.filter(f =>
        f.name.toLowerCase().includes(query.toLowerCase()) ||
        f.keywords.some(k => k.includes(query.toLowerCase()))
      )
    : [];

  const go = (path: string) => {
    navigate(path);
    setOpen(false);
    setQuery("");
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-lg hover:bg-secondary transition-colors"
        aria-label="Search"
      >
        <Search size={20} className="text-muted-foreground" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/50" onClick={() => { setOpen(false); setQuery(""); }}>
      <div className="mx-auto max-w-lg mt-16 px-4" onClick={e => e.stopPropagation()}>
        <div className="bg-card rounded-2xl shadow-2xl border overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b">
            <Search size={18} className="text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search features..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <button onClick={() => { setOpen(false); setQuery(""); }} className="text-muted-foreground">
              <X size={16} />
            </button>
          </div>
          {query.trim() && (
            <div className="max-h-[50vh] overflow-y-auto p-2">
              {results.length > 0 ? results.map(r => (
                <button
                  key={r.path}
                  onClick={() => go(r.path)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-muted transition-colors"
                >
                  <span className="text-lg">{r.emoji}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.name}</p>
                    <p className="text-[10px] text-muted-foreground">{r.keywords.slice(0, 3).join(", ")}</p>
                  </div>
                </button>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-6">No results for "{query}"</p>
              )}
            </div>
          )}
          {!query.trim() && (
            <div className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Type to search features, tools, or pages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
