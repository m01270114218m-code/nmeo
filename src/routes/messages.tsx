import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { IceHeader, Badge } from "@/components/app/AppShell";
import { avatarAt, rooms, images } from "@/components/app/data";
import megaphone from "@/assets/megaphone.png";
import bell from "@/assets/bell.png";
import gift from "@/assets/gift.png";

export const Route = createFileRoute("/messages")({
  head: () => ({ meta: [{ title: "الرسائل | فروست شات" }, { name: "description", content: "إشعاراتك ورسائلك الرسمية ومكافآتك وأصدقاؤك" }, { property: "og:title", content: "الرسائل | فروست شات" }, { property: "og:description", content: "إشعاراتك ورسائلك الرسمية ومكافآتك وأصدقاؤك" }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Messages,
});

const cats = [
  { l: "إشعار", i: megaphone, n: 2, items: ["تمت متابعتك من مستخدم جديد", "صديقك دخل غرفة سهرة الملوك"] },
  { l: "رسمي", i: bell, n: 3, items: ["مرحباً بك في فروست شات!", "تحديث جديد: هدايا الشتاء متاحة الآن", "تذكير: التزم بقواعد المجتمع"] },
  { l: "مكافأة", i: gift, n: 5, items: ["حصلت على 100 عملة مكافأة تسجيل يومي", "مكافأة المستوى 12 بانتظارك"] },
];
const names = ["سارة", "أحمد", "نور", "خالد", "ليلى", "يوسف"];

function Messages() {
  const [tab, setTab] = useState<"m" | "f">("m");
  const [open, setOpen] = useState<number | null>(null);
  const [read, setRead] = useState<number[]>([]);
  return (
    <div>
      <IceHeader>
        <div className="flex h-11 items-end gap-5">
          {([["m", "الرسائل"], ["f", "الأصدقاء"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={`relative pb-1.5 leading-none ${tab === k ? "text-[22px] font-black text-navy" : "text-[15px] font-bold text-navy/55"}`}>
              {l}{tab === k && <span className="absolute -bottom-0.5 right-1/2 h-[3px] w-5 translate-x-1/2 rounded-full bg-navy" />}
            </button>
          ))}
        </div>
      </IceHeader>
      {tab === "m" ? (
        <div className="px-3.5 pt-6">
          {open === null ? (
            <>
              <div className="grid grid-cols-3">
                {cats.map((c, i) => (
                  <button key={c.l} onClick={() => { setOpen(i); setRead((r) => [...r, i]); }} className="press flex flex-col items-center gap-1.5">
                    <span className="relative"><img src={c.i} alt={c.l} className="h-[62px] w-[62px] rounded-full object-cover shadow-md ring-2 ring-secondary" />{!read.includes(i) && <Badge n={c.n} />}</span>
                    <span className="text-[13px] font-bold text-navy">{c.l}</span>
                  </button>
                ))}
              </div>
              <div className="mt-16 flex flex-col items-center gap-2">
                <img src={images.mascot} alt="" className="h-36 w-36 rounded-full object-cover mix-blend-multiply" />
                <p className="text-[13px] text-muted-foreground">لا توجد رسائل خاصة</p>
              </div>
            </>
          ) : (
            <div>
              <button onClick={() => setOpen(null)} className="mb-2 flex items-center gap-1 text-[15px] font-extrabold text-navy"><ChevronRight className="h-5 w-5" />{cats[open]!.l}</button>
              <div className="space-y-2">
                {cats[open]!.items.map((t, i) => (
                  <div key={i} className="surface flex items-start gap-2.5 p-3">
                    <img src={cats[open]!.i} alt="" className="h-10 w-10 rounded-full object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between"><p className="text-[13.5px] font-extrabold text-navy">فروست شات</p><span className="text-[10.5px] text-muted-foreground">{i + 1} س</span></div>
                      <p className="text-[12.5px] leading-snug text-muted-foreground">{t}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2 px-3.5 pt-3 pb-3">
          {rooms.map((r, i) => (
            <Link key={r.id} to="/room/$id" params={{ id: r.id }} className="surface press flex items-center gap-3 p-2.5">
              <span className="relative"><img src={avatarAt(i + 1)} alt="" className="h-12 w-12 rounded-full object-cover" /><span className="absolute bottom-0 left-0 h-3 w-3 rounded-full border-2 border-secondary bg-primary" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-extrabold text-navy">{names[i]} <span className="text-[12px]">{r.flag}</span></p>
                <p className="truncate text-[12px] text-muted-foreground">في غرفة {r.name}</p>
              </div>
              <span className="rounded-full chip-active px-3 py-1 text-[11px] font-bold">انضمام</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
