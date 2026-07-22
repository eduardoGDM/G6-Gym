import { cn } from "../../lib/utils";

function Label({ className, ...props }) {
  return (
    <label
      className={cn(
        "block mb-4 text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
