import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import CommunityShell from "@/components/community/CommunityShell"

export default async function CommunityLayout({ children }: { children: React.ReactNode }) {
  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true'
  const session = await getServerSession(authOptions)

  if (!bypassAuth) {
    if (!session || (session.user.role !== "ALUMNI" && session.user.role !== "BOARD" && session.user.role !== "ADMIN")) {
      redirect("/unauthorized")
    }
  }

  return <CommunityShell>{children}</CommunityShell>
}
