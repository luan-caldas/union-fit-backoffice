"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useTrainingLevelDistribution } from "@/hooks/use-dashboard-charts"

export function DashboardTrainingLevelChart() {
  const { data, isLoading, isError, refetch } = useTrainingLevelDistribution()
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    setAnimated(false)
    const id = setTimeout(() => setAnimated(true), 50)
    return () => clearTimeout(id)
  }, [data])

  const total = (data ?? []).reduce((sum, p) => sum + p.count, 0)

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <h3 className="font-semibold text-foreground mb-4">Nível dos treinos</h3>
      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : isError || !data ? (
        <div className="flex items-center gap-3 text-sm text-destructive">
          Não foi possível carregar os dados.
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      ) : data.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum dado disponível</p>
      ) : (
        <div className="space-y-3">
          {data.map((point) => {
            const pct = total > 0 ? Math.round((point.count / total) * 100) : 0
            return (
              <div key={point.level} className="text-sm">
                <div className="mb-1.5 flex justify-between">
                  <span className="font-medium text-foreground">{point.label}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {point.count} <span className="text-xs">({pct}%)</span>
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-brand-400"
                    style={{
                      width: animated ? `${pct}%` : "0%",
                      transition: "width 0.5s ease-out",
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
