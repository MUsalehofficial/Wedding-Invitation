import sprig from "@/assets/sprig.png";

export const Sprig = ({ className = "", size = 64 }: { className?: string; size?: number }) => (
  <img
    src={sprig}
    alt=""
    aria-hidden="true"
    width={size}
    height={size * 1.5}
    loading="lazy"
    className={`opacity-80 ${className}`}
    style={{ width: size, height: "auto" }}
  />
);

export const Divider = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center justify-center gap-3 ${className}`}>
    <span className="hairline h-px w-20 sm:w-32" />
    <span
      aria-hidden="true"
      className="block w-1.5 h-1.5 rotate-45 bg-[hsl(var(--ink-soft))]"
    />
    <span className="hairline h-px w-20 sm:w-32" />
  </div>
);

export const Monogram = ({ className = "" }: { className?: string }) => (
  <div
    className={`inline-flex items-center justify-center w-14 h-14 rounded-full border border-[hsl(var(--hairline))] ${className}`}
  >
    <span className="font-display text-lg text-foreground">M</span>
    <span className="font-serif-italic text-sm text-[hsl(var(--ink-soft))] mx-0.5">·</span>
    <span className="font-display text-lg text-foreground">B</span>
  </div>
);
