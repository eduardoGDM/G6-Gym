import { yupResolver } from "@hookform/resolvers/yup";
import { ArrowLeft, Save } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { crudToast } from "../../../components/common/crudToast";
import PageContainer from "../../../components/common/PageContainer";
import PageTitle from "../../../components/common/PageTitle";
import Spinner from "../../../components/common/Spinner";
import { Field } from "../../../components/forms/Field";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import adminTrainersService from "../../../services/AdminTrainersService";
import { trainerSchema } from "./utils/schema";

export default function TrainersNewEdit() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(trainerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const request = adminTrainersService.create({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      await crudToast(request, {
        action: "create",
        entity: "Personal",
        onError: (error) => {
          const validationErrors = error.response?.data?.errors;

          if (validationErrors) {
            Object.entries(validationErrors).forEach(([field, messages]) => {
              setError(field, { type: "server", message: messages[0] });
            });
          }
        },
      });

      navigate("/admin");
    } catch {
      // erro já exibido pelo crudToast
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <PageTitle
          eyebrow="Cadastro"
          title="Novo acesso de personal"
          description="Crie o acesso de um personal à plataforma."
        />

        <Button
          variant="outline"
          className="w-full md:w-auto"
          onClick={() => navigate("/admin")}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao painel
        </Button>
      </div>

      <Card className="border-border/80 bg-card/90">
        <CardHeader className="border-b border-border/80 px-6 py-6 sm:px-8">
          <CardTitle className="text-2xl">Novo Personal</CardTitle>
          <CardDescription>
            Preencha os campos necessários para criar o acesso do personal.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 py-6 sm:px-8">
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

              <Field label="E-mail" htmlFor="email" error={errors.email?.message}>
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
                  placeholder="Digite uma senha"
                  {...register("password")}
                />
              </Field>
            </div>

            <div className="flex flex-col gap-3 border-t border-border/80 pt-6 md:flex-row md:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin")}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || isSubmitting}>
                {loading || isSubmitting ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {loading || isSubmitting ? "Salvando..." : "Criar personal"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
