import { Card, CardContent } from "../ui/card";
import { cn } from "../../lib/utils";
import Skeleton from "./Skeleton";

export default function StatsCardSkeleton({ delay = 0, className }) {
  return (
    <Card
      className={cn("border-border/80 bg-card/80", className)}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "backwards" }}
    >
      <CardContent className="p-5">
        <Skeleton className="h-12 w-12 rounded-2xl" />
        <Skeleton className="mt-4 h-4 w-24" />
        <Skeleton className="mt-2 h-8 w-16" />
      </CardContent>
    </Card>
  );
}
