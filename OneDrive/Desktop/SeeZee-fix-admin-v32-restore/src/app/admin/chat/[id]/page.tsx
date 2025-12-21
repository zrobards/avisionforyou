import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AdminChatTakeover } from "@/components/admin/chat/AdminChatTakeover";

export const metadata = {
  title: "Chat Takeover | SeeZee Admin",
  description: "Take over and respond to a chatbot conversation",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getConversation(id: string) {
  const conversation = await prisma.aIConversation.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!conversation) return null;

  return {
    id: conversation.id,
    sessionId: conversation.sessionId,
    visitorName: conversation.visitorName,
    visitorEmail: conversation.visitorEmail,
    visitorPhone: conversation.visitorPhone,
    status: conversation.status,
    intent: conversation.intent,
    leadQuality: conversation.leadQuality,
    handedOff: conversation.handedOff,
    handedOffTo: conversation.handedOffTo,
    source: conversation.source,
    device: conversation.device,
    browser: conversation.browser,
    createdAt: conversation.createdAt.toISOString(),
    closedAt: conversation.closedAt?.toISOString() || null,
    messages: conversation.messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    })),
  };
}

export default async function ChatTakeoverPage({ params }: PageProps) {
  const { id } = await params;
  const conversation = await getConversation(id);

  if (!conversation) {
    notFound();
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <AdminChatTakeover conversation={conversation} />
    </div>
  );
}

