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

### Contexto competitivo (levantado em 24/07/2026)

Capacidade é commodity neste mercado e tem teto de preço conhecido:

- **MFIT Personal** — grátis 1 aluno; R$10,90/mês 3 alunos; **R$39,90/mês
  ilimitado**. Inclui anamnese, avaliação física, prescrição, cobrança integrada
  e +1.800 vídeos de exercícios.
- **Tecnofit Personal** — **gratuito até 10 alunos ativos**, com prescrição
  ilimitada, avaliação física e app do aluno. Planos pagos a partir de R$189/mês
  (produto de studio, outro segmento).

Consequência: o concorrente direto **faz mais e cobra menos**. A escada precisa
ser competitiva por construção, e o `Standard` (RN-PLAN-002) é a resposta —
**mídia é o único custo marginal real do sistema**, então um plano sem foto nem
vídeo custa quase nada para servir e pode ser agressivo no preço sem queimar
margem.

> ⚠️ **Hipótese não validada:** a tese de que o diferencial do produto é
> *aderência e acompanhamento* (check-in diário de sono/dieta, streak, dashboard
> de pendentes, histórico de execução real) — e não prescrição de treino, que
> está comoditizada. Os preços abaixo assumem isso. Validar com os personais de
> teste antes de tratar como definitivo.

---

## RN-PLAN-002 — A escada

| | Free | Standard | Essencial | Pro |
|---|---|---|---|---|
| Preço/mês | R$0 | R$29,90 | R$59,90 | R$99,90 |
| Alunos | 3 | 20 | 50 | sem limite |
| Fotos na anamnese | — | — | ✅ | ✅ |
| Vídeos na anamnese | — | — | — | ✅ |

Diferença entre degraus, resumida:

- **Free → Standard:** 3 → 20 alunos (nenhuma feature nova)
- **Standard → Essencial:** 20 → 50 alunos, + fotos
- **Essencial → Pro:** 50 → ∞ alunos, + vídeos

### A lógica dos números

**Free em 3 alunos.** O free do MFIT dá 1 aluno; com 3 ganhamos a comparação na
porta de entrada, e segue insuficiente para tocar o negócio.

**Standard em 20 por R$29,90.** É o degrau que faz o trabalho pesado: mais barato
que o ilimitado do concorrente (R$39,90) e cobre a faixa onde vive a maioria dos
personais solo. Sem mídia, o custo de servir é quase zero.

**Essencial em 50 por R$59,90.** O salto de preço é pago por capacidade mais que
dobrada **somada** às fotos — não por foto sozinha, que não vale R$30.

**Pro ilimitado por R$99,90.** Vídeo tem o maior custo de storage e banda do
sistema, então é o único recurso que justifica o topo.

### O antigo plano "Ilimitado" foi absorvido pelo Pro

Cinco degraus é demais para um produto que ainda não vendeu, e o teto de
R$199,90 não sobrevivia ao lado de um concorrente que dá ilimitado por R$39,90.
Migration `2026_07_25_000002_restructure_plans_add_standard` move as assinaturas
antes de remover o plano.

### Em todos os planos, inclusive o Free

Prescrição completa de treino (séries, RIR, técnicas avançadas, cadência);
anamnese em texto; **avaliação física completa** (medidas, IMC, RCQ, massa
gorda/magra e variação entre avaliações); check-in de treino; check-in diário de
sono e dieta; gráficos de evolução de exercício; streak e gamificação; **ficha
em PDF**; perfil do aluno.

### Por que a avaliação física está no Free

Parece contraintuitivo soltar o gancho de conversão, mas **gancho que ninguém vê
não fisga**: o personal precisa registrar uma avaliação e ver o delta para querer
isso na base inteira dele. Quem cobra é a capacidade — o que é coerente com a
RN-PLAN-001.

### Por que o PDF não é travado

Não é capacidade nem custo marginal, e é a peça que sai com a marca do produto
para o aluno final. Travar só faz o personal mandar a ficha no WhatsApp na mão.

---

## RN-PLAN-009 — Preço não é exposto ao personal

Regra: **Valores aparecem somente no painel do admin.** O personal enxerga o
nome do plano, a capacidade de alunos e o que cada degrau libera — nunca o preço.

Motivo: a contratação não acontece pelo sistema (não há gateway) e a negociação
é feita pelo suporte. Mostrar tabela de preços numa tela que não vende gera a
pergunta "como eu assino?" sem resposta, e engessa a negociação caso a caso
durante a fase de teste.

Implementação: `Api/Trainer/PlanController::presentPlan()` **omite**
`price_cents` da resposta — o valor não trafega até o cliente, em vez de ser
apenas escondido no CSS. Há teste travando esse contrato
(`Trainer\PlanTest::test_price_is_never_exposed_to_the_trainer`).

`formatPlanPrice()` em `frontend/src/utils/plan.js` fica de uso restrito ao
painel do admin.

## RN-PLAN-003 — Trial

Regra: **30 dias de Essencial, sem cartão de crédito.**

Trinta dias porque o produto é **série temporal**: delta de avaliação física,
evolução de carga, histórico de check-in. Nada disso existe em 7 ou 14 dias —
trial curto entrega tela vazia. Além disso, carregar a base real (anamnese +
avaliação + treino montado por aluno) é trabalho de horas, feito por quem ainda
está atendendo os próprios clientes.

Sem cartão porque, num ticket abaixo de R$60 e sem marca estabelecida, exigir
cartão antes de o produto provar valor derruba o cadastro.

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
Free com 30 alunos cadastrados não perde nenhum deles — perde o direito de
adicionar o 31º e de montar treino novo.

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

Regra: Os quatro degraus (Free, Standard, Essencial, Pro) valem no lançamento.

O antigo plano Ilimitado, que ficaria fora do self-service como âncora, **deixou
de existir** — foi absorvido pelo Pro (RN-PLAN-002). Quem passa de 50 alunos já
opera como assessoria, segmento multi-trainer **descartado** por complexidade,
mas o Pro sem teto atende esse caso sem precisar de um degrau próprio.

Enquanto não há gateway, todos os planos são atribuídos manualmente pelo admin
(RN-PLAN-003), então "self-service" ainda não se aplica a nenhum deles.

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
