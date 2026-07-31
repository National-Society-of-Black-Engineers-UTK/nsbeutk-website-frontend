"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { FormSuccess } from "@/components/shared/form-success";
import { SPONSOR_INTEREST_TYPES, sponsorInquirySchema, type SponsorInquiryFormValues } from "@/lib/schemas/sponsor-inquiry";

export function SponsorInquiryForm() {
  const [submitted, setSubmitted] = React.useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SponsorInquiryFormValues>({ resolver: zodResolver(sponsorInquirySchema) });

  if (submitted) {
    return (
      <FormSuccess title="Thanks for reaching out!" description="Our Corporate Relations Chair will follow up within a few business days.">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            reset();
            setSubmitted(false);
          }}
        >
          Submit another inquiry
        </Button>
      </FormSuccess>
    );
  }

  return (
    <form onSubmit={handleSubmit(() => setSubmitted(true))} className="flex flex-col gap-4" noValidate>
      <Field id="sponsor-name" label="Your name" error={errors.name?.message}>
        <Input {...register("name")} />
      </Field>
      <Field id="sponsor-company" label="Company" error={errors.company?.message}>
        <Input {...register("company")} />
      </Field>
      <Field id="sponsor-email" label="Email" error={errors.email?.message}>
        <Input type="email" {...register("email")} />
      </Field>
      <Field id="sponsor-interest" label="Interest type" error={errors.interestType?.message}>
        <select
          className="min-h-11 w-full rounded-md border border-border-subtle bg-fill-subtle px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          {...register("interestType")}
        >
          {SPONSOR_INTEREST_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </Field>
      <Field id="sponsor-message" label="Message" error={errors.message?.message}>
        <Textarea rows={4} {...register("message")} />
      </Field>
      <Button type="submit" disabled={isSubmitting}>
        Send inquiry
      </Button>
    </form>
  );
}
