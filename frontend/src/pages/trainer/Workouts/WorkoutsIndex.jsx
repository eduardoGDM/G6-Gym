import { Dumbbell, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { crudToast } from "../../../components/common/crudToast";
import PageContainer from "../../../components/common/PageContainer";
import PageLoader from "../../../components/common/PageLoader";
import PageTitle from "../../../components/common/PageTitle";
import Spinner from "../../../components/common/Spinner";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import workoutsService from "../../../services/WorkoutsService";

export default function WorkoutsIndex() {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      const data = await workoutsService.getAll();
      setWorkouts(data || []);
    } catch (error) {
      toast.error("Não foi possível carregar os treinos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Deseja realmente excluir este treino?")) {
      return;
    }

    try {
      setDeletingId(id);
      await crudToast(workoutsService.remove(id), {
        action: "delete",
        entity: "Treino",
      });
      await loadWorkouts();
    } catch {
      // erro já exibido pelo crudToast
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <PageTitle
          eyebrow="Planejamento"
          title="Treinos"
          description="Monte e gerencie os treinos dos alunos."
        />

        <Button
          className="w-full md:w-auto"
          onClick={() => navigate("/trainer/workouts/new")}
        >
          <Plus className="h-4 w-4" />
          Novo treino
        </Button>
      </div>

      <Card className="mt-4 border-border/80 bg-card/80">
        {loading ? (
          <CardContent className="py-4">
            <PageLoader label="Carregando treinos..." />
          </CardContent>
        ) : workouts.length === 0 ? (
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center animate-in fade-in duration-300">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Dumbbell className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                Nenhum treino cadastrado
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Cadastre um novo treino para começar a organizar as rotinas.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/trainer/workouts/new")}
            >
              <Plus className="h-4 w-4" />
              Cadastrar treino
            </Button>
          </CardContent>
        ) : (
          <CardContent className="animate-in fade-in duration-300 overflow-x-auto p-0">
            <table className="min-w-full divide-y divide-border/70">
              <thead className="bg-muted/30">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Nome
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Aluno
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Exercícios
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 bg-card/70">
                {workouts.map((workout) => (
                  <tr
                    key={workout.id}
                    className="transition-colors hover:bg-muted/10"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {workout.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {workout.student_profile?.user?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {workout.workout_exercises?.length || 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {workout.active ? "Ativo" : "Inativo"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/trainer/workouts/${workout.id}`)
                          }
                        >
                          <Eye className="h-4 w-4" />
                          Visualizar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/trainer/workouts/${workout.id}/edit`)
                          }
                        >
                          <Pencil className="h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(workout.id)}
                          disabled={deletingId === workout.id}
                        >
                          {deletingId === workout.id ? (
                            <Spinner className="h-4 w-4" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          {deletingId === workout.id
                            ? "Excluindo..."
                            : "Excluir"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        )}
      </Card>
    </PageContainer>
  );
}
