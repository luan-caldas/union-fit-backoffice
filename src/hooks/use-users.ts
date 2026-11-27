"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { getUsers, type UsersFilter } from "@/actions/users.actions"

export function useUsers(params: {
  page: number
  pageSize: number
  search: string
  filter?: UsersFilter
}) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => getUsers(params),
    placeholderData: keepPreviousData,
  })
}
