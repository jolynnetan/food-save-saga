import { useState } from "react";
import { ShoppingCart, TrendingDown, AlertTriangle, Check, Lightbulb, Plus, Trash2, Pencil, X } from "lucide-react";

type ShoppingItem = {
  id: number;
  name: string;
  emoji: string;
  suggestedQty: string;
  originalQty: string;
  wastePercent: number;
  checked: boolean;
  hasWarning: boolean;
};

const initialList: ShoppingItem[] = [
  { id: 1, name: "Kale", emoji: "🥬", suggestedQty: "150g", originalQty: "200g", wastePercent: 30, checked: false, hasWarning: true },
  { id: 2, name: "Bread", emoji: "🍞", suggestedQty: "1 loaf", originalQty: "2 loaves", wastePercent: 42, checked: false, hasWarning: true },
  { id: 3, name: "Milk", emoji: "🥛", suggestedQty: "1L", originalQty: "2L", wastePercent: 25, checked: false, hasWarning: true },
  { id: 4, name: "Chicken breast", emoji: "🍗", suggestedQty: "400g", originalQty: "400g", wastePercent: 5, checked: false, hasWarning: false },
  { id: 5, name: "Rice", emoji: "🍚", suggestedQty: "1 kg", originalQty: "1 kg", wastePercent: 3, checked: false, hasWarning: false },
  { id: 6, name: "Eggs", emoji: "🥚", suggestedQty: "6 pcs", originalQty: "12 pcs", wastePercent: 38, checked: false, hasWarning: true },
  { id: 7, name: "Tomatoes", emoji: "🍅", suggestedQty: "4 pcs", originalQty: "6 pcs", wastePercent: 28, checked: false, hasWarning: true },
  { id: 8, name: "Bananas", emoji: "🍌", suggestedQty: "5 pcs", originalQty: "5 pcs", wastePercent: 8, checked: false, hasWarning: false },
];

const insights = [
  { text: "You usually waste 30% of your kale. Should we reduce the quantity this week?", item: "Kale", saving: "~RM 1.50" },
  { text: "You've thrown away bread 3 of the last 4 weeks. Try buying just 1 loaf.", item: "Bread", saving: "~RM 3.20" },
  { text: "Your egg waste is up 15% this month. Consider buying a half-dozen instead.", item: "Eggs", saving: "~RM 2.80" },
];

