import Link from 'next/link'

export default function ConfirmSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-6 text-2xl">
          ✓
        </div>
        <h1 className="text-2xl font-bold text-amber-500 mb-3">You&apos;re confirmed.</h1>
        <p className="text-gray-400 mb-6">
          Welcome to Construx Daily. Your first issue lands tomorrow morning at 8am.
        </p>
        <Link href="/archive" className="text-amber-500 hover:text-amber-400 text-sm underline underline-offset-4">
          Browse past issues while you wait →
        </Link>
      </div>
    </div>
  )
}
