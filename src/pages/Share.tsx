import { useState } from "react";
import { MapPin, Plus, Clock, User, ChevronRight } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type FoodDrop = {
  id: number;
  title: string;
  emoji: string;
  description: string;
  postedBy: string;
  distance: string;
  timeLeft: string;
  lat: number;
  lng: number;
  status: "available" | "reserved";
};

const mockDrops: FoodDrop[] = [
  { id: 1, title: "Sealed bag of apples", emoji: "🍎", description: "6 organic apples, leaving for a trip tomorrow", postedBy: "Sarah M.", distance: "0.3 km", timeLeft: "18h left", lat: 3.152, lng: 101.714, status: "available" },
  { id: 2, title: "Unopened Greek yogurt", emoji: "🍦", description: "2 tubs, exp in 5 days. Moving out this weekend", postedBy: "Amir K.", distance: "0.7 km", timeLeft: "2d left", lat: 3.148, lng: 101.71, status: "available" },
  { id: 3, title: "Fresh bread loaf", emoji: "🍞", description: "Homemade sourdough, baked today. Too much for us!", postedBy: "Lin T.", distance: "1.2 km", timeLeft: "12h left", lat: 3.155, lng: 101.72, status: "available" },
  { id: 4, title: "Leftover curry (sealed)", emoji: "🍛", description: "Chicken curry for 3 servings, cooked today", postedBy: "Ravi P.", distance: "0.5 km", timeLeft: "6h left", lat: 3.145, lng: 101.718, status: "reserved" },
  { id: 5, title: "Mixed vegetables", emoji: "🥦", description: "Broccoli, carrots, bell peppers — still fresh", postedBy: "Mei W.", distance: "1.5 km", timeLeft: "1d left", lat: 3.158, lng: 101.706, status: "available" },
];

// Custom marker icon to avoid Leaflet's broken default icon in bundlers
const markerIcon = new L.DivIcon({
  html: `<div style="background:hsl(153 47% 30%);width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;font-size:14px;">📍</div>`,
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const reservedIcon = new L.DivIcon({
  html: `<div style="background:hsl(0 0% 70%);width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.15);display:flex;align-items:center;justify-content:center;font-size:14px;">✋</div>`,
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

export default function Share() {
  const [showAdd, setShowAdd] = useState(false);
  const [view, setView] = useState<"map" | "list">("map");

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

        {/* View toggle */}
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
          <input
            placeholder="What food are you sharing?"
            className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <textarea
            placeholder="Describe condition, quantity, pickup instructions…"
            rows={2}
            className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
          <button className="w-full bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold transition-all active:scale-[0.97]">
            Post Drop
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
            {mockDrops.map((drop) => (
              <Marker
                key={drop.id}
                position={[drop.lat, drop.lng]}
                icon={drop.status === "reserved" ? reservedIcon : markerIcon}
              >
                <Popup>
                  <div className="text-xs space-y-1 min-w-[140px]">
                    <p className="font-semibold">{drop.emoji} {drop.title}</p>
                    <p className="text-muted-foreground">{drop.description}</p>
                    <p className="text-primary font-medium">{drop.distance} away · {drop.timeLeft}</p>
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
          {mockDrops.map((drop) => (
            <div
              key={drop.id}
              className={`flex items-center gap-3 bg-card border rounded-xl p-3 transition-all ${
                drop.status === "reserved" ? "opacity-50" : ""
              }`}
            >
              <span className="text-2xl">{drop.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{drop.title}</p>
                <p className="text-xs text-muted-foreground">{drop.description}</p>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><User size={10} /> {drop.postedBy}</span>
                  <span className="flex items-center gap-1"><MapPin size={10} /> {drop.distance}</span>
                  <span className="flex items-center gap-1"><Clock size={10} /> {drop.timeLeft}</span>
                </div>
              </div>
              {drop.status === "available" ? (
                <button className="bg-primary text-primary-foreground text-[10px] font-semibold px-3 py-1.5 rounded-lg transition-all active:scale-[0.95]">
                  Claim
                </button>
              ) : (
                <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-muted text-muted-foreground">Reserved</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
