import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider",
  {
    variants: {
      variant: {
        default: "border-line-muted text-ink-secondary",
        game: "border-accent-blue/40 bg-accent-blue/10 text-accent-blue",
        destructive: "border-accent-red/40 bg-accent-red/10 text-accent-red",
        outline: "border-line-muted bg-transparent text-ink-secondary",
        success: "border-outcome-success/40 bg-outcome-success/10 text-outcome-success",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
