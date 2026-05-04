import { useEffect, useLayoutEffect, useState } from "react";
import { ExternalLink, MapPin, MoonStar, SunMedium } from "lucide-react";
import { Sprig, Divider, Monogram } from "@/components/InvitationOrnaments";
import { RsvpForm } from "@/components/RsvpForm";
import { Envelope } from "@/components/Envelope";
import { Countdown } from "@/components/Countdown";

const VENUE_URL = "https://maps.app.goo.gl/tibpxijmCpNNDVAS9?g_st=ic";

const readStoredTheme = (): "dark" | "light" => {
  if (typeof window === "undefined") return "dark";
  const s = window.localStorage.getItem("invitation-theme");
  return s === "light" || s === "dark" ? s : "dark";
};

const Index = () => {
  const [opened, setOpened] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">(readStoredTheme);

  useLayoutEffect(() => {
    window.localStorage.setItem("invitation-theme", theme);
    document.documentElement.classList.toggle("theme-light", theme === "light");
  }, [theme]);

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
    <main className="paper min-h-screen text-foreground candle-glow">
      <button
        type="button"
        onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        className="fixed right-5 top-5 z-[70] inline-flex items-center gap-2.5 rounded-full border border-[hsl(var(--gold-line)/0.7)] px-4 py-2 font-label text-[11px] tracking-[0.16em] uppercase shadow-[0_10px_26px_rgba(0,0,0,0.22)] backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-[hsl(var(--candle)/0.9)]"
        style={{
          backgroundColor:
            theme === "dark" ? "hsl(var(--night-soft) / 0.74)" : "hsl(0 0% 100% / 0.86)",
          color: theme === "dark" ? "hsl(var(--candle-soft))" : "hsl(var(--candle-soft))",
        }}
      >
        {theme === "dark" ? <SunMedium size={15} strokeWidth={1.8} /> : <MoonStar size={15} strokeWidth={1.8} />}
        <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
      </button>

      {!opened && <Envelope onOpen={() => setOpened(true)} mode={theme} />}
      {opened && (
        <article className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20 lg:py-24">
          <div className="frame-cinematic p-1 sm:p-2 cinematic-fade">
            <div className="border border-[hsl(var(--gold-line)/0.7)] px-6 py-12 sm:px-12 sm:py-16">
              <header
                className="text-center space-y-7 cinematic-reveal"
                style={{ animationDelay: "80ms" }}
              >
                <div className="flex justify-center opacity-90">
                  <Sprig size={62} />
                </div>
                <p className="font-label text-[10px] tracking-luxury uppercase text-[hsl(var(--candle-soft)/0.88)]">
                  Love is in the air
                </p>
                <h1 className="font-display text-[2.75rem] leading-[1] text-[hsl(var(--foreground))] sm:text-[5rem]">
                  Muhammad
                  <span className="block py-1 font-serif-italic text-[1.8rem] text-[hsl(var(--candle-soft)/0.8)] sm:text-[2.6rem]">
                    &amp;
                  </span>
                  Basmala
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
                  <p className="font-label text-[10px] tracking-editorial uppercase text-[hsl(var(--mist)/0.78)] sm:text-xs">
                    Friday
                  </p>
                  <p className="font-label text-[10px] tracking-editorial uppercase text-[hsl(var(--mist)/0.78)] sm:text-xs">
                    August
                  </p>
                </div>
                <div className="border-x border-[hsl(var(--gold-line)/0.68)] py-1">
                  <span className="font-display text-6xl leading-none text-[hsl(var(--candle-soft))] sm:text-8xl">
                    07
                  </span>
                </div>
                <div className="space-y-2 sm:text-left">
                  <p className="font-label text-[10px] tracking-editorial uppercase text-[hsl(var(--mist)/0.78)] sm:text-xs">
                    2026
                  </p>
                  <p className="font-label text-[10px] tracking-editorial uppercase text-[hsl(var(--mist)/0.78)] sm:text-xs">
                    Six P.M.
                  </p>
                </div>
              </section>

              <section
                className="mt-12 text-center space-y-4 cinematic-reveal"
                style={{ animationDelay: "260ms" }}
              >
                <p className="font-label text-[10px] tracking-luxury uppercase text-[hsl(var(--mist)/0.8)]">
                  Ceremony begins at
                </p>
                <p className="font-display text-5xl leading-none text-[hsl(var(--candle-soft))] sm:text-6xl">
                  6:00
                  <span className="pl-2 font-serif-italic text-3xl text-[hsl(var(--mist)/0.82)] sm:text-4xl">
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
                <RsvpForm />
              </section>

              <footer
                className="mt-16 space-y-5 text-center cinematic-reveal sm:mt-20"
                style={{ animationDelay: "620ms" }}
              >
                <p className="font-script text-4xl text-[hsl(var(--candle-soft))]">with love</p>
                <p className="font-label text-[10px] tracking-editorial uppercase text-[hsl(var(--mist)/0.76)]">
                  Muhammad &amp; Basmala · 2026
                </p>
              </footer>
            </div>
          </div>
        </article>
      )}
    </main>
  );
};

export default Index;
