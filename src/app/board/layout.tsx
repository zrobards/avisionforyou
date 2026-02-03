import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import BoardShell from "@/components/board/BoardShell"

export default async function BoardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  
  if (!session || ((session.user as any).role !== "BOARD" && (session.user as any).role !== "ADMIN")) {
    redirect("/unauthorized")
  }

  return <BoardShell>{children}</BoardShell>
}
