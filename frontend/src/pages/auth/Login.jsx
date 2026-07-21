import { ArrowRight, Dumbbell, Lock, Mail } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import Spinner from "../../components/common/Spinner";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import authService from "../../services/authService";
import useAuthStore from "../../store/authStore";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    if (errors[id]) {
      setErrors((prev) => ({
        ...prev,
        [id]: undefined,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.email) newErrors.email = "E-mail é obrigatório";
    if (!formData.password) newErrors.password = "Senha é obrigatória";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      await authService.login(formData);

      const userData = await authService.me();

      login(userData);

      toast.success("Login realizado com sucesso!");

      const redirectPath =
        userData.role === "trainer"
          ? "/trainer"
          : userData.role === "admin"
            ? "/admin"
            : "/student";

      navigate(redirectPath);
    } catch (error) {
      const message = error.response?.data?.message || "Erro ao fazer login";

      toast.error(message);

      setFormData((prev) => ({
        ...prev,
        password: "",
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* LADO ESQUERDO */}
        <div className="flex flex-col justify-between rounded-[2rem] border border-border bg-card/80 p-8 shadow-card backdrop-blur-xl lg:p-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-subtle">
                <Dumbbell className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight">G6 Academia</p>
                <p className="text-sm text-muted-foreground">
                  Gestão moderna para academia
                </p>
              </div>
            </div>

            <div className="mt-12 max-w-xl space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">
                Bem-vindo de volta
              </p>

              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Controle seus alunos, treinos e resultados com mais clareza.
              </h1>

              <p className="max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
                Interface mais limpa, organizada e profissional para o dia a dia
                do trainer.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              "Cadastro rápido",
              "Acesso responsivo",
              "Fluxo mais intuitivo",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-border bg-background/60 px-4 py-4 text-sm text-muted-foreground"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* FORM */}
        <Card className="border-border/80 bg-card/90">
          <CardContent className="p-8 lg:p-10">
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/80">
                Acesso
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Entrar na plataforma
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Use suas credenciais para acessar o painel.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* EMAIL */}
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@email.com"
                    className="pl-10"
                    aria-invalid={errors.email ? true : undefined}
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>

                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              {/* PASSWORD */}
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>

                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    id="password"
                    type="password"
                    placeholder="Sua senha"
                    className="pl-10"
                    aria-invalid={errors.password ? true : undefined}
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    autoComplete="current-password"
                  />
                </div>

                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              {/* REMEMBER */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Lembrar-me
                </label>

                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => toast("Função em desenvolvimento")}
                >
                  Esqueci minha senha
                </button>
              </div>

              {/* SUBMIT */}
              <Button
                className="w-full"
                size="lg"
                type="submit"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar"}
                {loading ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </Button>

              {/* DEV INFO */}
              {import.meta.env.DEV && (
                <div className="mt-4 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                  <p className="font-semibold">Credenciais de teste:</p>
                  <p>Email: admin@email.com</p>
                  <p>Senha: passwords</p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
