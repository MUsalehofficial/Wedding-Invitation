import { useEffect, useState } from "react";

interface EnvelopeProps {
  onOpen: () => void;
}

type Stage = "idle" | "pressed" | "opening" | "fading" | "done";

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
    if (stage === "pressed") {
      timers.push(window.setTimeout(() => setStage("opening"), 110));
    }
    if (stage === "opening") {
      timers.push(window.setTimeout(() => setStage("fading"), 560));
    }
    if (stage === "fading")
      timers.push(
        window.setTimeout(() => {
          setStage("done");
          // Trigger page reveal after fade-out completes.
          window.setTimeout(() => {
            document.body.style.overflow = "";
            onOpen();
          }, 320);
        }, 360)
      );
    return () => timers.forEach(window.clearTimeout);
  }, [stage, onOpen]);

  const handleOpen = () => {
    if (stage !== "idle") return;
    setStage("pressed");
  };

  const pressed = stage === "pressed";
  const opening = stage === "opening";
  const fading = stage === "fading";
  const sceneHidden = fading || stage === "done";
  const flapOpen = opening || fading;
  const sealHidden = opening || fading;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{
        backgroundColor: "hsl(var(--ivory))",
        opacity: stage === "done" ? 0 : 1,
        transition: `opacity 300ms ${ease}`,
        pointerEvents: stage === "done" ? "none" : "auto",
      }}
      aria-hidden={stage === "done"}
    >
      <div
        className="relative w-[86vw] max-w-[460px] aspect-[3/2]"
        style={{
          opacity: sceneHidden ? 0 : 1,
          transform: "translate3d(0, 0, 0) scale(1)",
          transition: `opacity 360ms ${ease}`,
          perspective: "1200px",
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            zIndex: 2,
            background:
              "radial-gradient(ellipse 58% 40% at 50% 54%, hsl(22 20% 12% / 0.16) 0%, transparent 72%)",
            opacity: flapOpen ? 1 : 0.55,
            transition: `opacity 420ms ${ease}`,
          }}
        />

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

        <div
          className="absolute inset-x-0 top-0 h-1/2"
          style={{
            zIndex: 6,
            transformStyle: "preserve-3d",
            transform: flapOpen ? "rotateX(-168deg)" : "rotateX(0deg)",
            transformOrigin: "50% 0%",
            transition: `transform 520ms ${ease}`,
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
              ? "translate3d(-50%, -50%, 0) scale(0.9)"
              : pressed
                ? "translate3d(-50%, -50%, 0) scale(0.92)"
              : "translate3d(-50%, -50%, 0) scale(1)",
            opacity: sealHidden ? 0 : 1,
            transition: `transform 220ms ${ease}, opacity 220ms ${ease}`,
            pointerEvents: sealHidden ? "none" : "auto",
            cursor: sealHidden ? "default" : "pointer",
          }}
        >
          <span aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-full" />
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
          className="absolute left-0 right-0 -bottom-14 text-center font-label text-[11px] tracking-luxury uppercase text-[hsl(var(--ink-soft))]"
          style={{
            opacity: stage === "idle" ? 1 : 0,
            transition: `opacity 180ms ${ease}`,
          }}
        >
          Tap the seal to open
        </p>
      </div>
    </div>
  );
};