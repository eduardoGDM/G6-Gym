import { cn } from "../../lib/utils";
import useThemeStore from "../../store/themeStore";

/**
 * Troca entre os modos escuro e claro do tema "A Ficha".
 *
 * A marca não é sol/lua: é um quadrado meio preenchido — a notação de
 * contraste. O rótulo nomeia a cor para onde o aluno vai (GIZ = claro,
 * FERRO = escuro), que é como a paleta é chamada no resto do sistema.
 */
export default function ThemeModeToggle({ className }) {
  const mode = useThemeStore((state) => state.mode);
  const toggle = useThemeStore((state) => state.toggle);

  const goingToLight = mode === "dark";
  const label = `Mudar para o tema ${goingToLight ? "claro" : "escuro"}`;

  return (
    <button
      type="button"
      onClick={toggle}
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex h-10 shrink-0 items-center gap-2 border-2 border-foreground px-2.5 text-foreground transition-colors duration-200",
        "hover:bg-foreground hover:text-background",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 16 16"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect
          x="1"
          y="1"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path d="M8 1h7v14H8z" fill="currentColor" />
      </svg>

      <span className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] ficha-mono sm:inline">
        {goingToLight ? "Giz" : "Ferro"}
      </span>
    </button>
  );
}
