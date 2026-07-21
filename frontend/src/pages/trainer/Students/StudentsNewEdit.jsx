import { yupResolver } from "@hookform/resolvers/yup";
import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

import { crudToast } from "../../../components/common/crudToast";
import PageContainer from "../../../components/common/PageContainer";
import PageTitle from "../../../components/common/PageTitle";
import Spinner from "../../../components/common/Spinner";
import { Field } from "../../../components/forms/Field";
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
import { Select } from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import studentsService from "../../../services/StudentsService";
import AnamnesisSection from "./components/AnamnesisSection";
import {
  formatCpf,
  formatDecimal,
  formatPhone,
  getTodayISO,
  studentSchema,
} from "./utils";

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
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(studentSchema),
    context: { isEdit },
    defaultValues: {
      name: "",
      email: "",
      password: "",
      cpf: "",
      phone: "",
      birth_date: "",
      gender: "",
      height: "",
      current_weight: "",
      observations: "",
    },
  });

  const cpfField = register("cpf");
  const phoneField = register("phone");
  const heightField = register("height");
  const weightField = register("current_weight");
  const todayISO = getTodayISO();

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
        toast.error("Não foi possível carregar os dados do aluno.");
      } finally {
        setInitialLoading(false);
      }
    };

    loadStudent();
  }, [id, isEdit, reset]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const emptyToNull = (value) => (value === "" ? null : value);

      const payload = {
        name: data.name,
        email: data.email,
        cpf: data.cpf,
        phone: emptyToNull(data.phone),
        birth_date: emptyToNull(data.birth_date),
        gender: emptyToNull(data.gender),
        height: data.height,
        current_weight: data.current_weight,
        observations: emptyToNull(data.observations),
      };

      if (!isEdit || data.password) {
        payload.password = data.password;
      }

      const request = isEdit
        ? studentsService.update(id, payload)
        : studentsService.create(payload);

      await crudToast(request, {
        action: isEdit ? "update" : "create",
        entity: "Aluno",
        onError: (error) => {
          const validationErrors = error.response?.data?.errors;

          if (validationErrors) {
            Object.entries(validationErrors).forEach(([field, messages]) => {
              setError(field, { type: "server", message: messages[0] });
            });
          }
        },
      });

      navigate("/trainer/students");
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
              ? "Atualize as informações do aluno."
              : "Preencha os campos necessários para cadastrar um novo aluno."}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 py-6 sm:px-8">
          {initialLoading ? (
            <FormSkeleton fields={8} columns={2} />
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <div className="grid gap-6 md:grid-cols-2">
                <Field label="Nome" htmlFor="name" error={errors.name?.message}>
                  <Input
                    id="name"
                    placeholder="Nome completo"
                    {...register("name")}
                  />
                </Field>

                <Field
                  label="E-mail"
                  htmlFor="email"
                  error={errors.email?.message}
                >
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@email.com"
                    {...register("email")}
                  />
                </Field>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Field
                  label="Senha"
                  htmlFor="password"
                  error={errors.password?.message}
                >
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
                </Field>

                <Field label="CPF" htmlFor="cpf" error={errors.cpf?.message}>
                  <Input
                    id="cpf"
                    placeholder="000.000.000-00"
                    maxLength={14}
                    {...cpfField}
                    onChange={(event) => {
                      event.target.value = formatCpf(event.target.value);
                      cpfField.onChange(event);
                    }}
                  />
                </Field>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Field
                  label="Telefone"
                  htmlFor="phone"
                  error={errors.phone?.message}
                >
                  <Input
                    id="phone"
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    {...phoneField}
                    onChange={(event) => {
                      event.target.value = formatPhone(event.target.value);
                      phoneField.onChange(event);
                    }}
                  />
                </Field>

                <Field
                  label="Data de nascimento"
                  htmlFor="birth_date"
                  error={errors.birth_date?.message}
                >
                  <Input
                    id="birth_date"
                    type="date"
                    max={todayISO}
                    {...register("birth_date")}
                  />
                </Field>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Field
                  label="Sexo"
                  htmlFor="gender"
                  error={errors.gender?.message}
                >
                  <Select id="gender" {...register("gender")}>
                    <option value="">Selecione</option>
                    {GENDER_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field
                  label="Altura (m)"
                  htmlFor="height"
                  error={errors.height?.message}
                >
                  <Input
                    id="height"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    max="3"
                    placeholder="1.75"
                    {...heightField}
                    onBlur={(event) => {
                      event.target.value = formatDecimal(event.target.value);
                      heightField.onBlur(event);
                    }}
                  />
                </Field>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Field
                  label="Peso atual (kg)"
                  htmlFor="current_weight"
                  error={errors.current_weight?.message}
                >
                  <Input
                    id="current_weight"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    max="500"
                    placeholder="72.5"
                    {...weightField}
                    onBlur={(event) => {
                      event.target.value = formatDecimal(event.target.value);
                      weightField.onBlur(event);
                    }}
                  />
                </Field>

                <Field
                  label="Observações"
                  htmlFor="observations"
                  error={errors.observations?.message}
                >
                  <Textarea
                    id="observations"
                    placeholder="Observações do aluno"
                    {...register("observations")}
                  />
                </Field>
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
                  {loading || isSubmitting ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {loading || isSubmitting
                    ? "Salvando..."
                    : isEdit
                      ? "Salvar alterações"
                      : "Criar aluno"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {isEdit && !initialLoading ? (
        <AnamnesisSection studentId={id} />
      ) : !isEdit ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border/80 bg-card/60 p-6 text-center text-sm text-muted-foreground">
          A seção de Anamnese (observações, fotos e vídeos) ficará disponível
          após a criação do cadastro do aluno.
        </div>
      ) : null}
    </PageContainer>
  );
}
