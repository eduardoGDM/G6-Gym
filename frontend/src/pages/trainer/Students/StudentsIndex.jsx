import { Eye, FileText, Pencil, Plus, Trash2, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import ActionIconButton from "../../../components/common/ActionIconButton";
import { crudToast } from "../../../components/common/crudToast";
import DataTable from "../../../components/common/DataTable";
import PageContainer from "../../../components/common/PageContainer";
import PageTitle from "../../../components/common/PageTitle";
import { Button } from "../../../components/ui/button";
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
    if (!window.confirm("Deseja realmente excluir este aluno?")) {
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

  const columns = [
    {
      key: "name",
      label: "Nome",
      className: "text-sm font-medium text-foreground",
      render: (student) => (
        <>
          {student.user?.name || "—"}
          <p className="mt-0.5 text-xs font-normal text-muted-foreground sm:hidden">
            {student.user?.email || "—"}
          </p>
        </>
      ),
    },
    {
      key: "email",
      label: "E-mail",
      className: "hidden sm:table-cell",
      render: (student) => student.user?.email || "—",
    },
    {
      key: "cpf",
      label: "CPF",
      className: "hidden md:table-cell",
      render: (student) => student.cpf || "—",
    },
    {
      key: "actions",
      label: "Ações",
      render: (student) => (
        <div className="flex flex-wrap items-center gap-2">
          <ActionIconButton
            icon={Eye}
            tooltip="Visualizar"
            onClick={() => navigate(`/trainer/students/${student.id}`)}
          />
          <ActionIconButton
            icon={Pencil}
            tooltip="Editar"
            onClick={() => navigate(`/trainer/students/${student.id}/editar`)}
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
      ),
    },
  ];

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

      <DataTable
        className="mt-4"
        columns={columns}
        rows={students}
        loading={loading}
        error={error}
        onRetry={loadStudents}
        actionsCount={4}
        emptyIcon={UserRound}
        emptyTitle="Nenhum aluno cadastrado"
        emptyDescription="Cadastre novos alunos para acompanhar o desenvolvimento."
        emptyAction={
          <Button variant="outline" onClick={() => navigate("/trainer/students/new")}>
            <Plus className="h-4 w-4" />
            Cadastrar Aluno
          </Button>
        }
      />
    </PageContainer>
  );
}
