import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <nav className="border-b border-white/5 px-6 py-3 flex items-center gap-6">
        <Link href="/admin" className="text-amber-500 font-bold text-sm">Daily Admin</Link>
        <Link href="/admin" className="text-gray-400 hover:text-white text-xs transition-colors">Draft</Link>
        <Link href="/admin/sources" className="text-gray-400 hover:text-white text-xs transition-colors">Sources</Link>
        <Link href="/admin/subscribers" className="text-gray-400 hover:text-white text-xs transition-colors">Subscribers</Link>
        <div className="ml-auto">
          <LogoutButton />
        </div>
      </nav>
      {children}
    </div>
  )
}

function LogoutButton() {
  return (
    <form action={async () => {
      'use server'
      const { cookies } = await import('next/headers')
      const cookieStore = await cookies()
      cookieStore.delete('daily_admin_session')
    }}>
      <button type="submit" className="text-gray-500 hover:text-gray-300 text-xs transition-colors">
        Sign out
      </button>
    </form>
  )
}
