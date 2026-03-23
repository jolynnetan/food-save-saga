import { useState, useEffect } from "react";
import { ShoppingBag, Trash2, Gift, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type RedeemedItem = {
  id: number;
  title: string;
  emoji: string;
  description: string;
  cost: number;
  category: string;
  redeemedAt: string;
  voucherCode?: string;
  terms?: string;
};

export function getRedeemedItems(): RedeemedItem[] {
  try {
    return JSON.parse(localStorage.getItem("sp-redeemed-items") || "[]");
  } catch {
    return [];
  }
}

export function addRedeemedItem(item: Omit<RedeemedItem, "redeemedAt">) {
  const items = getRedeemedItems();
  items.unshift({ ...item, redeemedAt: new Date().toISOString() });
  localStorage.setItem("sp-redeemed-items", JSON.stringify(items));
}

export default function Store() {
  const [items, setItems] = useState<RedeemedItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setItems(getRedeemedItems());
  }, []);

  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    localStorage.setItem("sp-redeemed-items", JSON.stringify(updated));
    toast({ title: "Item removed", description: "Removed from your store." });
  };

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
      <div className="animate-fade-up">
        <h2 className="text-2xl font-bold text-foreground">My Store</h2>
        <p className="text-muted-foreground mt-1">Your redeemed rewards & vouchers</p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-up" style={{ animationDelay: "80ms" }}>
          <div className="bg-muted rounded-full p-5 mb-4">
            <ShoppingBag size={36} className="text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground">No rewards yet</p>
          <p className="text-xs text-muted-foreground mt-1">Redeem rewards in Challenges → Rewards tab</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div
              key={`${item.id}-${i}`}
              className="bg-card border rounded-2xl p-4 animate-fade-up"
              style={{ animationDelay: `${(i + 1) * 60}ms` }}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl mt-0.5">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(item.redeemedAt).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {item.cost.toLocaleString()} pts
                    </span>
                  </div>
                  {item.voucherCode && (
                    <div className="mt-2 bg-muted rounded-lg p-2 border border-dashed border-primary/30">
                      <p className="text-[10px] text-muted-foreground">Voucher Code</p>
                      <p className="text-sm font-bold text-primary tracking-widest tabular-nums">{item.voucherCode}</p>
                    </div>
                  )}
                  {item.terms && (
                    <p className="text-[10px] text-muted-foreground mt-1.5 italic">{item.terms}</p>
                  )}
                </div>
                <button
                  onClick={() => removeItem(i)}
                  className="shrink-0 text-muted-foreground hover:text-destructive transition-colors p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
