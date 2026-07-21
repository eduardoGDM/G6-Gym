import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import workoutCheckinsService from "../services/WorkoutCheckinsService";

const DEBOUNCE_MS = 1500;
const AUTOSAVE_TOAST_ID = "checkin-autosave";

export const AUTOSAVE_STATUS = {
  IDLE: "idle",
  PENDING: "pending",
  SAVING: "saving",
  SAVED: "saved",
  OFFLINE: "offline",
  ERROR: "error",
};

/**
 * Lê o rascunho local de um check-in (usado para hidratar o formulário quando o
 * aluno reabre a página após uma falha de sincronização ou fechamento inesperado).
 */
export const readCheckinDraft = (draftId) => {
  try {
    const raw = localStorage.getItem(draftId);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.values ?? null;
  } catch {
    return null;
  }
};

const isOfflineError = (error) => {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return true;
  }
  // Sem `response` normalmente significa falha de rede (não chegou ao servidor).
  return !error?.response;
};

/**
 * Salvamento automático (debounce) do check-in do aluno.
 *
 * - Grava um rascunho local a cada alteração (camada de segurança antes da API).
 * - Após alguns segundos sem novas alterações, envia para a API reaproveitando
 *   create/update: o primeiro salvamento cria o check-in (uma única vez, com trava
 *   anti-concorrência) e os seguintes atualizam o registro existente.
 * - Reenvia o rascunho pendente quando a conexão volta.
 *
 * @param {object} params
 * @param {import("react-hook-form").UseFormWatch<any>} params.watch
 * @param {boolean} params.enabled - só habilita depois que a página carregou.
 * @param {string|number} params.workoutId
 * @param {number|null} params.checkinId - id atual do check-in (state da página).
 * @param {(id: number) => void} params.onCheckinCreated
 * @param {(values: any) => object} params.buildPayload
 * @param {string} params.draftId - chave estável do rascunho no localStorage.
 * @returns {{ status: string }}
 */
export function useCheckinAutosave({
  watch,
  enabled,
  checkinId,
  onCheckinCreated,
  buildPayload,
  draftId,
}) {
  const [status, setStatus] = useState(AUTOSAVE_STATUS.IDLE);

  const timerRef = useRef(null);
  const creatingRef = useRef(false);
  const pendingValuesRef = useRef(null);
  const latestValuesRef = useRef(null);
  const checkinIdRef = useRef(checkinId ?? null);
  const statusRef = useRef(status);
  const saveRef = useRef(null);

  useEffect(() => {
    checkinIdRef.current = checkinId ?? null;
  }, [checkinId]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(draftId);
    } catch {
      // localStorage indisponível — segue sem a camada de rascunho.
    }
  }, [draftId]);

  const persistDraft = useCallback(
    (values) => {
      try {
        localStorage.setItem(
          draftId,
          JSON.stringify({ values, savedAt: Date.now() }),
        );
      } catch {
        // localStorage indisponível/cheio — o autosave via API continua funcionando.
      }
    },
    [draftId],
  );

  const save = useCallback(
    async (values) => {
      // Um create já está em andamento: guarda as alterações para reenviar depois,
      // evitando criar dois check-ins para o mesmo treino.
      if (creatingRef.current) {
        pendingValuesRef.current = values;
        return;
      }

      const isCreate = !checkinIdRef.current;
      if (isCreate) creatingRef.current = true;

      setStatus(AUTOSAVE_STATUS.SAVING);

      try {
        const payload = buildPayload(values);

        if (isCreate) {
          const created = await workoutCheckinsService.create(payload);
          checkinIdRef.current = created.id;
          onCheckinCreated?.(created.id);
        } else {
          await workoutCheckinsService.update(checkinIdRef.current, payload);
        }

        clearDraft();
        setStatus(AUTOSAVE_STATUS.SAVED);
        toast.success("Progresso salvo", { id: AUTOSAVE_TOAST_ID });
      } catch (error) {
        const offline = isOfflineError(error);
        setStatus(offline ? AUTOSAVE_STATUS.OFFLINE : AUTOSAVE_STATUS.ERROR);
        toast.error(
          offline
            ? "Sem conexão. Tentaremos salvar novamente."
            : "Erro ao salvar automaticamente.",
          { id: AUTOSAVE_TOAST_ID },
        );
        // Mantém o rascunho local para reenviar depois (não perde os dados).
        return;
      } finally {
        creatingRef.current = false;
      }

      // Alterações que chegaram enquanto o create estava em andamento são enviadas agora.
      if (pendingValuesRef.current) {
        const next = pendingValuesRef.current;
        pendingValuesRef.current = null;
        saveRef.current?.(next);
      }
    },
    [buildPayload, clearDraft, onCheckinCreated],
  );

  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  const scheduleSave = useCallback(
    (values) => {
      latestValuesRef.current = values;
      persistDraft(values);
      setStatus(AUTOSAVE_STATUS.PENDING);

      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        save(values);
      }, DEBOUNCE_MS);
    },
    [persistDraft, save],
  );

  // Salva imediatamente, ignorando o debounce (ex.: sincronizar um rascunho
  // recuperado do localStorage assim que a página reabre).
  const saveNow = useCallback(
    (values) => {
      clearTimeout(timerRef.current);
      latestValuesRef.current = values;
      persistDraft(values);
      save(values);
    },
    [persistDraft, save],
  );

  // Debounce: observa o formulário e agenda o salvamento a cada alteração.
  useEffect(() => {
    if (!enabled) return undefined;

    const subscription = watch((values) => {
      scheduleSave(values);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timerRef.current);
    };
  }, [enabled, watch, scheduleSave]);

  // Reenvio automático quando a conexão volta.
  useEffect(() => {
    const handleOnline = () => {
      if (statusRef.current === AUTOSAVE_STATUS.OFFLINE && latestValuesRef.current) {
        save(latestValuesRef.current);
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [save]);

  return { status, saveNow };
}
