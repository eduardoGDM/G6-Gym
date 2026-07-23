import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Ruler, Save, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import ConfirmDialog from "../../../../components/common/ConfirmDialog";
import { crudToast } from "../../../../components/common/crudToast";
import Spinner from "../../../../components/common/Spinner";
import { Field } from "../../../../components/forms/Field";
import { FormSection } from "../../../../components/forms/FormSection";
import { SectionLabel } from "../../../../components/forms/SectionLabel";
import Skeleton from "../../../../components/loading/Skeleton";
import AssessmentCard from "../../../../components/physicalAssessment/AssessmentCard";
import {
  MEASURE_GROUPS,
  formatAssessmentDate,
} from "../../../../components/physicalAssessment/fields";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import physicalAssessmentsService from "../../../../services/PhysicalAssessmentsService";
import {
  assessmentToFormValues,
  formatDecimal,
  getTodayISO,
  hasAnyMeasure,
  physicalAssessmentSchema,
  reassessmentFormValues,
  toAssessmentPayload,
} from "../utils";

export default function PhysicalAssessmentSection({ studentId, readOnly = false }) {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["student-physical-assessments", studentId],
    queryFn: () => physicalAssessmentsService.list(studentId),
    enabled: Boolean(studentId),
  });

  const assessments = data || [];
  const latest = assessments[0] || null;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(physicalAssessmentSchema),
    defaultValues: assessmentToFormValues(null),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ["student-physical-assessments", studentId],
    });

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  // Numa reavaliação o formulário já vem preenchido com os valores anteriores:
  // o personal só altera o que mudou, em vez de redigitar 20 campos.
  const handleNew = () => {
    setEditing(null);
    reset(reassessmentFormValues(latest));
    setFormOpen(true);
  };

  const handleEdit = (assessment) => {
    setEditing(assessment);
    reset(assessmentToFormValues(assessment));
    setFormOpen(true);
  };

  const onSubmit = async (values) => {
    const payload = toAssessmentPayload(values);

    if (!hasAnyMeasure(payload)) {
      toast.error("Informe ao menos uma medida para registrar a avaliação");
      return;
    }

    try {
      setSaving(true);

      await crudToast(
        editing
          ? physicalAssessmentsService.update(studentId, editing.id, payload)
          : physicalAssessmentsService.create(studentId, payload),
        { action: editing ? "update" : "create", entity: "Avaliação física" },
      );

      await invalidate();
      closeForm();
    } catch {
      // erro já exibido pelo crudToast
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!assessmentToDelete) return;

    try {
      setDeleting(true);
      await crudToast(
        physicalAssessmentsService.remove(studentId, assessmentToDelete.id),
        { action: "delete", entity: "Avaliação física" },
      );
      await invalidate();
      setAssessmentToDelete(null);

      if (editing?.id === assessmentToDelete.id) {
        closeForm();
      }
    } catch {
      // erro já exibido pelo crudToast
    } finally {
      setDeleting(false);
    }
  };

  if (isError) {
    return (
      <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-border/80 bg-card/90 p-6 text-center text-sm text-muted-foreground shadow-card sm:flex-row sm:justify-center">
        Não foi possível carregar as avaliações físicas do aluno.
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border border-border/80 bg-card/90 shadow-card">
      <div className="flex flex-col gap-3 border-b border-border/80 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-2">
          <Ruler className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-2xl font-semibold leading-none tracking-tight">
              Avaliação física
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Peso, circunferências e a variação em relação à avaliação anterior.
            </p>
          </div>
        </div>

        {!readOnly && !formOpen ? (
          <Button type="button" size="sm" onClick={handleNew}>
            <Plus className="h-4 w-4" />
            Nova avaliação
          </Button>
        ) : null}
      </div>

      <div className="space-y-6 px-6 py-6 sm:px-8">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        ) : (
          <>
            {formOpen ? (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6 rounded-2xl border border-border/80 bg-background/60 p-5 animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                <div className="flex items-center justify-between gap-3">
                  <SectionLabel>
                    {editing ? "Editar avaliação" : "Nova avaliação"}
                  </SectionLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={closeForm}
                  >
                    <X className="h-4 w-4" />
                    Cancelar
                  </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <Field
                    label="Data da avaliação"
                    htmlFor="assessment_date"
                    error={errors.assessment_date?.message}
                  >
                    <Input
                      id="assessment_date"
                      type="date"
                      max={getTodayISO()}
                      {...register("assessment_date")}
                    />
                  </Field>
                </div>

                {MEASURE_GROUPS.map((group) => (
                  <FormSection
                    key={group.key}
                    title={group.title}
                    description={group.description}
                  >
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {group.fields.map((field) => {
                        const registration = register(field.name);

                        return (
                          <Field
                            key={field.name}
                            label={field.label}
                            htmlFor={field.name}
                            error={errors[field.name]?.message}
                          >
                            <Input
                              id={field.name}
                              type="number"
                              inputMode="decimal"
                              step={field.step || "0.01"}
                              min="0"
                              max={field.max}
                              placeholder={field.placeholder}
                              {...registration}
                              onBlur={(event) => {
                                event.target.value = formatDecimal(
                                  event.target.value,
                                );
                                registration.onBlur(event);
                              }}
                            />
                          </Field>
                        );
                      })}
                    </div>
                  </FormSection>
                ))}

                <FormSection title="Observações">
                  <Field htmlFor="notes" error={errors.notes?.message}>
                    <Textarea
                      id="notes"
                      rows={4}
                      placeholder="Observações sobre a avaliação: condições da medição, percepções do aluno, próximos objetivos."
                      {...register("notes")}
                    />
                  </Field>
                </FormSection>

                <div className="flex flex-col gap-3 border-t border-border/80 pt-6 md:flex-row md:justify-end">
                  <Button type="button" variant="outline" onClick={closeForm}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {saving
                      ? "Salvando..."
                      : editing
                        ? "Salvar alterações"
                        : "Registrar avaliação"}
                  </Button>
                </div>
              </form>
            ) : null}

            {assessments.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border/80 px-6 py-10 text-center text-sm text-muted-foreground">
                Nenhuma avaliação física registrada para este aluno.
              </p>
            ) : (
              <div className="space-y-4">
                {assessments.map((assessment, index) => (
                  <AssessmentCard
                    key={assessment.id}
                    assessment={assessment}
                    isLatest={index === 0}
                    onEdit={readOnly ? undefined : handleEdit}
                    onDelete={readOnly ? undefined : setAssessmentToDelete}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(assessmentToDelete)}
        title="Excluir avaliação física"
        description={
          assessmentToDelete
            ? `A avaliação de ${formatAssessmentDate(assessmentToDelete.assessment_date)} será removida permanentemente. Deseja continuar?`
            : undefined
        }
        variant="destructive"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setAssessmentToDelete(null)}
      />
    </div>
  );
}
