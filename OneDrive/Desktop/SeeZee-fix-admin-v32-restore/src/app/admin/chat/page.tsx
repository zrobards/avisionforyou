import { prisma } from "@/lib/prisma";
import { ChatOverviewClient } from "@/components/admin/chat/ChatOverviewClient";

export const metadata = {
  title: "Chat Conversations | SeeZee Admin",
  description: "View and manage AI chatbot conversations",
};

async function getChatData() {
  // Get all conversations with message count
  const conversations = await prisma.aIConversation.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: {
        select: { messages: true },
      },
    },
  });

  // Calculate stats
  const total = conversations.length;
  const active = conversations.filter((c) => c.status === "ACTIVE").length;
  const waitingForHuman = conversations.filter(
    (c) => c.status === "WAITING_FOR_HUMAN"
  ).length;
  const resolved = conversations.filter((c) => c.status === "RESOLVED").length;
  const withLeadInfo = conversations.filter(
    (c) => c.visitorEmail || c.visitorPhone
  ).length;

  // Transform for client
  const formattedConversations = conversations.map((c) => ({
    id: c.id,
    sessionId: c.sessionId,
    visitorName: c.visitorName,
    visitorEmail: c.visitorEmail,
    visitorPhone: c.visitorPhone,
    status: c.status,
    intent: c.intent,
    leadQuality: c.leadQuality,
    handedOff: c.handedOff,
    handedOffTo: c.handedOffTo,
    messageCount: c._count.messages,
    lastMessage: c.messages[0]?.content || null,
    lastMessageAt: c.updatedAt.toISOString(),
    createdAt: c.createdAt.toISOString(),
  }));

  return {
    conversations: formattedConversations,
    stats: { total, active, waitingForHuman, resolved, withLeadInfo },
  };
}

export default async function ChatOverviewPage() {
  const { conversations, stats } = await getChatData();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <ChatOverviewClient conversations={conversations} stats={stats} />
    </div>
  );
}
