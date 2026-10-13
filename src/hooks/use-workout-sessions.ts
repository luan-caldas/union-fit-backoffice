"use client"

import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import {
  getWorkoutSessionExercises,
  getWorkoutSessions,
  type WorkoutSessionCursor,
} from "@/actions/workout-session.actions"

export function useWorkoutSessions(userId: string) {
  return useInfiniteQuery({
    queryKey: ["workout-sessions", userId],
    queryFn: ({ pageParam }) => getWorkoutSessions(userId, pageParam),
    initialPageParam: null as WorkoutSessionCursor | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
}

export function useWorkoutSessionExercises(sessionUuid: string, enabled: boolean) {
  return useQuery({
    queryKey: ["workout-session-exercises", sessionUuid],
    queryFn: () => getWorkoutSessionExercises(sessionUuid),
    enabled,
  })
}
