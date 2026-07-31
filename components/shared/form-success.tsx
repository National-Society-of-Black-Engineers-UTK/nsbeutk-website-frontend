import * as React from "react";
import { CheckCircle2 } from "lucide-react";

type FormSuccessProps = {
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function FormSuccess({ title, description, children }: FormSuccessProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg bg-secondary/20 p-6 text-center">
      <CheckCircle2 className="size-8 text-primary dark:text-secondary" aria-hidden="true" />
      <p className="text-base font-bold text-primary dark:text-secondary">{title}</p>
      <p className="text-sm text-foreground">{description}</p>
      {children}
    </div>
  );
}
