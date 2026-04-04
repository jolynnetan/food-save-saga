import { Link } from "react-router-dom";
import { Package, MapPin, ShoppingCart, Calculator, Trophy, Clock, BarChart3, Building2, BellRing, ShoppingBag, Globe, Medal, Map } from "lucide-react";
import { useT } from "@/contexts/SettingsContext";

export default function More() {
  const t = useT();

  const features = [
    { to: "/store", icon: ShoppingBag, title: t("myStore"), desc: t("redeemedRewards"), color: "text-primary", bg: "bg-primary/10" },
    { to: "/achievements", icon: Medal, title: t("achievements"), desc: t("badgesAndMilestones"), color: "text-warning", bg: "bg-warning/10" },
    { to: "/journey", icon: Map, title: t("journeyMap"), desc: t("yourProgressPath"), color: "text-streak", bg: "bg-streak/10" },
    { to: "/tracker", icon: BarChart3, title: t("tracker"), desc: t("wasteAnalytics"), color: "text-success", bg: "bg-success/10" },
    { to: "/pantry", icon: Package, title: t("smartPantry"), desc: t("trackExpiryDates"), color: "text-primary", bg: "bg-primary/10" },
    { to: "/share", icon: MapPin, title: t("foodDrop"), desc: t("shareWithNeighbors"), color: "text-warning", bg: "bg-warning/10" },
    { to: "/foodbank", icon: Building2, title: t("foodbank"), desc: t("ngoDonations"), color: "text-earth", bg: "bg-earth/10" },
    { to: "/shopping", icon: ShoppingCart, title: t("smartShopping"), desc: t("wasteAwareLists"), color: "text-success", bg: "bg-success/10" },
    { to: "/portions", icon: Calculator, title: t("portions"), desc: t("zeroLeftoverCalc"), color: "text-earth", bg: "bg-earth/10" },
    { to: "/history", icon: Clock, title: t("history"), desc: t("pastMealsRecipes"), color: "text-accent", bg: "bg-accent/10" },
    { to: "/reminders", icon: BellRing, title: t("reminders"), desc: t("weeklyFoodChecks"), color: "text-primary", bg: "bg-primary/10" },
    { to: "/leaderboard", icon: Trophy, title: t("leaderboard"), desc: t("rankAmongSavers"), color: "text-streak", bg: "bg-streak/10" },
    { to: "/weekly-report", icon: BarChart3, title: t("weeklyReport"), desc: t("nutritionAndWaste"), color: "text-primary", bg: "bg-primary/10" },
    { to: "/national-impact", icon: Globe, title: t("nationalImpact"), desc: t("collectiveStats"), color: "text-success", bg: "bg-success/10" },
  ];

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
      <div className="animate-fade-up">
        <h2 className="text-2xl font-bold text-foreground text-balance">{t("moreTools")}</h2>
        <p className="text-muted-foreground mt-1">{t("moreToolsDesc")}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {features.map((f, i) => (
          <Link
            key={f.to}
            to={f.to}
            className="flex flex-col items-center gap-2 bg-card border rounded-2xl p-4 transition-all duration-200 active:scale-[0.95] hover:shadow-md animate-fade-up"
            style={{ animationDelay: `${(i + 1) * 60}ms` }}
          >
            <div className={`${f.bg} rounded-2xl p-4`}>
              <f.icon className={f.color} size={28} />
            </div>
            <span className="text-xs font-semibold text-foreground text-center leading-tight">{f.title}</span>
            <span className="text-[10px] text-muted-foreground text-center leading-tight">{f.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
