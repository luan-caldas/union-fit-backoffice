"use client"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useTrainingFeedbackHistory } from "@/hooks/use-workout-sessions"
import {
  CYCLE_FEEDBACK,
  answerLabel,
  questionLabel,
} from "@/lib/constants/feedback"
import { formatDate, formatDateTime } from "@/lib/utils/format"

export function UserCycleFeedbackHistory({ userId }: { userId: string }) {
  const { data, isLoading, isError, refetch } = useTrainingFeedbackHistory(userId)

  return (
    <div>
      <h3 className="font-semibold text-foreground mb-3">Feedback dos ciclos</h3>
      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : isError ? (
        <div className="flex items-center gap-3 text-sm text-destructive">
          Não foi possível carregar os dados.
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      ) : !data || data.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-5 text-sm text-muted-foreground">
          Nenhuma resposta de ciclo registrada
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((block, i) => {
            const byQuestion = new Map(block.answers.map((a) => [a.question, a]))
            const extra = block.answers.filter((a) => !(a.question in CYCLE_FEEDBACK))
            const rows = [
              ...Object.keys(CYCLE_FEEDBACK).map((q) => ({
                q,
                a: byQuestion.get(q),
              })),
              ...extra.map((a) => ({ q: a.question, a })),
            ]
            return (
              <div
                key={block.training_uuid}
                className="rounded-xl border border-border bg-white p-5"
              >
                <p className="mb-3 text-sm font-medium">
                  {block.isCurrent
                    ? "Treino atual"
                    : i === 0 || (i === 1 && data[0].isCurrent)
                      ? "Treino passado"
                      : "Treino anterior"}
                  {block.periodStart && block.periodEnd && (
                    <span className="ml-2 font-normal text-muted-foreground">
                      {formatDate(block.periodStart) === formatDate(block.periodEnd)
                        ? formatDate(block.periodStart)
                        : `${formatDate(block.periodStart)} a ${formatDate(block.periodEnd)}`}
                    </span>
                  )}
                </p>
                <dl className="space-y-3 text-sm">
                  {rows.map(({ q, a }) => (
                    <div key={q}>
                      <dt className="text-muted-foreground">
                        {questionLabel(CYCLE_FEEDBACK, q)}
                      </dt>
                      <dd className="font-medium">
                        {a ? answerLabel(CYCLE_FEEDBACK, q, a.answer) : "—"}
                        {a && (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            {formatDateTime(a.answered_at)}
                          </span>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
