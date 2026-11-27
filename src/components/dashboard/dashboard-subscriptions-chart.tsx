"use client"

import { AnalyticsLineChart } from "@/components/ui/analytics-chart"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useNewSubscriptionsChart } from "@/hooks/use-dashboard-charts"
import type { ChartPeriod } from "@/hooks/use-dashboard-charts"

export function DashboardSubscriptionsChart({ period }: { period: ChartPeriod }) {
  const { data, isLoading, isError, refetch } = useNewSubscriptionsChart(period)

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <h3 className="font-semibold text-foreground mb-4">Novas assinaturas</h3>
      {isLoading ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : isError || !data ? (
        <div className="flex items-center gap-3 text-sm text-destructive">
          Não foi possível carregar os dados.
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      ) : (
        <AnalyticsLineChart data={data} valueLabel="assinaturas" height={200} />
      )}
    </div>
  )
}
