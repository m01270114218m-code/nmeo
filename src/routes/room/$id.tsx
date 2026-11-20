import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Power, Mic, MicOff, Smile, LayoutGrid, Mail, Send, Heart, Share2, Plus, Check } from "lucide-react";
import { toast } from "sonner";
import { Coin } from "@/components/app/AppShell";
import { images, me, rooms, gifts, avatarAt, ui, type Gift } from "@/components/app/data";

export const Route = createFileRoute("/room/$id")({
  head: () => ({ meta: [{ title: "غرفة صوتية | فروست شات" }, { name: "description", content: "انضم للغرفة الصوتية وتحدث وأرسل الهدايا لأصدقائك" }, { property: "og:title", content: "غرفة صوتية | فروست شات" }, { property: "og:description", content: "انضم للغرفة الصوتية وتحدث وأرسل الهدايا لأصدقائك" }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: RoomPage,
});

type Msg = { u: string; t: string; sys?: boolean; gift?: string };
type Occ = { kind: "me" } | { kind: "guest"; n: string; a: number } | null;

function RoomPage() {
  const { id } = Route.useParams();
  const room = rooms.find((r) => r.id === id) ?? rooms[0]!;
  const [seats, setSeats] = useState<Occ[]>([null, { kind: "guest", n: "سارة", a: 1 }, null, null, { kind: "guest", n: "يوسف", a: 5 }, null, null]);
  const [hearts, setHearts] = useState<number[]>([1520, 0, 88, 0, 0, 36, 0, 0]);
  const [muted, setMuted] = useState(true);
  const [follow, setFollow] = useState(false);
  const [tab, setTab] = useState(0);
  const [giftOpen, setGiftOpen] = useState(false);
  const [gSel, setGSel] = useState(0);
  const [qty, setQty] = useState(1);
  const [to, setTo] = useState(0);
  const [coins, setCoins] = useState(me.coins);
  const [fly, setFly] = useState<{ k: number; img: string } | null>(null);
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { u: "إعلان رسمي", t: "فروست شات يدعم الدردشة الراقية. أي محتوى مسيء يعرّض الغرفة للعقوبة، والمشرفون متواجدون على مدار 24 ساعة.", sys: true },
    { u: "سارة", t: "مساء الخير يا جماعة 🌙" },
    { u: me.name, t: "دخل الغرفة", sys: true },
  ]);
  const mySeat = seats.findIndex((s) => s?.kind === "me");
  const targets = [{ n: "المضيف", img: room.host, seat: 0 }, ...seats.map((s, i) => (s ? { n: s.kind === "me" ? "أنا" : s.n, img: s.kind === "me" ? me.img : avatarAt(s.a), seat: i + 1 } : null)).filter((x): x is { n: string; img: string; seat: number } => !!x)];

  const sit = (i: number) => {
    const s = seats[i];
    if (s && s.kind !== "me") { toast("المقعد مشغول"); return; }
    setSeats((arr) => arr.map((v, j) => (j === i ? (v?.kind === "me" ? null : { kind: "me" }) : v?.kind === "me" ? null : v)));
    setMsgs((m) => [...m, { u: me.name, t: s?.kind === "me" ? "نزل من المايك" : `صعد على المقعد No.${i + 2}`, sys: true }]);
  };
  const send = () => { if (!text.trim()) return; setMsgs((m) => [...m, { u: me.name, t: text }]); setText(""); };
  const sendGift = (g: Gift) => {
    const cost = g.p * qty;
    if (cost > coins) { toast("رصيدك غير كافٍ، اشحن من المحفظة"); return; }
    const t = targets[Math.min(to, targets.length - 1)]!;
    setCoins((c) => c - cost);
    setHearts((h) => h.map((v, i) => (i === t.seat ? v + cost : v)));
    setMsgs((m) => [...m, { u: me.name, t: `أرسل ${g.n} ×${qty} إلى ${t.n}`, sys: true, gift: g.img }]);
    setGiftOpen(false);
    setFly({ k: Date.now(), img: g.img });
    setTimeout(() => setFly(null), 1700);
  };
  const shown = tab === 0 ? msgs : tab === 1 ? msgs.filter((m) => !m.sys) : msgs.filter((m) => m.gift);

  return (
    <div dir="rtl" className="fixed inset-0 z-50 mx-auto max-w-[440px] overflow-hidden bg-night text-night-foreground">
      <img src={images.room} alt="" className="absolute inset-0 h-full w-full object-cover opacity-85" />
      <div className="absolute inset-0 bg-gradient-to-b from-night/40 via-transparent to-night/80" />
      <div className="relative flex h-full flex-col">
        <div className="flex items-center justify-between gap-2 px-3 pt-3">
          <div className="flex min-w-0 items-center gap-1.5 rounded-full border border-ice/50 night-glass py-0.5 pe-1 ps-0.5">
            <img src={room.img} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
            <div className="min-w-0"><p className="truncate text-[12.5px] font-bold leading-tight">{room.name}</p><p className="text-[9.5px] opacity-70">ID:10{room.id}3143{room.id}</p></div>
            <button onClick={() => { setFollow((f) => !f); toast(follow ? "تم إلغاء المتابعة" : "تمت متابعة الغرفة"); }} aria-label="متابعة" className="grid h-6 w-6 shrink-0 place-items-center rounded-full gold-bg text-navy">{follow ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}</button>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <div className="flex -space-x-2 space-x-reverse">{[2, 3, 7].map((x) => <img key={x} src={avatarAt(x)} alt="" className="h-6 w-6 rounded-full border border-night object-cover" />)}</div>
            <span className="rounded-full night-glass px-2 py-0.5 text-[11px] font-bold">{room.online + (mySeat >= 0 ? 1 : 0)}</span>
            <button onClick={() => toast("تم نسخ رابط الغرفة")} aria-label="مشاركة" className="grid h-8 w-8 place-items-center rounded-full night-glass"><Share2 className="h-4 w-4" /></button>
            <Link to="/" aria-label="خروج" className="grid h-8 w-8 place-items-center rounded-full night-glass"><Power className="h-4 w-4" /></Link>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1.5 px-3">
          <Link to="/wallet" className="flex items-center gap-1 rounded-full night-glass px-2 py-0.5 text-[11px]"><Coin n={coins} /></Link>
          <span className="flex items-center gap-1 rounded-full night-glass px-2 py-0.5 text-[11px]"><img src={ui.wealth} alt="" className="h-4 w-4" />لا يوجد ترتيب الآن</span>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-y-3 px-2">
          <Seat label="المضيف" img={room.host} hearts={hearts[0]!} owner speaking />
          {seats.map((s, i) => (
            <button key={i} onClick={() => sit(i)} className="relative">
              <Seat label={s?.kind === "me" ? "أنا" : s ? s.n : `No.${i + 2}`} img={s?.kind === "me" ? me.img : s ? avatarAt(s.a) : undefined} hearts={hearts[i + 1]!} speaking={(s?.kind === "me" && !muted) || i === 1} />
              {s?.kind === "me" && muted && <MicOff className="absolute top-9 right-[calc(50%-26px)] h-4 w-4 rounded-full bg-destructive p-0.5" />}
            </button>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-5 px-4 text-[13.5px]">
          {["الكل", "الدردشة", "الهدايا"].map((l, i) => (
            <button key={l} onClick={() => setTab(i)} className={`relative shrink-0 whitespace-nowrap pb-1 ${tab === i ? "font-extrabold" : "opacity-60"}`}>
              {l}{tab === i && <span className="absolute bottom-0 right-1/2 h-[2px] w-4 translate-x-1/2 rounded-full bg-night-foreground" />}
            </button>
          ))}
        </div>
        <div className="no-scrollbar mt-1.5 flex-1 space-y-1.5 overflow-y-auto px-3 pb-2">
          {shown.map((m, i) => (
            <div key={i} className={`w-fit max-w-[88%] rounded-xl px-2.5 py-1.5 text-[12px] leading-snug ${m.u === "إعلان رسمي" ? "border border-ice/30 bg-primary/25" : "night-glass"}`}>
              <span className="font-bold text-ice">{m.u}{m.sys ? " " : ": "}</span><span className={m.sys && m.u !== "إعلان رسمي" ? "text-ice/90" : ""}>{m.t}</span>
              {m.gift && <img src={m.gift} alt="" className="ms-1 inline h-5 w-5" />}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1.5 px-2.5 pb-4 pt-1.5">
          <button onClick={() => toast("قائمة الغرفة")} aria-label="القائمة" className="grid h-9 w-9 shrink-0 place-items-center rounded-full night-glass"><LayoutGrid className="h-[18px] w-[18px]" /></button>
          <Link to="/messages" aria-label="الرسائل" className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full night-glass"><Mail className="h-[18px] w-[18px]" /><span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-badge px-0.5 text-[9px] font-bold">3</span></Link>
          <div className="flex h-9 min-w-0 flex-1 items-center rounded-full night-glass ps-3 pe-1">
            <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="قل شيئاً..." className="w-full min-w-0 bg-transparent text-[12.5px] outline-none placeholder:text-night-foreground/50" />
            <button onClick={send} aria-label="إرسال" className="grid h-7 w-7 shrink-0 place-items-center"><Send className="h-4 w-4 -scale-x-100" /></button>
          </div>
          <button onClick={() => setText((t) => t + "😄")} aria-label="رموز" className="grid h-9 w-9 shrink-0 place-items-center rounded-full night-glass"><Smile className="h-[18px] w-[18px]" /></button>
          <button onClick={() => { if (mySeat < 0) { toast("اصعد على مقعد أولاً"); return; } setMuted((m) => !m); }} aria-label="المايك" className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${!muted && mySeat >= 0 ? "bg-primary" : "night-glass"}`}>{muted || mySeat < 0 ? <MicOff className="h-[18px] w-[18px]" /> : <Mic className="h-[18px] w-[18px]" />}</button>
          <button onClick={() => setGiftOpen(true)} aria-label="الهدايا" className="grid h-10 w-10 shrink-0 place-items-center rounded-full gold-bg shadow-lg"><img src={gifts[2]!.img} alt="" className="h-7 w-7" /></button>
        </div>
      </div>

      {fly && <div key={fly.k} className="pointer-events-none absolute inset-0 z-20 grid place-items-center"><img src={fly.img} alt="" className="gift-fly h-40 w-40 drop-shadow-2xl" /></div>}

      {giftOpen && (
        <div className="absolute inset-0 z-30 flex flex-col justify-end bg-night/50" onClick={() => setGiftOpen(false)}>
          <div className="rounded-t-[22px] border-t border-gold/60 bg-night/95 pb-4 backdrop-blur" onClick={(e) => e.stopPropagation()}>
            <div className="no-scrollbar flex items-center gap-2 overflow-x-auto border-b border-night-foreground/10 px-3 py-2.5">
              <span className="shrink-0 text-[11px] opacity-70">إرسال إلى</span>
              {targets.map((t, i) => (
                <button key={t.seat} onClick={() => setTo(i)} className="flex shrink-0 flex-col items-center">
                  <img src={t.img} alt="" className={`h-8 w-8 rounded-full object-cover ${to === i ? "gold-ring" : "opacity-60"}`} />
                  <span className="mt-0.5 text-[9.5px]">{t.n}</span>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-1.5 px-3 pt-2.5">
              {gifts.map((g, i) => (
                <button key={g.n} onClick={() => setGSel(i)} className={`flex flex-col items-center rounded-xl border py-1.5 ${gSel === i ? "border-gold bg-gold/10" : "border-transparent"}`}>
                  <img src={g.img} alt={g.n} className="h-11 w-11 object-contain" />
                  <span className="text-[11px]">{g.n}</span>
                  <span className="text-[10px] text-gold"><Coin n={g.p} /></span>
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 px-3">
              <Link to="/wallet" className="flex items-center gap-1 text-[12px]"><Coin n={coins} /> <span className="text-gold">شحن ›</span></Link>
              <div className="ms-auto flex overflow-hidden rounded-full border border-gold/70">
                {[1, 10, 99].map((q) => <button key={q} onClick={() => setQty(q)} className={`px-2.5 py-1 text-[11.5px] font-bold ${qty === q ? "gold-bg text-navy" : ""}`}>×{q}</button>)}
                <button onClick={() => sendGift(gifts[gSel]!)} className="gold-bg px-4 py-1 text-[12.5px] font-black text-navy">إرسال</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Seat({ label, img, hearts, owner, speaking }: { label: string; img?: string | undefined; hearts: number; owner?: boolean; speaking?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <span className={`relative grid h-[54px] w-[54px] place-items-center overflow-hidden rounded-full ${img ? "seat-ring" : ""} ${speaking ? "speaking" : ""} ${owner ? "gold-ring" : ""}`}>
        {img ? <img src={img} alt="" className="h-full w-full object-cover" /> : <img src={ui.seat} alt="" className="h-[54px] w-[54px] opacity-90" />}
      </span>
      <span className="mt-0.5 max-w-[72px] truncate text-[10.5px] font-semibold">{label}</span>
      <span className="flex items-center gap-0.5 rounded-full night-glass px-1.5 text-[9.5px] leading-4"><Heart className="h-2.5 w-2.5 fill-badge text-badge" />{hearts.toLocaleString("en")}</span>
    </div>
  );
}
