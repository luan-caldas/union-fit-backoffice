# Treinos de cardio no backoffice — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que o admin faça CRUD completo de treinos de cardio de um usuário em `/users/[id]`, incluindo métricas por exercício e reordenação de treinos e de exercícios.

**Architecture:** Server Component busca os dados via server actions; Client Components mutam via server actions com `revalidatePath`. Espelha o fluxo de treino de musculação já existente (`training.actions.ts` + `components/training/*`). Nenhuma alteração de schema ou RLS — as tabelas e políticas já existem no Supabase.

**Tech Stack:** Next.js 16.2.4 (App Router, Server Actions), React 19.2.4, TypeScript 5, Supabase JS 2.105 via `@supabase/ssr`, dnd-kit 6.3/10.0, Base UI 1.4, Tailwind 4, lucide-react.

**Spec:** `docs/superpowers/specs/2026-08-25-cardio-backoffice-design.md`

## Global Constraints

- **Sem testes automatizados.** O repo não tem vitest/jest nem script `test`. Decisão explícita do usuário: verificar com `npm run lint`, `npm run build` e conferência manual. Não adicione dependências de teste.
- **Nenhum SQL.** As tabelas `public."workout.cardio"` e `public."workout.cardio.exercise"` e as políticas RLS de ADMIN já existem no Supabase. Não crie migrations.
- **Não use a view `api.cardio`.** Ela filtra `WHERE user_uuid = auth.uid()` e retorna vazio para o admin. Leia sempre das tabelas base.
- **Não altere o fluxo de musculação.** `src/actions/training.actions.ts` e `src/components/training/*` só podem ser lidos/importados, nunca modificados.
- Toda string visível ao usuário em **português**, seguindo o tom das existentes ("Erro ao carregar treino.", "Adicionar divisão").
- Toda server action termina com `revalidatePath('/users/${userId}')`.
- Erros do Supabase viram `throw new Error("mensagem em português")`, como nas actions existentes.
- Precisão das colunas: `speed_min`/`speed_max` são `numeric(5,2)` (máx. 999,99); `incline_degrees` é `numeric(4,1)` (máx. 999,9).
- CHECK constraints do banco em pace, speed e rpm: `max IS NULL OR (min IS NOT NULL AND min <= max)`.

## Mapeamento de arquivos

### Criados

| Arquivo | Responsabilidade |
|---|---|
| `src/lib/utils/cardio-metrics.ts` | Conversão de unidades (form ↔ banco) e montagem dos badges. Funções puras, sem imports. |
| `src/actions/cardio.actions.ts` | Tipos de domínio + todas as server actions de leitura e escrita. |
| `src/components/cardio/cardio-metrics-dialog.tsx` | Formulário das 6 métricas, com validação. |
| `src/components/cardio/cardio-exercise-row.tsx` | Uma linha de exercício: thumbnail, nome, badges, ações. |
| `src/components/cardio/cardio-header-actions.tsx` | Botões e dialog de edição do cabeçalho de um treino de cardio. |
| `src/components/cardio/cardios-accordion.tsx` | Lista de treinos, os dois níveis de drag-and-drop, botão de adicionar, estado vazio. |
| `src/components/users/user-cardio-section.tsx` | Título "Cardio" + accordion. Seam da página. |

### Modificados

| Arquivo | Mudança |
|---|---|
| `src/lib/supabase/database.types.ts` | Adicionar as duas tabelas de cardio ao bloco `Tables`. |
| `src/app/(admin)/users/[id]/page.tsx` | Buscar os cardios e renderizar a seção. |

---

## Task 1: Tipos do banco para as tabelas de cardio

Sem isto nada compila: o client é `createServerClient<Database>`, então `.from("workout.cardio")` é erro de tipo enquanto a tabela não estiver declarada.

**Files:**
- Modify: `src/lib/supabase/database.types.ts` (inserir antes da entrada `"workout.exercise"`, por volta da linha 464)

**Interfaces:**
- Produces: `Database["public"]["Tables"]["workout.cardio"]` e `Database["public"]["Tables"]["workout.cardio.exercise"]`, cada uma com `Row` / `Insert` / `Update` / `Relationships`.

- [ ] **Step 1: Localizar o ponto de inserção**

Run: `grep -n '"workout.exercise": {' src/lib/supabase/database.types.ts`

Esperado: uma única linha (por volta de 464). As entradas de cardio entram **imediatamente antes** dela — o arquivo é gerado em ordem alfabética, e `workout.cardio` < `workout.cardio.exercise` < `workout.exercise`. Manter a ordem faz com que uma futura regeneração pelo CLI do Supabase produza um diff limpo.

- [ ] **Step 2: Inserir as duas entradas**

Cole exatamente isto antes da linha `"workout.exercise": {`, com a mesma indentação (6 espaços na chave da tabela):

```ts
      "workout.cardio": {
        Row: {
          created_at: string
          description: string | null
          duration: number | null
          name: string
          order: number
          user_uuid: string
          uuid: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration?: number | null
          name: string
          order?: number
          user_uuid: string
          uuid?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: number | null
          name?: string
          order?: number
          user_uuid?: string
          uuid?: string
        }
        Relationships: []
      }
      "workout.cardio.exercise": {
        Row: {
          cardio_uuid: string
          distance_meters: number | null
          duration_seconds: number | null
          exercise_uuid: string
          incline_degrees: number | null
          order: number
          pace_max_seconds: number | null
          pace_min_seconds: number | null
          rpm_max: number | null
          rpm_min: number | null
          speed_max: number | null
          speed_min: number | null
          user_uuid: string
          uuid: string
        }
        Insert: {
          cardio_uuid: string
          distance_meters?: number | null
          duration_seconds?: number | null
          exercise_uuid: string
          incline_degrees?: number | null
          order?: number
          pace_max_seconds?: number | null
          pace_min_seconds?: number | null
          rpm_max?: number | null
          rpm_min?: number | null
          speed_max?: number | null
          speed_min?: number | null
          user_uuid: string
          uuid?: string
        }
        Update: {
          cardio_uuid?: string
          distance_meters?: number | null
          duration_seconds?: number | null
          exercise_uuid?: string
          incline_degrees?: number | null
          order?: number
          pace_max_seconds?: number | null
          pace_min_seconds?: number | null
          rpm_max?: number | null
          rpm_min?: number | null
          speed_max?: number | null
          speed_min?: number | null
          user_uuid?: string
          uuid?: string
        }
        Relationships: []
      }
```

- [ ] **Step 3: Verificar que o build continua passando**

Run: `npm run build`
Expected: build conclui sem erros. Nada usa as novas tabelas ainda; esta etapa só garante que o arquivo de tipos não foi quebrado.

- [ ] **Step 4: Commit**

```bash
git add src/lib/supabase/database.types.ts
git commit -m "feat(cardio): add cardio tables to generated database types"
```

---

## Task 2: Módulo de conversão de unidades e badges

Módulo de funções puras, sem imports. Converte entre as unidades humanas do formulário e as unidades de máquina do banco, e monta os badges exibidos na linha do exercício.

**Files:**
- Create: `src/lib/utils/cardio-metrics.ts`

