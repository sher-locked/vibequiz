export { auth as default } from "@/lib/auth"

export const config = {
  // Match all routes except static files and API routes that don't need auth
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
} 