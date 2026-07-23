# Regras de Negócio — Planos e Assinatura

> Fonte única das regras de monetização. Decisões tomadas em 23–24/07/2026.
> As regras de produto (avaliação física, anamnese, check-in etc.) continuam em
> `docs/regras-de-negocio.md`.

---

## Status: decidido ≠ implementado

Este documento descreve o **modelo alvo**. Boa parte ainda não existe no código.

| | Estado |
|---|---|
| Tabelas `plans` e `subscriptions` | ✅ no código |
| Atribuição manual pelo admin | ✅ no código |
| Card de plano do personal (leitura) | ✅ no código |
| Contagem de vaga (CPF + cooldown) | ✅ no código |
| Validação de CPF com dígito verificador | ✅ no código |
| Seed com os valores finais desta página | ✅ no código |
| Página "Planos" do personal (leitura) | ✅ no código |
| **Qualquer bloqueio por plano** | ❌ pendente |
| **Trial automatizado** | ❌ pendente (roda à mão) |
| **Gateway de pagamento** | ❌ pendente |

⚠️ **Hoje nada é bloqueado.** As colunas `allows_*` e `student_limit` existem como
dado, mas nenhum código as lê. Um personal no Free com 20 alunos opera normalmente.

---

## RN-PLAN-001 — Eixo de cobrança

Regra: O produto é vendido por **capacidade de alunos**. Vender por módulo foi
avaliado e **rejeitado**: fragmenta a venda e multiplica gate no código.

As **únicas** duas features presas à escada são fotos e vídeos na anamnese, e
estão presas por **custo marginal** (storage e banda), não por estratégia
comercial. Tudo o mais está em todos os planos, inclusive no Free.

Princípio que separa o que trava do que não trava: **travar capacidade e custo
marginal; nunca travar engajamento, onboarding ou o diferencial de prescrição.**

---

## RN-PLAN-002 — A escada

| | Free | Essencial | Pro | Ilimitado |
|---|---|---|---|---|
| Preço/mês | R$0 | R$69,90 | R$129,90 | R$199,90 |
| Alunos | **1** | 15 | 40 | sem limite |
| Fotos na anamnese | — | ✅ | ✅ | ✅ |
| Vídeos na anamnese | — | — | ✅ | ✅ |

Diferença entre degraus, resumida:

- **Free → Essencial:** 1 → 15 alunos, + fotos
- **Essencial → Pro:** 15 → 40 alunos, + vídeos
- **Pro → Ilimitado:** 40 → ∞ alunos (nenhuma feature nova)

### Em todos os planos, inclusive o Free

Prescrição completa de treino (séries, RIR, técnicas avançadas, cadência);
anamnese em texto; **avaliação física completa** (medidas, IMC, RCQ, massa
gorda/magra e variação entre avaliações); check-in de treino; check-in diário de
sono e dieta; gráficos de evolução de exercício; streak e gamificação; **ficha
em PDF**; perfil do aluno.

### Por que o Free tem 1 aluno e não 3

Com 3, um personal iniciante roda o negócio de graça para sempre. Com 1 fica
inequívoco que é demonstração, não ferramenta de trabalho.

### Por que a avaliação física está no Free

Parece contraintuitivo soltar o gancho de conversão, mas **gancho que ninguém vê
não fisga**: o personal precisa registrar uma avaliação e ver o delta para querer
isso nos 15 alunos dele. Com o Free em 1 aluno, quem cobra é a capacidade — o que
é coerente com a RN-PLAN-001.

### Por que o PDF não é travado

Não é capacidade nem custo marginal, e é a peça que sai com a marca do produto
para o aluno final. Travar só faz o personal mandar a ficha no WhatsApp na mão.

---

## RN-PLAN-003 — Trial

Regra: **30 dias de Essencial, sem cartão de crédito.**

Trinta dias porque o produto é **série temporal**: delta de avaliação física,
evolução de carga, histórico de check-in. Nada disso existe em 7 ou 14 dias —
trial curto entrega tela vazia. Além disso, carregar 15 alunos (anamnese +
avaliação + treino montado) é trabalho de horas, feito por quem ainda está
atendendo os próprios clientes.

Sem cartão porque, num ticket de R$69,90 e sem marca estabelecida, exigir cartão
antes de o produto provar valor derruba o cadastro.

**Hoje o trial roda manualmente:** o admin atribui Essencial com `ends_at` em 30
dias. O `Subscription::scopeCurrent()` já trata o vencimento — expirada, a
assinatura deixa de ser vigente sozinha. Não é preciso construir nada para testar
a hipótese.

---

## RN-PLAN-004 — Contagem de vaga

Regra: A vaga é contabilizada **no momento do cadastro do aluno** e a unidade é o
**CPF distinto** — a identidade da pessoa é o que ocupa o lugar.

Remover um aluno **não libera a vaga imediatamente**: ela fica retida por
`StudentProfile::SLOT_RELEASE_DAYS` (30 dias). Sem essa retenção, bastaria
remover e recadastrar em sequência para caber num plano menor que o uso real.

Deliberadamente **não** limitamos a quantidade de treinos: puniria justamente o
coach que faz periodização, que é o cliente-alvo.

