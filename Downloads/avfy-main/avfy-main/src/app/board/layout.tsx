import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import BoardSidebar from "@/components/board/BoardSidebar"

export default async function BoardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  
  if (!session || ((session.user as any).role !== "BOARD" && (session.user as any).role !== "ADMIN")) {
    redirect("/unauthorized")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <BoardSidebar />
        <main className="flex-1 ml-64 p-8">{children}</main>
      </div>
    </div>
  )
}
