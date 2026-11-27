import { Users, CreditCard, Dumbbell } from "lucide-react"
import { Header } from "@/components/layout/header"
import { DashboardMetricCard } from "@/components/dashboard/dashboard-metric-card"
import { DashboardChartsSection } from "@/components/dashboard/dashboard-charts-section"
import { DashboardTrainingLevelChart } from "@/components/dashboard/dashboard-training-level-chart"
import { requireAdmin } from "@/lib/auth/require-admin"

async function getDashboardMetrics() {
  const admin = await requireAdmin()

  const now = new Date().toISOString()

  const [usersResult, activeSubs, trainings] = await Promise.all([
    admin
      .from("user")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null),
    admin
      .from("user_subscriptions")
      .select("user_id")
      .eq("is_active", true)
      .or(`expiration_at.is.null,expiration_at.gt.${now}`),
    admin
      .from("api.training")
      .select("user_uuid"),
  ])

  const totalUsers = usersResult.count ?? 0

  // Distinct non-deleted users with active subscription
  const activeSubUserIds = [...new Set((activeSubs.data ?? []).map((s) => s.user_id).filter(Boolean))]
  const { count: activeSubscriptions } = activeSubUserIds.length
    ? await admin
        .from("user")
        .select("*", { count: "exact", head: true })
        .is("deleted_at", null)
        .in("id", activeSubUserIds as string[])
    : { count: 0 }

  // Distinct users with training → subtract from total
  const distinctUsersWithTraining = new Set(
    (trainings.data ?? []).map((t) => t.user_uuid).filter(Boolean)
  ).size
  const usersWithoutTraining = Math.max(0, totalUsers - distinctUsersWithTraining)

  return { totalUsers, activeSubscriptions: activeSubscriptions ?? 0, usersWithoutTraining }
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
              icon={<Users className="h-5 w-5 text-brand-500" />}
              label="Usuários"
              value={totalUsers}
              href="/users"
            />
            <DashboardMetricCard
              icon={<CreditCard className="h-5 w-5 text-brand-500" />}
              label="Assinaturas ativas"
              value={activeSubscriptions}
              href="/users?filter=active-subscription"
            />
            <DashboardMetricCard
              icon={<Dumbbell className="h-5 w-5 text-brand-500" />}
              label="Sem treino"
              value={usersWithoutTraining}
              href="/users?filter=no-training"
            />
          </div>
          <DashboardChartsSection />
          <DashboardTrainingLevelChart />
        </div>
      </main>
    </>
  )
}
