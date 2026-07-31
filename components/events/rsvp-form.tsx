"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { rsvpSchema, type RsvpFormValues } from "@/lib/schemas/rsvp";

export function RsvpForm({ onSuccess }: { onSuccess: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RsvpFormValues>({ resolver: zodResolver(rsvpSchema) });

  return (
    <form onSubmit={handleSubmit(() => onSuccess())} className="flex flex-col gap-4" noValidate>
      <Field id="rsvp-name" label="Full name" error={errors.name?.message}>
        <Input {...register("name")} />
      </Field>
      <Field id="rsvp-email" label="Email" error={errors.email?.message}>
        <Input type="email" {...register("email")} />
      </Field>
      <Button type="submit" disabled={isSubmitting}>
        Confirm RSVP
      </Button>
    </form>
  );
}
