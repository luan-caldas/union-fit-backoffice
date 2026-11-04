"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useSessionFeedbackStats } from "@/hooks/use-workout-sessions"
import { SESSION_FEEDBACK, answerLabel } from "@/lib/constants/feedback"
import { formatDate } from "@/lib/utils/format"
import type { FeedbackPeriod } from "@/actions/feedback.actions"

const PERIODS: { value: FeedbackPeriod; label: string }[] = [
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "past", label: "Treino passado" },
]

const QUESTION = "difficulty"

export function UserSessionFeedbackChart({ userId }: { userId: string }) {
  const [period, setPeriod] = useState<FeedbackPeriod>("past")
  const { data, isLoading, isError, refetch } = useSessionFeedbackStats(userId, period)

  const known = Object.keys(SESSION_FEEDBACK[QUESTION].answers)
  const extra = data ? Object.keys(data.counts).filter((k) => !known.includes(k)) : []
  const keys = [...known, ...extra]

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold text-foreground">Respostas das sessões</h3>
          <p className="text-xs text-muted-foreground">
            {SESSION_FEEDBACK[QUESTION].label}
          </p>
        </div>
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <Button
              key={p.value}
              size="sm"
              variant={period === p.value ? "default" : "outline"}
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : isError || !data ? (
        <div className="flex items-center gap-3 text-sm text-destructive">
          Não foi possível carregar os dados.
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      ) : data.total === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma resposta no período</p>
      ) : (
        <div className="space-y-3">
          {keys.map((k) => {
            const count = data.counts[k] ?? 0
            const pct = Math.round((count / data.total) * 100)
            return (
              <div key={k} className="text-sm">
                <div className="mb-1 flex justify-between">
                  <span>{answerLabel(SESSION_FEEDBACK, QUESTION, k)}</span>
                  <span className="text-muted-foreground">
                    {count} ({pct}%)
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {data && (
        <p className="mt-4 text-xs text-muted-foreground">
          {data.total} {data.total === 1 ? "resposta" : "respostas"}
          {data.unanswered > 0 && ` · ${data.unanswered} sessões sem resposta`}
          {period === "past" && data.method && data.periodStart && data.periodEnd && (
            <>
              {" · "}
              {formatDate(data.periodStart) === formatDate(data.periodEnd)
                ? formatDate(data.periodStart)
                : `${formatDate(data.periodStart)} a ${formatDate(data.periodEnd)}`}{" "}(
              {data.method === "training"
                ? "período das sessões do treino"
                : "janela de 28 dias antes do treino atual"}
              )
            </>
          )}
          {period === "past" && !data.method && " · Nenhum treino passado encontrado"}
        </p>
      )}
    </div>
  )
}
