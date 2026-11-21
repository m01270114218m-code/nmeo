import { icons3d } from "@/lib/assets3d";
import { UserAvatar } from "@/components/UserAvatar";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, X, ShoppingBag, Clock, Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { errMsg } from "@/lib/vox";
import { getAdminAssetUrl } from "@/lib/media";
import { AdminAssetMedia } from "@/components/AdminAssetMedia";

export const Route = createFileRoute("/store")({
  head: () => ({
    meta: [
      { title: "المتجر — صدى شات" },
      { name: "description", content: "شراء الإطارات والدخوليات وشحن العملات في صدى شات." },
      { property: "og:title", content: "المتجر — صدى شات" },
      { property: "og:description", content: "الإطارات والدخوليات وباقات الشحن." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AppShell>
      <StorePage />
    </AppShell>
  ),
});

const PACKS = [
  { coins: 6000, price: "$0.99" },
  { coins: 32000, price: "$4.99" },
  { coins: 68000, price: "$9.99" },
  { coins: 350000, price: "$49.99" },
];

type StoreItem = { id: string; kind: string; name: string; description: string | null; price: number; asset_key: string; is_direct_grant?: boolean; asset_url?: string | null; expires_at?: string | null; duration_hours?: number | null };

const TABS = [
  { id: "vehicle", label: "مركبات الدخول" },
  { id: "frame", label: "إطار الصورة" },
  { id: "bubble", label: "فقاعة الدردشة" },
  { id: "entry", label: "تأثيرات المدخل" },
  { id: "badge", label: "الاوسمة" },
  { id: "profile_card", label: "بطاقة التعريف" },
  { id: "sound_wave", label: "موجات الصوت" },
] as const;

function StorePage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [items, setItems] = useState<StoreItem[]>([]);
  const [owned, setOwned] = useState<Set<string>>(new Set());
  const [equippedFrame, setEquippedFrame] = useState<string | null>(null);
  const [equippedEntry, setEquippedEntry] = useState<string | null>(null);
  const [equippedBubble, setEquippedBubble] = useState<string | null>(null);
  const [equippedWave, setEquippedWave] = useState<string | null>(null);
  const [equippedCard, setEquippedCard] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("frame");

  useEffect(() => {
    if (!user) return;
    const live = supabase.channel(`store-live-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "user_items", filter: `user_id=eq.${user.id}` }, async () => {
        const { data: ui } = await supabase.from("user_items").select("item_id,expires_at").eq("user_id", user.id);
        const now = Date.now();
        setOwned(new Set((ui ?? []).filter((r) => !r.expires_at || new Date(r.expires_at).getTime() > now).map((r) => r.item_id)));
      })
      .subscribe();
    (async () => {
      const [{ data: p }, { data: si }, { data: ui }] = await Promise.all([
        supabase.from("profiles").select("equipped_frame, equipped_entry, chat_bubble_asset_key, sound_wave_asset_key, profile_card_asset_key").eq("id", user!.id).single(),
        supabase.from("store_items").select("*").eq("is_direct_grant", false).order("sort_order"),
        supabase.from("user_items").select("item_id,expires_at").eq("user_id", user!.id),
      ]);
      const now = Date.now();
      const activeOwned = ((ui ?? []) as { item_id: string; expires_at?: string | null }[]).filter((r) => !r.expires_at || new Date(r.expires_at).getTime() > now);
      setOwned(new Set(activeOwned.map((r) => r.item_id)));
      setEquippedFrame(p?.equipped_frame ?? null);
      setEquippedEntry(p?.equipped_entry ?? null);
      setEquippedBubble(p?.chat_bubble_asset_key ?? null); setEquippedWave(p?.sound_wave_asset_key ?? null); setEquippedCard(p?.profile_card_asset_key ?? null);
      const activeItems = ((si ?? []) as unknown as StoreItem[]).filter((item) => !item.expires_at || new Date(item.expires_at).getTime() > now);
      const enrichedItems = await Promise.all(activeItems.map(async (item) => ({ ...item, asset_url: await getAdminAssetUrl(item.asset_key) })));
      setItems(enrichedItems);
      setOwned(new Set(activeOwned.map((r) => r.item_id)));
    })();
    return () => { void supabase.removeChannel(live); };
  }, [user]);

  async function buyItem(item: StoreItem) {
    const { data, error } = await supabase.rpc("buy_item", { _item_id: item.id });
    if (error) { toast.error(error.message.includes("insufficient") ? "رصيد العملات غير كافٍ" : error.message.includes("already") ? "تملكه بالفعل" : errMsg(error)); return; }
    setOwned((s) => new Set(s).add(item.id));
    toast.success(`اشتريت ${item.name}! 🎉`);
  }

  async function equip(item: StoreItem, on: boolean) {
    const { error } = await supabase.rpc("equip_item", { _item_id: item.id, _equip: on });
    if (error) { toast.error(errMsg(error)); return; }
    if (item.kind === "frame") setEquippedFrame(on ? item.asset_key : null);
    if (item.kind === "entry") setEquippedEntry(on ? item.asset_key : null);
    if (item.kind === "bubble") setEquippedBubble(on ? item.asset_key : null);
    if (item.kind === "sound_wave") setEquippedWave(on ? item.asset_key : null);
    if (item.kind === "profile_card") setEquippedCard(on ? item.asset_key : null);
    toast.success(on ? `تم تجهيز ${item.name}` : "تمت الإزالة");
  }

  const tabItems = items.filter((i) => i.kind === activeTab);
  const featured = tabItems[0];

  return (
    <div dir="rtl" className="store-reference min-h-screen pb-8" style={{ background: "#f0fdf4" }}>
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between bg-white px-4 py-4 shadow-sm">
        <button onClick={() => nav({ to: "/profile" })} className="rounded-full p-1">
          <ChevronLeft className="h-7 w-7 text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">متجر الادوات</h1>
        <button onClick={() => nav({ to: "/" })} className="rounded-full p-1">
          <X className="h-7 w-7 text-gray-700" />
        </button>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-gray-200 bg-white px-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-4 py-3 text-sm font-bold ${activeTab === tab.id ? "border-b-2 border-emerald-500 text-emerald-600" : "text-gray-500"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Featured banner */}
      <div className="mx-3 mt-3 overflow-hidden rounded-2xl" style={{ background: "linear-gradient(135deg, #4ade80, #22d3ee)" }}>
        <div className="relative flex h-40 items-center justify-center">
          {featured?.asset_url ? (
            <AdminAssetMedia src={featured.asset_url} alt={featured.name} className="h-28 w-28 object-contain" />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/30 text-4xl">🎁</div>
          )}
          <Link to="/bag" className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white">
            <ShoppingBag className="h-4 w-4" /> حقيبة
          </Link>
        </div>
      </div>

      {/* Items grid */}
      <div className="mx-3 mt-4 grid grid-cols-2 gap-3">
        {tabItems.map((item) => {
          const isOwned = owned.has(item.id);
          const isEquipped =
            (item.kind === "frame" && equippedFrame === item.asset_key) ||
            (item.kind === "entry" && equippedEntry === item.asset_key) ||
            (item.kind === "bubble" && equippedBubble === item.asset_key) ||
            (item.kind === "sound_wave" && equippedWave === item.asset_key) ||
            (item.kind === "profile_card" && equippedCard === item.asset_key);
          const days = item.duration_hours ? Math.ceil(item.duration_hours / 24) : 7;
          return (
            <div key={item.id} className="overflow-hidden rounded-2xl bg-white p-3 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="h-3 w-3" /> {days} أيام
              </span>
                <span className="text-sm font-bold text-emerald-600">{item.name}</span>
              </div>
              <div className="flex h-28 items-center justify-center">
                {item.asset_url ? (
                  <AdminAssetMedia src={item.asset_url} alt={item.name} className="h-full w-full object-contain" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl">🎁</div>
                )}
              </div>
              <div className="mt-2 flex items-center justify-center gap-1">
                <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
                <span className="text-lg font-bold text-gray-900">{item.price.toLocaleString()}</span>
              </div>
              {isOwned ? (
                <button
                  onClick={() => equip(item, !isEquipped)}
                  className={`mt-2 w-full rounded-xl py-2 text-sm font-bold text-white ${isEquipped ? "bg-gray-400" : "bg-emerald-500"}`}
                >
                  {isEquipped ? "قيد الارتداء" : "ارتداء"}
                </button>
              ) : (
                <button
                  onClick={() => buyItem(item)}
                  className="mt-2 w-full rounded-xl bg-emerald-500 py-2 text-sm font-bold text-white"
                >
                  شراء
                </button>
              )}
            </div>
          );
        })}
        {tabItems.length === 0 && (
          <div className="col-span-2 rounded-2xl bg-white p-8 text-center text-gray-400">لا توجد عناصر في هذا القسم</div>
        )}
      </div>

      {/* Coin packs section */}
      <div className="mx-3 mt-6">
        <h2 className="mb-3 text-lg font-bold text-gray-900">شحن العملات</h2>
        <div className="grid grid-cols-2 gap-3">
          {PACKS.map((p) => (
            <div key={p.coins} className="rounded-2xl bg-white p-4 text-center shadow-sm">
              <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                <Star className="h-10 w-10 text-yellow-500" fill="currentColor" />
              </div>
              <b className="text-lg text-gray-900">{p.coins.toLocaleString()}</b>
              <div className="text-sm text-gray-500">{p.price}</div>
              <button
                onClick={async () => {
                  const { error } = await supabase.rpc("request_wallet_topup", { _coins: p.coins, _payment_method: "manual" });
                  if (error) toast.error(errMsg(error));
                  else toast.success("تم إرسال طلب الشحن للإدارة");
                }}
                className="mt-2 w-full rounded-xl bg-emerald-500 py-2 text-sm font-bold text-white"
              >
                شراء
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
