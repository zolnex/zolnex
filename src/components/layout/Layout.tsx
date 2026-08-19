import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { DemoBanner } from '../DemoBanner'

export function Layout() {
  return (
    <div className="relative flex min-h-screen flex-col bg-ink">
      <Header />
      <DemoBanner />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
