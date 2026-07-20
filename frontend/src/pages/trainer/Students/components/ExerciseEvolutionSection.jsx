import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { LineChart as LineChartIcon, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import PageLoader from "../../../../components/common/PageLoader";
import { Input } from "../../../../components/ui/input";
import { Select } from "../../../../components/ui/select";
import studentExerciseEvolutionService from "../../../../services/StudentExerciseEvolutionService";

const WEIGHT_COLOR = "#3987e5";
const REPETITIONS_COLOR = "#d95926";

const PERIOD_OPTIONS = [
  { value: "30", label: "Últimos 30 dias" },
  { value: "90", label: "Últimos 90 dias" },
  { value: "365", label: "Último ano" },
  { value: "custom", label: "Personalizado" },
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

export default function ExerciseEvolutionSection({ studentId }) {
  const [muscleGroupId, setMuscleGroupId] = useState("");
  const [exerciseId, setExerciseId] = useState("");
  const [period, setPeriod] = useState("90");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  // Filtros alimentados exclusivamente pelo histórico de check-ins do aluno:
  // só listam grupos musculares/exercícios que já possuem execução registrada,
  // nunca o cadastro geral de Exercise/MuscleGroup.
  const { data: muscleGroups, isLoading: loadingMuscleGroups } = useQuery({
    queryKey: ["trainer-student-checkin-muscle-groups", studentId],
    queryFn: () => studentExerciseEvolutionService.getMuscleGroups(studentId),
    enabled: Boolean(studentId),
  });

  const { data: exercises, isLoading: loadingExercises } = useQuery({
    queryKey: ["trainer-student-checkin-exercises", studentId, muscleGroupId],
    queryFn: () => studentExerciseEvolutionService.getExercises(studentId, muscleGroupId),
    enabled: Boolean(studentId && muscleGroupId),
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
    queryKey: [
      "trainer-exercise-evolution",
      studentId,
      exerciseId,
      muscleGroupId,
      startDate,
      endDate,
    ],
    queryFn: () =>
      studentExerciseEvolutionService.get({
        studentId,
        exerciseId,
        muscleGroupId,
        startDate,
        endDate,
      }),
    enabled: Boolean(studentId && exerciseId && isCustomRangeReady),
  });

  const handleMuscleGroupChange = (event) => {
    setMuscleGroupId(event.target.value);
    setExerciseId("");
  };

  const points = evolution?.points || [];
  const summary = evolution?.summary;
  const chartData = points.map((point) => ({
    ...point,
    label: formatDate(point.performed_at),
  }));

  const hasHistory = (muscleGroups || []).length > 0;

  return (
    <div className="mt-6 rounded-2xl border border-border/80 bg-card/90 shadow-[0_12px_40px_rgba(0,0,0,0.25)]">
      <div className="flex items-center gap-2 border-b border-border/80 px-6 py-6 sm:px-8">
        <TrendingUp className="h-5 w-5 text-primary" />
        <div>
          <h2 className="text-2xl font-semibold leading-none tracking-tight">
            Evolução de exercícios
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Evolução de carga e repetições com base no histórico de check-ins do
            aluno.
          </p>
        </div>
      </div>

      <div className="px-6 py-6 sm:px-8">
        {loadingMuscleGroups ? (
          <PageLoader label="Carregando histórico..." />
        ) : !hasHistory ? (
          <EmptyState message="Este aluno ainda não possui histórico de treinos suficiente para gerar gráficos de evolução." />
        ) : (
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Grupo muscular
                </label>
                <Select
                  value={muscleGroupId}
                  onChange={handleMuscleGroupChange}
                  disabled={loadingMuscleGroups}
                >
                  <option value="">Selecione um grupo muscular</option>
                  {(muscleGroups || []).map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Exercício
                </label>
                <Select
                  value={exerciseId}
                  onChange={(event) => setExerciseId(event.target.value)}
                  disabled={!muscleGroupId || loadingExercises}
                >
                  <option value="">
                    {muscleGroupId
                      ? "Selecione um exercício"
                      : "Selecione um grupo muscular primeiro"}
                  </option>
                  {(exercises || []).map((exercise) => (
                    <option key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Período
                </label>
                <Select value={period} onChange={(event) => setPeriod(event.target.value)}>
                  {PERIOD_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>

              {period === "custom" ? (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Data inicial
                    </label>
                    <Input
                      type="date"
                      value={customStart}
                      onChange={(event) => setCustomStart(event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Data final
                    </label>
                    <Input
                      type="date"
                      value={customEnd}
                      onChange={(event) => setCustomEnd(event.target.value)}
                    />
                  </div>
                </div>
              ) : null}
            </div>

            {!exerciseId ? (
              <EmptyState message="Selecione um grupo muscular e um exercício para visualizar a evolução." />
            ) : loadingEvolution ? (
              <PageLoader label="Carregando evolução..." />
            ) : points.length === 0 ? (
              <EmptyState message="Este exercício ainda não possui histórico de execução." />
            ) : (
              <div className="animate-in fade-in duration-300">
                <div
                  className={`h-80 w-full transition-opacity ${fetchingEvolution ? "opacity-60" : ""}`}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" vertical={false} />
                      <XAxis
                        dataKey="label"
                        stroke="#898781"
                        tick={{ fill: "#b4b4c3", fontSize: 12 }}
                        tickLine={false}
                        axisLine={{ stroke: "#2a2a35" }}
                      />
                      <YAxis
                        yAxisId="weight"
                        stroke={WEIGHT_COLOR}
                        tick={{ fill: "#b4b4c3", fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        width={44}
                        label={{
                          value: "kg",
                          angle: -90,
                          position: "insideLeft",
                          fill: "#898781",
                          fontSize: 12,
                        }}
                      />
                      <YAxis
                        yAxisId="repetitions"
                        orientation="right"
                        stroke={REPETITIONS_COLOR}
                        tick={{ fill: "#b4b4c3", fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        width={40}
                        allowDecimals={false}
                        label={{
                          value: "reps",
                          angle: 90,
                          position: "insideRight",
                          fill: "#898781",
                          fontSize: 12,
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#17171d",
                          border: "1px solid #2a2a35",
                          borderRadius: 12,
                          color: "#f8fafc",
                        }}
                        labelStyle={{ color: "#f8fafc", fontWeight: 600 }}
                      />
                      <Legend wrapperStyle={{ color: "#b4b4c3", fontSize: 12 }} />
                      <Line
                        yAxisId="weight"
                        type="monotone"
                        dataKey="weight"
                        name="Peso (kg)"
                        stroke={WEIGHT_COLOR}
                        strokeWidth={2}
                        dot={{ r: 4, fill: WEIGHT_COLOR }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        yAxisId="repetitions"
                        type="monotone"
                        dataKey="repetitions"
                        name="Repetições"
                        stroke={REPETITIONS_COLOR}
                        strokeWidth={2}
                        dot={{ r: 4, fill: REPETITIONS_COLOR }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <MetricCard
                    label="Maior carga registrada"
                    value={formatWeight(summary?.max_weight)}
                  />
                  <MetricCard
                    label="Maior número de repetições"
                    value={summary?.max_repetitions ?? "-"}
                  />
                  <MetricCard
                    label="Primeira execução"
                    value={formatDate(summary?.first_performed_at)}
                  />
                  <MetricCard
                    label="Última execução"
                    value={formatDate(summary?.last_performed_at)}
                  />
                  <MetricCard
                    label="Total de check-ins"
                    value={summary?.total_checkins ?? "-"}
                  />
                  <MetricCard
                    label="Evolução da carga"
                    value={formatPercentage(summary?.weight_evolution_percentage)}
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
