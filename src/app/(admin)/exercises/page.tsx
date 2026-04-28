import { Header } from "@/components/layout/header"
import { ExercisesGrid } from "@/components/exercises/exercises-grid"

export default function ExercisesPage() {
  return (
    <>
      <Header title="Exercícios" />
      <main className="flex-1 overflow-y-auto p-6">
        <ExercisesGrid />
      </main>
    </>
  )
}
