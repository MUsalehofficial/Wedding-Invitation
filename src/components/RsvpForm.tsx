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
    const parsed = schema.safeParse({
      name: fd.get("name"),
      attending: fd.get("attending"),
      guests: fd.get("guests") || 0,
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
      <div className="text-center py-12 space-y-4">
        <p className="font-script text-4xl text-foreground">with love</p>
        <p className="font-serif-italic text-[hsl(var(--ink-soft))]">
          your reply has been received
        </p>
        <button
          onClick={() => setDone(false)}
          className="font-label text-[10px] tracking-luxury text-[hsl(var(--ink-soft))] uppercase mt-6 hover:text-foreground transition-colors"
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
          className="block font-label text-[10px] tracking-luxury text-[hsl(var(--ink-soft))] uppercase mb-2"
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
        <legend className="font-label text-[10px] tracking-luxury text-[hsl(var(--ink-soft))] uppercase mb-2">
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
                  ? "border-foreground bg-foreground"
                  : "border-[hsl(var(--hairline))] bg-transparent group-hover:border-foreground"
              }`}
              aria-hidden="true"
            />
            <span>
              <span className="font-serif-italic text-2xl text-foreground">{main}</span>
              <span className="font-serif-italic text-base text-[hsl(var(--ink-soft))] ml-2">
                {sub}
              </span>
            </span>
          </label>
        ))}
      </fieldset>

      {/* Guests — only if accepting */}
      {attending === "yes" && (
        <div className="max-w-[200px]">
          <label
            htmlFor="guests"
            className="block font-label text-[10px] tracking-luxury text-[hsl(var(--ink-soft))] uppercase mb-2"
          >
            Number attending
          </label>
          <input
            id="guests"
            name="guests"
            type="number"
            min={1}
            max={20}
            defaultValue={1}
            className="input-line"
          />
        </div>
      )}

      {/* Message */}
      <div>
        <label
          htmlFor="message"
          className="block font-label text-[10px] tracking-luxury text-[hsl(var(--ink-soft))] uppercase mb-2"
        >
          A note for the couple <span className="lowercase italic font-serif-italic normal-case text-[hsl(var(--ink-soft))]">(optional)</span>
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
          className="font-label text-[11px] tracking-luxury uppercase border border-foreground px-10 py-4 hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
        >
          {submitting ? "Sending…" : "Send Reply"}
        </button>
        <p className="font-serif-italic text-xs text-[hsl(var(--ink-soft))]">
          kindly reply by the first of july, two thousand twenty-six
        </p>
      </div>
    </form>
  );
};
