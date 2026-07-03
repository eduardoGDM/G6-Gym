import { yupResolver } from "@hookform/resolvers/yup";
import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";

import PageContainer from "../../../components/common/PageContainer";
import PageTitle from "../../../components/common/PageTitle";
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
import studentsService from "../../../services/StudentsService";

const schema = yup.object({
  name: yup
    .string()
    .trim()
    .required("O nome é obrigatório")
    .max(255, "O nome deve ter no máximo 255 caracteres"),
  email: yup
    .string()
    .trim()
    .required("O e-mail é obrigatório")
    .email("Digite um e-mail válido"),
  password: yup
    .string()
    .trim()
    .nullable()
    .notRequired()
    .when([], {
      is: () => !Boolean(window.location.pathname.includes("/editar")),
      then: (schema) => schema.required("A senha é obrigatória"),
      otherwise: (schema) => schema.notRequired(),
    }),
  cpf: yup
    .string()
    .trim()
    .required("O CPF é obrigatório")
    .length(14, "O CPF deve ter 14 caracteres"),
  phone: yup
    .string()
    .trim()
    .nullable()
    .notRequired()
    .max(20, "O telefone deve ter no máximo 20 caracteres"),
  birth_date: yup.string().trim().nullable().notRequired(),
  gender: yup
    .string()
    .trim()
    .nullable()
    .notRequired()
    .oneOf(["Masculino", "Feminino", "Outro"], "Selecione um sexo válido"),
  height: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable()
    .notRequired()
    .min(0, "A altura deve ser maior ou igual a 0")
    .max(3, "A altura deve ser menor ou igual a 3"),
  current_weight: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable()
    .notRequired()
    .min(0, "O peso deve ser maior ou igual a 0")
    .max(500, "O peso deve ser menor ou igual a 500"),
  observations: yup.string().trim().nullable().notRequired(),
});

const GENDER_OPTIONS = [
  { value: "Masculino", label: "Masculino" },
  { value: "Feminino", label: "Feminino" },
  { value: "Outro", label: "Outro" },
];

export default function StudentsNewEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      cpf: "",
      phone: "", // Alterado de telefone para phone
      birth_date: "", // Alterado de data_nascimento para birth_date
      gender: "",
      height: "",
      current_weight: "",
      observations: "", // Alterado de observacoes para observations
    },
  });

  const pageTitle = useMemo(
    () => ({
      eyebrow: isEdit ? "Edição" : "Cadastro",
      title: isEdit ? "Editar student" : "Novo student",
      description: isEdit
        ? "Atualize os dados do student selecionado."
        : "Preencha os campos abaixo para criar um novo student.",
    }),
    [isEdit],
  );

  useEffect(() => {
    const loadStudent = async () => {
      if (!isEdit) {
        setInitialLoading(false);
        return;
      }

      try {
        const data = await studentsService.getById(id);
        reset({
          name: data.user?.name || "",
          email: data.user?.email || "",
          password: "",
          cpf: data.cpf || "",
          phone: data.phone || "",
          birth_date: data.birth_date || "",
          gender: data.gender || "",
          height: data.height ?? "",
          current_weight: data.current_weight ?? "",
          observations: data.observations || "",
        });
      } catch (error) {
        toast.error("Não foi possível carregar os dados do student.");
      } finally {
        setInitialLoading(false);
      }
    };

    loadStudent();
  }, [id, isEdit, reset]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const payload = {
        ...data,
        height: data.height === "" ? null : Number(data.height),
        current_weight:
          data.current_weight === "" ? null : Number(data.current_weight),
      };

      if (isEdit) {
        await studentsService.update(id, payload);
        toast.success("Aluno atualizado com sucesso");
      } else {
        await studentsService.create(payload);
        toast.success("Aluno criado com sucesso");
      }

      navigate("/trainer/students");
    } catch (error) {
      const message =
        error.response?.data?.message || "Erro ao salvar o student";
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
          onClick={() => navigate("/trainer/students")}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar à lista
        </Button>
      </div>

      <Card className="border-border/80 bg-card/90">
        <CardHeader className="border-b border-border/80 px-6 py-6 sm:px-8">
          <CardTitle className="text-2xl">
            {isEdit ? "Editar Aluno" : "Novo Aluno"}
          </CardTitle>
          <CardDescription>
            {isEdit
              ? "Atualize as informações do aluno conforme as regras do controller."
              : "Preencha os campos necessários para cadastrar um novo aluno."}
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
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    placeholder="Nome completo"
                    {...register("name")}
                  />
                  {errors.name ? (
                    <p className="text-sm text-red-400">
                      {errors.name.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@email.com"
                    {...register("email")}
                  />
                  {errors.email ? (
                    <p className="text-sm text-red-400">
                      {errors.email.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={
                      isEdit
                        ? "Deixe em branco para manter"
                        : "Digite uma senha"
                    }
                    {...register("password")}
                  />
                  {errors.password ? (
                    <p className="text-sm text-red-400">
                      {errors.password.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    placeholder="000.000.000-00"
                    {...register("cpf")}
                  />
                  {errors.cpf ? (
                    <p className="text-sm text-red-400">{errors.cpf.message}</p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    placeholder="(00) 00000-0000"
                    {...register("phone")}
                  />
                  {errors.phone ? (
                    <p className="text-sm text-red-400">
                      {errors.phone.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birth_date">Data de nascimento</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    {...register("birth_date")}
                  />
                  {errors.birth_date ? (
                    <p className="text-sm text-red-400">
                      {errors.birth_date.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="gender">Sexo</Label>
                  <Select id="gender" {...register("gender")}>
                    <option value="">Selecione</option>
                    {GENDER_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                  {errors.gender ? (
                    <p className="text-sm text-red-400">
                      {errors.gender.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Altura</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.01"
                    placeholder="1.75"
                    {...register("height")}
                  />
                  {errors.height ? (
                    <p className="text-sm text-red-400">
                      {errors.height.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="current_weight">Peso atual</Label>
                  <Input
                    id="current_weight"
                    type="number"
                    step="0.01"
                    placeholder="72.5"
                    {...register("current_weight")}
                  />
                  {errors.current_weight ? (
                    <p className="text-sm text-red-400">
                      {errors.current_weight.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observations">Observações</Label>
                  <Textarea
                    id="observations"
                    placeholder="Observações do student"
                    {...register("observations")}
                  />
                  {errors.observations ? (
                    <p className="text-sm text-red-400">
                      {errors.observations.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-border/80 pt-6 md:flex-row md:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/trainer/students")}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading || isSubmitting}>
                  <Save className="h-4 w-4" />
                  {loading || isSubmitting
                    ? "Salvando..."
                    : isEdit
                      ? "Salvar alterações"
                      : "Criar student"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
