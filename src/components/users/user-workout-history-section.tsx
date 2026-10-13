"use client"

import { Fragment, useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  useWorkoutSessionExercises,
  useWorkoutSessions,
} from "@/hooks/use-workout-sessions"
import { formatDateTime, formatDuration, formatTime } from "@/lib/utils/format"
import type {
  WorkoutSession,
  WorkoutSessionExercise,
} from "@/actions/workout-session.actions"

const COLUMNS = 6

function formatWeight(ex: WorkoutSessionExercise): string | null {
  const value = ex.input_unit === "POUND" ? ex.weight_pounds : ex.weight_kilograms
  if (value == null) return null
  return `${Number(value.toFixed(2))} ${ex.input_unit === "POUND" ? "lb" : "kg"}`
}

function ErrorMessage({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex items-center gap-3 text-sm text-destructive">
      Não foi possível carregar os dados.
      <Button variant="outline" size="sm" onClick={onRetry}>
        Tentar novamente
      </Button>
    </div>
  )
}

function SessionExercises({ sessionUuid }: { sessionUuid: string }) {
  const { data, isLoading, isError, refetch } = useWorkoutSessionExercises(
    sessionUuid,
    true
  )

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-4 w-56" />
      </div>
    )
  }
  if (isError) return <ErrorMessage onRetry={() => refetch()} />
  if (!data || data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum exercício registrado nesta sessão.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-border">
      {data.map((ex) => {
        const weight = formatWeight(ex)
        return (
          <li key={ex.uuid} className="flex items-center gap-3 py-2 text-sm">
            <span className="w-6 text-xs text-muted-foreground">
              {ex.exercise_order}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{ex.exercise_name}</p>
              {ex.method_name && (
                <p className="text-xs text-muted-foreground">{ex.method_name}</p>
              )}
            </div>
            {ex.sets_done != null && (
              <span className="text-xs text-muted-foreground">
                {ex.sets_done}
                {ex.sets_planned != null ? `/${ex.sets_planned}` : ""} séries
              </span>
            )}
            {weight && <span className="text-xs">{weight}</span>}
            <span className="text-xs text-muted-foreground">
              {formatTime(ex.completed_at)}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

function SessionRow({ session }: { session: WorkoutSession }) {
  const [open, setOpen] = useState(false)

  return (
    <Fragment>
      <TableRow
        className="cursor-pointer hover:bg-surface-lowest"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <TableCell className="w-8">
          {open ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </TableCell>
        <TableCell>
          <p className="font-medium">{formatDateTime(session.finished_at)}</p>
          <p className="text-xs text-muted-foreground">
            Início: {formatDateTime(session.started_at)}
          </p>
        </TableCell>
        <TableCell>
          <Badge variant="secondary">
            {session.workout_type === "cardio" ? "Cardio" : "Treino"}
          </Badge>
        </TableCell>
        <TableCell>{session.division_name}</TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs">
              {formatDuration(session.started_at, session.finished_at)}
            </span>
            {session.auto_finished && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className="bg-amber-100 text-amber-700">
                    Finalizado automaticamente
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  O app finalizou esta sessão automaticamente; a duração pode
                  estar inflada.
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </TableCell>
        <TableCell>{session.completion_percentage}%</TableCell>
      </TableRow>
      {open && (
        <TableRow>
          <TableCell colSpan={COLUMNS} className="bg-surface-lowest">
            <SessionExercises sessionUuid={session.uuid} />
          </TableCell>
        </TableRow>
      )}
    </Fragment>
  )
}

export function UserWorkoutHistorySection({ userId }: { userId: string }) {
  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useWorkoutSessions(userId)

  const sessions = data?.pages.flatMap((p) => p.sessions) ?? []

  return (
    <div>
      <h3 className="font-semibold text-foreground mb-3">Histórico de treinos</h3>

      {isError && !data ? (
        <ErrorMessage onRetry={() => refetch()} />
      ) : (
        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>Término</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Conclusão</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={COLUMNS}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : sessions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={COLUMNS}
                      className="py-10 text-center text-muted-foreground"
                    >
                      Este usuário ainda não registrou treinos
                    </TableCell>
                  </TableRow>
                ) : (
                  sessions.map((s) => <SessionRow key={s.uuid} session={s} />)
                )}
              </TableBody>
            </Table>
          </div>

          {isError && <ErrorMessage onRetry={() => fetchNextPage()} />}

          {hasNextPage && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                disabled={isFetchingNextPage}
                onClick={() => fetchNextPage()}
              >
                {isFetchingNextPage ? "Carregando..." : "Carregar mais"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
