import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded border border-line-default bg-bg-input px-3 py-2 text-sm text-ink-primary placeholder:text-ink-disabled focus-visible:outline-none focus-visible:border-status-info disabled:cursor-not-allowed disabled:border-line-subtle disabled:bg-bg-elevated disabled:text-ink-disabled",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
