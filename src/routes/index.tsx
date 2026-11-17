import { icons3d, roomBackground } from "@/lib/assets3d";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Users, Lock, Bell, Home, Trophy, Menu, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { MediaImage } from "@/components/UserAvatar";
import { AdminAssetMedia } from "@/components/AdminAssetMedia";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CATEGORIES, COUNTRIES, SEAT_OPTIONS, catName, errMsg, flagOf } from "@/lib/vox";
import { getAdminAssetUrl } from "@/lib/media";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "الغرف الصوتية — صدي شات" },
      { name: "description", content: "اكتشف الغرف الصوتية الشائعة والجديدة حسب الدولة والتصنيف." },
      { property: "og:title", content: "الغرف الصوتية — صدي شات" },
      { property: "og:description", content: "اكتشف الغرف الصوتية الشائعة والجديدة." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { create?: number } => (s["create"] ? { create: 1 } : {}),
  component: HomeRouteComponent,
});

type Room = { id: string; room_no: number; name: string; description: string | null; category: string; country: string; member_count: number; is_private: boolean; seat_count: number; created_at: string; cover_url?: string | null; room_frame_asset_key?: string | null; sort_order?: number };
type RoomBanner = { id: string; title: string; image_url: string; resolved_image_url?: string | null; target_url?: string | null; sort_order: number; is_active: boolean; starts_at?: string | null; ends_at?: string | null };

function HomeRouteComponent() {
  const search = Route.useSearch();
  return <AppShell><HomeScreen createRequested={!!search.create} /></AppShell>;
}

const REGION_CHIPS = [
  { id: "all", label: "شائع", flag: null, hot: true },
  { id: "Arabia", label: "Arabia", flag: "🇸🇦" },
  { id: "YE", label: "Yemen", flag: "🇾🇪" },
  { id: "BD", label: "desh", flag: "🇧🇩" },
];

