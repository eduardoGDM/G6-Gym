import { Eye, Pencil, Plus, Trash2, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import api from "../../../api/axios";
import PageContainer from "../../../components/common/PageContainer";
import PageTitle from "../../../components/common/PageTitle";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";

export default function AlunosIndex() {
  const navigate = useNavigate();
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const carregarAlunos = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/personal/perfil-alunos");
      setAlunos(data || []);
    } catch (error) {
      toast.error("Não foi possível carregar os alunos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarAlunos();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Deseja realmente excluir este aluno?")) {
      return;
    }

    try {
      setDeletingId(id);
      await api.delete(`/personal/perfil-alunos/${id}`);
      toast.success("Aluno removido com sucesso");
      await carregarAlunos();
    } catch (error) {
      const message = error.response?.data?.message || "Erro ao excluir o aluno";
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <PageTitle
          eyebrow="Gestão"
          title="Alunos"
          description="Gerencie os alunos com uma visão rápida e organizada."
        />

        <Button
          className="w-full md:w-auto"
          onClick={() => navigate("/personal/alunos/novo")}
        >
          <Plus className="h-4 w-4" />
          Novo aluno
        </Button>
      </div>

      <Card className="mt-4 border-border/80 bg-card/80">
        {loading ? (
          <CardContent className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            Carregando alunos...
          </CardContent>
        ) : alunos.length === 0 ? (
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <UserRound className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Nenhum aluno cadastrado</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Cadastre novos alunos para acompanhar o desenvolvimento.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/personal/alunos/novo")}
            >
              <Plus className="h-4 w-4" />
              Cadastrar aluno
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
                    E-mail
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    CPF
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 bg-card/70">
                {alunos.map((aluno) => (
                  <tr
                    key={aluno.id}
                    className="transition-colors hover:bg-muted/10"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {aluno.usuario?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {aluno.usuario?.email || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {aluno.cpf || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/personal/alunos/${aluno.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                          Visualizar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/personal/alunos/${aluno.id}/editar`)}
                        >
                          <Pencil className="h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(aluno.id)}
                          disabled={deletingId === aluno.id}
                        >
                          <Trash2 className="h-4 w-4" />
                          {deletingId === aluno.id ? "Excluindo..." : "Excluir"}
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
