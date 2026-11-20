import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SubHeader, Coin } from "@/components/app/AppShell";
import { me, ui } from "@/components/app/data";

export const Route = createFileRoute("/wallet")({
  head: () => ({ meta: [{ title: "المحفظة | فروست شات" }, { name: "description", content: "رصيد العملات والألماس وباقات الشحن" }, { property: "og:title", content: "المحفظة | فروست شات" }, { property: "og:description", content: "رصيد العملات والألماس وباقات الشحن" }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: WalletPage,
});

const packs = [{ c: 8000, p: "$1" }, { c: 42000, p: "$5", b: "+5%" }, { c: 88000, p: "$10", b: "+10%" }, { c: 450000, p: "$50", b: "+12%" }, { c: 920000, p: "$100", b: "+15%" }, { c: 1900000, p: "$200", b: "+20%" }];

function WalletPage() {
  const [coins, setCoins] = useState(me.coins);
  const [sel, setSel] = useState(1);
  const [tab, setTab] = useState(0);
  return (
    <div>
      <SubHeader title="المحفظة" />
      <div className="space-y-3 px-3.5 pb-6">
        <div className="vip-card relative overflow-hidden rounded-2xl p-4 text-primary-foreground shadow-lg">
          <img src={ui.coin} alt="" className="absolute -left-4 -top-3 h-28 w-28 opacity-25" />
          <p className="text-[12px] opacity-80">رصيد العملات</p>
          <p className="text-gold-grad mt-0.5 flex items-center gap-1.5 text-[30px] font-black leading-tight"><img src={ui.coin} alt="" className="h-7 w-7" />{coins.toLocaleString("en")}</p>
          <div className="mt-2 flex items-center justify-between text-[12px]"><Coin n={me.diamonds} gem /><span className="rounded-full night-glass px-2.5 py-0.5">تحويل الألماس</span></div>
        </div>
        <div className="flex gap-2">{["شحن العملات", "سجل المعاملات"].map((l, i) => <button key={l} onClick={() => setTab(i)} className={`chip press ${tab === i ? "chip-active" : ""}`}>{l}</button>)}</div>
        {tab === 0 ? (
          <>
            <div className="grid grid-cols-3 gap-2">
              {packs.map((p, i) => (
                <button key={p.c} onClick={() => setSel(i)} className={`press relative flex flex-col items-center gap-0.5 rounded-xl border-2 bg-secondary py-2.5 ${sel === i ? "border-primary shadow-md" : "border-transparent"}`}>
                  {p.b && <span className="absolute -top-1.5 left-1 rounded-full bg-badge px-1.5 text-[9px] font-bold text-primary-foreground">{p.b}</span>}
                  <img src={ui.coin} alt="" className="h-9 w-9" />
                  <span className="text-[13px] font-black text-navy">{p.c.toLocaleString("en")}</span>
                  <span className="text-[11.5px] font-bold text-muted-foreground">{p.p}</span>
                </button>
              ))}
            </div>
            <button onClick={() => { const p = packs[sel]!; setCoins((x) => x + p.c); toast.success(`تمت إضافة ${p.c.toLocaleString("en")} عملة (تجريبي)`); }} className="press w-full rounded-full gold-bg py-3 text-[15px] font-black text-navy shadow-md">شحن الآن {packs[sel]!.p}</button>
          </>
        ) : (
          <div className="surface divide-y">
            {[["شحن عملات", "+8,000", "اليوم"], ["هدية تاج", "-520", "أمس"], ["مكافأة يومية", "+100", "أمس"]].map(([a, b, c]) => (
              <div key={a} className="flex items-center justify-between px-3 py-2.5 text-[13px]"><div><p className="font-bold text-navy">{a}</p><p className="text-[11px] text-muted-foreground">{c}</p></div><span className={`font-black ${b!.startsWith("+") ? "text-primary" : "text-destructive"}`} dir="ltr">{b}</span></div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
