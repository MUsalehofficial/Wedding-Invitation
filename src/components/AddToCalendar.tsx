import { useMemo } from "react";
import { CalendarPlus } from "lucide-react";
import { calendarLinkKindForDevice } from "@/lib/calendar-device";
import { WEDDING_CALENDAR } from "@/lib/wedding-calendar";

export const AddToCalendar = () => {
  const kind = useMemo(() => calendarLinkKindForDevice(), []);
  const icsHref = WEDDING_CALENDAR.icsDownloadHref();
  const googleHref = WEDDING_CALENDAR.googleCalendarHref();

  if (kind === "google") {
    return (
      <div className="flex w-full max-w-sm flex-col items-stretch sm:max-w-md">
        <a
          href={googleHref}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-luxury inline-flex items-center justify-center gap-2 rounded-[10px] border border-[hsl(var(--gold-line)/0.45)] bg-[var(--lux-gold-dark)] px-8 py-3.5 font-label text-[11px] font-light uppercase tracking-[0.28em] text-white shadow-[0_10px_32px_-8px_rgb(122_85_40/0.42)] transition-[transform,box-shadow,filter] duration-300 hover:brightness-110 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lux-beige)]/45"
        >
          <CalendarPlus size={18} strokeWidth={1.5} aria-hidden />
          Add to calendar
        </a>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-sm flex-col items-stretch sm:max-w-md">
      <a
        href={icsHref}
        download={WEDDING_CALENDAR.icsFileName}
        className="btn-luxury inline-flex items-center justify-center gap-2 rounded-[10px] border border-[hsl(var(--gold-line)/0.55)] bg-[hsl(var(--card)/0.55)] px-8 py-3.5 font-label text-[11px] font-light uppercase tracking-[0.28em] text-[hsl(var(--foreground))] shadow-[0_10px_28px_-10px_rgba(0,0,0,0.28)] transition-[transform,box-shadow,background-color] duration-300 hover:bg-[hsl(var(--card)/0.75)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lux-gold)]/40"
      >
        <CalendarPlus size={18} strokeWidth={1.5} className="text-[var(--lux-gold)]" aria-hidden />
        Add to calendar
      </a>
    </div>
  );
};
