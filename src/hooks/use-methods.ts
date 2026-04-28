"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getMethods, upsertMethod } from "@/actions/methods.actions"

export function useMethods() {
  return useQuery({
    queryKey: ["methods"],
    queryFn: () => getMethods(),
  })
}

export function useUpsertMethod() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: upsertMethod,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["methods"] }),
  })
}
