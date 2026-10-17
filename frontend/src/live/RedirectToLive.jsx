import { Navigate, useLocation } from 'react-router-dom'

/** Old /judges bookmarks: keep ?request= when sending them to /live. */
export default function RedirectToLive() {
  const { search } = useLocation()
  return <Navigate to={{ pathname: '/live', search }} replace />
}