**Interfaces:**
- Produces:
  - `type CardioMetricColumns` — objeto com as 9 colunas de métrica, todas `number | null`
  - `type MetricBadge = { key: string; label: string; value: string }`
  - `parseMinSec(input: string): number | null | undefined`
  - `formatMinSec(totalSeconds: number | null): string`
  - `parseInteger(input: string): number | null | undefined`
  - `parseDecimal(input: string, decimals: number): number | null | undefined`
  - `formatDecimal(value: number | null, decimals: number): string`
  - `parseKm(input: string): number | null | undefined`
  - `formatKm(meters: number | null): string`
  - `formatDurationLabel(totalSeconds: number): string`
  - `buildMetricBadges(metrics: CardioMetricColumns): MetricBadge[]`

**Convenção de retorno dos `parse*`:** `null` = campo vazio (grava `NULL`); `undefined` = entrada malformada (o chamador mostra erro). Essa distinção é o que permite o dialog diferenciar "não preenchido" de "digitou errado".

- [ ] **Step 1: Criar o arquivo**

```ts
export type CardioMetricColumns = {
  pace_min_seconds: number | null
  pace_max_seconds: number | null
  speed_min: number | null
  speed_max: number | null
  rpm_min: number | null
  rpm_max: number | null
  duration_seconds: number | null
  distance_meters: number | null
  incline_degrees: number | null
}

export type MetricBadge = {
  key: string
  label: string
  value: string
}

const MIN_SEC_PATTERN = /^(\d{1,3}):([0-5]\d)$/
const INTEGER_PATTERN = /^-?\d+$/
const DECIMAL_PATTERN = /^-?\d+(\.\d+)?$/

/** "5:30" -> 330 | "" -> null | "abc" -> undefined */
export function parseMinSec(input: string): number | null | undefined {
  const trimmed = input.trim()
  if (trimmed === "") return null
  const match = MIN_SEC_PATTERN.exec(trimmed)
  if (!match) return undefined
  return Number(match[1]) * 60 + Number(match[2])
}

/** 330 -> "5:30" | null -> "" */
export function formatMinSec(totalSeconds: number | null): string {
  if (totalSeconds === null) return ""
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, "0")}`
}

/** "80" -> 80 | "" -> null | "8a" -> undefined */
export function parseInteger(input: string): number | null | undefined {
  const trimmed = input.trim()
  if (trimmed === "") return null
  if (!INTEGER_PATTERN.test(trimmed)) return undefined
  return Number(trimmed)
}

/** Aceita vírgula ou ponto. "10,55" com decimals=2 -> 10.55 | "" -> null | "x" -> undefined */
export function parseDecimal(
  input: string,
  decimals: number
): number | null | undefined {
  const trimmed = input.trim()
  if (trimmed === "") return null
  const normalized = trimmed.replace(",", ".")
  if (!DECIMAL_PATTERN.test(normalized)) return undefined
  const factor = 10 ** decimals
  return Math.round(Number(normalized) * factor) / factor
}

/** 10.5 com decimals=2 -> "10,5" | 10 -> "10" | null -> "" */
export function formatDecimal(value: number | null, decimals: number): string {
  if (value === null) return ""
  const fixed = value.toFixed(decimals)
  const trimmed = fixed.includes(".")
    ? fixed.replace(/0+$/, "").replace(/\.$/, "")
    : fixed
  return trimmed.replace(".", ",")
}

/** "2,5" -> 2500 metros | "" -> null | "x" -> undefined */
export function parseKm(input: string): number | null | undefined {
  const km = parseDecimal(input, 3)
  if (km === null || km === undefined) return km
  return Math.round(km * 1000)
}

/** 2500 -> "2,5" | null -> "" */
export function formatKm(meters: number | null): string {
  if (meters === null) return ""
  return formatDecimal(meters / 1000, 3)
}

/**
 * Rótulo de duração para o badge. Deliberadamente diferente de formatMinSec:
 * um badge "Tempo 5:30" seria confundido com pace.
 * 330 -> "5 min 30 s" | 300 -> "5 min" | 45 -> "45 s"
 */
export function formatDurationLabel(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (minutes === 0) return `${seconds} s`
  if (seconds === 0) return `${minutes} min`
  return `${minutes} min ${seconds} s`
}

function range(min: string, max: string): string {
  return max === "" ? min : `${min}–${max}`
}

