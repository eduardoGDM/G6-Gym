import { Eye } from "lucide-react";
import ActionIconButton from "../common/ActionIconButton";
import TableSkeleton from "../loading/TableSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { cn } from "../../lib/utils";

export default function RecentActivityTable({
  title,
  columns,
  rows,
  loading,
  emptyIcon: EmptyIcon,
  emptyTitle,
  emptyDescription,
  onAction,
  actionTooltip = "Visualizar",
  rowKey = "id",
  delay = 0,
}) {
  return (
    <Card
      className="border-border/80 bg-card/80 animate-in fade-in slide-in-from-bottom-2 duration-300"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "backwards" }}
    >
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>

      {loading ? (
        <CardContent className="overflow-x-auto p-0 pt-0">
          <TableSkeleton
            columns={columns.map((column) => ({
              label: column.label,
              className: column.className,
            }))}
            actionsCount={onAction ? 1 : 0}
            rows={4}
          />
        </CardContent>
      ) : rows.length === 0 ? (
        <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center pt-0 animate-in fade-in duration-300">
          {EmptyIcon ? (
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <EmptyIcon className="h-6 w-6" />
            </div>
          ) : null}
          <div>
            <p className="text-sm font-medium text-foreground">{emptyTitle}</p>
            {emptyDescription ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {emptyDescription}
              </p>
            ) : null}
          </div>
        </CardContent>
      ) : (
        <CardContent className="overflow-x-auto p-0 pt-0">
          <table className="min-w-full divide-y divide-border/70">
            <thead className="bg-muted/30">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      "px-4 py-3 text-left text-sm font-semibold text-foreground",
                      column.className,
                    )}
                  >
                    {column.label}
                  </th>
                ))}
                {onAction ? (
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Ações
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 bg-card/70">
              {rows.map((row) => (
                <tr
                  key={row[rowKey]}
                  className="transition-colors hover:bg-muted/10"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        "px-4 py-3 text-sm text-muted-foreground",
                        column.className,
                      )}
                    >
                      {column.render ? column.render(row) : row[column.key] ?? "—"}
                    </td>
                  ))}
                  {onAction ? (
                    <td className="px-4 py-3">
                      <ActionIconButton
                        icon={Eye}
                        tooltip={actionTooltip}
                        onClick={() => onAction(row)}
                      />
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      )}
    </Card>
  );
}
