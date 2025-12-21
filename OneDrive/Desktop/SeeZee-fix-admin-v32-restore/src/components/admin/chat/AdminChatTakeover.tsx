"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Send,
  ArrowLeft,
  User,
  Bot,
  Mail,
  Phone,
  Globe,
  Monitor,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface Message {
  id: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  createdAt: string;
}

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
  source: string | null;
  device: string | null;
  browser: string | null;
  createdAt: string;
  closedAt: string | null;
  messages: Message[];
}

interface AdminChatTakeoverProps {
  conversation: Conversation;
}

export function AdminChatTakeover({ conversation }: AdminChatTakeoverProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(conversation.messages);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState(conversation.status);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for new messages
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/chat/${conversation.id}/messages`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages);
          setStatus(data.status);
        }
      } catch (error) {
        console.error("Failed to poll messages:", error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [conversation.id]);

  const sendMessage = async () => {
    if (!input.trim() || isSending) return;

    const messageContent = input.trim();
    setInput("");
    setIsSending(true);

    // Optimistically add message
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      role: "ASSISTANT",
      content: messageContent,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      const res = await fetch(`/api/chat/${conversation.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageContent,
          fromHuman: true,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Replace temp message with real one
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempMessage.id ? { ...m, id: data.messageId } : m
          )
        );
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      // Remove temp message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
    } finally {
      setIsSending(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/chat/${conversation.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setStatus(newStatus);
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const statusColor: Record<string, string> = {
    ACTIVE: "bg-green-500/20 text-green-400 border-green-500/50",
    WAITING_FOR_HUMAN: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    WITH_HUMAN: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    RESOLVED: "bg-gray-500/20 text-gray-400 border-gray-500/50",
    ABANDONED: "bg-red-500/20 text-red-400 border-red-500/50",
  };

  return (
    <div className="flex h-full">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-[#151b2e] border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin/chat")}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#1a2235]"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-white">
                {conversation.visitorName ||
                  conversation.visitorEmail ||
                  `Visitor ${conversation.sessionId.slice(-6)}`}
              </h1>
              <p className="text-xs text-gray-400">
                Started{" "}
                {formatDistanceToNow(new Date(conversation.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-lg border text-sm ${
                statusColor[status] || statusColor.ACTIVE
              }`}
            >
              {status.replace(/_/g, " ")}
            </span>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#0a0e1a]">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              className={`flex ${
                message.role === "USER" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-xl p-4 ${
                  message.role === "USER"
                    ? "bg-[#151b2e] border border-gray-700 text-gray-300"
                    : message.role === "SYSTEM"
                    ? "bg-yellow-500/20 border border-yellow-500/50 text-yellow-300"
                    : "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {message.role === "USER" ? (
                    <User className="w-4 h-4" />
                  ) : message.role === "SYSTEM" ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                  <span className="text-xs opacity-70">
                    {message.role === "USER"
                      ? "Visitor"
                      : message.role === "SYSTEM"
                      ? "System"
                      : "SeeZee"}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs opacity-50 mt-2 block">
                  {format(new Date(message.createdAt), "p")}
                </span>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-[#151b2e] border-t border-gray-800 p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your response..."
              className="flex-1 bg-[#1a2235] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isSending}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-all flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="w-80 bg-[#151b2e] border-l border-gray-800 p-6 overflow-y-auto">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Visitor Info
        </h2>

        <div className="space-y-4">
          {conversation.visitorName && (
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-white">{conversation.visitorName}</span>
            </div>
          )}
          {conversation.visitorEmail && (
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-400" />
              <a
                href={`mailto:${conversation.visitorEmail}`}
                className="text-cyan-400 hover:underline"
              >
                {conversation.visitorEmail}
              </a>
            </div>
          )}
          {conversation.visitorPhone && (
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-400" />
              <a
                href={`tel:${conversation.visitorPhone}`}
                className="text-cyan-400 hover:underline"
              >
                {conversation.visitorPhone}
              </a>
            </div>
          )}
          {conversation.source && (
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300 text-sm truncate">
                {conversation.source}
              </span>
            </div>
          )}
          {conversation.device && (
            <div className="flex items-center gap-3">
              <Monitor className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300 text-sm">
                {conversation.device}
              </span>
            </div>
          )}
        </div>

        {conversation.intent && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Intent
            </h3>
            <span className="px-3 py-1 rounded bg-purple-500/20 text-purple-400 text-sm">
              {conversation.intent}
            </span>
          </div>
        )}

        {conversation.leadQuality && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Lead Quality
            </h3>
            <span
              className={`px-3 py-1 rounded text-sm ${
                conversation.leadQuality === "hot"
                  ? "bg-red-500/20 text-red-400"
                  : conversation.leadQuality === "warm"
                  ? "bg-orange-500/20 text-orange-400"
                  : "bg-blue-500/20 text-blue-400"
              }`}
            >
              {conversation.leadQuality.toUpperCase()}
            </span>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-800">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Actions
          </h3>
          <div className="space-y-2">
            {status !== "RESOLVED" && (
              <button
                onClick={() => updateStatus("RESOLVED")}
                className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Mark Resolved
              </button>
            )}
            {status === "WAITING_FOR_HUMAN" && (
              <button
                onClick={() => updateStatus("WITH_HUMAN")}
                className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
              >
                <User className="w-4 h-4" />
                Take Over Chat
              </button>
            )}
            {status !== "ABANDONED" && status !== "RESOLVED" && (
              <button
                onClick={() => updateStatus("ABANDONED")}
                className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Mark Abandoned
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-800">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Timeline
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Clock className="w-4 h-4" />
              Started:{" "}
              {format(new Date(conversation.createdAt), "MMM d, h:mm a")}
            </div>
            {conversation.closedAt && (
              <div className="flex items-center gap-2 text-gray-400">
                <CheckCircle className="w-4 h-4" />
                Closed:{" "}
                {format(new Date(conversation.closedAt), "MMM d, h:mm a")}
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-400">
              <MessageIcon className="w-4 h-4" />
              {messages.length} messages
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
      />
    </svg>
  );
}

export default AdminChatTakeover;


