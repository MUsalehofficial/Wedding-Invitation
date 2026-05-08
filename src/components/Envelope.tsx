import { useEffect, useState } from "react";
import waxSeal from "@/assets/wax.png";
import monogram from "@/assets/MB.png";
import ringsLove from "@/assets/ringslove.png";
import { cn } from "@/lib/utils";

interface EnvelopeProps {
  onOpen: () => void;
  mode?: "dark" | "light";
}

type Stage = "intro" | "opening" | "done";

const ease = "cubic-bezier(0.22, 1, 0.36, 1)";

export const Envelope = ({ onOpen, mode = "dark" }: EnvelopeProps) => {
  const [stage, setStage] = useState<Stage>("intro");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (stage !== "opening") return;
    const timers: number[] = [];
    timers.push(
      window.setTimeout(() => {
        setStage("done");
        document.body.style.overflow = "";
        onOpen();
      }, 900)
    );
    return () => timers.forEach(window.clearTimeout);
  }, [stage, onOpen]);

  const opening = stage === "opening";

  const start = () => {
    if (stage !== "intro") return;
    setStage("opening");
  };

  const surface = mode === "light";

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex h-[100dvh] max-h-[100dvh] flex-col items-center justify-center overflow-hidden overscroll-none",
        surface ? "invite-linen-light" : "invite-linen-dark"
      )}
      style={{
        opacity: opening ? 0 : 1,
        transition: `opacity 900ms ${ease}`,
      }}
      aria-hidden={stage === "done"}
    >
      <div
        className={cn(
          "relative mx-auto flex w-full max-w-2xl flex-col items-center gap-2 px-5 py-2 text-center sm:gap-3 sm:px-6",
          "[&>*]:text-balance"
        )}
        style={{
          transform: opening ? "translate3d(0, -12px, 0) scale(0.985)" : "translate3d(0, 0, 0) scale(1)",
          opacity: opening ? 0 : 1,
          transition: `transform 900ms ${ease}, opacity 900ms ${ease}`,
        }}
      >
        {/* Seal — capped by viewport height so stack + CTA fit without scrolling */}
        <div
          aria-hidden="true"
          className={cn(
            "animate-editorial-rise relative mx-auto shrink-0",
            "h-[min(340px,min(78vw,44svh))] w-[min(340px,min(78vw,44svh))] sm:h-[min(362px,min(76vw,48svh))] sm:w-[min(362px,min(76vw,48svh))]"
          )}
          style={{ animationDelay: "40ms" }}
        >
          <div className="seal-shine-layer" aria-hidden />
          <img
            src={waxSeal}
            alt=""
            className="relative z-[1] h-full w-full object-contain drop-shadow-[0_22px_36px_rgba(0,0,0,0.42)]"
            draggable={false}
          />
          <img
            src={monogram}
            alt=""
            className={cn(
              "pointer-events-none absolute left-[53%] top-1/2 z-[2] w-[44%]",
              "-translate-x-1/2 -translate-y-1/2 object-contain"
            )}
            draggable={false}
            style={{
              filter: surface ? "brightness(1.06) saturate(1.06)" : "brightness(1.08) saturate(1.08) contrast(1.02)",
            }}
          />
        </div>

        <p
          className={cn(
            "animate-editorial-rise font-label text-[10px] tracking-[0.32em]",
            surface ? "text-[var(--lux-gold-dark)]" : "text-[var(--lux-gold)]"
          )}
          style={{ animationDelay: "140ms" }}
        >
          Wedding Invitation
        </p>

        <div
          className="animate-editorial-rise relative mx-auto w-full max-w-lg px-2 sm:px-4"
          style={{ animationDelay: "220ms" }}
        >
          <img
            src={ringsLove}
            alt=""
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[46%] w-[92%] max-w-[22rem] -translate-x-1/2 -translate-y-1/2 select-none object-contain opacity-[0.04]"
            draggable={false}
          />
          <h1
            className={cn(
              "relative z-[1] font-display leading-[1.06]",
              surface ? "text-[var(--lux-gold-dark)]" : "text-[var(--lux-beige)]"
            )}
          >
            <span className="block font-normal tracking-[0.02em] text-[clamp(2rem,9vmin,4.05rem)]">Muhammad</span>
            <span className="my-0.5 block font-serif-italic font-normal text-[clamp(1.5rem,6.5vmin,2.85rem)] text-[var(--lux-gold)] sm:my-1">
              &
            </span>
            <span className="block font-normal tracking-[0.02em] text-[clamp(2rem,9vmin,4.05rem)]">Basmala</span>
          </h1>
        </div>

        <p
          className={cn(
            "animate-editorial-rise max-w-md px-3 font-serif-italic text-base leading-snug opacity-90 sm:text-lg sm:leading-relaxed",
            surface ? "text-[var(--lux-gold-dark)]" : "text-[var(--lux-beige)]"
          )}
          style={{ animationDelay: "360ms" }}
        >
          Together is a beautiful place to be.
        </p>

        <div
          className="animate-editorial-rise mx-auto mt-2 h-px w-36 bg-[var(--lux-gold)]/45 sm:w-40"
          style={{ animationDelay: "440ms" }}
        />

        <button
          type="button"
          onClick={start}
          style={{ animationDelay: "560ms" }}
          className={cn(
            "btn-luxury animate-editorial-rise mt-6 inline-flex shrink-0 min-w-[min(100%,18.5rem)] items-center justify-center px-14 sm:mt-9",
            "rounded-[10px] border-0 py-[0.55rem] sm:rounded-[11px] sm:py-[0.62rem]",
            "bg-[var(--lux-gold-dark)] font-label text-[11px] font-light uppercase tracking-[0.34em] text-white",
            "shadow-[0_10px_32px_-8px_rgb(122_85_40/0.42),0_4px_12px_-4px_rgba(0,0,0,0.12)]",
            "transition-[transform,box-shadow,filter] duration-300 ease-out",
            "hover:brightness-110 hover:shadow-[0_12px_36px_-8px_rgb(122_85_40/0.48),0_4px_14px_-4px_rgba(0,0,0,0.14)]",
            "active:scale-[0.99]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lux-beige)]/45 focus-visible:ring-offset-2",
            surface ? "focus-visible:ring-offset-[#faf7f1]" : "focus-visible:ring-offset-[#1a1814]"
          )}
        >
          Open invitation
        </button>
      </div>
    </div>
  );
};
