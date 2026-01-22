import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import CommunitySidebar from "@/components/community/CommunitySidebar"
import { CommunitySidebarProvider } from "@/components/community/CommunitySidebarContext"
import CommunityLayoutContent from "@/components/community/CommunityLayoutContent"

export default async function CommunityLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user as any).role !== "ALUMNI" && (session.user as any).role !== "ADMIN") {
    redirect("/unauthorized")
  }

  return (
    <CommunitySidebarProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <CommunitySidebar />
          <CommunityLayoutContent>{children}</CommunityLayoutContent>
        </div>
      </div>
    </CommunitySidebarProvider>
  )
}
