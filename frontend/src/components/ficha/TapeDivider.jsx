import { cn } from "../../lib/utils";

/**
 * Divisão de seção em fita de demarcação de piso. Desenrola da esquerda ao
 * entrar na tela.
 *
 * Junto com o carimbo de recorde, é a única geometria do sistema que aceita
 * inclinação — e só até 1°.
 *
 * @param {number} [delay=0]  Atraso da animação, em ms.
 * @param {boolean} [tilt=true] Inclinação de 1°. `false` mantém reto.
 */
export default function TapeDivider({ delay = 0, tilt = true, className }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "h-[7px] origin-left ficha-tape animate-unroll",
        tilt && "rotate-[0.4deg]",
        className,
      )}
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}
