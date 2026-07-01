import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import toast from "react-hot-toast";
import * as yup from "yup";

import api from "../../../api/axios";
import PageContainer from "../../../components/common/PageContainer";
import PageTitle from "../../../components/common/PageTitle";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select } from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";

const schema = yup.object({
  name: yup.string().trim().required("O nome é obrigatório").max(255, "O nome deve ter no máximo 255 caracteres"),
  email: yup.string().trim().required("O e-mail é obrigatório").email("Digite um e-mail válido"),
  password: yup.string().trim().nullable().notRequired().when([], {
    is: () => !Boolean(window.location.pathname.includes("/editar")),
    then: (schema) => schema.required("A senha é obrigatória"),
    otherwise: (schema) => schema.notRequired(),
  }),
  cpf: yup.string().trim().required("O CPF é obrigatório").length(14, "O CPF deve ter 14 caracteres"),
  telefone: yup.string().trim().nullable().notRequired().max(20, "O telefone deve ter no máximo 20 caracteres"),
  data_nascimento: yup.string().trim().nullable().notRequired(),
  sexo: yup.string().trim().nullable().notRequired().oneOf(["Masculino", "Feminino", "Outro"], "Selecione um sexo válido"),
  altura: yup.number().transform((value, originalValue) => (originalValue === "" ? null : value)).nullable().notRequired().min(0, "A altura deve ser maior ou igual a 0").max(3, "A altura deve ser menor ou igual a 3"),
  peso_atual: yup.number().transform((value, originalValue) => (originalValue === "" ? null : value)).nullable().notRequired().min(0, "O peso deve ser maior ou igual a 0").max(500, "O peso deve ser menor ou igual a 500"),
  observacoes: yup.string().trim().nullable().notRequired(),
});

const SEXO_OPTIONS = [
  { value: "Masculino", label: "Masculino" },
  { value: "Feminino", label: "Feminino" },
  { value: "Outro", label: "Outro" },
];

export default function AlunosNewEdit() {
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
      telefone: "",
      data_nascimento: "",
      sexo: "",
      altura: "",
      peso_atual: "",
      observacoes: "",
    },
  });

  const pageTitle = useMemo(
    () => ({
      eyebrow: isEdit ? "Edição" : "Cadastro",
      title: isEdit ? "Editar aluno" : "Novo aluno",
      description: isEdit
        ? "Atualize os dados do aluno selecionado."
        : "Preencha os campos abaixo para criar um novo aluno.",
    }),
    [isEdit],
  );

  useEffect(() => {
    const carregarAluno = async () => {
      if (!isEdit) {
        setInitialLoading(false);
        return;
      }

      try {
        const { data } = await api.get(`/personal/perfil-alunos/${id}`);
        reset({
          name: data.usuario?.name || "",
          email: data.usuario?.email || "",
          password: "",
          cpf: data.cpf || "",
          telefone: data.telefone || "",
          data_nascimento: data.data_nascimento || "",
          sexo: data.sexo || "",
          altura: data.altura ?? "",
          peso_atual: data.peso_atual ?? "",
          observacoes: data.observacoes || "",
        });
      } catch (error) {
        toast.error("Não foi possível carregar os dados do aluno.");
      } finally {
        setInitialLoading(false);
      }
    };

    carregarAluno();
  }, [id, isEdit, reset]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const payload = {
        ...data,
        altura: data.altura === "" ? null : Number(data.altura),
        peso_atual: data.peso_atual === "" ? null : Number(data.peso_atual),
      };

      if (isEdit) {
        await api.put(`/personal/perfil-alunos/${id}`, payload);
        toast.success("Aluno atualizado com sucesso");
      } else {
        await api.post("/personal/perfil-alunos", payload);
        toast.success("Aluno criado com sucesso");
      }

      navigate("/personal/alunos");
    } catch (error) {
      const message = error.response?.data?.message || "Erro ao salvar o aluno";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <PageTitle {...pageTitle} />

        <Button variant="outline" className="w-full md:w-auto" onClick={() => navigate("/personal/alunos")}>
          <ArrowLeft className="h-4 w-4" />
          Voltar à lista
        </Button>
      </div>

      <Card className="border-border/80 bg-card/90">
        <CardHeader className="border-b border-border/80 px-6 py-6 sm:px-8">
          <CardTitle className="text-2xl">{isEdit ? "Editar aluno" : "Novo aluno"}</CardTitle>
          <CardDescription>
            {isEdit
              ? "Atualize as informações do aluno conforme as regras do controller."
              : "Preencha os campos necessários para cadastrar um novo aluno."}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 py-6 sm:px-8">
          {initialLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Carregando formulário...</div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input id="name" placeholder="Nome completo" {...register("name")} />
                  {errors.name ? <p className="text-sm text-red-400">{errors.name.message}</p> : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" placeholder="usuario@email.com" {...register("email")} />
                  {errors.email ? <p className="text-sm text-red-400">{errors.email.message}</p> : null}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input id="password" type="password" placeholder={isEdit ? "Deixe em branco para manter" : "Digite uma senha"} {...register("password")} />
                  {errors.password ? <p className="text-sm text-red-400">{errors.password.message}</p> : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input id="cpf" placeholder="000.000.000-00" {...register("cpf")} />
                  {errors.cpf ? <p className="text-sm text-red-400">{errors.cpf.message}</p> : null}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input id="telefone" placeholder="(00) 00000-0000" {...register("telefone")} />
                  {errors.telefone ? <p className="text-sm text-red-400">{errors.telefone.message}</p> : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_nascimento">Data de nascimento</Label>
                  <Input id="data_nascimento" type="date" {...register("data_nascimento")} />
                  {errors.data_nascimento ? <p className="text-sm text-red-400">{errors.data_nascimento.message}</p> : null}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sexo">Sexo</Label>
                  <Select id="sexo" {...register("sexo")}>
                    <option value="">Selecione</option>
                    {SEXO_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                  {errors.sexo ? <p className="text-sm text-red-400">{errors.sexo.message}</p> : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="altura">Altura</Label>
                  <Input id="altura" type="number" step="0.01" placeholder="1.75" {...register("altura")} />
                  {errors.altura ? <p className="text-sm text-red-400">{errors.altura.message}</p> : null}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="peso_atual">Peso atual</Label>
                  <Input id="peso_atual" type="number" step="0.01" placeholder="72.5" {...register("peso_atual")} />
                  {errors.peso_atual ? <p className="text-sm text-red-400">{errors.peso_atual.message}</p> : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea id="observacoes" placeholder="Observações do aluno" {...register("observacoes")} />
                  {errors.observacoes ? <p className="text-sm text-red-400">{errors.observacoes.message}</p> : null}
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-border/80 pt-6 md:flex-row md:justify-end">
                <Button type="button" variant="outline" onClick={() => navigate("/personal/alunos")}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading || isSubmitting}>
                  <Save className="h-4 w-4" />
                  {loading || isSubmitting ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar aluno"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
