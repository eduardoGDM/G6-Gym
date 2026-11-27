import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

import ConfirmDialog from "../../components/common/ConfirmDialog";
import { crudToast } from "../../components/common/crudToast";
import PageContainer from "../../components/common/PageContainer";
import TapeDivider from "../../components/ficha/TapeDivider";
import ErrorState from "../../components/loading/ErrorState";
import { useConfirmDialog } from "../../hooks/useConfirmDialog";
import { cn } from "../../lib/utils";
import workoutCheckinsService from "../../services/WorkoutCheckinsService";
import { formatDate } from "../../lib/format";

// A exclusão é definitiva e o check-in alimenta histórico, evolução e streak —
// por isso o aluno revalida tudo que perde antes de confirmar.
const AFFECTED_QUERY_KEYS = [
  ["student-history"],
  ["student-dashboard-summary"],
  ["student-dashboard-recent-workouts"],
  ["student-dashboard-evolution"],
  ["student-gamification-summary"],
  ["exercise-history"],
];

const formatNumber = (value) => Number(value).toLocaleString("pt-BR");

/**
 * Volume da sessão = soma de carga × repetições das séries que têm os dois
 * valores. É só leitura de tela: o backend guarda série por série, e nenhuma
 * regra depende deste total.
 */
function sessionTotals(checkin) {
  const exercises = checkin.exercises || [];
  let sets = 0;
  let volume = 0;

  exercises.forEach((item) => {
    (item.sets || []).forEach((set) => {
      sets += 1;

      if (set.performed_weight != null && set.performed_repetitions != null) {
        volume += Number(set.performed_weight) * Number(set.performed_repetitions);
      }
    });
  });

  return { exercises: exercises.length, sets, volume };
}

/** Rótulo de coluna da folha. */
function ColumnLabel({ children, className }) {
  return (
    <span className={cn("text-muted-foreground ficha-label", className)}>
      {children}
    </span>
  );
}

/** Valor executado: número na display, unidade em mono. */
function SetValue({ value, unit }) {
  if (value === null || value === undefined) {
    return <span className="text-[22px] text-muted-foreground ficha-display">—</span>;
  }

  return (
    <span className="text-[22px] ficha-display">
      {value}
      {unit ? (
        <span className="ml-1 text-[11px] font-medium text-muted-foreground ficha-mono">
          {unit}
        </span>
      ) : null}
    </span>
  );
}

const SET_GRID = "grid grid-cols-[2.25rem_1fr_1fr_1fr] items-end gap-x-3";

/**
 * Um exercício da folha: nome, grupo muscular e as séries executadas em linhas
 * de pauta, com os rótulos de coluna escritos uma única vez.
 */
