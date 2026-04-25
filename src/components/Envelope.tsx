import { useEffect, useState } from "react";

interface EnvelopeProps {
  onOpen: () => void;
}

/**
 * Choreographed entrance sequence:
 *   idle    → envelope sealed, seal shimmer, gentle float
 *   flap    → wax seal fades, flap unfolds upward (smooth ease)
 *   rising  → card rises from inside the pocket
 *   expand  → card scales to fullscreen, envelope fades out
 *   done    → reveal page underneath
 *
 * All movement uses translate3d + scale on a single transform-capable layer
 * for GPU acceleration. No clip-path animation, no layout-affecting props.
 */
type Stage = "idle" | "flap" | "rising" | "expand" | "done";

const ease = "cubic-bezier(0.22, 1, 0.36, 1)";

export const Envelope = ({ onOpen }: EnvelopeProps) => {
  const [stage, setStage] = useState<Stage>("idle");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (stage === "idle" || stage === "done") return;
    const timers: number[] = [];
    if (stage === "flap") timers.push(window.setTimeout(() => setStage("rising"), 850));
    if (stage === "rising") timers.push(window.setTimeout(() => setStage("expand"), 1200));
    if (stage === "expand")
      timers.push(
        window.setTimeout(() => {
          document.body.style.overflow = "";
          setStage("done");
          onOpen();
        }, 950)
      );
    return () => timers.forEach(window.clearTimeout);
  }, [stage, onOpen]);

  const handleOpen = () => {
    if (stage !== "idle") return;
    setStage("flap");
  };

  const sealHidden = stage !== "idle";
  const flapOpen = stage === "flap" || stage === "rising" || stage === "expand";
  const cardRising = stage === "rising" || stage === "expand";
  const cardExpanding = stage === "expand";
  const sceneFading = stage === "expand";

  // Card transform per stage — single GPU-friendly transform string
  const cardTransform = cardExpanding
    ? "translate3d(-50%, -50%, 0) scale(4)"
    : cardRising
      ? "translate3d(-50%, -118%, 0) scale(1)"
      : "translate3d(-50%, 8%, 0) scale(0.96)";

  const cardOpacity = stage === "idle" ? 0 : cardExpanding ? 0 : 1;
  // During expand we crossfade to white-ivory so it dissolves into the page
  const cardDuration = cardExpanding ? "950ms" : cardRising ? "1100ms" : "300ms";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden paper"
      style={{
        opacity: stage === "done" ? 0 : 1,
        transition: `opacity 600ms ${ease}`,
        pointerEvents: stage === "done" ? "none" : "auto",
      }}
      aria-hidden={stage === "done"}
    >
      {/* Soft warm vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 52%, hsl(var(--champagne) / 0.45) 0%, transparent 70%)",
          opacity: sceneFading ? 0 : 1,
          transition: `opacity 700ms ${ease}`,
        }}
      />

      {/* ENVELOPE SCENE — fades out as card expands */}
      <div
        className="relative w-[86vw] max-w-[460px] aspect-[3/2]"
        style={{
          opacity: sceneFading ? 0 : 1,
          transition: `opacity 600ms ${ease} 150ms`,
        }}
      >
        {/* Envelope back (paper inside) */}
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

        {/* CARD — sits behind the front pocket so it appears to come from inside */}
        <div
          className="absolute left-1/2 top-1/2 w-[78%] max-w-[360px] aspect-[3/4.2] border border-[hsl(var(--champagne))] bg-[hsl(var(--ivory))] will-change-transform"
          style={{
            zIndex: cardExpanding ? 30 : 3,
            transform: cardTransform,
            opacity: cardOpacity,
            transition: `transform ${cardDuration} ${ease}, opacity ${cardDuration} ${ease}`,
            boxShadow:
              "0 30px 50px -28px hsl(22 15% 18% / 0.45), 0 4px 12px hsl(22 15% 18% / 0.1)",
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

        {/* FRONT POCKET (V) — keeps the card hidden until it rises above */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            zIndex: 4,
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
            zIndex: 5,
            background:
              "linear-gradient(135deg, transparent calc(50% - 0.5px), hsl(var(--hairline)) 50%, transparent calc(50% + 0.5px)), linear-gradient(45deg, transparent calc(50% - 0.5px), hsl(var(--hairline)) 50%, transparent calc(50% + 0.5px))",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "left bottom, right bottom",
            backgroundSize: "50% 50%, 50% 50%",
            opacity: 0.65,
          }}
        />

        {/* FLAP — translates upward smoothly (no scale, no clip-path animation) */}
        <div
          className="absolute inset-x-0 top-0 h-1/2 will-change-transform"
          style={{
            zIndex: flapOpen ? 2 : 6,
            transform: flapOpen ? "translate3d(0, -88%, 0)" : "translate3d(0, 0, 0)",
            transition: `transform 900ms ${ease}`,
          }}
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

        {/* WAX SEAL — anchored to envelope center */}
        <button
          type="button"
          onClick={handleOpen}
          aria-label="Open invitation"
          className="absolute left-1/2 top-1/2 z-10 flex h-16 w-16 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ink))] focus:ring-offset-2 focus:ring-offset-[hsl(var(--ivory))] will-change-transform sm:h-[72px] sm:w-[72px]"
          style={{
            background:
              "radial-gradient(circle at 32% 28%, hsl(36 60% 65%) 0%, hsl(28 50% 42%) 55%, hsl(15 55% 20%) 100%)",
            boxShadow:
              "0 8px 18px -4px hsl(15 55% 15% / 0.6), inset 0 1px 2px hsl(36 75% 85% / 0.7), inset 0 -4px 8px hsl(15 55% 15% / 0.45)",
            transform: sealHidden
              ? "translate3d(-50%, -50%, 0) scale(0.6)"
              : "translate3d(-50%, -50%, 0) scale(1)",
            opacity: sealHidden ? 0 : 1,
            transition: `transform 500ms ${ease}, opacity 400ms ${ease}`,
            pointerEvents: sealHidden ? "none" : "auto",
            cursor: sealHidden ? "default" : "pointer",
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

        {/* Tap hint */}
        <p
          className={`absolute left-0 right-0 -bottom-14 text-center font-label text-[11px] tracking-luxury uppercase text-[hsl(var(--ink-soft))] ${
            stage === "idle" ? "animate-pulse" : ""
          }`}
          style={{
            opacity: stage === "idle" ? 1 : 0,
            transition: `opacity 400ms ${ease}`,
          }}
        >
          Tap the seal to open
        </p>
      </div>
    </div>
  );
};