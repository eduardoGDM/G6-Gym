import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { LineChart as LineChartIcon, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { FilterField } from "../forms/FilterField";
import Skeleton from "../loading/Skeleton";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import ExerciseAutocomplete from "./ExerciseAutocomplete";

const WEIGHT_COLOR = "#ef4444";
const SURFACE_COLOR = "#17171d";
const DOT_MIN_RADIUS = 4;
const DOT_MAX_RADIUS = 11;

/**
 * 1RM estimado (Epley): carga × (1 + reps/30). Normaliza a evolução de força
 * independente de o aluno ter feito poucas reps pesadas ou muitas reps leves.
 */
function estimated1rm(weight, repetitions) {
  if (weight === null || weight === undefined) return null;
  const reps = repetitions || 1;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

const PERIOD_OPTIONS = [
  { value: "30", label: "Últimos 30 dias" },
  { value: "90", label: "Últimos 90 dias" },
  { value: "365", label: "Último ano" },
  { value: "custom", label: "Personalizado" },
];

// Valores idênticos ao enum `planned_type` do backend (com acento). O gráfico
// inicia sempre em "Válida" (carga de trabalho real).
const SERIES_TYPE_OPTIONS = [
  { value: "Válida", label: "Séries válidas" },
  { value: "Reconhecimento", label: "Reconhecimento" },
  { value: "Aquecimento", label: "Aquecimento" },
];

function formatDate(value) {
  if (!value) return "-";
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

function formatWeight(value) {
  if (value === null || value === undefined) return "-";
  return `${value} kg`;
}

function formatPercentage(value) {
  if (value === null || value === undefined) return "-";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}%`;
}

function getPeriodRange(period, customStart, customEnd) {
  if (period === "custom") {
    return { startDate: customStart || undefined, endDate: customEnd || undefined };
  }

  return {
    startDate: dayjs().subtract(Number(period), "day").format("YYYY-MM-DD"),
    endDate: dayjs().format("YYYY-MM-DD"),
  };
}

function MetricCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-border/80 bg-background/60 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/80 py-14 text-center animate-in fade-in duration-300">
      <LineChartIcon className="h-8 w-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function ChartTooltipRow({ label, value }) {
  return (
    <p className="flex items-center justify-between gap-8">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </p>
  );
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;

  return (
    <div className="rounded-xl border border-border bg-[#17171d] px-3.5 py-3 text-xs shadow-popover">
      <p className="mb-2 text-sm font-semibold text-foreground">{point.label}</p>
      <div className="space-y-1.5">
        <ChartTooltipRow label="Carga" value={`${point.weight} kg`} />
        <ChartTooltipRow label="Repetições" value={point.repetitions ?? "-"} />
        <ChartTooltipRow label="1RM estimado" value={`${point.estimated_1rm} kg`} />
      </div>
    </div>
  );
}

/**
 * Painel reutilizável de evolução de exercícios (autocomplete + gráfico + cards).
 * A fonte dos dados é injetada por props (`fetchExercises` / `fetchEvolution`)
 * para que trainer (vendo um aluno) e aluno (vendo a si mesmo) compartilhem
 * exatamente a mesma UI, mudando apenas o endpoint consultado.
 */
export default function ExerciseEvolutionPanel({
  queryKey,
  fetchExercises,
  fetchEvolution,
  enabled = true,
  title = "Evolução de exercícios",
  description = "Evolução de carga e repetições com base no histórico de check-ins.",
  emptyHistoryMessage = "Ainda não há histórico de treinos suficiente para gerar gráficos de evolução.",
}) {
  const [exerciseId, setExerciseId] = useState("");
  const [seriesType, setSeriesType] = useState("Válida");
  const [period, setPeriod] = useState("90");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  // Filtro alimentado exclusivamente pelo histórico de check-ins: só lista
  // exercícios que já possuem execução registrada, nunca o cadastro geral.
  const { data: exercises, isLoading: loadingExercises } = useQuery({
    queryKey: [...queryKey, "exercises"],
    queryFn: fetchExercises,
    enabled,
  });

  const { startDate, endDate } = useMemo(
    () => getPeriodRange(period, customStart, customEnd),
    [period, customStart, customEnd],
  );

  const isCustomRangeReady = period !== "custom" || Boolean(customStart && customEnd);

  const {
    data: evolution,
    isLoading: loadingEvolution,
    isFetching: fetchingEvolution,
  } = useQuery({
    queryKey: [...queryKey, "evolution", exerciseId, seriesType, startDate, endDate],
    queryFn: () => fetchEvolution({ exerciseId, seriesType, startDate, endDate }),
    enabled: Boolean(enabled && exerciseId && isCustomRangeReady),
  });

  const points = evolution?.points || [];
  const summary = evolution?.summary;

  const chartData = points.map((point) => ({
    ...point,
    label: formatDate(point.performed_at),
    estimated_1rm: estimated1rm(point.weight, point.repetitions),
  }));

  // Repetições codificadas no TAMANHO do ponto (não em um segundo eixo): mapeia
  // a faixa de reps do exercício para um raio entre DOT_MIN e DOT_MAX.
  const recordedReps = points
    .map((point) => point.repetitions)
    .filter((value) => value !== null && value !== undefined);
  const minReps = recordedReps.length ? Math.min(...recordedReps) : 0;
  const maxReps = recordedReps.length ? Math.max(...recordedReps) : 0;

  const repRadius = (value) => {
    if (value === null || value === undefined || recordedReps.length === 0) {
      return DOT_MIN_RADIUS;
    }
    if (maxReps === minReps) return (DOT_MIN_RADIUS + DOT_MAX_RADIUS) / 2;
    const ratio = (value - minReps) / (maxReps - minReps);
    return DOT_MIN_RADIUS + ratio * (DOT_MAX_RADIUS - DOT_MIN_RADIUS);
  };

  // 1RM estimado atual e sua evolução no período (calculado no cliente a partir
  // dos mesmos pontos do gráfico, sem alteração na API).
  const firstE1rm = chartData[0]?.estimated_1rm ?? null;
  const currentE1rm = chartData[chartData.length - 1]?.estimated_1rm ?? null;
  const e1rmEvolution =
    firstE1rm && currentE1rm && firstE1rm > 0
      ? Math.round(((currentE1rm - firstE1rm) / firstE1rm) * 100 * 100) / 100
      : null;

  const hasHistory = (exercises || []).length > 0;

  return (
    <div className="rounded-2xl border border-border/80 bg-card/90 shadow-card">
      <div className="flex items-center gap-2 border-b border-border/80 px-6 py-6 sm:px-8">
        <TrendingUp className="h-5 w-5 text-primary" />
        <div>
          <h2 className="text-2xl font-semibold leading-none tracking-tight">
            {title}
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="px-6 py-6 sm:px-8">
        {loadingExercises ? (
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-1.5">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-11 w-full rounded-lg" />
                </div>
              ))}
            </div>
            <Skeleton className="h-80 w-full rounded-2xl" />
          </div>
        ) : !hasHistory ? (
          <EmptyState message={emptyHistoryMessage} />
        ) : (
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <FilterField label="Exercício" className="sm:col-span-2">
                <ExerciseAutocomplete
                  exercises={exercises || []}
                  value={exerciseId}
                  onChange={setExerciseId}
                  loading={loadingExercises}
                />
              </FilterField>

              <FilterField label="Tipo de série">
                <Select
                  value={seriesType}
                  onChange={(event) => setSeriesType(event.target.value)}
                >
                  {SERIES_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FilterField>

              <FilterField label="Período">
                <Select value={period} onChange={(event) => setPeriod(event.target.value)}>
                  {PERIOD_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FilterField>

              {period === "custom" ? (
                <div className="grid grid-cols-2 gap-2">
                  <FilterField label="Data inicial">
                    <Input
                      type="date"
                      value={customStart}
                      onChange={(event) => setCustomStart(event.target.value)}
                    />
                  </FilterField>
                  <FilterField label="Data final">
                    <Input
                      type="date"
                      value={customEnd}
                      onChange={(event) => setCustomEnd(event.target.value)}
                    />
                  </FilterField>
                </div>
              ) : null}
            </div>

            {!exerciseId ? (
              <EmptyState message="Selecione um exercício para visualizar a evolução." />
            ) : loadingEvolution ? (
              <div className="space-y-6">
                <Skeleton className="h-80 w-full rounded-2xl" />
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full rounded-2xl" />
                  ))}
                </div>
              </div>
            ) : points.length === 0 ? (
              <EmptyState message="Este exercício ainda não possui histórico de execução." />
            ) : (
              <div className="animate-in fade-in duration-300">
                <div
                  className={`h-80 w-full transition-opacity ${fetchingEvolution ? "opacity-60" : ""}`}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 12, right: 20, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" vertical={false} />
                      <XAxis
                        dataKey="label"
                        stroke="#898781"
                        tick={{ fill: "#b4b4c3", fontSize: 12 }}
                        tickLine={false}
                        axisLine={{ stroke: "#2a2a35" }}
                      />
                      <YAxis
                        stroke={WEIGHT_COLOR}
                        tick={{ fill: "#b4b4c3", fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        width={44}
                        domain={["dataMin - 5", "dataMax + 5"]}
                        label={{
                          value: "kg",
                          angle: -90,
                          position: "insideLeft",
                          fill: "#898781",
                          fontSize: 12,
                        }}
                      />
                      <Tooltip
                        content={<ChartTooltip />}
                        cursor={{ stroke: "#2a2a35", strokeWidth: 1 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        name="Carga (kg)"
                        stroke={WEIGHT_COLOR}
                        strokeWidth={2}
                        dot={(dotProps) => {
                          const { cx, cy, payload, index } = dotProps;
                          if (cx === null || cy === null) return null;
                          return (
                            <circle
                              key={`dot-${index}`}
                              cx={cx}
                              cy={cy}
                              r={repRadius(payload.repetitions)}
                              fill={WEIGHT_COLOR}
                              fillOpacity={0.9}
                              stroke={SURFACE_COLOR}
                              strokeWidth={2}
                            />
                          );
                        }}
                        activeDot={{ r: 6, stroke: SURFACE_COLOR, strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Legenda do encoding por tamanho — as repetições estão no raio
                    do ponto, não em um segundo eixo. */}
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
                  <span>Menos reps</span>
                  <span className="flex items-center gap-1.5">
                    <span
                      className="inline-block rounded-full"
                      style={{ width: 8, height: 8, background: WEIGHT_COLOR }}
                    />
                    <span
                      className="inline-block rounded-full"
                      style={{ width: 13, height: 13, background: WEIGHT_COLOR }}
                    />
                    <span
                      className="inline-block rounded-full"
                      style={{ width: 20, height: 20, background: WEIGHT_COLOR }}
                    />
                  </span>
                  <span>Mais reps · tamanho do ponto = repetições da série de maior carga</span>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <MetricCard
                    label="1RM estimado (atual)"
                    value={formatWeight(currentE1rm)}
                  />
                  <MetricCard
                    label="Evolução do 1RM"
                    value={formatPercentage(e1rmEvolution)}
                  />
                  <MetricCard
                    label="Evolução da carga"
                    value={formatPercentage(summary?.weight_evolution_percentage)}
                  />
                  <MetricCard
                    label="Maior carga registrada"
                    value={formatWeight(summary?.max_weight)}
                  />
                  <MetricCard
                    label="Maior número de repetições"
                    value={summary?.max_repetitions ?? "-"}
                  />
                  <MetricCard
                    label="Total de check-ins"
                    value={summary?.total_checkins ?? "-"}
                  />
                  <MetricCard
                    label="Primeira execução"
                    value={formatDate(summary?.first_performed_at)}
                  />
                  <MetricCard
                    label="Última execução"
                    value={formatDate(summary?.last_performed_at)}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
