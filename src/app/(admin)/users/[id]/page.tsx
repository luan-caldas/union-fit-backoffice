import { notFound } from "next/navigation"
import { Header } from "@/components/layout/header"
import { UserDetailHeader } from "@/components/users/user-detail-header"
import { UserInfoWorkoutCard } from "@/components/users/user-info-workout-card"
import { UserSubscriptionCard } from "@/components/users/user-subscription-card"
import { UserTrainingSection } from "@/components/users/user-training-section"
import { UserTrainingEmpty } from "@/components/users/user-training-empty"
import { getUserById } from "@/actions/users.actions"
import { getTrainingByUserId } from "@/actions/training.actions"
import { getCardiosByUserId } from "@/actions/cardio.actions"
import { getExercises } from "@/actions/exercises.actions"
import { getMethods } from "@/actions/methods.actions"
import { UserCardioSection } from "@/components/users/user-cardio-section"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface Props {
  params: Promise<{ id: string }>
}

export default async function UserDetailPage({ params }: Props) {
  const { id } = await params

  const [{ user, infoWorkout, subscription }, training, allExercises, methods, cardios] =
    await Promise.all([
      getUserById(id),
      getTrainingByUserId(id),
      getExercises(),
      getMethods(),
      getCardiosByUserId(id),
    ])

  if (!user) notFound()

  const infoWorkoutData = infoWorkout?.info_workout_data as Record<string, unknown> | null

  return (
    <>
      <Header title="Detalhes do Usuário" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl space-y-4">
          <Button variant="ghost" size="sm" asChild className="gap-1.5 -ml-2 text-muted-foreground">
            <Link href="/users">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>

          <UserDetailHeader
            user={user}
            trainingStatus={infoWorkoutData?.training_status as string | null}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <UserInfoWorkoutCard infoWorkout={infoWorkout} />
            <UserSubscriptionCard subscription={subscription} />
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3">Treino</h3>
            {training ? (
              <UserTrainingSection
                training={training}
                methods={methods}
                allExercises={allExercises}
                userId={id}
              />
            ) : (
              <UserTrainingEmpty />
            )}
          </div>

          <UserCardioSection
            cardios={cardios}
            allExercises={allExercises}
            userId={id}
          />
        </div>
      </main>
    </>
  )
}
