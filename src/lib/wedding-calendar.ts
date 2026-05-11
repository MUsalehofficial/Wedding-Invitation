/** Shared event details for calendar links (times in UTC; 5pm Kuwait AST ≈ UTC+3 → 14:00Z). */
export const WEDDING_CALENDAR = {
  title: "Muhammad & Basmala — Wedding ceremony",
  /** Public .ics under Vite `public/` (works on iOS/Android when opened/saved). */
  icsFileName: "muhammad-basmala-wedding.ics",
  googleCalendarHref: (): string => {
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: WEDDING_CALENDAR.title,
      dates: "20260807T140000Z/20260807T190000Z",
      details:
        "Ceremony begins at 5:00 pm. Dinner & celebration to follow. Map: https://maps.app.goo.gl/tibpxijmCpNNDVAS9?g_st=ic",
      location: "Maken Palace",
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  },
  /** Relative URL so it works on GitHub Pages subpaths and local dev. */
  icsDownloadHref: (): string => {
    const base = import.meta.env.BASE_URL || "/";
    const prefix = base.endsWith("/") ? base : `${base}/`;
    return `${prefix}${WEDDING_CALENDAR.icsFileName}`;
  },
} as const;
