import { cn } from "../../lib/utils";
import { forwardRef, useCallback } from "react";

function resizeToContent(element) {
  if (!element) return;
  element.style.height = "auto";
  element.style.height = `${element.scrollHeight}px`;
}

const Textarea = forwardRef(function Textarea(
  { className, autoResize = false, onInput, ...props },
  forwardedRef,
) {
  const setRefs = useCallback(
    (element) => {
      if (typeof forwardedRef === "function") {
        forwardedRef(element);
      } else if (forwardedRef) {
        forwardedRef.current = element;
      }

      if (autoResize) {
        resizeToContent(element);
      }
    },
    [forwardedRef, autoResize],
  );

  const handleInput = (event) => {
    if (autoResize) {
      resizeToContent(event.target);
    }
    onInput?.(event);
  };

  return (
    <textarea
      ref={setRefs}
      onInput={handleInput}
      className={cn(
        "flex min-h-[110px] w-full rounded-xl border border-border bg-card px-3.5 py-3 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        autoResize && "min-h-[44px] resize-none overflow-hidden",
        className,
      )}
      {...props}
    />
  );
});

export { Textarea };
