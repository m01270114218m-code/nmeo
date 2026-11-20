import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Smartphone, ArrowRight } from "lucide-react";
import loopVideo from "@/assets/login-falcon-loop.mp4.asset.json";
import poster from "@/assets/login-falcon-poster.jpg.asset.json";

import { ChevronLeft } from "lucide-react";
import { useEffect } from "react";
import { IceHeader, PartyTabs, RoomCard } from "@/components/app/AppShell";
import { images, rooms, avatarAt, ui } from "@/components/app/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "فروست شات — تسجيل الدخول وغرف الدردشة الصوتية" },
      { name: "description", content: "سجّل الدخول ثم انضم إلى غرف الدردشة الصوتية العربية." },
      { property: "og:title", content: "فروست شات" },
      { property: "og:description", content: "غرف دردشة صوتية مباشرة" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomeGate,
});

function GoogleLogo() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
    </svg>
  );
}

function LoginGate({ onLogin }: { onLogin: () => void }) {
  const [step, setStep] = useState<"home" | "phone" | "otp">("home");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const primary =
    "flex w-full items-center justify-center gap-3 rounded-full bg-ice-pill py-4 text-lg font-bold text-ice-pill-text ice-shadow transition active:scale-[.98] disabled:opacity-50";
  const field =
    "rounded-2xl border border-ice-glass-border bg-ice-glass text-ice-text outline-none backdrop-blur-xl placeholder:text-ice-dim focus:border-ice-accent";

  return (
    <main className="relative h-dvh overflow-hidden bg-ice-deep font-arabic text-ice-text">
      <img src={poster.url} alt="" aria-hidden="true" className="absolute inset-0 hidden size-full scale-110 object-cover opacity-60 blur-2xl md:block" />
      <div className="relative mx-auto h-full w-full overflow-hidden md:aspect-[9/16] md:w-auto md:shadow-2xl">
        <video
          className="absolute inset-0 size-full object-cover"
          src={loopVideo.url}
          poster={poster.url}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        />
        <div className="ice-scrim absolute inset-0" />
        <div className="relative z-10 mx-auto flex h-full max-w-md flex-col px-6 pb-8 pt-14">
          <div className="ice-in text-center">
            <h1 className="ice-title text-5xl font-black tracking-tight">صدى</h1>
            <p className="ice-title mt-2 font-semibold text-ice-text">غرف صوتية بلا حدود</p>
          </div>

          <div key={step} className="ice-in mt-auto space-y-5">
            {step === "home" && (
              <>
                <button onClick={onLogin} className={`${primary} border border-ice-pill-border`}>
                  <GoogleLogo /> تسجيل الدخول بـ Google
                </button>
                <div className="flex items-center gap-4 px-10 text-sm text-ice-dim">
                  <span className="h-px flex-1 bg-ice-glass-border" /> أو <span className="h-px flex-1 bg-ice-glass-border" />
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => setStep("phone")}
                    aria-label="الدخول برقم الهاتف"
                    className="flex size-16 items-center justify-center rounded-full bg-ice-pill text-ice-pill-text ice-shadow transition active:scale-95"
                  >
                    <Smartphone className="size-7" />
                  </button>
                </div>
              </>
            )}

            {step === "phone" && (
              <div className="space-y-4 rounded-3xl border border-ice-glass-border bg-ice-glass p-5 backdrop-blur-2xl">
                <button onClick={() => setStep("home")} className="flex items-center gap-1 text-sm text-ice-dim">
                  <ArrowRight className="size-4" /> رجوع
                </button>
                <h2 className="text-xl font-bold">الدخول برقم الهاتف</h2>
                <div dir="ltr" className="flex gap-2">
                  <select className={`${field} px-3`}>
                    <option className="bg-ice-deep">🇪🇬 +20</option>
                    <option className="bg-ice-deep">🇸🇦 +966</option>
                    <option className="bg-ice-deep">🇦🇪 +971</option>
                    <option className="bg-ice-deep">🇰🇼 +965</option>
                  </select>
                  <input
                    inputMode="tel"
                    value={phone}
                    placeholder="10 1234 5678"
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className={`${field} min-w-0 flex-1 px-4 py-4 text-lg tracking-wider`}
                  />
                </div>
                <button disabled={phone.length < 8} onClick={() => setStep("otp")} className={primary}>
                  إرسال الكود
                </button>
              </div>
            )}

            {step === "otp" && (
              <div className="space-y-4 rounded-3xl border border-ice-glass-border bg-ice-glass p-5 backdrop-blur-2xl">
                <button onClick={() => setStep("phone")} className="flex items-center gap-1 text-sm text-ice-dim">
                  <ArrowRight className="size-4" /> تعديل الرقم
                </button>
                <h2 className="text-xl font-bold">كود التحقق</h2>
                <p className="text-sm text-ice-dim">
                  أدخل الكود المرسل إلى <bdi dir="ltr">+20 {phone}</bdi>
                </p>
                <div dir="ltr" className="flex justify-between gap-2">
                  {code.map((v, i) => (
                    <input
                      key={i}
                      ref={(el) => { refs.current[i] = el; }}
                      value={v}
                      maxLength={1}
                      inputMode="numeric"
                      aria-label={`الرقم ${i + 1}`}
                      onChange={(e) => {
                        const d = e.target.value.replace(/\D/g, "");
                        const n = [...code];
                        n[i] = d;
                        setCode(n);
                        if (d && i < 5) refs.current[i + 1]?.focus();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !code[i] && i > 0) refs.current[i - 1]?.focus();
                      }}
                      className={`${field} size-12 text-center text-xl font-bold`}
                    />
                  ))}
                </div>
                <button
                  disabled={code.join("").length < 6}
                  onClick={onLogin}
                  className={primary}
                >
                  تأكيد والدخول
                </button>
                <p className="text-center text-sm text-ice-dim">
                  لم يصلك الكود؟ <button className="font-bold text-ice-text underline">إعادة الإرسال</button>
                </p>
              </div>
            )}

            <p className="text-center text-xs text-ice-dim">
              بتسجيل الدخول توافق على <a className="font-semibold text-ice-text underline">اتفاقية المستخدم</a> و<a className="font-semibold text-ice-text underline">سياسة الخصوصية</a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function HomeGate() {
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem("frost_authenticated") === "1");

  if (!authenticated) {
    return <LoginGate onLogin={() => {
      sessionStorage.setItem("frost_authenticated", "1");
      setAuthenticated(true);
    }} />;
  }

  return <Home />;
}

