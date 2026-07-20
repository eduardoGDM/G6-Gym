import { yupResolver } from "@hookform/resolvers/yup";
import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

import PageContainer from "../../../components/common/PageContainer";
import { crudToast } from "../../../components/common/crudToast";
import PageTitle from "../../../components/common/PageTitle";
import Spinner from "../../../components/common/Spinner";
import FormSkeleton from "../../../components/loading/FormSkeleton";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select } from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import exercisesService from "../../../services/ExercisesService";
import muscleGroupsService from "../../../services/MuscleGroupsService";
import { exerciseSchema } from "./utils";

export default function ExercisesNewEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(exerciseSchema),
    defaultValues: {
      muscle_group_id: "",
      name: "",
      description: "",
      equipment: "",
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
    const loadData = async () => {
      try {
        const [muscleGroups, exercise] = await Promise.all([
          muscleGroupsService.getAll(),
          isEdit ? exercisesService.getById(id) : Promise.resolve(null),
        ]);

        setGroups(muscleGroups || []);

        if (isEdit && exercise) {
          reset({
            muscle_group_id: String(exercise.muscle_group_id || ""),
            name: exercise.name || "",
            description: exercise.description || "",
            equipment: exercise.equipment || "",
            video_url: exercise.video_url || "",
          });
        }
      } catch (error) {
        toast.error("Não foi possível carregar os dados do exercício.");
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, [id, isEdit, reset]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const emptyToNull = (value) => (value === "" ? null : value);

      const payload = {
        muscle_group_id: Number(data.muscle_group_id),
        name: data.name,
        description: emptyToNull(data.description),
        equipment: emptyToNull(data.equipment),
        video_url: emptyToNull(data.video_url),
      };

      const request = isEdit
        ? exercisesService.update(id, payload)
        : exercisesService.create(payload);

      await crudToast(request, {
        action: isEdit ? "update" : "create",
        entity: "Exercício",
        onError: (error) => {
          const validationErrors = error.response?.data?.errors;

          if (validationErrors) {
            Object.entries(validationErrors).forEach(([field, messages]) => {
              setError(field, { type: "server", message: messages[0] });
            });
          }
        },
      });

      navigate("/trainer/exercises");
    } catch {
      // erro já exibido pelo crudToast
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
          onClick={() => navigate("/trainer/exercises")}
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
              ? "Atualize as informações do exercício conforme as regras do controller."
              : "Preencha os campos necessários para cadastrar um novo exercício."}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 py-6 sm:px-8">
          {initialLoading ? (
            <FormSkeleton fields={4} columns={2} />
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="muscle_group_id">Grupo muscular</Label>
                  <Select id="muscle_group_id" {...register("muscle_group_id")}>
                    <option value="">Selecione</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </Select>
                  {errors.muscle_group_id ? (
                    <p className="text-sm text-red-400">
                      {errors.muscle_group_id.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    placeholder="Nome do exercício"
                    {...register("name")}
                  />
                  {errors.name ? (
                    <p className="text-sm text-red-400">
                      {errors.name.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="equipment">Equipamento</Label>
                  <Input
                    id="equipment"
                    placeholder="Equipamento utilizado"
                    {...register("equipment")}
                  />
                  {errors.equipment ? (
                    <p className="text-sm text-red-400">
                      {errors.equipment.message}
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
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o exercício"
                  {...register("description")}
                />
                {errors.description ? (
                  <p className="text-sm text-red-400">
                    {errors.description.message}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-3 border-t border-border/80 pt-6 md:flex-row md:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/trainer/exercises")}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading || isSubmitting}>
                  {loading || isSubmitting ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
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
