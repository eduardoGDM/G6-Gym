import {
  Bar,
  BarChart,
  CartesianGrid,
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
