import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ChevronRight, Search, AudioLines } from "lucide-react";
import { images, me, ui, type Room } from "./data";

export function IceHeader({ children, tall = false }: { children: ReactNode; tall?: boolean }) {
  return (
    <div className="relative">
      <img src={images.ice} alt="" className={`absolute inset-x-0 top-0 -z-10 w-full object-cover object-top ${tall ? "h-52" : "h-36"}`} />
      <div className={`absolute inset-x-0 top-0 -z-10 bg-gradient-to-b from-transparent via-background/10 to-background ${tall ? "h-52" : "h-36"}`} />
      <div className="relative px-3.5 pt-4">{children}</div>
    </div>
  );
}

export function SubHeader({ title, dark = false, right }: { title: string; dark?: boolean; right?: ReactNode }) {
  const r = useRouter();
  return (
    <div className={`sticky top-0 z-30 flex h-12 items-center gap-1 px-2 backdrop-blur-md ${dark ? "bg-night/70 text-night-foreground" : "bg-background/85 text-navy"}`}>
      <button onClick={() => r.history.back()} aria-label="رجوع" className="press grid h-9 w-9 place-items-center rounded-full"><ChevronRight className="h-6 w-6" /></button>
      <h1 className="flex-1 text-[17px] font-extrabold">{title}</h1>
      {right}
    </div>
  );
}

export function Badge({ n, className = "" }: { n: number; className?: string }) {
  return <span className={`absolute -top-1 -right-1 grid h-[18px] min-w-[18px] place-items-center rounded-full border-2 border-secondary bg-badge px-1 text-[10px] font-bold leading-none text-primary-foreground ${className}`}>{n}</span>;
}

export function Coin({ n, gem = false, className = "" }: { n: number | string; gem?: boolean; className?: string }) {
  return <span className={`inline-flex items-center gap-1 font-bold ${className}`}><img src={gem ? ui.gem : ui.coin} alt="" className="h-4 w-4" />{typeof n === "number" ? n.toLocaleString("en") : n}</span>;
}

const MAIN = ["/", "/mine", "/events", "/messages", "/me"];

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const showNav = MAIN.includes(path);
  const party = path === "/" || path === "/mine" || path === "/events";
  const tabs = [
    { to: "/", label: "حفلة", active: party, img: ui.castle, badge: 0 },
    { to: "/messages", label: "رسالة", active: path === "/messages", img: ui.mail, badge: 10 },
    { to: "/me", label: "أنا", active: path === "/me", img: me.img, badge: 0, round: true },
  ];
  return (
    <div dir="rtl" className={`relative isolate mx-auto min-h-screen max-w-[440px] bg-background ${showNav ? "pb-[76px]" : ""}`}>
      {children}
      {showNav && (
        <nav className="nav-ice nav-shadow fixed bottom-0 left-1/2 z-40 flex h-[62px] w-full max-w-[440px] -translate-x-1/2 items-end justify-around rounded-t-[22px] pb-1.5 text-primary-foreground">
          {tabs.map((t) => (
            <Link key={t.to} to={t.to} className="relative flex w-20 flex-col items-center">
              <span className={`relative grid place-items-center rounded-full transition-all duration-200 ${t.active ? "-mt-5 h-[50px] w-[50px] gold-bg shadow-lg ring-2 ring-secondary" : "h-9 w-9 opacity-75 grayscale-[35%]"}`}>
                <img src={t.img} alt="" className={t.round ? `rounded-full object-cover ${t.active ? "h-[42px] w-[42px]" : "h-8 w-8 border border-secondary"}` : t.active ? "h-9 w-9" : "h-8 w-8"} />
                {t.badge > 0 && <Badge n={t.badge} />}
              </span>
              <span className={`mt-0.5 text-[11px] font-bold ${t.active ? "" : "opacity-75"}`}>{t.label}</span>
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}

export function PartyTabs({ active }: { active: "mine" | "party" | "events" }) {
  const items = [
    { k: "mine", to: "/mine", l: "ملكي" },
    { k: "party", to: "/", l: "حفلات" },
    { k: "events", to: "/events", l: "فعالية" },
  ] as const;
  return (
    <div className="flex h-11 items-center justify-between">
      <div className="flex items-end gap-5">
        {items.map((i) => (
          <Link key={i.k} to={i.to} className={`relative pb-1.5 leading-none transition-all ${active === i.k ? "text-[22px] font-black text-navy" : "text-[15px] font-bold text-navy/55"}`}>
            {i.l}
            {active === i.k && <span className="absolute -bottom-0.5 right-1/2 h-[3px] w-5 translate-x-1/2 rounded-full bg-navy" />}
          </Link>
        ))}
      </div>
      <Link to="/search" aria-label="بحث" className="press grid h-9 w-9 place-items-center rounded-full gold-bg text-navy shadow-md ring-2 ring-secondary/80"><Search className="h-[18px] w-[18px]" strokeWidth={2.6} /></Link>
    </div>
  );
}

export function RoomCard({ r }: { r: Room }) {
  return (
    <Link to="/room/$id" params={{ id: r.id }} className="glass-card press flex items-center gap-3 p-2.5">
      <div className="relative shrink-0">
        <img src={r.img} alt={r.name} className="h-[74px] w-[74px] rounded-xl object-cover" />
        <span className="absolute bottom-1 right-1 rounded-md bg-night/60 px-1.5 text-[9px] font-bold text-night-foreground backdrop-blur">{r.tag}</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <h3 className="truncate text-[15px] font-extrabold leading-tight text-navy">{r.name}</h3>
        <div className="flex items-center gap-1.5">
          <span className="text-base leading-none">{r.flag}</span>
          <span className="vip-card rounded-full px-2 py-px text-[10px] font-black leading-4 text-gold">VIP{r.vip}</span>
          <img src={r.host} alt="" className="h-5 w-5 rounded-full border border-secondary object-cover" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex -space-x-1 space-x-reverse">{r.badges.map((b, i) => <img key={i} src={b} alt="" className="h-5 w-5 drop-shadow" />)}</div>
          <span className="flex items-center gap-1 text-[13px] font-bold text-primary"><AudioLines className="h-3.5 w-3.5" />{r.online}</span>
        </div>
      </div>
    </Link>
  );
}
