import {
  ArrowRight,
  ClipboardCheck,
  Dumbbell,
  Eye,
  EyeOff,
  Lock,
  Mail,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { Field } from "../../components/forms/Field";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import authService from "../../services/authService";
import useAuthStore from "../../store/authStore";

const FEATURES = [
  { icon: Users, label: "Gestão completa de alunos" },
  { icon: Dumbbell, label: "Criação de treinos personalizados" },
  { icon: ClipboardCheck, label: "Check-ins de treino, sono e dieta" },
  { icon: TrendingUp, label: "Acompanhamento da evolução" },
];

// Destaques enxutos para o hero compacto no mobile.
const MOBILE_FEATURES = [
  { icon: Users, label: "Alunos" },
  { icon: Dumbbell, label: "Treinos" },
  { icon: TrendingUp, label: "Evolução" },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="flex min-h-screen lg:h-screen lg:overflow-hidden">
      {/* ---------- HERO (esquerda) ---------- */}
      <section className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-border/60 bg-gradient-to-br from-primary/10 via-card to-background p-10 lg:flex xl:p-14 2xl:p-16">
        {/* Fundo decorativo: glow + grid técnico + shapes borrados. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute left-1/4 top-[-10%] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-primary/25 blur-[130px] animate-glow" />
          <div className="absolute bottom-[-15%] right-[-10%] h-[24rem] w-[24rem] rounded-full bg-secondary/15 blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
          <div className="absolute right-16 top-24 h-40 w-40 rounded-3xl border border-border/40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        </div>

        {/* Marca */}
        <div className="relative flex items-center gap-3 duration-700 animate-in fade-in slide-in-from-top-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg shadow-primary/30">
            <Dumbbell className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="text-lg font-bold tracking-tight text-foreground">
              G6Fit
            </p>
            <p className="text-xs text-muted-foreground">
              Plataforma para academias e personal trainers
            </p>
          </div>
        </div>

        {/* Conteúdo central */}
        <div className="relative max-w-lg">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground duration-700 animate-in fade-in slide-in-from-bottom-3 xl:text-5xl">
            A plataforma completa para academias e personal trainers.
          </h1>

          <p
            className="fill-mode-both mt-5 text-base leading-relaxed text-muted-foreground duration-700 animate-in fade-in slide-in-from-bottom-3"
            style={{ animationDelay: "120ms" }}
          >
            Organize treinos, acompanhe seus alunos, registre evoluções e
            centralize toda a gestão em uma única plataforma.
          </p>

          <ul className="mt-10 space-y-3">
            {FEATURES.map((feature, index) => (
              <li
                key={feature.label}
                style={{ animationDelay: `${260 + index * 80}ms` }}
                className="group fill-mode-both flex items-center gap-3.5 rounded-xl border border-border/50 bg-card/40 px-4 py-3.5 backdrop-blur-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 hover:translate-x-0.5 hover:border-primary/40 hover:bg-card"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-[1.1rem] w-[1.1rem]" />
                </span>
                <span className="text-sm text-foreground/90">
                  {feature.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Rodapé */}
        <p
          className="fill-mode-both relative text-xs text-muted-foreground/70 duration-1000 animate-in fade-in"
          style={{ animationDelay: "700ms" }}
        >
          © {new Date().getFullYear()} G6Fit · Gestão moderna para academia
        </p>
      </section>

      {/* ---------- FORMULÁRIO (direita) ---------- */}
      <section className="relative flex w-full flex-col justify-center px-6 py-12 sm:px-10 sm:py-10 lg:w-1/2 lg:overflow-hidden lg:px-16 xl:px-24">
        {/* Glow sutil também no lado do formulário (aparece no mobile). */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden lg:hidden"
        >
          <div className="absolute left-1/2 top-[-15%] h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
        </div>

        <div className="mx-auto w-full max-w-sm duration-700 animate-in fade-in slide-in-from-bottom-4">
          {/* Hero compacto — Mobile/Tablet: identidade do G6 sem ocupar espaço. */}
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg shadow-primary/30">
              <Dumbbell className="h-7 w-7" />
            </div>
            <p className="mt-4 text-xl font-bold tracking-tight text-foreground">
              G6Fit
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Plataforma para academias e personal trainers
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {MOBILE_FEATURES.map((feature, index) => (
                <span
                  key={feature.label}
                  style={{ animationDelay: `${150 + index * 70}ms` }}
                  className="fill-mode-both inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm duration-500 animate-in fade-in slide-in-from-bottom-2"
                >
                  <feature.icon className="h-3.5 w-3.5 text-primary" />
                  {feature.label}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Bem-vindo de volta
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Entre com suas credenciais para acessar o painel.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Field label="E-mail" htmlFor="email" error={errors.email}>
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
            </Field>

            <Field label="Senha" htmlFor="password" error={errors.password}>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua senha"
                  className="pl-10 pr-10"
                  aria-invalid={errors.password ? true : undefined}
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </Field>

            {/* REMEMBER */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex cursor-pointer items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                Lembrar-me
              </label>
            </div>

            <Button
              className="group w-full transition-transform active:scale-[0.98]"
              size="lg"
              type="submit"
              loading={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
              {!loading && (
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              )}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
