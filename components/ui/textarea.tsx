import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-md border border-border-subtle bg-primary/5 px-3 py-2 text-sm text-foreground placeholder:text-caption focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
