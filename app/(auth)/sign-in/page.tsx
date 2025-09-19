"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientBrowser } from "@/lib/supabase-browser"

export default function SignInPage() {
  const sb = createClientBrowser()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [practiceName, setPracticeName] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  
  // Check if Supabase is configured
  const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Check if user is already signed in
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await sb.auth.getUser()
        if (user) {
          router.push("/dashboard")
          return
        }
      } catch (err) {
        console.error("Error checking user:", err)
      } finally {
        setChecking(false)
      }
    }
    
    checkUser()
  }, [sb.auth, router])

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = sb.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push("/dashboard")
      }
    })

    return () => subscription.unsubscribe()
  }, [sb.auth, router])

  async function sendMagic() {
    if (!email) return
    if (isSignUp && (!fullName || !practiceName)) {
      setError("Please fill in all fields")
      return
    }
    
    setError(null)
    setLoading(true)
    
    try {
      const { error } = await sb.auth.signInWithOtp({ 
        email, 
        options: { 
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/dashboard")}`,
          data: isSignUp ? {
            full_name: fullName,
            practice_name: practiceName,
            user_type: 'veterinarian'
          } : undefined
        } 
      })
      if (error) setError(error.message)
      else {
        // If signing up, save additional info to profiles table
        if (isSignUp) {
          // We'll handle this in the callback after user confirms email
          console.log('Sign-up initiated with metadata:', { fullName, practiceName })
        }
        setSent(true)
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="max-w-sm mx-auto p-6">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto p-6 pt-20">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">
            {isSignUp ? "Join VetScribe" : "Welcome Back"}
          </h1>
          <p className="text-muted-foreground">
            {isSignUp 
              ? "Start your free trial - no credit card required" 
              : "Sign in to your veterinary practice account"
            }
          </p>
        </div>
        
        {!isSupabaseConfigured ? (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">⚙️ Setup Required</h3>
              <p className="text-sm text-yellow-700 mb-3">
                Supabase configuration is needed for authentication.
              </p>
              <div className="space-y-2 text-xs text-yellow-600">
                <p>1. Create a Supabase project</p>
                <p>2. Add credentials to .env.local</p>
                <p>3. Restart the development server</p>
              </div>
            </div>
            
            <div className="text-center">
              <button 
                onClick={() => router.push('/dashboard')}
                className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                🚀 Continue to Demo Dashboard
              </button>
              <p className="text-xs text-muted-foreground mt-2">
                (Demo mode - no authentication required)
              </p>
            </div>
          </div>
        ) : sent ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <h3 className="font-semibold text-green-800 mb-2">📧 Check Your Email</h3>
              <p className="text-sm text-green-700">We sent a magic link to {email}</p>
            </div>
            <button 
              onClick={() => setSent(false)}
              className="text-sm text-blue-600 hover:underline w-full text-center"
            >
              Send another link
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Toggle between Sign In and Sign Up */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setIsSignUp(false)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  !isSignUp 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsSignUp(true)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  isSignUp 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Sign Up Form */}
            {isSignUp && (
              <>
                <input
                  className="border rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Dr. Sarah Johnson"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  disabled={loading}
                  type="text"
                />
                <input
                  className="border rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Happy Paws Veterinary Clinic"
                  value={practiceName}
                  onChange={e => setPracticeName(e.target.value)}
                  disabled={loading}
                  type="text"
                />
              </>
            )}
            
            {/* Email Field */}
            <input
              className="border rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="you@veterinaryclinic.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
              type="email"
            />
            
            <button 
              className="px-4 py-3 rounded-lg bg-blue-600 text-white w-full disabled:opacity-50 hover:bg-blue-700" 
              onClick={sendMagic}
              disabled={loading || !email || (isSignUp && (!fullName || !practiceName))}
            >
              {loading ? "Sending magic link..." : 
               isSignUp ? "Start Free Trial" : "Send magic link"}
            </button>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            {isSignUp && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-700">
                  ✅ Free trial - no credit card required<br/>
                  ✅ Full access to all features<br/>
                  ✅ Cancel anytime
                </p>
              </div>
            )}
            
            <div className="text-center">
              <button 
                onClick={() => router.push('/dashboard')}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Continue to demo dashboard →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
