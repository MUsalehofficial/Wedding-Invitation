import { useEffect, useState } from "react";
import waxSeal from "@/assets/wax.png";
import monogram from "@/assets/MB.png";

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{
        background: mode === "light"
          ? "linear-gradient(180deg, hsl(0 0% 99%) 0%, hsl(36 20% 95%) 100%)"
          : "radial-gradient(ellipse 60% 40% at 50% 15%, hsl(var(--candle) / 0.14) 0%, transparent 70%), linear-gradient(180deg, hsl(var(--night-soft)) 0%, hsl(var(--night)) 100%)",
        opacity: opening ? 0 : 1,
        transition: `opacity 900ms ${ease}`,
      }}
      aria-hidden={stage === "done"}
    >
      <div
        className="relative mx-6 w-full max-w-3xl text-center"
        style={{
          transform: opening ? "translate3d(0, -12px, 0) scale(0.985)" : "translate3d(0, 0, 0) scale(1)",
          opacity: opening ? 0 : 1,
          transition: `transform 900ms ${ease}, opacity 900ms ${ease}`,
        }}
      >
        <div
          aria-hidden="true"
          className="relative mx-auto mb-8 h-[270px] w-[270px]"
        >
          <img
            src={waxSeal}
            alt="Wax monogram seal"
            className="h-full w-full object-contain drop-shadow-[0_18px_24px_rgba(0,0,0,0.55)]"
            draggable={false}
          />
          <img
            src={monogram}
            alt="MB monogram"
            className="pointer-events-none absolute left-[53%] top-1/2 w-[44%] -translate-x-1/2 -translate-y-1/2 object-contain"
            draggable={false}
          />
        </div>

        <p className="font-label text-[10px] tracking-editorial uppercase text-[hsl(var(--mist)/0.82)]">
          Wedding Invitation
        </p>

        <h1 className="mt-4 font-display text-[3.2rem] leading-[1.05] text-[hsl(var(--foreground))] sm:text-7xl">
          <span className="block">Muhammad</span>
          <span className="my-1 block font-serif-italic text-3xl text-[hsl(var(--candle-soft)/0.85)] sm:text-4xl">
            &
          </span>
          <span className="block">Basmala</span>
        </h1>

        <p className="mt-6 font-serif-italic text-xl text-[hsl(var(--mist)/0.8)]">
          A cinematic evening begins.
        </p>

        <div className="mx-auto mt-10 h-px w-40 bg-[hsl(var(--gold-line)/0.7)]" />

        <button
          type="button"
          onClick={start}
          className="mt-10 border border-[hsl(var(--candle)/0.85)] px-8 py-3 font-label text-xs tracking-luxury uppercase text-[hsl(var(--candle-soft))] transition-colors hover:bg-[hsl(var(--candle)/0.14)]"
        >
          Open Invitation
        </button>
      </div>
    </div>
  );
};