"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DashboardTrainingsChart } from "./dashboard-trainings-chart"
import { DashboardSubscriptionsChart } from "./dashboard-subscriptions-chart"
import type { ChartPeriod } from "@/hooks/use-dashboard-charts"

const PERIODS: { value: ChartPeriod; label: string }[] = [
  { value: "4w",  label: "4 sem." },
  { value: "12w", label: "12 sem." },
  { value: "6m",  label: "6 meses" },
]

export function DashboardChartsSection() {
  const [period, setPeriod] = useState<ChartPeriod>("12w")

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-1">
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DashboardTrainingsChart period={period} />
        <DashboardSubscriptionsChart period={period} />
      </div>
    </div>
  )
}
