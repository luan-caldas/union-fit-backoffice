# Treinos de cardio no backoffice — design

**Data:** 2026-08-25
**Branch:** `feat/UNION-107-cardio-workouts`
**Referência:** `2026-08-24-cardio-workouts.md` (plano do app mobile — usado só para entender o schema e a semântica das métricas)

## Objetivo

Permitir que o admin faça CRUD completo de **treinos de cardio** de um usuário na tela
`/users/[id]`, com controles equivalentes aos do treino de musculação. Um usuário pode
ter múltiplos treinos de cardio; cada treino contém exercícios diretamente, sem o nível
intermediário de "divisão" que existe na musculação.

## Contexto e restrições já resolvidos

- As tabelas `public."workout.cardio"` e `public."workout.cardio.exercise"` **já existem**
  no Supabase, criadas pelo trabalho do mobile.
- As políticas RLS de ADMIN (INSERT/UPDATE/DELETE em linhas de outros usuários) **já
  existem**, no mesmo padrão das tabelas `workout.training.*`. Nada de SQL nesta entrega.
- A view `public."api.cardio"` **não pode ser usada**: ela filtra
  `WHERE cardio.user_uuid = auth.uid()`, e o backoffice roda com a sessão do admin, não
  do usuário dono do treino. A leitura é feita direto nas tabelas base.
- O repo **não tem infraestrutura de testes** (sem vitest/jest, sem script `test`).
  Decisão do usuário: seguir sem testes; verificação via `npm run build`, `npm run lint`
  e conferência manual no app.
- O `AGENTS.md` pede a leitura dos guias em `node_modules/next/dist/docs/`, mas um hook
  do ambiente bloqueia leitura de diretórios de dependência. O design se apoia nos
  padrões já em produção neste repo.

## Modelo de dados

### `workout.cardio`

| Coluna | Tipo | Notas |
|---|---|---|
| `uuid` | uuid PK | default `gen_random_uuid()` |
| `user_uuid` | uuid NOT NULL | FK `auth.users`, ON DELETE CASCADE |
| `name` | text NOT NULL | |
| `description` | text | |
| `duration` | integer | duração do treino **em minutos** |
| `order` | integer NOT NULL | default 0 |
| `created_at` | timestamptz NOT NULL | default `now()` |

### `workout.cardio.exercise`

| Coluna | Tipo | Unidade no banco |
|---|---|---|
| `uuid` | uuid PK | |
| `user_uuid` | uuid NOT NULL | |
| `cardio_uuid` | uuid NOT NULL | FK `workout.cardio`, ON DELETE CASCADE |
| `exercise_uuid` | uuid NOT NULL | FK `workout.exercise` |
| `order` | integer NOT NULL | default 0 |
| `pace_min_seconds` / `pace_max_seconds` | integer | segundos por km |
| `speed_min` / `speed_max` | numeric(5,2) | km/h |
| `rpm_min` / `rpm_max` | integer | rotações por minuto |
| `duration_seconds` | integer | segundos |
| `distance_meters` | integer | metros |
| `incline_degrees` | numeric(4,1) | graus |

CHECK constraints existentes — `pace_range_valid`, `speed_range_valid`, `rpm_range_valid`:

```
max IS NULL OR (min IS NOT NULL AND min <= max)
```

Ou seja: **máximo só pode existir se o mínimo existir**, e **mínimo ≤ máximo**.

## Arquitetura

Segue o padrão do fluxo de treino de musculação, que é o padrão da página `/users/[id]`:
**Server Component busca os dados → Client Components mutam via Server Actions →
`revalidatePath`**. React Query não entra aqui; ele é usado apenas nas páginas de
listagem autônomas (`/exercises`, `/methods`, `/periodization`, `/users`).

```
app/(admin)/users/[id]/page.tsx     (server)
  └─ getCardiosByUserId(id) ────────► actions/cardio.actions.ts
  └─ <UserCardioSection>            (server)
       └─ <CardiosAccordion>        (client) ── DnD nível cardio
            ├─ <CardioHeaderActions> (client) ── + exercício / editar / excluir
            └─ <CardioExerciseRow>   (client) ── DnD nível exercício
                 └─ <CardioMetricsDialog> (client)
```

### Leitura

`getCardiosByUserId(userId)` faz três queries e junta em JS, exatamente como
`getPeriodizations` já faz. Motivo de não usar *embedding* do PostgREST: os nomes das
tabelas contêm ponto (`workout.cardio.exercise`), e o ponto é o separador de sintaxe do
PostgREST — o embedding fica ambíguo e frágil.

1. `workout.cardio` filtrado por `user_uuid`, ordenado por `order`
2. `workout.cardio.exercise` filtrado por `user_uuid`, ordenado por `order`
3. `workout.exercise` com `.in("uuid", [...uuids usados])` → vira `exercise_details`

