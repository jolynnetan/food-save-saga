import { useState } from "react";
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp, Flame, Leaf, Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line } from "recharts";
import { Progress } from "@/components/ui/progress";

const WEEK_DATA = [
  {
    label: "Mar 10 – Mar 16",
    dailyCalories: [
      { day: "Mon", consumed: 1820, goal: 2000 },
      { day: "Tue", consumed: 2150, goal: 2000 },
      { day: "Wed", consumed: 1940, goal: 2000 },
      { day: "Thu", consumed: 1780, goal: 2000 },
      { day: "Fri", consumed: 2210, goal: 2000 },
      { day: "Sat", consumed: 2340, goal: 2000 },
      { day: "Sun", consumed: 1900, goal: 2000 },
    ],
    macros: { protein: 112, carbs: 248, fat: 68 },
    wasteReduction: 24,
    foodSaved: 3.2,
    mealsLogged: 19,
    challengesCompleted: 5,
    streakDays: 7,
    topItems: [
      { name: "Rice", saved: "0.8 kg" },
      { name: "Vegetables", saved: "1.1 kg" },
      { name: "Bread", saved: "0.5 kg" },
    ],
    wasteByCategory: [
      { name: "Vegetables", value: 35, fill: "hsl(142, 70%, 45%)" },
      { name: "Grains", value: 25, fill: "hsl(46, 60%, 50%)" },
      { name: "Dairy", value: 20, fill: "hsl(200, 60%, 50%)" },
      { name: "Fruits", value: 12, fill: "hsl(15, 70%, 55%)" },
      { name: "Other", value: 8, fill: "hsl(150, 10%, 60%)" },
    ],
    wasteTrend: [
      { week: "W1", waste: 4.2 },
      { week: "W2", waste: 3.8 },
      { week: "W3", waste: 3.5 },
      { week: "W4", waste: 3.2 },
    ],
  },
  {
    label: "Mar 3 – Mar 9",
    dailyCalories: [
      { day: "Mon", consumed: 1950, goal: 2000 },
      { day: "Tue", consumed: 2080, goal: 2000 },
      { day: "Wed", consumed: 1870, goal: 2000 },
      { day: "Thu", consumed: 2200, goal: 2000 },
      { day: "Fri", consumed: 1760, goal: 2000 },
      { day: "Sat", consumed: 2100, goal: 2000 },
      { day: "Sun", consumed: 1980, goal: 2000 },
    ],
    macros: { protein: 105, carbs: 260, fat: 72 },
    wasteReduction: 18,
    foodSaved: 2.8,
    mealsLogged: 17,
    challengesCompleted: 4,
    streakDays: 5,
    topItems: [
      { name: "Rice", saved: "0.6 kg" },
      { name: "Bread", saved: "0.7 kg" },
      { name: "Fruits", saved: "0.4 kg" },
    ],
    wasteByCategory: [
      { name: "Vegetables", value: 30, fill: "hsl(142, 70%, 45%)" },
      { name: "Grains", value: 28, fill: "hsl(46, 60%, 50%)" },
      { name: "Dairy", value: 22, fill: "hsl(200, 60%, 50%)" },
      { name: "Fruits", value: 14, fill: "hsl(15, 70%, 55%)" },
      { name: "Other", value: 6, fill: "hsl(150, 10%, 60%)" },
    ],
    wasteTrend: [
      { week: "W1", waste: 5.0 },
      { week: "W2", waste: 4.5 },
      { week: "W3", waste: 3.8 },
      { week: "W4", waste: 2.8 },
    ],
  },
];

