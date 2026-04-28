import { Sidebar } from "./sidebar"

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-svh overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  )
}
