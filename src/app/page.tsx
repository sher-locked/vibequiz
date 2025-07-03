import { auth } from "@/lib/auth"
import AuthButton from "@/components/auth-button"
import GameDashboard from "@/components/game-dashboard"

export default async function Home() {
  const session = await auth()
  
  // Console log for "aha moment" - students can see this in browser dev tools
  if (session?.user) {
    console.log("🎉 Authentication Success! User data:", {
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      id: session.user.id
    })
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header with Auth */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                VibeQuiz
              </h1>
            </div>
            <AuthButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {session?.user ? (
          <AuthenticatedView user={session.user} />
        ) : (
          <UnauthenticatedView />
        )}
      </main>
    </div>
  )
}

function AuthenticatedView({ user }: { user: { name?: string | null; email?: string | null; id?: string } }) {
  const firstName = user.name?.split(' ')[0] || 'there'
  
  return (
    <GameDashboard firstName={firstName} />
  )
}



function UnauthenticatedView() {
  return (
    <div className="text-center space-y-6">
      <div className="text-center">
        <p className="text-lg text-slate-300 max-w-2xl mx-auto">
          Create engaging quizzes and share them with friends. Connect with Google to get started!
        </p>
      </div>
      
      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:bg-slate-700/50 transition-colors">
          <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h3 className="font-semibold text-slate-100 mb-1">Create Quizzes</h3>
          <p className="text-slate-400 text-sm">
            Build engaging multiple-choice questions
          </p>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:bg-slate-700/50 transition-colors">
          <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-500/30 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M12 5v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-slate-100 mb-1">Play & Share</h3>
          <p className="text-slate-400 text-sm">
            Answer questions and see instant results
          </p>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:bg-slate-700/50 transition-colors">
          <div className="w-10 h-10 bg-purple-500/20 border border-purple-500/30 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="font-semibold text-slate-100 mb-1">Track Results</h3>
          <p className="text-slate-400 text-sm">
            See who got questions right or wrong
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6 max-w-md mx-auto">
        <h3 className="text-lg font-semibold text-slate-100 mb-3">
          Ready to start?
        </h3>
        <p className="text-slate-300 mb-4 text-sm">
          Sign in with Google to begin creating and sharing quizzes
        </p>
        <AuthButton />
      </div>
    </div>
  )
}
