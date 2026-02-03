import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import CommunityShell from "@/components/community/CommunityShell"

export default async function CommunityLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  
  if (!session || ((session.user as any).role !== "ALUMNI" && (session.user as any).role !== "BOARD" && (session.user as any).role !== "ADMIN")) {
    redirect("/unauthorized")
  }

  return <CommunityShell>{children}</CommunityShell>
}
