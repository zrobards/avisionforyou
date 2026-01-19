import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import CommunitySidebar from "@/components/community/CommunitySidebar"

export default async function CommunityLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user as any).role !== "ALUMNI" && (session.user as any).role !== "ADMIN") {
    redirect("/unauthorized")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <CommunitySidebar />
        <main className="flex-1 ml-64 p-8">{children}</main>
      </div>
    </div>
  )
}
