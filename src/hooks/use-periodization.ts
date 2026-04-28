"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getPeriodizations,
  upsertPeriodizationDetail,
  deletePeriodizationDetail,
} from "@/actions/periodization.actions"

export function usePeriodizations() {
  return useQuery({
    queryKey: ["periodizations"],
    queryFn: () => getPeriodizations(),
  })
}

export function useUpsertPeriodizationDetail() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: upsertPeriodizationDetail,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["periodizations"] }),
  })
}

export function useDeletePeriodizationDetail() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deletePeriodizationDetail,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["periodizations"] }),
  })
}
