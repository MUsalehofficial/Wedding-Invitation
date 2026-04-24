import { useEffect, useState } from "react";
import { Sprig, Divider, Monogram } from "@/components/InvitationOrnaments";
import { RsvpForm } from "@/components/RsvpForm";
import { Envelope } from "@/components/Envelope";
import { Countdown } from "@/components/Countdown";

const VENUE_URL = "https://maps.app.goo.gl/wKn12moQBgcNm5Cw8";

const Index = () => {
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    document.title = "Muhammad & Basmala — 7 August 2026";
    const desc = "Together with their families, Muhammad and Basmala request the pleasure of your company. Friday, 7 August 2026 at Maken Palace.";
    let m = document.querySelector('meta[name="description"]');
    if (!m) {
      m = document.createElement("meta");
      m.setAttribute("name", "description");
      document.head.appendChild(m);
    }
    m.setAttribute("content", desc);
  }, []);

  return (
    <main className="paper min-h-screen text-foreground">
      {!opened && <Envelope onOpen={() => setOpened(true)} />}
      <article
        className={`mx-auto max-w-2xl px-6 sm:px-10 py-16 sm:py-24 ${
          opened ? "animate-fade-in" : ""
        }`}
      >
        {/* Outer hairline frame */}
        <div className="border border-[hsl(var(--hairline)/0.6)] p-1">
          <div className="border border-[hsl(var(--champagne))] px-6 sm:px-12 py-14 sm:py-20">

            {/* HERO INVITATION */}
            <header className="text-center space-y-6">
              <p className="font-label text-[10px] sm:text-[11px] tracking-luxury text-[hsl(var(--ink-soft))] uppercase">
                Est. Two Thousand Twenty-Six
              </p>

              <div className="flex justify-center">
                <Sprig size={48} />
              </div>

              <p className="font-serif-italic text-base sm:text-lg text-[hsl(var(--ink-soft))]">
                Together with their families
              </p>

              <h1 className="font-display text-foreground leading-[1.05]">
                <span className="block text-5xl sm:text-7xl">Muhammad</span>
                <span className="block font-serif-italic text-3xl sm:text-5xl text-[hsl(var(--ink-soft))] my-2">
                  &amp;
                </span>
                <span className="block text-5xl sm:text-7xl">Basmala</span>
              </h1>

              <Divider className="pt-4" />

              <p className="font-serif-italic text-base sm:text-lg text-[hsl(var(--ink-soft))] leading-relaxed pt-2">
                request the pleasure of your company
                <br />
                as they celebrate their marriage
              </p>
            </header>

            {/* DATE BLOCK */}
            <section className="my-14 sm:my-20 grid grid-cols-3 items-center gap-4 sm:gap-6">
              <div className="text-center sm:text-right space-y-2">
                <p className="font-label text-[9px] sm:text-[10px] tracking-luxury text-[hsl(var(--ink-soft))] uppercase">
                  Friday
                </p>
                <p className="font-label text-[9px] sm:text-[10px] tracking-luxury text-[hsl(var(--ink-soft))] uppercase">
                  August
                </p>
              </div>

              <div className="flex justify-center border-x border-[hsl(var(--hairline))] py-2">
                <span className="font-display text-6xl sm:text-8xl leading-none text-foreground">
                  07
                </span>
              </div>

              <div className="text-center sm:text-left space-y-2">
                <p className="font-label text-[9px] sm:text-[10px] tracking-luxury text-[hsl(var(--ink-soft))] uppercase">
                  MMXXVI
                </p>
                <p className="font-label text-[9px] sm:text-[10px] tracking-luxury text-[hsl(var(--ink-soft))] uppercase">
                  Six P.M.
                </p>
              </div>
            </section>

            {/* VENUE */}
            <section className="text-center space-y-3">
              <p className="font-label text-[9px] tracking-luxury text-[hsl(var(--ink-soft))] uppercase">
                At
              </p>
              <h2 className="font-display text-3xl sm:text-4xl text-foreground">
                Maken Palace
              </h2>
              <a
                href={VENUE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block font-label text-[10px] tracking-editorial uppercase text-[hsl(var(--ink-soft))] border-b border-[hsl(var(--hairline))] hover:text-foreground hover:border-foreground transition-colors pb-0.5"
              >
                View on the map
              </a>
              <p className="font-serif-italic text-sm text-[hsl(var(--ink-soft))] pt-2">
                reception to follow
              </p>
            </section>

            {/* MONOGRAM */}
            <div className="flex justify-center mt-14">
              <Monogram />
            </div>

            {/* RSVP */}
            <section className="mt-20 sm:mt-28 pt-14 border-t border-[hsl(var(--champagne))]">
              <header className="text-center space-y-4 mb-12">
                <p className="font-label text-[10px] tracking-luxury text-[hsl(var(--ink-soft))] uppercase">
                  The Favour of a Reply
                </p>
                <div className="flex justify-center">
                  <Sprig size={36} />
                </div>
                <h2 className="font-display text-5xl sm:text-6xl text-foreground">
                  Rsvp
                </h2>
                <Divider />
              </header>

              <RsvpForm />
            </section>

            {/* FOOTER */}
            <footer className="mt-20 text-center">
              <p className="font-script text-3xl text-foreground">with love</p>
              <p className="font-label text-[9px] tracking-luxury text-[hsl(var(--hairline))] uppercase mt-8">
                Quiet Vows · MMXXVI
              </p>
            </footer>

          </div>
        </div>
      </article>
    </main>
  );
};

export default Index;
