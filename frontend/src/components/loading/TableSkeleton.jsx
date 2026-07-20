import { cn } from "../../lib/utils";
import Skeleton from "./Skeleton";

const WIDTHS = ["w-32", "w-24", "w-20", "w-28", "w-16", "w-36"];

export default function TableSkeleton({
  columns = [],
  rows = 5,
  actionsCount = 0,
  className,
}) {
  return (
    <table className={cn("min-w-full divide-y divide-border/70", className)}>
      <thead className="bg-muted/30">
        <tr>
          {columns.map((label, index) => (
            <th
              key={index}
              className="px-4 py-3 text-left text-sm font-semibold text-foreground"
            >
              {label}
            </th>
          ))}
          {actionsCount > 0 ? (
            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
              Ações
            </th>
          ) : null}
        </tr>
      </thead>
      <tbody className="divide-y divide-border/60 bg-card/70">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map((_, colIndex) => (
              <td key={colIndex} className="px-4 py-3">
                <Skeleton
                  className={cn("h-4", WIDTHS[(rowIndex + colIndex) % WIDTHS.length])}
                />
              </td>
            ))}
            {actionsCount > 0 ? (
              <td className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  {Array.from({ length: actionsCount }).map((_, actionIndex) => (
                    <Skeleton key={actionIndex} className="h-9 w-9 rounded-lg" />
                  ))}
                </div>
              </td>
            ) : null}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
