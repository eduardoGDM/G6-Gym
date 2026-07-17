import { Eye, Pencil, Plus, Trash2, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import PageContainer from "../../../components/common/PageContainer";
import { crudToast } from "../../../components/common/crudToast";
import PageLoader from "../../../components/common/PageLoader";
import PageTitle from "../../../components/common/PageTitle";
import Spinner from "../../../components/common/Spinner";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import studentsService from "../../../services/StudentsService";

export default function StudentsIndex() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await studentsService.getAll();
      setStudents(data || []);
    } catch (error) {
      toast.error("Não foi possível carregar os alunos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Deseja realmente excluir este student?")) {
      return;
    }

    try {
      setDeletingId(id);
      await crudToast(studentsService.remove(id), {
        action: "delete",
        entity: "Aluno",
      });
      await loadStudents();
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
          eyebrow="Gestão"
          title="Alunos"
          description="Gerencie os alunos com uma visão rápida e organizada."
        />

        <Button
          className="w-full md:w-auto"
          onClick={() => navigate("/trainer/students/new")}
        >
          <Plus className="h-4 w-4" />
          Novo Aluno
        </Button>
      </div>

      <Card className="mt-4 border-border/80 bg-card/80">
        {loading ? (
          <CardContent className="py-4">
            <PageLoader label="Carregando alunos..." />
          </CardContent>
        ) : students.length === 0 ? (
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center animate-in fade-in duration-300">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <UserRound className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                Nenhum student cadastrado
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Cadastre novos alunos para acompanhar o desenvolvimento.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/trainer/students/new")}
            >
              <Plus className="h-4 w-4" />
              Cadastrar student
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
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className="transition-colors hover:bg-muted/10"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {student.user?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {student.user?.email || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {student.cpf || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/trainer/students/${student.id}`)
                          }
                        >
                          <Eye className="h-4 w-4" />
                          Visualizar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/trainer/students/${student.id}/editar`)
                          }
                        >
                          <Pencil className="h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(student.id)}
                          disabled={deletingId === student.id}
                        >
                          {deletingId === student.id ? (
                            <Spinner className="h-4 w-4" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          {deletingId === student.id
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
