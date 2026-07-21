import { cn } from "../../lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import Skeleton from "./Skeleton";

const WIDTHS = ["w-32", "w-24", "w-20", "w-28", "w-16", "w-36"];

export default function TableSkeleton({
  columns = [],
  rows = 5,
  actionsCount = 0,
  className,
}) {
  return (
    <Table className={className}>
      <TableHeader>
        <TableRow hoverable={false}>
          {columns.map((column, index) => {
            const label = typeof column === "string" ? column : column.label;
            const colClassName = typeof column === "string" ? "" : column.className;
            return (
              <TableHead key={index} className={colClassName}>
                {label}
              </TableHead>
            );
          })}
          {actionsCount > 0 ? <TableHead>Ações</TableHead> : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <TableRow key={rowIndex} hoverable={false}>
            {columns.map((column, colIndex) => {
              const colClassName = typeof column === "string" ? "" : column.className;
              return (
                <TableCell key={colIndex} className={cn(colClassName)}>
                  <Skeleton
                    className={cn("h-4", WIDTHS[(rowIndex + colIndex) % WIDTHS.length])}
                  />
                </TableCell>
              );
            })}
            {actionsCount > 0 ? (
              <TableCell>
                <div className="flex flex-wrap items-center gap-2">
                  {Array.from({ length: actionsCount }).map((_, actionIndex) => (
                    <Skeleton key={actionIndex} className="h-9 w-9 rounded-lg" />
                  ))}
                </div>
              </TableCell>
            ) : null}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
