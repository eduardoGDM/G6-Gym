import { Card } from "../ui/card";
import { cn } from "../../lib/utils";
import Skeleton from "./Skeleton";

export default function StatsCardSkeleton({ delay = 0, className }) {
  return (
    <Card
      className={cn("p-5", className)}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "backwards" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
    </Card>
  );
}
