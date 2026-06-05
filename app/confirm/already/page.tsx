import Link from 'next/link'

export default function ConfirmAlreadyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-amber-500 mb-3">Already confirmed.</h1>
        <p className="text-gray-400 mb-6">Your subscription is active. Issues land every morning at 8am.</p>
        <Link href="/archive" className="text-amber-500 text-sm underline underline-offset-4">
          Browse past issues →
        </Link>
      </div>
    </div>
  )
}
