import { cn } from "../../lib/utils";
import EmptyState from "../loading/EmptyState";
import ErrorState from "../loading/ErrorState";
import TableSkeleton from "../loading/TableSkeleton";
import { Button } from "../ui/button";
import { Select } from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

function DataTablePagination({
  summary,
  page,
  lastPage,
  onPrev,
  onNext,
  perPage,
  perPageOptions,
  onPerPageChange,
}) {
  return (
    <div className="flex flex-col gap-4 border-t border-border/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
        {perPageOptions ? (
          <div className="flex items-center gap-2">
            <span>Exibir</span>
            <Select
              size="sm"
              className="w-[4.5rem]"
              value={perPage}
              onChange={onPerPageChange}
              aria-label="Itens por página"
            >
              {perPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </div>
        ) : null}
        <span className="tabular-nums">{summary}</span>
      </div>

      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={onPrev}>
          Anterior
        </Button>
        <span className="text-sm tabular-nums text-muted-foreground">
          Página {page} de {lastPage}
        </span>
        <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={onNext}>
          Próxima
        </Button>
      </div>
    </div>
  );
}

export default function DataTable({
  className,
  toolbar,
  columns,
  rows,
  rowKey = "id",
  loading = false,
  fetching = false,
  error = false,
  onRetry,
  actionsCount = 0,
  emptyIcon,
  emptyTone,
  emptyTitle,
  emptyDescription,
  emptyAction,
  pagination,
  ...rest
}) {
  const hasRows = rows.length > 0;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border/80 bg-card/80 shadow-card",
        className,
      )}
      {...rest}
    >
      {toolbar ? <div className="border-b border-border/80">{toolbar}</div> : null}

      {loading ? (
        <div className="overflow-x-auto">
          <TableSkeleton columns={columns} actionsCount={actionsCount} rows={5} />
        </div>
      ) : error ? (
        <ErrorState onRetry={onRetry} />
      ) : !hasRows ? (
        <EmptyState
          icon={emptyIcon}
          tone={emptyTone}
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      ) : (
        <>
          <div
            className={cn(
              "overflow-x-auto transition-opacity duration-200",
              fetching ? "opacity-60" : "",
            )}
          >
            <Table>
              <TableHeader>
                <TableRow hoverable={false}>
                  {columns.map((column) => (
                    <TableHead key={column.key} className={column.className}>
                      {column.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row[rowKey]}>
                    {columns.map((column) => (
                      <TableCell key={column.key} className={column.className}>
                        {column.render ? column.render(row) : (row[column.key] ?? "—")}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {pagination ? <DataTablePagination {...pagination} /> : null}
        </>
      )}
    </div>
  );
}
