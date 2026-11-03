"use client"

import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import {
  getSessionFeedbackStats,
  getTrainingFeedbackHistory,
  type FeedbackPeriod,
} from "@/actions/feedback.actions"
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

export function useSessionFeedbackStats(userId: string, period: FeedbackPeriod) {
  return useQuery({
    queryKey: ["session-feedback-stats", userId, period],
    queryFn: () => getSessionFeedbackStats(userId, period),
  })
}

export function useTrainingFeedbackHistory(userId: string) {
  return useQuery({
    queryKey: ["training-feedback-history", userId],
    queryFn: () => getTrainingFeedbackHistory(userId),
  })
}
