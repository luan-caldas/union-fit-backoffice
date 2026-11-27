import { Users, CreditCard, Dumbbell } from "lucide-react"
import { Header } from "@/components/layout/header"
import { DashboardMetricCard } from "@/components/dashboard/dashboard-metric-card"
import { requireAdmin } from "@/lib/auth/require-admin"

async function getDashboardMetrics() {
  const admin = await requireAdmin()

  const [usersResult, subsResult, trainingResult] = await Promise.all([
    admin
      .from("user")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null),
    admin
      .from("user_subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .or("expiration_at.is.null,expiration_at.gt." + new Date().toISOString()),
    admin
      .from("api.training")
      .select("user_uuid", { count: "exact", head: true }),
  ])

  const totalUsers = usersResult.count ?? 0
  const activeSubscriptions = subsResult.count ?? 0
  const usersWithTraining = trainingResult.count ?? 0
  const usersWithoutTraining = Math.max(0, totalUsers - usersWithTraining)

  return { totalUsers, activeSubscriptions, usersWithoutTraining }
}

export default async function DashboardPage() {
  const { totalUsers, activeSubscriptions, usersWithoutTraining } =
    await getDashboardMetrics()

  return (
    <>
      <Header title="Dashboard" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <DashboardMetricCard
              icon={Users}
              label="Usuários"
              value={totalUsers}
              href="/users"
            />
            <DashboardMetricCard
              icon={CreditCard}
              label="Assinaturas ativas"
              value={activeSubscriptions}
            />
            <DashboardMetricCard
              icon={Dumbbell}
              label="Sem treino"
              value={usersWithoutTraining}
            />
          </div>
        </div>
      </main>
    </>
  )
}
