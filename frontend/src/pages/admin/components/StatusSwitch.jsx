import { useState } from "react";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import { Switch } from "../../../components/ui/switch";

export default function StatusSwitch({
  checked,
  onConfirm,
  confirmTitle,
  confirmMessage,
}) {
  const [pendingValue, setPendingValue] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm(pendingValue);
      setPendingValue(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Switch
        checked={checked}
        disabled={loading}
        onCheckedChange={(next) => setPendingValue(next)}
      />

      <ConfirmDialog
        open={pendingValue !== null}
        title={confirmTitle}
        description={confirmMessage}
        confirmLabel={pendingValue ? "Ativar" : "Desativar"}
        variant={pendingValue ? "default" : "destructive"}
        loading={loading}
        onConfirm={handleConfirm}
        onCancel={() => setPendingValue(null)}
      />
    </>
  );
}
