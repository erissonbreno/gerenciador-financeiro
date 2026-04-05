import { useState, useMemo } from 'react'

const PAGE_SIZE = 10

export function usePagination(items) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE))

  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return items.slice(start, start + PAGE_SIZE)
  }, [items, currentPage])

  const safePage = Math.min(currentPage, totalPages)
  if (safePage !== currentPage) setCurrentPage(safePage)

  return {
    pagedItems,
    currentPage,
    totalPages,
    goTo: setCurrentPage,
    next: () => setCurrentPage((p) => Math.min(p + 1, totalPages)),
    prev: () => setCurrentPage((p) => Math.max(p - 1, 1)),
  }
}