/** Retorna apenas as métricas preenchidas, já formatadas com nome e unidade. */
export function buildMetricBadges(metrics: CardioMetricColumns): MetricBadge[] {
  const badges: MetricBadge[] = []

  if (metrics.pace_min_seconds !== null) {
    badges.push({
      key: "pace",
      label: "Pace",
      value: `${range(
        formatMinSec(metrics.pace_min_seconds),
        formatMinSec(metrics.pace_max_seconds)
      )} min/km`,
    })
  }

  if (metrics.speed_min !== null) {
    badges.push({
      key: "speed",
      label: "Velocidade",
      value: `${range(
        formatDecimal(metrics.speed_min, 2),
        formatDecimal(metrics.speed_max, 2)
      )} km/h`,
    })
  }

  if (metrics.rpm_min !== null) {
    badges.push({
      key: "rpm",
      label: "RPM",
      value: range(
        String(metrics.rpm_min),
        metrics.rpm_max === null ? "" : String(metrics.rpm_max)
      ),
    })
  }

  if (metrics.duration_seconds !== null) {
    badges.push({
      key: "duration",
      label: "Tempo",
      value: formatDurationLabel(metrics.duration_seconds),
    })
  }

  if (metrics.distance_meters !== null) {
    badges.push({
      key: "distance",
      label: "Distância",
      value: `${formatKm(metrics.distance_meters)} km`,
    })
  }

  if (metrics.incline_degrees !== null) {
    badges.push({
      key: "incline",
      label: "Inclinação",
      value: `${formatDecimal(metrics.incline_degrees, 1)}°`,
    })
  }

  return badges
}
```

- [ ] **Step 2: Rodar um smoke check descartável**

Não estamos adicionando infra de teste, mas o Node 24 deste ambiente executa TypeScript direto (type stripping). Rode este comando de uma vez só — ele **não** cria arquivo nenhum:

```bash
node --input-type=module -e "
const m = await import('./src/lib/utils/cardio-metrics.ts');
const eq = (label, got, want) => console.log(String(got) === String(want) ? 'ok   ' + label : 'FALHOU ' + label + ': ' + got + ' != ' + want);
eq('parseMinSec 5:30', m.parseMinSec('5:30'), 330);
eq('parseMinSec vazio', m.parseMinSec(''), null);
eq('parseMinSec invalido', m.parseMinSec('5:99'), undefined);
eq('formatMinSec 330', m.formatMinSec(330), '5:30');
eq('formatMinSec 305', m.formatMinSec(305), '5:05');
eq('formatDecimal 10.5', m.formatDecimal(10.5, 2), '10,5');
eq('formatDecimal 10', m.formatDecimal(10, 2), '10');
eq('formatDecimal 100', m.formatDecimal(100, 0), '100');
eq('parseDecimal virgula', m.parseDecimal('10,55', 2), 10.55);
eq('parseDecimal ponto', m.parseDecimal('10.556', 2), 10.56);
eq('parseKm 2,5', m.parseKm('2,5'), 2500);
eq('formatKm 2500', m.formatKm(2500), '2,5');
eq('formatDurationLabel 330', m.formatDurationLabel(330), '5 min 30 s');
eq('formatDurationLabel 300', m.formatDurationLabel(300), '5 min');
eq('formatDurationLabel 45', m.formatDurationLabel(45), '45 s');
const empty = { pace_min_seconds: null, pace_max_seconds: null, speed_min: null, speed_max: null, rpm_min: null, rpm_max: null, duration_seconds: null, distance_meters: null, incline_degrees: null };
eq('badges vazio', m.buildMetricBadges(empty).length, 0);
const one = { ...empty, speed_min: 10, speed_max: 12 };
eq('badge faixa', m.buildMetricBadges(one)[0].value, '10–12 km/h');
const solo = { ...empty, speed_min: 10 };
eq('badge sem max', m.buildMetricBadges(solo)[0].value, '10 km/h');
"
```

Expected: todas as linhas começam com `ok`. Se alguma disser `FALHOU`, corrija a função antes de seguir. Nenhum arquivo de teste é criado — este comando é descartável e não vai para o commit.

- [ ] **Step 3: Lint e build**

Run: `npm run lint && npm run build`
Expected: ambos passam.

- [ ] **Step 4: Commit**

```bash
git add src/lib/utils/cardio-metrics.ts
git commit -m "feat(cardio): add unit conversion and metric badge helpers"
```

---

## Task 3: Server actions de cardio

**Files:**
- Create: `src/actions/cardio.actions.ts`

**Interfaces:**
- Consumes (Task 1): tipos das tabelas `workout.cardio` e `workout.cardio.exercise`
- Consumes (existente): `requireAdmin` de `@/lib/auth/require-admin`, `Database` de `@/lib/supabase/database.types`
- Produces:
  - `type CardioExerciseMetrics` — as 9 colunas de métrica, `number | null`
  - `type CardioExercise = CardioExerciseMetrics & { uuid, exercise_uuid, order, exercise_details }`
  - `type Cardio = { uuid, user_uuid, name, description, duration, order, created_at, exercises }`
  - `getCardiosByUserId(userId: string): Promise<Cardio[]>`
  - `addCardio(userUuid: string, order: number): Promise<void>`
  - `updateCardio(cardioUuid: string, payload: { name?: string; description?: string | null; duration?: number | null }, userId: string): Promise<void>`
  - `deleteCardio(cardioUuid: string, userId: string): Promise<void>`
  - `reorderCardios(cardios: { uuid: string; order: number }[], userId: string): Promise<void>`
  - `addExerciseToCardio(cardioUuid: string, exerciseUuid: string, userUuid: string, order: number): Promise<void>`
  - `removeExerciseFromCardio(cardioExerciseUuid: string, userId: string): Promise<void>`
  - `swapExerciseInCardio(cardioExerciseUuid: string, newExerciseUuid: string, userId: string): Promise<void>`
  - `updateCardioExerciseMetrics(cardioExerciseUuid: string, metrics: CardioExerciseMetrics, userId: string): Promise<void>`
  - `reorderCardioExercises(exercises: { uuid: string; order: number }[], userId: string): Promise<void>`

Nota sobre `"use server"`: um módulo com essa diretiva só pode exportar funções async — exportar **tipos** é permitido, porque eles somem na compilação. `training.actions.ts` já faz exatamente isso.

- [ ] **Step 1: Criar o arquivo com tipos e leitura**

```ts
"use server"

import { requireAdmin } from "@/lib/auth/require-admin"
import { revalidatePath } from "next/cache"
import type { Database } from "@/lib/supabase/database.types"

export type CardioExerciseMetrics = {
  pace_min_seconds: number | null
  pace_max_seconds: number | null
  speed_min: number | null
  speed_max: number | null
  rpm_min: number | null
  rpm_max: number | null
  duration_seconds: number | null
  distance_meters: number | null
  incline_degrees: number | null
}

export type CardioExerciseDetails = {
  uuid: string
  name: string
  muscle: Database["public"]["Enums"]["Muscle"]
  image_url: string | null
  video_url: string | null
}

export type CardioExercise = CardioExerciseMetrics & {
  uuid: string
  exercise_uuid: string
  order: number
  exercise_details: CardioExerciseDetails | null
}

export type Cardio = {
  uuid: string
  user_uuid: string
  name: string
  description: string | null
  duration: number | null
  order: number
  created_at: string
  exercises: CardioExercise[]
}

export async function getCardiosByUserId(userId: string): Promise<Cardio[]> {
  const admin = await requireAdmin()

  const [cardiosResult, exercisesResult] = await Promise.all([
    admin
      .from("workout.cardio")
      .select("*")
      .eq("user_uuid", userId)
      .order("order"),
    admin
      .from("workout.cardio.exercise")
      .select("*")
      .eq("user_uuid", userId)
      .order("order"),
  ])

  if (cardiosResult.error) throw new Error("Erro ao carregar treinos de cardio.")
  if (exercisesResult.error) {
    throw new Error("Erro ao carregar exercícios de cardio.")
  }

  const cardios = cardiosResult.data ?? []
  const cardioExercises = exercisesResult.data ?? []

  const exerciseUuids = [...new Set(cardioExercises.map((e) => e.exercise_uuid))]
  const detailsByUuid = new Map<string, CardioExerciseDetails>()

  if (exerciseUuids.length > 0) {
    const { data, error } = await admin
      .from("workout.exercise")
      .select("uuid, name, muscle, image_url, video_url")
      .in("uuid", exerciseUuids)

    if (error) throw new Error("Erro ao carregar detalhes dos exercícios.")
    for (const detail of data ?? []) detailsByUuid.set(detail.uuid, detail)
  }

  return cardios.map((cardio) => ({
    uuid: cardio.uuid,
    user_uuid: cardio.user_uuid,
    name: cardio.name,
    description: cardio.description,
    duration: cardio.duration,
    order: cardio.order,
    created_at: cardio.created_at,
    exercises: cardioExercises
      .filter((e) => e.cardio_uuid === cardio.uuid)
      .map((e) => ({
        uuid: e.uuid,
        exercise_uuid: e.exercise_uuid,
        order: e.order,
        pace_min_seconds: e.pace_min_seconds,
        pace_max_seconds: e.pace_max_seconds,
        speed_min: e.speed_min,
        speed_max: e.speed_max,
        rpm_min: e.rpm_min,
        rpm_max: e.rpm_max,
        duration_seconds: e.duration_seconds,
        distance_meters: e.distance_meters,
        incline_degrees: e.incline_degrees,
        exercise_details: detailsByUuid.get(e.exercise_uuid) ?? null,
      })),
  }))
}
```

- [ ] **Step 2: Adicionar as actions de treino de cardio**

Cole ao final do mesmo arquivo:

```ts
export async function addCardio(userUuid: string, order: number) {
  const admin = await requireAdmin()
  const { error } = await admin.from("workout.cardio").insert({
    user_uuid: userUuid,
    name: `Cardio ${order + 1}`,
    order,
  })

  if (error) throw new Error("Erro ao adicionar treino de cardio.")
  revalidatePath(`/users/${userUuid}`)
}

