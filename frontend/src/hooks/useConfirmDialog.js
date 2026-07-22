import { useState } from "react";

/**
 * Controla o estado de um ConfirmDialog para ações destrutivas (ex.: exclusão).
 *
 * Uso:
 *   const confirmDelete = useConfirmDialog();
 *   // gatilho na linha:
 *   onClick={() => confirmDelete.request(item.id)}
 *   // diálogo:
 *   <ConfirmDialog
 *     open={confirmDelete.open}
 *     loading={confirmDelete.loading}
 *     onConfirm={() => confirmDelete.confirm(runDelete)}
 *     onCancel={confirmDelete.cancel}
 *   />
 *
 * `runDelete(target)` recebe o alvo guardado no `request(...)`. O hook cuida do
 * loading e fecha o diálogo ao final (mesmo em erro — o feedback fica a cargo do
 * runDelete/crudToast).
 */
export function useConfirmDialog() {
  const [target, setTarget] = useState(null);
  const [loading, setLoading] = useState(false);

  const request = (value) => setTarget(value);

  const cancel = () => {
    if (!loading) setTarget(null);
  };

  const confirm = async (action) => {
    if (target === null) return;

    try {
      setLoading(true);
      await action(target);
    } finally {
      setLoading(false);
      setTarget(null);
    }
  };

  return {
    target,
    open: target !== null,
    loading,
    request,
    cancel,
    confirm,
  };
}
