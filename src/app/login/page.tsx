import { signIn, auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function LoginPage() {
  const session = await auth()
  
  // Redirect if already logged in
  if (session?.user) {
    redirect('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
                         <h1 className="text-4xl font-bold text-slate-100">
               VibeQuiz
             </h1>
          </div>
          <p className="text-lg text-slate-300 mb-8">
            Create and share quizzes with friends
          </p>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4">
              Sign in to get started
            </h2>
            <p className="text-slate-400 mb-6">
              Connect with Google to start creating quizzes
            </p>
          </div>
          
          <form
            action={async () => {
              "use server"
              await signIn("google", { redirectTo: "/" })
            }}
            className="space-y-4"
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-blue-500/20 border-2 border-blue-500/50 rounded-xl px-6 py-4 text-blue-400 font-medium hover:bg-blue-500/30 hover:border-blue-400/70 hover:text-blue-300 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Continue with Google
            </button>
          </form>
          
          <div className="text-center text-sm text-slate-500 flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            By signing in, you agree to create awesome quizzes!
          </div>
        </div>
      </div>
    </div>
  )
} 