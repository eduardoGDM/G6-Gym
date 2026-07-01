import { yupResolver } from "@hookform/resolvers/yup";
import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";

import api from "../../api/axios";
import PageContainer from "../../components/common/PageContainer";
import PageTitle from "../../components/common/PageTitle";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";

const schema = yup.object({
  grupo_muscular_id: yup.string().required("Selecione um grupo muscular"),
  nome: yup
    .string()
    .trim()
    .required("O nome é obrigatório")
    .max(255, "O nome deve ter no máximo 255 caracteres"),
  descricao: yup.string().trim().nullable().notRequired(),
  equipamento: yup
    .string()
    .trim()
    .nullable()
    .notRequired()
    .max(255, "O equipamento deve ter no máximo 255 caracteres"),
  video_url: yup
    .string()
    .trim()
    .nullable()
    .notRequired()
    .url("Digite uma URL válida"),
});

export default function ExerciciosNewEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [initialLoading, setInitialLoading] = useState(isEdit);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      grupo_muscular_id: "",
      nome: "",
      descricao: "",
      equipamento: "",
      video_url: "",
    },
  });

  const pageTitle = useMemo(
    () => ({
      eyebrow: isEdit ? "Edição" : "Cadastro",
      title: isEdit ? "Editar exercício" : "Novo exercício",
      description: isEdit
        ? "Atualize os dados do exercício selecionado."
        : "Preencha os campos abaixo para criar um novo exercício.",
    }),
    [isEdit],
  );

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [{ data: gruposData }, response] = await Promise.all([
          api.get("/personal/exercicios"),
          isEdit
            ? api.get(`/personal/exercicios/${id}`)
            : Promise.resolve(null),
        ]);

        const grupoOptions = Array.isArray(gruposData)
          ? gruposData
          : gruposData?.data || [];
        const gruposMusculares = grupoOptions
          .map((item) => item.grupoMuscular)
          .filter(Boolean);

        const uniqueGroups = Array.from(
          new Map(gruposMusculares.map((item) => [item.id, item])).values(),
        );
        setGroups(uniqueGroups);

        if (isEdit && response?.data) {
          reset({
            grupo_muscular_id: String(response.data.grupo_muscular_id || ""),
            nome: response.data.nome || "",
            descricao: response.data.descricao || "",
            equipamento: response.data.equipamento || "",
            video_url: response.data.video_url || "",
          });
        }
      } catch (error) {
        toast.error("Não foi possível carregar os dados do exercício.");
      } finally {
        setInitialLoading(false);
      }
    };

    carregarDados();
  }, [id, isEdit, reset]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const payload = {
        ...data,
        grupo_muscular_id: Number(data.grupo_muscular_id),
      };

      if (isEdit) {
        await api.put(`/personal/exercicios/${id}`, payload);
        toast.success("Exercício atualizado com sucesso");
      } else {
        await api.post("/personal/exercicios", payload);
        toast.success("Exercício criado com sucesso");
      }

      navigate("/personal/exercicios");
    } catch (error) {
      const message =
        error.response?.data?.message || "Erro ao salvar o exercício";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <PageTitle {...pageTitle} />

        <Button
          variant="outline"
          className="w-full md:w-auto"
          onClick={() => navigate("/personal/exercicios")}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar à lista
        </Button>
      </div>

      <Card className="border-border/80 bg-card/90">
        <CardHeader className="border-b border-border/80 px-6 py-6 sm:px-8">
          <CardTitle className="text-2xl">
            {isEdit ? "Editar exercício" : "Novo exercício"}
          </CardTitle>
          <CardDescription>
            {isEdit
              ? "Atualize as informações conforme o controller do backend."
              : "Preencha os campos necessários para cadastrar um novo exercício."}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 py-6 sm:px-8">
          {initialLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Carregando formulário...
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="grupo_muscular_id">Grupo muscular</Label>
                  <Select
                    id="grupo_muscular_id"
                    {...register("grupo_muscular_id")}
                  >
                    <option value="">Selecione</option>
                    {groups.map((grupo) => (
                      <option key={grupo.id} value={grupo.id}>
                        {grupo.nome}
                      </option>
                    ))}
                  </Select>
                  {errors.grupo_muscular_id ? (
                    <p className="text-sm text-red-400">
                      {errors.grupo_muscular_id.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    placeholder="Nome do exercício"
                    {...register("nome")}
                  />
                  {errors.nome ? (
                    <p className="text-sm text-red-400">
                      {errors.nome.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="equipamento">Equipamento</Label>
                  <Input
                    id="equipamento"
                    placeholder="Equipamento utilizado"
                    {...register("equipamento")}
                  />
                  {errors.equipamento ? (
                    <p className="text-sm text-red-400">
                      {errors.equipamento.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video_url">Video URL</Label>
                  <Input
                    id="video_url"
                    placeholder="https://"
                    {...register("video_url")}
                  />
                  {errors.video_url ? (
                    <p className="text-sm text-red-400">
                      {errors.video_url.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  placeholder="Descreva o exercício"
                  {...register("descricao")}
                />
                {errors.descricao ? (
                  <p className="text-sm text-red-400">
                    {errors.descricao.message}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-3 border-t border-border/80 pt-6 md:flex-row md:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/personal/exercicios")}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading || isSubmitting}>
                  <Save className="h-4 w-4" />
                  {loading || isSubmitting
                    ? "Salvando..."
                    : isEdit
                      ? "Salvar alterações"
                      : "Criar exercício"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