export default function WeeklyReport() {
  const { user } = useAuth();
  const [weekIndex, setWeekIndex] = useState(0);
  const week = WEEK_DATA[weekIndex];

  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const totalConsumed = week.dailyCalories.reduce((s, d) => s + d.consumed, 0);
  const totalGoal = week.dailyCalories.reduce((s, d) => s + d.goal, 0);
  const avgCalories = Math.round(totalConsumed / 7);
  const goalDiff = totalConsumed - totalGoal;
  const goalPercent = Math.round((totalConsumed / totalGoal) * 100);

  const totalMacros = week.macros.protein + week.macros.carbs + week.macros.fat;

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: 420,
      });

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const A4_W = 210;
      const A4_H = 297;
      const M = 8;
      const CW = A4_W - M * 2;
      const CH = A4_H - M * 2;

      const imgW = canvas.width;
      const imgH = canvas.height;
      const ratio = Math.min(CW / imgW, CH / imgH);
      const finalW = imgW * ratio;
      const finalH = imgH * ratio;
      const offsetX = M + (CW - finalW) / 2;
      const offsetY = M;

      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      pdf.addImage(imgData, "JPEG", offsetX, offsetY, finalW, finalH);

      const dateStr = week.label.replace(/\s/g, "-");
      pdf.save(`Weekly-Report-${dateStr}.pdf`);
      toast({ title: "Report downloaded!", description: "Your weekly report PDF has been saved." });
    } catch {
      toast({ title: "Export failed", description: "Could not generate PDF. Please try again.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSendEmail = async () => {
    if (!reportRef.current) return;
    setIsSending(true);
    try {
      const email = user?.email || "";
      if (!email) {
        toast({ title: "No email found", description: "Please log in to send the report to your email.", variant: "destructive" });
        setIsSending(false);
        return;
      }

      const summaryText = goalDiff <= 0
        ? `You stayed ${Math.abs(goalDiff)} kcal under your calorie goal and saved ${week.foodSaved} kg of food from going to waste.`
        : `You went ${goalDiff} kcal over your goal this week, but you still saved ${week.foodSaved} kg of food!`;

      const subject = `🌱 Your SavePlate Weekly Wrap-Up: ${week.foodSaved}kg Saved & ${week.streakDays}-Day Streak! (${week.label})`;

      const body = [
        `Hi there! 👋`,
        ``,
        `Here's your SavePlate Weekly Report for ${week.label}:`,
        ``,
        `✨ WEEKLY HIGHLIGHTS`,
        `━━━━━━━━━━━━━━━━━━`,
        `🌿 Food Saved: ${week.foodSaved} kg`,
        `🔥 Streak: ${week.streakDays} days`,
        `🏆 Challenges Completed: ${week.challengesCompleted}`,
        `📝 Meals Logged: ${week.mealsLogged}`,
        ``,
        `🔥 CALORIE SUMMARY`,
        `━━━━━━━━━━━━━━━━━━`,
        `Average: ${avgCalories} kcal/day (Goal: 2,000 kcal)`,
        `Weekly Total: ${totalConsumed.toLocaleString()} / ${totalGoal.toLocaleString()} kcal (${goalPercent}%)`,
        ``,
        `🥩 MACROS (avg/day)`,
        `━━━━━━━━━━━━━━━━━━`,
        `Protein: ${week.macros.protein}g | Carbs: ${week.macros.carbs}g | Fat: ${week.macros.fat}g`,
        ``,
        `🌍 WASTE REDUCTION`,
        `━━━━━━━━━━━━━━━━━━`,
        `Reduced by ${week.wasteReduction}% this week!`,
        `Top saved: ${week.topItems.map(i => `${i.name} (${i.saved})`).join(", ")}`,
        ``,
        `💬 ${summaryText}`,
        ``,
        `Keep making a difference! 🌱`,
        `— The SavePlate Team`,
      ].join("\n");

      const mailtoUrl = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoUrl, "_blank");

      toast({
        title: "Email ready! ✉️",
        description: `Your email client opened with the report for ${email}. Just hit Send!`,
      });
    } catch {
      toast({ title: "Failed", description: "Could not prepare the email.", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-5 pb-24">
      {/* Action buttons */}
      <div className="flex gap-2 animate-fade-up">
        <Button
          onClick={handleDownloadPDF}
          disabled={isExporting}
          variant="outline"
          className="flex-1 gap-2 rounded-xl"
        >
          {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          {isExporting ? "Generating…" : "Download PDF"}
        </Button>
        <Button
          onClick={handleSendEmail}
          disabled={isSending}
          className="flex-1 gap-2 rounded-xl"
        >
          {isSending ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
          {isSending ? "Sending…" : "Send to Email"}
        </Button>
      </div>

      <div ref={reportRef} className="space-y-4">
      {/* Header with week navigation */}
      <div data-pdf-section className="animate-fade-up">
        <h2 className="text-2xl font-bold text-foreground text-balance">📊 Weekly Report</h2>
        <div className="flex items-center justify-between mt-2">
          <button
            onClick={() => setWeekIndex(Math.min(weekIndex + 1, WEEK_DATA.length - 1))}
            disabled={weekIndex >= WEEK_DATA.length - 1}
            className="p-2 rounded-xl bg-card border text-foreground disabled:opacity-30 active:scale-95 transition-transform"
          >
            <ChevronLeft size={18} />
          </button>
          <p className="text-sm font-semibold text-muted-foreground">{week.label}</p>
          <button
            onClick={() => setWeekIndex(Math.max(weekIndex - 1, 0))}
            disabled={weekIndex <= 0}
            className="p-2 rounded-xl bg-card border text-foreground disabled:opacity-30 active:scale-95 transition-transform"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Highlights strip */}
      <div data-pdf-section className="grid grid-cols-3 gap-3 animate-fade-up" style={{ animationDelay: "80ms" }}>
        <div className="bg-success/10 rounded-2xl p-3 text-center">
          <Leaf className="text-success mx-auto mb-1" size={20} />
          <p className="text-lg font-bold text-foreground">{week.foodSaved} kg</p>
          <p className="text-[11px] text-muted-foreground">Food Saved</p>
        </div>
        <div className="bg-streak/10 rounded-2xl p-3 text-center">
          <Flame className="text-streak mx-auto mb-1" size={20} />
          <p className="text-lg font-bold text-foreground">{week.streakDays}</p>
          <p className="text-[11px] text-muted-foreground">Day Streak</p>
        </div>
        <div className="bg-primary/10 rounded-2xl p-3 text-center">
          <Award className="text-primary mx-auto mb-1" size={20} />
          <p className="text-lg font-bold text-foreground">{week.challengesCompleted}</p>
          <p className="text-[11px] text-muted-foreground">Challenges</p>
        </div>
      </div>

      {/* Calories vs Goal */}
      <section data-pdf-section className="bg-card border rounded-2xl p-4 animate-fade-up" style={{ animationDelay: "160ms" }}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-foreground">🔥 Calories vs Goal</h3>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${goalDiff <= 0 ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
            {goalDiff <= 0 ? <TrendingDown className="inline mr-1" size={12} /> : <TrendingUp className="inline mr-1" size={12} />}
            {goalDiff <= 0 ? `${Math.abs(goalDiff)} under` : `${goalDiff} over`}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Avg <span className="font-semibold text-foreground">{avgCalories}</span> kcal/day · Goal: 2,000 kcal
        </p>

        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={week.dailyCalories} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(90,15%,88%)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(150,10%,42%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(150,10%,42%)" }} axisLine={false} tickLine={false} domain={[0, 2800]} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid hsl(90,15%,88%)", fontSize: 12 }}
                formatter={(val: number) => [`${val} kcal`]}
              />
              <Bar dataKey="consumed" radius={[6, 6, 0, 0]} maxBarSize={28}>
                {week.dailyCalories.map((d, i) => (
                  <Cell key={i} fill={d.consumed > d.goal ? "hsl(15, 70%, 55%)" : "hsl(153, 47%, 30%)"} />
                ))}
              </Bar>
              <Bar dataKey="goal" radius={[6, 6, 0, 0]} maxBarSize={28} fill="hsl(90,15%,88%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Weekly progress</span>
            <span className="font-semibold text-foreground">{goalPercent}%</span>
          </div>
          <Progress value={Math.min(goalPercent, 100)} className="h-2" />
        </div>
      </section>

      {/* Macros Breakdown */}
      <section data-pdf-section className="bg-card border rounded-2xl p-4 animate-fade-up" style={{ animationDelay: "240ms" }}>
        <h3 className="text-sm font-semibold text-foreground mb-3">🥩 Weekly Macros (avg/day)</h3>
        <div className="space-y-3">
          {[
            { label: "Protein", value: week.macros.protein, unit: "g", color: "bg-primary" },
            { label: "Carbs", value: week.macros.carbs, unit: "g", color: "bg-warning" },
            { label: "Fat", value: week.macros.fat, unit: "g", color: "bg-accent" },
          ].map((m) => (
            <div key={m.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">{m.label}</span>
                <span className="font-semibold text-foreground">
                  {m.value}{m.unit} · {Math.round((m.value / totalMacros) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${m.color} transition-all duration-500`}
                  style={{ width: `${(m.value / totalMacros) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Food Waste Reduction */}
      <section data-pdf-section className="bg-card border rounded-2xl p-4 animate-fade-up" style={{ animationDelay: "320ms" }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">🌍 Waste Reduction</h3>
          <span className="text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">
            -{week.wasteReduction}%
          </span>
        </div>

        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={week.wasteTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(90,15%,88%)" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "hsl(150,10%,42%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(150,10%,42%)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(90,15%,88%)", fontSize: 12 }} />
              <Line type="monotone" dataKey="waste" stroke="hsl(142, 70%, 45%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(142, 70%, 45%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Waste by Category */}
      <section data-pdf-section className="bg-card border rounded-2xl p-4 animate-fade-up" style={{ animationDelay: "400ms" }}>
        <h3 className="text-sm font-semibold text-foreground mb-3">📦 Waste by Category</h3>
        <div className="flex items-center gap-4">
          <div className="w-28 h-28">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={week.wasteByCategory}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={50}
                  innerRadius={28}
                  strokeWidth={2}
                  stroke="hsl(0,0%,100%)"
                >
                  {week.wasteByCategory.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-1.5">
            {week.wasteByCategory.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: cat.fill }} />
                <span className="text-muted-foreground flex-1">{cat.name}</span>
                <span className="font-semibold text-foreground">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Saved Items */}
      <section data-pdf-section className="bg-card border rounded-2xl p-4 animate-fade-up" style={{ animationDelay: "480ms" }}>
        <h3 className="text-sm font-semibold text-foreground mb-3">🏅 Top Saved Items</h3>
        <div className="space-y-2">
          {week.topItems.map((item, i) => (
            <div key={item.name} className="flex items-center gap-3">
              <span className="text-lg font-bold text-primary w-6 text-center">{i + 1}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{item.name}</p>
              </div>
              <span className="text-xs font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">
                {item.saved}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Summary Message */}
      <section data-pdf-section className="bg-primary/10 border border-primary/20 rounded-2xl p-4 animate-fade-up" style={{ animationDelay: "560ms" }}>
        <p className="text-sm text-foreground leading-relaxed font-medium">
          {goalDiff <= 0
            ? `Great week! 🎉 You stayed ${Math.abs(goalDiff)} kcal under your calorie goal and saved ${week.foodSaved} kg of food from going to waste. Keep this momentum going!`
            : `You went ${goalDiff} kcal over your goal this week, but you still saved ${week.foodSaved} kg of food! 💪 Try planning meals ahead next week to stay on track.`}
        </p>
      </section>
      </div>{/* end reportRef */}
    </div>
  );
}
