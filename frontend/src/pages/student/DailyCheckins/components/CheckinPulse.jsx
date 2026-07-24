import { useId } from "react";

const WIDTH = 320;
const HEIGHT = 44;
const PADDING = 6;

/**
 * Traço tipo eletrocardiograma com as últimas notas registradas. É um resumo
 * decorativo do rodapé do bilhete — o histórico navegável continua sendo a
 * tabela abaixo do formulário.
 *
 * @param {number[]} values Notas em ordem cronológica (mais antiga primeiro).
 * @param {string} label    Legenda exibida acima do traço.
 */
export default function CheckinPulse({ values, label }) {
  const gradientId = useId();

  if (!values || values.length < 2) return null;

  const stepX = (WIDTH - PADDING * 2) / (values.length - 1);
  const toY = (value) => HEIGHT - PADDING - (value / 10) * (HEIGHT - PADDING * 2);

  // Entre dois pontos desenhamos uma batida (queda curta, pico agudo, retorno)
  // em vez de uma reta — é o que dá a leitura de monitor cardíaco.
  let path = `M ${PADDING} ${toY(values[0]).toFixed(1)}`;

  values.forEach((value, index) => {
    if (index === 0) return;

    const previousX = PADDING + stepX * (index - 1);
    const currentX = PADDING + stepX * index;
    const midX = (previousX + currentX) / 2;
    const y = toY(value);

    path += ` L ${(midX - stepX * 0.18).toFixed(1)} ${(y + 4).toFixed(1)}`;
    path += ` L ${midX.toFixed(1)} ${(y - 9).toFixed(1)}`;
    path += ` L ${(midX + stepX * 0.16).toFixed(1)} ${(y + 3).toFixed(1)}`;
    path += ` L ${currentX.toFixed(1)} ${y.toFixed(1)}`;
  });

  const lastY = toY(values[values.length - 1]);

  return (
    <div className="min-w-0 flex-1">
      <p className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        className="block h-11 w-full overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.15" />
            <stop offset="45%" stopColor="var(--color-primary)" stopOpacity="0.7" />
            <stop offset="100%" stopColor="var(--color-primary-hover)" />
          </linearGradient>
        </defs>

        <line
          x1="0"
          y1={HEIGHT / 2}
          x2={WIDTH}
          y2={HEIGHT / 2}
          className="stroke-border"
          strokeWidth="1"
          strokeDasharray="3 5"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={path}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <circle
          cx={WIDTH - PADDING}
          cy={lastY}
          r="3"
          className="fill-primary drop-shadow-[0_0_6px_rgba(239,68,68,0.9)]"
        />
      </svg>
    </div>
  );
}
