import { Dumbbell, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import api from "../../../api/axios";
import PageContainer from "../../../components/common/PageContainer";
import PageTitle from "../../../components/common/PageTitle";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";

export default function ExerciciosIndex() {
  const navigate = useNavigate();
  const [exercicios, setExercicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const carregarExercicios = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/personal/exercicios");
      setExercicios(data || []);
    } catch (error) {
      toast.error("Não foi possível carregar os exercícios.", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarExercicios();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Deseja realmente excluir este exercício?")) {
      return;
    }

    try {
      setDeletingId(id);
      await api.delete(`/personal/exercicios/${id}`);
      toast.success("Exercício removido com sucesso");
      await carregarExercicios();
    } catch (error) {
      const message =
        error.response?.data?.message || "Erro ao excluir o exercício";
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <PageTitle
          eyebrow="Catálogo"
          title="Exercícios"
          description="Mantenha sua base de exercícios organizada e fácil de consultar."
        />

        <Button
          className="w-full md:w-auto"
          onClick={() => navigate("/personal/exercicios/novo")}
        >
          <Plus className="h-4 w-4" />
          Novo exercício
        </Button>
      </div>

      <Card className="mt-4 border-border/80 bg-card/80">
        {loading ? (
          <CardContent className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            Carregando exercícios...
          </CardContent>
        ) : exercicios.length === 0 ? (
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/15 text-secondary">
              <Dumbbell className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                Nenhum exercício cadastrado
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Adicione exercícios para montar treinos mais completos.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/personal/exercicios/novo")}
            >
              <Plus className="h-4 w-4" />
              Cadastrar exercício
            </Button>
          </CardContent>
        ) : (
          <CardContent className="overflow-x-auto p-0">
            <table className="min-w-full divide-y divide-border/70">
              <thead className="bg-muted/30">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Nome
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Grupo muscular
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Equipamento
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 bg-card/70">
                {exercicios.map((exercicio) => (
                  <tr
                    key={exercicio.id}
                    className="transition-colors hover:bg-muted/10"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {exercicio.nome}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {exercicio.grupoMuscular?.nome || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {exercicio.equipamento || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/personal/exercicios/${exercicio.id}`)
                          }
                        >
                          <Eye className="h-4 w-4" />
                          Visualizar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(
                              `/personal/exercicios/${exercicio.id}/editar`,
                            )
                          }
                        >
                          <Pencil className="h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(exercicio.id)}
                          disabled={deletingId === exercicio.id}
                        >
                          <Trash2 className="h-4 w-4" />
                          {deletingId === exercicio.id
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
