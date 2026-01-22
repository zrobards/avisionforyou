import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import BoardSidebar from "@/components/board/BoardSidebar"
import { BoardSidebarProvider } from "@/components/board/BoardSidebarContext"
import BoardLayoutContent from "@/components/board/BoardLayoutContent"

export default async function BoardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  
  if (!session || ((session.user as any).role !== "BOARD" && (session.user as any).role !== "ADMIN")) {
    redirect("/unauthorized")
  }

  return (
    <BoardSidebarProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <BoardSidebar />
          <BoardLayoutContent>{children}</BoardLayoutContent>
        </div>
      </div>
    </BoardSidebarProvider>
  )
}
