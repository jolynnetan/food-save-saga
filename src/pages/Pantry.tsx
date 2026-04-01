import { useState } from "react";
import { Plus, Bell, BellRing, Trash2, Clock, ChefHat } from "lucide-react";

type PantryItem = {
  id: number;
  name: string;
  emoji: string;
  quantity: string;
  expiryDate: string;
  daysLeft: number;
  notified: boolean;
};

function calcDaysLeft(expiryDate: string) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const exp = new Date(expiryDate);
  exp.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((exp.getTime() - now.getTime()) / 86400000));
}

const createInitialItems = (): PantryItem[] => {
  const today = new Date();
  const addDays = (d: number) => {
    const date = new Date(today);
    date.setDate(date.getDate() + d);
    return date.toISOString().split("T")[0];
  };
  return [
    { id: 1, name: "Whole Milk", emoji: "🥛", quantity: "1L", expiryDate: addDays(1), daysLeft: 1, notified: true },
    { id: 2, name: "Baby Spinach", emoji: "🥬", quantity: "200g", expiryDate: addDays(1), daysLeft: 1, notified: true },
    { id: 3, name: "Greek Yogurt", emoji: "🍦", quantity: "500g", expiryDate: addDays(3), daysLeft: 3, notified: false },
    { id: 4, name: "Chicken Breast", emoji: "🍗", quantity: "400g", expiryDate: addDays(2), daysLeft: 2, notified: false },
    { id: 5, name: "Eggs", emoji: "🥚", quantity: "6 pcs", expiryDate: addDays(11), daysLeft: 11, notified: false },
    { id: 6, name: "Cheddar Cheese", emoji: "🧀", quantity: "150g", expiryDate: addDays(14), daysLeft: 14, notified: false },
    { id: 7, name: "Fresh Basil", emoji: "🌿", quantity: "30g", expiryDate: addDays(2), daysLeft: 2, notified: false },
  ];
};

const recipeSuggestions: Record<string, string[]> = {
  "Whole Milk": ["Creamy mushroom soup", "Homemade ricotta", "Milk pudding"],
  "Baby Spinach": ["Spinach & feta omelette", "Green smoothie", "Sautéed spinach pasta"],
  "Chicken Breast": ["Stir-fry with veggies", "Chicken salad wraps", "Baked chicken parmesan"],
  "Fresh Basil": ["Pesto sauce", "Caprese salad", "Basil lemonade"],
};

function getUrgencyColor(daysLeft: number) {
  if (daysLeft <= 1) return { text: "text-destructive", bg: "bg-destructive/10", ring: "ring-destructive/20" };
  if (daysLeft <= 3) return { text: "text-warning", bg: "bg-warning/10", ring: "ring-warning/20" };
  return { text: "text-success", bg: "bg-success/10", ring: "ring-success/20" };
}

