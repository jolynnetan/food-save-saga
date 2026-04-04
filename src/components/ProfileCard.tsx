import { useState, useEffect, useCallback } from "react";
import { User, Copy, Check, Pencil, Save, X, Cake } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function ProfileCard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState("");
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [friendCode, setFriendCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [birthday, setBirthday] = useState<string>("");
  const [editingBirthday, setEditingBirthday] = useState(false);
  const [editBirthday, setEditBirthday] = useState("");
  const [savingBirthday, setSavingBirthday] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("display_name, birthday")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data?.display_name) setDisplayName(data.display_name);
    else setDisplayName(user.email?.split("@")[0] || "User");
    if (data?.birthday) setBirthday(data.birthday);
  }, [user]);

  const fetchCode = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("friend_codes")
      .select("code")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data) {
      setFriendCode(data.code);
    } else {
      const { data: codeData } = await supabase.rpc("generate_friend_code");
      const code = (codeData as string) || Math.random().toString(36).slice(2, 10).toUpperCase();
      await supabase.from("friend_codes").insert({ user_id: user.id, code });
      setFriendCode(code);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
    fetchCode();
  }, [fetchProfile, fetchCode]);

  const handleSave = async () => {
    if (!user || !editName.trim()) return;
    const trimmed = editName.trim().slice(0, 50);
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: trimmed })
      .eq("user_id", user.id);
    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    } else {
      setDisplayName(trimmed);
      setEditing(false);
      toast({ title: "Profile updated! ✅" });
    }
    setSaving(false);
  };

  const handleSaveBirthday = async () => {
    if (!user || !editBirthday) return;
    setSavingBirthday(true);
    const { error } = await supabase
      .from("profiles")
      .update({ birthday: editBirthday } as any)
      .eq("user_id", user.id);
    if (error) {
      toast({ title: "Error saving birthday", description: error.message, variant: "destructive" });
    } else {
      setBirthday(editBirthday);
      setEditingBirthday(false);
      toast({ title: "Birthday saved! 🎂" });
    }
    setSavingBirthday(false);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(friendCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatBirthday = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  };

  const initial = (displayName || "U")[0].toUpperCase();

  return (
    <div className="bg-card border rounded-2xl p-4 space-y-4">
      {/* Avatar + Name */}
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center text-xl font-bold text-primary-foreground shadow-primary-glow shrink-0">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                maxLength={50}
                autoFocus
                className="flex-1 bg-muted rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Display name"
                onKeyDown={e => e.key === "Enter" && handleSave()}
              />
              <button onClick={handleSave} disabled={saving} className="p-1.5 rounded-lg bg-success/15 text-success hover:bg-success/25 transition-colors">
                <Save size={14} />
              </button>
              <button onClick={() => setEditing(false)} className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-base font-bold text-foreground truncate">{displayName}</p>
              <button
                onClick={() => { setEditName(displayName); setEditing(true); }}
                className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
              >
                <Pencil size={12} />
              </button>
            </div>
          )}
          <p className="text-[11px] text-muted-foreground truncate mt-0.5">{user?.email}</p>
        </div>
      </div>

      {/* Unique ID */}
      <div className="bg-muted/50 rounded-xl p-3">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Your Unique ID</p>
        <div className="flex items-center gap-2">
          <span className="flex-1 text-sm font-mono font-bold text-foreground tracking-[0.2em]">{friendCode || "..."}</span>
          <button
            onClick={copyCode}
            disabled={!friendCode}
            className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
        <p className="text-[9px] text-muted-foreground mt-1">Share this ID so friends can add you</p>
      </div>
    </div>
  );
}
