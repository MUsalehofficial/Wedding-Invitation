import { useEffect, useLayoutEffect, useState } from "react";
import { ExternalLink, MapPin, MoonStar, SunMedium } from "lucide-react";
import ringsLove from "@/assets/ringslove.png";
import { AddToCalendar } from "@/components/AddToCalendar";
import { Sprig, Divider, Monogram } from "@/components/InvitationOrnaments";
import { RsvpForm } from "@/components/RsvpForm";
import { Envelope } from "@/components/Envelope";
import { Countdown } from "@/components/Countdown";
import { cn } from "@/lib/utils";

const VENUE_URL = "https://maps.app.goo.gl/tibpxijmCpNNDVAS9?g_st=ic";

/** Bumped when default should reset to light; older keys are ignored so guests don’t inherit stale “dark”. */
const READING_THEME_STORAGE = "invitation-reading-theme-v2";

const readStoredTheme = (): "dark" | "light" => {
  if (typeof window === "undefined") return "light";
  const s = window.localStorage.getItem(READING_THEME_STORAGE);
  return s === "light" || s === "dark" ? s : "light";
};

const Index = () => {
  const [opened, setOpened] = useState(false);
  const [rsvpSent, setRsvpSent] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">(readStoredTheme);
  useLayoutEffect(() => {
    window.localStorage.setItem(READING_THEME_STORAGE, theme);
    document.documentElement.classList.toggle("theme-light", theme === "light");
    document.documentElement.style.colorScheme = theme === "light" ? "light" : "dark";
  }, [theme]);

  useEffect(() => {
    if (!rsvpSent || !opened) return;
    window.scrollTo(0, 0);
  }, [rsvpSent, opened]);

  useEffect(() => {
    document.title = "Muhammad & Basmala — 7 August 2026";
    const desc =
      "Muhammad and Basmala invite you to celebrate their marriage — Where Our Forever Begins. Friday, 7 August 2026.";
    let m = document.querySelector('meta[name="description"]');
    if (!m) {
      m = document.createElement("meta");
      m.setAttribute("name", "description");
      document.head.appendChild(m);
    }
    m.setAttribute("content", desc);
  }, []);

  return (
    <main
      className={cn(
        "relative min-h-screen text-foreground",
        theme === "dark" ? "invite-linen-dark" : "paper candle-glow",
      )}
    >
      {/* Entrance + invitation: floating theme toggle above envelope layer (envelope z-50) */}
      <button
        type="button"
        onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
        aria-label={theme === "dark" ? "Switch to light reading mode" : "Switch to evening mode"}
        className="fixed bottom-7 right-6 z-[70] flex h-10 w-10 items-center justify-center rounded-full border border-[var(--lux-gold)]/40 bg-[hsl(var(--card)/0.72)] text-[var(--lux-gold)] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)] backdrop-blur-[10px] transition-all duration-500 hover:border-[var(--lux-gold)]/65 hover:bg-[hsl(var(--card)/0.9)] hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lux-gold)]/45"
        style={{ opacity: opened ? 0.72 : 0.92 }}
      >
        {theme === "dark" ? <SunMedium size={16} strokeWidth={1.5} /> : <MoonStar size={16} strokeWidth={1.5} />}
      </button>

      {!opened && <Envelope onOpen={() => setOpened(true)} mode={theme} />}
      {opened && rsvpSent && (
        <article className="mx-auto flex min-h-[100dvh] max-w-4xl flex-col justify-center px-5 py-14 sm:px-8 sm:py-20 lg:py-24">
          <div className="frame-cinematic cinematic-fade mx-auto w-full max-w-lg p-1 sm:p-2">
            <div className="invitation-inner-frame border px-8 py-14 text-center sm:px-12 sm:py-16">
              <div className="flex flex-col items-center space-y-10 sm:space-y-12">
                <h2 className="font-display text-5xl text-[hsl(var(--foreground))] sm:text-6xl">
                  Thank You
                </h2>
                <p className="font-serif-italic text-lg leading-relaxed text-[hsl(var(--mist)/0.88)] sm:text-xl">
                  Your reply has been received with gratitude. We look forward to celebrating with you.
                </p>
                <div className="flex w-full justify-center">
                  <AddToCalendar />
                </div>
                <div className="space-y-5 pt-2">
                  <p className="font-script text-4xl text-[hsl(var(--candle-soft))]">with love</p>
                  <p className="font-label text-[10px] tracking-editorial uppercase text-[hsl(var(--mist)/0.76)]">
                    Muhammad &amp; Basmala · 2026
                  </p>
                </div>
              </div>
            </div>
          </div>
        </article>
      )}
      {opened && !rsvpSent && (
        <article className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20 lg:py-24">
          <div className="frame-cinematic p-1 sm:p-2 cinematic-fade">
            <div className="invitation-inner-frame border px-6 py-12 sm:px-12 sm:py-16">
              <header
                className="text-center space-y-7 cinematic-reveal"
                style={{ animationDelay: "80ms" }}
              >
                <div className="flex justify-center px-2 opacity-95">
                  <img
                    src={ringsLove}
                    alt=""
                    aria-hidden
                    className="mx-auto max-h-[92px] w-auto max-w-[min(100%,320px)] object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.35)] sm:max-h-[110px]"
                    loading="lazy"
                    draggable={false}
                  />
                </div>
                <p className="font-label text-[10px] tracking-luxury uppercase text-[var(--lux-gold)]/85">
                  Love is in the air
                </p>
                <h1 className="font-display text-[2.7rem] font-normal leading-[1.06] text-[hsl(var(--foreground))] sm:text-[4.85rem]">
                  <span className="block tracking-[0.02em]">Muhammad</span>
                  <span className="block py-1 font-serif-italic font-normal text-[1.82rem] text-[var(--lux-gold)] sm:py-1 sm:text-[2.65rem]">
                    &amp;
                  </span>
                  <span className="block tracking-[0.02em]">Basmala</span>
                </h1>
                <Divider />
                <div className="mx-auto max-w-xl space-y-4 text-[hsl(var(--mist)/0.84)]">
                  <p className="font-display text-[1.35rem] leading-snug text-[hsl(var(--foreground))] sm:text-2xl">
                    Where Our Forever Begins
                  </p>
                  <p className="font-serif-italic text-xl text-[hsl(var(--candle-soft)/0.88)] sm:text-[1.35rem]">
                    A Night Written in Love
                  </p>
                  <p className="font-serif-italic text-lg leading-relaxed text-[hsl(var(--mist)/0.84)] sm:text-xl">
                    We invite you to share in our joy and be part of a night filled with love and laughter.
                  </p>
                </div>
              </header>

              <section
                className="mt-14 grid grid-cols-3 items-center gap-3 border-y border-[hsl(var(--gold-line)/0.68)] py-8 text-center cinematic-reveal sm:mt-18 sm:gap-8"
                style={{ animationDelay: "180ms" }}
              >
                <div className="space-y-2 sm:text-right">
                  <p className="font-label text-[10px] tracking-editorial uppercase text-[hsl(var(--mist)/0.92)] sm:text-xs">
                    2026
                  </p>
                  <p className="font-label text-[10px] tracking-editorial uppercase text-[hsl(var(--mist)/0.92)] sm:text-xs">
                    August
                  </p>
                </div>
                <div className="border-x border-[hsl(var(--gold-line)/0.68)] py-1">
                  <span className="font-display text-6xl leading-none text-[hsl(var(--candle-soft))] sm:text-8xl">
                    07
                  </span>
                </div>
                <div className="space-y-2 sm:text-left">
                  <p className="font-label text-[10px] tracking-editorial uppercase text-[hsl(var(--mist)/0.92)] sm:text-xs">
                    Friday
                  </p>
                </div>
              </section>

              <section
                className="mt-12 text-center space-y-4 cinematic-reveal"
                style={{ animationDelay: "260ms" }}
              >
                <p className="font-label text-[10px] tracking-luxury uppercase text-[hsl(var(--mist)/0.93)]">
                  Ceremony begins at
                </p>
                <p className="font-display text-5xl leading-none text-[hsl(var(--candle-soft))] sm:text-6xl">
                  5:00
                  <span className="pl-2 font-serif-italic text-3xl text-[hsl(var(--mist)/0.92)] sm:text-4xl">
                    pm
                  </span>
                </p>
              </section>

              <section
                className="mt-14 space-y-6 text-center cinematic-reveal"
                style={{ animationDelay: "340ms" }}
              >
                <p className="font-label text-[10px] tracking-luxury uppercase text-[hsl(var(--mist)/0.8)]">
                  Venue
                </p>
                <h2 className="font-display text-4xl text-[hsl(var(--foreground))] sm:text-5xl">
                  Maken Palace
                </h2>

                <a
                  href={VENUE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mx-auto inline-flex min-w-[min(100%,17rem)] items-center justify-center gap-2.5 rounded-sm border-2 border-[hsl(var(--candle))] bg-[hsl(var(--candle)/0.24)] px-8 py-3.5 font-label text-xs !font-semibold tracking-editorial uppercase text-[hsl(var(--candle-soft))] shadow-[0_10px_32px_rgba(0,0,0,0.28)] transition-all duration-200 hover:bg-[hsl(var(--candle)/0.34)] hover:brightness-105 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--candle))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))]"
                >
                  <MapPin size={18} strokeWidth={2} className="shrink-0 text-[hsl(var(--candle))]" aria-hidden />
                  View on the map
                  <ExternalLink
                    size={15}
                    strokeWidth={2}
                    className="shrink-0 opacity-75 transition-opacity group-hover:opacity-100"
                    aria-hidden
                  />
                </a>

                <p className="font-serif-italic text-lg text-[hsl(var(--mist)/0.8)]">
                  dinner &amp; celebration to follow the ceremony
                </p>
              </section>

              <section
                className="mt-16 space-y-6 text-center cinematic-reveal"
                style={{ animationDelay: "440ms" }}
              >
                <p className="font-label text-[10px] tracking-luxury uppercase text-[hsl(var(--mist)/0.82)]">
                  Counting the moments
                </p>
                <Countdown />
              </section>

              <div
                className="mt-12 flex justify-center cinematic-reveal"
                style={{ animationDelay: "500ms" }}
              >
                <Monogram />
              </div>

              <section
                className="mt-16 border-t border-[hsl(var(--gold-line)/0.65)] pt-12 cinematic-reveal sm:mt-20 sm:pt-14"
                style={{ animationDelay: "560ms" }}
              >
                <header className="mb-10 space-y-4 text-center">
                  <p className="font-label text-[10px] tracking-luxury uppercase text-[hsl(var(--mist)/0.82)]">
                    Kindly Reply
                  </p>
                  <div className="flex justify-center opacity-85">
                    <Sprig size={42} />
                  </div>
                  <h2 className="font-display text-5xl text-[hsl(var(--foreground))] sm:text-6xl">RSVP</h2>
                  <Divider />
                </header>
                <RsvpForm onSuccess={() => setRsvpSent(true)} />
              </section>
            </div>
          </div>
        </article>
      )}
    </main>
  );
};

export default Index;
