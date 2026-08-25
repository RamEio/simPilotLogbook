import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-24 w-full rounded border border-line-default bg-bg-input px-3 py-2 text-sm text-ink-primary placeholder:text-ink-disabled focus-visible:outline-none focus-visible:border-status-info disabled:cursor-not-allowed disabled:border-line-subtle disabled:bg-bg-elevated disabled:text-ink-disabled",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