export default function ShoppingList() {
  const [items, setItems] = useState(initialList);
  const [dismissedInsights, setDismissedInsights] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editQty, setEditQty] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newQty, setNewQty] = useState("");

  const toggleCheck = (id: number) => {
    setItems(items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)));
  };

  const acceptSuggestion = (insightItem: string) => {
    setDismissedInsights([...dismissedInsights, insightItem]);
  };

  const startEdit = (item: ShoppingItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditQty(item.suggestedQty);
  };

  const saveEdit = () => {
    if (!editingId) return;
    setItems(items.map((i) =>
      i.id === editingId ? { ...i, name: editName || i.name, suggestedQty: editQty || i.suggestedQty } : i
    ));
    setEditingId(null);
  };

  const deleteItem = (id: number) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const addItem = () => {
    if (!newName.trim()) return;
    const newId = Math.max(0, ...items.map((i) => i.id)) + 1;
    setItems([...items, {
      id: newId, name: newName.trim(), emoji: "🛒", suggestedQty: newQty || "1",
      originalQty: newQty || "1", wastePercent: 0, checked: false, hasWarning: false,
    }]);
    setNewName("");
    setNewQty("");
    setShowAdd(false);
  };

  const activeInsights = insights.filter((i) => !dismissedInsights.includes(i.item));
  const warningItems = items.filter((i) => i.hasWarning);
  const totalSavings = "~RM 7.50";
  const checkedCount = items.filter((i) => i.checked).length;

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
      <div className="animate-fade-up">
        <h2 className="text-2xl font-bold text-foreground text-balance">Smart Shopping</h2>
        <p className="text-muted-foreground mt-1">Buy smarter based on your habits</p>
      </div>

      <div className="grid grid-cols-3 gap-3 animate-fade-up" style={{ animationDelay: "80ms" }}>
        <div className="bg-card border rounded-2xl p-3 text-center">
          <ShoppingCart className="text-primary mx-auto mb-1" size={18} />
          <p className="text-lg font-bold text-foreground tabular-nums">{items.length}</p>
          <p className="text-[10px] text-muted-foreground">Items</p>
        </div>
        <div className="bg-warning/10 rounded-2xl p-3 text-center">
          <AlertTriangle className="text-warning mx-auto mb-1" size={18} />
          <p className="text-lg font-bold text-foreground tabular-nums">{warningItems.length}</p>
          <p className="text-[10px] text-muted-foreground">Adjusted</p>
        </div>
        <div className="bg-success/10 rounded-2xl p-3 text-center">
          <TrendingDown className="text-success mx-auto mb-1" size={18} />
          <p className="text-lg font-bold text-foreground tabular-nums">{totalSavings}</p>
          <p className="text-[10px] text-muted-foreground">Potential savings</p>
        </div>
      </div>

      {activeInsights.length > 0 && (
        <section className="space-y-2 animate-fade-up" style={{ animationDelay: "160ms" }}>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Lightbulb size={16} className="text-warning" /> Smart Suggestions
          </h3>
          {activeInsights.map((insight) => (
            <div key={insight.item} className="bg-warning/5 border border-warning/15 rounded-xl p-3 space-y-2">
              <p className="text-sm text-foreground">{insight.text}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-success font-medium">Save {insight.saving}/week</span>
                <div className="flex gap-2">
                  <button onClick={() => acceptSuggestion(insight.item)} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-primary text-primary-foreground transition-all active:scale-[0.95]">
                    Yes, reduce it
                  </button>
                  <button onClick={() => acceptSuggestion(insight.item)} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-muted text-muted-foreground transition-all active:scale-[0.95]">
                    Keep as is
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      <section className="animate-fade-up" style={{ animationDelay: "240ms" }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">This Week's List</h3>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground tabular-nums">{checkedCount}/{items.length} done</span>
            <button onClick={() => setShowAdd(!showAdd)} className="text-primary active:scale-95 transition-transform">
              {showAdd ? <X size={18} /> : <Plus size={18} />}
            </button>
          </div>
        </div>

        {showAdd && (
          <div className="flex gap-2 mb-3 animate-fade-up">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Item name"
              className="flex-1 bg-card border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
            />
            <input
              value={newQty}
              onChange={(e) => setNewQty(e.target.value)}
              placeholder="Qty"
              className="w-20 bg-card border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button onClick={addItem} className="bg-primary text-primary-foreground rounded-xl px-3 py-2 text-sm font-semibold active:scale-95 transition-transform">
              Add
            </button>
          </div>
        )}

        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className={`flex items-center gap-3 bg-card border rounded-xl p-3 transition-all duration-200 ${item.checked ? "opacity-50" : ""}`}>
              {editingId === item.id ? (
                <div className="flex-1 flex gap-2 items-center">
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1 bg-muted rounded-lg px-2 py-1 text-sm text-foreground outline-none" />
                  <input value={editQty} onChange={(e) => setEditQty(e.target.value)} className="w-20 bg-muted rounded-lg px-2 py-1 text-sm text-foreground outline-none" />
                  <button onClick={saveEdit} className="text-success active:scale-95"><Check size={16} /></button>
                  <button onClick={() => setEditingId(null)} className="text-muted-foreground active:scale-95"><X size={16} /></button>
                </div>
              ) : (
                <>
                  <button onClick={() => toggleCheck(item.id)} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${item.checked ? "bg-success border-success" : "border-muted-foreground/30"}`}>
                    {item.checked && <Check size={10} className="text-white" />}
                  </button>
                  <span className="text-lg">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${item.checked ? "line-through text-muted-foreground" : "text-foreground"}`}>{item.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-foreground font-medium">{item.suggestedQty}</span>
                      {item.hasWarning && item.suggestedQty !== item.originalQty && (
                        <span className="text-[10px] text-warning line-through">{item.originalQty}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.hasWarning && (
                      <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-warning/10 text-warning tabular-nums">
                        {item.wastePercent}%
                      </span>
                    )}
                    <button onClick={() => startEdit(item)} className="text-muted-foreground hover:text-foreground active:scale-95 transition-all p-1">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => deleteItem(item.id)} className="text-muted-foreground hover:text-destructive active:scale-95 transition-all p-1">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="animate-fade-up" style={{ animationDelay: "300ms" }}>
        <div className="bg-muted rounded-full h-2 overflow-hidden">
          <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${(checkedCount / items.length) * 100}%` }} />
        </div>
        <p className="text-xs text-muted-foreground mt-1.5 text-center">
          {checkedCount === items.length ? "🎉 All done! Great shopping!" : `${items.length - checkedCount} items remaining`}
        </p>
      </div>
    </div>
  );
}