function ExerciseSheet({ item, delay }) {
  const sets = item.sets || [];

  return (
    <section
      className="animate-rise border-t border-border pt-6"
      style={{ animationDelay: `${delay}ms` }}
    >
      {item.exercise?.muscle_group?.name ? (
        <p className="text-muted-foreground ficha-label">
          {item.exercise.muscle_group.name}
        </p>
      ) : null}

      <h2 className="mt-2 text-[clamp(1.375rem,2.6vw,1.75rem)] ficha-display">
        {item.exercise?.name || `Exercício #${item.exercise_id}`}
      </h2>

      {sets.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Nenhuma série registrada neste exercício.
        </p>
      ) : (
        <div className="mt-5">
          <div className={cn(SET_GRID, "border-b border-border pb-1.5")}>
            <ColumnLabel>Sér.</ColumnLabel>
            <ColumnLabel>Carga</ColumnLabel>
            <ColumnLabel>Reps</ColumnLabel>
            <ColumnLabel>Desc.</ColumnLabel>
          </div>

          <ul>
            {sets.map((set) => (
              <li
                key={set.id}
                className="border-b border-[color:var(--color-rule)] py-2.5"
              >
                <div className={SET_GRID}>
                  <span className="text-xs text-muted-foreground ficha-mono">
                    {String(set.set_number).padStart(2, "0")}
                  </span>
                  <SetValue value={set.performed_weight} unit="kg" />
                  <SetValue value={set.performed_repetitions} />
                  <SetValue value={set.performed_rest_time} unit="s" />
                </div>

                {set.notes ? (
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {set.notes}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      )}

      {item.notes ? (
        <p className="mt-3.5 text-sm text-muted-foreground">{item.notes}</p>
      ) : null}
    </section>
  );
}

const ACTION_LINK =
  "min-h-11 text-[11px] font-semibold uppercase tracking-[0.2em] underline decoration-dotted underline-offset-4 transition-colors ficha-mono";

/**
 * Detalhe de um check-in no tema "A Ficha": a folha preenchida.
 *
 * As séries deixam de ser um card por série (com os rótulos "Carga"/"Reps"
 * repetidos em cada um) e voltam a ser o que são numa ficha de papel: linhas
 * sob um cabeçalho de coluna escrito uma vez, com os números em tabular.
 */
export default function HistoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [checkin, setCheckin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const confirmDelete = useConfirmDialog();

  const loadCheckin = () => {
    let active = true;

    setLoading(true);
    setError(false);

    workoutCheckinsService
      .getById(id)
      .then((data) => {
        if (active) setCheckin(data);
      })
      .catch(() => {
        if (active) {
          setError(true);
          toast.error("Não foi possível carregar o check-in.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  };

  useEffect(() => loadCheckin(), [id]);

  const runDelete = async (checkinId) => {
    try {
      await crudToast(workoutCheckinsService.remove(checkinId), {
        action: "delete",
        entity: "Check-in",
      });

      await Promise.all(
        AFFECTED_QUERY_KEYS.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      );

      navigate("/student/history");
    } catch {
      // erro já exibido pelo crudToast
    }
  };

  const totals = checkin ? sessionTotals(checkin) : null;
  const comments = checkin?.comments || [];

  return (
    <PageContainer className="max-w-[1320px] lg:px-10">
      <div className="border-b-2 border-foreground pb-6 pt-8">
        <button
          type="button"
          onClick={() => navigate("/student/history")}
          className={cn(ACTION_LINK, "text-muted-foreground hover:text-foreground")}
        >
          ← O caderno
        </button>

        <p className="mt-5 text-muted-foreground ficha-label">
          {checkin
            ? `Folha de ${formatDate(checkin.performed_at)}`
            : "Folha de treino"}
        </p>

        <h1 className="mt-4 text-[clamp(2.5rem,6vw,4.5rem)] ficha-display">
          {checkin?.workout?.name || "Check-in"}
        </h1>

        {totals ? (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-x-10 gap-y-4">
            <p className="text-[13px] uppercase tracking-[0.16em] ficha-mono">
              {totals.exercises}
              <span className="text-muted-foreground">
                {" "}
                {totals.exercises === 1 ? "exercício" : "exercícios"} ·{" "}
              </span>
              {totals.sets}
              <span className="text-muted-foreground">
                {" "}
                {totals.sets === 1 ? "série" : "séries"}
              </span>
              {totals.volume > 0 ? (
                <>
                  <span className="text-muted-foreground"> · </span>
                  {formatNumber(totals.volume)}
                  <span className="text-muted-foreground"> kg de volume</span>
                </>
              ) : null}
            </p>

            <div className="flex flex-wrap items-center gap-7">
              {checkin.workout_id ? (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/student/workout/${checkin.workout_id}?checkin_id=${checkin.id}`,
                    )
                  }
                  className={cn(ACTION_LINK, "hover:text-primary")}
                >
                  Editar registro
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => confirmDelete.request(checkin.id)}
                disabled={confirmDelete.loading}
                className={cn(
                  ACTION_LINK,
                  "text-destructive hover:opacity-70 disabled:pointer-events-none disabled:opacity-40",
                )}
              >
                Excluir folha
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {loading ? (
        <div aria-hidden="true" className="mt-10 space-y-8">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="border-t border-border pt-6">
              <span className="block h-6 w-56 animate-pulse bg-muted" />
              <span className="mt-5 block h-3 w-full animate-pulse bg-muted" />
              <span className="mt-4 block h-3 w-full animate-pulse bg-muted" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="mt-10 border-2 border-border bg-card p-6">
          <ErrorState onRetry={loadCheckin} />
        </div>
      ) : !checkin ? (
        <div className="mt-10">
          <TapeDivider className="mb-7" />
          <p className="text-[19px] font-medium">Folha não encontrada</p>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Este check-in pode ter sido excluído. Volte ao caderno para ver o que
            está registrado.
          </p>
        </div>
      ) : (
        <>
          {/* Recado do personal: a única escrita de mão desta tela, e só quando
              existe de verdade — nunca texto inventado. */}
          {comments.length > 0 ? (
            <div className="mt-10 border-l-[3px] border-primary pl-5">
              <p className="text-muted-foreground ficha-label">
                Recado do personal
              </p>

              <ul className="mt-3 space-y-5">
                {comments.map((comment) => (
                  <li key={comment.id}>
                    <p className="max-w-[640px] text-[21px] leading-[1.45] ficha-hand">
                      {comment.body}
                    </p>
                    {comment.trainer?.name ? (
                      <p className="mt-1.5 text-muted-foreground ficha-label">
                        {comment.trainer.name}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {checkin.notes ? (
            <div className="mt-10">
              <p className="text-muted-foreground ficha-label">
                Observações da sessão
              </p>
              <p className="mt-2.5 max-w-[640px] text-[15px] leading-relaxed">
                {checkin.notes}
              </p>
            </div>
          ) : null}

          <div className="mt-11 space-y-9">
            {(checkin.exercises || []).map((item, index) => (
              <ExerciseSheet key={item.id} item={item} delay={index * 60} />
            ))}
          </div>
        </>
      )}

      <ConfirmDialog
        open={confirmDelete.open}
        title="Excluir check-in"
        description={
          checkin
            ? `Isso apaga definitivamente o check-in de ${formatDate(checkin.performed_at)}, com todos os exercícios e séries registrados. A exclusão não pode ser desfeita e seu personal deixa de ver este treino.`
            : undefined
        }
        confirmLabel="Excluir definitivamente"
        variant="destructive"
        loading={confirmDelete.loading}
        onConfirm={() => confirmDelete.confirm(runDelete)}
        onCancel={confirmDelete.cancel}
      />
    </PageContainer>
  );
}
