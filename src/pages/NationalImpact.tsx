import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { usePoints } from "@/contexts/PointsContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// Simulated national data
const NATIONAL_STATS = {
  totalFoodSaved: 128450,
  totalMealsSaved: 385350,
  totalCO2Reduced: 321125,
  totalUsers: 24800,
  goalKg: 200000,
};

const monthlyData = [
  { month: "Jan", saved: 8200 },
  { month: "Feb", saved: 9100 },
  { month: "Mar", saved: 10500 },
  { month: "Apr", saved: 11200 },
  { month: "May", saved: 12800 },
  { month: "Jun", saved: 14600 },
  { month: "Jul", saved: 15200 },
  { month: "Aug", saved: 13900 },
  { month: "Sep", saved: 11400 },
  { month: "Oct", saved: 10100 },
  { month: "Nov", saved: 6200 },
  { month: "Dec", saved: 5250 },
];

const categoryData = [
  { name: "Fruits & Veg", value: 35, color: "hsl(142, 70%, 45%)" },
  { name: "Grains", value: 25, color: "hsl(46, 60%, 55%)" },
  { name: "Dairy", value: 20, color: "hsl(153, 47%, 42%)" },
  { name: "Protein", value: 15, color: "hsl(25, 95%, 53%)" },
  { name: "Other", value: 5, color: "hsl(90, 15%, 65%)" },
];

function AnimatedCounter({ target, duration = 2000, suffix = "" }: { target: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return <>{count.toLocaleString()}{suffix}</>;
}

export default function NationalImpact() {
  const { points } = usePoints();
  const userSaved = parseFloat(localStorage.getItem("sp-food-saved-kg") || "3.2");
  const userMeals = parseInt(localStorage.getItem("sp-meals-saved") || "8", 10);
  const avgPerUser = NATIONAL_STATS.totalFoodSaved / NATIONAL_STATS.totalUsers;
  const goalProgress = (NATIONAL_STATS.totalFoodSaved / NATIONAL_STATS.goalKg) * 100;

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
      <div className="animate-fade-up">
        <h2 className="text-2xl font-bold text-foreground">🇲🇾 National Impact</h2>
        <p className="text-muted-foreground mt-1">Together, we're making a difference</p>
      </div>

      {/* Big counters */}
      <div className="grid grid-cols-3 gap-3 animate-fade-up" style={{ animationDelay: "80ms" }}>
        <Card className="text-center p-3 border-primary/20 bg-primary/5">
          <p className="text-xl font-bold text-primary">
            <AnimatedCounter target={NATIONAL_STATS.totalFoodSaved} suffix=" kg" />
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Food Saved</p>
        </Card>
        <Card className="text-center p-3 border-success/20 bg-success/5">
          <p className="text-xl font-bold text-success">
            <AnimatedCounter target={NATIONAL_STATS.totalMealsSaved} />
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Meals Rescued</p>
        </Card>
        <Card className="text-center p-3 border-streak/20 bg-streak/5">
          <p className="text-xl font-bold text-streak">
            <AnimatedCounter target={NATIONAL_STATS.totalCO2Reduced} suffix=" kg" />
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">CO₂ Reduced</p>
        </Card>
      </div>

      {/* National goal */}
      <Card className="animate-fade-up" style={{ animationDelay: "140ms" }}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-foreground">🎯 National Goal 2026</h3>
            <Badge variant="secondary" className="text-[10px]">
              {goalProgress.toFixed(0)}%
            </Badge>
          </div>
          <Progress value={goalProgress} className="h-3 bg-muted" />
          <p className="text-[10px] text-muted-foreground mt-1.5">
            {NATIONAL_STATS.totalFoodSaved.toLocaleString()} / {NATIONAL_STATS.goalKg.toLocaleString()} kg saved nationally
          </p>
        </CardContent>
      </Card>

      {/* You vs National Average */}
      <Card className="animate-fade-up" style={{ animationDelay: "200ms" }}>
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">📊 You vs National Average</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center bg-primary/10 rounded-xl p-3">
              <p className="text-lg font-bold text-primary">{userSaved} kg</p>
              <p className="text-[10px] text-muted-foreground">Your Savings</p>
            </div>
            <div className="text-center bg-muted rounded-xl p-3">
              <p className="text-lg font-bold text-foreground">{avgPerUser.toFixed(1)} kg</p>
              <p className="text-[10px] text-muted-foreground">Avg per User</p>
            </div>
          </div>
          {userSaved > avgPerUser ? (
            <p className="text-xs text-success mt-2 text-center font-medium">
              🎉 You're above the national average!
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Keep saving — you're almost at the average! 💪
            </p>
          )}
        </CardContent>
      </Card>

      {/* Monthly trend chart */}
      <Card className="animate-fade-up" style={{ animationDelay: "260ms" }}>
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">📈 Monthly Savings Trend</h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={35} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid hsl(90,15%,88%)" }}
                  formatter={(value: number) => [`${value.toLocaleString()} kg`, "Saved"]}
                />
                <Bar dataKey="saved" fill="hsl(153, 47%, 30%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Category breakdown */}
      <Card className="animate-fade-up" style={{ animationDelay: "320ms" }}>
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">🥦 Food Saved by Category</h3>
          <div className="flex items-center gap-4">
            <div className="w-28 h-28">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" innerRadius={25} outerRadius={50} paddingAngle={2}>
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1.5">
              {categoryData.map((c) => (
                <div key={c.name} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="text-foreground">{c.name}</span>
                  <span className="text-muted-foreground ml-auto">{c.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live counter */}
      <Card className="animate-fade-up" style={{ animationDelay: "380ms" }}>
        <CardContent className="p-4 text-center">
          <p className="text-[10px] text-muted-foreground mb-1">🟢 Active SavePlate Users</p>
          <p className="text-2xl font-bold text-foreground">
            <AnimatedCounter target={NATIONAL_STATS.totalUsers} duration={2500} />
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">Fighting food waste together</p>
        </CardContent>
      </Card>
    </div>
  );
}
