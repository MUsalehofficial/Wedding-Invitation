import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";

/** Production toasts avoid leaking internals; DEV shows the thrown message. */
function toastMessageForRsvpError(message: string): string {
  if (import.meta.env.DEV) return message;
  if (message.includes("VITE_RSVP_SCRIPT_URL")) {
    return "RSVP isn’t configured on this site (missing Apps Script URL in the build).";
  }
  if (message.includes("Unauthorized")) {
    return "RSVP verification failed — webhook secret mismatch. Match GitHub VITE_RSVP_WEBHOOK_SECRET with Apps Script RSVP_WEBHOOK_SECRET, or clear both.";
  }
  if (message === "__RSVP_HTML__") {
    return "RSVP blocked by Google — redeploy the Web app as “Anyone” / anonymous access, not “Google accounts only”.";
  }
  if (/^Failed to fetch|NetworkError|Load failed/i.test(message)) {
    return "Network error — try again or use another browser.";
  }
  if (message.startsWith("Request failed (")) {
    return "Couldn’t save your reply — the RSVP service returned an error. Try again.";
  }
  return "We couldn't save your reply. Please try again.";
}

const schema = z.object({
  name: z.string().trim().min(1, "Please share your name").max(200),
  attending: z.enum(["yes", "no"], { required_error: "Please select a reply" }),
  guests: z.coerce.number().int().min(0).max(20),
  message: z.string().max(1000).optional(),
});

type RsvpFormProps = {
  onSuccess?: () => void;
};

export const RsvpForm = ({ onSuccess }: RsvpFormProps) => {
  const scriptUrl = import.meta.env.VITE_RSVP_SCRIPT_URL as string | undefined;
  const webhookSecret = (
    import.meta.env.VITE_RSVP_WEBHOOK_SECRET as string | undefined
  )?.trim();
  const [attending, setAttending] = useState<"yes" | "no" | "">("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (String(fd.get("website") ?? "").trim() !== "") {
      toast.success("Thank you — your reply has been received.");
      form.reset();
      setAttending("");
      return;
    }

    const attending = fd.get("attending");
    const parsed = schema.safeParse({
      name: fd.get("name"),
      attending,
      guests: attending === "yes" ? 1 : attending === "no" ? 0 : 0,
      message: fd.get("message") || "",
    });

    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message ?? "Please complete the form";
      toast.error(first);
      return;
    }

    setSubmitting(true);
    try {
      if (!scriptUrl?.trim()) {
        throw new Error("VITE_RSVP_SCRIPT_URL is missing");
      }

      let postUrl = scriptUrl.trim();
      if (import.meta.env.DEV) {
        try {
          if (new URL(postUrl).hostname === "script.google.com") {
            // Dev server proxies this path → Apps Script (browser CORS blocks direct localhost → Google).
            postUrl = `${import.meta.env.BASE_URL}__rsvp_proxy`;
          }
        } catch {
          /* bad URL — use as-is */
        }
      }

      // Plain JSON as text/plain is a "simple" request (no CORS preflight) and matches
      // postData.contents in Apps Script without "payload=..." wrapper bugs.
      const payloadBody = {
        ...parsed.data,
        website: "",
        ...(webhookSecret ? { secret: webhookSecret } : {}),
      };
      const response = await fetch(postUrl, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: JSON.stringify(payloadBody),
      });

      const raw = await response.text();
      let result: { success?: boolean; error?: string } | null = null;
      try {
        result = JSON.parse(raw) as { success?: boolean; error?: string };
      } catch {
        /* non-JSON (e.g. HTML error page) */
      }
      if (!response.ok || !result?.success) {
        console.error("RSVP save failed:", response.status, raw.slice(0, 400));
        const trimmed = raw.trim();
        if (!result && (trimmed.startsWith("<") || trimmed.includes("<!DOCTYPE"))) {
          throw new Error("__RSVP_HTML__");
        }
        throw new Error(result?.error ?? `Request failed (${response.status})`);
      }

      form.reset();
      setAttending("");
      onSuccess?.();
    } catch (err) {
      console.error(err);
      const msg =
        err instanceof Error
          ? toastMessageForRsvpError(err.message)
          : "We couldn't save your reply. Please try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-10">
      {/* Honeypot — leave empty (bots only) */}
      <div
        className="absolute left-[-10000px] top-auto h-0 w-0 overflow-hidden"
        aria-hidden="true"
      >
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="mb-2 block font-label text-[10px] tracking-luxury uppercase text-[hsl(var(--mist)/0.82)]"
        >
          Name(s)
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={200}
          autoComplete="name"
          className="input-line"
        />
      </div>

      {/* Attending choices */}
      <fieldset className="space-y-5">
        <legend className="mb-2 font-label text-[10px] tracking-luxury uppercase text-[hsl(var(--mist)/0.82)]">
          Will you join us
        </legend>

        {[
          { v: "yes", main: "Joyfully", sub: "accepts with delight" },
          { v: "no", main: "Regretfully", sub: "declines with sorrow" },
        ].map(({ v, main, sub }) => (
          <label
            key={v}
            className="flex items-center gap-4 cursor-pointer group"
          >
            <input
              type="radio"
              name="attending"
              value={v}
              checked={attending === v}
              onChange={() => setAttending(v as "yes" | "no")}
              className="sr-only"
            />
            <span
              className={`flex-shrink-0 inline-block w-4 h-4 rounded-full border transition-colors ${
                attending === v
                  ? "border-[hsl(var(--candle-soft))] bg-[hsl(var(--candle-soft))]"
                  : "border-[hsl(var(--gold-line))] bg-transparent group-hover:border-[hsl(var(--candle-soft))]"
              }`}
              aria-hidden="true"
            />
            <span>
              <span className="font-serif-italic text-2xl text-[hsl(var(--candle-soft))]">{main}</span>
              <span className="ml-2 font-serif-italic text-base text-[hsl(var(--mist)/0.8)]">
                {sub}
              </span>
            </span>
          </label>
        ))}
      </fieldset>

      {/* Guests field removed — single attendee per submission */}

      {/* Message */}
      <div>
        <label
          htmlFor="message"
          className="mb-2 block font-label text-[10px] tracking-luxury uppercase text-[hsl(var(--mist)/0.82)]"
        >
          A note for the couple{" "}
          <span className="lowercase font-serif-italic normal-case italic text-[hsl(var(--mist)/0.72)]">
            (optional)
          </span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          maxLength={1000}
          className="input-line resize-none"
        />
      </div>

      <div className="pt-4 flex flex-col items-center gap-4">
        <button
          type="submit"
          disabled={submitting}
          className="border border-[hsl(var(--candle)/0.88)] px-10 py-4 font-label text-[11px] tracking-luxury uppercase text-[hsl(var(--candle-soft))] transition-colors hover:bg-[hsl(var(--candle)/0.14)] disabled:opacity-50"
        >
          {submitting ? "Sending…" : "Send Reply"}
        </button>
        <p className="font-serif-italic text-xs text-[hsl(var(--mist)/0.72)]">
          kindly reply by the first of july, two thousand twenty-six
        </p>
      </div>
    </form>
  );
};
