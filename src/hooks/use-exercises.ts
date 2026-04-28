"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getExercises, upsertExercise, getLevels, getObjectives } from "@/actions/exercises.actions"
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exercises"] }),
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
