import { Header } from "@/components/layout/header"
import { UsersTable } from "@/components/users/users-table"

export default function UsersPage() {
  return (
    <>
      <Header title="Usuários" />
      <main className="flex-1 overflow-y-auto p-6">
        <UsersTable />
      </main>
    </>
  )
}
