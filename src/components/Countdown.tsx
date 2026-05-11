import { useEffect, useState } from "react";

const TARGET = new Date("2026-08-07T17:00:00+03:00").getTime();

const calc = () => {
  const diff = Math.max(0, TARGET - Date.now());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
};

const Unit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex min-w-[68px] flex-col items-center gap-2 rounded-md border border-[hsl(var(--gold-line)/0.52)] bg-[hsl(var(--night-soft)/0.72)] px-3 py-3 sm:min-w-[88px] sm:px-4 sm:py-4">
    <span className="font-display text-3xl leading-none tabular-nums text-[hsl(var(--candle-soft))] sm:text-5xl">
      {String(value).padStart(2, "0")}
    </span>
    <span className="font-label text-[8px] tracking-luxury uppercase text-[hsl(var(--mist)/0.75)] sm:text-[9px]">
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

  const Sep = () => (
    <span className="hairline h-10 w-px opacity-65 sm:h-14" aria-hidden="true" />
  );

  return (
    <div className="mx-auto flex max-w-xl items-center justify-center gap-3 sm:gap-6">
      <Unit value={t.days} label="Days" />
      <Sep />
      <Unit value={t.hours} label="Hours" />
      <Sep />
      <Unit value={t.minutes} label="Minutes" />
      <Sep />
      <Unit value={t.seconds} label="Seconds" />
    </div>
  );
};
