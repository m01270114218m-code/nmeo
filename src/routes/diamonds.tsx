import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Diamond, Star } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { errMsg } from "@/lib/vox";

export const Route = createFileRoute("/diamonds")({
  component: () => <AppShell><DiamondsPage /></AppShell>,
});

const COIN_PACKS = [
  { coins: 200, diamonds: 220 },
  { coins: 111, diamonds: 11 },
  { coins: 10, diamonds: 12 },
  { coins: 100, diamonds: 120 },
  { coins: 150, diamonds: 170 },
];

function DiamondsPage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [diamonds, setDiamonds] = useState(0);
  const [coins, setCoins] = useState(0);
  const [diamondInput, setDiamondInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    if (!user) return;
    const { data: w } = await supabase.from("wallets").select("coins,diamonds").eq("user_id", user.id).maybeSingle();
    setDiamonds(Number(w?.diamonds ?? 0));
    setCoins(Number(w?.coins ?? 0));
  }
  useEffect(() => { void load(); }, [user]);

  async function convert(pack?: { coins: number; diamonds: number }) {
    const d = pack?.diamonds ?? (Number(diamondInput) || 0);
    if (d <= 0 || d > diamonds) { toast.error("رصيد الألماس غير كافٍ"); return; }
    const c = pack?.coins ?? Math.floor(d * 1.2);
    setBusy(true);
    const { error } = await supabase.rpc("convert_diamonds_to_coins", { _diamonds: d });
    setBusy(false);
    if (error) { toast.error(errMsg(error)); return; }
    toast.success(`تم تحويل ${d} ألماس إلى ${c} عملة`);
    await load();
  }

  return (
    <div dir="rtl" className="min-h-screen pb-8" style={{ background: "#f0fdf4" }}>
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between bg-white px-4 py-4 shadow-sm">
        <button onClick={() => nav({ to: "/profile" })} className="rounded-full p-1">
          <ChevronLeft className="h-7 w-7 text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">تبادل</h1>
        <span className="w-7" />
      </header>

      {/* Banner */}
      <div className="mx-3 mt-3 overflow-hidden rounded-2xl p-4" style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}>
        <div className="flex items-center justify-between">
          <div className="text-white">
          <div className="text-sm opacity-90">ادفع من خلال المشاركة أو رحلة الهدايا</div>
        </div>
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400 text-2xl">
              <Star className="h-10 w-10 text-white" fill="currentColor" />
            </div>
            <span className="absolute -bottom-1 -right-1 rounded-full bg-white px-2 text-sm font-bold text-gray-900">Coin</span>
          </div>
        </div>
      </div>

      {/* Balance */}
      <div className="mx-3 mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💎</span>
          <span className="text-2xl font-bold text-gray-900">{diamonds.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-lg font-bold text-gray-900">تبادل</span>
          <span className="h-5 w-1 bg-emerald-500" />
        </div>
      </div>

      {/* Coin packs grid */}
      <div className="mx-3 mt-4 grid grid-cols-3 gap-3">
        {COIN_PACKS.map((pack, i) => (
          <button
            key={i}
            onClick={() => void convert(pack)}
            disabled={busy || diamonds < pack.diamonds}
            className="flex flex-col items-center gap-2 rounded-2xl bg-emerald-50 p-4 disabled:opacity-50"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-100">
              <Star className="h-8 w-8 text-yellow-500" fill="currentColor" />
            </div>
            <span className="text-xl font-bold text-gray-900">{pack.coins}</span>
            <span className="flex items-center gap-1 rounded-full bg-emerald-400 px-3 py-1 text-sm font-bold text-white">
              {pack.diamonds} <Diamond className="h-3.5 w-3.5" />
            </span>
          </button>
        ))}
      </div>

      {/* Custom conversion */}
      <div className="mx-3 mt-6 rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-3 text-center text-lg font-bold text-emerald-600">100 Diamonds = 120 Coin</div>
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-3">
            <span className="flex-1 text-gray-500">أدخل عدد الألماس ×100</span>
            <Input
              type="number"
              value={diamondInput}
              onChange={(e) => setDiamondInput(e.target.value)}
              placeholder="0"
              className="w-24 border-0 bg-transparent text-left text-lg font-bold"
            />
            <Diamond className="h-6 w-6 text-cyan-500" />
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-3">
            <span className="flex-1 text-gray-500">احصل على عدد العملات</span>
            <span className="text-lg font-bold text-gray-900">{Math.floor((Number(diamondInput) || 0) * 1.2)}</span>
            <Star className="h-6 w-6 text-yellow-500" fill="currentColor" />
          </div>
        </div>
        <button
          onClick={() => void convert()}
          disabled={busy || !diamondInput || Number(diamondInput) <= 0}
          className="mt-4 w-full rounded-xl bg-emerald-500 py-3 font-bold text-white disabled:opacity-50"
        >
          {busy ? "جارٍ التحويل…" : "تحويل"}
        </button>
      </div>
    </div>
  );
}
