import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Settings2 } from "lucide-react";
import { IceHeader, PartyTabs, RoomCard } from "@/components/app/AppShell";
import { me, rooms, images } from "@/components/app/data";

export const Route = createFileRoute("/mine")({
  head: () => ({ meta: [{ title: "غرفتي | فروست شات" }, { name: "description", content: "غرفتك والغرف التي زرتها مؤخراً والتي تتابعها" }, { property: "og:title", content: "غرفتي | فروست شات" }, { property: "og:description", content: "غرفتك والغرف التي زرتها مؤخراً والتي تتابعها" }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Mine,
});

function Mine() {
  const [t, setT] = useState(0);
  const lists = [rooms.slice(0, 3), rooms.slice(3, 5), rooms.slice(4)];
  return (
    <div>
      <IceHeader><PartyTabs active="mine" /></IceHeader>
      <div className="space-y-3 px-3.5 pt-2">
        <div className="vip-card relative overflow-hidden rounded-2xl p-3 text-night-foreground shadow-lg">
          <img src={images.room} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
          <div className="relative flex items-center gap-3">
            <img src={me.img} alt="" className="h-14 w-14 rounded-xl border-2 border-gold object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-extrabold">غرفة {me.name}</p>
              <p className="text-[11px] opacity-80">ID: {me.id} · المستوى {me.level}</p>
            </div>
            <Link to="/room/$id" params={{ id: "1" }} className="press rounded-full gold-bg px-4 py-1.5 text-[13px] font-black text-navy">دخول</Link>
          </div>
          <div className="relative mt-3 grid grid-cols-2 gap-2 text-[12px] font-bold">
            <button className="press flex items-center justify-center gap-1 rounded-lg night-glass py-1.5"><Settings2 className="h-3.5 w-3.5" /> إعدادات الغرفة</button>
            <button className="press flex items-center justify-center gap-1 rounded-lg night-glass py-1.5"><Plus className="h-3.5 w-3.5" /> دعوة أصدقاء</button>
          </div>
        </div>
        <div className="flex gap-2">
          {["مؤخراً", "المتابعة", "غرفة الأعضاء"].map((l, i) => (
            <button key={l} onClick={() => setT(i)} className={`chip press ${t === i ? "chip-active" : ""}`}>{l}</button>
          ))}
        </div>
        <div className="space-y-2.5 pb-3">{lists[t]!.map((r) => <RoomCard key={r.id + t} r={r} />)}</div>
      </div>
    </div>
  );
}
