"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, Send, ArrowLeft, FolderKanban, User, Clock } from "lucide-react";
import { fetchJson } from "@/lib/client-api";
import { motion } from "framer-motion";

interface Message {
  id: string;
  content: string;
  senderId: string;
  role: string;
  createdAt: string;
  senderName?: string;
}

interface MessageThread {
  id: string;
  subject?: string;
  project: {
    id: string;
    name: string;
  } | null;
  messages: Message[];
}

export default function MessagesPage() {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      // For now, we'll need to fetch messages from projects
      // This is a placeholder - you may need to adjust based on your actual API
      const projects = await fetchJson<any>("/api/client/projects");
      const allThreads: MessageThread[] = [];

      // If you have a messages API endpoint, use that instead
      // For now, this is a placeholder structure
      setThreads(allThreads);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedThread || !newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId: selectedThread.id,
          projectId: selectedThread.project?.id,
          content: newMessage.trim(),
        }),
      });

      if (response.ok) {
        setNewMessage("");
        await fetchMessages();
        // Refresh selected thread
        const updatedThread = threads.find((t) => t.id === selectedThread.id);
        if (updatedThread) setSelectedThread(updatedThread);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trinity-red"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Messages</h1>
        <p className="text-white/60 text-sm">Communicate with your team about projects</p>
      </div>

      {threads.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <MessageSquare className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No messages yet</h3>
          <p className="text-white/60 mb-6">
            Messages from your projects will appear here. Start a conversation in any project to see messages.
          </p>
          <Link
            href="/client/projects"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            <FolderKanban className="w-4 h-4" />
            View Projects
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Threads List */}
          <div className="lg:col-span-1 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-800">
              <h2 className="font-semibold text-white">Conversations</h2>
            </div>
            <div className="divide-y divide-gray-800 max-h-[600px] overflow-y-auto">
              {threads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => setSelectedThread(thread)}
                  className={`w-full p-4 text-left hover:bg-gray-800 transition-colors ${
                    selectedThread?.id === thread.id ? "bg-gray-800" : ""
                  }`}
                >
                  {thread.project && (
                    <div className="flex items-center gap-2 mb-1">
                      <FolderKanban className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-xs text-blue-400 font-medium">{thread.project.name}</span>
                    </div>
                  )}
                  {thread.subject && (
                    <p className="font-medium text-white text-sm truncate">{thread.subject}</p>
                  )}
                  {thread.messages.length > 0 && (
                    <p className="text-xs text-white/60 truncate mt-1">
                      {thread.messages[thread.messages.length - 1].content}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Messages View */}
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col">
            {selectedThread ? (
              <>
                <div className="p-4 border-b border-gray-800">
                  {selectedThread.project && (
                    <div className="flex items-center gap-2 mb-1">
                      <FolderKanban className="w-4 h-4 text-blue-400" />
                      <Link
                        href={`/client/projects/${selectedThread.project.id}`}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                      >
                        {selectedThread.project.name}
                      </Link>
                    </div>
                  )}
                  {selectedThread.subject && (
                    <h2 className="font-semibold text-white">{selectedThread.subject}</h2>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[500px]">
                  {selectedThread.messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="w-12 h-12 text-white/20 mx-auto mb-4" />
                      <p className="text-white/60">No messages yet</p>
                    </div>
                  ) : (
                    selectedThread.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.role === "client" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.role === "client"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-800 text-white"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs mt-1 opacity-70 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(message.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-800">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      {sending ? "Sending..." : "Send"}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-12">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60">Select a conversation to view messages</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