export async function updateCardio(
  cardioUuid: string,
  payload: {
    name?: string
    description?: string | null
    duration?: number | null
  },
  userId: string
) {
  const admin = await requireAdmin()
  const { error } = await admin
    .from("workout.cardio")
    .update(payload)
    .eq("uuid", cardioUuid)

  if (error) throw new Error("Erro ao atualizar treino de cardio.")
  revalidatePath(`/users/${userId}`)
}

export async function deleteCardio(cardioUuid: string, userId: string) {
  const admin = await requireAdmin()

  await admin
    .from("workout.cardio.exercise")
    .delete()
    .eq("cardio_uuid", cardioUuid)

  const { error } = await admin
    .from("workout.cardio")
    .delete()
    .eq("uuid", cardioUuid)

  if (error) throw new Error("Erro ao excluir treino de cardio.")
  revalidatePath(`/users/${userId}`)
}

export async function reorderCardios(
  cardios: { uuid: string; order: number }[],
  userId: string
) {
  const admin = await requireAdmin()
  await Promise.all(
    cardios.map(({ uuid, order }) =>
      admin.from("workout.cardio").update({ order }).eq("uuid", uuid)
    )
  )
  revalidatePath(`/users/${userId}`)
}
```

`deleteCardio` apaga os exercícios antes do treino. A FK já é `ON DELETE CASCADE`, mas a exclusão explícita espelha `deleteDivision` e mantém o comportamento previsível se a constraint mudar.

- [ ] **Step 3: Adicionar as actions de exercício**

Cole ao final do mesmo arquivo:

```ts
export async function addExerciseToCardio(
  cardioUuid: string,
  exerciseUuid: string,
  userUuid: string,
  order: number
) {
  const admin = await requireAdmin()
  const { error } = await admin.from("workout.cardio.exercise").insert({
    cardio_uuid: cardioUuid,
    exercise_uuid: exerciseUuid,
    user_uuid: userUuid,
    order,
  })

  if (error) throw new Error("Erro ao adicionar exercício.")
  revalidatePath(`/users/${userUuid}`)
}

export async function removeExerciseFromCardio(
  cardioExerciseUuid: string,
  userId: string
) {
  const admin = await requireAdmin()
  const { error } = await admin
    .from("workout.cardio.exercise")
    .delete()
    .eq("uuid", cardioExerciseUuid)

  if (error) throw new Error("Erro ao remover exercício.")
  revalidatePath(`/users/${userId}`)
}

export async function swapExerciseInCardio(
  cardioExerciseUuid: string,
  newExerciseUuid: string,
  userId: string
) {
  const admin = await requireAdmin()
  const { error } = await admin
    .from("workout.cardio.exercise")
    .update({ exercise_uuid: newExerciseUuid })
    .eq("uuid", cardioExerciseUuid)

  if (error) throw new Error("Erro ao trocar exercício.")
  revalidatePath(`/users/${userId}`)
}

export async function updateCardioExerciseMetrics(
  cardioExerciseUuid: string,
  metrics: CardioExerciseMetrics,
  userId: string
) {
  const admin = await requireAdmin()
  const { error } = await admin
    .from("workout.cardio.exercise")
    .update(metrics)
    .eq("uuid", cardioExerciseUuid)

  if (error) throw new Error("Erro ao salvar métricas.")
  revalidatePath(`/users/${userId}`)
}

export async function reorderCardioExercises(
  exercises: { uuid: string; order: number }[],
  userId: string
) {
  const admin = await requireAdmin()
  await Promise.all(
    exercises.map(({ uuid, order }) =>
      admin.from("workout.cardio.exercise").update({ order }).eq("uuid", uuid)
    )
  )
  revalidatePath(`/users/${userId}`)
}
```

Diferença proposital em relação a `swapExerciseInDivision`: aquele zera `method_uuid` junto, porque um método pode não valer para o novo exercício. Cardio não tem método, e as métricas são do plano de treino, não do exercício, então a troca **preserva** as métricas.

- [ ] **Step 4: Lint e build**

Run: `npm run lint && npm run build`
Expected: ambos passam. Se o build reclamar de tipo em `.from("workout.cardio")`, a Task 1 não foi aplicada corretamente.

- [ ] **Step 5: Commit**

```bash
git add src/actions/cardio.actions.ts
git commit -m "feat(cardio): add server actions for cardio workouts CRUD"
```

---

## Task 4: Dialog de edição das métricas

**Files:**
- Create: `src/components/cardio/cardio-metrics-dialog.tsx`

**Interfaces:**
- Consumes (Task 2): `parseMinSec`, `formatMinSec`, `parseInteger`, `parseDecimal`, `formatDecimal`, `parseKm`, `formatKm`
- Consumes (Task 3): `CardioExercise`, `CardioExerciseMetrics`, `updateCardioExerciseMetrics`
- Consumes (existente): `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter`, `Button`, `Input`, `Label`
- Produces: `CardioMetricsDialog({ open, onClose, exercise, userId })`

- [ ] **Step 1: Criar o arquivo**

```tsx
"use client"

import { useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  formatDecimal,
  formatKm,
  formatMinSec,
  parseDecimal,
  parseInteger,
  parseKm,
  parseMinSec,
} from "@/lib/utils/cardio-metrics"
import { updateCardioExerciseMetrics } from "@/actions/cardio.actions"
import type {
  CardioExercise,
  CardioExerciseMetrics,
} from "@/actions/cardio.actions"

const FORMAT_MIN_SEC = "Use o formato mm:ss"
const FORMAT_NUMBER = "Use um número válido"
const NEGATIVE = "Use um valor positivo"
const MAX_WITHOUT_MIN = "Informe o mínimo antes do máximo"
const MIN_GREATER = "O mínimo não pode ser maior que o máximo"
const TOO_HIGH = "Valor muito alto"

// Limites das colunas: speed é numeric(5,2), incline é numeric(4,1).
const MAX_SPEED = 999.99
const MAX_INCLINE = 999.9

type FormState = {
  paceMin: string
  paceMax: string
  speedMin: string
  speedMax: string
  rpmMin: string
  rpmMax: string
  duration: string
  distance: string
  incline: string
}

type FieldErrors = Partial<Record<keyof FormState, string>>

type ParsedField = { value: number | null; error?: string }

function toFormState(exercise: CardioExercise): FormState {
  return {
    paceMin: formatMinSec(exercise.pace_min_seconds),
    paceMax: formatMinSec(exercise.pace_max_seconds),
    speedMin: formatDecimal(exercise.speed_min, 2),
    speedMax: formatDecimal(exercise.speed_max, 2),
    rpmMin: exercise.rpm_min === null ? "" : String(exercise.rpm_min),
    rpmMax: exercise.rpm_max === null ? "" : String(exercise.rpm_max),
    duration: formatMinSec(exercise.duration_seconds),
    distance: formatKm(exercise.distance_meters),
    incline: formatDecimal(exercise.incline_degrees, 1),
  }
}

function checkNumber(
  parsed: number | null | undefined,
  formatError: string,
  max?: number
): ParsedField {
  if (parsed === undefined) return { value: null, error: formatError }
  if (parsed !== null && parsed < 0) return { value: null, error: NEGATIVE }
  if (parsed !== null && max !== undefined && parsed > max) {
    return { value: null, error: TOO_HIGH }
  }
  return { value: parsed }
}

