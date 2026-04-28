"use client"

import { useQuery } from "@tanstack/react-query"
import { getUsers } from "@/actions/users.actions"

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => getUsers(),
  })
}
