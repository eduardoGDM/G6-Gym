import { cn } from "../../lib/utils";
import CardSkeleton from "./CardSkeleton";

export default function ListSkeleton({
  count = 6,
  columns = "md:grid-cols-2 xl:grid-cols-3",
  lines = 2,
  className,
}) {
  return (
    <div className={cn("grid gap-4", columns, className)}>
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} lines={lines} />
      ))}
    </div>
  );
}
