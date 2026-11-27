"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["periodizations"] })
      toast.success("Semana salva")
    },
    onError: () => toast.error("Erro ao salvar semana"),
  })
}

export function useDeletePeriodizationDetail() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deletePeriodizationDetail,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["periodizations"] })
      toast.success("Semana removida")
    },
    onError: () => toast.error("Erro ao remover semana"),
  })
}
