import {
  CalendarDays,
  Dumbbell,
  IdCard,
  Lock,
  Mail,
  NotebookPen,
  Phone,
  Ruler,
  Scale,
  User,
  UserRound,
} from "lucide-react";
import { forwardRef, useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as yup from "yup";

import PageContainer from "../../components/common/PageContainer";
import PageTitle from "../../components/common/PageTitle";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select } from "../../components/ui/select";
import { Separator } from "../../components/ui/separator";
import { Textarea } from "../../components/ui/textarea";
import { cn } from "../../lib/utils";

const schema = yup.object({
  name: yup
    .string()
    .trim()
    .required("O nome é obrigatório")
    .min(3, "O nome deve ter no mínimo 3 caracteres")
    .max(100, "O nome deve ter no máximo 100 caracteres"),
  cpf: yup
    .string()
    .trim()
    .required("O CPF é obrigatório")
    .matches(/^\d{11}$/, "CPF deve conter 11 dígitos"),
  data_nascimento: yup.string().required("A data de nascimento é obrigatória"),
  sexo: yup.string().required("Selecione o sexo"),
  email: yup
    .string()
    .trim()
    .email("Digite um e-mail válido")
    .required("O e-mail é obrigatório"),
  telefone: yup
    .string()
    .trim()
    .nullable()
    .notRequired()
    .test(
      "telefone",
      "Telefone deve conter 10 ou 11 dígitos",
      (value) => !value || /^\d{10,11}$/.test(value),
    ),
  password: yup
    .string()
    .required("A senha é obrigatória")
    .min(6, "A senha deve ter no mínimo 6 caracteres")
    .max(20, "A senha deve ter no máximo 20 caracteres")
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/, "A senha deve conter letras e números"),
  altura: yup
    .string()
    .trim()
    .nullable()
    .notRequired()
    .test("altura", "Altura inválida", (value) => !value || /^\d+(\.\d{1,2})?$/.test(value)),
  peso_atual: yup
    .string()
    .trim()
    .nullable()
    .notRequired()
    .test("peso", "Peso inválido", (value) => !value || /^\d+(\.\d{1,2})?$/.test(value)),
  observacoes: yup
    .string()
    .trim()
    .nullable()
    .notRequired()
    .max(500, "Observações deve ter no máximo 500 caracteres"),
});

const SEXO_OPTIONS = [
  { value: "Masculino", label: "Masculino" },
  { value: "Feminino", label: "Feminino" },
  { value: "Outro", label: "Outro" },
];

const API_ENDPOINT = "http://localhost:8000/api/perfil-aluno";

