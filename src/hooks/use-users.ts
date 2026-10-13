"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { getUsers } from "@/actions/users.actions"

export function useUsers(params: {
  page: number
  pageSize: number
  search: string
}) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => getUsers(params),
    placeholderData: keepPreviousData,
  })
}
