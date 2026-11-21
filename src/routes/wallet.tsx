import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Star, User } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { errMsg } from "@/lib/vox";

export const Route = createFileRoute("/wallet")({ component: () => <AppShell><WalletPage /></AppShell> });

const COIN_PACKS = [
  { coins: 100000, price: "$9.99" },
  { coins: 50000, price: "$4.99" },
  { coins: 6, price: "$0.99" },
  { coins: 500000, price: "$49.99" },
  { coins: 200000, price: "$19.99" },
];

function WalletPage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [coins, setCoins] = useState(0);
  const [name, setName] = useState("");
  const [selectedPack, setSelectedPack] = useState(2); // default $0.99

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("wallets").select("coins").eq("user_id", user.id).maybeSingle(),
      supabase.from("profiles").select("display_name").eq("id", user.id).single(),
    ]).then(([w, p]) => {
      setCoins(Number(w.data?.coins ?? 0));
      setName(p.data?.display_name ?? "");
    });
  }, [user]);

  async function recharge() {
    const pack = COIN_PACKS[selectedPack];
    const { error } = await supabase.rpc("request_wallet_topup", { _coins: pack.coins, _payment_method: "manual" });
    if (error) toast.error(errMsg(error));
    else toast.success("تم إرسال طلب الشحن للإدارة");
  }

  return (
    <div dir="rtl" className="min-h-screen pb-8" style={{ background: "#f5f5f5" }}>
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between bg-white px-4 py-4 shadow-sm">
        <button onClick={() => nav({ to: "/profile" })} className="rounded-full p-1">
          <ChevronLeft className="h-7 w-7 text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">إعادة الشحن</h1>
        <span className="w-7" />
      </header>

      {/* User info */}
      <div className="mx-3 mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
            <User className="h-6 w-6 text-gray-500" />
          </div>
          <div>
            <div className="font-bold text-gray-900">{name}</div>
            <div className="flex items-center gap-1 text-sm text-emerald-600">
              <Star className="h-4 w-4" fill="currentColor" /> {coins.toLocaleString()} الرصيد
            </div>
          </div>
        </div>
        <button className="rounded-full border-2 border-emerald-500 px-4 py-1.5 text-sm font-bold text-emerald-600">
          إعادة شحن التاجر
        </button>
      </div>

      {/* Banner */}
      <div className="mx-3 mt-4 overflow-hidden rounded-2xl p-5" style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-black text-white">New User Exclusive</div>
            <div className="text-xl font-black text-yellow-300">Pack Up To 25x Rewards!</div>
          </div>
          <div className="text-6xl">💎</div>
        </div>
      </div>

      {/* Packs */}
      <div className="mx-3 mt-6">
        <h2 className="mb-3 text-right text-lg font-bold text-gray-900">مبلغ الدفع</h2>
        <div className="grid grid-cols-3 gap-3">
          {COIN_PACKS.map((pack, i) => (
            <button
              key={i}
              onClick={() => setSelectedPack(i)}
              className={`flex flex-col items-center gap-1 rounded-2xl p-4 ${selectedPack === i ? "bg-emerald-50 ring-2 ring-emerald-500" : "bg-white"}`}
            >
              <Star className="h-8 w-8 text-yellow-500" fill="currentColor" />
              <span className="text-xl font-bold text-gray-900">{pack.coins.toLocaleString()}</span>
              <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-sm font-bold text-emerald-600">{pack.price}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pay button */}
      <div className="mx-3 mt-8">
        <button
          onClick={() => void recharge()}
          className="w-full rounded-2xl bg-emerald-500 py-4 text-xl font-bold text-white"
        >
          الدفع {COIN_PACKS[selectedPack].price}
        </button>
        <p className="mt-3 text-center text-sm text-gray-500">
          الدفع يعني أنك وافقت اتفاقية إعادة الشحن
        </p>
      </div>
    </div>
  );
}
