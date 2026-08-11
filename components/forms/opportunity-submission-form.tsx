"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { FormSuccess } from "@/components/shared/form-success";
import { OPPORTUNITY_CATEGORIES } from "@/lib/data/opportunities";
import { opportunitySubmissionSchema, type OpportunitySubmissionFormValues } from "@/lib/schemas/opportunity-submission";
import { submitOpportunity } from "@/lib/actions/opportunities";

export function OpportunitySubmissionForm() {
  const [submitted, setSubmitted] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | undefined>(undefined);
  const honeypotRef = React.useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OpportunitySubmissionFormValues>({ resolver: zodResolver(opportunitySubmissionSchema) });

  if (submitted) {
    return (
      <FormSuccess
        title="Submission received"
        description="An officer will review your submission before it's published to the Opportunities hub."
      >
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            reset();
            setSubmitted(false);
          }}
        >
          Submit another opportunity
        </Button>
      </FormSuccess>
    );
  }

  async function onSubmit(values: OpportunitySubmissionFormValues) {
    setSubmitError(undefined);
    const result = await submitOpportunity(values, honeypotRef.current?.value ?? "");

    if (result.status === "error") {
      setSubmitError(result.message);
      return;
    }

    setSubmitted(true);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="opp-website">Leave this field blank</label>
        <input ref={honeypotRef} id="opp-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <Field id="opp-title" label="Title" error={errors.title?.message}>
        <Input {...register("title")} />
      </Field>
      <Field id="opp-company" label="Company / organization" error={errors.company?.message}>
        <Input {...register("company")} />
      </Field>
      <Field id="opp-category" label="Category" error={errors.category?.message}>
        <select
          className="min-h-11 w-full rounded-md border border-border-subtle bg-fill-subtle px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          {...register("category")}
        >
          {OPPORTUNITY_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </Field>
      <Field id="opp-deadline" label="Deadline" error={errors.deadline?.message}>
        <Input type="date" {...register("deadline")} />
      </Field>
      <Field id="opp-eligibility" label="Eligibility" error={errors.eligibility?.message}>
        <Input placeholder="e.g. Sophomores and above, any major" {...register("eligibility")} />
      </Field>
      <Field id="opp-description" label="Description" error={errors.description?.message}>
        <Textarea rows={4} {...register("description")} />
      </Field>
      <Field id="opp-url" label="Apply / learn more URL" error={errors.url?.message}>
        <Input type="url" placeholder="https://" {...register("url")} />
      </Field>
      <Field id="opp-submitter-name" label="Your name" error={errors.submitterName?.message}>
        <Input {...register("submitterName")} />
      </Field>
      <Field id="opp-submitter-email" label="Your email" error={errors.submitterEmail?.message}>
        <Input type="email" {...register("submitterEmail")} />
      </Field>
      {submitError ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {submitError}
        </p>
      ) : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit opportunity"}
      </Button>
    </form>
  );
}
