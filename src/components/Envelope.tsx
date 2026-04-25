import { useEffect, useState } from "react";

interface EnvelopeProps {
  onOpen: () => void;
}

/**
 * Modern, smooth entrance:
 *  - idle:    sealed envelope, gentle float + seal shine
 *  - opening: flap lifts (3D), card rises and scales up
 *  - leaving: whole scene fades and lifts away
 */
export const Envelope = ({ onOpen }: EnvelopeProps) => {
  const [stage, setStage] = useState<"idle" | "opening" | "leaving">("idle");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleOpen = () => {
    if (stage !== "idle") return;
    setStage("opening");
    window.setTimeout(() => setStage("leaving"), 1600);
    window.setTimeout(() => {
      document.body.style.overflow = "";
      onOpen();
    }, 2400);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center paper transition-all duration-700 ease-out ${
        stage === "leaving" ? "opacity-0 -translate-y-4 pointer-events-none" : "opacity-100"
      }`}
      aria-hidden={stage === "leaving"}
    >
      {/* Soft warm glow behind envelope */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, hsl(36 40% 88% / 0.55) 0%, transparent 70%)",
        }}
      />

      <div
        className="relative w-[86vw] max-w-[440px] aspect-[3/2]"
        style={{ perspective: "1600px" }}
      >
        {/* Floating wrapper for idle motion */}
        <div
          className={`relative w-full h-full transition-transform duration-700 ease-out ${
            stage === "idle" ? "animate-float-soft" : ""
          }`}
        >
          {/* Card revealed inside envelope */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 w-[80%] aspect-[3/4.2] bg-[hsl(var(--ivory))] border border-[hsl(var(--champagne))] transition-all ease-[cubic-bezier(0.22,1,0.36,1)] ${
              stage === "idle"
                ? "bottom-3 opacity-0 scale-95 duration-300"
                : "bottom-[40%] opacity-100 scale-100 duration-[1300ms] delay-300"
            }`}
            style={{
              zIndex: 1,
              boxShadow:
                "0 30px 50px -25px hsl(22 15% 18% / 0.35), 0 4px 12px -6px hsl(22 15% 18% / 0.15)",
            }}
          >
            <div className="flex flex-col items-center justify-center h-full px-5 text-center gap-3">
              <p className="font-label text-[10px] tracking-luxury text-[hsl(var(--ink-soft))] uppercase">
                You are invited
              </p>
              <span className="block w-10 h-px bg-[hsl(var(--hairline))]" />
              <p className="font-display text-2xl text-foreground leading-tight">
                Muhammad
                <span className="block font-serif-italic text-base text-[hsl(var(--ink-soft))] my-1">
                  &amp;
                </span>
                Basmala
              </p>
              <span className="block w-10 h-px bg-[hsl(var(--hairline))]" />
              <p className="font-label text-[10px] tracking-luxury text-[hsl(var(--ink-soft))] uppercase">
                07 · VIII · MMXXVI
              </p>
            </div>
          </div>

          {/* Envelope back / body */}
          <div
            className="absolute inset-0 bg-[hsl(var(--ivory))] border border-[hsl(var(--hairline))]"
            style={{
              zIndex: 2,
              boxShadow:
                "0 40px 70px -30px hsl(22 15% 18% / 0.45), 0 8px 20px -10px hsl(22 15% 18% / 0.2)",
              backgroundImage:
                "radial-gradient(hsl(22 15% 25% / 0.04) 1px, transparent 1px), radial-gradient(hsl(22 15% 25% / 0.025) 1px, transparent 1px)",
              backgroundSize: "3px 3px, 7px 7px",
            }}
          />

          {/* Front pocket triangle (V-shape) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              zIndex: 4,
              background:
                "linear-gradient(180deg, transparent 0%, transparent 50%, hsl(36 24% 84% / 0.55) 50%, hsl(36 24% 78% / 0.7) 100%)",
              clipPath: "polygon(0 50%, 50% 100%, 100% 50%, 100% 100%, 0 100%)",
            }}
          />
          {/* Pocket hairline edges */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              zIndex: 5,
              background:
                "linear-gradient(135deg, transparent calc(50% - 0.5px), hsl(var(--hairline)) 50%, transparent calc(50% + 0.5px)), linear-gradient(45deg, transparent calc(50% - 0.5px), hsl(var(--hairline)) 50%, transparent calc(50% + 0.5px))",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "left bottom, right bottom",
              opacity: 0.55,
            }}
          />

          {/* Flap — opens upward with smooth 3D rotation */}
          <div
            className="absolute top-0 left-0 w-full h-1/2 origin-top transition-transform ease-[cubic-bezier(0.65,0,0.35,1)]"
            style={{
              zIndex: 3,
              transform: stage === "idle" ? "rotateX(0deg)" : "rotateX(-178deg)",
              transformStyle: "preserve-3d",
              transitionDuration: stage === "idle" ? "700ms" : "1200ms",
            }}
          >
            {/* Front face of flap */}
            <div
              className="absolute inset-0 bg-[hsl(var(--ivory))]"
              style={{
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                backfaceVisibility: "hidden",
                boxShadow: "inset 0 -12px 24px -12px hsl(22 15% 18% / 0.1)",
                borderTop: "1px solid hsl(var(--hairline))",
              }}
            />
            {/* Back face of flap (visible mid-rotation) */}
            <div
              className="absolute inset-0 bg-[hsl(var(--ivory))]"
              style={{
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                transform: "rotateX(180deg)",
                backfaceVisibility: "hidden",
                backgroundImage:
                  "radial-gradient(hsl(22 15% 25% / 0.03) 1px, transparent 1px)",
                backgroundSize: "3px 3px",
              }}
            />

            {/* Wax seal — at the tip */}
            <button
              type="button"
              onClick={handleOpen}
              aria-label="Open invitation"
              className={`absolute left-1/2 -translate-x-1/2 -bottom-8 sm:-bottom-9 w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ink))] focus:ring-offset-2 focus:ring-offset-[hsl(var(--ivory))] transition-all duration-500 ${
                stage === "idle"
                  ? "hover:scale-110 cursor-pointer"
                  : "scale-90 opacity-0 pointer-events-none"
              }`}
              style={{
                backfaceVisibility: "hidden",
                background:
                  "radial-gradient(circle at 32% 28%, hsl(36 60% 65%) 0%, hsl(28 50% 42%) 55%, hsl(15 55% 20%) 100%)",
                boxShadow:
                  "0 8px 18px -4px hsl(15 55% 15% / 0.6), inset 0 1px 2px hsl(36 75% 85% / 0.7), inset 0 -4px 8px hsl(15 55% 15% / 0.45)",
              }}
            >
              {/* Shine sweep */}
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full overflow-hidden"
              >
                <span className="absolute inset-0 rounded-full animate-seal-shine" />
              </span>
              {/* Scalloped inner ring */}
              <span
                aria-hidden="true"
                className="absolute inset-[5px] rounded-full border border-[hsl(36_60%_82%/0.45)]"
              />
              <span className="relative font-display text-[hsl(36_55%_94%)] text-lg sm:text-xl tracking-wider drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                M·B
              </span>
            </button>
          </div>
        </div>

        {/* Tap hint */}
        <p
          className={`absolute -bottom-16 left-0 right-0 text-center font-label text-[11px] tracking-luxury uppercase text-[hsl(var(--ink-soft))] transition-opacity duration-500 ${
            stage === "idle" ? "opacity-100 animate-pulse" : "opacity-0"
          }`}
        >
          Tap the seal to open
        </p>
      </div>
    </div>
  );
};
