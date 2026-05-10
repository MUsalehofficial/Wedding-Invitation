/** Pick calendar UX: ICS opens natively on Apple Calendar; Google link is reliable on typical Android setups. */
export type CalendarDeepLinkKind = "ics" | "google";

export function calendarLinkKindForDevice(): CalendarDeepLinkKind {
  if (typeof navigator === "undefined") return "ics";
  const ua = navigator.userAgent ?? "";
  if (/android/i.test(ua)) return "google";
  if (/iphone|ipad|ipod/i.test(ua)) return "ics";
  if (
    navigator.platform === "MacIntel" &&
    typeof navigator.maxTouchPoints === "number" &&
    navigator.maxTouchPoints > 1
  ) {
    return "ics";
  }
  return "ics";
}
