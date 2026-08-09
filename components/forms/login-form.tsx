"use client";

import * as React from "react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { FormSuccess } from "@/components/shared/form-success";
import { signInWithMagicLink, type MagicLinkState } from "@/lib/actions/auth";
import { isUtkEmail } from "@/lib/auth/validation";

const initialState: MagicLinkState = { status: "idle" };
const INVALID_EMAIL_MESSAGE = "Enter a valid UTK email address (@utk.edu or @vols.utk.edu).";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, isPending] = useActionState(signInWithMagicLink, initialState);
  const [clientError, setClientError] = React.useState<string | undefined>(undefined);

  if (state.status === "sent") {
    return (
      <FormSuccess
        title="Check your email"
        description="We sent a one-time login link to your UTK email. It expires after one use."
      />
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const email = String(new FormData(event.currentTarget).get("email") ?? "");
    if (!isUtkEmail(email)) {
      event.preventDefault();
      setClientError(INVALID_EMAIL_MESSAGE);
    } else {
      setClientError(undefined);
    }
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="next" value={next} />
      <Field
        id="login-email"
        label="UTK email"
        error={clientError ?? (state.status === "error" ? state.message : undefined)}
      >
        <Input type="email" name="email" placeholder="you@utk.edu" required />
      </Field>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Sending link..." : "Send login link"}
      </Button>
    </form>
  );
}