const countries = [{ k: "all", l: "شائع", f: "❄️" }, { k: "🇪🇬", l: "مصر", f: "🇪🇬" }, { k: "🇸🇦", l: "السعودية", f: "🇸🇦" }, { k: "🇦🇪", l: "الإمارات", f: "🇦🇪" }, { k: "🇯🇴", l: "الأردن", f: "🇯🇴" }, { k: "🇲🇦", l: "المغرب", f: "🇲🇦" }];
const ranks = [
  { l: "ثروة", i: ui.wealth, gold: true, a: [0, 2, 7] },
  { l: "غرفة", i: ui.room, gold: false, a: [1, 3, 5] },
  { l: "الكاريزما", i: ui.charm, gold: false, a: [4, 6, 2] },
];

function Home() {
  const [slide, setSlide] = useState(0);
  const [c, setC] = useState("all");
  const slides = [images.banner1, images.banner2];
  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % slides.length), 4000);
    return () => clearInterval(t);
  }, [slides.length]);
  const list = c === "all" ? rooms : rooms.filter((r) => r.flag === c);

  return (
    <div>
      <IceHeader><PartyTabs active="party" /></IceHeader>
      <div className="space-y-3 px-3.5 pt-2">
        <div className="relative overflow-hidden rounded-2xl shadow-lg">
          <div className="flex transition-transform duration-500" style={{ transform: `translateX(${slide * 100}%)` }}>
            {slides.map((s, i) => <img key={i} src={s} alt="عرض" className="aspect-[2.6/1] w-full shrink-0 object-cover" />)}
          </div>
          <div className="absolute bottom-1.5 left-1/2 flex -translate-x-1/2 gap-1">
            {slides.map((_, i) => <button key={i} aria-label={`شريحة ${i + 1}`} onClick={() => setSlide(i)} className={`h-1.5 rounded-full transition-all ${i === slide ? "w-4 bg-secondary" : "w-1.5 bg-secondary/50"}`} />)}
          </div>
        </div>

        <div className="grid grid-cols-[1fr_1.05fr] gap-2.5">
          <div className="flex flex-col gap-2">
            {ranks.map((r) => (
              <button key={r.l} className={`press flex h-[46px] items-center gap-1.5 rounded-xl px-2 ${r.gold ? "gold-bg shadow-md" : "glass-card"}`}>
                <img src={r.i} alt="" className="h-7 w-7 shrink-0 drop-shadow" />
                <span className="min-w-0 flex-1 truncate text-start text-[12.5px] font-extrabold text-navy">{r.l}</span>
                <span className="flex -space-x-2 space-x-reverse">{r.a.slice(0, 2).map((x) => <img key={x} src={avatarAt(x)} alt="" className="h-[22px] w-[22px] rounded-full border-[1.5px] border-secondary object-cover" />)}</span>
              </button>
            ))}
          </div>
          <Link to="/events" className="press relative overflow-hidden rounded-xl shadow-md">
            <img src={images.banner2} alt="SUPER ADMIN" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-night/85 via-transparent to-transparent" />
            <div className="absolute inset-x-2 bottom-1.5 text-night-foreground">
              <p className="text-gold-grad text-[15px] font-black leading-tight">SUPER ADMIN</p>
              <p className="flex items-center text-[10px] opacity-90">انضم لوكالتنا الآن <ChevronLeft className="h-3 w-3" /></p>
            </div>
          </Link>
        </div>

        <div className="no-scrollbar -mx-3.5 flex gap-2 overflow-x-auto px-3.5">
          {countries.map((x) => <button key={x.k} onClick={() => setC(x.k)} className={`chip press ${c === x.k ? "chip-active" : ""}`}><span className="text-sm">{x.f}</span>{x.l}</button>)}
        </div>

        <div className="space-y-2.5 pb-3">
          {list.map((r) => <RoomCard key={r.id} r={r} />)}
          {!list.length && <p className="py-10 text-center text-muted-foreground">لا توجد غرف في هذه الدولة الآن</p>}
        </div>
      </div>
    </div>
  );
}
