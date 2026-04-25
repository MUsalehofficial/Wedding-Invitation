import { useEffect, useState } from "react";

interface EnvelopeProps {
  onOpen: () => void;
}

type Stage = "idle" | "opening" | "leaving";

const EnvelopeCard = ({ stage }: { stage: Stage }) => (
  <div
    className={`absolute left-1/2 top-0 w-[64%] max-w-[340px] aspect-[3/4.35] -translate-x-1/2 border border-[hsl(var(--champagne))] bg-background transition-all ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
      stage === "idle"
        ? "translate-y-10 opacity-0 duration-300"
        : "-translate-y-[42%] opacity-100 duration-[1400ms] delay-150"
    }`}
    style={{
      boxShadow:
        "0 22px 45px -30px hsl(var(--foreground) / 0.45), 0 2px 10px hsl(var(--foreground) / 0.05)",
    }}
  >
    <div className="flex h-full flex-col items-center justify-start px-5 pt-10 text-center sm:pt-12">
      <p className="font-label text-xs tracking-editorial uppercase text-[hsl(var(--ink-soft))]">
        You are invited
      </p>
      <span className="my-7 block h-px w-12 bg-[hsl(var(--hairline))]" />
      <p className="font-display text-3xl leading-tight text-foreground sm:text-4xl">
        Muhammad
        <span className="my-1 block font-serif-italic text-xl text-[hsl(var(--ink-soft))]">
          &amp;
        </span>
        Basmala
      </p>
      <span className="my-7 block h-px w-12 bg-[hsl(var(--hairline))]" />
      <p className="font-label text-xs tracking-editorial uppercase text-[hsl(var(--ink-soft))]">
        07 · 08 · 2026
      </p>
    </div>
  </div>
);

const WaxSeal = ({ stage, onOpen }: { stage: Stage; onOpen: () => void }) => (
  <button
    type="button"
    onClick={onOpen}
    aria-label="Open invitation"
    className={`absolute left-1/2 top-1/2 z-20 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-all duration-500 will-change-transform sm:h-[72px] sm:w-[72px] ${
      stage === "idle" ? "hover:scale-105" : "scale-90 opacity-0 pointer-events-none"
    }`}
    style={{
      background:
        "radial-gradient(circle at 35% 28%, hsl(36 63% 72%) 0%, hsl(30 42% 46%) 48%, hsl(10 42% 25%) 100%)",
      boxShadow:
        "0 12px 22px -10px hsl(var(--foreground) / 0.65), inset 0 1px 2px hsl(36 70% 88% / 0.75), inset 0 -5px 10px hsl(10 42% 18% / 0.45)",
    }}
  >
    <span aria-hidden="true" className="absolute inset-[5px] rounded-full border border-[hsl(var(--secondary)/0.55)]" />
    <span aria-hidden="true" className="absolute inset-0 rounded-full overflow-hidden">
      <span className="absolute inset-0 rounded-full animate-seal-shine" />
    </span>
    <span className="relative font-display text-xl tracking-normal text-primary-foreground drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)]">
      M.B
    </span>
  </button>
);

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
    window.setTimeout(() => setStage("leaving"), 1550);
    window.setTimeout(() => {
      document.body.style.overflow = "";
      onOpen();
    }, 2200);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden paper transition-opacity duration-700 ease-out ${
        stage === "leaving" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-hidden={stage === "leaving"}
    >
      <div className="relative flex w-full max-w-4xl justify-center px-6">
        <div
          className={`relative mt-28 w-[88vw] max-w-[560px] aspect-[3/1.95] transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
            stage === "idle" ? "translate-y-0" : "translate-y-10"
          }`}
        >
          <EnvelopeCard stage={stage} />

          <div
            className="absolute inset-0 z-10 border border-[hsl(var(--hairline)/0.65)] bg-background"
            style={{
              boxShadow:
                "0 32px 60px -34px hsl(var(--foreground) / 0.5), 0 6px 18px -16px hsl(var(--foreground) / 0.28)",
            }}
          >
            <span
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(28deg, hsl(var(--secondary)/0.62) 0 31%, transparent 31.2%), linear-gradient(152deg, hsl(var(--secondary)/0.62) 0 31%, transparent 31.2%), linear-gradient(146deg, transparent calc(50% - 0.5px), hsl(var(--hairline)/0.55) 50%, transparent calc(50% + 0.5px)), linear-gradient(34deg, transparent calc(50% - 0.5px), hsl(var(--hairline)/0.55) 50%, transparent calc(50% + 0.5px))",
              }}
            />
            <span
              aria-hidden="true"
              className={`absolute left-0 right-0 top-0 h-[54%] origin-top bg-background transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
                stage === "idle" ? "scale-y-100" : "scale-y-0"
              }`}
              style={{
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                boxShadow: "inset 0 -14px 22px -18px hsl(var(--foreground) / 0.25)",
              }}
            />
          </div>

          <WaxSeal stage={stage} onOpen={handleOpen} />
        </div>

        <p
          className={`absolute -bottom-14 left-0 right-0 text-center font-label text-xs tracking-editorial uppercase text-[hsl(var(--ink-soft))] transition-opacity duration-500 ${
            stage === "idle" ? "opacity-100" : "opacity-0"
          }`}
        >
          Tap the seal to open
        </p>
      </div>
    </div>
  );
};