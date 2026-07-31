import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded text-xs font-bold px-2 py-1", {
  variants: {
    variant: {
      secondary: "bg-secondary text-black",
      primary: "bg-primary text-white",
    },
  },
  defaultVariants: { variant: "secondary" },
});

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
