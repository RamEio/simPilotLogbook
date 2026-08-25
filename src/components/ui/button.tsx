import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-sm font-medium transition-colors duration-200 focus-visible:outline-none disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default:
          "bg-crimson-600 text-white hover:bg-crimson-700 active:translate-y-px active:bg-crimson-900 focus-visible:ring-2 focus-visible:ring-crimson-400 disabled:bg-ink-disabled disabled:text-ink-muted",
        secondary:
          "border border-line-default bg-transparent text-ink-primary hover:bg-bg-hover hover:border-line-strong active:translate-y-px active:bg-bg-card focus-visible:ring-2 focus-visible:ring-status-info disabled:border-line-subtle disabled:text-ink-disabled",
        outline:
          "border border-line-default bg-transparent text-ink-primary hover:bg-bg-hover focus-visible:ring-2 focus-visible:ring-status-info",
        ghost:
          "text-ink-secondary hover:bg-bg-hover hover:text-ink-primary focus-visible:ring-2 focus-visible:ring-status-info",
        destructive:
          "bg-crimson-600 text-white hover:bg-crimson-700 active:bg-crimson-900 focus-visible:ring-2 focus-visible:ring-crimson-400",
        link: "text-status-info underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
