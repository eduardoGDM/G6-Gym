# Design — Cards e Painéis

Linguagem visual dos cards do G6Fit, extraída da refatoração da tela de
Check-in Diário (`student/DailyCheckins`). Serve como base para novas telas e
como referência em prompts.

> **Nota:** a seção "Interface" do `docs/frontend.md` está desatualizada. **MUI
> não está instalado** no projeto. A interface é Tailwind v4 + componentes
> próprios em `src/components/ui`.

---

## Princípio

O visual é **esportivo e técnico**, não premium/decorativo. A referência é
painel de placar e ficha de desempenho: geometria reta, informação numérica em
destaque, cor usada como marcação — não como enfeite.

Contraste vem de **cor e borda**, não de sombra. Sombras são sutis por decisão
de sistema (`--shadow-card` e `--shadow-subtle` no `index.css`).

---

## Tokens

Sempre usar os tokens do `@theme` em `src/index.css`. Nunca escrever hex solto
em componente.

| Uso | Token |
|---|---|
| Fundo da página | `bg-background` (`#0a0b0d`) |
| Card | `bg-card` (`#181b22`) |
| Painel interno (dentro do card) | `bg-surface/60` (`#111318`) |
| Bordas | `border-border` (`#262b36`) |
| Marca / marcação | `text-primary` `bg-primary` (`#ef4444`) |
| Variações da marca | `primary-hover` (claro) · `primary-dark` (escuro) |
| Texto secundário | `text-muted-foreground` |
| Erro de formulário | `text-destructive` (sempre) |

Em SVG, referenciar como CSS var: `stopColor="var(--color-primary)"`.

Raio: `rounded-xl` para cards e painéis, `rounded-lg` para inputs e botões.

---

## Anatomia do painel

Quatro elementos formam a assinatura. Não precisam aparecer todos, mas quando
aparecem seguem esta forma:

### 1. Barra da marca no topo

Primeiro filho do `Card`, largura total, sem raio próprio (o `overflow-hidden`
do card resolve).

```jsx
<Card className="relative overflow-hidden border-border/70 bg-card">
  <div aria-hidden="true" className="h-1.5 bg-primary" />
```

### 2. Hachura diagonal no canto

Referência a livery de uniforme. Opacidade baixíssima — se estiver legível como
textura, está forte demais.

```jsx
<div
  aria-hidden="true"
  className="pointer-events-none absolute right-0 top-0 h-44 w-44 opacity-[0.06] [background-image:repeating-linear-gradient(135deg,var(--color-primary)_0,var(--color-primary)_3px,transparent_3px,transparent_11px)]"
/>
```

### 3. Faixa lateral nos painéis internos

Ecoa a barra do topo e amarra a hierarquia. Exige `relative overflow-hidden` no
painel e `pl-6` para o conteúdo não encostar.

```jsx
<section className="relative overflow-hidden rounded-xl border border-border bg-surface/60 p-5 pl-6 hover:border-primary/40">
  <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-primary/70" />
```

### 4. Numeração da métrica

Índice em mono no canto oposto ao título (`01`, `02`). Dá leitura de ficha
técnica e ordena a varredura visual.

```jsx
<div className="mb-5 flex items-center justify-between gap-3">
  <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-foreground">
    <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
    {titulo}
  </h2>
  <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground/60">
    {indice}
  </span>
</div>
```

---

## Tipografia

**Regra central: todo dado numérico é mono.** Notas, datas, contadores,
índices, unidades. Texto corrido é sans (Inter).

| Elemento | Classes |
|---|---|
| Título de card | `text-3xl font-bold uppercase tracking-tight sm:text-[2.5rem] sm:leading-[1.05]` |
| Eyebrow | `font-mono text-[11px] uppercase tracking-[0.24em] text-primary` |
| Título de painel | `text-sm font-bold uppercase tracking-[0.14em]` |
| Micro-label | `font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground` |
| Número grande | `font-mono text-[44px] font-bold leading-none tracking-tight` |
| Data em destaque | `font-mono text-2xl font-bold tabular-nums` |

`tabular-nums` sempre que o número puder mudar em tela — evita o texto
"pulando" de largura.

