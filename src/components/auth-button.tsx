import { auth, signIn, signOut } from "@/lib/auth"
import Image from "next/image"

export default async function AuthButton() {
  const session = await auth()

  if (session?.user) {
    return (
      <div className="flex items-center gap-4">
        {/* User Info */}
        <div className="flex items-center gap-3">
          {session.user.image && (
            <Image
              src={session.user.image}
              alt={session.user.name || "User"}
              width={40}
              height={40}
              className="rounded-full border-2 border-slate-600 shadow-lg"
            />
          )}
          <div className="hidden sm:block text-left">
            <p className="font-medium text-slate-100">
              {session.user.name}
            </p>
            <p className="text-sm text-slate-400">
              {session.user.email}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <form
          action={async () => {
            "use server"
            await signOut({ redirectTo: "/" })
          }}
        >
          <button
            type="submit"
            className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 hover:text-red-300 px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </form>
      </div>
    )
  }

  // Not signed in
  return (
    <form
      action={async () => {
        "use server"
        await signIn("google")
      }}
    >
      <button
        type="submit"
        className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 hover:text-blue-300 px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-3"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
        Sign In with Google
      </button>
    </form>
  )
} 