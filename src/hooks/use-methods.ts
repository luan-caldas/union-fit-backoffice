"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getMethods, upsertMethod, deleteMethod } from "@/actions/methods.actions"

export function useMethods() {
  return useQuery({
    queryKey: ["methods"],
    queryFn: () => getMethods(),
  })
}

export function useDeleteMethod() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteMethod,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["methods"] }),
  })
}

export function useUpsertMethod() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: upsertMethod,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["methods"] }),
  })
}
