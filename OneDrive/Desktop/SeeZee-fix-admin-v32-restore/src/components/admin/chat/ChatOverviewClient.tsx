"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Clock,
  CheckCircle,
  User,
  Mail,
  Phone,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: string;
  sessionId: string;
  visitorName: string | null;
  visitorEmail: string | null;
  visitorPhone: string | null;
  status: string;
  intent: string | null;
  leadQuality: string | null;
  handedOff: boolean;
  handedOffTo: string | null;
  messageCount: number;
  lastMessage: string | null;
  lastMessageAt: Date | string;
  createdAt: Date | string;
}

interface Stats {
  total: number;
  active: number;
  waitingForHuman: number;
  resolved: number;
  withLeadInfo: number;
}

interface ChatOverviewClientProps {
  conversations: Conversation[];
  stats: Stats;
}

const statusStyles: Record<string, { color: string; icon: React.ComponentType<any> }> = {
  ACTIVE: { color: "text-green-400 bg-green-500/20", icon: MessageCircle },
  WAITING_FOR_HUMAN: { color: "text-yellow-400 bg-yellow-500/20", icon: AlertCircle },
  WITH_HUMAN: { color: "text-blue-400 bg-blue-500/20", icon: User },
  RESOLVED: { color: "text-gray-400 bg-gray-500/20", icon: CheckCircle },
  ABANDONED: { color: "text-red-400 bg-red-500/20", icon: Clock },
};

export function ChatOverviewClient({ conversations, stats }: ChatOverviewClientProps) {
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredConversations =
    statusFilter === "all"
      ? conversations
      : conversations.filter((c) => c.status === statusFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-trinity-red">
          AI Assistant
        </span>
        <h1 className="text-4xl font-heading font-bold gradient-text">
          Chat Conversations
        </h1>
      </header>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <div className="rounded-xl border-2 border-gray-700 bg-[#151b2e] p-4 text-center">
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-xs text-gray-400">Total Chats</p>
        </div>
        <div className="rounded-xl border-2 border-gray-700 bg-[#151b2e] p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{stats.active}</p>
          <p className="text-xs text-gray-400">Active</p>
        </div>
        <div className="rounded-xl border-2 border-gray-700 bg-[#151b2e] p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">{stats.waitingForHuman}</p>
          <p className="text-xs text-gray-400">Need Attention</p>
        </div>
        <div className="rounded-xl border-2 border-gray-700 bg-[#151b2e] p-4 text-center">
          <p className="text-2xl font-bold text-gray-400">{stats.resolved}</p>
          <p className="text-xs text-gray-400">Resolved</p>
        </div>
        <div className="rounded-xl border-2 border-gray-700 bg-[#151b2e] p-4 text-center">
          <p className="text-2xl font-bold text-cyan-400">{stats.withLeadInfo}</p>
          <p className="text-xs text-gray-400">With Contact Info</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        {["all", "ACTIVE", "WAITING_FOR_HUMAN", "WITH_HUMAN", "RESOLVED"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              statusFilter === status
                ? "bg-trinity-red text-white"
                : "bg-[#1a2235] text-gray-400 hover:text-white hover:bg-[#1e2840]"
            }`}
          >
            {status === "all" ? "All" : status.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {/* Conversations List */}
      <div className="space-y-3">
        {filteredConversations.map((conversation, index) => {
          const statusConfig = statusStyles[conversation.status] || statusStyles.ACTIVE;
          const StatusIcon = statusConfig.icon;
          const lastMessageAt = new Date(conversation.lastMessageAt);

          return (
            <motion.div
              key={conversation.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
            >
              <Link
                href={`/admin/chat/${conversation.id}`}
                className="block rounded-xl border-2 border-gray-700 bg-[#151b2e] p-5 hover:border-trinity-red/30 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-lg ${statusConfig.color}`}>
                      <StatusIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">
                          {conversation.visitorName ||
                            conversation.visitorEmail ||
                            `Visitor ${conversation.sessionId.slice(-6)}`}
                        </h3>
                        {conversation.intent && (
                          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 text-xs">
                            {conversation.intent}
                          </span>
                        )}
                      </div>

                      {conversation.lastMessage && (
                        <p className="text-sm text-gray-400 mt-1 line-clamp-1 max-w-md">
                          {conversation.lastMessage}
                        </p>
                      )}

                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {conversation.messageCount} messages
                        </span>
                        <span>
                          {formatDistanceToNow(lastMessageAt, { addSuffix: true })}
                        </span>
                        {conversation.visitorEmail && (
                          <span className="flex items-center gap-1 text-cyan-400">
                            <Mail className="w-3 h-3" />
                            {conversation.visitorEmail}
                          </span>
                        )}
                        {conversation.visitorPhone && (
                          <span className="flex items-center gap-1 text-cyan-400">
                            <Phone className="w-3 h-3" />
                            {conversation.visitorPhone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <ArrowRight className="w-5 h-5 text-gray-600" />
                </div>
              </Link>
            </motion.div>
          );
        })}

        {filteredConversations.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-gray-700 bg-[#151b2e] p-12 text-center">
            <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No conversations found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatOverviewClient;


