import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().trim().min(1, "Please share your name").max(200),
  attending: z.enum(["yes", "no"], { required_error: "Please select a reply" }),
  guests: z.coerce.number().int().min(0).max(20),
  message: z.string().max(1000).optional(),
});

export const RsvpForm = () => {
  const [attending, setAttending] = useState<"yes" | "no" | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
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
      const { data, error } = await supabase.functions.invoke("submit-rsvp", {
        body: parsed.data,
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error ?? "Something went wrong");
      setDone(true);
      form.reset();
      setAttending("");
      toast.success("Thank you — your reply has been received.");
    } catch (err) {
      console.error(err);
      toast.error("We couldn't save your reply. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="space-y-4 py-12 text-center">
        <p className="font-script text-4xl text-[hsl(var(--candle-soft))]">with love</p>
        <p className="font-serif-italic text-[hsl(var(--mist)/0.8)]">
          your reply has been received
        </p>
        <button
          onClick={() => setDone(false)}
          className="mt-6 font-label text-[10px] tracking-luxury uppercase text-[hsl(var(--mist)/0.8)] transition-colors hover:text-[hsl(var(--candle-soft))]"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-10">
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
