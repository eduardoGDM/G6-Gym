import { cn } from "../../lib/utils";
import Skeleton from "./Skeleton";

function DetailBlock({ lines }) {
  return (
    <div className="space-y-4 rounded-2xl border border-border/80 bg-background/60 p-5">
      <Skeleton className="h-3.5 w-32" />
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton key={index} className="h-4 w-full max-w-xs" />
        ))}
      </div>
    </div>
  );
}

export default function DetailsSkeleton({ blocks = 4, linesPerBlock = 2, className }) {
  return (
    <div className={cn("grid gap-6 md:grid-cols-2", className)}>
      {Array.from({ length: blocks }).map((_, index) => (
        <DetailBlock key={index} lines={linesPerBlock} />
      ))}
    </div>
  );
}
