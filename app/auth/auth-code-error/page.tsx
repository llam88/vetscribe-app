export default function AuthCodeError() {
  return (
    <div className="max-w-sm mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Authentication Error</h1>
      <p className="mb-4">
        There was an error authenticating your account. This could be because:
      </p>
      <ul className="list-disc list-inside mb-4 space-y-1">
        <li>The magic link has expired</li>
        <li>The link has already been used</li>
        <li>There was a network error</li>
      </ul>
      <a 
        href="/sign-in" 
        className="inline-block px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
      >
        Try signing in again
      </a>
    </div>
  )
}
