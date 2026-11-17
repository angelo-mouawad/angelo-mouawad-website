"use client";

import { ArrowRight, Check, LoaderCircle } from "lucide-react";
import { type FormEvent, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { PROFILE } from "@/data/profile";
import { cn } from "@/lib/utils";

/**
 * Web3Forms delivers the message to Angelo's inbox without a server.
 * The access key is public by design. Without one, the form opens the visitor's own
 * mail app with everything filled in, so it works either way.
 */
const ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
const ENDPOINT = "https://api.web3forms.com/submit";

type Status = "idle" | "sending" | "sent" | "failed";

const FIELD =
  "w-full rounded-xl border border-input bg-card/70 px-4 text-[0.9375rem] outline-none transition-[border-color,box-shadow] duration-300 placeholder:text-muted-foreground focus-visible:border-sky-bright focus-visible:ring-3 focus-visible:ring-ring/30";

export function ContactForm() {
  const id = useId();
  const [status, setStatus] = useState<Status>("idle");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    if (data.botcheck) return;

    if (!ACCESS_KEY) {
      const body = `${data.message}\n\n${data.name}\n${data.email}`;
      window.location.href = `mailto:${PROFILE.email}?subject=${encodeURIComponent(`Website project from ${data.name}`)}&body=${encodeURIComponent(body)}`;
      return;
    }

    setStatus("sending");
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          subject: `Website project from ${data.name}`,
          from_name: "angelomouawad.com",
          name: data.name,
          email: data.email,
          message: data.message,
        }),
      });
      const result = (await response.json()) as { success?: boolean };
      if (!response.ok || !result.success) throw new Error("rejected");
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("failed");
    }
  };

  if (status === "sent") {
    return (
      <div role="status" className="flex min-h-80 flex-col items-start justify-center gap-4">
        <span className="grid size-12 place-items-center rounded-full bg-accent text-positive">
          <Check aria-hidden="true" />
        </span>
        <p className="type-h3">Thanks, your message is on its way.</p>
        <p className="type-body">I read everything myself and I&apos;ll reply by email.</p>
        <Button variant="outline" size="sm" onClick={() => setStatus("idle")}>
          Send another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5" noValidate={false}>
      <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="grid gap-5 sm:grid-cols-2">
        <label htmlFor={`${id}-name`} className="flex flex-col gap-2 text-sm font-medium">
          Your name
          <input id={`${id}-name`} name="name" type="text" required autoComplete="name" className={cn(FIELD, "h-12")} />
        </label>
        <label htmlFor={`${id}-email`} className="flex flex-col gap-2 text-sm font-medium">
          Your email
          <input id={`${id}-email`} name="email" type="email" required autoComplete="email" className={cn(FIELD, "h-12")} />
        </label>
      </div>
      <label htmlFor={`${id}-message`} className="flex flex-col gap-2 text-sm font-medium">
        What do you have in mind?
        <textarea
          id={`${id}-message`}
          name="message"
          required
          rows={5}
          placeholder="A few lines about you, what the site is for, and when you'd like it."
          className={cn(FIELD, "resize-y py-3 leading-relaxed")}
        />
      </label>

      {status === "failed" && (
        <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          That didn&apos;t go through. Please try again, or email me at{" "}
          <a href={`mailto:${PROFILE.email}`} className="font-medium underline underline-offset-4">
            {PROFILE.email}
          </a>
          .
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <Button type="submit" variant="glow" size="lg" disabled={status === "sending"}>
          {status === "sending" ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : null}
          {status === "sending" ? "Sending" : ACCESS_KEY ? "Send message" : "Write the email"}
          {status !== "sending" && <ArrowRight aria-hidden="true" className="group-hover/button:translate-x-0.5" />}
        </Button>
        {!ACCESS_KEY && <span className="type-small">Opens your mail app with this message filled in.</span>}
      </div>
    </form>
  );
}
