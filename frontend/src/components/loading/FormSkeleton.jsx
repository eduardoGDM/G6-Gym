import { cn } from "../../lib/utils";
import Skeleton from "./Skeleton";

export default function FormSkeleton({
  fields = 6,
  columns = 2,
  footer = true,
  className,
}) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className={cn("grid gap-6", columns === 2 ? "md:grid-cols-2" : "")}>
        {Array.from({ length: fields }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
        ))}
      </div>

      {footer ? (
        <div className="flex flex-col gap-3 border-t border-border/80 pt-6 md:flex-row md:justify-end">
          <Skeleton className="h-11 w-full rounded-lg md:w-32" />
          <Skeleton className="h-11 w-full rounded-lg md:w-40" />
        </div>
      ) : null}
    </div>
  );
}
