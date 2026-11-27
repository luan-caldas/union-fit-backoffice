import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Header } from "@/components/layout/header"
import { UserDetailHeader } from "@/components/users/user-detail-header"
import { UserDetailTabs } from "@/components/users/user-detail-tabs"
import { Button } from "@/components/ui/button"
import { getUserById } from "@/actions/users.actions"
import { getTrainingByUserId } from "@/actions/training.actions"
import { getCardiosByUserId } from "@/actions/cardio.actions"
import { getExercises } from "@/actions/exercises.actions"
import { getMethods } from "@/actions/methods.actions"

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

          <UserDetailTabs
            user={user}
            infoWorkout={infoWorkout}
            subscription={subscription}
            training={training}
            allExercises={allExercises}
            methods={methods}
            cardios={cardios}
            userId={id}
          />
        </div>
      </main>
    </>
  )
}
