import { icons3d } from "@/lib/assets3d";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { deleteMedia, getAdminAssetUrl, uploadImage } from "@/lib/media";
import { UserAvatar } from "@/components/UserAvatar";
import { AdminAssetMedia } from "@/components/AdminAssetMedia";
import { IdentityBadges } from "@/components/IdentityBadges";
import { useAdminAsset } from "@/lib/media";
import { useEffect, useState } from "react";
import { Camera, ChevronLeft, Crown, Heart, Mail, Settings, ShoppingBag, Users, Gift, Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { COUNTRIES, errMsg, flagOf } from "@/lib/vox";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "ملفي الشخصي — صدى شات" },
      { name: "description", content: "ملفك الشخصي ومستواك ومحفظتك في صدى شات." },
      { property: "og:title", content: "ملفي الشخصي — صدى شات" },
      { property: "og:description", content: "ملفك الشخصي ومستواك ومحفظتك." },
    ],
  }),
  component: () => (
    <AppShell>
      <ProfilePage />
    </AppShell>
  ),
});

type P = { id: string; display_no: number; display_name: string; avatar_url: string | null; bio: string | null; country: string | null; level: number; xp: number; vip_level: number; id_color?: string; name_color?: string; name_effect?: string; name_effect_speed?: number; equipped_frame?: string | null; equipped_entry?: string | null; chat_bubble_color?: string | null; profile_card_asset_key?: string | null };
type ProfileBadge = { user_id: string; badge_name: string; badge_asset_key?: string | null; badge_color?: string | null; is_equipped?: boolean };
function ProfilePage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [p, setP] = useState<P | null>(null);
  const [equippedBadges, setEquippedBadges] = useState<ProfileBadge[]>([]);
  const profileCardUrl = useAdminAsset(p?.profile_card_asset_key);
  const [draft, setDraft] = useState<P | null>(null);
  const [editing, setEditing] = useState(false);
  const [stats, setStats] = useState({ followers: 0, friends: 0, posts: 0, likes: 0, visitors: 0 });
  const [coins, setCoins] = useState(0);
  const [diamonds, setDiamonds] = useState(0);
  const [linkEmail, setLinkEmail] = useState("");
  const [phoneToLink, setPhoneToLink] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const isGuest = !!user?.is_anonymous;

  async function daily() {
    const { error } = await supabase.rpc("claim_daily_bonus");
    if (error) { toast.error(errMsg(error)); return; }
    toast.success("+100 عملة 🎉");
  }
  async function link() {
    const { error } = await supabase.auth.updateUser({ email: linkEmail.trim().toLowerCase() });
    if (error) { toast.error(error.message); return; }
    toast.success("أرسلنا رابط تأكيد إلى بريدك لربط الحساب");
  }

  async function sendPhoneLinkCode() {
    const value = phoneToLink.trim();
    if (!/^\+[1-9]\d{7,14}$/.test(value)) { toast.error("اكتب الرقم بصيغة دولية مثل +2010xxxxxxxx"); return; }
    const { error } = await supabase.auth.updateUser({ phone: value });
    if (error) { toast.error(error.message); return; }
    setPhoneOtpSent(true);
    toast.success("تم طلب رمز SMS لربط الرقم بالحساب الحالي");
  }

  async function verifyPhoneLinkCode() {
    if (!phoneOtp.trim()) return;
    const { error } = await supabase.auth.verifyOtp({ phone: phoneToLink.trim(), token: phoneOtp.trim(), type: "phone_change" });
    if (error) { toast.error(error.message); return; }
    setPhoneOtpSent(false);
    setPhoneOtp("");
    toast.success("تم تأكيد وربط رقم الهاتف بحسابك");
  }

  useEffect(() => {
    if (!user) return;
    let alive = true;
    const refreshBadges = async () => {
      const { data, error } = await supabase.from("user_badges").select("user_id,badge_name,badge_asset_key,badge_color,is_equipped").eq("user_id", user.id).eq("is_equipped", true);
      if (alive && !error) setEquippedBadges((data ?? []) as ProfileBadge[]);
    };
    const channel = supabase.channel(`profile-live-${user.id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` }, (payload) => {
        if (!alive) return;
        setP((current) => current ? ({ ...current, ...(payload.new as P) }) : (payload.new as P));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "user_badges", filter: `user_id=eq.${user.id}` }, () => { void refreshBadges(); })
      .subscribe();
    (async () => {
      const [{ data }, { data: w }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user!.id).single(),
        supabase.from("wallets").select("coins,diamonds").eq("user_id", user!.id).maybeSingle(),
      ]);
      if (data && alive) setP(data as P);
      if (w && alive) { setCoins(Number(w.coins ?? 0)); setDiamonds(Number(w.diamonds ?? 0)); }
      void refreshBadges();
    })();
    return () => { alive = false; void supabase.removeChannel(channel); };
  }, [user]);


  async function changeAvatar(f?: File) {
    if (!f || !p) return;
    try {
      const path = await uploadImage(f, p.id, "profile");
      const { error } = await supabase.from("profiles").update({ avatar_url: path }).eq("id", p.id);
      if (error) throw error;
      setP({ ...p, avatar_url: path });
      if (draft) setDraft({ ...draft, avatar_url: path });
      toast.success("تم تحديث الصورة");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "فشل الرفع");
    }
  }

  async function removeAvatar() {
    if (!p?.avatar_url) return;
    try {
      const previous = p.avatar_url;
      const { error } = await supabase.from("profiles").update({ avatar_url: null }).eq("id", p.id);
      if (error) throw error;
      setP({ ...p, avatar_url: null });
      if (draft) setDraft({ ...draft, avatar_url: null });
      await deleteMedia(previous).catch(() => undefined);
      toast.success("تم حذف صورة الحساب");
    } catch (e) { toast.error(e instanceof Error ? e.message : "فشل حذف الصورة"); }
  }

  async function save() {
    if (!draft) return;
    const { error } = await supabase.from("profiles").update({ display_name: draft.display_name.trim().slice(0, 30), bio: (draft.bio ?? "").slice(0, 200), country: draft.country, avatar_url: draft.avatar_url || null }).eq("id", draft.id);
    if (error) { toast.error(error.message); return; }
    setP(draft);
    setEditing(false);
    toast.success("تم الحفظ");
  }

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const [{ data: follows }, { data: posts }, visitAgg] = await Promise.all([
        supabase.from("follows").select("follower_id,following_id").or(`follower_id.eq.${user.id},following_id.eq.${user.id}`),
        supabase.from("posts").select("id").eq("user_id", user.id),
        supabase.from("profile_visits").select("visitor_id", { count: "exact", head: true }).eq("profile_id", user.id),
      ]);
      const rows = follows ?? [];
      const followerIds = new Set(rows.filter((r) => r.following_id === user.id).map((r) => r.follower_id));
      const followingIds = new Set(rows.filter((r) => r.follower_id === user.id).map((r) => r.following_id));
      const friends = [...followerIds].filter((id) => followingIds.has(id)).length;
      const postIds = (posts ?? []).map((r) => r.id);
      let likes = 0;
      if (postIds.length) {
        const { count } = await supabase.from("post_likes").select("post_id", { count: "exact", head: true }).in("post_id", postIds);
        likes = count ?? 0;
      }
      if (!cancelled) setStats({ followers: followerIds.size, friends, posts: postIds.length, likes, visitors: visitAgg.count ?? 0 });
    })();
    return () => { cancelled = true; };
  }, [user]);

  if (!p) return null;
  const shown = editing && draft ? draft : p;
  const fmtCoins = coins >= 1000 ? (coins / 1000).toFixed(2) + "k" : coins.toLocaleString();

  return (
    <div dir="rtl" className="profile-reference min-h-screen pb-8" style={{ background: "linear-gradient(180deg, #e0f2f1 0%, #f5f5f5 40%, #f5f5f5 100%)" }}>
      {/* Header with avatar, name, badges, ID */}
      <div className="relative px-4 pt-6">
        <Link to="/" className="absolute left-4 top-6 rounded-full bg-white/60 p-2 text-gray-700 shadow-sm">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <div className="flex flex-col items-center">
          <div className="relative">
            <UserAvatar src={shown.avatar_url} name={shown.display_name} size={120} ring vip={p.vip_level} frameKey={p.equipped_frame} />
            <label className="absolute bottom-1 right-1 cursor-pointer rounded-full bg-white p-1.5 shadow-md">
              <Camera className="h-4 w-4 text-gray-600" />
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { void changeAvatar(e.target.files?.[0]); e.currentTarget.value = ""; }} />
            </label>
          </div>
          <h2 className="mt-3 text-2xl font-bold text-gray-900">{flagOf(shown.country)} {shown.display_name}</h2>
          <div className="mt-1 flex items-center gap-1.5 text-gray-500">
            <span className="text-sm">ID:{p.display_no}</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-pink-500 px-2 py-0.5 text-xs font-bold text-white">
              <Heart className="h-3 w-3" /> {p.level}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
              <Crown className="h-3 w-3" /> {p.vip_level || 0}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-5 flex items-center justify-around">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.visitors}</div>
            <div className="text-xs text-gray-500">الزوار</div>
          </div>
          <div className="h-8 w-px bg-gray-300" />
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.followers}</div>
            <div className="text-xs text-gray-500">المعجبين</div>
          </div>
          <div className="h-8 w-px bg-gray-300" />
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.friends}</div>
            <div className="text-xs text-gray-500">متابعة</div>
          </div>
        </div>
      </div>

      {/* VIP banner */}
      <div className="mx-4 mt-5 overflow-hidden rounded-2xl p-4" style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-8 w-8 text-yellow-400" />
            <span className="text-xl font-bold text-yellow-400">VIP</span>
          </div>
          <div className="text-right">
            <div className="text-sm text-white/80">افتح النبلاء للتمتع بامتياز..</div>
          </div>
          <Link to="/vip" className="rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-900">
            عرض التفاصيل
          </Link>
        </div>
      </div>

      {/* Balance cards */}
      <div className="mx-4 mt-4 grid grid-cols-2 gap-3">
        <Link to="/diamonds" className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
          <div>
            <div className="text-2xl font-bold text-gray-900">{diamonds.toFixed(2)}</div>
            <div className="text-xs text-gray-500">Amount</div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100">
            <span className="text-2xl">💎</span>
          </div>
        </Link>
        <Link to="/wallet" className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
          <div>
            <div className="text-2xl font-bold text-gray-900">{fmtCoins}</div>
            <div className="text-xs text-gray-500">Coin</div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
            <Star className="h-6 w-6 text-yellow-500" fill="currentColor" />
          </div>
        </Link>
      </div>

      {/* Quick actions */}
      <div className="mx-4 mt-4 grid grid-cols-4 gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <Link to="/friends" className="flex flex-col items-center gap-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
            <Mail className="h-6 w-6 text-blue-500" />
          </div>
          <span className="text-xs text-gray-700">دعوة</span>
        </Link>
        <Link to="/tasks" className="flex flex-col items-center gap-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
            <Gift className="h-6 w-6 text-purple-500" />
          </div>
          <span className="text-xs text-gray-700">المهام</span>
        </Link>
        <Link to="/store" className="flex flex-col items-center gap-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-100">
            <ShoppingBag className="h-6 w-6 text-pink-500" />
          </div>
          <span className="text-xs text-gray-700">متجر</span>
        </Link>
        <Link to="/level" className="flex flex-col items-center gap-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100">
            <Star className="h-6 w-6 text-yellow-600" fill="currentColor" />
          </div>
          <span className="text-xs text-gray-700">المستوى</span>
        </Link>
      </div>

      {/* Settings list */}
      <div className="mx-4 mt-4 overflow-hidden rounded-2xl bg-white shadow-sm">
        <Link to="/bag" className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100">
              <ShoppingBag className="h-5 w-5 text-orange-500" />
            </div>
            <span className="text-gray-800">حقيبة الظهر</span>
          </div>
          <ChevronLeft className="h-5 w-5 text-gray-400" />
        </Link>
        <Link to="/families" className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-100">
              <Users className="h-5 w-5 text-yellow-600" />
            </div>
            <span className="text-gray-800">الوكالة</span>
          </div>
          <ChevronLeft className="h-5 w-5 text-gray-400" />
        </Link>
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-100 text-sm font-bold text-pink-600">
              EN
            </div>
            <span className="text-gray-800">اللغة</span>
          </div>
          <ChevronLeft className="h-5 w-5 text-gray-400" />
        </div>
        <Link to="/settings" className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
              <Settings className="h-5 w-5 text-gray-600" />
            </div>
            <span className="text-gray-800">الإعدادات</span>
          </div>
          <ChevronLeft className="h-5 w-5 text-gray-400" />
        </Link>
      </div>

      {/* Edit profile section */}
      {editing && draft ? (
        <div className="mx-4 mt-4 space-y-3 rounded-2xl bg-white p-4 shadow-sm">
          <Input value={draft.display_name} maxLength={30} onChange={(e) => setDraft({ ...draft, display_name: e.target.value })} placeholder="الاسم" />
          <Textarea value={draft.bio ?? ""} maxLength={200} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} placeholder="نبذة" />
          <select className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" value={draft.country ?? "EG"} onChange={(e) => setDraft({ ...draft, country: e.target.value })}>
            {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
          </select>
          <div className="flex gap-2">
            <Button onClick={save} className="flex-1 bg-emerald-500">حفظ</Button>
            <Button variant="outline" onClick={() => setEditing(false)}>إلغاء</Button>
          </div>
        </div>
      ) : (
        <div className="mx-4 mt-4 space-y-2">
          <Button variant="outline" onClick={() => { setDraft(p); setEditing(true); }} className="w-full rounded-xl border-gray-300 bg-white">
            <Settings className="h-5 w-5" /> تعديل الملف
          </Button>
          <Button onClick={daily} className="w-full rounded-xl bg-emerald-500 font-bold text-white">
            <Gift className="h-5 w-5" /> مكافأة يومية +100
          </Button>
          {isGuest && (
            <div className="rounded-2xl bg-white p-3 text-sm shadow-sm">
              <p className="text-emerald-600">أنت تستخدم حساب الجهاز السريع. اربط بريدك حتى لا تفقد حسابك.</p>
              <div className="mt-2 flex gap-2"><Input type="email" dir="ltr" value={linkEmail} onChange={(e) => setLinkEmail(e.target.value)} placeholder="email@example.com" /><Button onClick={link} variant="outline">ربط</Button></div>
            </div>
          )}
          <Button variant="outline" onClick={async () => {
            if (isGuest) {
              const { data: cur, error } = await supabase.auth.getSession();
              if (error || !cur.session?.user?.is_anonymous) {
                toast.error("تعذر حفظ جلسة الحساب السريع. حاول مرة أخرى.");
                return;
              }
              localStorage.setItem("vox_guest_refresh", cur.session.refresh_token);
              localStorage.setItem("vox_guest_account_created", "1");
              localStorage.setItem("vox_guest_logged_out", "1");
              window.dispatchEvent(new Event("vox-auth-visibility-change"));
            } else {
              await supabase.auth.signOut();
            }
            nav({ to: "/auth" });
          }} className="w-full rounded-xl">
            تسجيل الخروج
          </Button>
        </div>
      )}
    </div>
  );
}
