import { useState, useEffect, useCallback } from "react";
import { UserPlus, Trophy, Flame, Leaf, Search, Copy, Check, X, Clock, Send, Smile, Zap, Heart, MessageSquare, UserX, ChevronRight, Inbox, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useT } from "@/contexts/SettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type FriendProfile = {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
};

type FriendRequest = {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: string;
  created_at: string;
  from_profile?: FriendProfile;
  to_profile?: FriendProfile;
};

type Friendship = {
  id: string;
  user_id: string;
  friend_id: string;
  created_at: string;
  friend_profile?: FriendProfile;
};

type FriendMessage = {
  id: string;
  from_user_id: string;
  to_user_id: string;
  message: string;
  emoji: string;
  type: string;
  created_at: string;
};

const interactionOptions = [
  { emoji: "🎉", label: "Cheer", message: "Great job saving food!", type: "cheer" },
  { emoji: "💪", label: "Nudge", message: "Let's reduce waste today!", type: "nudge" },
  { emoji: "🔥", label: "Streak", message: "Keep your streak going!", type: "nudge" },
  { emoji: "❤️", label: "Love", message: "You're inspiring!", type: "cheer" },
  { emoji: "🏆", label: "Challenge", message: "Let's compete this week!", type: "nudge" },
];

export default function Friends() {
  const t = useT();
  const { user } = useAuth();
  const { toast } = useToast();

  const [tab, setTab] = useState<"friends" | "requests" | "add">("friends");
  const [myCode, setMyCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [addCode, setAddCode] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");

  const [friends, setFriends] = useState<Friendship[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [messages, setMessages] = useState<FriendMessage[]>([]);
  const [interactFriend, setInteractFriend] = useState<Friendship | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch or create friend code
  const fetchMyCode = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("friend_codes")
      .select("code")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setMyCode(data.code);
    } else {
      const { data: codeData } = await supabase.rpc("generate_friend_code");
      const code = (codeData as string) || Math.random().toString(36).slice(2, 10).toUpperCase();
      const { error } = await supabase
        .from("friend_codes")
        .insert({ user_id: user.id, code });
      if (!error) setMyCode(code);
    }
  }, [user]);

  // Fetch friends
  const fetchFriends = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("friendships")
      .select("*")
      .eq("user_id", user.id);

    if (data && data.length > 0) {
      const friendIds = data.map(f => f.friend_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", friendIds);

      const enriched = data.map(f => ({
        ...f,
        friend_profile: profiles?.find(p => p.user_id === f.friend_id) || undefined,
      }));
      setFriends(enriched);
    } else {
      setFriends([]);
    }
  }, [user]);

  // Fetch requests
  const fetchRequests = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("friend_requests")
      .select("*")
      .eq("status", "pending")
      .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`);

    if (data && data.length > 0) {
      const userIds = Array.from(new Set(data.flatMap(r => [r.from_user_id, r.to_user_id])));
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      const enriched = data.map(r => ({
        ...r,
        from_profile: profiles?.find(p => p.user_id === r.from_user_id),
        to_profile: profiles?.find(p => p.user_id === r.to_user_id),
      }));
      setRequests(enriched);
    } else {
      setRequests([]);
    }
  }, [user]);

  // Fetch recent messages
  const fetchMessages = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("friend_messages")
      .select("*")
      .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setMessages(data);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([fetchMyCode(), fetchFriends(), fetchRequests(), fetchMessages()])
      .finally(() => setLoading(false));
  }, [user, fetchMyCode, fetchFriends, fetchRequests, fetchMessages]);

  const copyCode = () => {
    navigator.clipboard.writeText(myCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendRequest = async () => {
    if (!user || !addCode.trim()) return;
    const trimmed = addCode.trim().toUpperCase();
    if (trimmed === myCode) {
      toast({ title: "That's your own code!", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const { data: targetUserId } = await supabase.rpc("lookup_friend_code", { lookup_code: trimmed });
      if (!targetUserId) {
        toast({ title: "Code not found", description: "No user with that friend code.", variant: "destructive" });
        setSending(false);
        return;
      }
      // Check if already friends
      const { data: existing } = await supabase
        .from("friendships")
        .select("id")
        .eq("user_id", user.id)
        .eq("friend_id", targetUserId as string)
        .maybeSingle();
      if (existing) {
        toast({ title: "Already friends!", description: "You're already connected." });
        setSending(false);
        return;
      }
      // Check for existing request
      const { data: existingReq } = await supabase
        .from("friend_requests")
        .select("id, status")
        .eq("from_user_id", user.id)
        .eq("to_user_id", targetUserId as string)
        .maybeSingle();
      if (existingReq) {
        toast({ title: "Request already sent", description: `Status: ${existingReq.status}` });
        setSending(false);
        return;
      }
      const { error } = await supabase
        .from("friend_requests")
        .insert({ from_user_id: user.id, to_user_id: targetUserId as string });
      if (error) throw error;
      toast({ title: "Request sent! 🎉", description: "Waiting for them to accept." });
      setAddCode("");
      fetchRequests();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to send request.", variant: "destructive" });
    }
    setSending(false);
  };

  const acceptRequest = async (requestId: string) => {
    try {
      const { error } = await supabase.rpc("accept_friend_request", { request_id: requestId });
      if (error) throw error;
      toast({ title: "Friend added! 🤝" });
      fetchRequests();
      fetchFriends();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const declineRequest = async (requestId: string) => {
    await supabase.from("friend_requests").update({ status: "declined" }).eq("id", requestId);
    toast({ title: "Request declined" });
    fetchRequests();
  };

  const sendInteraction = async (friend: Friendship, option: typeof interactionOptions[0]) => {
    if (!user) return;
    const { error } = await supabase.from("friend_messages").insert({
      from_user_id: user.id,
      to_user_id: friend.friend_id,
      message: option.message,
      emoji: option.emoji,
      type: option.type,
    });
    if (error) {
      toast({ title: "Error sending", variant: "destructive" });
    } else {
      toast({ title: `${option.emoji} Sent!`, description: `${option.label} sent to ${friend.friend_profile?.display_name || "friend"}` });
      fetchMessages();
    }
    setInteractFriend(null);
  };

  const removeFriend = async (friendship: Friendship) => {
    await supabase.from("friendships").delete().eq("id", friendship.id);
    // Also remove reverse
    await supabase.from("friendships").delete()
      .eq("user_id", friendship.friend_id)
      .eq("friend_id", friendship.user_id);
    toast({ title: "Friend removed" });
    fetchFriends();
  };

  const pendingIncoming = requests.filter(r => r.to_user_id === user?.id);
  const pendingSent = requests.filter(r => r.from_user_id === user?.id);
  const filteredFriends = friends.filter(f =>
    (f.friend_profile?.display_name || "").toLowerCase().includes(search.toLowerCase())
  );

  // Recent messages for a friend
  const getRecentMessages = (friendId: string) =>
    messages.filter(m =>
      (m.from_user_id === friendId && m.to_user_id === user?.id) ||
      (m.from_user_id === user?.id && m.to_user_id === friendId)
    ).slice(0, 3);

  const getInitial = (name?: string | null) => (name || "?")[0].toUpperCase();

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
      {/* Header */}
      <div className="animate-fade-up">
        <h2 className="text-2xl font-bold text-foreground text-balance">{t("friends")}</h2>
        <p className="text-muted-foreground mt-1">{t("friendsDesc")}</p>
      </div>

      {/* My Unique ID Card */}
      <div className="bg-card border rounded-2xl p-4 animate-fade-up" style={{ animationDelay: "60ms" }}>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Your Unique ID</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-muted rounded-xl px-4 py-3 text-center">
            <span className="text-xl font-mono font-bold text-foreground tracking-[0.3em]">
              {myCode || "Loading..."}
            </span>
          </div>
          <button
            onClick={copyCode}
            disabled={!myCode}
            className="shrink-0 p-3 rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20 transition-all active:scale-95 btn-press"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">Share this ID with friends so they can add you</p>
      </div>

      {/* Tab navigation */}
      <div className="flex bg-muted rounded-xl p-1 animate-fade-up" style={{ animationDelay: "100ms" }}>
        {[
          { key: "friends" as const, label: "Friends", icon: Users, count: friends.length },
          { key: "requests" as const, label: "Requests", icon: Inbox, count: pendingIncoming.length },
          { key: "add" as const, label: "Add", icon: UserPlus, count: 0 },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-[0.97] relative ${
              tab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            <t.icon size={14} /> {t.label}
            {t.count > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Friends Tab */}
      {tab === "friends" && (
        <div className="space-y-3 animate-fade-up">
          {/* Search */}
          {friends.length > 0 && (
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search friends..."
                className="w-full bg-muted rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground mt-3">Loading friends...</p>
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl block mb-3">👋</span>
              <p className="text-sm font-semibold text-foreground">No friends yet</p>
              <p className="text-xs text-muted-foreground mt-1">Share your friend code or add someone by their code!</p>
              <button onClick={() => setTab("add")} className="mt-4 bg-primary text-primary-foreground rounded-xl px-5 py-2.5 text-sm font-semibold btn-press">
                Add Friends
              </button>
            </div>
          ) : (
            filteredFriends.map(friendship => {
              const name = friendship.friend_profile?.display_name || "Friend";
              const recentMsgs = getRecentMessages(friendship.friend_id);
              const lastMsg = recentMsgs[0];
              return (
                <div key={friendship.id} className="bg-card border rounded-2xl p-4 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                      {getInitial(name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{name}</p>
                      {lastMsg && (
                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                          {lastMsg.from_user_id === user?.id ? "You" : "Them"}: {lastMsg.emoji} {lastMsg.message}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setInteractFriend(friendship)}
                        className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors btn-press"
                        title="Interact"
                      >
                        <Send size={14} />
                      </button>
                      <button
                        onClick={() => removeFriend(friendship)}
                        className="p-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors btn-press"
                        title="Remove"
                      >
                        <UserX size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Recent interactions */}
                  {recentMsgs.length > 0 && (
                    <div className="mt-3 flex gap-1.5 flex-wrap">
                      {recentMsgs.map(msg => (
                        <span key={msg.id} className="inline-flex items-center gap-1 bg-muted rounded-full px-2 py-0.5 text-[10px] text-muted-foreground">
                          {msg.emoji} {msg.type}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Requests Tab */}
      {tab === "requests" && (
        <div className="space-y-4 animate-fade-up">
          {/* Incoming */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Incoming ({pendingIncoming.length})
            </h3>
            {pendingIncoming.length === 0 ? (
              <div className="bg-muted/50 rounded-2xl p-6 text-center">
                <span className="text-2xl">📭</span>
                <p className="text-xs text-muted-foreground mt-2">No pending requests</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingIncoming.map(req => (
                  <div key={req.id} className="bg-card border rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-warning/15 text-warning flex items-center justify-center text-sm font-bold shrink-0">
                      {getInitial(req.from_profile?.display_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{req.from_profile?.display_name || "Someone"}</p>
                      <p className="text-[10px] text-muted-foreground">Wants to be your friend</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => acceptRequest(req.id)}
                        className="p-2 rounded-xl bg-success/15 text-success hover:bg-success/25 transition-colors btn-press"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => declineRequest(req.id)}
                        className="p-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors btn-press"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sent */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Sent ({pendingSent.length})
            </h3>
            {pendingSent.length === 0 ? (
              <div className="bg-muted/50 rounded-2xl p-6 text-center">
                <span className="text-2xl">✉️</span>
                <p className="text-xs text-muted-foreground mt-2">No sent requests</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingSent.map(req => (
                  <div key={req.id} className="bg-card border rounded-2xl p-3.5 flex items-center gap-3 opacity-75">
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                      {getInitial(req.to_profile?.display_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{req.to_profile?.display_name || "User"}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock size={10} /> Pending</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Friend Tab */}
      {tab === "add" && (
        <div className="space-y-5 animate-fade-up">
          <div className="bg-card border rounded-2xl p-5">
            <h3 className="text-sm font-bold text-foreground mb-1">Add by Friend Code</h3>
            <p className="text-xs text-muted-foreground mb-4">Enter your friend's 8-character code to send them a request.</p>
            <div className="flex gap-2">
              <input
                value={addCode}
                onChange={e => setAddCode(e.target.value.toUpperCase().slice(0, 8))}
                placeholder="e.g. A1B2C3D4"
                maxLength={8}
                className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm font-mono tracking-widest text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 uppercase"
              />
              <button
                onClick={sendRequest}
                disabled={addCode.length < 8 || sending}
                className="shrink-0 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all btn-press"
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
          </div>

          {/* Share your code */}
          <div className="bg-primary/5 border border-primary/15 rounded-2xl p-5 text-center">
            <p className="text-sm font-semibold text-foreground mb-1">Or share your code</p>
            <p className="text-xs text-muted-foreground mb-3">Tell your friends to enter this code to connect with you</p>
            <div className="inline-flex items-center gap-2 bg-card border rounded-xl px-5 py-3">
              <span className="text-lg font-mono font-bold text-primary tracking-[0.3em]">{myCode}</span>
              <button onClick={copyCode} className="text-muted-foreground hover:text-primary transition-colors">
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interaction modal */}
      {interactFriend && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setInteractFriend(null)} />
          <div className="relative w-full max-w-lg bg-card border-t rounded-t-3xl p-5 pb-8 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-bold">
                  {getInitial(interactFriend.friend_profile?.display_name)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Send to {interactFriend.friend_profile?.display_name || "Friend"}
                  </h3>
                  <p className="text-[10px] text-muted-foreground">Pick a reaction to send</p>
                </div>
              </div>
              <button onClick={() => setInteractFriend(null)} className="p-2 rounded-xl hover:bg-muted transition-colors">
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {interactionOptions.map(opt => (
                <button
                  key={opt.label}
                  onClick={() => sendInteraction(interactFriend, opt)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-muted hover:bg-primary/10 hover:border-primary/20 border border-transparent transition-all btn-press"
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <span className="text-[10px] font-semibold text-foreground">{opt.label}</span>
                </button>
              ))}
            </div>

            {/* Recent interactions with this friend */}
            {(() => {
              const msgs = getRecentMessages(interactFriend.friend_id);
              if (msgs.length === 0) return null;
              return (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recent</p>
                  <div className="space-y-1.5">
                    {msgs.map(msg => (
                      <div key={msg.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{msg.emoji}</span>
                        <span className="flex-1 truncate">{msg.from_user_id === user?.id ? "You" : interactFriend.friend_profile?.display_name}: {msg.message}</span>
                        <span className="text-[10px] shrink-0">{new Date(msg.created_at).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
