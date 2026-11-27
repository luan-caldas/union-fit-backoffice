"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"
import {
  getNewTrainingsChart,
  getNewSubscriptionsChart,
  getTrainingLevelDistribution,
  type ChartPeriod,
} from "@/actions/dashboard.actions"

export type { ChartPeriod }

export function useNewTrainingsChart(period: ChartPeriod) {
  return useQuery({
    queryKey: ["dashboard-trainings-chart", period],
    queryFn: () => getNewTrainingsChart(period),
    placeholderData: keepPreviousData,
  })
}

export function useNewSubscriptionsChart(period: ChartPeriod) {
  return useQuery({
    queryKey: ["dashboard-subscriptions-chart", period],
    queryFn: () => getNewSubscriptionsChart(period),
    placeholderData: keepPreviousData,
  })
}

export function useTrainingLevelDistribution() {
  return useQuery({
    queryKey: ["dashboard-training-level"],
    queryFn: getTrainingLevelDistribution,
  })
}
