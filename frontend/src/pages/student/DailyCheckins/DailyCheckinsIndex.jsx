import { yupResolver } from "@hookform/resolvers/yup";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  CalendarDays,
  Check,
  ClipboardList,
  MessageSquare,
  Moon,
  Pencil,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";

import DataTable from "../../../components/common/DataTable";
import PageContainer from "../../../components/common/PageContainer";
import PageTitle from "../../../components/common/PageTitle";
import { crudToast } from "../../../components/common/crudToast";
import { Field } from "../../../components/forms/Field";
import { FilterField } from "../../../components/forms/FilterField";
import QualityDot from "../../../components/student/QualityDot";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import dailyCheckinsService from "../../../services/DailyCheckinsService";
import CheckinPulse from "./components/CheckinPulse";
import RatingDial from "./components/RatingDial";
import { dailyCheckinSchema, getYesterdayISO } from "./utils/schema";

const PER_PAGE = 10;

function formatDate(value) {
  if (!value) return "-";
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

function formatWeekday(value) {
  if (!value) return "";
  // Meio-dia evita que o fuso empurre a data para o dia anterior.
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "";

  return date
    .toLocaleDateString("pt-BR", { weekday: "long" })
    .replace("-feira", "");
}

function summarizeNotes(checkin) {
  const parts = [];
  if (checkin.sleep_notes) parts.push(`Sono: ${checkin.sleep_notes}`);
  if (checkin.diet_notes) parts.push(`Dieta: ${checkin.diet_notes}`);

  if (parts.length === 0) return "-";

  const joined = parts.join(" | ");
  return joined.length > 60 ? `${joined.slice(0, 60)}...` : joined;
}

const defaultFormValues = {
  date: getYesterdayISO(),
  sleep_rating: 5,
  sleep_notes: "",
  diet_rating: 5,
  diet_notes: "",
};

export default function DailyCheckinsIndex() {
  const queryClient = useQueryClient();

  const [editingCheckin, setEditingCheckin] = useState(null);
  const [filterDate, setFilterDate] = useState("");
  const [page, setPage] = useState(1);

  const debouncedFilterDate = useDebouncedValue(filterDate, 500);

  const [lastFilterDate, setLastFilterDate] = useState(debouncedFilterDate);
  if (debouncedFilterDate !== lastFilterDate) {
    setLastFilterDate(debouncedFilterDate);
    setPage(1);
  }

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(dailyCheckinSchema),
    defaultValues: defaultFormValues,
  });

  // useWatch (e não watch()) para o carimbo reagir à troca de data sem quebrar
  // a memoização do React Compiler.
  const selectedDate = useWatch({ control, name: "date" });

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: [
      "student-daily-checkins",
      { page, date: debouncedFilterDate, perPage: PER_PAGE },
    ],
    queryFn: () =>
      dailyCheckinsService.list({
        page,
        perPage: PER_PAGE,
        date: debouncedFilterDate,
      }),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (isError) {
      toast.error("Não foi possível carregar o histórico de check-ins.");
    }
  }, [isError]);

  const checkins = data?.data || [];
  const meta = data?.meta;
  const total = meta?.total || 0;
  const lastPage = meta?.last_page || 1;
  const from = total === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const to = Math.min(page * PER_PAGE, total);

  const isEdit = Boolean(editingCheckin);

  // Traço do rodapé: notas de sono dos registros mais recentes, do mais antigo
  // para o mais novo (a API devolve em ordem decrescente de data).
  const pulseValues = checkins
    .slice(0, 7)
    .map((checkin) => checkin.sleep_rating)
    .filter((rating) => typeof rating === "number")
    .reverse();

  const handleEdit = (checkin) => {
    setEditingCheckin(checkin);
    reset({
      date: checkin.date.slice(0, 10),
      sleep_rating: checkin.sleep_rating,
      sleep_notes: checkin.sleep_notes || "",
      diet_rating: checkin.diet_rating,
      diet_notes: checkin.diet_notes || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingCheckin(null);
    reset(defaultFormValues);
  };

  const onSubmit = async (formValues) => {
    const payload = {
      date: formValues.date,
      sleep_rating: formValues.sleep_rating,
      sleep_notes: formValues.sleep_notes || null,
      diet_rating: formValues.diet_rating,
      diet_notes: formValues.diet_notes || null,
    };

    try {
      const request = isEdit
        ? dailyCheckinsService.update(editingCheckin.id, payload)
        : dailyCheckinsService.create(payload);

      await crudToast(request, {
        action: isEdit ? "update" : "create",
        entity: "Check-in Diário",
        onError: (error) => {
          const validationErrors = error.response?.data?.errors;

          if (validationErrors) {
            Object.entries(validationErrors).forEach(([field, messages]) => {
              setError(field, { type: "server", message: messages[0] });
            });
          }
        },
      });

      await queryClient.invalidateQueries({
        queryKey: ["student-daily-checkins"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["student-daily-checkin-reminder"],
      });

      setEditingCheckin(null);
      reset(defaultFormValues);
    } catch {
      // erro já exibido pelo crudToast
    }
  };

  const columns = [
    {
      key: "date",
      label: "Data",
      className: "text-sm font-medium text-foreground",
      render: (checkin) => (
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          {formatDate(checkin.date)}
        </div>
      ),
    },
    {
      key: "sleep_rating",
      label: "Sono",
      render: (checkin) => (
        <div className="flex items-center gap-2">
          <QualityDot level={checkin.sleep_level} />
          {checkin.sleep_rating}/10
        </div>
      ),
    },
    {
      key: "diet_rating",
      label: "Dieta",
      render: (checkin) => (
        <div className="flex items-center gap-2">
          <QualityDot level={checkin.diet_level} />
          {checkin.diet_rating}/10
        </div>
      ),
    },
    {
      key: "summary",
      label: "Resumo das observações",
      className: "hidden sm:table-cell",
      render: (checkin) => summarizeNotes(checkin),
    },
    {
      key: "comments",
      label: "Comentários do personal",
      render: (checkin) =>
        checkin.comments?.length ? (
          <div className="flex max-w-xs flex-col gap-1.5 whitespace-normal">
            {checkin.comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-2">
                <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm text-foreground/90">
                  {comment.body}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "actions",
      label: "Ações",
      render: (checkin) => (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleEdit(checkin)}
        >
          <Pencil className="h-4 w-4" />
          Editar
        </Button>
      ),
    },
  ];

  const metrics = [
    {
      name: "sleep",
      index: "01",
      icon: Moon,
      title: "Sono",
      ratingLabel: "Nota do sono",
      notesPlaceholder: "Como foi seu sono?",
    },
    {
      name: "diet",
      index: "02",
      icon: UtensilsCrossed,
      title: "Dieta",
      ratingLabel: "Nota da dieta",
      notesPlaceholder: "Como foi sua dieta?",
    },
  ];

  return (
    <PageContainer>
      {/* Painel de registro com leitura de placar: faixa da marca no topo,
          métricas numeradas e a data em bloco reto. */}
      <Card className="relative mt-8 overflow-hidden border-border/70 bg-card animate-in fade-in slide-in-from-bottom-3 duration-500">
        <div aria-hidden="true" className="h-1.5 bg-primary" />

        {/* Hachura diagonal no canto — referência a livery esportiva. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 h-44 w-44 opacity-[0.06] [background-image:repeating-linear-gradient(135deg,var(--color-primary)_0,var(--color-primary)_3px,transparent_3px,transparent_11px)]"
        />

        <form onSubmit={handleSubmit(onSubmit)} className="relative">
          <div className="flex flex-col gap-6 px-6 pb-7 pt-7 sm:flex-row sm:items-end sm:justify-between sm:px-8">
            <div>
              <p className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.24em] text-primary">
                Acompanhamento
              </p>
              <h1 className="text-3xl font-bold uppercase tracking-tight text-foreground sm:text-[2.5rem] sm:leading-[1.05]">
                {isEdit ? "Editar check-in" : "Check-in diário"}
              </h1>
              <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                {isEdit
                  ? "Atualize as notas e observações deste registro."
                  : "Avalie de 0 a 10 como foi seu sono e sua dieta ontem."}
              </p>
            </div>

            {/* O bloco inteiro é o controle de data: o input fica invisível por
                cima, preservando o seletor nativo. */}
            <div className="w-full shrink-0 space-y-2 sm:w-auto">
              <label
                htmlFor="date"
                className="relative block rounded-lg border border-border bg-surface px-4 py-3 transition-colors duration-200 hover:border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background"
              >
                <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                  Referente a
                </span>
                <span className="mt-1.5 flex items-baseline gap-2.5">
                  <span className="font-mono text-2xl font-bold tabular-nums text-foreground">
                    {formatDate(selectedDate)}
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary">
                    {formatWeekday(selectedDate)}
                  </span>
                </span>
                <Input
                  id="date"
                  type="date"
                  aria-label="Data do check-in"
                  className="absolute inset-0 h-full w-full cursor-pointer appearance-none border-0 p-0 opacity-0 shadow-none"
                  onClick={(event) => {
                    try {
                      event.currentTarget.showPicker?.();
                    } catch {
                      // Navegador sem suporte: o input nativo continua funcionando.
                    }
                  }}
                  {...register("date")}
                />
              </label>
              {errors.date ? (
                <p className="text-sm text-destructive">
                  {errors.date.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 px-6 sm:px-8 md:grid-cols-2">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              const ratingError = errors[`${metric.name}_rating`];

              return (
                <section
                  key={metric.name}
                  className="relative overflow-hidden rounded-xl border border-border bg-surface/60 p-5 pl-6 transition-colors duration-200 hover:border-primary/40"
                >
                  {/* Faixa lateral: mesma linguagem da barra do topo. */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 w-1 bg-primary/70"
                  />

                  <div className="mb-5 flex items-center justify-between gap-3">
                    <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-foreground">
                      <Icon
                        className="h-4 w-4 text-primary"
                        aria-hidden="true"
                      />
                      {metric.title}
                    </h2>
                  </div>

                  <Controller
                    control={control}
                    name={`${metric.name}_rating`}
                    render={({ field }) => (
                      <RatingDial
                        id={`${metric.name}_rating`}
                        label={metric.ratingLabel}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {ratingError ? (
                    <p className="mt-2 text-center text-sm text-destructive">
                      {ratingError.message}
                    </p>
                  ) : null}

                  <Field
                    label="Observação (opcional)"
                    htmlFor={`${metric.name}_notes`}
                    className="mt-5"
                  >
                    <Textarea
                      id={`${metric.name}_notes`}
                      placeholder={metric.notesPlaceholder}
                      className="min-h-[72px]"
                      {...register(`${metric.name}_notes`)}
                    />
                  </Field>
                </section>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col gap-5 border-t border-border px-6 py-6 sm:px-8 md:flex-row md:items-center md:justify-between">
            <CheckinPulse
              values={pulseValues}
              label="Sono · últimos registros"
            />

            <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
              {isEdit ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                >
                  <X className="h-4 w-4" />
                  Cancelar edição
                </Button>
              ) : null}
              <Button type="submit" size="lg" loading={isSubmitting}>
                {isSubmitting ? null : <Check className="h-4 w-4" />}
                {isSubmitting
                  ? "Salvando..."
                  : isEdit
                    ? "Salvar alterações"
                    : "Registrar check-in"}
              </Button>
            </div>
          </div>
        </form>
      </Card>

      <div className="mt-8 mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle
          eyebrow="Histórico"
          title="Check-ins registrados"
          description="Consulte e edite seus registros anteriores."
        />

        <FilterField
          label="Filtrar por data"
          htmlFor="filter_date"
          className="sm:w-56"
        >
          <Input
            id="filter_date"
            type="date"
            className="min-w-0 max-w-full appearance-none"
            value={filterDate}
            onChange={(event) => setFilterDate(event.target.value)}
          />
        </FilterField>
      </div>

      <DataTable
        columns={columns}
        rows={checkins}
        loading={isLoading}
        fetching={isFetching}
        error={isError}
        onRetry={refetch}
        actionsCount={1}
        emptyIcon={ClipboardList}
        emptyTitle={
          debouncedFilterDate
            ? "Nenhum check-in encontrado para esta data"
            : "Nenhum check-in registrado ainda"
        }
        emptyDescription={
          debouncedFilterDate
            ? "Tente ajustar o filtro de data."
            : "Registre seu primeiro check-in diário acima."
        }
        pagination={{
          summary: `${from}–${to} de ${total}`,
          page,
          lastPage,
          onPrev: () => setPage((current) => Math.max(1, current - 1)),
          onNext: () => setPage((current) => Math.min(lastPage, current + 1)),
        }}
      />
    </PageContainer>
  );
}
