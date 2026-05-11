import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { submitRsvpViaSupabase } from "@/lib/rsvp-submit";

/** Production toasts avoid leaking internals; DEV shows the thrown message. */
function toastMessageForRsvpError(message: string): string {
  if (import.meta.env.DEV) return message;
  if (message.includes("__RSVP_NO_BACKEND__")) {
    return "RSVP backend isn’t configured: add Repository secrets VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY on GitHub, deploy the submit-rsvp Edge function, and redeploy Pages.";
  }
  if (message.includes("Invalid RSVP payload") || message.includes("Missing JSON")) {
    return "The RSVP service rejected the data. Try again, or contact the hosts.";
  }
  if (message === "__RSVP_HTML__") {
    return "The RSVP service returned an unexpected response. Try again later.";
  }
  if (/^Failed to fetch|NetworkError|Load failed|fetch.*failed|terminated|aborted|cors/i.test(message)) {
    return "Network error — try again or use another browser.";
  }
  if (message.startsWith("Request failed (")) {
    return "Couldn’t save your reply — the RSVP service returned an error. Try again.";
  }
  if (message.startsWith("__API__:")) {
    const rest = message.slice(8).trim().slice(0, 180);
    return rest.length > 0 ? rest : "We couldn't save your reply. Please try again.";
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

    const attendingValue = fd.get("attending");
    const parsed = schema.safeParse({
      name: fd.get("name"),
      attending: attendingValue,
      guests: attendingValue === "yes" ? 1 : attendingValue === "no" ? 0 : 0,
      message: fd.get("message") || "",
    });

    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message ?? "Please complete the form";
      toast.error(first);
      return;
    }

    setSubmitting(true);
    try {
      const msgRaw = parsed.data.message;
      await submitRsvpViaSupabase({
        name: parsed.data.name,
        attending: parsed.data.attending,
        guests: parsed.data.guests,
        ...(msgRaw && msgRaw.trim() ? { message: msgRaw.trim() } : {}),
      });

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
            className="flex gap-4 items-center cursor-pointer group"
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
              <span
                className={`ml-2 font-serif-italic text-lg sm:text-xl ${
                  v === "yes"
                    ? "text-[hsl(var(--candle-soft)/0.95)]"
                    : "text-[hsl(var(--mist)/0.9)]"
                }`}
              >
                {sub}
              </span>
            </span>
          </label>
        ))}
      </fieldset>

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

      <div className="pt-4 flex flex-col gap-4 items-center">
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
