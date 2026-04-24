import { useEffect, useState } from "react";

const TARGET = new Date("2026-08-07T18:00:00+03:00").getTime();

const calc = () => {
  const diff = Math.max(0, TARGET - Date.now());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
};

const Unit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center gap-2">
    <span className="font-display text-3xl sm:text-5xl text-foreground leading-none tabular-nums">
      {String(value).padStart(2, "0")}
    </span>
    <span className="font-label text-[8px] sm:text-[9px] tracking-luxury uppercase text-[hsl(var(--ink-soft))]">
      {label}
    </span>
  </div>
);

export const Countdown = () => {
  const [t, setT] = useState(calc);

  useEffect(() => {
    const id = window.setInterval(() => setT(calc()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="grid grid-cols-4 items-center gap-2 sm:gap-4 max-w-md mx-auto">
      <Unit value={t.days} label="Days" />
      <div className="flex justify-center">
        <span className="hairline h-10 sm:h-14 w-px" aria-hidden="true" />
      </div>
      <Unit value={t.hours} label="Hours" />
      <div className="flex justify-center">
        <span className="hairline h-10 sm:h-14 w-px" aria-hidden="true" />
      </div>
      <Unit value={t.minutes} label="Minutes" />
      <div className="flex justify-center">
        <span className="hairline h-10 sm:h-14 w-px" aria-hidden="true" />
      </div>
      <Unit value={t.seconds} label="Seconds" />
    </div>
  );
};
