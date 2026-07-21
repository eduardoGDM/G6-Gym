import { yupResolver } from "@hookform/resolvers/yup";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { CalendarDays, ClipboardList, Pencil, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import DataTable from "../../../components/common/DataTable";
import PageContainer from "../../../components/common/PageContainer";
import PageTitle from "../../../components/common/PageTitle";
import { crudToast } from "../../../components/common/crudToast";
import Spinner from "../../../components/common/Spinner";
import QualityDot from "../../../components/student/QualityDot";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import dailyCheckinsService from "../../../services/DailyCheckinsService";
import RatingSlider from "./components/RatingSlider";
import { dailyCheckinSchema, getYesterdayISO } from "./utils/schema";

const PER_PAGE = 10;

function formatDate(value) {
  if (!value) return "-";
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
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

  return (
    <PageContainer>
      <PageTitle
        eyebrow="Acompanhamento"
        title="Check-in Diário"
        description="Registre diariamente como foi seu sono e sua dieta no dia anterior."
      />

      <Card className="border-border/80 bg-card/90">
        <CardHeader className="border-b border-border/80 px-6 py-6 sm:px-8">
          <CardTitle className="text-2xl">
            {isEdit
              ? `Editar check-in de ${formatDate(editingCheckin.date)}`
              : "Novo Check-in Diário"}
          </CardTitle>
          <CardDescription>
            {isEdit
              ? "Atualize as notas e observações deste check-in."
              : "Avalie de 0 a 10 como foi seu sono e sua dieta ontem."}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 py-6 sm:px-8">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <div className="max-w-xs space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input id="date" type="date" {...register("date")} />
              {errors.date ? (
                <p className="text-sm text-red-400">{errors.date.message}</p>
              ) : null}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4 rounded-2xl border border-border/80 bg-background/60 p-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Sono
                </h3>

                <Controller
                  control={control}
                  name="sleep_rating"
                  render={({ field }) => (
                    <RatingSlider
                      id="sleep_rating"
                      label="Nota do sono"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {errors.sleep_rating ? (
                  <p className="text-sm text-red-400">
                    {errors.sleep_rating.message}
                  </p>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="sleep_notes">Observação (opcional)</Label>
                  <Textarea
                    id="sleep_notes"
                    placeholder="Como foi seu sono?"
                    {...register("sleep_notes")}
                  />
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-border/80 bg-background/60 p-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Dieta
                </h3>

                <Controller
                  control={control}
                  name="diet_rating"
                  render={({ field }) => (
                    <RatingSlider
                      id="diet_rating"
                      label="Nota da dieta"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {errors.diet_rating ? (
                  <p className="text-sm text-red-400">
                    {errors.diet_rating.message}
                  </p>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="diet_notes">Observação (opcional)</Label>
                  <Textarea
                    id="diet_notes"
                    placeholder="Como foi sua dieta?"
                    {...register("diet_notes")}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-border/80 pt-6 md:flex-row md:justify-end">
              {isEdit ? (
                <Button type="button" variant="outline" onClick={handleCancelEdit}>
                  <X className="h-4 w-4" />
                  Cancelar edição
                </Button>
              ) : null}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Spinner className="h-4 w-4" /> : null}
                {isSubmitting
                  ? "Salvando..."
                  : isEdit
                    ? "Salvar alterações"
                    : "Registrar check-in"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8 mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle
          eyebrow="Histórico"
          title="Check-ins registrados"
          description="Consulte e edite seus registros anteriores."
        />

        <div className="sm:w-56">
          <Label htmlFor="filter_date" className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">
            Filtrar por data
          </Label>
          <Input
            id="filter_date"
            type="date"
            value={filterDate}
            onChange={(event) => setFilterDate(event.target.value)}
          />
        </div>
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