// Reproduz as CHECK constraints do banco antes de enviar,
// para não vazar erro cru do Postgres na tela.
function checkRange(
  min: ParsedField,
  max: ParsedField
): { minError?: string; maxError?: string } {
  if (min.error || max.error) return {}
  if (max.value !== null && min.value === null) {
    return { maxError: MAX_WITHOUT_MIN }
  }
  if (min.value !== null && max.value !== null && min.value > max.value) {
    return { minError: MIN_GREATER }
  }
  return {}
}

function validate(form: FormState): {
  metrics: CardioExerciseMetrics | null
  errors: FieldErrors
} {
  const paceMin = checkNumber(parseMinSec(form.paceMin), FORMAT_MIN_SEC)
  const paceMax = checkNumber(parseMinSec(form.paceMax), FORMAT_MIN_SEC)
  const speedMin = checkNumber(
    parseDecimal(form.speedMin, 2),
    FORMAT_NUMBER,
    MAX_SPEED
  )
  const speedMax = checkNumber(
    parseDecimal(form.speedMax, 2),
    FORMAT_NUMBER,
    MAX_SPEED
  )
  const rpmMin = checkNumber(parseInteger(form.rpmMin), FORMAT_NUMBER)
  const rpmMax = checkNumber(parseInteger(form.rpmMax), FORMAT_NUMBER)
  const duration = checkNumber(parseMinSec(form.duration), FORMAT_MIN_SEC)
  const distance = checkNumber(parseKm(form.distance), FORMAT_NUMBER)
  const incline = checkNumber(
    parseDecimal(form.incline, 1),
    FORMAT_NUMBER,
    MAX_INCLINE
  )

  const paceRange = checkRange(paceMin, paceMax)
  const speedRange = checkRange(speedMin, speedMax)
  const rpmRange = checkRange(rpmMin, rpmMax)

  const errors: FieldErrors = {}
  const assign = (
    key: keyof FormState,
    ...candidates: (string | undefined)[]
  ) => {
    const message = candidates.find(Boolean)
    if (message) errors[key] = message
  }

  assign("paceMin", paceMin.error, paceRange.minError)
  assign("paceMax", paceMax.error, paceRange.maxError)
  assign("speedMin", speedMin.error, speedRange.minError)
  assign("speedMax", speedMax.error, speedRange.maxError)
  assign("rpmMin", rpmMin.error, rpmRange.minError)
  assign("rpmMax", rpmMax.error, rpmRange.maxError)
  assign("duration", duration.error)
  assign("distance", distance.error)
  assign("incline", incline.error)

  if (Object.keys(errors).length > 0) return { metrics: null, errors }

  return {
    errors,
    metrics: {
      pace_min_seconds: paceMin.value,
      pace_max_seconds: paceMax.value,
      speed_min: speedMin.value,
      speed_max: speedMax.value,
      rpm_min: rpmMin.value,
      rpm_max: rpmMax.value,
      duration_seconds: duration.value,
      distance_meters: distance.value,
      incline_degrees: incline.value,
    },
  }
}

const GRID_CLASS = {
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
} as const

function MetricBlock({
  title,
  columns = 2,
  children,
}: {
  title: string
  columns?: 2 | 3
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <div className={`grid gap-3 ${GRID_CLASS[columns]}`}>{children}</div>
    </div>
  )
}

