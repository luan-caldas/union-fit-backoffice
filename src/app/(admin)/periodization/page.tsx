import { Header } from "@/components/layout/header"
import { PeriodizationList } from "@/components/periodization/periodization-list"

export default function PeriodizationPage() {
  return (
    <>
      <Header title="Periodização" />
      <main className="flex-1 overflow-y-auto p-6">
        <PeriodizationList />
      </main>
    </>
  )
}
