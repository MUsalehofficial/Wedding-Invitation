import { useEffect, useState } from "react";
import { Sprig } from "@/components/InvitationOrnaments";

interface EnvelopeProps {
  onOpen: () => void;
}

export const Envelope = ({ onOpen }: EnvelopeProps) => {
  const [stage, setStage] = useState<"idle" | "opening" | "leaving">("idle");

  useEffect(() => {
    // Lock scroll while envelope is on screen
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleOpen = () => {
    if (stage !== "idle") return;
    setStage("opening");
    // Let the flap animation play, then card slide, then fade out
    window.setTimeout(() => setStage("leaving"), 1800);
    window.setTimeout(() => {
      document.body.style.overflow = "";
      onOpen();
    }, 2800);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center paper transition-opacity duration-700 ${
        stage === "leaving" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-hidden={stage === "leaving"}
    >
      {/* Soft vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, transparent 55%, hsl(22 15% 18% / 0.10) 100%)",
        }}
      />

      <div className="relative w-[88vw] max-w-[420px] aspect-[3/2]" style={{ perspective: "1400px" }}>
        {/* Card that slides up from inside the envelope */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 w-[78%] aspect-[3/4.2] bg-[hsl(var(--ivory))] border border-[hsl(var(--champagne))] shadow-[0_20px_40px_-20px_hsl(22_15%_18%/0.35)] transition-all ease-out ${
            stage === "idle"
              ? "bottom-2 opacity-0 duration-500"
              : "bottom-[55%] opacity-100 duration-[1400ms] delay-500"
          }`}
          style={{ zIndex: 1 }}
        >
          <div className="flex flex-col items-center justify-center h-full px-4 text-center gap-2">
            <p className="font-label text-[8px] tracking-luxury text-[hsl(var(--ink-soft))] uppercase">
              You are invited
            </p>
            <Sprig size={28} />
            <p className="font-display text-2xl text-foreground leading-tight">
              Muhammad
              <span className="block font-serif-italic text-base text-[hsl(var(--ink-soft))]">&amp;</span>
              Basmala
            </p>
            <p className="font-label text-[8px] tracking-luxury text-[hsl(var(--ink-soft))] uppercase pt-1">
              07 · VIII · MMXXVI
            </p>
          </div>
        </div>

        {/* Envelope body (back) */}
        <div
          className="absolute inset-0 bg-[hsl(var(--ivory))] border border-[hsl(var(--hairline))] shadow-[0_30px_60px_-30px_hsl(22_15%_18%/0.4)]"
          style={{
            zIndex: 2,
            backgroundImage:
              "radial-gradient(hsl(22 15% 25% / 0.04) 1px, transparent 1px), radial-gradient(hsl(22 15% 25% / 0.025) 1px, transparent 1px)",
            backgroundSize: "3px 3px, 7px 7px",
          }}
        />

        {/* Envelope front pocket (V-shape silhouette via clipped triangle) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 4,
            background:
              "linear-gradient(180deg, transparent 0%, transparent 50%, hsl(36 22% 86% / 0.45) 50%, hsl(36 22% 82% / 0.55) 100%)",
            clipPath: "polygon(0 50%, 50% 100%, 100% 50%, 100% 100%, 0 100%)",
          }}
        />
        {/* Front pocket hairline edges */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 5,
            background:
              "linear-gradient(135deg, transparent calc(50% - 0.5px), hsl(var(--hairline)) 50%, transparent calc(50% + 0.5px)), linear-gradient(45deg, transparent calc(50% - 0.5px), hsl(var(--hairline)) 50%, transparent calc(50% + 0.5px))",
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "left bottom, right bottom",
            opacity: 0.5,
          }}
        />

        {/* Envelope flap (top triangle) — opens upward */}
        <div
          className={`absolute top-0 left-0 w-full h-1/2 origin-top transition-transform ease-[cubic-bezier(0.65,0,0.35,1)] ${
            stage === "idle" ? "duration-700" : "duration-[1400ms]"
          }`}
          style={{
            zIndex: 3,
            transform:
              stage === "idle"
                ? "rotateX(0deg)"
                : "rotateX(-180deg)",
            transformStyle: "preserve-3d",
          }}
        >
          <div
            className="absolute inset-0 bg-[hsl(var(--ivory))] border-t border-x border-[hsl(var(--hairline))]"
            style={{
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              backfaceVisibility: "hidden",
              boxShadow: "inset 0 -10px 20px -10px hsl(22 15% 18% / 0.08)",
            }}
          />
          {/* Back side of flap (visible while opening) */}
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

          {/* Wax seal — sits at the tip of the flap */}
          <button
            type="button"
            onClick={handleOpen}
            aria-label="Open invitation"
            className={`absolute left-1/2 -translate-x-1/2 -bottom-7 sm:-bottom-8 w-14 h-14 sm:w-16 sm:h-16 rounded-full focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ink))] focus:ring-offset-2 focus:ring-offset-[hsl(var(--ivory))] transition-transform ${
              stage === "idle" ? "hover:scale-105 cursor-pointer" : "pointer-events-none"
            }`}
            style={{
              backfaceVisibility: "hidden",
              background:
                "radial-gradient(circle at 35% 30%, hsl(36 55% 62%) 0%, hsl(28 45% 42%) 55%, hsl(18 50% 22%) 100%)",
              boxShadow:
                "0 6px 14px -4px hsl(18 50% 18% / 0.55), inset 0 1px 2px hsl(36 70% 80% / 0.6), inset 0 -3px 6px hsl(18 50% 18% / 0.4)",
            }}
          >
            {/* Shine sweep */}
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full overflow-hidden"
            >
              <span className="absolute inset-0 rounded-full animate-seal-shine" />
            </span>
            {/* Scalloped edge ring */}
            <span
              aria-hidden="true"
              className="absolute inset-1 rounded-full border border-[hsl(36_60%_80%/0.4)]"
            />
            <span className="relative font-display text-[hsl(36_55%_92%)] text-base sm:text-lg tracking-wide drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">
              M·B
            </span>
          </button>
        </div>

        {/* Tap hint */}
        <p
          className={`absolute -bottom-12 left-0 right-0 text-center font-label text-[10px] tracking-luxury uppercase text-[hsl(var(--ink-soft))] transition-opacity duration-500 ${
            stage === "idle" ? "opacity-100 animate-pulse" : "opacity-0"
          }`}
        >
          Tap the seal to open
        </p>
      </div>
    </div>
  );
};