function MetricField({
  label,
  placeholder,
  value,
  error,
  onChange,
}: {
  label: string
  placeholder: string
  value: string
  error?: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        value={value}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

interface CardioMetricsDialogProps {
  open: boolean
  onClose: () => void
  exercise: CardioExercise
  userId: string
}

export function CardioMetricsDialog({
  open,
  onClose,
  exercise,
  userId,
}: CardioMetricsDialogProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(exercise))
  const [errors, setErrors] = useState<FieldErrors>({})
  const [isPending, startTransition] = useTransition()

  // Reidrata o formulário a cada abertura, para não mostrar
  // valores obsoletos depois de um revalidate.
  useEffect(() => {
    if (!open) return
    setForm(toFormState(exercise))
    setErrors({})
  }, [open, exercise])

  function update(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  function handleSave() {
    const { metrics, errors: nextErrors } = validate(form)
    setErrors(nextErrors)
    if (!metrics) return

    startTransition(async () => {
      await updateCardioExerciseMetrics(exercise.uuid, metrics, userId)
      onClose()
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {exercise.exercise_details?.name ?? "Exercício"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <MetricBlock title="Pace (min/km)">
            <MetricField
              label="Mínimo"
              placeholder="5:00"
              value={form.paceMin}
              error={errors.paceMin}
              onChange={(v) => update("paceMin", v)}
            />
            <MetricField
              label="Máximo"
              placeholder="5:30"
              value={form.paceMax}
              error={errors.paceMax}
              onChange={(v) => update("paceMax", v)}
            />
          </MetricBlock>

          <MetricBlock title="Velocidade (km/h)">
            <MetricField
              label="Mínimo"
              placeholder="10"
              value={form.speedMin}
              error={errors.speedMin}
              onChange={(v) => update("speedMin", v)}
            />
            <MetricField
              label="Máximo"
              placeholder="12,5"
              value={form.speedMax}
              error={errors.speedMax}
              onChange={(v) => update("speedMax", v)}
            />
          </MetricBlock>

          <MetricBlock title="RPM">
            <MetricField
              label="Mínimo"
              placeholder="80"
              value={form.rpmMin}
              error={errors.rpmMin}
              onChange={(v) => update("rpmMin", v)}
            />
            <MetricField
              label="Máximo"
              placeholder="90"
              value={form.rpmMax}
              error={errors.rpmMax}
              onChange={(v) => update("rpmMax", v)}
            />
          </MetricBlock>

          <MetricBlock title="Tempo, distância e inclinação" columns={3}>
            <MetricField
              label="Tempo (mm:ss)"
              placeholder="5:30"
              value={form.duration}
              error={errors.duration}
              onChange={(v) => update("duration", v)}
            />
            <MetricField
              label="Distância (km)"
              placeholder="2,5"
              value={form.distance}
              error={errors.distance}
              onChange={(v) => update("distance", v)}
            />
            <MetricField
              label="Inclinação (°)"
              placeholder="3"
              value={form.incline}
              error={errors.incline}
              onChange={(v) => update("incline", v)}
            />
          </MetricBlock>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Lint e build**

Run: `npm run lint && npm run build`
Expected: ambos passam. O componente ainda não é usado por ninguém.

- [ ] **Step 3: Commit**

```bash
git add src/components/cardio/cardio-metrics-dialog.tsx
git commit -m "feat(cardio): add metrics editing dialog with range validation"
```

---

## Task 5: Linha de exercício de cardio

**Files:**
- Create: `src/components/cardio/cardio-exercise-row.tsx`

**Interfaces:**
- Consumes (Task 2): `buildMetricBadges`
- Consumes (Task 3): `CardioExercise`, `removeExerciseFromCardio`, `swapExerciseInCardio`
- Consumes (Task 4): `CardioMetricsDialog`
- Consumes (existente): `ExercisePickerDialog` de `@/components/training/exercise-picker-dialog`, `ExerciseRow` de `@/actions/exercises.actions`, `Badge`, `Button`, `Tooltip`, `ConfirmButton`, `getYouTubeThumbnail`, `MUSCLE_LABELS`
- Produces: `CardioExerciseRow({ exercise, allExercises, userId, dragHandle })`

- [ ] **Step 1: Criar o arquivo**

```tsx
"use client"

import { useState, useTransition } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ConfirmButton } from "@/components/ui/confirm-button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ExercisePickerDialog } from "@/components/training/exercise-picker-dialog"
import { CardioMetricsDialog } from "./cardio-metrics-dialog"
import { buildMetricBadges } from "@/lib/utils/cardio-metrics"
import { getYouTubeThumbnail } from "@/lib/utils/youtube"
import { MUSCLE_LABELS } from "@/lib/constants/muscles"
import {
  removeExerciseFromCardio,
  swapExerciseInCardio,
} from "@/actions/cardio.actions"
import type { CardioExercise } from "@/actions/cardio.actions"
import type { ExerciseRow } from "@/actions/exercises.actions"
import type { Database } from "@/lib/supabase/database.types"
import { Pencil, RefreshCw, Trash2 } from "lucide-react"

type Muscle = Database["public"]["Enums"]["Muscle"]

interface CardioExerciseRowProps {
  exercise: CardioExercise
  allExercises: ExerciseRow[]
  userId: string
  dragHandle?: React.ReactNode
}

export function CardioExerciseRow({
  exercise,
  allExercises,
  userId,
  dragHandle,
}: CardioExerciseRowProps) {
  const [metricsOpen, setMetricsOpen] = useState(false)
  const [swapOpen, setSwapOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const thumbnail =
    getYouTubeThumbnail(exercise.exercise_details?.video_url) ??
    exercise.exercise_details?.image_url ??
    null

  const muscle = exercise.exercise_details?.muscle as Muscle | undefined
  const badges = buildMetricBadges(exercise)

  function handleRemove() {
    startTransition(async () => {
      await removeExerciseFromCardio(exercise.uuid, userId)
    })
  }

  function handleSwap(newExercise: ExerciseRow) {
    startTransition(async () => {
      await swapExerciseInCardio(exercise.uuid, newExercise.uuid, userId)
    })
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => setMetricsOpen(true)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          setMetricsOpen(true)
        }
      }}
      className="flex cursor-pointer items-center gap-3 py-2.5 px-4 border-b border-border last:border-0 hover:bg-surface-lowest"
    >
      {/* O handle tem os listeners do dnd-kit; sem stopPropagation, um clique
          nele abriria o dialog de métricas junto. */}
      <span onClick={(e) => e.stopPropagation()} className="contents">
        {dragHandle}
      </span>

      <div className="h-10 w-14 shrink-0 overflow-hidden rounded-md bg-surface-highest">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={exercise.exercise_details?.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            {muscle ? MUSCLE_LABELS[muscle]?.slice(0, 3) : "—"}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">
          {exercise.exercise_details?.name ?? "Exercício"}
        </p>
        <p className="text-xs text-muted-foreground">
          {muscle ? MUSCLE_LABELS[muscle] : "—"}
        </p>
        {badges.length > 0 ? (
          <div className="mt-1 flex flex-wrap gap-1">
            {badges.map((badge) => (
              <Badge key={badge.key} variant="outline" className="text-xs h-5">
                {badge.label} {badge.value}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">
            Sem métricas definidas
          </p>
        )}
      </div>

      <div
        className="flex items-center gap-1 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
              onClick={() => setMetricsOpen(true)}
              disabled={isPending}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Editar métricas</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
              onClick={() => setSwapOpen(true)}
              disabled={isPending}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Trocar exercício</TooltipContent>
        </Tooltip>

        <ConfirmButton
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onConfirm={handleRemove}
          disabled={isPending}
          confirmLabel="Remover"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </ConfirmButton>
      </div>

      <CardioMetricsDialog
        open={metricsOpen}
        onClose={() => setMetricsOpen(false)}
        exercise={exercise}
        userId={userId}
      />

      <ExercisePickerDialog
        open={swapOpen}
        onClose={() => setSwapOpen(false)}
        exercises={allExercises}
        onSelect={handleSwap}
      />
    </div>
  )
}
```

- [ ] **Step 2: Lint e build**

Run: `npm run lint && npm run build`
Expected: ambos passam.

- [ ] **Step 3: Commit**

```bash
git add src/components/cardio/cardio-exercise-row.tsx
git commit -m "feat(cardio): add cardio exercise row with metric badges"
```

---

## Task 6: Ações do cabeçalho de um treino de cardio

**Files:**
- Create: `src/components/cardio/cardio-header-actions.tsx`

**Interfaces:**
- Consumes (Task 3): `Cardio`, `updateCardio`, `deleteCardio`, `addExerciseToCardio`
- Consumes (existente): `ExercisePickerDialog`, `ExerciseRow`, `Dialog*`, `Button`, `Input`, `Label`
- Produces: `CardioHeaderActions({ cardio, allExercises, userUuid })`

- [ ] **Step 1: Criar o arquivo**

```tsx
"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ExercisePickerDialog } from "@/components/training/exercise-picker-dialog"
import {
  addExerciseToCardio,
  deleteCardio,
  updateCardio,
} from "@/actions/cardio.actions"
import type { Cardio } from "@/actions/cardio.actions"
import type { ExerciseRow } from "@/actions/exercises.actions"
import { Pencil, Plus, Trash2 } from "lucide-react"

interface CardioHeaderActionsProps {
  cardio: Cardio
  allExercises: ExerciseRow[]
  userUuid: string
}

export function CardioHeaderActions({
  cardio,
  allExercises,
  userUuid,
}: CardioHeaderActionsProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [name, setName] = useState(cardio.name)
  const [description, setDescription] = useState(cardio.description ?? "")
  const [duration, setDuration] = useState(String(cardio.duration ?? ""))

  function handleSave() {
    startTransition(async () => {
      await updateCardio(
        cardio.uuid,
        {
          name: name || cardio.name,
          description: description || null,
          duration: duration ? Number(duration) : null,
        },
        userUuid
      )
      setEditOpen(false)
    })
  }

  function handleDelete() {
    if (
      !confirm(
        `Excluir o treino de cardio "${cardio.name}"? Isso remove todos os exercícios.`
      )
    ) {
      return
    }
    startTransition(async () => {
      await deleteCardio(cardio.uuid, userUuid)
    })
  }

  function handleAddExercise(exercise: ExerciseRow) {
    const nextOrder = cardio.exercises.length
    startTransition(async () => {
      await addExerciseToCardio(
        cardio.uuid,
        exercise.uuid,
        userUuid,
        nextOrder
      )
    })
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground"
          onClick={(e) => {
            e.stopPropagation()
            setAddOpen(true)
          }}
          disabled={isPending}
          title="Adicionar exercício"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground"
          onClick={(e) => {
            e.stopPropagation()
            setEditOpen(true)
          }}
          disabled={isPending}
          title="Editar treino de cardio"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation()
            handleDelete()
          }}
          disabled={isPending}
          title="Excluir treino de cardio"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar Treino de Cardio</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Nome</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Cardio 1"
              />
            </div>
            <div className="space-y-1">
              <Label>Descrição</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Corrida intervalada"
              />
            </div>
            <div className="space-y-1">
              <Label>Duração (min)</Label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="30"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isPending}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ExercisePickerDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        exercises={allExercises}
        onSelect={handleAddExercise}
      />
    </>
  )
}
```

`name` cai de volta para `cardio.name` quando o campo é esvaziado, porque a coluna é `NOT NULL`. `description` esvaziada vira `null` — diferente de `updateDivision`, que usa `undefined` e portanto não consegue apagar o campo.

- [ ] **Step 2: Lint e build**

Run: `npm run lint && npm run build`
Expected: ambos passam.

- [ ] **Step 3: Commit**

```bash
git add src/components/cardio/cardio-header-actions.tsx
git commit -m "feat(cardio): add cardio header actions and edit dialog"
```

---

## Task 7: Accordion de cardios, seção e wiring da página

Os três arquivos desta task precisam existir juntos para que qualquer coisa apareça na tela — separá-los produziria commits que não renderizam nada.

**Files:**
- Create: `src/components/cardio/cardios-accordion.tsx`
- Create: `src/components/users/user-cardio-section.tsx`
- Modify: `src/app/(admin)/users/[id]/page.tsx`

**Interfaces:**
- Consumes (Task 3): `Cardio`, `CardioExercise`, `addCardio`, `reorderCardios`, `reorderCardioExercises`, `getCardiosByUserId`
- Consumes (Task 5): `CardioExerciseRow`
- Consumes (Task 6): `CardioHeaderActions`
- Consumes (existente): `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`, `Button`, `ExerciseRow`
- Produces: `CardiosAccordion({ cardios, allExercises, userId })`, `UserCardioSection({ cardios, allExercises, userId })`

- [ ] **Step 1: Criar `src/components/cardio/cardios-accordion.tsx`**

```tsx
"use client"

import { useEffect, useState, useTransition } from "react"
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { CardioExerciseRow } from "./cardio-exercise-row"
import { CardioHeaderActions } from "./cardio-header-actions"
import {
  addCardio,
  reorderCardioExercises,
  reorderCardios,
} from "@/actions/cardio.actions"
import type { Cardio, CardioExercise } from "@/actions/cardio.actions"
import type { ExerciseRow } from "@/actions/exercises.actions"
import { Activity, GripVertical, Plus } from "lucide-react"

interface CardiosAccordionProps {
  cardios: Cardio[]
  allExercises: ExerciseRow[]
  userId: string
}

function DragHandle({
  listeners,
  attributes,
}: {
  listeners: ReturnType<typeof useSortable>["listeners"]
  attributes: ReturnType<typeof useSortable>["attributes"]
}) {
  return (
    <button
      {...listeners}
      {...attributes}
      className="cursor-grab touch-none text-muted-foreground hover:text-foreground p-1 -ml-1 shrink-0"
      tabIndex={-1}
    >
      <GripVertical className="h-4 w-4" />
    </button>
  )
}

function SortableExerciseRow({
  exercise,
  allExercises,
  userId,
}: {
  exercise: CardioExercise
  allExercises: ExerciseRow[]
  userId: string
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.uuid })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? "opacity-50 relative z-50" : ""}
    >
      <CardioExerciseRow
        exercise={exercise}
        allExercises={allExercises}
        userId={userId}
        dragHandle={<DragHandle listeners={listeners} attributes={attributes} />}
      />
    </div>
  )
}

function SortableCardioItem({
  cardio,
  exercises,
  allExercises,
  userId,
  onExerciseDragEnd,
}: {
  cardio: Cardio
  exercises: CardioExercise[]
  allExercises: ExerciseRow[]
  userId: string
  onExerciseDragEnd: (cardioUuid: string, event: DragEndEvent) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cardio.uuid })

  // O transform vai num wrapper, e não no AccordionItem, para não depender
  // de o Base UI encaminhar ref e style.
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? "opacity-50 relative z-50" : ""}
    >
      <AccordionItem
        value={cardio.uuid}
        className="rounded-lg border border-border bg-white overflow-hidden"
      >
        <div className="flex items-center px-4">
          <DragHandle listeners={listeners} attributes={attributes} />
          <AccordionTrigger className="flex-1 py-3 hover:no-underline">
            <div className="flex items-center gap-3 text-left">
              <span className="font-semibold text-sm">{cardio.name}</span>
              {cardio.description && (
                <span className="text-xs text-muted-foreground hidden sm:block">
                  {cardio.description}
                </span>
              )}
              {cardio.duration && (
                <span className="text-xs text-muted-foreground">
                  {cardio.duration} min
                </span>
              )}
              <span className="text-xs text-muted-foreground ml-auto mr-2">
                {exercises.length} exercício
                {exercises.length !== 1 ? "s" : ""}
              </span>
            </div>
          </AccordionTrigger>
          <CardioHeaderActions
            cardio={cardio}
            allExercises={allExercises}
            userUuid={userId}
          />
        </div>
        <AccordionContent className="p-0">
          {exercises.length === 0 ? (
            <p className="px-4 py-6 text-sm text-center text-muted-foreground">
              Nenhum exercício neste treino
            </p>
          ) : (
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={(event) => onExerciseDragEnd(cardio.uuid, event)}
            >
              <SortableContext
                items={exercises.map((e) => e.uuid)}
                strategy={verticalListSortingStrategy}
              >
                <div>
                  {exercises.map((exercise) => (
                    <SortableExerciseRow
                      key={exercise.uuid}
                      exercise={exercise}
                      allExercises={allExercises}
                      userId={userId}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </AccordionContent>
      </AccordionItem>
    </div>
  )
}

function sortedByOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order)
}

function exercisesByCardioFrom(
  cardios: Cardio[]
): Record<string, CardioExercise[]> {
  return Object.fromEntries(
    cardios.map((c) => [c.uuid, sortedByOrder(c.exercises)])
  )
}

export function CardiosAccordion({
  cardios: initialCardios,
  allExercises,
  userId,
}: CardiosAccordionProps) {
  const [isPending, startTransition] = useTransition()
  const [cardios, setCardios] = useState(() => sortedByOrder(initialCardios))
  const [exercisesByCardio, setExercisesByCardio] = useState(() =>
    exercisesByCardioFrom(initialCardios)
  )

  // Ressincroniza com o servidor depois de cada revalidatePath.
  useEffect(() => {
    setCardios(sortedByOrder(initialCardios))
    setExercisesByCardio(exercisesByCardioFrom(initialCardios))
  }, [initialCardios])

  function handleAddCardio() {
    startTransition(async () => {
      await addCardio(userId, cardios.length)
    })
  }

  function handleCardioDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setCardios((prev) => {
      const oldIndex = prev.findIndex((c) => c.uuid === active.id)
      const newIndex = prev.findIndex((c) => c.uuid === over.id)
      if (oldIndex === -1 || newIndex === -1) return prev

      const reordered = arrayMove(prev, oldIndex, newIndex)
      startTransition(async () => {
        await reorderCardios(
          reordered.map((c, i) => ({ uuid: c.uuid, order: i })),
          userId
        )
      })
      return reordered
    })
  }

  function handleExerciseDragEnd(cardioUuid: string, event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setExercisesByCardio((prev) => {
      const exercises = prev[cardioUuid] ?? []
      const oldIndex = exercises.findIndex((e) => e.uuid === active.id)
      const newIndex = exercises.findIndex((e) => e.uuid === over.id)
      if (oldIndex === -1 || newIndex === -1) return prev

      const reordered = arrayMove(exercises, oldIndex, newIndex)
      startTransition(async () => {
        await reorderCardioExercises(
          reordered.map((e, i) => ({ uuid: e.uuid, order: i })),
          userId
        )
      })
      return { ...prev, [cardioUuid]: reordered }
    })
  }

  return (
    <div className="space-y-2">
      {cardios.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-8 text-center">
          <Activity className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
          <p className="font-medium text-foreground">Sem treino de cardio</p>
          <p className="text-sm text-muted-foreground mt-1">
            Este usuário ainda não possui treinos de cardio
          </p>
        </div>
      ) : (
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleCardioDragEnd}
        >
          <SortableContext
            items={cardios.map((c) => c.uuid)}
            strategy={verticalListSortingStrategy}
          >
            <Accordion className="space-y-2">
              {cardios.map((cardio) => (
                <SortableCardioItem
                  key={cardio.uuid}
                  cardio={cardio}
                  exercises={exercisesByCardio[cardio.uuid] ?? []}
                  allExercises={allExercises}
                  userId={userId}
                  onExerciseDragEnd={handleExerciseDragEnd}
                />
              ))}
            </Accordion>
          </SortableContext>
        </DndContext>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={handleAddCardio}
        disabled={isPending}
        className="gap-1.5"
      >
        <Plus className="h-3.5 w-3.5" />
        Adicionar treino de cardio
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: Criar `src/components/users/user-cardio-section.tsx`**

```tsx
import { CardiosAccordion } from "@/components/cardio/cardios-accordion"
import type { Cardio } from "@/actions/cardio.actions"
import type { ExerciseRow } from "@/actions/exercises.actions"

interface UserCardioSectionProps {
  cardios: Cardio[]
  allExercises: ExerciseRow[]
  userId: string
}

export function UserCardioSection({
  cardios,
  allExercises,
  userId,
}: UserCardioSectionProps) {
  return (
    <div>
      <h3 className="font-semibold text-foreground mb-3">Cardio</h3>
      <CardiosAccordion
        cardios={cardios}
        allExercises={allExercises}
        userId={userId}
      />
    </div>
  )
}
```

- [ ] **Step 3: Adicionar os imports em `src/app/(admin)/users/[id]/page.tsx`**

Junto dos imports existentes:

```tsx
import { UserCardioSection } from "@/components/users/user-cardio-section"
import { getCardiosByUserId } from "@/actions/cardio.actions"
```

- [ ] **Step 4: Buscar os cardios no `Promise.all` existente**

Substitua o bloco de destructuring por:

```tsx
  const [
    { user, infoWorkout, subscription },
    training,
    allExercises,
    methods,
    cardios,
  ] = await Promise.all([
    getUserById(id),
    getTrainingByUserId(id),
    getExercises(),
    getMethods(),
    getCardiosByUserId(id),
  ])
```

- [ ] **Step 5: Renderizar a seção**

Logo **depois** do `</div>` que fecha o bloco `<h3>Treino</h3>`, e ainda dentro do `<div className="max-w-3xl space-y-4">`, adicione:

```tsx
          <UserCardioSection
            cardios={cardios}
            allExercises={allExercises}
            userId={id}
          />
```

- [ ] **Step 6: Lint e build**

Run: `npm run lint && npm run build`
Expected: ambos passam.

- [ ] **Step 7: Commit**

```bash
git add src/components/cardio/cardios-accordion.tsx src/components/users/user-cardio-section.tsx "src/app/(admin)/users/[id]/page.tsx"
git commit -m "feat(cardio): render cardio section with reorderable workouts"
```

---

## Task 8: Verificação manual end-to-end

Última task. Não escreve código de produção — existe para provar que o conjunto funciona contra o Supabase real, já que não há testes automatizados.

**Files:** nenhum (só correções, se algo falhar)

- [ ] **Step 1: Subir o app**

```bash
npm run dev
```

Abra `http://localhost:3000`, faça login com um usuário ADMIN e navegue até `/users/<id>` de um usuário qualquer.

- [ ] **Step 2: Percorrer o roteiro**

Confira cada item. Se algum falhar, corrija e volte ao Step 1.

- [ ] Usuário sem cardio mostra o card "Sem treino de cardio" e o botão "Adicionar treino de cardio"
- [ ] "Adicionar treino de cardio" cria um treino chamado `Cardio 1`; um segundo clique cria `Cardio 2`
- [ ] O lápis do cabeçalho abre o dialog; salvar nome, descrição e duração atualiza o cabeçalho
- [ ] Esvaziar a descrição e salvar realmente apaga a descrição
- [ ] O `+` do cabeçalho abre o seletor de exercícios; escolher um adiciona a linha no treino
- [ ] Uma linha sem métricas mostra "Sem métricas definidas"
- [ ] Clicar na linha abre o dialog de métricas; clicar no lápis também
- [ ] Clicar no handle de arrastar ou nos botões de ação **não** abre o dialog de métricas
- [ ] Preencher pace `5:00`/`5:30` gera o badge `Pace 5:00–5:30 min/km`
- [ ] Preencher só o pace mínimo gera `Pace 5:00 min/km`
- [ ] Preencher só o pace **máximo** mostra o erro "Informe o mínimo antes do máximo" e não salva
- [ ] Pace mínimo maior que o máximo mostra "O mínimo não pode ser maior que o máximo" e não salva
- [ ] Pace `5:99` mostra "Use o formato mm:ss"
- [ ] Velocidade `10,5` gera `Velocidade 10,5 km/h` e persiste após recarregar a página
- [ ] RPM `80`/`90` gera `RPM 80–90`
- [ ] Tempo `5:30` gera `Tempo 5 min 30 s`; tempo `5:00` gera `Tempo 5 min`
- [ ] Distância `2,5` gera `Distância 2,5 km`
- [ ] Inclinação `3` gera `Inclinação 3°`
- [ ] Apagar um campo de métrica e salvar remove o badge correspondente
- [ ] Trocar o exercício mantém as métricas
- [ ] Remover exercício pede confirmação inline e remove
- [ ] Arrastar exercícios dentro de um treino reordena, e a ordem sobrevive ao reload
- [ ] Arrastar treinos de cardio reordena, e a ordem sobrevive ao reload
- [ ] Excluir um treino pede confirmação e remove o treino e seus exercícios
- [ ] A seção de cardio aparece mesmo em usuário **sem** treino de musculação
- [ ] A seção de musculação continua funcionando exatamente como antes

- [ ] **Step 3: Verificação final**

Run: `npm run lint && npm run build`
Expected: ambos passam.

- [ ] **Step 4: Commit de eventuais correções**

Se o roteiro exigiu correções:

```bash
git add -A
git commit -m "fix(cardio): address issues found in manual verification"
```

Se nada precisou mudar, não há o que commitar — a task termina aqui.
