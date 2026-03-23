import { useState } from "react";
import { Gift, Check, Lock, Star, Heart, TreePine, Sparkles, ShoppingBag, X, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Reward = {
  id: number;
  title: string;
  description: string;
  emoji: string;
  cost: number;
  category: "donate" | "personal" | "eco" | "voucher";
  redeemed: boolean;
  terms?: string;
  voucherCode?: string;
};

const rewards: Reward[] = [
  { id: 1, title: "Donate a Meal", emoji: "🍱", description: "A meal donated to a foodbank in your name", cost: 500, category: "donate", redeemed: false },
  { id: 2, title: "Plant a Tree", emoji: "🌳", description: "We plant a tree through our NGO partner on your behalf", cost: 1000, category: "eco", redeemed: false },
  { id: 3, title: "Foodbank Restock", emoji: "🏪", description: "Donate food supplies to a local foodbank in your name", cost: 1500, category: "donate", redeemed: false },
  { id: 4, title: "Reusable Container Set", emoji: "♻️", description: "Earn a set of eco-friendly food containers", cost: 2000, category: "eco", redeemed: false },
  { id: 5, title: "Premium Recipe Pack", emoji: "👨‍🍳", description: "Unlock 20 exclusive zero-waste chef recipes", cost: 300, category: "personal", redeemed: false },
  { id: 6, title: "Feed a Family", emoji: "👨‍👩‍👧‍👦", description: "Sponsor a week of meals for a family in need", cost: 3000, category: "donate", redeemed: false },
  { id: 7, title: "Compost Starter Kit", emoji: "🌱", description: "Get a home composting starter kit delivered", cost: 1200, category: "eco", redeemed: false },
  { id: 8, title: "Food Saver Badge", emoji: "🏅", description: "Exclusive profile badge visible on leaderboard", cost: 800, category: "personal", redeemed: false },
  { id: 9, title: "Community Garden Pass", emoji: "🌻", description: "1-month access to a local community garden", cost: 2500, category: "eco", redeemed: false },
  { id: 10, title: "Cooking Class Voucher", emoji: "🍳", description: "Free online zero-waste cooking class", cost: 1800, category: "personal", redeemed: false },
  // Voucher rewards
  {
    id: 11, title: "RM10 Grocery Voucher", emoji: "🛒", description: "RM10 off at participating grocery stores", cost: 1500, category: "voucher", redeemed: false,
    terms: "Valid for 30 days from redemption. Minimum purchase of RM50. Valid at participating stores only. Not combinable with other promotions. One voucher per transaction.",
    voucherCode: "FOOD-SAVE-10",
  },
  {
    id: 12, title: "RM5 Eco Market Voucher", emoji: "🥬", description: "RM5 off at organic & eco-friendly markets", cost: 800, category: "voucher", redeemed: false,
    terms: "Valid for 14 days from redemption. No minimum purchase required. Valid at participating eco markets only. Cannot be exchanged for cash.",
    voucherCode: "ECO-MKT-5",
  },
  {
    id: 13, title: "Free Delivery Voucher", emoji: "🚚", description: "Free delivery on your next grocery order", cost: 600, category: "voucher", redeemed: false,
    terms: "Valid for 7 days from redemption. Minimum order of RM30. Delivery within city limits only. One use per account.",
    voucherCode: "FREE-DLVR",
  },
  {
    id: 14, title: "RM25 Meal Kit Voucher", emoji: "📦", description: "RM25 off a zero-waste meal kit subscription", cost: 3500, category: "voucher", redeemed: false,
    terms: "Valid for 60 days from redemption. Applicable to first-time meal kit subscription only. Cannot be used with other discounts. Kit includes 3 meals for 2 people.",
    voucherCode: "MEALKIT-25",
  },
];

const categories = [
  { key: "all" as const, label: "All", icon: Sparkles },
  { key: "donate" as const, label: "Donate", icon: Heart },
  { key: "eco" as const, label: "Eco", icon: TreePine },
  { key: "personal" as const, label: "Personal", icon: Star },
  { key: "voucher" as const, label: "Vouchers", icon: ShoppingBag },
];

export default function Rewards() {
  const [userPoints, setUserPoints] = useState(1240);
  const [redeemedIds, setRedeemedIds] = useState<number[]>([]);
  const [activeCategory, setActiveCategory] = useState<"all" | "donate" | "personal" | "eco" | "voucher">("all");
  const [showTerms, setShowTerms] = useState<Reward | null>(null);
  const [showVoucher, setShowVoucher] = useState<Reward | null>(null);
  const { toast } = useToast();

  const handleRedeem = (reward: Reward) => {
    if (userPoints < reward.cost) {
      toast({ title: "Not enough points", description: `You need ${reward.cost - userPoints} more points.`, variant: "destructive" });
      return;
    }
    if (reward.category === "voucher" && reward.terms && !redeemedIds.includes(reward.id)) {
      setShowTerms(reward);
      return;
    }
    confirmRedeem(reward);
  };

  const confirmRedeem = (reward: Reward) => {
    setUserPoints((p) => p - reward.cost);
    setRedeemedIds((prev) => [...prev, reward.id]);
    setShowTerms(null);
    if (reward.category === "voucher") {
      setShowVoucher(reward);
    } else {
      toast({ title: "🎉 Reward Redeemed!", description: `You redeemed "${reward.title}" for ${reward.cost} pts.` });
    }
  };

  const filtered = activeCategory === "all" ? rewards : rewards.filter((r) => r.category === activeCategory);

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
      <div className="animate-fade-up">
        <h2 className="text-2xl font-bold text-foreground text-balance">Rewards</h2>
        <p className="text-muted-foreground mt-1">Redeem your points for real impact</p>
      </div>

      {/* Points balance */}
      <div className="relative overflow-hidden bg-primary rounded-2xl p-5 text-primary-foreground animate-fade-up" style={{ animationDelay: "80ms" }}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Your Balance</p>
            <p className="text-3xl font-bold tabular-nums mt-0.5">{userPoints.toLocaleString()}</p>
            <p className="text-xs opacity-70 mt-1">points available</p>
          </div>
          <div className="bg-white/15 rounded-2xl p-3">
            <Gift size={28} />
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar animate-fade-up" style={{ animationDelay: "160ms" }}>
        {categories.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200 active:scale-[0.96] whitespace-nowrap ${
              activeCategory === key
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Rewards list */}
      <div className="space-y-3">
        {filtered.map((reward, i) => {
          const isRedeemed = redeemedIds.includes(reward.id);
          const canAfford = userPoints >= reward.cost;

          return (
            <div
              key={reward.id}
              className={`bg-card border rounded-2xl p-4 transition-all duration-200 animate-fade-up ${
                isRedeemed ? "opacity-50" : ""
              }`}
              style={{ animationDelay: `${240 + i * 60}ms` }}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl mt-0.5">{reward.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{reward.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{reward.description}</p>
                  <div className="flex items-center gap-2 mt-2.5">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full tabular-nums">
                      {reward.cost.toLocaleString()} pts
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      reward.category === "donate" ? "bg-warning/10 text-warning"
                        : reward.category === "eco" ? "bg-success/10 text-success"
                        : reward.category === "voucher" ? "bg-primary/10 text-primary"
                        : "bg-accent/10 text-accent"
                    }`}>
                      {reward.category === "donate" ? "Donation" : reward.category === "eco" ? "Eco Impact" : reward.category === "voucher" ? "Voucher" : "Personal"}
                    </span>
                    {reward.category === "voucher" && reward.terms && (
                      <button
                        onClick={() => setShowTerms(reward)}
                        className="text-[10px] text-muted-foreground underline flex items-center gap-0.5"
                      >
                        <FileText size={10} /> T&C
                      </button>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRedeem(reward)}
                  disabled={isRedeemed || !canAfford}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-[0.95] ${
                    isRedeemed
                      ? "bg-success/10 text-success cursor-default"
                      : canAfford
                      ? "bg-primary text-primary-foreground shadow-sm hover:shadow-md"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  {isRedeemed ? (
                    <><Check size={14} /> Done</>
                  ) : canAfford ? (
                    <><Gift size={14} /> Redeem</>
                  ) : (
                    <><Lock size={14} /> Locked</>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Terms & Conditions Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-foreground/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-card rounded-2xl w-full max-w-md p-5 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <FileText size={18} className="text-primary" /> Terms & Conditions
              </h3>
              <button onClick={() => setShowTerms(null)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <div className="flex items-center gap-3 bg-muted rounded-xl p-3">
              <span className="text-2xl">{showTerms.emoji}</span>
              <div>
                <p className="text-sm font-semibold text-foreground">{showTerms.title}</p>
                <p className="text-xs text-primary font-medium tabular-nums">{showTerms.cost.toLocaleString()} pts</p>
              </div>
            </div>
            <div className="bg-muted/50 rounded-xl p-4">
              <ul className="space-y-2">
                {showTerms.terms?.split(". ").filter(Boolean).map((term, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    {term.endsWith(".") ? term : `${term}.`}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowTerms(null)}
                className="flex-1 bg-muted text-muted-foreground rounded-xl py-3 text-sm font-semibold transition-all active:scale-[0.97]"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmRedeem(showTerms)}
                className="flex-1 bg-primary text-primary-foreground rounded-xl py-3 text-sm font-semibold transition-all active:scale-[0.97] shadow-lg shadow-primary/20"
              >
                Accept & Redeem
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voucher Code Modal */}
      {showVoucher && (
        <div className="fixed inset-0 bg-foreground/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-card rounded-2xl w-full max-w-md p-5 space-y-4 animate-scale-in text-center">
            <span className="text-5xl">{showVoucher.emoji}</span>
            <h3 className="text-lg font-bold text-foreground">Voucher Redeemed! 🎉</h3>
            <p className="text-sm text-muted-foreground">{showVoucher.title}</p>
            <div className="bg-muted rounded-xl p-4 border-2 border-dashed border-primary/30">
              <p className="text-[10px] text-muted-foreground mb-1">Your voucher code</p>
              <p className="text-xl font-bold text-primary tracking-widest tabular-nums">{showVoucher.voucherCode}</p>
            </div>
            <p className="text-[10px] text-muted-foreground">Screenshot this code. Show it at participating stores to redeem.</p>
            <button
              onClick={() => setShowVoucher(null)}
              className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-sm font-semibold transition-all active:scale-[0.97]"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
