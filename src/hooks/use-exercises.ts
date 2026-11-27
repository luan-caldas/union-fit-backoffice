"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getExercises, upsertExercise, deleteExercise, getLevels, getObjectives } from "@/actions/exercises.actions"
import type { ExerciseRow } from "@/actions/exercises.actions"
import type { Database } from "@/lib/supabase/database.types"

export function useExercises() {
  return useQuery({
    queryKey: ["exercises"],
    queryFn: () => getExercises(),
  })
}

export function useUpsertExercise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: upsertExercise,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["exercises"] })
      toast.success("Exercício salvo")
    },
    onError: () => toast.error("Erro ao salvar exercício"),
  })
}

export function useDeleteExercise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteExercise,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["exercises"] })
      toast.success("Exercício excluído")
    },
    onError: () => toast.error("Erro ao excluir exercício"),
  })
}

export function useLevels() {
  return useQuery({
    queryKey: ["levels"],
    queryFn: () => getLevels(),
    staleTime: Infinity,
  })
}

export function useObjectives() {
  return useQuery({
    queryKey: ["objectives"],
    queryFn: () => getObjectives(),
    staleTime: Infinity,
  })
}
