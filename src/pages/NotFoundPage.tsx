import { Link } from 'react-router-dom'
import { Button } from '../components/common/Button'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
      <h1 className="text-6xl font-bold text-primary-300 mb-4">404</h1>
      <p className="text-lg mb-6">Página não encontrada</p>
      <Link to="/patients">
        <Button>Voltar ao início</Button>
      </Link>
    </div>
  )
}
