import { Eye } from "lucide-react";
import ActionIconButton from "../common/ActionIconButton";
import DataTable from "../common/DataTable";
import { CardHeader, CardTitle } from "../ui/card";

export default function RecentActivityTable({
  title,
  columns,
  rows,
  loading,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  onAction,
  actionTooltip = "Visualizar",
  rowKey = "id",
  delay = 0,
}) {
  const dataColumns = [
    ...columns,
    ...(onAction
      ? [
          {
            key: "__actions",
            label: "Ações",
            render: (row) => (
              <ActionIconButton
                icon={Eye}
                tooltip={actionTooltip}
                onClick={() => onAction(row)}
              />
            ),
          },
        ]
      : []),
  ];

  return (
    <DataTable
      className="animate-in fade-in slide-in-from-bottom-2 duration-300"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "backwards" }}
      columns={dataColumns}
      rows={rows}
      rowKey={rowKey}
      loading={loading}
      actionsCount={onAction ? 1 : 0}
      emptyIcon={emptyIcon}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      toolbar={
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
      }
    />
  );
}
