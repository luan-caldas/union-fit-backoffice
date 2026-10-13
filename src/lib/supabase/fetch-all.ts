// O PostgREST limita cada resposta a `max-rows` (1000 por padrão) sem retornar
// erro, truncando silenciosamente. Este helper pagina com .range() até esgotar.
const PAGE_SIZE = 1000

type PageResult<T> = PromiseLike<{
  data: T[] | null
  error: { message: string } | null
}>

export async function fetchAll<T>(
  buildQuery: (from: number, to: number) => PageResult<T>
): Promise<{ data: T[]; error: { message: string } | null }> {
  const rows: T[] = []

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await buildQuery(from, from + PAGE_SIZE - 1)
    if (error) return { data: [], error }

    rows.push(...(data ?? []))
    if (!data || data.length < PAGE_SIZE) break
  }

  return { data: rows, error: null }
}
