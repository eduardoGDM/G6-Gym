import { Card, CardContent } from "../ui/card";
import { cn } from "../../lib/utils";
import Skeleton from "./Skeleton";

export default function CardSkeleton({ lines = 3, className }) {
  return (
    <Card className={cn("border-border/80 bg-card/80", className)}>
      <CardContent className="space-y-4 p-6">
        <Skeleton className="h-12 w-12 rounded-2xl" />
        <Skeleton className="h-5 w-2/3" />
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, index) => (
            <Skeleton key={index} className="h-3.5 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
