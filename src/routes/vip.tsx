import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SubHeader, Coin } from "@/components/app/AppShell";
import { gifts, icons, storeItems } from "@/components/app/data";

export const Route = createFileRoute("/vip")({
  head: () => ({ meta: [{ title: "VIP | فروست شات" }, { name: "description", content: "مستويات VIP والامتيازات الحصرية في فروست شات" }, { property: "og:title", content: "VIP | فروست شات" }, { property: "og:description", content: "مستويات VIP والامتيازات الحصرية في فروست شات" }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Vip,
});

const perks = [
  { l: "شارة VIP", i: icons.badge }, { l: "إطار حصري", i: storeItems[0]!.img }, { l: "مركبة دخول", i: storeItems[2]!.img }, { l: "فقاعة ذهبية", i: storeItems[4]!.img },
  { l: "حماية الطرد", i: icons.level }, { l: "مقعد مميز", i: storeItems[6]!.img }, { l: "هدايا حصرية", i: gifts[6]!.img }, { l: "ID مميز", i: icons.id },
];

function Vip() {
  const [lv, setLv] = useState(1);
  return (
    <div className="min-h-screen bg-night text-night-foreground">
      <SubHeader title="VIP" dark />
      <div className="px-3.5 pb-6">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
            <button key={n} onClick={() => setLv(n)} className={`press h-8 shrink-0 rounded-full px-3.5 text-[12.5px] font-black ${lv === n ? "gold-bg text-navy" : "night-glass"}`}>VIP{n}</button>
          ))}
        </div>
        <div className="vip-card relative mt-3 flex flex-col items-center overflow-hidden rounded-2xl border border-gold/70 py-5 shadow-2xl">
          <img src={gifts[3]!.img} alt="" className="h-24 w-24 drop-shadow-2xl" />
          <p className="text-gold-grad mt-1 text-[30px] font-black leading-none">VIP {lv}</p>
          <p className="mt-1 text-[12px] opacity-80">{Math.min(lv + 1, 8)} من 8 امتيازات مفتوحة</p>
        </div>
        <p className="mt-4 mb-2 text-[14px] font-extrabold">الامتيازات</p>
        <div className="grid grid-cols-4 gap-y-3">
          {perks.map((p, i) => (
            <div key={p.l} className={`flex flex-col items-center gap-1 text-center text-[11px] transition ${i <= lv ? "" : "opacity-30 grayscale"}`}>
              <span className="grid h-[52px] w-[52px] place-items-center rounded-2xl night-glass ring-1 ring-ice/40"><img src={p.i} alt="" className="h-9 w-9 object-contain" /></span>{p.l}
            </div>
          ))}
        </div>
        <button onClick={() => toast.success(`تم تفعيل VIP${lv} (تجريبي)`)} className="press mt-6 flex w-full items-center justify-center gap-2 rounded-full gold-bg py-3 text-[15px] font-black text-navy shadow-lg">فتح VIP{lv} <Coin n={lv * 30000} /></button>
      </div>
    </div>
  );
}
