import sprig from "@/assets/sprig.png";

export const Sprig = ({ className = "", size = 64 }: { className?: string; size?: number }) => (
  <img
    src={sprig}
    alt=""
    aria-hidden="true"
    width={size}
    height={size * 1.5}
    loading="lazy"
    className={`opacity-90 drop-shadow-[0_8px_14px_hsl(220_38%_4%_/_0.45)] ${className}`}
    style={{ width: size, height: "auto" }}
  />
);

export const Divider = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center justify-center gap-3 ${className}`}>
    <span className="hairline h-px w-20 opacity-85 sm:w-32" />
    <span
      aria-hidden="true"
      className="block h-1.5 w-1.5 rotate-45 bg-[hsl(var(--candle-soft)/0.85)]"
    />
    <span className="hairline h-px w-20 opacity-85 sm:w-32" />
  </div>
);

export const Monogram = ({ className = "" }: { className?: string }) => (
  <div
    className={`inline-flex h-16 w-16 items-center justify-center rounded-full border border-[hsl(var(--gold-line)/0.75)] bg-[hsl(var(--night-soft)/0.88)] shadow-[0_10px_20px_-12px_hsl(220_38%_4%_/_0.7)] ${className}`}
  >
    <span className="font-display text-xl text-[hsl(var(--candle-soft))]">M</span>
    <span className="mx-0.5 font-serif-italic text-sm text-[hsl(var(--mist)/0.8)]">·</span>
    <span className="font-display text-xl text-[hsl(var(--candle-soft))]">B</span>
  </div>
);
