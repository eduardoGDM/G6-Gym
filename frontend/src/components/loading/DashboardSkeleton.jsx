import { Card, CardContent, CardHeader } from "../ui/card";
import { cn } from "../../lib/utils";
import Skeleton from "./Skeleton";
import StatsCardSkeleton from "./StatsCardSkeleton";
import TableSkeleton from "./TableSkeleton";

export default function DashboardSkeleton({ statsCount = 4, tables = 2, className }) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: statsCount }).map((_, index) => (
          <StatsCardSkeleton key={index} delay={index * 60} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: tables }).map((_, index) => (
          <Card key={index} className="border-border/80 bg-card/80">
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent className="overflow-x-auto p-0 pt-0">
              <TableSkeleton columns={["", "", "", ""]} rows={4} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