`--font-mono` cai no stack do sistema; a JetBrains Mono não está empacotada.
Se for adicionar, usar `@fontsource/jetbrains-mono` (nenhum webfont é carregado
por rede hoje).

---

## Entrada de valor: dial

Para nota em escala curta (0–10), usar `RatingDial` em vez de slider: alvo de
toque maior e valor legível de relance.

Padrão do componente, replicável para outras escalas:

- Anel SVG com `strokeDasharray` fixo e `strokeDashoffset` animado.
- Gradiente `primary-dark → primary → primary-hover`, com `useId()` no id do
  gradiente (evita colisão quando há dois dials na mesma tela).
- Número centralizado com `key={valor}` no `<span>` — o remount reinicia a
  animação de mola sem hack de reflow.
- Marcações da escala, uma por ponto, com o `<svg>` girado `-rotate-90` para o
  zero cair no topo.
- Botões `−` / `+` circulares de 44px com `active:scale-[0.87]`.

Sempre controlado, para uso com `Controller` do React Hook Form.

---

## Dado de apoio: traço

Resumo histórico no rodapé do card usa `CheckinPulse` — traço tipo
eletrocardiograma com dados reais, nunca placeholder. Retorna `null` com menos
de 2 pontos.

`vectorEffect="non-scaling-stroke"` é obrigatório quando o SVG usa
`preserveAspectRatio="none"`, senão a linha distorce junto com a escala.

---

## Movimento

Discreto e curto. Nada acima de 500ms.

| Situação | Classe |
|---|---|
| Entrada do card | `animate-in fade-in slide-in-from-bottom-3 duration-500` |
| Hover de painel | `transition-colors duration-200 hover:border-primary/40` |
| Botão pressionado | `active:scale-[0.87]` ou `active:scale-95` |
| Mola de valor | `animate-spring-pop` (token em `index.css`) |

Hover nunca move layout de bloco grande. Mudança de cor de borda basta.

---

## Acessibilidade

- Todo elemento decorativo leva `aria-hidden="true"` (barras, hachura, faixas,
  traço SVG).
- Controle customizado precisa de `role`, `aria-valuemin/max/now` e
  `aria-valuetext`, além de teclado (setas, Home/End).
- Input invisível sobre bloco clicável: manter `htmlFor` + `aria-label`, e o
  bloco visual recebe `focus-within:ring-2 focus-within:ring-ring`.
- Erro de formulário sempre em `text-destructive`.

---

## Anti-padrões

Testados nesta tela e **rejeitados** — não reintroduzir:

- **Metáfora de bilhete/ticket**: picote, furos recortados por `mask-image`,
  pilha de cartões ao fundo. Não combina com produto de treino.
- **Elementos rotacionados** (carimbo de data torto). Geometria é reta.
- **Tags/chips de sensação** com emoji ("😴 Profundo", "🥗 Limpa"). Não têm uso
  no sistema — observação é campo de texto livre.
- **Partículas e poeira luminosa** no fundo.
- **Glassmorphism** (`backdrop-blur` + fundo translúcido) como base de card.
- **Paleta fora da marca** (dourado, azul royal). O tema é vermelho sobre ramp
  escuro, ponto.
- **Emoji em heading ou label.** Ícone é `lucide-react`.

---

## Checklist

Antes de fechar uma tela nova:

1. Cores vêm de token, não de hex.
2. Números em `font-mono`, com `tabular-nums` se mudarem.
3. Decorativo tem `aria-hidden`.
4. Formulário usa `Field`/`FormSection`/`SectionLabel` de `components/forms`.
5. Regra de negócio não foi duplicada do backend sem comentário explicando.
6. `npm run lint` sem erro novo e `npm run build` passando.

---

## Referência canônica

| Arquivo | O que demonstra |
|---|---|
| `student/DailyCheckins/DailyCheckinsIndex.jsx` | Anatomia completa do painel |
| `student/DailyCheckins/components/RatingDial.jsx` | Dial, mola, SVG acessível |
| `student/DailyCheckins/components/CheckinPulse.jsx` | Traço de histórico |
| `src/index.css` | Tokens e keyframes |
