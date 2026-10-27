import { useEffect, useState } from "react";

import { cn } from "../../lib/utils";

const formatClock = (value) => {
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

/**
 * Cronômetro de descanso: barra de giz sendo apagada + contagem em tabular.
 *
 * Não é anel de progresso. A barra tem borda irregular (`ficha-chalk`) e um
 * respiro contínuo (`animate-breathe`), para o movimento ser orgânico e não
 * mecânico. Nos últimos 5 segundos o número pulsa num ritmo que desacelera.
 *
 * Ao zerar, o componente NÃO se desmonta: o 0:00 com a barra vazia é o aviso
 * de que o descanso acabou. Quem dispensa é o aluno (ou a próxima série, que
 * reinicia a contagem com uma nova `key`).
 *
 * Só exibe — nunca escreve no formulário. O campo "Descanso (s)" de cada série
 * continua manual, para o dado registrado seguir sendo o que o aluno informou.
 *
 * @param {number} seconds        Tempo total do descanso, em segundos.
 * @param {() => void} [onDismiss] Exibe o botão de fechar/pular quando informado.
 */
export default function RestTimer({ seconds, onDismiss, className }) {
  const [left, setLeft] = useState(seconds);

  // Troca de duração sem remontar reinicia a contagem. Ajuste durante o render
  // (padrão recomendado pelo React) em vez de setState dentro de efeito — o
  // mesmo que a tela de histórico faz com o termo de busca.
  const [baseline, setBaseline] = useState(seconds);

  if (seconds !== baseline) {
    setBaseline(seconds);
    setLeft(seconds);
  }

  useEffect(() => {
    if (!seconds || seconds <= 0) return undefined;

    const id = setInterval(() => {
      setLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(id);
  }, [seconds]);

  if (!seconds || seconds <= 0) return null;

  const finished = left === 0;
  const urgent = left > 0 && left <= 5;
  const percent = Math.max(0, (left / seconds) * 100);

  return (
    <div
      className={cn(
        "border-2 border-foreground bg-card px-4 pb-4 pt-3.5 animate-rise",
        className,
      )}
    >
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p
            className={cn(
              "pb-1 ficha-label",
              finished ? "text-primary" : "text-muted-foreground",
            )}
          >
            {finished ? "Descanso encerrado" : "Descanso"}
          </p>
          {onDismiss ? (
            <button
              type="button"
              onClick={onDismiss}
              className="-ml-1 inline-flex min-h-11 items-center px-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground underline decoration-dotted underline-offset-4 transition-colors hover:text-foreground"
            >
              {finished ? "Fechar" : "Pular descanso"}
            </button>
          ) : null}
        </div>

        <span
          role="timer"
          aria-label={
            finished
              ? "Descanso encerrado"
              : `Descanso restante: ${left} segundos`
          }
          className={cn(
            "inline-block text-[46px] ficha-display",
            (urgent || finished) && "text-primary",
            urgent && "animate-slow-pulse",
          )}
        >
          {formatClock(left)}
        </span>
      </div>

      <div className="relative mt-3 h-[13px] bg-muted">
        <div
          className="absolute inset-y-0 left-0 bg-foreground transition-[width] duration-1000 ease-linear ficha-chalk animate-breathe"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