O resultado tem a mesma forma que `TrainingDivision` / `TrainingDivisionExercise`, para
que os componentes fiquem simétricos aos de musculação.

### Escrita

Uma server action por operação, todas terminando em
`revalidatePath('/users/${userId}')`:

| Treino de cardio | Exercício do treino |
|---|---|
| `addCardio(userUuid, order)` | `addExerciseToCardio(cardioUuid, exerciseUuid, userUuid, order)` |
| `updateCardio(cardioUuid, { name, description, duration }, userId)` | `removeExerciseFromCardio(cardioExerciseUuid, userId)` |
| `deleteCardio(cardioUuid, userId)` | `swapExerciseInCardio(cardioExerciseUuid, newExerciseUuid, userId)` |
| `reorderCardios(cardios, userId)` | `updateCardioExerciseMetrics(cardioExerciseUuid, metrics, userId)` |
| | `reorderCardioExercises(exercises, userId)` |

Notas:

- `addCardio` insere `name` = `"Cardio ${order + 1}"` e `order` = quantidade atual,
  espelhando `addDivision`.
- `deleteCardio` apaga os exercícios antes de apagar o treino. A FK já é
  `ON DELETE CASCADE`, mas a exclusão explícita espelha `deleteDivision` e mantém o
  comportamento previsível caso a constraint mude.
- `updateCardioExerciseMetrics` faz **um** update com as 9 colunas de métrica; campos
  vazios viram `null`.
- As duas ações de reordenação disparam `Promise.all` de updates, como `reorderExercises`.

## Conversão de unidades — `src/lib/utils/cardio-metrics.ts`

O banco guarda unidades de máquina; o formulário usa unidades humanas. Módulo de funções
puras, sem dependências:

| Métrica | Campo no formulário | Coluna |
|---|---|---|
| Pace mín / máx | `mm:ss` (min/km) | `pace_min_seconds` / `pace_max_seconds` |
| Velocidade mín / máx | decimal km/h (`10,5`) | `speed_min` / `speed_max` |
| RPM mín / máx | inteiro | `rpm_min` / `rpm_max` |
| Tempo | `mm:ss` | `duration_seconds` |
| Distância | decimal km (`2,5`) | `distance_meters` |
| Inclinação | decimal graus (`3,5`) | `incline_degrees` |

Funções: `parseMinSec` / `formatMinSec`, `parseKm` / `formatKm`,
`parseDecimal` / `formatDecimal`. O parse de decimal aceita vírgula **ou** ponto; o
format sempre emite vírgula (pt-BR). Arredondamento no parse respeita a precisão da
coluna: 2 casas para velocidade (`numeric(5,2)`), 1 casa para inclinação
(`numeric(4,1)`). Campo vazio → `null`.

O mesmo módulo expõe `buildMetricBadges(exercise)`, que retorna apenas as métricas
preenchidas, cada uma já com **nome do parâmetro + valor + unidade**:

```
Pace 5:00–5:30 min/km
Velocidade 10–12 km/h
RPM 80–90
Tempo 5 min 30 s
Distância 2,5 km
Inclinação 3°
```

Quando o máximo é `null`, o badge mostra só o valor mínimo (`Velocidade 10 km/h`).

Atenção a uma assimetria deliberada: **pace** é `mm:ss` tanto no campo quanto no badge
(é assim que se lê um pace), enquanto **tempo** é `mm:ss` no campo mas `"5 min 30 s"` no
badge — um tempo de duração lido como `5:30` seria facilmente confundido com pace. Quando
os segundos são zero, o badge de tempo omite a parte de segundos (`Tempo 5 min`).

## Componentes

Novo diretório `src/components/cardio/`:

### `cardios-accordion.tsx`

Espelha `divisions-accordion.tsx`. Um `AccordionItem` por treino de cardio, com botão
"Adicionar treino de cardio" ao final.

Dois níveis de drag-and-drop:

- **Externo** — um `DndContext` envolvendo o `Accordion`, com `SortableContext` sobre os
  uuids dos cardios. Cada `AccordionItem` é embrulhado num `<div ref={setNodeRef}>` que
  carrega `transform`/`transition`; o wrapper evita depender de o Base UI encaminhar
  `ref` e `style`. O handle (`GripVertical`) entra como primeiro filho da linha flex do
  cabeçalho, à esquerda do `AccordionTrigger`, no mesmo lugar onde `DivisionHeaderActions`
  já convive com o trigger hoje.
- **Interno** — um `DndContext` por cardio dentro do `AccordionContent`, sobre os
  exercícios. Idêntico ao que existe hoje para divisões.

Os dois `DndContext` ficam aninhados. Isso funciona no dnd-kit porque os `listeners` são
aplicados apenas ao handle específico, e cada `useSortable` se registra no `DndContext`
mais próximo. **Fallback**, caso o aninhamento se comporte mal na prática: um único
`DndContext` com dois `SortableContext` e desambiguação dentro de `onDragEnd` pelo id
ativo.

