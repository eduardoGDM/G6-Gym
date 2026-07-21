import { Eye, FileText, Pencil, Plus, Trash2, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import ActionIconButton from "../../../components/common/ActionIconButton";
import { crudToast } from "../../../components/common/crudToast";
import PageContainer from "../../../components/common/PageContainer";
import PageTitle from "../../../components/common/PageTitle";
import ErrorState from "../../../components/loading/ErrorState";
import TableSkeleton from "../../../components/loading/TableSkeleton";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import studentsService from "../../../services/StudentsService";

export default function StudentsIndex() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [generatingSheetId, setGeneratingSheetId] = useState(null);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(false);
      const data = await studentsService.getAll();
      setStudents(data || []);
    } catch {
      setError(true);
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

  const handleGenerateSheet = async (student) => {
    try {
      setGeneratingSheetId(student.id);
      const pdfBlob = await studentsService.generateWorkoutSheet(student.id);

      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ficha-treino-${student.user?.name || student.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error("Este aluno não possui treinos vinculados a você.");
      } else if (error.response?.status === 404) {
        toast.error("Aluno não encontrado.");
      } else {
        toast.error("Não foi possível gerar a ficha de treino.");
      }
    } finally {
      setGeneratingSheetId(null);
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
          <CardContent className="overflow-x-auto p-0">
            <TableSkeleton
              columns={[
                "Nome",
                { label: "E-mail", className: "hidden sm:table-cell" },
                { label: "CPF", className: "hidden md:table-cell" },
              ]}
              actionsCount={4}
              rows={6}
            />
          </CardContent>
        ) : error ? (
          <CardContent>
            <ErrorState onRetry={loadStudents} />
          </CardContent>
        ) : students.length === 0 ? (
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center animate-in fade-in duration-300">
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
              onClick={() => navigate("/trainer/students/new")}
            >
              <Plus className="h-4 w-4" />
              Cadastrar Aluno
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
                  <th className="hidden px-4 py-3 text-left text-sm font-semibold text-foreground sm:table-cell">
                    E-mail
                  </th>
                  <th className="hidden px-4 py-3 text-left text-sm font-semibold text-foreground md:table-cell">
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
                      <p className="mt-0.5 text-xs font-normal text-muted-foreground sm:hidden">
                        {student.user?.email || "—"}
                      </p>
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-muted-foreground sm:table-cell">
                      {student.user?.email || "—"}
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-muted-foreground md:table-cell">
                      {student.cpf || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <ActionIconButton
                          icon={Eye}
                          tooltip="Visualizar"
                          onClick={() =>
                            navigate(`/trainer/students/${student.id}`)
                          }
                        />
                        <ActionIconButton
                          icon={Pencil}
                          tooltip="Editar"
                          onClick={() =>
                            navigate(`/trainer/students/${student.id}/editar`)
                          }
                        />
                        <ActionIconButton
                          icon={FileText}
                          tooltip="Gerar ficha"
                          onClick={() => handleGenerateSheet(student)}
                          loading={generatingSheetId === student.id}
                        />
                        <ActionIconButton
                          icon={Trash2}
                          tooltip="Excluir"
                          color="destructive"
                          onClick={() => handleDelete(student.id)}
                          loading={deletingId === student.id}
                        />
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