function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {title}
          </p>
          {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  error,
  helperText,
  required,
  className,
  children,
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
        {Icon ? <Icon className="h-4 w-4 text-muted-foreground" /> : null}
        {label}
        {required ? <span className="text-primary">*</span> : null}
      </Label>
      {children}
      {helperText ? (
        <p className={cn("text-xs leading-5", error ? "text-red-400" : "text-muted-foreground")}>
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

const InputWithIcon = forwardRef(function InputWithIcon(
  { icon: Icon, className, ...props },
  ref,
) {
  return (
    <div className="relative">
      {Icon ? (
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      ) : null}
      <Input ref={ref} className={cn(Icon ? "pl-10" : "", className)} {...props} />
    </div>
  );
});

export default function Alunos() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues: {
      sexo: "Masculino",
      data_nascimento: new Date().toISOString().split("T")[0],
      name: "",
      cpf: "",
      email: "",
      telefone: "",
      password: "",
      altura: "",
      peso_atual: "",
      observacoes: "",
    },
  });

  useEffect(() => {
    document.querySelector('input[name="name"]')?.focus();
  }, []);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await axios.post(API_ENDPOINT, data);
      toast.success("Aluno cadastrado com sucesso!");
      reset();
      setTimeout(() => {
        document.querySelector('input[name="name"]')?.focus();
      }, 50);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || "Erro ao criar aluno"
        : "Erro ao criar aluno";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <PageTitle
          eyebrow="Cadastro"
          title="Alunos"
          description="Preencha os dados abaixo para criar um novo aluno com um formulário mais claro, organizado e profissional."
        />

        <div className="rounded-2xl border border-border bg-card/70 px-4 py-3 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            Status do formulário
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {loading
              ? "Salvando..."
              : isValid
                ? "Pronto para envio"
                : isDirty
                  ? "Campos pendentes"
                  : "Aguardando preenchimento"}
          </p>
        </div>
      </div>

      <Card className="border-border/80 bg-card/90 shadow-[0_20px_60px_rgba(0,0,0,0.26)]">
        <CardHeader className="space-y-2 border-b border-border/80 px-6 py-6 sm:px-8">
          <CardTitle className="text-2xl">Novo aluno</CardTitle>
          <CardDescription>
            Seções organizadas para facilitar a leitura e reduzir erros de preenchimento.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 py-6 sm:px-8">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
            <section className="space-y-5">
              <SectionTitle
                icon={User}
                title="Dados pessoais"
                subtitle="Informações essenciais do aluno"
              />

              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="Nome completo"
                  icon={User}
                  error={!!errors.name}
                  helperText={errors.name?.message || "Digite o nome completo do aluno."}
                  required
                >
                  <InputWithIcon
                    icon={User}
                    placeholder="Digite o nome completo"
                    autoComplete="name"
                    aria-invalid={!!errors.name}
                    {...register("name")}
                  />
                </Field>

                <Field
                  label="CPF"
                  icon={IdCard}
                  error={!!errors.cpf}
                  helperText={errors.cpf?.message || "Apenas números, sem pontos ou traços."}
                  required
                >
                  <InputWithIcon
                    icon={IdCard}
                    placeholder="Somente números"
                    inputMode="numeric"
                    maxLength={11}
                    aria-invalid={!!errors.cpf}
                    {...register("cpf")}
                  />
                </Field>

                <Field
                  label="Data de nascimento"
                  icon={CalendarDays}
                  error={!!errors.data_nascimento}
                  helperText={errors.data_nascimento?.message || "Selecione a data de nascimento."}
                  required
                >
                  <InputWithIcon
                    icon={CalendarDays}
                    type="date"
                    aria-invalid={!!errors.data_nascimento}
                    {...register("data_nascimento")}
                  />
                </Field>

                <Field
                  label="Sexo"
                  icon={UserRound}
                  error={!!errors.sexo}
                  helperText={errors.sexo?.message || "Escolha uma opção."}
                  required
                >
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Select className="pl-10" {...register("sexo")}>
                      {SEXO_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </Field>
              </div>
            </section>

            <Separator />

            <section className="space-y-5">
              <SectionTitle
                icon={Mail}
                title="Contato"
                subtitle="Meios de contato e acesso"
              />

              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="E-mail"
                  icon={Mail}
                  error={!!errors.email}
                  helperText={errors.email?.message || "Digite um e-mail válido."}
                  required
                >
                  <InputWithIcon
                    icon={Mail}
                    type="email"
                    placeholder="usuario@email.com"
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    {...register("email")}
                  />
                </Field>

                <Field
                  label="Telefone"
                  icon={Phone}
                  error={!!errors.telefone}
                  helperText={errors.telefone?.message || "Opcional. Use apenas números."}
                >
                  <InputWithIcon
                    icon={Phone}
                    placeholder="Somente números"
                    inputMode="numeric"
                    maxLength={11}
                    autoComplete="tel"
                    aria-invalid={!!errors.telefone}
                    {...register("telefone")}
                  />
                </Field>

                <Field
                  label="Senha"
                  icon={Lock}
                  error={!!errors.password}
                  helperText={errors.password?.message || "Use letras e números, mínimo 6 caracteres."}
                  required
                  className="md:col-span-2"
                >
                  <InputWithIcon
                    icon={Lock}
                    type="password"
                    placeholder="Digite uma senha segura"
                    autoComplete="new-password"
                    aria-invalid={!!errors.password}
                    {...register("password")}
                  />
                </Field>
              </div>
            </section>

            <Separator />

            <section className="space-y-5">
              <SectionTitle
                icon={Dumbbell}
                title="Medidas físicas"
                subtitle="Dados para acompanhamento e evolução"
              />

              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="Altura"
                  icon={Ruler}
                  error={!!errors.altura}
                  helperText={errors.altura?.message || "Ex.: 1.75"}
                >
                  <InputWithIcon
                    icon={Ruler}
                    placeholder="Ex.: 1.75"
                    inputMode="decimal"
                    aria-invalid={!!errors.altura}
                    {...register("altura")}
                  />
                </Field>

                <Field
                  label="Peso atual"
                  icon={Scale}
                  error={!!errors.peso_atual}
                  helperText={errors.peso_atual?.message || "Ex.: 72.5"}
                >
                  <InputWithIcon
                    icon={Scale}
                    placeholder="Ex.: 72.5"
                    inputMode="decimal"
                    aria-invalid={!!errors.peso_atual}
                    {...register("peso_atual")}
                  />
                </Field>

                <Field
                  label="Observações"
                  icon={NotebookPen}
                  error={!!errors.observacoes}
                  helperText={
                    errors.observacoes?.message ||
                    "Use este espaço para observações importantes do aluno."
                  }
                  className="md:col-span-2"
                >
                  <div className="relative">
                    <NotebookPen className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      placeholder="Anotações, restrições, observações e detalhes importantes"
                      className="min-h-[128px] pl-10"
                      aria-invalid={!!errors.observacoes}
                      {...register("observacoes")}
                    />
                  </div>
                </Field>
              </div>
            </section>

            <Separator />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Campos com <span className="text-primary">*</span> são obrigatórios.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={() => reset()}
                  className="sm:min-w-36"
                >
                  Limpar
                </Button>

                <Button type="submit" disabled={loading} className="sm:min-w-44">
                  {loading ? "Criando..." : "Criar aluno"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
