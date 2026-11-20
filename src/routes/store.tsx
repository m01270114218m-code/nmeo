import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SubHeader, Coin } from "@/components/app/AppShell";
import { me, storeItems, type StoreItem } from "@/components/app/data";

export const Route = createFileRoute("/store")({
  head: () => ({ meta: [{ title: "المتجر | فروست شات" }, { name: "description", content: "إطارات ومركبات دخول وفقاعات دردشة ومقاعد مميزة" }, { property: "og:title", content: "المتجر | فروست شات" }, { property: "og:description", content: "إطارات ومركبات دخول وفقاعات دردشة ومقاعد مميزة" }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Store,
});

const cats = ["الكل", "إطارات", "مركبات", "فقاعات", "مقاعد"] as const;

function Store() {
  const [k, setK] = useState<(typeof cats)[number]>("الكل");
  const [sel, setSel] = useState<StoreItem | null>(null);
  const list = k === "الكل" ? storeItems : storeItems.filter((i) => i.cat === k);
  return (
    <div>
      <SubHeader title="المتجر" right={<span className="ms-auto pe-2 text-[12px] text-navy"><Coin n={me.coins} /></span>} />
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-3.5">
        {cats.map((x) => <button key={x} onClick={() => setK(x)} className={`chip press ${k === x ? "chip-active" : ""}`}>{x}</button>)}
      </div>
      <div className="grid grid-cols-3 gap-2 px-3.5 pt-3 pb-6">
        {list.map((it) => (
          <button key={it.n} onClick={() => setSel(it)} className="surface press flex flex-col items-center gap-1 p-2">
            <span className="relative grid h-[76px] w-full place-items-center rounded-lg bg-gradient-to-b from-accent/60 to-transparent">
              <img src={it.img} alt={it.n} className="relative h-[70px] w-[70px] object-contain drop-shadow" />
              {it.frame && <img src={me.img} alt="" className="absolute h-9 w-9 rounded-full object-cover" />}
            </span>
            <span className="w-full truncate text-center text-[12px] font-bold text-navy">{it.n}</span>
            <span className="text-[11px] text-navy"><Coin n={it.p} /></span>
          </button>
        ))}
      </div>
      {sel && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-night/50" onClick={() => setSel(null)}>
          <div className="w-full max-w-[440px] rounded-t-3xl bg-secondary p-4 pb-6" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
            <div className="relative mx-auto grid h-36 w-36 place-items-center">
              <img src={sel.img} alt={sel.n} className="relative h-36 w-36 object-contain drop-shadow-xl" />
              {sel.frame && <img src={me.img} alt="" className="absolute h-[72px] w-[72px] rounded-full object-cover" />}
            </div>
            <p className="mt-2 text-center text-[17px] font-black text-navy">{sel.n}</p>
            <p className="text-center text-[12px] text-muted-foreground">{sel.cat} · صالح لمدة {sel.days} أيام</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => { toast("تمت المعاينة"); }} className="press rounded-full border border-primary py-2.5 text-[14px] font-bold text-primary">معاينة</button>
              <button onClick={() => { toast(me.coins >= sel.p ? `تم شراء ${sel.n} (تجريبي)` : "رصيدك غير كافٍ، اشحن من المحفظة"); setSel(null); }} className="press flex items-center justify-center gap-1 rounded-full gold-bg py-2.5 text-[14px] font-black text-navy">شراء <Coin n={sel.p} /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
