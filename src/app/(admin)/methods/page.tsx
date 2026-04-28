import { Header } from "@/components/layout/header"
import { MethodsList } from "@/components/methods/methods-list"

export default function MethodsPage() {
  return (
    <>
      <Header title="Métodos" />
      <main className="flex-1 overflow-y-auto p-6">
        <MethodsList />
      </main>
    </>
  )
}
