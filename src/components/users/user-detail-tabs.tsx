"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { UserInfoWorkoutCard } from "./user-info-workout-card"
import { UserSubscriptionCard } from "./user-subscription-card"
import { UserAutoEvolutionToggle } from "./user-auto-evolution-toggle"
import { UserTrainingSection } from "./user-training-section"
import { UserTrainingEmpty } from "./user-training-empty"
import { UserCardioSection } from "./user-cardio-section"
import { UserWorkoutHistorySection } from "./user-workout-history-section"
import { UserSessionFeedbackChart } from "./user-session-feedback-chart"
import { UserCycleFeedbackHistory } from "./user-cycle-feedback-history"
import type { Tables } from "@/lib/supabase/database.types"
import type { UserInfoWorkout } from "@/actions/users.actions"
import type { TrainingData } from "@/actions/training.actions"
import type { ExerciseRow } from "@/actions/exercises.actions"
import type { MethodRow } from "@/actions/methods.actions"
import type { Cardio } from "@/actions/cardio.actions"

interface UserDetailTabsProps {
  user: Tables<"user">
  infoWorkout: UserInfoWorkout | null
  subscription: Tables<"user_subscriptions"> | null
  training: TrainingData | null
  allExercises: ExerciseRow[]
  methods: MethodRow[]
  cardios: Cardio[]
  userId: string
}

export function UserDetailTabs({
  user,
  infoWorkout,
  subscription,
  training,
  allExercises,
  methods,
  cardios,
  userId,
}: UserDetailTabsProps) {
  return (
    <Tabs defaultValue="perfil">
      <TabsList variant="line" className="w-full border-b border-border rounded-none px-0 justify-start">
        <TabsTrigger value="perfil">Perfil</TabsTrigger>
        <TabsTrigger value="assinatura">Assinatura</TabsTrigger>
        <TabsTrigger value="treino">Treino</TabsTrigger>
        <TabsTrigger value="historico">Histórico</TabsTrigger>
        <TabsTrigger value="feedback">Feedback</TabsTrigger>
      </TabsList>

      <TabsContent value="perfil" className="pt-4">
        <UserInfoWorkoutCard infoWorkout={infoWorkout} />
      </TabsContent>

      <TabsContent value="assinatura" className="pt-4">
        <UserSubscriptionCard subscription={subscription} />
      </TabsContent>

      <TabsContent value="treino" className="pt-4 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-semibold text-foreground">Treino</h3>
          <UserAutoEvolutionToggle
            userId={userId}
            enabled={user.auto_evolution_enabled}
          />
        </div>
        {training ? (
          <UserTrainingSection
            training={training}
            methods={methods}
            allExercises={allExercises}
            userId={userId}
          />
        ) : (
          <UserTrainingEmpty />
        )}
        <UserCardioSection
          cardios={cardios}
          allExercises={allExercises}
          userId={userId}
        />
      </TabsContent>

      <TabsContent value="historico" className="pt-4">
        <UserWorkoutHistorySection userId={userId} />
      </TabsContent>

      <TabsContent value="feedback" className="pt-4 space-y-4">
        <UserSessionFeedbackChart userId={userId} />
        <UserCycleFeedbackHistory userId={userId} />
      </TabsContent>
    </Tabs>
  )
}
