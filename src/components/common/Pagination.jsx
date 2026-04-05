import { Button } from './Button'

export function Pagination({ currentPage, totalPages, onPrev, onNext }) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-4 mt-4">
      <Button variant="secondary" onClick={onPrev} disabled={currentPage <= 1}>
        Anterior
      </Button>
      <span className="text-sm text-gray-600">
        {currentPage} / {totalPages}
      </span>
      <Button variant="secondary" onClick={onNext} disabled={currentPage >= totalPages}>
        Próximo
      </Button>
    </div>
  )
}
