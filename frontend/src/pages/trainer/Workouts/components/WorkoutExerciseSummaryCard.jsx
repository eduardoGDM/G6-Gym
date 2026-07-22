import {
  ADVANCED_TECHNIQUE_DESCRIPTIONS,
  buildConfigSummary,
  formatRirTag,
  formatWeight,
} from "../utils";

// Cor do marcador de cada série, usando apenas tokens da paleta atual.
const TYPE_DOT = {
  Aquecimento: "bg-muted-foreground/50",
  Reconhecimento: "bg-secondary",
  Válida: "bg-primary",
};

// Rótulo da coluna exibido apenas quando as colunas estão empilhadas
// (tablet/mobile). No desktop o cabeçalho da lista já rotula as colunas.
function ColumnLabel({ children }) {
  return (
    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground xl:hidden">
      {children}
    </p>
  );
}

// Linha "rótulo — valor" do resumo técnico. As informações prioritárias
// (emphasis) usam a cor principal do texto; as secundárias ficam mais discretas.
function SummaryRow({ label, value, emphasis = false }) {
  if (!value) return null;

  return (
    <>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd
        className={
          emphasis
            ? "text-sm font-semibold text-foreground"
            : "text-sm text-muted-foreground"
        }
      >
        {value}
      </dd>
    </>
  );
}

export default function WorkoutExerciseSummaryCard({ exercise }) {
  const series = [...(exercise.series || [])].sort((a, b) => a.order - b.order);
  const config = buildConfigSummary(series);

  const subtitle = [
    exercise.exercise?.muscle_group?.name,
    exercise.exercise?.equipment,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="rounded-2xl border border-border/70 bg-background/60 p-4 sm:p-5">
      <div className="grid gap-x-6 gap-y-5 md:grid-cols-2 xl:grid-cols-12">
        {/* Coluna 1 — Exercício */}
        <div className="xl:col-span-3">
          <ColumnLabel>Exercício</ColumnLabel>
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
              {exercise.order}
            </span>
            <div className="min-w-0">
              <p className="font-semibold leading-tight text-foreground">
                {exercise.exercise?.name || "—"}
              </p>
              {subtitle ? (
                <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>
          </div>
        </div>

        {/* Coluna 2 — Configuração */}
        <div className="md:border-l md:border-border/60 md:pl-6 xl:col-span-3">
          <ColumnLabel>Configuração</ColumnLabel>
          {series.length === 0 ? (
            <p className="text-sm text-muted-foreground/70">Sem séries.</p>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {config.count} {config.count === 1 ? "série" : "séries"}
                </span>
                {config.predominant ? (
                  <span className="rounded-md bg-primary/12 px-2 py-0.5 text-xs font-medium text-primary">
                    {config.predominant}
                  </span>
                ) : null}
              </div>

              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
                <SummaryRow
                  label="Repetições"
                  value={config.repetitions.join(" · ")}
                  emphasis
                />
                <SummaryRow label="RIR" value={config.rir.join(" · ")} emphasis />
                <SummaryRow
                  label="Técnica"
                  value={config.techniques.join(" · ")}
                  emphasis
                />
                <SummaryRow label="Cadência" value={config.cadence.join(" · ")} />
                <SummaryRow label="Descanso" value={config.rest.join(" · ")} />
                <SummaryRow label="Tempo" value={config.tempo.join(" · ")} />
              </dl>
            </div>
          )}
        </div>

        {/* Coluna 3 — Detalhamento das séries */}
        <div className="md:col-span-2 md:border-t md:border-border/60 md:pt-5 xl:col-span-4 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
          <ColumnLabel>Séries</ColumnLabel>
          {series.length === 0 ? (
            <p className="text-sm text-muted-foreground/70">
              Nenhuma série detalhada para este exercício.
            </p>
          ) : (
            <ol className="space-y-2">
              {series.map((set, index) => {
                const weight = formatWeight(set.weight);
                const rir = formatRirTag(set.rir);

                return (
                  <li key={set.id} className="flex items-start gap-2.5 text-sm">
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        TYPE_DOT[set.type] || "bg-primary"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="leading-snug text-foreground">
                        <span className="font-semibold">
                          {set.type || `Série ${index + 1}`}
                        </span>
                        {set.repetitions ? (
                          <span> — {set.repetitions} reps</span>
                        ) : null}
                        {weight ? (
                          <span className="text-muted-foreground"> · {weight}</span>
                        ) : null}
                        {rir ? (
                          <span className="text-muted-foreground"> ({rir})</span>
                        ) : null}
                      </p>
                      {set.advanced_technique ? (
                        <span className="mt-1 inline-block rounded bg-primary/12 px-1.5 py-0.5 text-[11px] font-medium text-primary">
                          {set.advanced_technique}
                        </span>
                      ) : null}
                      {set.notes ? (
                        <p className="mt-1 text-xs italic leading-snug text-muted-foreground">
                          {set.notes}
                        </p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          {config.techniques.length > 0 ? (
            <div className="mt-3 space-y-2 rounded-xl border border-border/60 bg-card/40 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                Técnica Avançada
              </p>
              <ul className="space-y-1.5">
                {config.techniques.map((technique) => (
                  <li key={technique}>
                    <span className="text-xs font-semibold text-foreground">
                      {technique}
                    </span>
                    {ADVANCED_TECHNIQUE_DESCRIPTIONS[technique] ? (
                      <span className="text-xs text-muted-foreground">
                        {" — "}
                        {ADVANCED_TECHNIQUE_DESCRIPTIONS[technique]}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        {/* Coluna 4 — Observações */}
        <div className="md:col-span-2 md:border-t md:border-border/60 md:pt-5 xl:col-span-2 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
          <ColumnLabel>Observações</ColumnLabel>
          {exercise.notes ? (
            <p className="text-sm leading-6 text-foreground">{exercise.notes}</p>
          ) : (
            <p className="text-sm text-muted-foreground/70">Nenhuma observação.</p>
          )}
        </div>
      </div>
    </div>
  );
}
