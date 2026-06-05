import Link from 'next/link'

export default function ConfirmInvalidPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold mb-3">Link expired or invalid</h1>
        <p className="text-gray-400 mb-6">This confirmation link is no longer valid. Subscribe again to get a fresh link.</p>
        <Link href="/" className="bg-amber-500 text-[#0a0a0a] font-bold px-6 py-3 rounded-lg text-sm">
          Subscribe
        </Link>
      </div>
    </div>
  )
}
