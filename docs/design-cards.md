# Design — Cards e Painéis

Linguagem visual dos cards do G6Fit. Serve como base para novas telas e como
referência em prompts.

> **Histórico:** esta linguagem nasceu da refatoração da tela de Check-in
> Diário, que foi **removida do produto em 27/11/2026** junto com a feature (ver
> `regras-de-negocio.md`). Os exemplos abaixo seguem valendo; só a tela de
> origem não existe mais para consulta.

> **Nota:** a seção "Interface" do `docs/frontend.md` está desatualizada. **MUI
> não está instalado** no projeto. A interface é Tailwind v4 + componentes
> próprios em `src/components/ui`.

> **Escopo:** este documento descreve o tema **vermelho sobre ramp escuro**, que
> vale para treinador e admin. A **área do aluno** roda no tema "A Ficha"
> (giz/ferro/anilha, em modo escuro ou claro) — ver a última seção,
> [Tema "A Ficha"](#tema-a-ficha--área-do-aluno). Antes de mexer em tela do
> aluno, ler essa seção.

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

**Cabeçalho de página fica fora do card.** Título, descrição e o campo
principal (data, filtro) usam `PageTitle` + `Field`/`FilterField` no mesmo
`flex ... sm:justify-between` de todas as listagens. O card começa direto no
conteúdo. Quando o campo é do formulário, o `<form>` envolve o cabeçalho e o
card — nunca deixar controle de formulário fora do `<form>`.

Dentro do card, quatro elementos formam a assinatura. Não precisam aparecer
todos, mas quando aparecem seguem esta forma:

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

### 4. Título do painel

Ícone `lucide-react` na cor da marca + texto em maiúsculas com tracking aberto.

```jsx
<h2 className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-foreground">
  <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
  {titulo}
</h2>
```

---

## Tipografia

**Regra central: todo dado numérico é mono.** Notas, datas, contadores,
índices, unidades. Texto corrido é sans (Inter).

| Elemento | Classes |
|---|---|
| Título de painel | `text-sm font-bold uppercase tracking-[0.14em]` |
| Micro-label | `font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground` |
| Número grande | `font-mono text-[44px] font-bold leading-none tracking-tight` |

Título e descrição da página não entram nesta tabela: vêm do `PageTitle`.

`tabular-nums` sempre que o número puder mudar em tela — evita o texto
"pulando" de largura.

`--font-mono` cai no stack do sistema; a JetBrains Mono não está empacotada.
Se for adicionar, usar `@fontsource/jetbrains-mono` (nenhum webfont é carregado
por rede hoje).

---

## Entrada de valor em escala curta

O `RatingDial` (anel de progresso com gradiente e glow) e o `CheckinPulse`
(traço de eletrocardiograma) viviam só na tela de Check-in Diário e foram
removidos com ela. Não recriar nenhum dos dois: **anel de progresso e traço com
glow são justamente o visual genérico** que o tema do aluno abandonou — ver
"Número é a imagem" na seção do tema "A Ficha".

Para nota em escala curta, preferir a leitura direta: número grande em
`ficha-display` com a escala em segmentos de tinta cheia/vazada, no padrão da
fita da semana do Dashboard.

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
| `trainer/Checkins/CheckinsShow.jsx` | Anatomia do painel (barra, faixa, título) |
| `trainer/Dashboard.jsx` | Cards de indicador, donut, gráfico |
| `src/index.css` | Tokens e keyframes |

---

# Tema "A Ficha" — área do aluno

A partir de 27/10/2026 a **área do aluno** roda num tema próprio. Tudo acima
deste ponto continua valendo para o treinador e o admin (tema vermelho sobre
ramp escuro).

O escopo é aplicado em `StudentLayout` → `RoleLayout theme="ficha"`, que põe
`data-theme="ficha"` na raiz. Os **nomes** dos tokens são os mesmos — `bg-card`,
`text-primary`, `border-border` — só os **valores** mudam dentro do escopo. Por
isso componente compartilhado (`Card`, `Button`, `ExerciseEvolutionPanel`) herda
a paleta sem reescrita.

## Conceito

A ficha de treino de papel na prancheta: giz, ferro e anilha. Três decisões
sustentam tudo:

1. **Papel e ferro, não preto e neon.** Dois modos — ferro fundido (padrão) e
   giz —, a mesma direção invertida. Nenhum verde-limão, nenhum glow.
2. **Conclusão é marca de mão, não cor.** Série feita recebe **risco**, nunca
   verde. Isso libera a paleta de precisar de uma cor de sucesso.
3. **Número é a imagem.** Não há ilustração nem anel de progresso: o elemento
   gráfico dominante é um número gigante alinhado à esquerda.

## Dois modos

São **três cores** (Giz, Ferro, Anilha) e dois arranjos delas. O modo é escrito
como `data-mode` na mesma raiz do `data-theme`, pelo `RoleLayout`.

**Escuro é o padrão** — por decisão de produto, deliberadamente *sem* olhar
`prefers-color-scheme`. A **ausência** de `data-mode` já significa escuro, então
o padrão vale até no primeiro paint, antes de o JS resolver o `localStorage`.

| Papel | Escuro (padrão) | Claro (`data-mode="light"`) |
|---|---|---|
| `background` | Ferro `#191B1C` | Giz `#EDE8DE` |
| `foreground` | Giz `#EDE8DE` — 14,2:1 | Ferro `#191B1C` — 14,2:1 |
| `card` | `#1F2223` | Folha `#F7F4EC` |
| `surface` | `#141617` | `#E5DFD3` |
| `muted` | `#26292A` | `#E3DCCD` |
| `muted-foreground` | `#9A968C` — 5,9:1 | `#5A5D5F` — 5,4:1 |
| `border` | `#313436` | `#D8D2C6` |
| `input` | `#44484A` | `#C6BFAF` |
| `rule` (pauta) | `#26292A` | `#E3DCCD` |
| **`primary` (Anilha)** | `#E2672B` — 5,1:1 | `#C1440E` — 6,0:1 |
| `primary-foreground` | `#191B1C` | `#F7F4EC` |
| `primary-hover` | `#EF7C45` (clareia) | `#A93B0C` (escurece) |

**A Anilha muda de valor entre os modos e isso não é negociável:** `#C1440E`
sobre `#191B1C` dá 2,3:1 — ilegível. No escuro ela é a mesma anilha vista sob
luz de galpão, clareada até passar AA. `primary-dark` guarda a anilha do outro
modo em cada um, para quando um elemento precisar do par.

**No máximo um elemento em Anilha por tela** — é "onde você está agora", não
enfeite. Semânticos (`destructive`, `success`, `warning`, `info`) são **função,
não marca** (só erro de formulário, aviso e exclusão) e têm um valor por modo:
terrosos escuros no claro, terrosos claros no escuro.

### Escrever componente que serve os dois modos

Regra prática: **nunca** nomear a cor, sempre o papel.

- Tinta é `foreground`, não "preto". Papel é `background`, não "branco".
- Marca de mão (risco, pauzinho, barra de giz, fita) é `bg-foreground`. Ela
  inverte junto e continua sendo "tinta sobre papel" nos dois modos.
- Preenchimento de hover é `bg-foreground/5`; inversão de botão é
  `hover:bg-foreground hover:text-background`.
- Fundo de scrim de modal é `bg-black/60` nos dois modos (igual ao `Dialog`) —
  é o único lugar onde preto literal é correto.
- Gradiente em `@utility` **aceita** `var(--color-…)`: é como `ficha-tape` e
  `ficha-ruled` acompanham o modo. Não hardcodar hex ali.

## Troca de modo

| Arquivo | Papel |
|---|---|
| `src/store/themeStore.js` | `mode` (`dark`/`light`), `setMode`, `toggle`. Lê o `localStorage` (`g6:theme-mode`) de forma síncrona na criação, então o primeiro render já sai certo. Falha de `localStorage` cai no padrão sem quebrar |
| `src/components/ficha/ThemeModeToggle.jsx` | O botão. Montado via `topbarActions` do `RoleLayout` |
| `RoleLayout` | Escreve `data-mode` — só quando há `theme` |

A marca do botão **não é sol/lua**: é um quadrado meio preenchido (notação de
contraste). O rótulo nomeia a cor de destino — `GIZ` para claro, `FERRO` para
escuro — que é como a paleta é chamada no resto do sistema.

## Tipografia

| Papel | Token | Fonte |
|---|---|---|
| Display e número protagonista | `--font-display` | Archivo Variable, `font-stretch: 125%`, peso 900 |
| Corpo | `--font-ficha` | IBM Plex Sans Variable |
| Dado numérico, micro-label | `--font-ficha-mono` | IBM Plex Mono |
| Assinatura | `--font-hand` | Shantell Sans Variable |

Archivo entra pelo eixo **expandido** de propósito: inverte o clichê da
condensada esportiva e dá peso de letra estampada em anilha. Todas via
`@fontsource` — **nenhum webfont por rede**.

Utilitários: `ficha-display`, `ficha-mono`, `ficha-label`, `ficha-hand`.
`tabular-nums` continua obrigatório em número que muda em tela.

A assinatura (`ficha-hand`) aparece em **dois lugares** no app inteiro: o
rodapé do painel e o do histórico. Nunca atribuída a uma pessoa — não inventar
recado de personal; quando existir campo para isso no backend, é ali que entra.

## Exceção registrada: rotação

A regra "geometria é reta" dos anti-padrões **continua valendo**, com duas
exceções nomeadas:

- **Carimbo de recorde** (`RecordStamp`): −1,6°, dentro do keyframe `stamp`.
- **Fita de piso** (`TapeDivider`): até 1°.
- O **risco** de série/valor superado: −1,2°, porque é traço de mão.

Nada mais gira.

## Componentes de assinatura

`src/components/ficha/`:

| Arquivo | O que é |
|---|---|
| `TallyMarks.jsx` | Contagem em pauzinhos, grupos de 5, cada traço se desenha. Substitui ícone de fogo e anel |
| `TapeDivider.jsx` | Divisão de seção em fita de demarcação de piso, desenrolando |
| `RecordStamp.jsx` | Recorde como carimbo, com sangria de tinta. Substitui confete |
| `RestTimer.jsx` | Descanso em barra de giz apagando, borda irregular, respiro orgânico |
| `ThemeModeToggle.jsx` | Troca escuro/claro. Marca de contraste, não sol/lua |

O grão de papel é `background-image` do próprio container temático (ladrilho de
140px via `feTurbulence`), não overlay — sem custo de filtro em tela cheia.

## Movimento

Tokens em `src/index.css`: `animate-rise`, `animate-sheet`, `animate-unroll`,
`animate-stamp`, `animate-digit` / `animate-digit-alt`, `animate-strike`,
`animate-draw`, `animate-breathe`, `animate-slow-pulse`.

Duas curvas: **chalk** `cubic-bezier(.33,0,.1,1)` para traço e revelação,
**stamp** `cubic-bezier(.2,1.6,.3,1)` para carimbo e rolagem de dígito.

`digit` e `digit-alt` são idênticos de propósito: alternar entre os dois
reinicia a animação **sem remontar** o elemento — necessário quando o número é
um `<input>` que não pode perder o foco. Onde o remount é aceitável, continua
valendo o `key={valor}`.

Todo o escopo respeita `prefers-reduced-motion`: cai para fade, e o que desenha
(`[data-draw]`) renderiza no estado final.

## Hierarquia da tela de execução

A **série atual domina**: carga e repetições viram números gigantes editáveis
(input real, com o alvo prescrito como placeholder esmaecido) e concluir é uma
barra de largura total. As outras séries recuam para uma linha de pauta — feitas
com o risco por cima, futuras só com o alvo — e expandem ao toque para correção.

## Referência canônica do tema

| Arquivo | O que demonstra |
|---|---|
| `student/Dashboard.jsx` | Grid assimétrico, número sangrando, pauzinhos, fita |
| `student/components/workout/CheckinSet.jsx` | Série herói, número editável, risco |
| `student/History.jsx` | Pauta de caderno, busca em linha de ficha |
| `student/MyWorkouts.jsx` | Linha-ficha clicável, grupos musculares em micro-label |
| `student/HistoryDetail.jsx` | Folha preenchida: cabeçalho de coluna uma vez, séries em pauta |
| `student/Profile.jsx` | Ficha de cadastro: nome como título, dados em linha de pauta |
| `student/WorkoutEdit.jsx` | Troca de posição com risco de caneta, barra de salvar |
| `components/student/PendingWorkoutModal.jsx` | Modal sem ícone de alerta: fita, display e uma Anilha |
| `components/layout/MobileTabBar.jsx` | Navegação do mobile: aba ativa em tinta, área segura |
| `components/student/WorkoutRecordsModal.jsx` | Carimbo de recorde |
| `src/index.css` | Blocos de modo escuro/claro, keyframes, utilitários |
| `src/store/themeStore.js` | Persistência do modo, com o escuro como padrão |

## Mobile primeiro (área do aluno)

A área do aluno é usada **principalmente no celular**, de pé, na academia e com
uma mão. As regras abaixo valem para toda tela nova dela.

**Gutter.** O padding lateral vive **só** no `PageContainer` (`px-4` = 16px no
mobile). O `<main>` do `RoleLayout` não tem padding horizontal — quando os dois
tinham, o conteúdo perdia 32px de cada lado.

**Navegação.** No mobile (< 900px) o aluno navega pela `MobileTabBar` fixa no
rodapé, montada pelo `StudentLayout` via `RoleLayout.mobileNav`; a gaveta e o
chip de usuário saem da topbar. Limite de **5 destinos** — o sexto rótulo quebra
em 360px. O que não cabe (sair da conta, gerenciar treinos) fica na tela de
perfil, a última aba. Nas telas de tarefa do treino (`/student/workout/*`) a
barra é escondida por `mobileNavHidden`, porque elas já têm a própria barra fixa
de ação.

**A aba ativa é tinta, não Anilha.** A barra conviveria com o CTA em Anilha de
quase toda tela; a Anilha fica reservada ao conteúdo. O sinal da aba é o traço
de tinta no topo mais o peso do rótulo.

**Área segura.** O `index.html` traz `viewport-fit=cover` — sem ele
`env(safe-area-inset-*)` resolve 0 e as barras fixas caem sob o indicador de
home do iPhone. Toda barra fixa no rodapé soma
`env(safe-area-inset-bottom)` ao próprio padding.

**Tipografia que cede.** Título em `ficha-display` sempre com `break-words` e um
piso de clamp que caiba em 328px — na prática `clamp(1.75rem…2.25rem, 8vw, …)`.
Quando o texto vem do banco (nome de treino, de exercício), o piso é ainda mais
baixo: ninguém controla o comprimento.

**Colunas fixas comem o conteúdo.** Em linha de lista, a soma das colunas fixas
mais os gaps não pode passar de ~45% dos 328px. O padrão é encolher a coluna do
número (`w-10 sm:w-24`) e esconder a unidade (`hidden sm:block`), nunca truncar
o nome em duas palavras.

**Alvo de toque.** Mínimo 44px (`min-h-11`); ação principal 48–56px
(`min-h-12`/`min-h-14`). Link de ação em mono tem **12px** (`text-xs`), não
11px, e tracking no máximo `0.16em` — acima disso o rótulo estoura a linha.
Rótulo longo encurta no mobile com `<span className="hidden sm:inline">`.

**Número gigante decorativo não sangra a margem no mobile.** A marca d'água do
Dashboard é `hidden lg:block`: o deslocamento negativo viraria rolagem
horizontal, e atrás de um título de 30px ela deixa de ser marca d'água.

---

## Telas do aluno fora do tema

Duas por decisão, porque são compartilhadas com a área do personal e herdam a
paleta pelos tokens escopados: `ExerciseEvolutionPanel` (em `Evolution.jsx`) e
`AssessmentCard` (em `Profile.jsx`). `PrescriptionInfo` ainda usa chips dentro
da tela de execução — é o último resíduo do visual antigo na área do aluno.
