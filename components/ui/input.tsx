import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full min-h-11 rounded-md border border-border-subtle bg-primary/5 px-3 py-2 text-sm text-foreground placeholder:text-caption focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
