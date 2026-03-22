import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Camera, Upload, MapPin, Package, Heart, Clock, Users, ChevronDown, Check, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

type DonationPoint = {
  id: string;
  name: string;
  description: string | null;
  address: string;
  lat: number;
  lng: number;
  ngo_name: string;
  contact_info: string | null;
  operating_hours: string | null;
  current_stock_level: string | null;
  emoji: string | null;
};

const availableItems: Record<string, string[]> = {
  "KL Food Aid Center": ["Rice 5kg", "Canned sardines", "Cooking oil 1L", "Instant noodles x5"],
  "Bangsar Community Pantry": ["Fresh vegetables", "Bread loaves", "Eggs (tray)", "UHT Milk 1L"],
  "Cheras Hope Kitchen": ["Rice 10kg", "Canned tuna", "Sugar 1kg", "Flour 1kg", "Biscuits"],
  "Petaling Jaya Food Bank": ["Dried pasta", "Cereal boxes", "Canned beans", "Cooking oil 2L", "Salt"],
  "Sentul Relief Point": ["Baby formula", "Diapers", "Rice 5kg", "Canned food assorted"],
};

type Tab = "collect" | "restock" | "activity";

const stockColors: Record<string, string> = {
  low: "text-destructive bg-destructive/10",
  medium: "text-warning bg-warning/10",
  high: "text-success bg-success/10",
};

