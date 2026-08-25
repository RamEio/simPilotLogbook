import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-pill border px-2.5 py-0.5 text-overline font-medium uppercase tracking-overline",
  {
    variants: {
      variant: {
        default:
          "border-status-neutral/30 bg-status-neutral/10 text-status-neutral",
        game: "border-status-info/30 bg-status-info/15 text-status-info",
        success:
          "border-status-success/30 bg-status-success/15 text-status-success",
        warning:
          "border-status-warning/30 bg-status-warning/15 text-status-warning",
        error: "border-status-error/30 bg-status-error/15 text-status-error",
        info: "border-status-info/30 bg-status-info/15 text-status-info",
        neutral:
          "border-status-neutral/30 bg-status-neutral/15 text-status-neutral",
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
