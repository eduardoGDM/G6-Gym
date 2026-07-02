import { ArrowRight, Dumbbell, Lock, Mail } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-between rounded-[2rem] border border-border bg-card/80 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl lg:p-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
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

        <Card className="border-border/80 bg-card/90 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
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

            <form className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@email.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Sua senha"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-muted-foreground">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border bg-card"
                  />
                  Lembrar-me
                </label>
                <button
                  type="button"
                  className="font-medium text-primary hover:underline"
                >
                  Esqueci minha senha
                </button>
              </div>

              <Button className="w-full" size="lg">
                Entrar
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
