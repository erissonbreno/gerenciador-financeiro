import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/navigation/Sidebar'
import { TopBar } from '../components/navigation/TopBar'

export function MainLayout() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
