import { useEffect, useState } from "react";

interface EnvelopeProps {
  onOpen: () => void;
}

type Stage = "idle" | "opening" | "leaving";

/**
 * Greenvelope-inspired entrance:
 *   1. envelope sits centered, wax seal glows
 *   2. seal click → flap unfolds upward, card slides up out of pocket
 *   3. whole scene fades into the invitation
 *
 * Uses only 2D transforms + clip-path to stay smooth.
 */
export const Envelope = ({ onOpen }: EnvelopeProps) => {
  const [stage, setStage] = useState<Stage>("idle");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleOpen = () => {
    if (stage !== "idle") return;
    setStage("opening");
    window.setTimeout(() => setStage("leaving"), 1700);
    window.setTimeout(() => {
      document.body.style.overflow = "";
      onOpen();
    }, 2400);
  };

  const opening = stage !== "idle";
  const expanding = stage === "leaving";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden paper transition-opacity duration-700 ease-out ${
        stage === "leaving" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-hidden={stage === "leaving"}
    >
      {/* Soft warm vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 52%, hsl(var(--champagne) / 0.45) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-[86vw] max-w-[460px] aspect-[3/2]">
        {/* ENVELOPE BACK */}
        <div
          className="absolute inset-0 border border-[hsl(var(--hairline))]"
          style={{
            zIndex: 1,
            background:
              "linear-gradient(180deg, hsl(36 28% 92%) 0%, hsl(36 26% 86%) 100%)",
            boxShadow:
              "0 38px 60px -32px hsl(22 15% 18% / 0.45), 0 8px 18px -10px hsl(22 15% 18% / 0.18)",
          }}
        />

        {/* OPEN FLAP SHADOW / INNER LINING */}
        <div
          aria-hidden="true"
          className={`absolute inset-x-0 top-0 h-1/2 origin-bottom transition-all ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
            opening ? "-translate-y-[92%] opacity-100 duration-[1100ms]" : "translate-y-0 opacity-0 duration-500"
          }`}
          style={{
            zIndex: 2,
            clipPath: "polygon(0 100%, 50% 0, 100% 100%)",
            background:
              "linear-gradient(180deg, hsl(36 32% 94%) 0%, hsl(36 25% 86%) 100%)",
            border: "1px solid hsl(var(--hairline) / 0.55)",
          }}
        />

        {/* CARD — slides up from inside the envelope */}
        <div
          className={`absolute left-1/2 w-[78%] max-w-[360px] aspect-[3/4.2] border border-[hsl(var(--champagne))] bg-[hsl(var(--ivory))] transition-all ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
            expanding
              ? "bottom-1/2 -translate-x-1/2 translate-y-1/2 scale-[3.2] opacity-100 duration-700"
              : opening
                ? "bottom-[34%] -translate-x-1/2 translate-y-0 scale-100 opacity-100 duration-[1400ms] delay-200"
                : "bottom-[8%] -translate-x-1/2 translate-y-[58%] scale-95 opacity-0 duration-300"
          }`}
          style={{
            zIndex: expanding ? 30 : 3,
            boxShadow:
              "0 26px 50px -28px hsl(22 15% 18% / 0.45), 0 2px 8px hsl(22 15% 18% / 0.08)",
          }}
        >
          <div className="flex h-full flex-col items-center justify-center gap-3 px-5 text-center">
            <p className="font-label text-[10px] tracking-luxury uppercase text-[hsl(var(--ink-soft))]">
              You are invited
            </p>
            <span className="block h-px w-10 bg-[hsl(var(--hairline))]" />
            <p className="font-display text-2xl leading-tight text-foreground sm:text-3xl">
              Muhammad
              <span className="my-1 block font-serif-italic text-base text-[hsl(var(--ink-soft))] sm:text-lg">
                &amp;
              </span>
              Basmala
            </p>
            <span className="block h-px w-10 bg-[hsl(var(--hairline))]" />
            <p className="font-label text-[10px] tracking-luxury uppercase text-[hsl(var(--ink-soft))]">
              07 · 08 · 2026
            </p>
          </div>
        </div>

        {/* FRONT POCKET (V) — slightly darker champagne for depth */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            zIndex: 5,
            background:
              "linear-gradient(180deg, hsl(36 24% 82%) 0%, hsl(34 22% 76%) 100%)",
            clipPath: "polygon(0 50%, 50% 100%, 100% 50%, 100% 100%, 0 100%)",
            boxShadow: "inset 0 1px 0 hsl(36 28% 92% / 0.8)",
          }}
        />

        {/* Pocket diagonal hairlines */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            zIndex: 6,
            background:
              "linear-gradient(135deg, transparent calc(50% - 0.5px), hsl(var(--hairline)) 50%, transparent calc(50% + 0.5px)), linear-gradient(45deg, transparent calc(50% - 0.5px), hsl(var(--hairline)) 50%, transparent calc(50% + 0.5px))",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "left bottom, right bottom",
            backgroundSize: "50% 50%, 50% 50%",
            opacity: 0.65,
          }}
        />

        {/* FLAP — folds upward (scaleY) like a real envelope opening */}
        <div
          className={`absolute inset-x-0 top-0 h-1/2 origin-top transition-transform ease-[cubic-bezier(0.65,0,0.35,1)] will-change-transform ${
            opening ? "-translate-y-[92%] scale-y-100 duration-[1100ms]" : "translate-y-0 scale-y-100 duration-700"
          }`}
          style={{ zIndex: opening ? 2 : 7 }}
        >
          <div
            className="absolute inset-0"
            style={{
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              background:
                "linear-gradient(180deg, hsl(36 30% 92%) 0%, hsl(36 26% 84%) 100%)",
              boxShadow:
                "inset 0 -14px 22px -14px hsl(22 15% 18% / 0.18)",
              borderTop: "1px solid hsl(var(--hairline))",
            }}
          />
        </div>

        {/* WAX SEAL — sits at the tip of the flap */}
        <button
          type="button"
          onClick={handleOpen}
          aria-label="Open invitation"
          className={`absolute left-1/2 top-1/2 z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ink))] focus:ring-offset-2 focus:ring-offset-[hsl(var(--ivory))] transition-all duration-500 will-change-transform sm:h-[72px] sm:w-[72px] ${
            opening ? "scale-90 opacity-0 pointer-events-none" : "hover:scale-110 cursor-pointer"
          }`}
          style={{
            background:
              "radial-gradient(circle at 32% 28%, hsl(36 60% 65%) 0%, hsl(28 50% 42%) 55%, hsl(15 55% 20%) 100%)",
            boxShadow:
              "0 8px 18px -4px hsl(15 55% 15% / 0.6), inset 0 1px 2px hsl(36 75% 85% / 0.7), inset 0 -4px 8px hsl(15 55% 15% / 0.45)",
          }}
        >
          <span aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-full">
            <span className="absolute inset-0 rounded-full animate-seal-shine" />
          </span>
          <span
            aria-hidden="true"
            className="absolute inset-[5px] rounded-full border border-[hsl(36_60%_82%/0.45)]"
          />
          <span className="relative font-display text-lg tracking-wider text-[hsl(36_55%_94%)] drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)] sm:text-xl">
            M·B
          </span>
        </button>

        {/* Tap hint — placed below the envelope, never overlapping the seal */}
        <p
          className={`absolute left-0 right-0 -bottom-14 text-center font-label text-[11px] tracking-luxury uppercase text-[hsl(var(--ink-soft))] transition-opacity duration-500 ${
            opening ? "opacity-0" : "opacity-100 animate-pulse"
          }`}
        >
          Tap the seal to open
        </p>
      </div>
    </div>
  );
};