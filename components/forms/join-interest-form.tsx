"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { FormSuccess } from "@/components/shared/form-success";
import { joinInterestSchema, type JoinInterestFormValues } from "@/lib/schemas/join-interest";

export function JoinInterestForm() {
  const [submitted, setSubmitted] = React.useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<JoinInterestFormValues>({ resolver: zodResolver(joinInterestSchema) });

  if (submitted) {
    return (
      <FormSuccess title="Thanks for your interest!" description="An officer will follow up with next steps for joining NSBE UTK.">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            reset();
            setSubmitted(false);
          }}
        >
          Submit another response
        </Button>
      </FormSuccess>
    );
  }

  return (
    <form onSubmit={handleSubmit(() => setSubmitted(true))} className="flex flex-col gap-4" noValidate>
      <Field id="join-name" label="Full name" error={errors.name?.message}>
        <Input {...register("name")} />
      </Field>
      <Field id="join-email" label="Email" error={errors.email?.message}>
        <Input type="email" {...register("email")} />
      </Field>
      <Field id="join-major" label="Major" error={errors.major?.message}>
        <Input {...register("major")} />
      </Field>
      <Field id="join-grad-year" label="Expected graduation year" error={errors.gradYear?.message}>
        <Input inputMode="numeric" placeholder="2028" {...register("gradYear")} />
      </Field>
      <Field id="join-message" label="Anything you'd like us to know? (optional)" error={errors.message?.message}>
        <Textarea rows={4} {...register("message")} />
      </Field>
      <Button type="submit" disabled={isSubmitting}>
        Submit interest form
      </Button>
    </form>
  );
}
