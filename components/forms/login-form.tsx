"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { FormSuccess } from "@/components/shared/form-success";
import { signInWithMagicLink, type MagicLinkState } from "@/lib/actions/auth";

const initialState: MagicLinkState = { status: "idle" };

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, isPending] = useActionState(signInWithMagicLink, initialState);

  if (state.status === "sent") {
    return (
      <FormSuccess
        title="Check your email"
        description="We sent a one-time login link to your UTK email. It expires after one use."
      />
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="next" value={next} />
      <Field
        id="login-email"
        label="UTK email"
        error={state.status === "error" ? state.message : undefined}
      >
        <Input type="email" name="email" placeholder="you@utk.edu" required />
      </Field>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Sending link..." : "Send login link"}
      </Button>
    </form>
  );
}
