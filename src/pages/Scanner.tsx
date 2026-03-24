import { useState, useRef } from "react";
import { Camera, Upload, X, Lightbulb, ChefHat, Recycle, Plus, Trash2, Flame, Loader2, Refrigerator, Leaf, UtensilsCrossed, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

type ScannedItem = {
  name: string;
  emoji: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: string;
  isLeftover: boolean;
};

type ScanResult = {
  items: ScannedItem[];
  totalCalories: number;
  wasteReductionTips: { tip: string; icon: string }[];
  recipeSuggestions: { name: string; emoji: string; time: string; description: string }[];
};

export type ScanReport = {
  id: string;
  date: string;
  mode: "leftover" | "calorie";
  items: ScannedItem[];
  totalCalories: number;
  imagePreview?: string;
};

const HISTORY_KEY = "sp-scan-history";

function saveScanReport(report: ScanReport) {
  const existing: ScanReport[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  existing.unshift(report);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(existing.slice(0, 50)));
}

export function getScanHistory(): ScanReport[] {
  return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
}

const tipIcons: Record<string, React.ReactNode> = {
  recycle: <Recycle size={14} className="text-success" />,
  fridge: <Refrigerator size={14} className="text-primary" />,
  leaf: <Leaf size={14} className="text-success" />,
};

type TabMode = "leftover" | "calorie";

export default function Scanner() {
  const [tab, setTab] = useState<TabMode>("leftover");
  const [image, setImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [newItem, setNewItem] = useState("");
  const [addingItem, setAddingItem] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const parseSSE = async (response: Response): Promise<string> => {
    const reader = response.body?.getReader();
    if (!reader) return "";
    const decoder = new TextDecoder();
    let full = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split("\n")) {
        if (!line.startsWith("data: ") || line.includes("[DONE]")) continue;
        try {
          const j = JSON.parse(line.slice(6));
          full += j.choices?.[0]?.delta?.content || "";
        } catch {}
      }
    }
    return full;
  };

  const handleScan = async () => {
    if (!image) return;
    setScanning(true);
    try {
      const mode = tab === "leftover" ? "scan-leftovers" : "scan-leftovers";
      const prompt = tab === "leftover"
        ? "I have these food items/leftovers in the photo. Please identify them, estimate calories, and suggest how to reduce waste. Mark cooked/leftover items appropriately."
        : "I have these food items in the photo. Please identify each item and provide detailed calorie and macronutrient estimates. Focus on accurate nutritional data.";

      const response = await supabase.functions.invoke("food-assistant", {
        body: { mode, messages: [{ role: "user", content: prompt }] },
      });

      if (response.error) throw response.error;

      const raw = typeof response.data === "string"
        ? response.data
        : response.data instanceof ReadableStream
          ? await parseSSE(new Response(response.data))
          : JSON.stringify(response.data);

      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      const parsed = JSON.parse(jsonMatch[0]);
      const safeResult: ScanResult = {
        items: Array.isArray(parsed.items) ? parsed.items : [],
        totalCalories: parsed.totalCalories || 0,
        wasteReductionTips: Array.isArray(parsed.wasteReductionTips) ? parsed.wasteReductionTips : [],
        recipeSuggestions: Array.isArray(parsed.recipeSuggestions) ? parsed.recipeSuggestions : [],
      };
      setResult(safeResult);

      // Save to history
      saveScanReport({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        mode: tab,
        items: parsed.items,
        totalCalories: parsed.totalCalories,
        imagePreview: image?.slice(0, 200),
      });
    } catch (err) {
      console.error("Scan error:", err);
      toast.error("Failed to analyze. Please try again.");
    } finally {
      setScanning(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.trim() || !result) return;
    setAddingItem(true);
    try {
      const response = await supabase.functions.invoke("food-assistant", {
        body: {
          mode: "scan-leftovers",
          messages: [{ role: "user", content: `Analyze this single food item: "${newItem.trim()}". Estimate its calories and macros.` }],
        },
      });

      if (response.error) throw response.error;

      const raw = typeof response.data === "string"
        ? response.data
        : response.data instanceof ReadableStream
          ? await parseSSE(new Response(response.data))
          : JSON.stringify(response.data);

      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON");
      const parsed = JSON.parse(jsonMatch[0]);
      const newItems = parsed.items || [];
      if (newItems.length > 0) {
        const updated = {
          ...result,
          items: [...(result.items || []), ...newItems],
          totalCalories: (result.totalCalories || 0) + newItems.reduce((s: number, i: ScannedItem) => s + (i.calories || 0), 0),
          wasteReductionTips: [...(result.wasteReductionTips || []), ...(parsed.wasteReductionTips || [])].slice(0, 6),
          recipeSuggestions: [...(result.recipeSuggestions || []), ...(parsed.recipeSuggestions || [])].slice(0, 4),
        };
        setResult(updated);
        toast.success(`Added "${newItems[0].name}" to report`);
      }
      setNewItem("");
    } catch {
      toast.error("Failed to analyze item");
    } finally {
      setAddingItem(false);
    }
  };

  const removeItem = (index: number) => {
    if (!result) return;
    const removed = result.items[index];
    const items = result.items.filter((_, i) => i !== index);
    setResult({ ...result, items, totalCalories: result.totalCalories - removed.calories });
  };

  const sendToCalorieTracker = () => {
    if (!result) return;
    // Save items to localStorage for CalorieTracker to pick up
    const existing = JSON.parse(localStorage.getItem("sp-scanned-calories") || "[]");
    const newEntries = result.items.map(item => ({
      name: item.name,
      emoji: item.emoji,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
    }));
    localStorage.setItem("sp-scanned-calories", JSON.stringify([...existing, ...newEntries]));
    toast.success(`${result.items.length} item(s) sent to Calorie Tracker`);
    navigate("/calories");
  };

  const clear = () => { setImage(null); setResult(null); };

  const switchTab = (t: TabMode) => {
    setTab(t);
    setImage(null);
    setResult(null);
  };

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-5 pb-28">
      <div className="animate-fade-up">
        <h2 className="text-2xl font-bold text-foreground">Food Scanner</h2>
        <p className="text-muted-foreground mt-1">Analyze leftovers or track calories from photos</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 animate-fade-up" style={{ animationDelay: "60ms" }}>
        <button
          onClick={() => switchTab("leftover")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all active:scale-[0.97] ${
            tab === "leftover" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground"
          }`}
        >
          <Recycle size={16} /> Leftover Scanner
        </button>
        <button
          onClick={() => switchTab("calorie")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all active:scale-[0.97] ${
            tab === "calorie" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground"
          }`}
        >
          <Flame size={16} /> Calorie Scanner
        </button>
      </div>

      {/* Upload area */}
      {!image ? (
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-primary/30 rounded-2xl p-8 flex flex-col items-center gap-4 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 active:scale-[0.98] animate-fade-up"
          style={{ animationDelay: "120ms" }}
        >
          <div className="bg-primary/10 rounded-2xl p-4">
            <Camera className="text-primary" size={32} />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">
              {tab === "leftover" ? "Snap your leftovers" : "Snap your food"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {tab === "leftover" ? "Get tips to reduce waste & reuse food" : "Get detailed calorie & macro estimates"}
            </p>
          </div>
          <div className="flex gap-3">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
              <Camera size={12} /> Camera
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
              <Upload size={12} /> Gallery
            </span>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="relative animate-scale-in">
          <img src={image} alt="Your food" className="w-full rounded-2xl object-cover max-h-64" />
          <button onClick={clear} className="absolute top-3 right-3 bg-foreground/60 text-background rounded-full p-1.5 hover:bg-foreground/80 transition-colors active:scale-[0.9]">
            <X size={16} />
          </button>
          {!result && (
            <button onClick={handleScan} disabled={scanning} className="w-full mt-4 bg-primary text-primary-foreground rounded-xl py-3 font-semibold text-sm transition-all duration-200 active:scale-[0.97] disabled:opacity-60 shadow-lg shadow-primary/20">
              {scanning ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={16} /> Analyzing with AI...
                </span>
              ) : tab === "leftover" ? "🔍 Analyze Leftovers" : "🔥 Analyze Calories"}
            </button>
          )}
        </div>
      )}

      {/* Report */}
      {result && (
        <div className="space-y-4">
          {/* Calorie Summary */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 animate-fade-up">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Flame size={16} className="text-destructive" /> Calorie Report
              </h3>
              <span className="text-2xl font-bold text-primary">{result.totalCalories} kcal</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {tab === "leftover"
                ? `${result.items.filter(i => i.isLeftover).length} leftover(s) · ${result.items.filter(i => !i.isLeftover).length} fresh`
                : `${result.items.length} item(s) detected`}
            </p>
          </div>

          {/* Detected Items */}
          <div className="bg-card border rounded-2xl p-4 animate-fade-up" style={{ animationDelay: "80ms" }}>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
              <Lightbulb size={16} className="text-warning" /> Detected Items
            </h3>
            <div className="space-y-2">
              {result.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-muted/50 rounded-xl p-3 group">
                  <span className="text-xl">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      {item.isLeftover && tab === "leftover" && (
                        <span className="text-[10px] font-medium bg-warning/20 text-warning px-1.5 py-0.5 rounded-full shrink-0">Leftover</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{item.quantity} · {item.calories} kcal</p>
                    <p className="text-[10px] text-muted-foreground">P: {item.protein}g · C: {item.carbs}g · F: {item.fat}g</p>
                  </div>
                  <button onClick={() => removeItem(i)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add item */}
            <div className="flex gap-2 mt-3">
              <Input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Add missed item (e.g. fried egg)"
                className="text-sm h-9 rounded-xl"
                onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
              />
              <button onClick={handleAddItem} disabled={addingItem || !newItem.trim()} className="bg-primary text-primary-foreground rounded-xl px-3 h-9 text-sm font-medium disabled:opacity-50 flex items-center gap-1 shrink-0">
                {addingItem ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
                Add
              </button>
            </div>
          </div>

          {/* Calorie tab: Send to Calorie Tracker */}
          {tab === "calorie" && (
            <button
              onClick={sendToCalorieTracker}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3 font-semibold text-sm transition-all active:scale-[0.97] shadow-lg shadow-primary/20 animate-fade-up"
            >
              <UtensilsCrossed size={16} /> Send to Calorie Tracker <ArrowRight size={16} />
            </button>
          )}

          {/* Leftover tab: Waste Reduction Tips */}
          {tab === "leftover" && result.wasteReductionTips.length > 0 && (
            <div className="bg-card border rounded-2xl p-4 animate-fade-up" style={{ animationDelay: "160ms" }}>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                <Recycle size={16} className="text-success" /> Reduce Your Leftovers
              </h3>
              <ul className="space-y-2.5">
                {result.wasteReductionTips.map((t, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex gap-2.5 items-start">
                    <span className="mt-0.5">{tipIcons[t.icon] || <Leaf size={14} className="text-success" />}</span>
                    {t.tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recipe Suggestions (leftover tab) */}
          {tab === "leftover" && result.recipeSuggestions.length > 0 && (
            <div className="bg-card border rounded-2xl p-4 animate-fade-up" style={{ animationDelay: "240ms" }}>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                <ChefHat size={16} className="text-primary" /> Use It Up — Recipes
              </h3>
              <div className="space-y-2">
                {result.recipeSuggestions.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 bg-muted/50 rounded-xl p-3">
                    <span className="text-2xl">{r.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.description} · ⏱ {r.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
