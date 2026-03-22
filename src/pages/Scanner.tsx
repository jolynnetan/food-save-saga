import { useState, useRef } from "react";
import { Camera, Upload, X, Lightbulb, ChefHat, Recycle } from "lucide-react";

type ScanResult = {
  items: string[];
  recipes: { name: string; emoji: string; time: string }[];
  tips: string[];
};

const mockResult: ScanResult = {
  items: ["Cooked rice", "Bell peppers", "Leftover chicken"],
  recipes: [
    { name: "Chicken Fried Rice", emoji: "🍳", time: "15 min" },
    { name: "Stuffed Bell Peppers", emoji: "🫑", time: "30 min" },
    { name: "Chicken Rice Bowl", emoji: "🍲", time: "10 min" },
  ],
  tips: [
    "Store leftover rice in an airtight container — it lasts 4-6 days in the fridge",
    "Freeze cooked chicken in portions for quick meals later",
    "Bell peppers last longer when stored whole, unwashed",
  ],
};

export default function Scanner() {
  const [image, setImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setResult(mockResult);
      setScanning(false);
    }, 2000);
  };

  const clear = () => {
    setImage(null);
    setResult(null);
  };

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
      <div className="animate-fade-up">
        <h2 className="text-2xl font-bold text-foreground text-balance">Leftover Scanner</h2>
        <p className="text-muted-foreground mt-1">Snap a photo of your leftovers to get recipe ideas</p>
      </div>

      {/* Upload area */}
      {!image ? (
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-primary/30 rounded-2xl p-8 flex flex-col items-center gap-4 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 active:scale-[0.98] animate-fade-up"
          style={{ animationDelay: "80ms" }}
        >
          <div className="bg-primary/10 rounded-2xl p-4">
            <Camera className="text-primary" size={32} />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">Take a photo or upload</p>
            <p className="text-sm text-muted-foreground mt-1">Show us what's left and we'll help you use it</p>
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
          <img src={image} alt="Your leftovers" className="w-full rounded-2xl object-cover max-h-64" />
          <button
            onClick={clear}
            className="absolute top-3 right-3 bg-foreground/60 text-background rounded-full p-1.5 hover:bg-foreground/80 transition-colors active:scale-[0.9]"
          >
            <X size={16} />
          </button>
          {!result && (
            <button
              onClick={handleScan}
              disabled={scanning}
              className="w-full mt-4 bg-primary text-primary-foreground rounded-xl py-3 font-semibold text-sm transition-all duration-200 active:scale-[0.97] disabled:opacity-60 shadow-lg shadow-primary/20"
            >
              {scanning ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" />
                  Analyzing...
                </span>
              ) : (
                "🔍 Analyze leftovers"
              )}
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Detected items */}
          <div className="bg-card border rounded-2xl p-4 animate-fade-up">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
              <Lightbulb size={16} className="text-warning" /> Detected Items
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.items.map((item) => (
                <span key={item} className="bg-secondary text-secondary-foreground text-xs font-medium px-3 py-1.5 rounded-full">
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Recipes */}
          <div className="bg-card border rounded-2xl p-4 animate-fade-up" style={{ animationDelay: "80ms" }}>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
              <ChefHat size={16} className="text-primary" /> Recipe Suggestions
            </h3>
            <div className="space-y-2">
              {result.recipes.map((recipe) => (
                <div key={recipe.name} className="flex items-center gap-3 bg-muted/50 rounded-xl p-3">
                  <span className="text-2xl">{recipe.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{recipe.name}</p>
                    <p className="text-xs text-muted-foreground">⏱ {recipe.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-card border rounded-2xl p-4 animate-fade-up" style={{ animationDelay: "160ms" }}>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
              <Recycle size={16} className="text-success" /> Storage Tips
            </h3>
            <ul className="space-y-2">
              {result.tips.map((tip, i) => (
                <li key={i} className="text-sm text-muted-foreground flex gap-2">
                  <span className="text-success mt-0.5">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
