import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Upload, X, Lightbulb, ChefHat, Recycle, Plus, Trash2, Flame, Loader2, Refrigerator, Leaf, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

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

const tipIcons: Record<string, React.ReactNode> = {
  recycle: <Recycle size={14} className="text-success" />,
  fridge: <Refrigerator size={14} className="text-primary" />,
  leaf: <Leaf size={14} className="text-success" />,
};

const extractDeltaFromSSELine = (line: string) => {
  if (!line.startsWith("data:")) return "";
  const payload = line.slice(5).trim();
  if (!payload || payload === "[DONE]") return "";
  try {
    const parsed = JSON.parse(payload);
    return parsed?.choices?.[0]?.delta?.content || parsed?.choices?.[0]?.message?.content || "";
  } catch {
    return "";
  }
};

const parseSSE = async (response: Response): Promise<string> => {
  const reader = response.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder();
  let textBuffer = "";
  let full = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });
    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      full += extractDeltaFromSSELine(line);
    }
  }
  if (textBuffer.trim()) full += extractDeltaFromSSELine(textBuffer.trim());
  return full;
};

const extractAndParseJson = (raw: string) => {
  let cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const jsonStart = cleaned.search(/[\{\[]/);
  const jsonEnd = cleaned.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) throw new Error("No JSON found");
  cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
  try { return JSON.parse(cleaned); } catch {
    cleaned = cleaned.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]").replace(/[\x00-\x1F\x7F]/g, "");
    return JSON.parse(cleaned);
  }
};

const extractAiText = async (data: unknown): Promise<string> => {
  if (typeof data === "string") {
    if (!data.includes("data:")) return data;
    return data.split("\n").map((line) => extractDeltaFromSSELine(line.trim())).join("") || data;
  }
  if (data instanceof ReadableStream) return parseSSE(new Response(data));
  if (data && typeof data === "object") {
    const payload = data as any;
    if (Array.isArray(payload.items)) return JSON.stringify(payload);
    const mc = payload.choices?.[0]?.message?.content;
    if (typeof mc === "string") return mc;
    if (Array.isArray(mc)) return mc.map((p: any) => p?.text || "").join("");
  }
  return JSON.stringify(data ?? "");
};

const normalizeScanResult = (parsed: any): ScanResult => {
  const items: ScannedItem[] = Array.isArray(parsed?.items)
    ? parsed.items.map((item: any) => ({
        name: String(item?.name ?? "Unknown item"), emoji: String(item?.emoji ?? "🍽️"),
        calories: Number(item?.calories ?? 0), protein: Number(item?.protein ?? 0),
        carbs: Number(item?.carbs ?? 0), fat: Number(item?.fat ?? 0),
        quantity: String(item?.quantity ?? "1 serving"), isLeftover: Boolean(item?.isLeftover),
      }))
    : [];
  const computedCalories = items.reduce((sum, item) => sum + (Number.isFinite(item.calories) ? item.calories : 0), 0);
  const payloadCalories = Number(parsed?.totalCalories ?? parsed?.total?.calories ?? 0);
  return {
    items,
    totalCalories: Number.isFinite(payloadCalories) && payloadCalories > 0 ? payloadCalories : computedCalories,
    wasteReductionTips: Array.isArray(parsed?.wasteReductionTips) ? parsed.wasteReductionTips.filter((t: any) => typeof t?.tip === "string").map((t: any) => ({ tip: t.tip, icon: String(t?.icon ?? "leaf") })) : [],
    recipeSuggestions: Array.isArray(parsed?.recipeSuggestions) ? parsed.recipeSuggestions.filter((r: any) => typeof r?.name === "string").map((r: any) => ({ name: r.name, emoji: String(r?.emoji ?? "🍳"), time: String(r?.time ?? "15 min"), description: String(r?.description ?? "Use your detected items in a quick meal.") })) : [],
  };
};

const parseScanPayload = async (data: unknown) => {
  if (data && typeof data === "object" && Array.isArray((data as any).items)) return data;
  const rawText = await extractAiText(data);
  return extractAndParseJson(rawText);
};