export default function Pantry() {
  const [items, setItems] = useState(createInitialItems);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PantryItem | null>(null);
  const [newName, setNewName] = useState("");
  const [newExpiry, setNewExpiry] = useState("");
  const [newQty, setNewQty] = useState("");

  const urgentItems = items.filter((i) => i.daysLeft <= 1);
  const soonItems = items.filter((i) => i.daysLeft > 1 && i.daysLeft <= 3);
  const safeItems = items.filter((i) => i.daysLeft > 3);

  const handleAdd = () => {
    if (!newName || !newExpiry) return;
    const expiry = new Date(newExpiry);
    const now = new Date();
    const daysLeft = Math.max(0, Math.ceil((expiry.getTime() - now.getTime()) / 86400000));
    setItems([
      ...items,
      {
        id: Date.now(),
        name: newName,
        emoji: "📦",
        quantity: newQty || "—",
        expiryDate: newExpiry,
        daysLeft,
        notified: daysLeft <= 1,
      },
    ]);
    setNewName("");
    setNewExpiry("");
    setNewQty("");
    setShowAdd(false);
  };

  const removeItem = (id: number) => {
    setItems(items.filter((i) => i.id !== id));
    if (selectedItem?.id === id) setSelectedItem(null);
  };

  const renderSection = (title: string, sectionItems: PantryItem[], urgency: string) => {
    if (sectionItems.length === 0) return null;
    return (
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{title}</h3>
        <div className="space-y-2">
          {sectionItems.map((item) => {
            const colors = getUrgencyColor(item.daysLeft);
            const isSelected = selectedItem?.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedItem(isSelected ? null : item)}
                className={`w-full text-left flex items-center gap-3 bg-card border rounded-xl p-3 transition-all duration-200 active:scale-[0.97] ${
                  isSelected ? "ring-2 " + colors.ring : ""
                }`}
              >
                <span className="text-xl">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.quantity} · Exp {item.expiryDate}</p>
                </div>
                <div className="flex items-center gap-2">
                  {item.notified && <BellRing size={14} className="text-destructive animate-pulse" />}
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${colors.bg} ${colors.text}`}>
                    {item.daysLeft === 0 ? "Today!" : item.daysLeft === 1 ? "1 day" : `${item.daysLeft} days`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    );
  };

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h2 className="text-2xl font-bold text-foreground text-balance">Smart Pantry</h2>
          <p className="text-muted-foreground mt-1">Track expiry dates, waste less</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-primary text-primary-foreground rounded-full p-2.5 shadow-lg shadow-primary/20 transition-all duration-200 active:scale-[0.9]"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Urgent notification banner */}
      {urgentItems.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 animate-fade-up flex items-start gap-3" style={{ animationDelay: "60ms" }}>
          <Bell className="text-destructive mt-0.5 shrink-0" size={18} />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {urgentItems.length} item{urgentItems.length > 1 ? "s" : ""} expiring within 24h!
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {urgentItems.map((i) => i.name).join(", ")} — tap for recipe ideas
            </p>
          </div>
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <div className="bg-card border rounded-2xl p-4 animate-scale-in space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Add pantry item</h3>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Item name (e.g. Milk)"
            className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <div className="flex gap-2">
            <input
              value={newQty}
              onChange={(e) => setNewQty(e.target.value)}
              placeholder="Qty (e.g. 1L)"
              className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <input
              type="date"
              value={newExpiry}
              onChange={(e) => setNewExpiry(e.target.value)}
              className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <button
            onClick={handleAdd}
            className="w-full bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold transition-all active:scale-[0.97]"
          >
            Add to Pantry
          </button>
        </div>
      )}

      {/* Recipe suggestion for selected item */}
      {selectedItem && recipeSuggestions[selectedItem.name] && (
        <div className="bg-secondary rounded-2xl p-4 animate-scale-in space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ChefHat size={16} className="text-primary" /> Use your {selectedItem.name}
            </h3>
            <button onClick={() => removeItem(selectedItem.id)} className="text-destructive/60 hover:text-destructive transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
          <ul className="space-y-1.5">
            {recipeSuggestions[selectedItem.name].map((recipe) => (
              <li key={recipe} className="text-sm text-secondary-foreground flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                {recipe}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Item sections */}
      <div className="space-y-4 animate-fade-up" style={{ animationDelay: "120ms" }}>
        {renderSection("⚠️ Expiring soon (24h)", urgentItems, "urgent")}
        {renderSection("⏰ Use within 3 days", soonItems, "soon")}
        {renderSection("✅ Fresh & safe", safeItems, "safe")}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 animate-fade-up" style={{ animationDelay: "200ms" }}>
        <div className="bg-card border rounded-2xl p-3 text-center">
          <p className="text-lg font-bold text-foreground tabular-nums">{items.length}</p>
          <p className="text-[10px] text-muted-foreground">Total Items</p>
        </div>
        <div className="bg-destructive/10 rounded-2xl p-3 text-center">
          <p className="text-lg font-bold text-foreground tabular-nums">{urgentItems.length}</p>
          <p className="text-[10px] text-muted-foreground">Expiring</p>
        </div>
        <div className="bg-success/10 rounded-2xl p-3 text-center">
          <p className="text-lg font-bold text-foreground tabular-nums">{safeItems.length}</p>
          <p className="text-[10px] text-muted-foreground">Fresh</p>
        </div>
      </div>
    </div>
  );
}
