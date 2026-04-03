import { useState, useEffect } from "react";
import { MapPin, Plus, Clock, User } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type FoodDrop = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  posted_by_name: string;
  lat: number;
  lng: number;
  expires_at: string;
  status: string;
  user_id: string;
  claimed_by: string | null;
  created_at: string;
};

const markerIcon = new L.DivIcon({
  html: `<div style="background:hsl(153 47% 30%);width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;font-size:14px;">📍</div>`,
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const claimedIcon = new L.DivIcon({
  html: `<div style="background:hsl(0 0% 70%);width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.15);display:flex;align-items:center;justify-content:center;font-size:14px;">✋</div>`,
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function getTimeLeft(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours}h left`;
  return `${Math.floor(hours / 24)}d left`;
}

export default function Share() {
  const { user } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [view, setView] = useState<"map" | "list">("map");
  const [drops, setDrops] = useState<FoodDrop[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [claiming, setClaiming] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("🍽️");
  const [description, setDescription] = useState("");
  const [hoursValid, setHoursValid] = useState("24");

  const fetchDrops = async () => {
    const { data, error } = await supabase
      .from("food_drops")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setDrops(data as FoodDrop[]);
    setLoading(false);
  };

  useEffect(() => { fetchDrops(); }, []);

  const handlePost = async () => {
    if (!user) return toast.error("Please sign in to post a food drop");
    if (!title.trim()) return toast.error("Please enter a food title");

    setPosting(true);
    try {
      // Get user display name
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .single();

      const displayName = profile?.display_name || user.email?.split("@")[0] || "Anonymous";
      const expiresAt = new Date(Date.now() + parseInt(hoursValid) * 3600000).toISOString();

      // Default location (KL center) with small random offset
      const lat = 3.152 + (Math.random() - 0.5) * 0.02;
      const lng = 101.714 + (Math.random() - 0.5) * 0.02;

      const { error } = await supabase.from("food_drops").insert({
        user_id: user.id,
        title: title.trim(),
        emoji,
        description: description.trim(),
        posted_by_name: displayName,
        lat,
        lng,
        expires_at: expiresAt,
        status: "available",
      });

      if (error) throw error;
      toast.success("Food drop posted! 🎉");
      setTitle("");
      setEmoji("🍽️");
      setDescription("");
      setHoursValid("24");
      setShowAdd(false);
      fetchDrops();
    } catch (e: any) {
      toast.error(e.message || "Failed to post drop");
    } finally {
      setPosting(false);
    }
  };

  const handleClaim = async (dropId: string) => {
    if (!user) return toast.error("Please sign in to claim food");
    setClaiming(dropId);
    try {
      const { error } = await supabase.rpc("claim_food_drop", { drop_id: dropId });
      if (error) throw error;
      toast.success("Food claimed! Contact the poster for pickup 🙌");
      fetchDrops();
    } catch (e: any) {
      toast.error(e.message || "Failed to claim");
    } finally {
      setClaiming(null);
    }
  };

  const emojiOptions = ["🍽️", "🍎", "🍞", "🍛", "🥦", "🍦", "🥗", "🍰", "🧁", "🥚"];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 space-y-3 animate-fade-up">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground text-balance">Food Drop</h2>
            <p className="text-muted-foreground mt-1">Share surplus food nearby</p>
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="bg-primary text-primary-foreground rounded-full p-2.5 shadow-lg shadow-primary/20 transition-all duration-200 active:scale-[0.9]"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="flex bg-muted rounded-xl p-1 gap-1">
          {(["map", "list"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex-1 text-sm font-medium py-2 rounded-lg transition-all duration-200 ${
                view === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {v === "map" ? "📍 Map" : "📋 List"}
            </button>
          ))}
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="mx-4 mb-3 bg-card border rounded-2xl p-4 animate-scale-in space-y-3">
          <h3 className="text-sm font-semibold text-foreground">List a food drop</h3>
          <div className="flex gap-2 flex-wrap">
            {emojiOptions.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`text-xl p-1.5 rounded-lg transition-all ${emoji === e ? "bg-primary/20 ring-2 ring-primary" : "bg-muted"}`}
              >
                {e}
              </button>
            ))}
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What food are you sharing?"
            className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe condition, quantity, pickup instructions…"
            rows={2}
            className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
          <select
            value={hoursValid}
            onChange={(e) => setHoursValid(e.target.value)}
            className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="6">Available for 6 hours</option>
            <option value="12">Available for 12 hours</option>
            <option value="24">Available for 24 hours</option>
            <option value="48">Available for 2 days</option>
          </select>
          <button
            onClick={handlePost}
            disabled={posting}
            className="w-full bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-50"
          >
            {posting ? "Posting…" : "Post Drop"}
          </button>
        </div>
      )}

      {/* Map view */}
      {view === "map" && (
        <div className="flex-1 mx-4 mb-3 rounded-2xl overflow-hidden border animate-fade-up" style={{ animationDelay: "80ms" }}>
          <MapContainer
            center={[3.152, 101.714]}
            zoom={14}
            style={{ height: "100%", width: "100%" }}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {drops.map((drop) => (
              <Marker
                key={drop.id}
                position={[drop.lat, drop.lng]}
                icon={drop.status !== "available" ? claimedIcon : markerIcon}
              >
                <Popup>
                  <div className="text-xs space-y-1 min-w-[140px]">
                    <p className="font-semibold">{drop.emoji} {drop.title}</p>
                    <p className="text-muted-foreground">{drop.description}</p>
                    <p className="font-medium">{drop.posted_by_name} · {getTimeLeft(drop.expires_at)}</p>
                    {drop.status === "available" && (
                      <button
                        onClick={() => handleClaim(drop.id)}
                        className="mt-1 bg-green-600 text-white text-[10px] font-semibold px-3 py-1 rounded-lg"
                      >
                        Claim
                      </button>
                    )}
                    {drop.status === "claimed" && (
                      <span className="text-[10px] font-semibold text-muted-foreground">Claimed</span>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      {/* List view */}
      {view === "list" && (
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 animate-fade-up" style={{ animationDelay: "80ms" }}>
          {loading && <p className="text-center text-muted-foreground text-sm py-8">Loading…</p>}
          {!loading && drops.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-3xl mb-2">🍽️</p>
              <p className="text-sm">No food drops yet. Be the first to share!</p>
            </div>
          )}
          {drops.map((drop) => (
            <div
              key={drop.id}
              className={`flex items-center gap-3 bg-card border rounded-xl p-3 transition-all ${
                drop.status !== "available" ? "opacity-50" : ""
              }`}
            >
              <span className="text-2xl">{drop.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{drop.title}</p>
                <p className="text-xs text-muted-foreground">{drop.description}</p>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><User size={10} /> {drop.posted_by_name}</span>
                  <span className="flex items-center gap-1"><Clock size={10} /> {getTimeLeft(drop.expires_at)}</span>
                </div>
              </div>
              {drop.status === "available" ? (
                <button
                  onClick={() => handleClaim(drop.id)}
                  disabled={claiming === drop.id}
                  className="bg-primary text-primary-foreground text-[10px] font-semibold px-3 py-1.5 rounded-lg transition-all active:scale-[0.95] disabled:opacity-50"
                >
                  {claiming === drop.id ? "…" : "Claim"}
                </button>
              ) : (
                <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-muted text-muted-foreground">Claimed</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
