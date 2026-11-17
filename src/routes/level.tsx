import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Info } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/level")({
  component: () => <AppShell><LevelPage /></AppShell>,
});

const CHARM_LEVELS = [
  { range: "Charm 1-9", color: "from-yellow-200 to-yellow-400", icon: "✦" },
  { range: "Charm 10-19", color: "from-blue-200 to-blue-400", icon: "★" },
  { range: "Charm 20-29", color: "from-purple-200 to-purple-400", icon: "✧" },
  { range: "Charm 30-39", color: "from-red-200 to-red-400", icon: "♥" },
  { range: "Charm 40-49", color: "from-orange-200 to-orange-400", icon: "✦" },
  { range: "Charm 50-59", color: "from-pink-200 to-pink-400", icon: "✺" },
  { range: "Charm 60-69", color: "from-orange-300 to-orange-500", icon: "✸" },
  { range: "Charm 70-79", color: "from-purple-300 to-purple-500", icon: "♥" },
  { range: "Charm 80-89", color: "from-fuchsia-300 to-fuchsia-500", icon: "✦" },
  { range: "Charm 90-99", color: "from-yellow-400 to-purple-500", icon: "👑" },
];

const WEALTH_LEVELS = [
  { range: "Wealth 1-9", color: "from-yellow-200 to-yellow-400", icon: "✦" },
  { range: "Wealth 10-19", color: "from-gray-200 to-gray-400", icon: "⚙" },
  { range: "Wealth 20-29", color: "from-yellow-300 to-yellow-500", icon: "💎" },
  { range: "Wealth 30-39", color: "from-blue-200 to-blue-400", icon: "♛" },
  { range: "Wealth 40-49", color: "from-orange-200 to-orange-400", icon: "💎" },
  { range: "Wealth 50-59", color: "from-purple-300 to-purple-500", icon: "✦" },
  { range: "Wealth 60-69", color: "from-red-300 to-red-500", icon: "♥" },
  { range: "Wealth 70-79", color: "from-red-400 to-red-700", icon: "🛡" },
  { range: "Wealth 80-89", color: "from-purple-400 to-purple-700", icon: "👑" },
  { range: "Wealth 90-99", color: "from-yellow-500 to-purple-700", icon: "👑" },
];

function LevelPage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState<"charm" | "wealth">("charm");
  const [level, setLevel] = useState(0);
  const [xp, setXp] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("level,xp,avatar_url").eq("id", user.id).single().then(({ data }) => {
      if (data) {
        setLevel(Number(data.level ?? 0));
        setXp(Number(data.xp ?? 0));
        setAvatarUrl(data.avatar_url);
      }
    });
  }, [user]);

  const levels = tab === "charm" ? CHARM_LEVELS : WEALTH_LEVELS;
  const bgGradient = tab === "charm"
    ? "linear-gradient(180deg, #fce7f3 0%, #fbcfe8 40%, #f5f5f5 60%)"
    : "linear-gradient(180deg, #ffedd5 0%, #fdba74 40%, #f5f5f5 60%)";

  const nextLevelXp = (level + 1) * 1000;
  const progress = Math.min(100, (xp / nextLevelXp) * 100);

  return (
    <div dir="rtl" className="min-h-screen pb-8" style={{ background: bgGradient }}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4">
        <button onClick={() => nav({ to: "/profile" })} className="rounded-full p-1">
          <ChevronLeft className="h-7 w-7 text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">مستوى</h1>
        <button className="rounded-full p-1">
          <Info className="h-7 w-7 text-white" />
        </button>
      </header>

      {/* Tabs */}
      <div className="mt-2 flex justify-center gap-12 text-lg font-bold">
        <button
          onClick={() => setTab("charm")}
          className={`relative pb-2 ${tab === "charm" ? "text-white" : "text-white/60"}`}
        >
          الجاذبية
          {tab === "charm" && <span className="absolute -bottom-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-white" />}
        </button>
        <button
          onClick={() => setTab("wealth")}
          className={`relative pb-2 ${tab === "wealth" ? "text-white" : "text-white/60"}`}
        >
          الثروة
          {tab === "wealth" && <span className="absolute -bottom-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-white" />}
        </button>
      </div>

      {/* Avatar & level */}
      <div className="mt-4 flex flex-col items-center">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-4 border-white bg-white/30" style={avatarUrl ? { backgroundImage: `url(${avatarUrl})`, backgroundSize: "cover" } : {}} />
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-purple-600 px-3 py-0.5 text-sm font-bold text-white">
            {tab === "charm" ? "♥" : "👑"} {level}
          </span>
        </div>
        {/* Progress bar */}
        <div className="mt-6 w-full px-8">
          <div className="flex items-center justify-between text-sm font-bold text-white">
            <span>Lv.{level}</span>
            <span>Lv.{level + 1}</span>
          </div>
          <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-white/40">
            <div className="h-full rounded-full bg-orange-500" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-1 text-center text-sm text-white/80">المسافة إلى الترقية {Math.max(0, nextLevelXp - xp)}</div>
        </div>
      </div>

      {/* Level badges grid */}
      <div className="mx-4 mt-6 rounded-t-3xl bg-white p-4">
        <h2 className="mb-3 text-lg font-bold text-gray-900">Level</h2>
        <div className="grid grid-cols-3 gap-3">
          {levels.map((lv, i) => (
            <div key={i} className="rounded-2xl bg-gray-50 p-3 text-center">
              <div className={`mx-auto mb-2 flex h-10 items-center justify-center rounded-full bg-gradient-to-r ${lv.color} text-lg`}>
                {lv.icon}
              </div>
              <div className="text-xs font-bold text-gray-700">{lv.range}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