Estado local espelha os dados do servidor (lista de cardios e mapa
`cardioUuid → exercícios`), ressincronizado num `useEffect` quando a prop muda — mesmo
mecanismo do accordion de divisões. A reordenação atualiza o estado local na hora e
dispara a action dentro de `startTransition`.

### `cardio-header-actions.tsx`

Espelha `division-header-form.tsx`: três botões-ícone (adicionar exercício, editar,
excluir) e o dialog de edição com **Nome**, **Descrição** e **Duração (min)**. A exclusão
usa `confirm()` nativo, como `deleteDivision` faz hoje.

### `cardio-exercise-row.tsx`

Espelha `division-exercise-row.tsx`. Da esquerda para a direita: drag handle, thumbnail
(`getYouTubeThumbnail(video_url) ?? image_url`, com fallback para as 3 primeiras letras do
músculo), nome + músculo, badges de métrica, e as ações — editar métricas (lápis), trocar
exercício (`RefreshCw` + `ExercisePickerDialog`), remover (`ConfirmButton` + `Trash2`).

Clicar na linha ou no lápis abre o dialog de métricas, seguindo o comportamento de
"clicar no item abre" já adotado no commit `7c1cf7f`. O drag handle e os botões de ação
chamam `stopPropagation` para não dispararem o dialog junto.

### `cardio-metrics-dialog.tsx`

Formulário com seis blocos, um por métrica. Pace, velocidade e RPM têm par mín/máx; tempo,
distância e inclinação têm campo único. Todos opcionais.

Validação no cliente, antes de enviar, para não vazar erro cru do Postgres:

| Situação | Mensagem |
|---|---|
| Máximo preenchido sem mínimo | "Informe o mínimo antes do máximo" |
| Mínimo maior que máximo | "O mínimo não pode ser maior que o máximo" |
| Valor negativo | "Use um valor positivo" |
| `mm:ss` malformado | "Use o formato mm:ss" |
| Velocidade fora de `numeric(5,2)` (≥ 1000) | "Valor muito alto" |
| Inclinação fora de `numeric(4,1)` (≥ 1000) | "Valor muito alto" |

Erros aparecem inline, abaixo do campo. O botão Salvar fica desabilitado enquanto a
transição está pendente.

### `src/components/users/user-cardio-section.tsx`

Título "Cardio" e, abaixo, o accordion. Quando o usuário não tem nenhum treino de cardio,
mostra um card de estado vazio no espírito de `user-training-empty.tsx` (ícone `Activity`
do lucide, "Sem treino de cardio") **com** o botão "Adicionar treino de cardio" — ao
contrário do estado vazio de musculação, que é só informativo, já que aqui o admin cria o
primeiro treino do zero.

### Reuso sem alteração

`ExercisePickerDialog` (importado de `components/training/`), `ConfirmButton`, `Badge`,
`Dialog`, `Input`, `Label`, `Button`, `Tooltip`, `getYouTubeThumbnail`, `MUSCLE_LABELS`.
O picker não é movido de diretório para não tocar no fluxo de musculação que já funciona.

## Página

`src/app/(admin)/users/[id]/page.tsx` ganha `getCardiosByUserId(id)` no `Promise.all`
existente e renderiza `<UserCardioSection>` **abaixo** do bloco de treino. A seção de
cardio é independente: aparece mesmo quando o usuário não tem treino de musculação.

## Tipos do banco

`src/lib/supabase/database.types.ts` é gerado pelo CLI do Supabase e ainda não contém as
tabelas de cardio. Como o client é `createServerClient<Database>`, sem elas o
`.from("workout.cardio")` não compila. As entradas `Row` / `Insert` / `Update` para
`workout.cardio` e `workout.cardio.exercise` são adicionadas à mão, no formato e na ordem
alfabética que o gerador usa, para que uma futura regeneração produza um diff limpo.

## Tratamento de erros

Cada action lança `new Error("mensagem em português")` quando o Supabase retorna erro,
como todas as actions existentes. As mensagens seguem o padrão do repo:
"Erro ao carregar treinos de cardio.", "Erro ao salvar métricas.", etc.

## Verificação

1. `npm run lint`
2. `npm run build`
3. Conferência manual em `/users/[id]`: criar treino de cardio, renomear, definir duração,
   adicionar exercício, preencher cada uma das 6 métricas (com e sem máximo), conferir os
   badges, trocar exercício, reordenar exercícios, reordenar treinos, remover exercício,
   excluir treino, e verificar o estado vazio num usuário sem cardio.

## Fora de escopo

- Qualquer alteração de schema ou RLS no Supabase.
- Testes automatizados.
- Alterações no fluxo de treino de musculação.
- Exibição de cardio em qualquer tela que não seja `/users/[id]`.
