import { useState, useEffect } from "react";
import { ShoppingBag, Trash2, Clock, X, MapPin, CheckCircle2, Truck, ChevronRight } from "lucide-react";
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

// Mock donation/eco tracking details
function getDonationDetails(item: RedeemedItem) {
  const daysSince = Math.floor((Date.now() - new Date(item.redeemedAt).getTime()) / 86400000);
  const idSeed = item.id + item.redeemedAt.length;

  if (item.category === "donate") {
    const stages = [
      { label: "Donation Received", done: true, date: item.redeemedAt },
      { label: "Matched with Foodbank", done: daysSince >= 0, date: daysSince >= 0 ? new Date(Date.now() - 86400000 * Math.max(daysSince - 1, 0)).toISOString() : null },
      { label: "Items Delivered", done: daysSince >= 2, date: daysSince >= 2 ? new Date(Date.now() - 86400000 * Math.max(daysSince - 2, 0)).toISOString() : null },
      { label: "Confirmed Received by Beneficiary", done: daysSince >= 4, date: daysSince >= 4 ? new Date(Date.now() - 86400000 * Math.max(daysSince - 4, 0)).toISOString() : null },
    ];
    const partners = ["Kechara Soup Kitchen", "Food Aid Foundation", "The Lost Food Project"];
    const partner = partners[idSeed % partners.length];
    const beneficiaries = [3, 5, 8, 12];
    const helped = beneficiaries[idSeed % beneficiaries.length];
    return { stages, partner, helped, type: "donate" as const };
  }

  // Eco
  const stages = [
    { label: "Request Submitted", done: true, date: item.redeemedAt },
    { label: "Partner NGO Notified", done: daysSince >= 0, date: daysSince >= 0 ? new Date(Date.now() - 86400000 * Math.max(daysSince - 1, 0)).toISOString() : null },
    { label: "Action In Progress", done: daysSince >= 3, date: daysSince >= 3 ? new Date(Date.now() - 86400000 * Math.max(daysSince - 3, 0)).toISOString() : null },
    { label: "Completed & Verified", done: daysSince >= 7, date: daysSince >= 7 ? new Date(Date.now() - 86400000 * Math.max(daysSince - 7, 0)).toISOString() : null },
  ];
  const partners = ["EcoKnights", "Global Environment Centre", "TrEES Malaysia"];
  const partner = partners[idSeed % partners.length];
  const locations = ["Taman Negara", "Fraser's Hill", "Penang Hill", "Langkawi"];
  const location = locations[idSeed % locations.length];
  return { stages, partner, location, type: "eco" as const };
}

export default function Store() {
  const [items, setItems] = useState<RedeemedItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<RedeemedItem | null>(null);
  const { toast } = useToast();
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  useEffect(() => {
    setItems(getRedeemedItems());
  }, []);

  const confirmDelete = () => {
    if (deleteIndex === null) return;
    const updated = items.filter((_, i) => i !== deleteIndex);
    setItems(updated);
    localStorage.setItem("sp-redeemed-items", JSON.stringify(updated));
    toast({ title: "Item removed", description: "Removed from your store." });
    setDeleteIndex(null);
  };

  const isTrackable = (cat: string) => cat === "donate" || cat === "eco";

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
              className={`bg-card border rounded-2xl p-4 animate-fade-up transition-all duration-200 ${
                isTrackable(item.category) ? "cursor-pointer hover:shadow-md active:scale-[0.98]" : ""
              }`}
              style={{ animationDelay: `${(i + 1) * 60}ms` }}
              onClick={() => isTrackable(item.category) && setSelectedItem(item)}
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
                    {isTrackable(item.category) && (
                      <span className="text-[10px] font-medium text-success bg-success/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Truck size={9} /> Track
                      </span>
                    )}
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
                <div className="flex flex-col items-center gap-2">
                  {isTrackable(item.category) && (
                    <ChevronRight size={16} className="text-muted-foreground" />
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteIndex(i); }}
                    className="shrink-0 text-muted-foreground hover:text-destructive transition-colors p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Donation/Eco Detail Modal */}
      {selectedItem && isTrackable(selectedItem.category) && (
        <div className="fixed inset-0 bg-foreground/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-card rounded-2xl w-full max-w-md p-5 space-y-4 animate-scale-in max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <span className="text-2xl">{selectedItem.emoji}</span>
                {selectedItem.title}
              </h3>
              <button onClick={() => setSelectedItem(null)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <DonationTracker item={selectedItem} />

            <button
              onClick={() => setSelectedItem(null)}
              className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-sm font-semibold transition-all active:scale-[0.97]"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteIndex !== null && (
        <div className="fixed inset-0 bg-foreground/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-card rounded-2xl w-full max-w-sm p-5 space-y-4 animate-scale-in text-center">
            <div className="bg-destructive/10 rounded-full w-14 h-14 flex items-center justify-center mx-auto">
              <Trash2 size={24} className="text-destructive" />
            </div>
            <h3 className="text-base font-semibold text-foreground">Remove this item?</h3>
            <p className="text-xs text-muted-foreground">This reward will be permanently removed from your store.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteIndex(null)}
                className="flex-1 bg-muted text-muted-foreground rounded-xl py-3 text-sm font-semibold transition-all active:scale-[0.97]"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-destructive text-destructive-foreground rounded-xl py-3 text-sm font-semibold transition-all active:scale-[0.97]"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DonationTracker({ item }: { item: RedeemedItem }) {
  const details = getDonationDetails(item);
  const completedStages = details.stages.filter((s) => s.done).length;
  const progress = (completedStages / details.stages.length) * 100;

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Progress</span>
          <span>{completedStages}/{details.stages.length} steps</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-success rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Info card */}
      <div className="bg-muted/50 rounded-xl p-3 space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <MapPin size={12} className="text-primary" />
          <span className="text-foreground font-medium">Partner: {details.partner}</span>
        </div>
        {details.type === "donate" && (
          <p className="text-xs text-muted-foreground">
            🙏 Your donation has helped <strong className="text-foreground">{details.helped} people</strong> so far.
          </p>
        )}
        {details.type === "eco" && "location" in details && (
          <p className="text-xs text-muted-foreground">
            📍 Location: <strong className="text-foreground">{details.location}</strong>
          </p>
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {details.stages.map((stage, i) => (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                stage.done ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {stage.done ? <CheckCircle2 size={14} /> : <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />}
              </div>
              {i < details.stages.length - 1 && (
                <div className={`w-0.5 h-8 ${stage.done ? "bg-success/40" : "bg-muted"}`} />
              )}
            </div>
            <div className="pb-6">
              <p className={`text-xs font-semibold ${stage.done ? "text-foreground" : "text-muted-foreground"}`}>
                {stage.label}
              </p>
              {stage.done && stage.date && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {new Date(stage.date).toLocaleDateString()}
                </p>
              )}
              {!stage.done && (
                <p className="text-[10px] text-muted-foreground mt-0.5 italic">Pending</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
