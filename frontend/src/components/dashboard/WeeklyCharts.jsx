import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardTitle } from "../ui/card";

// Cores alinhadas ao tema vermelho (mesmos tokens, em hex para o recharts).
const GRID = "#262b36";
const TICK = "#a1a7b3";
const PRIMARY = "#ef4444"; // treino
const DIET = "#f59e0b"; // dieta (aviso/laranja)
const SLEEP = "#3b82f6"; // sono (info/azul)

const TOOLTIP_STYLE = {
  background: "#181b22",
  border: "1px solid #262b36",
  borderRadius: 12,
  color: "#f9fafb",
  fontSize: 12,
};

function ChartCard({ title, subtitle, loading, delay = 0, children }) {
  return (
    <Card
      className="animate-in fade-in slide-in-from-bottom-2 flex flex-col p-5 duration-300"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "backwards" }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <CardTitle className="text-base">{title}</CardTitle>
        {subtitle ? (
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        ) : null}
      </div>

      <div className="mt-4 h-64 w-full sm:h-72">
        {loading ? (
          <div className="h-full w-full animate-pulse rounded-lg bg-muted/50" />
        ) : (
          children
        )}
      </div>
    </Card>
  );
}

/** Barras: check-ins de treino por dia da semana corrente. */
export function WeeklyWorkoutChart({ data = [], loading = false, delay = 0 }) {
  return (
    <ChartCard
      title="Check-ins de treino"
      subtitle="Esta semana"
      loading={loading}
      delay={delay}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: -6, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
          <XAxis
            dataKey="day"
            stroke={GRID}
            tick={{ fill: TICK, fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: GRID }}
          />
          <YAxis
            stroke={GRID}
            tick={{ fill: TICK, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={28}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            contentStyle={TOOLTIP_STYLE}
            labelStyle={{ color: "#f9fafb", fontWeight: 600 }}
          />
          <Bar
            dataKey="count"
            name="Check-ins"
            fill={PRIMARY}
            radius={[6, 6, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

/** Linhas: média das notas de dieta e sono por dia. */
export function DietSleepChart({ data = [], loading = false, delay = 0 }) {
  return (
    <ChartCard
      title="Dieta e sono"
      subtitle="Média por dia (0–10)"
      loading={loading}
      delay={delay}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -6, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
          <XAxis
            dataKey="day"
            stroke={GRID}
            tick={{ fill: TICK, fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: GRID }}
          />
          <YAxis
            stroke={GRID}
            tick={{ fill: TICK, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={28}
            domain={[0, 10]}
            ticks={[0, 5, 10]}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            labelStyle={{ color: "#f9fafb", fontWeight: 600 }}
          />
          <Legend wrapperStyle={{ color: TICK, fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="sleep_avg"
            name="Sono"
            stroke={SLEEP}
            strokeWidth={2}
            connectNulls={false}
            dot={{ r: 3, fill: SLEEP }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="diet_avg"
            name="Dieta"
            stroke={DIET}
            strokeWidth={2}
            connectNulls={false}
            dot={{ r: 3, fill: DIET }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
