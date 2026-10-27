import { cn } from "../../lib/utils";

/**
 * Recorde pessoal celebrado como carimbo — duplo traço em anilha, com sangria
 * de tinta e a pressão de quem bate o carimbo na ficha.
 *
 * Substitui confete e explosão de partículas. Junto com a fita de piso, é a
 * única geometria do sistema que aceita inclinação (−1,6°, dentro do keyframe).
 *
 * @param {string} title     Palavra do carimbo (ex.: "Recorde").
 * @param {string} [detail]  Linha miúda abaixo (ex.: "+2,5 kg · 27.10").
 * @param {number} [delay=0] Atraso da animação, em ms.
 */
export default function RecordStamp({ title, detail, delay = 0, className }) {
  return (
    <span
      className={cn(
        "inline-block border-[3px] border-primary px-3 pb-2.5 pt-2 text-center text-primary animate-stamp",
        "shadow-[0_0_0_1.5px_var(--color-primary)_inset]",
        className,
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="block text-[19px] leading-none ficha-display">
        {title}
      </span>
      {detail ? (
        <span className="mt-1 block text-[9px] tracking-[0.2em] ficha-label">
          {detail}
        </span>
      ) : null}
    </span>
  );
}