export default function Scanner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [image, setImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [newItem, setNewItem] = useState("");
  const [addingItem, setAddingItem] = useState(false);
  const [savedRecipeIds, setSavedRecipeIds] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => { setImage(e.target?.result as string); setResult(null); };
    reader.readAsDataURL(file);
  };

  const saveScanResult = async (scanResult: ScanResult) => {
    if (!user) return;
    const leftoversCount = scanResult.items.filter(i => i.isLeftover).length;
    const freshCount = scanResult.items.filter(i => !i.isLeftover).length;
    await supabase.from("scan_results").insert({
      user_id: user.id,
      items: scanResult.items as any,
      total_calories: scanResult.totalCalories,
      leftovers_count: leftoversCount,
      fresh_count: freshCount,
      waste_reduction_tips: scanResult.wasteReductionTips as any,
      recipe_suggestions: scanResult.recipeSuggestions as any,
    });
  };

  const handleScan = async () => {
    if (!image) return;
    setScanning(true);
    try {
      const response = await supabase.functions.invoke("food-assistant", {
        body: { mode: "scan-leftovers", imageBase64: image },
      });
      if (response.error) throw response.error;
      const parsed = await parseScanPayload(response.data);
      const normalized = normalizeScanResult(parsed);
      setResult(normalized);
      await saveScanResult(normalized);
      await saveRecipeSuggestions(normalized.recipeSuggestions);
      if (!normalized.items.length) toast.warning("No food detected. Try another angle or add items manually.");
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
        body: { mode: "scan-leftovers", messages: [{ role: "user", content: `Analyze this single food item: "${newItem.trim()}".` }] },
      });
      if (response.error) throw response.error;
      const parsed = await parseScanPayload(response.data);
      const normalized = normalizeScanResult(parsed);
      const newItems = normalized.items;
      if (newItems.length > 0) {
        const updated = {
          ...result,
          items: [...result.items, ...newItems],
          totalCalories: result.totalCalories + newItems.reduce((s, i) => s + i.calories, 0),
          wasteReductionTips: [...result.wasteReductionTips, ...normalized.wasteReductionTips].slice(0, 6),
          recipeSuggestions: [...result.recipeSuggestions, ...normalized.recipeSuggestions].slice(0, 4),
        };
        setResult(updated);
        await saveScanResult(updated);
        toast.success(`Added "${newItems[0].name}" to report`);
      }
      setNewItem("");
    } catch { toast.error("Failed to analyze item"); }
    finally { setAddingItem(false); }
  };

  const removeItem = (index: number) => {
    if (!result) return;
    const removed = result.items[index];
    const items = result.items.filter((_, i) => i !== index);
    setResult({ ...result, items, totalCalories: result.totalCalories - removed.calories });
  };

  const clear = () => { setImage(null); setResult(null); };

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-5 pb-28">
      <div className="animate-fade-up">
        <h2 className="text-2xl font-bold text-foreground">Food & Leftover Scanner</h2>
        <p className="text-muted-foreground mt-1">Scan food to get calorie reports & waste reduction tips</p>
      </div>

      {!image ? (
        <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-primary/30 rounded-2xl p-8 flex flex-col items-center gap-4 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 active:scale-[0.98] animate-fade-up" style={{ animationDelay: "80ms" }}>
          <div className="bg-primary/10 rounded-2xl p-4"><Camera className="text-primary" size={32} /></div>
          <div className="text-center">
            <p className="font-semibold text-foreground">Take a photo or upload</p>
            <p className="text-sm text-muted-foreground mt-1">Snap your food or leftovers for analysis</p>
          </div>
          <div className="flex gap-3">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full"><Camera size={12} /> Camera</span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full"><Upload size={12} /> Gallery</span>
          </div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </div>
      ) : (
        <div className="relative animate-scale-in">
          <img src={image} alt="Your food" className="w-full rounded-2xl object-cover max-h-64" />
          <button onClick={clear} className="absolute top-3 right-3 bg-foreground/60 text-background rounded-full p-1.5 hover:bg-foreground/80 transition-colors active:scale-[0.9]"><X size={16} /></button>
          {!result && (
            <button onClick={handleScan} disabled={scanning} className="w-full mt-4 bg-primary text-primary-foreground rounded-xl py-3 font-semibold text-sm transition-all duration-200 active:scale-[0.97] disabled:opacity-60 shadow-lg shadow-primary/20">
              {scanning ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={16} /> Analyzing with AI...</span> : "🔍 Analyze Food"}
            </button>
          )}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 animate-fade-up">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Flame size={16} className="text-destructive" /> Calorie Report</h3>
              <span className="text-2xl font-bold text-primary">{result.totalCalories} kcal</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{result.items.filter(i => i.isLeftover).length} leftover(s) · {result.items.filter(i => !i.isLeftover).length} fresh item(s)</p>
          </div>

          <div className="bg-card border rounded-2xl p-4 animate-fade-up" style={{ animationDelay: "80ms" }}>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3"><Lightbulb size={16} className="text-warning" /> Detected Items</h3>
            <div className="space-y-2">
              {result.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-muted/50 rounded-xl p-3 group">
                  <span className="text-xl">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      {item.isLeftover && <span className="text-[10px] font-medium bg-warning/20 text-warning px-1.5 py-0.5 rounded-full shrink-0">Leftover</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">{item.quantity} · {item.calories} kcal</p>
                    <p className="text-[10px] text-muted-foreground">P: {item.protein}g · C: {item.carbs}g · F: {item.fat}g</p>
                  </div>
                  <button onClick={() => removeItem(i)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <Input value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="Add missed item (e.g. fried egg)" className="text-sm h-9 rounded-xl" onKeyDown={(e) => e.key === "Enter" && handleAddItem()} />
              <button onClick={handleAddItem} disabled={addingItem || !newItem.trim()} className="bg-primary text-primary-foreground rounded-xl px-3 h-9 text-sm font-medium disabled:opacity-50 flex items-center gap-1 shrink-0">
                {addingItem ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />} Add
              </button>
            </div>
          </div>

          {result.wasteReductionTips.length > 0 && (
            <div className="bg-card border rounded-2xl p-4 animate-fade-up" style={{ animationDelay: "160ms" }}>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3"><Recycle size={16} className="text-success" /> Reduce Your Leftovers</h3>
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

          {result.recipeSuggestions.length > 0 && (
            <div className="bg-card border rounded-2xl p-4 animate-fade-up" style={{ animationDelay: "240ms" }}>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3"><ChefHat size={16} className="text-primary" /> Use It Up — Recipes</h3>
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
