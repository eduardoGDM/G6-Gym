import { cn } from "../../lib/utils";

// Vão horizontal entre traços de um grupo e largura total de um grupo de cinco
// (quatro traços + a diagonal que os corta + respiro).
const STROKE_GAP = 12;
const GROUP_SPAN = 78;

// "Mão" determinística: cada traço desvia um pouco do vizinho para não parecer
// carimbo repetido. Índice do traço escolhe o desvio — sem aleatoriedade, para
// o SVG não mudar a cada render.
const BOW = [2.5, -2, 2, -2.5, 1.5];
const TOP = [0, -1, 1, 0, -1];

/**
 * Contagem em pauzinhos — a marcação de sequência de dias (ou de séries) feita
 * à mão, em grupos de cinco com a diagonal fechando o grupo.
 *
 * Substitui ícone de fogo e anel de progresso: é a assinatura humana do tema
 * "A Ficha". Cada traço se desenha (`stroke-dashoffset`), um a cada 40 ms.
 *
 * @param {number} count        Quantas marcas desenhar.
 * @param {string} [label]      Texto do `aria-label`. Obrigatório para leitura.
 * @param {number} [delay=0]    Atraso inicial da animação, em ms.
 * @param {boolean} [animate=true] `false` renderiza direto no estado final.
 * @param {number} [scale=1]    Fator de tamanho (0.4 para uso em cabeçalho).
 */
export default function TallyMarks({
  count,
  label,
  delay = 0,
  animate = true,
  scale = 1,
  className,
}) {
  const total = Math.max(0, Math.floor(count || 0));
  if (total === 0) return null;

  const groups = Math.ceil(total / 5);
  const width = (groups - 1) * GROUP_SPAN + 52;

  const strokes = [];

  for (let i = 0; i < total; i += 1) {
    const group = Math.floor(i / 5);
    const position = i % 5;
    const originX = group * GROUP_SPAN;

    // A quinta marca do grupo é a diagonal que risca as quatro anteriores.
    if (position === 4) {
      strokes.push({
        d: `M${originX} 47 Q${originX + 23} 31 ${originX + 47} 9`,
        length: 72,
      });
      continue;
    }

    const x = originX + 4 + position * STROKE_GAP;
    const bow = BOW[i % BOW.length];
    const top = TOP[i % TOP.length];

    strokes.push({
      d: `M${x} ${7 + top} Q${x + bow} 28 ${x - top} ${49 - top}`,
      length: 56,
    });
  }

  return (
    <svg
      viewBox={`0 0 ${width} 58`}
      role="img"
      aria-label={label}
      className={cn("h-auto text-foreground", className)}
      style={{ width: width * scale }}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      >
        {strokes.map((stroke, index) => (
          <path
            key={stroke.d}
            d={stroke.d}
            data-draw=""
            className={animate ? "animate-draw" : undefined}
            style={{
              strokeDasharray: stroke.length,
              // Consumido pelo keyframe `draw` (ver src/index.css).
              "--draw-length": stroke.length,
              animationDelay: `${delay + index * 40}ms`,
            }}
          />
        ))}
      </g>
    </svg>
  );
}
