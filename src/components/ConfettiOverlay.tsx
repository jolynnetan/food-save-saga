import { useGamification } from "@/contexts/GamificationContext";
import { useEffect, useState } from "react";

const PARTICLE_COUNT = 40;
const COLORS = ["#22c55e", "#eab308", "#f97316", "#a855f7", "#3b82f6", "#ec4899", "#14b8a6"];

type Particle = { x: number; y: number; color: string; size: number; rotation: number; speedX: number; speedY: number; };

export default function ConfettiOverlay() {
  const { showConfetti, confettiMessage, dismissConfetti } = useGamification();
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!showConfetti) return;
    const p: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 6 + Math.random() * 8,
      rotation: Math.random() * 360,
      speedX: (Math.random() - 0.5) * 3,
      speedY: 2 + Math.random() * 4,
    }));
    setParticles(p);
  }, [showConfetti]);

  if (!showConfetti) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none" onClick={dismissConfetti}>
      {/* Confetti particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg)`,
            animation: `confetti-fall ${1.5 + Math.random() * 1.5}s ease-in forwards`,
            animationDelay: `${Math.random() * 0.5}s`,
          }}
        />
      ))}

      {/* Message */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
        <div
          className="bg-card/95 backdrop-blur-xl border border-primary/30 rounded-3xl px-8 py-6 shadow-soft-xl text-center max-w-xs"
          style={{ animation: "confetti-popup 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
          onClick={dismissConfetti}
        >
          <p className="text-lg font-bold text-foreground">{confettiMessage}</p>
          <p className="text-xs text-muted-foreground mt-2">Tap to dismiss</p>
        </div>
      </div>
    </div>
  );
}