Onde: `StudentProfile::usedSlotsFor()` e `usedSlotsSubquery()` — a regra existe em
um lugar só, consumida por `Trainer/PlanController` e `Admin/TrainerController`.

Ver também **RN-STUDENT-005** (validação de CPF por dígito verificador): como o
CPF é a chave da vaga, um CPF inventado seria uma vaga fantasma.

---

## RN-PLAN-005 — O limite governa escrita, não leitura

Regra: **Acima do limite do plano, a conta não cria nada novo.** Nada é apagado,
escondido ou bloqueado.

Bloqueado acima do limite:

- Cadastrar aluno novo
- **Criar treino**
- **Editar treino**
- Subir foto ou vídeo
- Registrar avaliação física nova

Nunca bloqueado, em nenhum cenário:

- **Acesso do aluno ao próprio treino**
- Check-in de treino e check-in diário
- Emissão do PDF da ficha
- Consulta a tudo que já foi produzido (treinos, avaliações, mídias, histórico)

### Por que a edição de treino entra junto

Bloquear só a criação fura o gate na primeira semana: o personal para de criar
treino novo e passa a reescrever os existentes a cada ciclo — mesmo trabalho, de
graça.

O custo é assumido com os olhos abertos: se um aluno se machuca e o treino precisa
mudar, o personal não consegue. Mas esse é justamente o momento de necessidade
concreta e imediata — o melhor momento possível para cobrar.

### Por que treino é o gatilho, e não o cadastro de aluno

O ciclo de periodização (4–8 semanas) é o **relógio natural do produto**. Travar
a criação de treino faz o personal bater na parede num prazo garantido, para todo
mundo, exatamente quando o valor está sendo consumido.

"Não cadastra o 16º aluno" dispara aleatoriamente e, para quem tem base estável,
pode não disparar nunca.

### Por que check-in nunca é bloqueado

Quem faz check-in é **o aluno**, que não é o cliente pagante. Bloquear ali pune a
pessoa errada e apaga justamente o histórico que sustenta a conversa de venda.

---

## RN-PLAN-006 — Expiração não é porta fechada

Regra: Ao expirar o trial (ou a assinatura) sem renovação, **nada é removido**.
A base inteira permanece visível e os alunos seguem logando e treinando
normalmente. Aplica-se a RN-PLAN-005: o que trava é produzir coisa nova.

O limite vale **na criação, nunca retroativamente**. Um personal que caiu para o
Free com 15 alunos cadastrados não perde nenhum deles — perde o direito de
adicionar o 16º e de montar treino novo.

Consequência deliberada: a conversa de venda deixa de ser "assine" e vira "sua
base está montada, destrave para continuar".

> Motivo pelo qual bloquear alunos foi **rejeitado**: os alunos são usuários do
> sistema. Bloquear do 4º ao 15º faria doze pessoas abrirem o app sem encontrar o
> treino delas — e reclamarem com o personal, que passa vergonha na frente dos
> próprios clientes. Isso não gera conversão, gera desinstalação.

---

## RN-PLAN-007 — Histórico de assinatura

Regra: Trocar de plano **não sobrescreve** o registro anterior: a assinatura
vigente vira `canceled` e uma nova é criada, em transação.

Assinatura vigente = `status = active` **e** `ends_at` nulo ou futuro
(`Subscription::scopeCurrent`). `ends_at` nulo significa sem vencimento, que é o
caso das atribuições manuais permanentes.

O formato da tabela já é o de um gateway (status, vigência, origem). A integração
futura adiciona colunas de id externo e grava **na mesma tabela** com `source`
diferente de `manual` — sem refatorar controllers nem telas.

Onde: `app/Models/Subscription.php`, `Admin/SubscriptionController::update`.

---

## RN-PLAN-008 — Escopo de lançamento

Regra: Self-service apenas **Free, Essencial e Pro**.

O Ilimitado fica na página de preços como "acima de 40 alunos, fale com a gente",
sem checkout. Quem passa de 40 alunos já opera como assessoria — segmento
multi-trainer que foi **descartado** por complexidade. Como âncora de preço ele
funciona igual sem cobrança automatizada, e não gasta o recurso escasso (tempo de
integração de billing) no cliente errado.

---

## Pendências de implementação

Em ordem sugerida:

1. ~~Migration de `UPDATE` no seed~~ — feito em
   `2026_07_25_000001_align_plans_with_final_ladder`.
2. **Rodar o trial à mão** pelo admin (Essencial + `ends_at` em 30 dias) e medir
   conversão antes de automatizar qualquer coisa.
3. **Gate de escrita (RN-PLAN-005)** — comparação `usedSlotsFor()` vs
   `student_limit` nos pontos de criação/edição.
4. **Trial automatizado** — atribuição no cadastro do personal, aviso de
   expiração.
5. **Gateway** (Asaas/Pagar.me para PIX + cartão recorrente).

### Bloqueador conhecido, não relacionado a planos

A unicidade do CPF é a nível de coluna e **não ignora soft delete**: um aluno
removido continua segurando o CPF, então o mesmo CPF nunca pode ser recadastrado
— nem após o cooldown, nem por outro personal. Reforça o anti-fraude, mas impede
o retorno legítimo de um ex-aluno. Correção seria índice único parcial
(`cpf` + `deleted_at is null`) ou reativação do registro existente.
