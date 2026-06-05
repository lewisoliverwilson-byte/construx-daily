import Link from 'next/link'

export default function UnsubscribeSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold mb-3">Unsubscribed.</h1>
        <p className="text-gray-400 mb-6">
          You&apos;ve been removed from the list. You won&apos;t receive any more emails from Construx Daily.
        </p>
        <Link href="/" className="text-gray-500 text-sm underline underline-offset-4">
          Changed your mind? Subscribe again →
        </Link>
      </div>
    </div>
  )
}
