"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientBrowser } from "@/lib/supabase-browser"
import { useToast } from "@/hooks/use-toast"

export default function SignInPage() {
  const sb = createClientBrowser()
  const router = useRouter()
  const { toast } = useToast()
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

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      const { error } = await sb.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) {
        console.error('Google sign-in error:', error)
        toast({
          title: "❌ Google Sign-In Failed",
          description: error.message,
          variant: "destructive",
          duration: 5000,
        })
      }
    } catch (error: any) {
      console.error('Google OAuth error:', error)
      toast({
        title: "❌ Sign-In Error",
        description: "Error with Google sign-in. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }


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

            {/* Social Login Options */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={signInWithGoogle}
                disabled={loading}
                className="flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm font-medium">Continue with Google</span>
              </button>

            </div>
            
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
