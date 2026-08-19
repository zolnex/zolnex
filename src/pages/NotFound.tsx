import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="mx-auto grid max-w-lg place-items-center px-4 py-28 text-center">
      <p className="kicker">Out of order</p>
      <h1 className="display mt-4 text-6xl">404</h1>
      <p className="mt-3 text-mute">
        This cabinet is unplugged — or it never made it onto the floor.
      </p>
      <Link to="/" className="btn-primary mt-8">
        Back to the floor
      </Link>
    </div>
  )
}
