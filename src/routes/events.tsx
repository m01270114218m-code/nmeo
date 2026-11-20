import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { IceHeader, PartyTabs } from "@/components/app/AppShell";
import { events } from "@/components/app/data";

export const Route = createFileRoute("/events")({
  head: () => ({ meta: [{ title: "الفعاليات | فروست شات" }, { name: "description", content: "أحدث الفعاليات والعروض والمسابقات" }, { property: "og:title", content: "الفعاليات | فروست شات" }, { property: "og:description", content: "أحدث الفعاليات والعروض والمسابقات" }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Events,
});

function Events() {
  return (
    <div>
      <IceHeader><PartyTabs active="events" /></IceHeader>
      <div className="space-y-3 px-3.5 pt-2 pb-3">
        {events.map((e) => (
          <button key={e.title} onClick={() => toast(e.title, { description: `${e.from} ~ ${e.to}` })} className="surface press block w-full overflow-hidden text-start">
            <div className="relative">
              <img src={e.img} alt={e.title} className="aspect-[2.5/1] w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-night/70 via-transparent to-transparent" />
              <span className="absolute top-2 right-2 rounded-full gold-bg px-2 py-px text-[10px] font-black text-navy">{e.tag}</span>
              <h3 className="text-gold-grad absolute bottom-1.5 right-3 text-[17px] font-black drop-shadow">{e.title}</h3>
            </div>
            <div className="flex items-center justify-between px-3 py-2 text-[11.5px] text-muted-foreground">
              <span dir="ltr" className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{e.from} ~ {e.to}</span>
              <span className="flex items-center font-bold text-primary">عرض <ChevronLeft className="h-3.5 w-3.5" /></span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
