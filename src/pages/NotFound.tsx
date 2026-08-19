import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="mx-auto grid max-w-md place-items-center px-4 py-28 text-center">
      <div className="text-6xl">🎮</div>
      <h1 className="mt-6 text-3xl font-bold text-white">404</h1>
      <p className="mt-2 text-slate-400">
        This page wandered off into another arcade.
      </p>
      <Link to="/" className="btn-primary mt-6">
        Back home
      </Link>
    </div>
  )
}