export function HomeScreen({ createRequested = false }: { createRequested?: boolean }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tab, setTab] = useState<"hot" | "new">("hot");
  const [region, setRegion] = useState<string>("all");
  const [userIdSearch, setUserIdSearch] = useState("");
  const [appBranding, setAppBranding] = useState<{ app_name?: string; logo_path?: string } | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [introBanner, setIntroBanner] = useState<{ title?: string; image_path?: string; enabled?: boolean } | null>(null);
  const [introBannerUrl, setIntroBannerUrl] = useState<string | null>(null);
  const [showIntroBanner, setShowIntroBanner] = useState(false);
  const [roomBanners, setRoomBanners] = useState<RoomBanner[]>([]);
  const [bannerIndex, setBannerIndex] = useState(0);

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    async function loadBranding() {
      const { data, error } = await supabase.from("admin_settings").select("key,value").in("key", ["app_branding", "home_banner"]);
      if (error || !alive) return;
      const settings = Object.fromEntries((data ?? []).map((row) => [row.key, row.value as Record<string, unknown>]));
      const brand = (settings.app_branding ?? {}) as { app_name?: string; logo_path?: string };
      const banner = (settings.home_banner ?? {}) as { title?: string; image_path?: string; enabled?: boolean; duration_seconds?: number };
      setAppBranding(brand);
      setIntroBanner(banner);
      const resolveStorageImage = async (value?: string | null) => {
        if (!value) return null;
        const resolved = await getAdminAssetUrl(value);
        if (resolved) return resolved;
        if (/^https?:\/\//i.test(value) || value.startsWith("media:")) return null;
        const { data } = await supabase.storage.from("admin-assets").createSignedUrl(value.replace(/^\/+/, ""), 3600);
        return data?.signedUrl ?? null;
      };
      if (brand.logo_path) {
        const resolved = await resolveStorageImage(brand.logo_path);
        if (alive) setLogoUrl(resolved);
      }
      if (banner.enabled !== false && banner.image_path && !sessionStorage.getItem("vox_intro_seen")) {
        const resolved = await resolveStorageImage(banner.image_path);
        if (alive && resolved) {
          sessionStorage.setItem("vox_intro_seen", "1");
          setIntroBannerUrl(resolved);
          setShowIntroBanner(true);
          timer = setTimeout(() => setShowIntroBanner(false), 5000);
        }
      }
    }
    void loadBranding();
    return () => { alive = false; if (timer) clearTimeout(timer); };
  }, []);


  async function searchUserById() {
    const value = Number(userIdSearch.trim());
    if (!Number.isSafeInteger(value) || value < 1) { toast.error("أدخل ID مستخدم صحيح"); return; }
    const { data, error } = await supabase.from("profiles").select("id,display_no").eq("display_no", value).maybeSingle();
    if (error) { toast.error(errMsg(error)); return; }
    if (!data) { toast.error("لم يتم العثور على مستخدم بهذا ID"); return; }
    setUserIdSearch("");
    window.location.href = `/u/${data.id}`;
  }

  async function loadBanners() {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("banners")
      .select("id,title,image_url,target_url,sort_order,is_active,starts_at,ends_at")
      .eq("is_active", true)
      .order("sort_order")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) {
      toast.error("تعذر تحميل البانرات: " + error.message);
      return;
    }
    const active = ((data ?? []) as RoomBanner[]).filter((b) => (!b.starts_at || b.starts_at <= now) && (!b.ends_at || b.ends_at >= now));
    const resolved = await Promise.all(active.map(async (banner) => {
      const imageValue = (banner.image_url || "").trim();
      const resolvedUrl = await getAdminAssetUrl(imageValue);
      const isHttpUrl = imageValue.startsWith("https://") || imageValue.startsWith("http://");
      const fallbackUrl = isHttpUrl ? imageValue : null;
      const storagePath = imageValue.startsWith("media:") ? null : imageValue;
      const storageUrl = !resolvedUrl && !fallbackUrl && storagePath
        ? (await supabase.storage.from("admin-assets").createSignedUrl(storagePath.split("/").filter(Boolean).join("/"), 3600)).data?.signedUrl ?? null
        : null;
      return { ...banner, resolved_image_url: resolvedUrl || fallbackUrl || storageUrl };
    }));
    setRoomBanners(resolved);
    setBannerIndex(0);
  }

  async function load() {
    const { data, error } = await supabase.from("rooms").select("*").limit(100);
    if (error) toast.error(error.message);
    else setRooms(data as Room[]);
  }
  useEffect(() => {
    void load();
    void loadBanners();
    const channel = supabase
      .channel("home-room-list-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "rooms" }, () => { void load(); })
      .on("postgres_changes", { event: "*", schema: "public", table: "banners" }, () => { void loadBanners(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (roomBanners.length < 2) return;
    const timer = window.setInterval(() => setBannerIndex((i) => (i + 1) % roomBanners.length), 5000);
    return () => window.clearInterval(timer);
  }, [roomBanners.length]);

  const list = useMemo(() => {
    let filtered = rooms;
    if (region !== "all") {
      filtered = rooms.filter((r) => r.country === region || r.name.toLowerCase().includes(region.toLowerCase()));
    }
    return [...filtered].sort((a, b) => { const ao=Number(a.sort_order ?? 0), bo=Number(b.sort_order ?? 0); if (ao !== bo) return ao-bo; return tab === "hot" ? b.member_count-a.member_count : +new Date(b.created_at)-+new Date(a.created_at); });
  }, [rooms, tab, region]);

  return (
    <div className="app-screen home-reference w-full pb-3 pt-2" style={{ background: "linear-gradient(180deg, #e8f5e9 0%, #f1f8e9 30%, #f5f5f5 100%)" }}>
      {/* Top header */}
      <header className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-emerald-500"><Home className="h-7 w-7" fill="currentColor" /></Link>
          <Link to="/store" className="text-amber-500"><Trophy className="h-7 w-7" /></Link>
          <button onClick={() => {}} className="text-gray-700"><Search className="h-7 w-7" /></button>
        </div>
        <div className="flex items-center gap-5 text-lg font-bold">
          <span className="text-gray-400">ذات صلة</span>
          <span className="text-gray-900">حفلة</span>
        </div>
      </header>

      {showIntroBanner && introBannerUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4" role="dialog" aria-label="إعلان البداية">
          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-gold/40 shadow-2xl">
            <img src={introBannerUrl} alt={introBanner?.title || "بنر البداية"} className="max-h-[78vh] w-full object-contain" />
            {introBanner?.title && <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-5 pt-12 text-center text-xl font-bold text-white">{introBanner.title}</div>}
            <button onClick={() => setShowIntroBanner(false)} className="absolute right-3 top-3 rounded-full bg-black/70 px-4 py-2 text-sm text-white">تخطي</button>
          </div>
        </div>
      )}

      {/* PK Battle banner carousel */}
      {roomBanners.length > 0 ? (
        <div className="mx-3 mb-3 overflow-hidden rounded-2xl shadow-lg">
          {(() => {
            const banner = roomBanners[bannerIndex];
            if (!banner) return null;
            const content = (
              <div className="relative h-36 w-full">
                <img src={banner.resolved_image_url || ""} alt={banner.title} className="absolute inset-0 h-full w-full object-cover" />
                {banner.title && <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent px-4 pb-3 pt-10">
                  <div className="truncate text-sm font-bold text-white">{banner.title}</div>
                </div>}
                {roomBanners.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
                    {roomBanners.map((b, i) => <span key={b.id} className={`h-1.5 rounded-full ${i === bannerIndex ? "w-5 bg-white" : "w-1.5 bg-white/50"}`} />)}
                  </div>
                )}
              </div>
            );
            return banner.target_url ? <a href={banner.target_url} target="_blank" rel="noreferrer">{content}</a> : content;
          })()}
        </div>
      ) : (
        <div className="mx-3 mb-3 h-36 overflow-hidden rounded-2xl shadow-lg" style={{ background: "linear-gradient(135deg, #6a1b9a, #1a237e, #4a148c)" }}>
          <div className="flex h-full items-center justify-center">
            <span className="text-4xl font-black text-yellow-400" style={{ textShadow: "0 0 20px rgba(255,215,0,0.6)" }}>PK BATTLE</span>
          </div>
        </div>
      )}

      {/* Agency & Wealth ranking cards */}
      <div className="mx-3 mb-3 grid grid-cols-2 gap-3">
        <div className="relative overflow-hidden rounded-2xl p-3" style={{ background: "linear-gradient(135deg, #e3f2fd, #bbdefb)" }}>
          <div className="absolute left-2 top-1 text-2xl opacity-30">⟡</div>
          <div className="absolute right-2 top-1 text-2xl opacity-30">⟡</div>
          <div className="text-center text-lg font-bold text-blue-700">Agency</div>
          <div className="mt-2 flex justify-center gap-1">
            <div className="h-12 w-12 rounded-full border-2 border-slate-400 bg-slate-200" />
            <div className="h-12 w-12 rounded-full border-2 border-amber-500 bg-amber-100" />
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl p-3" style={{ background: "linear-gradient(135deg, #fff8e1, #ffe0b2)" }}>
          <div className="absolute left-2 top-1 text-2xl opacity-30">⟡</div>
          <div className="absolute right-2 top-1 text-2xl opacity-30">⟡</div>
          <div className="text-center text-lg font-bold text-amber-700">Wealth</div>
          <div className="mt-2 flex justify-center gap-1">
            <div className="h-12 w-12 rounded-full border-2 border-amber-500 bg-amber-100" />
            <div className="h-12 w-12 rounded-full border-2 border-slate-400 bg-slate-200" />
            <div className="h-12 w-12 rounded-full border-2 border-amber-500 bg-amber-100" />
          </div>
        </div>
      </div>

      {/* Region filter chips */}
      <div className="mb-3 flex items-center gap-2 overflow-x-auto px-3">
        <button className="rounded-full p-2 text-gray-600"><Menu className="h-5 w-5" /></button>
        {REGION_CHIPS.map((chip) => (
          <button
            key={chip.id}
            onClick={() => setRegion(chip.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold ${region === chip.id ? "bg-emerald-500 text-white" : "bg-white text-gray-700 shadow-sm"}`}
          >
            {chip.flag && <span>{chip.flag}</span>}
            {chip.label}
            {chip.hot && <ThumbsUp className="h-3.5 w-3.5" />}
          </button>
        ))}
      </div>

      {/* Room grid */}
      {list.length === 0 ? (
        <div className="mx-3 rounded-2xl bg-white p-10 text-center text-gray-500 shadow-sm">لا توجد غرف بعد — أنشئ أول غرفة!</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-3">
          {list.map((r) => (
            <Link key={r.id} to="/room/$id" params={{ id: r.id }} className="group relative aspect-[3/4] overflow-hidden rounded-2xl shadow-md">
              <MediaImage src={r.cover_url || roomBackground(r.category)} className="absolute inset-0 h-full w-full object-cover" />
              {r.room_frame_asset_key && <RoomFrameOverlay assetKey={r.room_frame_asset_key} />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <span className="absolute right-2 top-2 rounded-full bg-black/40 px-2 py-0.5 text-xs text-white backdrop-blur">{r.category === "music" ? "Music" : "Party"}</span>
              <div className="absolute inset-x-0 bottom-0 p-2">
                <div className="truncate text-center text-base font-bold text-white">{r.name}</div>
                <div className="mt-1 flex items-center justify-center gap-1 text-xs text-white/90">
                  <span className="flex items-center gap-0.5"><Users className="h-3 w-3" />{r.member_count}</span>
                </div>
              </div>
              {r.is_private && <Lock className="absolute left-2 top-2 h-4 w-4 text-white/80" />}
            </Link>
          ))}
        </div>
      )}

      <div className="fixed bottom-24 left-4 z-30">
        <CreateRoom createRequested={createRequested} />
      </div>
    </div>
  );
}

function RoomFrameOverlay({ assetKey }: { assetKey: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => { void getAdminAssetUrl(assetKey).then(setSrc); }, [assetKey]);
  return src ? <AdminAssetMedia src={src} className="pointer-events-none absolute inset-0 z-10 h-full w-full object-fill" /> : null;
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`room-filter-chip shrink-0 rounded-full px-2.5 py-1 text-[13px] leading-5 ${active ? "bg-secondary text-primary ring-1 ring-primary" : "glass text-muted-foreground"}`}>
      {children}
    </button>
  );
}

function CreateRoom({ createRequested = false }: { createRequested?: boolean }) {
  const nav = useNavigate();
  const [open, setOpen] = useState(createRequested);
  useEffect(() => {
    if (createRequested) setOpen(true);
  }, [createRequested]);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("chat");
  const [country, setCountry] = useState("EG");
  const [seats, setSeats] = useState(8);
  const [priv, setPriv] = useState(false);
  const [busy, setBusy] = useState(false);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.rpc("create_room", { _name: name, _description: desc, _category: category, _country: country, _seat_count: seats, _is_private: priv });
    setBusy(false);
    if (error) { toast.error(errMsg(error)); return; }
    setOpen(false);
    nav({ to: "/room/$id", params: { id: data as string } });
  }
  const sel = "w-full rounded-md border border-input bg-input px-3 py-2 text-sm";
  return (
    <Dialog open={open} onOpenChange={(next) => {
      setOpen(next);
      if (!next && createRequested) void nav({ to: "/", search: {} });
    }}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-gold rounded-full font-bold shadow-gold"><img src={icons3d.plus} alt="" className="h-6 w-6 object-contain" /> غرفة</Button>
      </DialogTrigger>
      <DialogContent dir="rtl">
        <DialogHeader><DialogTitle className="font-display text-gold">إنشاء غرفة</DialogTitle></DialogHeader>
        <form onSubmit={create} className="space-y-3">
          <Input placeholder="اسم الغرفة" required minLength={2} maxLength={40} value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="وصف (اختياري)" maxLength={300} value={desc} onChange={(e) => setDesc(e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <select className={sel} value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select className={sel} value={country} onChange={(e) => setCountry(e.target.value)}>
              {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
            </select>
          </div>
          <div>
            <div className="mb-1 text-sm text-muted-foreground">عدد المقاعد</div>
            <div className="flex flex-wrap gap-2">
              {SEAT_OPTIONS.map((n) => (
                <button type="button" key={n} onClick={() => setSeats(n)} className={`h-10 w-12 rounded-xl font-bold ${seats === n ? "bg-gold" : "glass"}`}>{n}</button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={priv} onChange={(e) => setPriv(e.target.checked)} /> غرفة خاصة</label>
          <Button type="submit" disabled={busy} className="w-full bg-gold font-bold">إنشاء</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