const foodbankIcon = new L.DivIcon({
  html: `<div style="background:hsl(25 90% 50%);width:32px;height:32px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;font-size:16px;">🏪</div>`,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const lowStockIcon = new L.DivIcon({
  html: `<div style="background:hsl(0 70% 55%);width:32px;height:32px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;font-size:16px;">🆘</div>`,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

export default function Foodbank() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("collect");
  const [points, setPoints] = useState<DonationPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<DonationPoint | null>(null);

  // Restock form state
  const [restockPointId, setRestockPointId] = useState("");
  const [restockItems, setRestockItems] = useState("");
  const [restockNotes, setRestockNotes] = useState("");
  const [restockPhoto, setRestockPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Collect form state
  const [collectPointId, setCollectPointId] = useState("");
  const [collectItems, setCollectItems] = useState("");

  // Activity log
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchPoints();
    fetchActivity();
  }, []);

  async function fetchPoints() {
    const { data } = await supabase.from("donation_points").select("*");
    if (data) setPoints(data);
    setLoading(false);
  }

  async function fetchActivity() {
    if (!user) return;
    const { data: restocks } = await supabase
      .from("restock_logs")
      .select("*, donation_points(name, emoji)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    const { data: collections } = await supabase
      .from("food_collections")
      .select("*, donation_points(name, emoji)")
      .eq("user_id", user.id)
      .order("collected_at", { ascending: false })
      .limit(20);

    const combined = [
      ...(restocks || []).map((r: any) => ({ ...r, type: "restock" as const })),
      ...(collections || []).map((c: any) => ({ ...c, type: "collect" as const, created_at: c.collected_at })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setActivityLogs(combined);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setRestockPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  }

  async function handleRestock() {
    if (!user || !restockPointId) return;
    setSubmitting(true);

    let photoUrl: string | null = null;

    if (restockPhoto) {
      const ext = restockPhoto.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("restock-photos")
        .upload(path, restockPhoto);

      if (uploadErr) {
        toast({ title: "Upload failed", description: uploadErr.message, variant: "destructive" });
        setSubmitting(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("restock-photos")
        .getPublicUrl(path);
      photoUrl = urlData.publicUrl;
    }

    const { error } = await supabase.from("restock_logs").insert({
      user_id: user.id,
      donation_point_id: restockPointId,
      items_donated: restockItems,
      notes: restockNotes,
      photo_url: photoUrl,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Thank you! 🎉", description: "Your restock has been logged." });
      setRestockPointId("");
      setRestockItems("");
      setRestockNotes("");
      setRestockPhoto(null);
      setPhotoPreview(null);
      fetchActivity();
    }
    setSubmitting(false);
  }

  async function handleCollect() {
    if (!user || !collectPointId) return;
    setSubmitting(true);

    const { error } = await supabase.from("food_collections").insert({
      user_id: user.id,
      donation_point_id: collectPointId,
      items_collected: collectItems,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Collected! 🙌", description: "Hope it helps. Every meal matters." });
      setCollectPointId("");
      setCollectItems("");
      fetchActivity();
    }
    setSubmitting(false);
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "collect", label: "Collect", icon: <Heart size={14} /> },
    { key: "restock", label: "Restock", icon: <Package size={14} /> },
    { key: "activity", label: "Activity", icon: <Clock size={14} /> },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 space-y-3 animate-fade-up">
        <div>
          <h2 className="text-2xl font-bold text-foreground text-balance">Foodbank</h2>
          <p className="text-muted-foreground mt-1">Partner with NGOs · Collect or Restock</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-muted rounded-xl p-1 gap-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-medium py-2 rounded-lg transition-all duration-200 ${
                tab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="mx-4 mb-3 rounded-2xl overflow-hidden border animate-fade-up h-48" style={{ animationDelay: "60ms" }}>
        {!loading && (
          <MapContainer
            center={[3.14, 101.69]}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {points.map((p) => (
              <Marker
                key={p.id}
                position={[p.lat, p.lng]}
                icon={p.current_stock_level === "low" ? lowStockIcon : foodbankIcon}
                eventHandlers={{
                  click: () => setSelectedPoint(p),
                }}
              >
                <Popup>
                  <div className="text-xs space-y-1 min-w-[160px]">
                    <p className="font-semibold">{p.emoji} {p.name}</p>
                    <p className="text-gray-500">{p.ngo_name}</p>
                    <p className="text-gray-500">{p.address}</p>
                    <p className="text-gray-400">{p.operating_hours}</p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${stockColors[p.current_stock_level || "medium"]}`}>
                      Stock: {p.current_stock_level}
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Content by tab */}
      <div className="flex-1 px-4 pb-4 overflow-y-auto">
        {/* Collect Tab */}
        {tab === "collect" && (
          <div className="space-y-3 animate-fade-up" style={{ animationDelay: "120ms" }}>
            <h3 className="text-sm font-semibold text-foreground">Available Foodbanks</h3>
            {points.map((p) => (
              <div
                key={p.id}
                className={`bg-card border rounded-2xl p-4 space-y-2 transition-all duration-200 ${
                  collectPointId === p.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setCollectPointId(p.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{p.emoji}</span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground">{p.ngo_name}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${stockColors[p.current_stock_level || "medium"]}`}>
                    {p.current_stock_level === "low" ? "Needs restock" : p.current_stock_level === "high" ? "Well stocked" : "Moderate"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin size={10} /> {p.address}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">{p.operating_hours}</p>

                {/* Available items */}
                {(availableItems[p.name] || []).length > 0 && (
                  <div className="pt-1.5 space-y-1">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Available Items</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(availableItems[p.name] || []).map((item) => (
                        <span key={item} className="inline-block bg-primary/10 text-primary text-[10px] font-medium px-2 py-0.5 rounded-full">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {collectPointId === p.id && (
                  <div className="pt-2 space-y-2 border-t animate-fade-up">
                    <input
                      value={collectItems}
                      onChange={(e) => setCollectItems(e.target.value)}
                      placeholder="What items will you collect?"
                      className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <button
                      onClick={handleCollect}
                      disabled={submitting || !collectItems}
                      className="w-full bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-50"
                    >
                      {submitting ? "Logging..." : "Log Collection"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Restock Tab */}
        {tab === "restock" && (
          <div className="space-y-4 animate-fade-up" style={{ animationDelay: "120ms" }}>
            <div className="bg-card border rounded-2xl p-4 space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Upload size={16} className="text-primary" /> Log a Restock
              </h3>

              {/* Select foodbank */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Select Foodbank</label>
                <select
                  value={restockPointId}
                  onChange={(e) => setRestockPointId(e.target.value)}
                  className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none"
                >
                  <option value="">Choose a location…</option>
                  {points.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.emoji} {p.name} — {p.ngo_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Items */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Items Donated</label>
                <input
                  value={restockItems}
                  onChange={(e) => setRestockItems(e.target.value)}
                  placeholder="e.g. 5kg rice, canned tuna x3, milk 2L"
                  className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Notes (optional)</label>
                <textarea
                  value={restockNotes}
                  onChange={(e) => setRestockNotes(e.target.value)}
                  placeholder="Any notes about the donation…"
                  rows={2}
                  className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>

              {/* Photo upload */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Upload Photo Proof</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Restock preview"
                      className="w-full h-40 object-cover rounded-xl border"
                    />
                    <button
                      onClick={() => { setRestockPhoto(null); setPhotoPreview(null); }}
                      className="absolute top-2 right-2 bg-background/80 backdrop-blur rounded-full p-1 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-muted-foreground/30 rounded-xl py-6 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/40 transition-colors"
                  >
                    <Camera size={24} />
                    <span className="text-xs">Tap to take photo or upload</span>
                  </button>
                )}
              </div>

              <button
                onClick={handleRestock}
                disabled={submitting || !restockPointId || !restockItems}
                className="w-full bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Submit Restock 📦"}
              </button>
            </div>

            {/* Low stock alerts */}
            {points.filter((p) => p.current_stock_level === "low").length > 0 && (
              <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-4 space-y-2">
                <h4 className="text-sm font-semibold text-destructive flex items-center gap-1.5">
                  🆘 Low Stock Alerts
                </h4>
                {points
                  .filter((p) => p.current_stock_level === "low")
                  .map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-xs">
                      <span className="text-foreground">{p.emoji} {p.name}</span>
                      <button
                        onClick={() => { setRestockPointId(p.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        className="text-primary font-semibold"
                      >
                        Restock →
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Activity Tab */}
        {tab === "activity" && (
          <div className="space-y-2 animate-fade-up" style={{ animationDelay: "120ms" }}>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Users size={16} className="text-primary" /> Your Activity
            </h3>
            {activityLogs.length === 0 ? (
              <div className="bg-card border rounded-2xl p-8 text-center space-y-2">
                <span className="text-3xl">📋</span>
                <p className="text-sm text-muted-foreground">No activity yet. Start by collecting or restocking!</p>
              </div>
            ) : (
              activityLogs.map((log) => (
                <div key={log.id} className="bg-card border rounded-xl p-3 flex items-start gap-3">
                  <span className="text-lg mt-0.5">
                    {log.type === "restock" ? "📦" : "🤲"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {log.type === "restock" ? "Restocked" : "Collected from"}{" "}
                      {log.donation_points?.name || "Foodbank"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {log.type === "restock" ? log.items_donated : log.items_collected}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(log.created_at).toLocaleDateString("en-MY", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {log.photo_url && (
                    <img
                      src={log.photo_url}
                      alt="Restock"
                      className="w-12 h-12 rounded-lg object-cover border"
                    />
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
