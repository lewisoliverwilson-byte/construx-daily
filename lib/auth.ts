import { cookies } from 'next/headers'

const SESSION_COOKIE = 'daily_admin_session'
const SESSION_VALUE = 'authenticated'

export async function getAdminSession(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE)?.value === SESSION_VALUE
}

export function setAdminSession(response: Response): Response {
  response.headers.set(
    'Set-Cookie',
    `${SESSION_COOKIE}=${SESSION_VALUE}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`
  )
  return response
}

export function clearAdminSession(response: Response): Response {
  response.headers.set(
    'Set-Cookie',
    `${SESSION_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`
  )
  return response
}

export function isPipelineAuthorized(req: Request): boolean {
  const secret = req.headers.get('x-pipeline-secret')
  return secret === process.env.PIPELINE_SECRET
}
