import { Suspense } from "react"
import { Header } from "@/components/layout/header"
import { UsersTable } from "@/components/users/users-table"
import { Skeleton } from "@/components/ui/skeleton"

export default function UsersPage() {
  return (
    <>
      <Header title="Usuários" />
      <main className="flex-1 overflow-y-auto p-6">
        <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
          <UsersTable />
        </Suspense>
      </main>
    </>
  )
}
