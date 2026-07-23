import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import Spinner from "../../../components/common/Spinner";
import { Field } from "../../../components/forms/Field";
import { Button } from "../../../components/ui/button";
import { Dialog, DialogCloseButton } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Select } from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import adminPlansService from "../../../services/AdminPlansService";
import { formatPlanPrice, formatUsage, isOverLimit } from "../../../utils/plan";

/**
 * Atribuição manual de plano. Enquanto não existe gateway, é assim que um
 * personal entra num plano — a assinatura fica gravada com `source: manual` e
 * o mesmo registro será escrito pelo webhook quando a cobrança existir.
 *
 * O componente é montado por personal (`key={trainer.id}` no chamador), então o
 * estado inicial vem direto das props — sem efeito de sincronização.
 */
export default function PlanAssignDialog({
  trainer,
  onClose,
  onSubmit,
  onRemove,
  saving = false,
}) {
  const { data: plans, isLoading } = useQuery({
    queryKey: ["admin-plans"],
    queryFn: adminPlansService.list,
    staleTime: 1000 * 60 * 30,
  });

  const [planCode, setPlanCode] = useState(trainer?.plan?.code || "");
  const [endsAt, setEndsAt] = useState(trainer?.subscription?.ends_at || "");
  const [notes, setNotes] = useState("");

  const selectedPlan = (plans || []).find((plan) => plan.code === planCode);
  const studentsCount = trainer?.students_count ?? 0;
  const willExceed = isOverLimit(studentsCount, selectedPlan?.student_limit);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ planCode, endsAt: endsAt || null, notes: notes || null });
  };

  return (
    <Dialog open onClose={onClose} className="max-w-lg">
      <DialogCloseButton onClick={onClose} />

      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Atribuir plano
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {trainer?.name} — {studentsCount} aluno(s) cadastrado(s).
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <Spinner className="h-5 w-5" />
          </div>
        ) : (
          <>
            <Field label="Plano" htmlFor="plan_code">
              <Select
                id="plan_code"
                value={planCode}
                onChange={(event) => setPlanCode(event.target.value)}
                required
              >
                <option value="">Selecione um plano</option>
                {(plans || []).map((plan) => (
                  <option key={plan.code} value={plan.code}>
                    {plan.name} — {formatPlanPrice(plan.price_cents)} (
                    {plan.student_limit ?? "∞"} alunos)
                  </option>
                ))}
              </Select>
            </Field>

            {selectedPlan ? (
              <div className="rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-sm">
                <span className="text-muted-foreground">Uso após a troca:</span>{" "}
                <span
                  className={
                    willExceed
                      ? "font-semibold text-destructive"
                      : "font-semibold text-foreground"
                  }
                >
                  {formatUsage(studentsCount, selectedPlan.student_limit)}
                </span>
                {willExceed ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    O personal fica acima do limite do plano. Nada é bloqueado —
                    ainda não existe enforcement — mas o excedente fica visível
                    na listagem.
                  </p>
                ) : null}
              </div>
            ) : null}

            <Field
              label="Vencimento (opcional)"
              htmlFor="ends_at"
              hint="Em branco = sem vencimento, que é o normal para atribuição manual."
            >
              <Input
                id="ends_at"
                type="date"
                value={endsAt}
                onChange={(event) => setEndsAt(event.target.value)}
              />
            </Field>

            <Field label="Observação (opcional)" htmlFor="notes">
              <Textarea
                id="notes"
                rows={3}
                placeholder="Motivo da atribuição, combinado comercial, etc."
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </Field>
          </>
        )}

        <div className="flex flex-col gap-2 border-t border-border/80 pt-4 sm:flex-row sm:justify-between">
          {trainer?.plan ? (
            <Button
              type="button"
              variant="destructive"
              disabled={saving}
              onClick={() => onRemove(trainer)}
            >
              Remover plano
            </Button>
          ) : (
            <span />
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || !planCode}>
              {saving ? <Spinner className="h-4 w-4" /> : null}
              {saving ? "Salvando..." : "Atribuir plano"}
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
