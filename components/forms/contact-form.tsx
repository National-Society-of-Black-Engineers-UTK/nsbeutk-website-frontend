"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { FormSuccess } from "@/components/shared/form-success";
import { contactSchema, type ContactFormValues } from "@/lib/schemas/contact";

export function ContactForm() {
  const [submitted, setSubmitted] = React.useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({ resolver: zodResolver(contactSchema) });

  if (submitted) {
    return (
      <FormSuccess title="Message sent" description="Thanks for reaching out — we'll get back to you soon.">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            reset();
            setSubmitted(false);
          }}
        >
          Send another message
        </Button>
      </FormSuccess>
    );
  }

  return (
    <form onSubmit={handleSubmit(() => setSubmitted(true))} className="flex flex-col gap-4" noValidate>
      <Field id="contact-name" label="Name" error={errors.name?.message}>
        <Input {...register("name")} />
      </Field>
      <Field id="contact-email" label="Email" error={errors.email?.message}>
        <Input type="email" {...register("email")} />
      </Field>
      <Field id="contact-subject" label="Subject" error={errors.subject?.message}>
        <Input {...register("subject")} />
      </Field>
      <Field id="contact-message" label="Message" error={errors.message?.message}>
        <Textarea rows={5} {...register("message")} />
      </Field>
      <Button type="submit" disabled={isSubmitting}>
        Send message
      </Button>
    </form>
  );
}
